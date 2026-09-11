import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  FormGroup,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Divider,
  Paper,
} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import SyncIcon from '@mui/icons-material/Sync';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ClearIcon from '@mui/icons-material/Clear';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useParams, useNavigate } from 'react-router-dom';
import { attemptService } from '../../services/attempt.service.js';
import {
  AssessmentAttemptDto,
  SanitizedPaperQuestionDto,
  SaveAnswerDto,
} from '../../types/attempt.types.js';
import { MonacoCodingWorkspace } from '../../components/coding/MonacoCodingWorkspace.js';

type SyncStatus = 'SAVED' | 'SYNCING' | 'OFFLINE';

export const StudentAttemptPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<AssessmentAttemptDto | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersMap, setAnswersMap] = useState<Map<string, SaveAnswerDto>>(new Map());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('SAVED');
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAutoSubmittingRef = useRef(false);

  // 1. Load Attempt
  useEffect(() => {
    if (!attemptId) return;

    let mounted = true;
    const fetchAttempt = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await attemptService.getAttempt(attemptId);
        if (!mounted) return;

        setAttempt(data);

        // If already submitted/expired, redirect to results
        if (data.status !== 'IN_PROGRESS') {
          navigate('/student/results');
          return;
        }

        // Restore initial answers map
        const initialMap = new Map<string, SaveAnswerDto>();
        (data.answers || []).forEach((ans) => {
          initialMap.set(ans.questionId, {
            questionId: ans.questionId,
            selectedOptionIds: ans.selectedOptionIds || [],
            textAnswer: ans.textAnswer || '',
            isMarkedForReview: ans.isMarkedForReview,
            version: ans.version,
          });
        });
        setAnswersMap(initialMap);

        // Restore current question index if available
        if (data.currentQuestion && data.questions && data.questions.length >= data.currentQuestion) {
          setCurrentIndex(data.currentQuestion - 1);
        }

        // Calculate initial remaining time from authoritative expectedEndTime
        const remaining = Math.max(
          0,
          Math.floor((new Date(data.expectedEndTime).getTime() - Date.now()) / 1000)
        );
        setTimeLeftSeconds(remaining);
      } catch (err: unknown) {
        if (!mounted) return;
        const msg =
          err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
            : 'Failed to load attempt';
        setError(msg || 'Failed to load attempt');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAttempt();

    return () => {
      mounted = false;
    };
  }, [attemptId, navigate]);

  // 2. Authoritative Timer Countdown & Auto-Submit
  useEffect(() => {
    if (timeLeftSeconds === null) return;

    const timerInterval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timerInterval);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [timeLeftSeconds]);

  const handleTimeExpired = useCallback(async () => {
    if (isAutoSubmittingRef.current || !attemptId) return;
    isAutoSubmittingRef.current = true;
    setSyncStatus('SYNCING');
    try {
      const res = await attemptService.submitAttempt(attemptId);
      navigate(`/student/results/${res.id}`);
    } catch {
      navigate('/student/results');
    }
  }, [attemptId, navigate]);

  // 3. Online/Offline Network Listener
  useEffect(() => {
    const handleOnline = async () => {
      if (!attemptId) return;
      setSyncStatus('SYNCING');
      try {
        await attemptService.flushPendingOfflineAnswers(attemptId);
        setSyncStatus('SAVED');
      } catch {
        setSyncStatus('OFFLINE');
      }
    };

    const handleOffline = () => {
      setSyncStatus('OFFLINE');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [attemptId]);

  // 4. Current Question & Options
  const questions = attempt?.questions || [];
  const currentQuestion: SanitizedPaperQuestionDto | undefined = questions[currentIndex];
  const currentAnswer = currentQuestion ? answersMap.get(currentQuestion.questionId) : undefined;

  // 5. Answer Update & Debounced Auto-Save
  const updateAnswer = (partial: Partial<SaveAnswerDto>) => {
    if (!currentQuestion || !attemptId) return;

    const existing = answersMap.get(currentQuestion.questionId) || {
      questionId: currentQuestion.questionId,
      selectedOptionIds: [],
      textAnswer: '',
      isMarkedForReview: false,
    };

    const updated: SaveAnswerDto = {
      ...existing,
      ...partial,
      currentQuestion: currentIndex + 1,
    };

    const newMap = new Map(answersMap);
    newMap.set(currentQuestion.questionId, updated);
    setAnswersMap(newMap);

    // Auto-save with debouncing
    setSyncStatus('SYNCING');
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        await attemptService.saveAnswer(attemptId, updated);
        setSyncStatus('SAVED');
      } catch {
        setSyncStatus('OFFLINE');
      }
    }, 400);
  };

  const handleOptionSelect = (optionId: string) => {
    if (!currentQuestion) return;
    if (currentQuestion.questionType === 'SINGLE_CHOICE' || currentQuestion.questionType === 'TRUE_FALSE') {
      updateAnswer({ selectedOptionIds: [optionId] });
    } else if (currentQuestion.questionType === 'MULTIPLE_CHOICE') {
      const selected = currentAnswer?.selectedOptionIds || [];
      const newSelected = selected.includes(optionId)
        ? selected.filter((id) => id !== optionId)
        : [...selected, optionId];
      updateAnswer({ selectedOptionIds: newSelected });
    }
  };

  const handleClearSelection = () => {
    updateAnswer({ selectedOptionIds: [], textAnswer: '' });
  };

  const handleToggleReview = () => {
    const isMarked = !(currentAnswer?.isMarkedForReview);
    updateAnswer({ isMarkedForReview: isMarked });
  };

  // 6. Navigation
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  };

  // 7. Submission
  const handleConfirmSubmit = async () => {
    if (!attemptId) return;
    setIsSubmitting(true);
    try {
      const result = await attemptService.submitAttempt(attemptId);
      navigate(`/student/results/${result.id}`);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to submit test';
      setError(msg || 'Failed to submit test');
      setIsSubmitting(false);
      setSubmitDialogOpen(false);
    }
  };

  // 8. Stats for Palette & Submit Modal
  const answeredCount = questions.filter((q) => {
    const ans = answersMap.get(q.questionId);
    return (
      (ans?.selectedOptionIds && ans.selectedOptionIds.length > 0) ||
      (ans?.textAnswer && ans.textAnswer.trim().length > 0)
    );
  }).length;

  const reviewCount = questions.filter((q) => {
    const ans = answersMap.get(q.questionId);
    return ans?.isMarkedForReview;
  }).length;

  const unansweredCount = questions.length - answeredCount;

  // Format Timer String
  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !attempt) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/student/tests')}>
          Return to My Tests
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#0B0F19' }}>
      {/* 1. Distraction-Free Header Bar */}
      <Paper
        square
        elevation={2}
        sx={{
          py: 1.5,
          px: { xs: 2, md: 4 },
          bgcolor: '#111827',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 1100,
        }}
      >
        {/* Assessment Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" fontWeight={800} color="text.primary">
            {attempt?.assessment?.name || 'Examination'}
          </Typography>
          <Chip
            size="small"
            label={`Section: ${currentQuestion?.category || 'General'}`}
            variant="outlined"
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          />
        </Box>

        {/* Sync Status & Timer & Submit */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 3 } }}>
          {/* Sync Status Indicator */}
          <Chip
            size="small"
            icon={
              syncStatus === 'SAVED' ? (
                <CloudDoneIcon sx={{ color: 'success.main !important' }} />
              ) : syncStatus === 'SYNCING' ? (
                <SyncIcon sx={{ color: 'info.main !important', animation: 'spin 1s linear infinite' }} />
              ) : (
                <CloudOffIcon sx={{ color: 'warning.main !important' }} />
              )
            }
            label={syncStatus}
            variant="outlined"
            color={syncStatus === 'SAVED' ? 'success' : syncStatus === 'SYNCING' ? 'info' : 'warning'}
            sx={{ fontWeight: 700 }}
          />

          {/* Countdown Timer */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.5,
              borderRadius: 2,
              bgcolor:
                (timeLeftSeconds || 0) < 60
                  ? 'rgba(239, 68, 68, 0.2)'
                  : (timeLeftSeconds || 0) < 300
                  ? 'rgba(245, 158, 11, 0.2)'
                  : 'rgba(255, 255, 255, 0.05)',
              border:
                (timeLeftSeconds || 0) < 60
                  ? '1px solid #EF4444'
                  : (timeLeftSeconds || 0) < 300
                  ? '1px solid #F59E0B'
                  : '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <TimerIcon
              sx={{
                color:
                  (timeLeftSeconds || 0) < 60
                    ? '#EF4444'
                    : (timeLeftSeconds || 0) < 300
                    ? '#F59E0B'
                    : 'primary.light',
              }}
            />
            <Typography
              variant="subtitle1"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 800,
                color:
                  (timeLeftSeconds || 0) < 60
                    ? '#EF4444'
                    : (timeLeftSeconds || 0) < 300
                    ? '#F59E0B'
                    : 'text.primary',
              }}
            >
              {formatTime(timeLeftSeconds)}
            </Typography>
          </Box>

          {/* Submit Test Button */}
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => setSubmitDialogOpen(true)}
            sx={{ fontWeight: 700, px: 2 }}
          >
            Submit Test
          </Button>
        </Box>
      </Paper>

      {/* 2. Main Examination Canvas */}
      <Box sx={{ flexGrow: 1, display: 'flex', p: { xs: 2, md: 3 }, gap: 3, overflow: 'hidden' }}>
        {/* Left / Center: Active Question Area */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {currentQuestion && currentQuestion.category === 'CODING' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
              <MonacoCodingWorkspace
                attemptId={attemptId!}
                questionId={currentQuestion.questionId || currentQuestion.id}
                onAnswerSaved={() => {
                  updateAnswer({
                    textAnswer: 'CODING_SUBMITTED',
                    isMarkedForReview: currentAnswer?.isMarkedForReview || false,
                  });
                }}
              />
              <Box
                sx={{
                  mt: 1.5,
                  p: 1.5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  bgcolor: '#111827',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 2,
                }}
              >
                <Button
                  variant="outlined"
                  color={currentAnswer?.isMarkedForReview ? 'secondary' : 'inherit'}
                  startIcon={currentAnswer?.isMarkedForReview ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  onClick={handleToggleReview}
                  size="small"
                >
                  {currentAnswer?.isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}
                </Button>

                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button
                    variant="outlined"
                    startIcon={<NavigateBeforeIcon />}
                    disabled={currentIndex === 0}
                    onClick={() => goToQuestion(currentIndex - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="contained"
                    endIcon={<NavigateNextIcon />}
                    disabled={currentIndex === questions.length - 1}
                    onClick={() => goToQuestion(currentIndex + 1)}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            </Box>
          ) : currentQuestion ? (
            <Card
              sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#111827',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {/* Question Header */}
              <Box
                sx={{
                  p: 2.5,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1.5,
                }}
              >
                <Typography variant="h6" fontWeight={800}>
                  Question {currentIndex + 1} of {questions.length}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    size="small"
                    label={`${currentQuestion.marks} Mark${currentQuestion.marks > 1 ? 's' : ''}`}
                    color="primary"
                    variant="outlined"
                  />
                  {attempt?.assessment?.negativeMarking && currentQuestion.negativeMarks > 0 && (
                    <Chip
                      size="small"
                      label={`-${currentQuestion.negativeMarks} Neg`}
                      color="warning"
                      variant="outlined"
                    />
                  )}
                  <Chip size="small" label={currentQuestion.difficulty} variant="filled" />
                </Box>
              </Box>

              {/* Question Content & Options */}
              <CardContent sx={{ flexGrow: 1, p: { xs: 2.5, md: 4 }, overflowY: 'auto' }}>
                <Typography variant="body1" sx={{ fontSize: '1.15rem', fontWeight: 500, lineHeight: 1.6, mb: 4 }}>
                  {currentQuestion.questionText}
                </Typography>

                {/* Single Choice / True False: Radio Group */}
                {(currentQuestion.questionType === 'SINGLE_CHOICE' ||
                  currentQuestion.questionType === 'TRUE_FALSE') && (
                  <RadioGroup
                    value={currentAnswer?.selectedOptionIds?.[0] || ''}
                    onChange={(e) => handleOptionSelect(e.target.value)}
                  >
                    {currentQuestion.options.map((opt) => {
                      const isSelected = currentAnswer?.selectedOptionIds?.[0] === opt.id;
                      return (
                        <Paper
                          key={opt.id}
                          variant="outlined"
                          onClick={() => handleOptionSelect(opt.id)}
                          sx={{
                            mb: 1.5,
                            p: 1.5,
                            px: 2,
                            borderRadius: 2,
                            cursor: 'pointer',
                            bgcolor: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                            borderColor: isSelected ? 'primary.main' : 'rgba(255, 255, 255, 0.08)',
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              bgcolor: isSelected
                                ? 'rgba(59, 130, 246, 0.16)'
                                : 'rgba(255, 255, 255, 0.04)',
                            },
                          }}
                        >
                          <FormControlLabel
                            value={opt.id}
                            control={<Radio color="primary" />}
                            label={
                              <Typography variant="body1" sx={{ fontSize: '1.05rem', ml: 1 }}>
                                {opt.optionText}
                              </Typography>
                            }
                            sx={{ width: '100%', m: 0 }}
                          />
                        </Paper>
                      );
                    })}
                  </RadioGroup>
                )}

                {/* Multiple Choice: Checkbox Group */}
                {currentQuestion.questionType === 'MULTIPLE_CHOICE' && (
                  <FormGroup>
                    {currentQuestion.options.map((opt) => {
                      const isSelected = currentAnswer?.selectedOptionIds?.includes(opt.id);
                      return (
                        <Paper
                          key={opt.id}
                          variant="outlined"
                          onClick={() => handleOptionSelect(opt.id)}
                          sx={{
                            mb: 1.5,
                            p: 1.5,
                            px: 2,
                            borderRadius: 2,
                            cursor: 'pointer',
                            bgcolor: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                            borderColor: isSelected ? 'primary.main' : 'rgba(255, 255, 255, 0.08)',
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.04)' },
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={Boolean(isSelected)}
                                onChange={() => handleOptionSelect(opt.id)}
                                color="primary"
                              />
                            }
                            label={
                              <Typography variant="body1" sx={{ fontSize: '1.05rem', ml: 1 }}>
                                {opt.optionText}
                              </Typography>
                            }
                            sx={{ width: '100%', m: 0 }}
                          />
                        </Paper>
                      );
                    })}
                  </FormGroup>
                )}

                {/* Fill in Blank / Descriptive */}
                {(currentQuestion.questionType === 'FILL_BLANK' ||
                  currentQuestion.questionType === 'DESCRIPTIVE') && (
                  <TextField
                    fullWidth
                    multiline={currentQuestion.questionType === 'DESCRIPTIVE'}
                    rows={currentQuestion.questionType === 'DESCRIPTIVE' ? 4 : 1}
                    placeholder="Type your answer here..."
                    value={currentAnswer?.textAnswer || ''}
                    onChange={(e) => updateAnswer({ textAnswer: e.target.value })}
                    variant="outlined"
                    sx={{ mt: 2 }}
                  />
                )}
              </CardContent>

              {/* Bottom Action Controls */}
              <Box
                sx={{
                  p: 2,
                  px: 3,
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    color={currentAnswer?.isMarkedForReview ? 'secondary' : 'inherit'}
                    startIcon={
                      currentAnswer?.isMarkedForReview ? <BookmarkIcon /> : <BookmarkBorderIcon />
                    }
                    onClick={handleToggleReview}
                    size="small"
                  >
                    {currentAnswer?.isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}
                  </Button>

                  <Button
                    variant="text"
                    color="inherit"
                    startIcon={<ClearIcon />}
                    onClick={handleClearSelection}
                    size="small"
                    disabled={!currentAnswer?.selectedOptionIds?.length && !currentAnswer?.textAnswer}
                  >
                    Clear
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button
                    variant="outlined"
                    startIcon={<NavigateBeforeIcon />}
                    disabled={currentIndex === 0}
                    onClick={() => goToQuestion(currentIndex - 1)}
                  >
                    Previous
                  </Button>

                  <Button
                    variant="contained"
                    endIcon={<NavigateNextIcon />}
                    disabled={currentIndex === questions.length - 1}
                    onClick={() => goToQuestion(currentIndex + 1)}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            </Card>
          ) : null}
        </Box>

        {/* Right: Question Navigation Palette */}
        <Card
          sx={{
            width: { xs: 260, md: 320 },
            display: { xs: 'none', lg: 'flex' },
            flexDirection: 'column',
            bgcolor: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Typography variant="subtitle2" fontWeight={800} letterSpacing={0.5}>
              Question Palette
            </Typography>
          </Box>

          <CardContent sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
            {/* Palette Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1, mb: 3 }}>
              {questions.map((q, idx) => {
                const ans = answersMap.get(q.questionId);
                const isAnswered =
                  (ans?.selectedOptionIds && ans.selectedOptionIds.length > 0) ||
                  (ans?.textAnswer && ans.textAnswer.trim().length > 0);
                const isMarked = ans?.isMarkedForReview;
                const isCurrent = idx === currentIndex;

                let btnBg = 'rgba(255, 255, 255, 0.05)';
                let btnColor = 'text.primary';

                if (isAnswered && isMarked) {
                  btnBg = '#D97706'; // Amber: Answered & Marked
                  btnColor = '#FFF';
                } else if (isMarked) {
                  btnBg = '#8B5CF6'; // Purple: Marked for Review
                  btnColor = '#FFF';
                } else if (isAnswered) {
                  btnBg = '#10B981'; // Green: Answered
                  btnColor = '#FFF';
                }

                return (
                  <Button
                    key={q.id}
                    variant="contained"
                    onClick={() => goToQuestion(idx)}
                    sx={{
                      minWidth: 0,
                      p: 1,
                      height: 40,
                      fontWeight: 800,
                      bgcolor: btnBg,
                      color: btnColor,
                      border: isCurrent ? '2px solid #3B82F6' : '1px solid transparent',
                      '&:hover': {
                        bgcolor: btnBg,
                        filter: 'brightness(1.15)',
                      },
                    }}
                  >
                    {idx + 1}
                  </Button>
                );
              })}
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Legend & Stats */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#10B981' }} />
                  <Typography variant="caption">Answered</Typography>
                </Box>
                <Typography variant="caption" fontWeight={700}>
                  {answeredCount}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#8B5CF6' }} />
                  <Typography variant="caption">Marked for Review</Typography>
                </Box>
                <Typography variant="caption" fontWeight={700}>
                  {reviewCount}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
                  <Typography variant="caption">Unanswered</Typography>
                </Box>
                <Typography variant="caption" fontWeight={700}>
                  {unansweredCount}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* 3. Submit Confirmation Modal */}
      <Dialog
        open={submitDialogOpen}
        onClose={() => !isSubmitting && setSubmitDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="warning" /> Confirm Test Submission
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to submit your assessment? You will not be able to modify your answers once submitted.
          </DialogContentText>

          {/* Submission Summary Table */}
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Total Questions:
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {questions.length}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="success.main">
                Answered:
              </Typography>
              <Typography variant="body2" fontWeight={700} color="success.main">
                {answeredCount}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="warning.main">
                Unanswered:
              </Typography>
              <Typography variant="body2" fontWeight={700} color="warning.main">
                {unansweredCount}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="secondary.main">
                Marked for Review:
              </Typography>
              <Typography variant="body2" fontWeight={700} color="secondary.main">
                {reviewCount}
              </Typography>
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button disabled={isSubmitting} onClick={() => setSubmitDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={isSubmitting}
            onClick={handleConfirmSubmit}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : <CheckCircleOutlineIcon />}
          >
            {isSubmitting ? 'Submitting...' : 'Yes, Submit Test'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
