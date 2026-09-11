import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Grid,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PublishIcon from '@mui/icons-material/Publish';
import UnpublishedIcon from '@mui/icons-material/Cancel';
import ScheduleIcon from '@mui/icons-material/Schedule';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import QuizIcon from '@mui/icons-material/Quiz';
import { AdminNavTabs } from '../../components/management/AdminNavTabs.js';
import { assessmentService } from '../../services/assessment.service.js';
import {
  AssessmentDto,
  AssessmentPaperDto,
  AssessmentAssignmentDto,
  QuestionShortageErrorPayload,
  COMPONENT_LABELS,
} from '../../types/assessment.types.js';

export const AssessmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState<AssessmentDto | null>(null);
  const [papers, setPapers] = useState<AssessmentPaperDto[]>([]);
  const [assignments, setAssignments] = useState<AssessmentAssignmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Shortage payload state
  const [shortageError, setShortageError] = useState<QuestionShortageErrorPayload | null>(null);

  // Active Main Tab (0: Overview & Sections, 1: Generated Papers, 2: Student Assignments)
  const [mainTab, setMainTab] = useState(0);
  // Active Paper Sub-Tab (Index in papers array)
  const [activePaperIdx, setActivePaperIdx] = useState(0);

  // Action Loading States
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Schedule Dialog
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  const [scheduling, setScheduling] = useState(false);

  // Assignment Dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [studentIdsInput, setStudentIdsInput] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Load Data
  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const asmt = await assessmentService.getAssessmentById(id);
      setAssessment(asmt);

      if (asmt.startDate) {
        setStartDateInput(new Date(asmt.startDate).toISOString().slice(0, 16));
      }
      if (asmt.endDate) {
        setEndDateInput(new Date(asmt.endDate).toISOString().slice(0, 16));
      }

      // Load papers
      const paperList = await assessmentService.getAssessmentPapers(id);
      setPapers(paperList);

      // Load assignments
      const asgnList = await assessmentService.getAssessmentAssignments(id);
      setAssignments(asgnList);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load assessment details';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Generate Papers
  const handleGeneratePapers = async () => {
    if (!id) return;
    try {
      setGenerating(true);
      setShortageError(null);
      setError(null);
      setSuccessMessage(null);

      const result = await assessmentService.generatePapers(id);
      setSuccessMessage(
        `Successfully generated ${result.numberOfPapers} examination set(s) with ${result.totalQuestionsAllocated} total allocated questions!`
      );
      await loadData();
      setMainTab(1); // Switch to Generated Papers tab
    } catch (err: unknown) {
      const resp = (err as { response?: { data?: { error?: { details?: QuestionShortageErrorPayload }; message?: string } } })?.response?.data;
      if (resp?.error?.details?.error === 'INSUFFICIENT_QUESTIONS') {
        setShortageError(resp.error.details);
      } else {
        setError(resp?.message || 'Failed to generate assessment papers');
      }
    } finally {
      setGenerating(false);
    }
  };

  // Publish Assessment
  const handlePublish = async () => {
    if (!id) return;
    try {
      setPublishing(true);
      setError(null);
      await assessmentService.publishAssessment(id);
      setSuccessMessage('Assessment published successfully! It is now accessible to assigned candidates.');
      await loadData();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to publish assessment';
      setError(msg);
    } finally {
      setPublishing(false);
    }
  };

  // Unpublish Assessment
  const handleUnpublish = async () => {
    if (!id) return;
    try {
      setPublishing(true);
      setError(null);
      await assessmentService.unpublishAssessment(id);
      setSuccessMessage('Assessment unpublished and reverted to DRAFT.');
      await loadData();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to unpublish assessment';
      setError(msg);
    } finally {
      setPublishing(false);
    }
  };

  // Schedule Assessment
  const handleScheduleSubmit = async () => {
    if (!id || !startDateInput || !endDateInput) return;
    try {
      setScheduling(true);
      await assessmentService.scheduleAssessment(id, {
        startDate: startDateInput,
        endDate: endDateInput,
      });
      setScheduleOpen(false);
      setSuccessMessage('Assessment schedule saved successfully.');
      await loadData();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update schedule';
      setError(msg);
    } finally {
      setScheduling(false);
    }
  };

  // Assign Students
  const handleAssignSubmit = async () => {
    if (!id) return;
    try {
      setAssigning(true);
      const studentIds = studentIdsInput
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const result = await assessmentService.assignStudents(id, {
        studentIds: studentIds.length > 0 ? studentIds : undefined,
      });

      setAssignOpen(false);
      setStudentIdsInput('');
      setSuccessMessage(`Successfully assigned ${result.assignedCount} candidate(s) to assessment papers.`);
      await loadData();
      setMainTab(2); // Switch to assignments tab
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to assign students';
      setError(msg);
    } finally {
      setAssigning(false);
    }
  };

  if (loading && !assessment) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!assessment) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Assessment not found</Alert>
      </Box>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'success';
      case 'SCHEDULED':
        return 'info';
      case 'DRAFT':
        return 'warning';
      case 'ARCHIVED':
        return 'default';
      default:
        return 'default';
    }
  };

  const selectedPaper = papers[activePaperIdx];

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <AdminNavTabs />

      {/* Back and Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/admin/assessments')} sx={{ color: 'text.secondary' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {assessment.name}
            </Typography>
            <Chip
              label={assessment.status}
              size="small"
              color={getStatusColor(assessment.status) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
              sx={{ fontWeight: 700 }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {assessment.description || 'No description provided.'}
          </Typography>
        </Box>

        {/* Action Toolbar */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={generating ? <CircularProgress size={16} /> : <PlayArrowIcon />}
            onClick={handleGeneratePapers}
            disabled={generating || assessment.status === 'PUBLISHED'}
            sx={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              fontWeight: 600,
            }}
          >
            {papers.length > 0 ? 'Regenerate Papers' : 'Generate Papers'}
          </Button>

          {assessment.status === 'PUBLISHED' ? (
            <Button
              variant="outlined"
              color="warning"
              startIcon={publishing ? <CircularProgress size={16} /> : <UnpublishedIcon />}
              onClick={handleUnpublish}
              disabled={publishing}
            >
              Unpublish
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              startIcon={publishing ? <CircularProgress size={16} /> : <PublishIcon />}
              onClick={handlePublish}
              disabled={publishing || papers.length === 0}
              sx={{
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                fontWeight: 600,
              }}
            >
              Publish
            </Button>
          )}

          <Button
            variant="outlined"
            startIcon={<ScheduleIcon />}
            onClick={() => setScheduleOpen(true)}
          >
            Schedule
          </Button>

          <Button
            variant="outlined"
            startIcon={<GroupAddIcon />}
            onClick={() => setAssignOpen(true)}
            disabled={papers.length === 0}
          >
            Assign Candidates
          </Button>
        </Box>
      </Box>

      {/* Notifications */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* INSUFFICIENT QUESTIONS SHORTAGE ALERT (CRITICAL PHASE 5 SPEC) */}
      {shortageError && (
        <Paper
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            border: '1px solid rgba(239, 68, 68, 0.4)',
            background: 'rgba(239, 68, 68, 0.08)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <ErrorOutlineIcon sx={{ color: 'error.main', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#fca5a5' }}>
              Paper Generation Failed — Insufficient Eligible Questions
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ color: '#f8fafc', mb: 2 }}>
            The Question Selection Engine strictly enforces that all required questions exist in the Question Bank before generation.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 3,
              p: 2,
              borderRadius: 1.5,
              background: 'rgba(0, 0, 0, 0.25)',
              mb: 2.5,
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Required Questions</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc' }}>{shortageError.required}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Available Questions</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#38bdf8' }}>{shortageError.available}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Missing Deficit</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#f87171' }}>{shortageError.missing}</Typography>
            </Box>
          </Box>

          <TableContainer component={Paper} sx={{ background: 'rgba(15, 23, 42, 0.6)' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Section</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Component</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Difficulty</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Configured Topics</TableCell>
                  <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>Required</TableCell>
                  <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>Available</TableCell>
                  <TableCell align="right" sx={{ color: 'error.main', fontWeight: 700 }}>Missing</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shortageError.shortages.map((s, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ fontWeight: 600 }}>{s.sectionName}</TableCell>
                    <TableCell>{COMPONENT_LABELS[s.component]}</TableCell>
                    <TableCell>{s.difficulty}</TableCell>
                    <TableCell>{s.topics.join(', ')}</TableCell>
                    <TableCell align="right">{s.required}</TableCell>
                    <TableCell align="right">{s.available}</TableCell>
                    <TableCell align="right" sx={{ color: 'error.light', fontWeight: 700 }}>{s.missing}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Metrics Row */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={4} md={2}>
          <Paper sx={{ p: 2, borderRadius: 2, background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Duration</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{assessment.duration}m</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Paper sx={{ p: 2, borderRadius: 2, background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Questions / Paper</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{assessment.totalQuestions}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Paper sx={{ p: 2, borderRadius: 2, background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Total Marks</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{assessment.totalMarks}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Paper sx={{ p: 2, borderRadius: 2, background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Passing Threshold</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{assessment.passingPercentage}%</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Paper sx={{ p: 2, borderRadius: 2, background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Paper Sets</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#38bdf8' }}>{assessment.numberOfPapers}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Paper sx={{ p: 2, borderRadius: 2, background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Assigned Candidates</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#22c55e' }}>{assignments.length}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Tab Navigation */}
      <Paper
        sx={{
          mb: 3,
          borderRadius: 2,
          background: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
        }}
      >
        <Tabs
          value={mainTab}
          onChange={(_, val) => setMainTab(val)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="1. Configured Sections" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab
            label={`2. Generated Examination Sets (${papers.length})`}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            label={`3. Candidate Allocations (${assignments.length})`}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>
      </Paper>

      {/* TAB 1: CONFIGURED SECTIONS */}
      {mainTab === 0 && (
        <Grid container spacing={3}>
          {(assessment.sections || []).map((sec, idx) => (
            <Grid item xs={12} md={6} key={sec.id}>
              <Card
                sx={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#38bdf8' }}>
                      {idx + 1}. {sec.name}
                    </Typography>
                    <Chip label={COMPONENT_LABELS[sec.component]} size="small" color="primary" />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Target Questions: <strong>{sec.questionsCount}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Marks: <strong>{sec.marksPerQuestion} ea.</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Difficulty: <strong>{sec.difficulty || 'Mixed'}</strong>
                    </Typography>
                  </Box>

                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>
                    Configured Topics:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                    {sec.topics.map((t) => (
                      <Chip key={t} label={t} size="small" variant="outlined" sx={{ fontSize: '0.74rem' }} />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* TAB 2: GENERATED EXAMINATION PAPERS */}
      {mainTab === 1 && (
        <Box>
          {papers.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center', background: 'rgba(30, 41, 59, 0.5)', borderRadius: 2 }}>
              <QuizIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                No Examination Papers Generated Yet
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Click the "Generate Papers" button above to run the selection engine and allocate unique questions across sets.
              </Typography>
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={handleGeneratePapers}
                disabled={generating}
              >
                Run Selection Engine
              </Button>
            </Paper>
          ) : (
            <Box>
              {/* Paper Sub-Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs
                  value={activePaperIdx}
                  onChange={(_, val) => setActivePaperIdx(val)}
                  textColor="primary"
                  indicatorColor="primary"
                >
                  {papers.map((p) => (
                    <Tab
                      key={p.id}
                      label={`${p.paperCode} (${p.questions?.length || 0} Questions)`}
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                    />
                  ))}
                </Tabs>
              </Box>

              {/* Questions List for Active Paper */}
              {selectedPaper && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {(selectedPaper.questions || []).map((q) => (
                    <Paper
                      key={q.id}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        background: 'rgba(30, 41, 59, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip label={`Q${q.questionOrder}`} size="small" color="primary" sx={{ fontWeight: 700 }} />
                          <Chip label={q.topic} size="small" variant="outlined" sx={{ color: '#38bdf8' }} />
                          <Chip label={q.difficulty} size="small" variant="outlined" />
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          +{q.marks} / -{q.negativeMarks} Marks
                        </Typography>
                      </Box>

                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#f8fafc', mb: 2 }}>
                        {q.questionText}
                      </Typography>

                      {/* Randomized Options Preview */}
                      {q.randomizedOptions && q.randomizedOptions.length > 0 && (
                        <Grid container spacing={1.5}>
                          {q.randomizedOptions.map((opt) => (
                            <Grid item xs={12} sm={6} key={opt.id}>
                              <Box
                                sx={{
                                  p: 1.5,
                                  borderRadius: 1.5,
                                  backgroundColor: opt.isCorrect
                                    ? 'rgba(34, 197, 94, 0.12)'
                                    : 'rgba(15, 23, 42, 0.5)',
                                  border: opt.isCorrect
                                    ? '1px solid rgba(34, 197, 94, 0.4)'
                                    : '1px solid rgba(255, 255, 255, 0.06)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                }}
                              >
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                  {opt.optionOrder}.
                                </Typography>
                                <Typography variant="body2" sx={{ flexGrow: 1, color: '#e2e8f0' }}>
                                  {opt.optionText}
                                </Typography>
                                {opt.isCorrect && (
                                  <Chip label="Correct" size="small" color="success" sx={{ height: 20, fontSize: '0.65rem' }} />
                                )}
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* TAB 3: CANDIDATE ALLOCATIONS */}
      {mainTab === 2 && (
        <Paper
          sx={{
            borderRadius: 2,
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            overflow: 'hidden',
          }}
        >
          {assignments.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                No students assigned to this assessment yet.
              </Typography>
              <Button variant="outlined" startIcon={<GroupAddIcon />} onClick={() => setAssignOpen(true)}>
                Assign Students Now
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Candidate Name</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Register Number</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>College Email</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Allocated Set</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Assigned At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignments.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell sx={{ fontWeight: 600, color: '#f1f5f9' }}>
                        {a.student?.name || a.studentId || 'Anonymous Candidate'}
                      </TableCell>
                      <TableCell>{a.student?.registerNumber || '—'}</TableCell>
                      <TableCell>{a.student?.collegeEmail || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={a.paper?.paperCode || 'SET-A'}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={a.status} size="small" color="info" />
                      </TableCell>
                      <TableCell>{new Date(a.assignedAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* SCHEDULE MODAL */}
      <Dialog open={scheduleOpen} onClose={() => setScheduleOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Schedule Assessment Window</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Start Date & Time"
              InputLabelProps={{ shrink: true }}
              value={startDateInput}
              onChange={(e) => setStartDateInput(e.target.value)}
              required
            />
            <TextField
              fullWidth
              type="datetime-local"
              label="End Date & Time"
              InputLabelProps={{ shrink: true }}
              value={endDateInput}
              onChange={(e) => setEndDateInput(e.target.value)}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setScheduleOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleScheduleSubmit}
            disabled={scheduling || !startDateInput || !endDateInput}
          >
            {scheduling ? 'Saving...' : 'Save Schedule'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* STUDENT ASSIGNMENT MODAL */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Assign Candidates to Assessment</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Optionally paste specific Student IDs (one per line) or leave blank to automatically allocate all active students across departments.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={5}
            placeholder="Paste Student IDs (e.g. std-sample-001)..."
            value={studentIdsInput}
            onChange={(e) => setStudentIdsInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAssignSubmit}
            disabled={assigning}
          >
            {assigning ? 'Assigning Candidates...' : 'Assign Candidates'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
