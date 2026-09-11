import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  MenuItem,
  Chip,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TuneIcon from '@mui/icons-material/Tune';
import { AdminNavTabs } from '../../components/management/AdminNavTabs.js';
import { assessmentService } from '../../services/assessment.service.js';
import {
  AssessmentComponent,
  CreateAssessmentDto,
  CreateAssessmentSectionDto,
  COMPONENT_LABELS,
  COMPONENT_TOPICS_MAP,
} from '../../types/assessment.types.js';
import { QuestionDifficulty, QuestionType } from '../../types/question.types.js';

const AVAILABLE_COMPONENTS: AssessmentComponent[] = [
  'APTITUDE',
  'LOGICAL_REASONING',
  'VERBAL_ABILITY',
  'TECHNICAL_MCQ',
  'CODING',
  'COMMUNICATION',
  'PSYCHOMETRIC',
];

const STEPS = [
  'General Parameters',
  'Sections & Topic Configuration',
  'Review & Schedule',
];

export const AssessmentBuilderPage: React.FC = () => {
  const navigate = useNavigate();

  // Active Wizard Step (0: Details, 1: Sections, 2: Review)
  const [activeStep, setActiveStep] = useState(0);

  // Form State - Step 1: Details
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<number>(60);
  const [maximumAttempts, setMaximumAttempts] = useState<number>(1);
  const [passingPercentage, setPassingPercentage] = useState<number>(50);
  const [numberOfPapers, setNumberOfPapers] = useState<number>(1);
  const [negativeMarking, setNegativeMarking] = useState<boolean>(false);
  const [randomQuestions, setRandomQuestions] = useState<boolean>(true);
  const [randomOptions, setRandomOptions] = useState<boolean>(true);

  // Form State - Step 2: Sections
  const [sections, setSections] = useState<CreateAssessmentSectionDto[]>([
    {
      component: 'APTITUDE',
      name: 'Quantitative Aptitude Section',
      topics: ['Percentage', 'Profit & Loss', 'Ratio & Proportion'],
      difficulty: 'MEDIUM',
      questionType: 'SINGLE_CHOICE',
      questionsCount: 10,
      marksPerQuestion: 1.0,
      negativeMarks: 0.25,
      sectionOrder: 1,
    },
  ]);

  // Form State - Step 3: Schedule
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper to add section
  const handleAddSection = (component: AssessmentComponent) => {
    const defaultTopics = [...COMPONENT_TOPICS_MAP[component]].slice(0, 3);
    const newSection: CreateAssessmentSectionDto = {
      component,
      name: `${COMPONENT_LABELS[component]} Section`,
      topics: defaultTopics as string[],
      difficulty: null,
      questionType: 'SINGLE_CHOICE',
      questionsCount: 5,
      marksPerQuestion: 1.0,
      negativeMarks: negativeMarking ? 0.25 : 0.0,
      sectionOrder: sections.length + 1,
    };
    setSections([...sections, newSection]);
  };

  const handleRemoveSection = (index: number) => {
    if (sections.length <= 1) {
      setErrorMessage('Assessment must retain at least one configured section');
      return;
    }
    const updated = sections.filter((_, i) => i !== index).map((s, idx) => ({
      ...s,
      sectionOrder: idx + 1,
    }));
    setSections(updated);
  };

  const handleUpdateSection = (index: number, patch: Partial<CreateAssessmentSectionDto>) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], ...patch };
    setSections(updated);
  };

  const handleToggleTopic = (sectionIndex: number, topic: string) => {
    const sec = sections[sectionIndex];
    let newTopics: string[];
    if (sec.topics.includes(topic)) {
      newTopics = sec.topics.filter((t) => t !== topic);
    } else {
      newTopics = [...sec.topics, topic];
    }
    handleUpdateSection(sectionIndex, { topics: newTopics });
  };

  const handleSelectAllTopics = (sectionIndex: number) => {
    const sec = sections[sectionIndex];
    const allTopics = [...COMPONENT_TOPICS_MAP[sec.component]];
    handleUpdateSection(sectionIndex, { topics: allTopics as string[] });
  };

  const handleClearTopics = (sectionIndex: number) => {
    handleUpdateSection(sectionIndex, { topics: [] });
  };

  // Calculations
  const questionsPerPaper = sections.reduce((acc, s) => acc + (s.questionsCount || 0), 0);
  const marksPerPaper = sections.reduce(
    (acc, s) => acc + (s.questionsCount || 0) * (s.marksPerQuestion || 1.0),
    0
  );
  const totalUniqueQuestionsNeeded = numberOfPapers * questionsPerPaper;

  // Validation
  const validateStep = (step: number): boolean => {
    setErrorMessage(null);
    if (step === 0) {
      if (!name.trim()) {
        setErrorMessage('Assessment name is required');
        return false;
      }
      if (duration <= 0) {
        setErrorMessage('Duration must be greater than 0 minutes');
        return false;
      }
      if (maximumAttempts < 1) {
        setErrorMessage('Maximum attempts must be at least 1');
        return false;
      }
      if (numberOfPapers < 1 || numberOfPapers > 20) {
        setErrorMessage('Number of papers must be between 1 and 20');
        return false;
      }
      return true;
    }

    if (step === 1) {
      if (sections.length === 0) {
        setErrorMessage('At least one section must be added');
        return false;
      }
      for (let i = 0; i < sections.length; i++) {
        const s = sections[i];
        if (!s.name.trim()) {
          setErrorMessage(`Section #${i + 1} name cannot be empty`);
          return false;
        }
        if (s.topics.length === 0) {
          setErrorMessage(`Section #${i + 1} (${s.name}) requires at least one topic selected`);
          return false;
        }
        if (s.questionsCount < 1) {
          setErrorMessage(`Section #${i + 1} questions count must be at least 1`);
          return false;
        }
      }
      return true;
    }

    if (step === 2) {
      if (startDate && endDate) {
        const s = new Date(startDate);
        const e = new Date(endDate);
        if (e.getTime() <= s.getTime()) {
          setErrorMessage('End date must be strictly after start date');
          return false;
        }
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    setActiveStep((prev) => prev - 1);
  };

  // Submit Handler
  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    try {
      setSubmitting(true);
      setErrorMessage(null);

      const payload: CreateAssessmentDto = {
        name: name.trim(),
        description: description.trim() || null,
        duration,
        maximumAttempts,
        negativeMarking,
        randomQuestions,
        randomOptions,
        passingPercentage,
        numberOfPapers,
        startDate: startDate || null,
        endDate: endDate || null,
        sections,
      };

      const created = await assessmentService.createAssessment(payload);
      navigate(`/admin/assessments/${created.id}`);
    } catch (err: unknown) {
      const responseData = (err as { response?: { data?: { message?: string; error?: { details?: Record<string, string> } } } })?.response?.data;
      if (responseData?.error?.details) {
        const detailMsgs = Object.values(responseData.error.details).join(', ');
        setErrorMessage(`Validation error: ${detailMsgs}`);
      } else {
        setErrorMessage(responseData?.message || 'Failed to create assessment. Please verify your parameters.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <AdminNavTabs />

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/admin/assessments')} sx={{ color: 'text.secondary' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
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
            Assessment Builder & Selection Engine
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Configure examination rules, topics, difficulty distribution, and multi-set generation parameters.
          </Typography>
        </Box>
      </Box>

      {/* Error Alert */}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {/* Stepper Header */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          background: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
        }}
      >
        <Stepper activeStep={activeStep}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* STEP 1: GENERAL PARAMETERS */}
      {activeStep === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: 3.5,
                borderRadius: 2,
                background: 'rgba(30, 41, 59, 0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#f8fafc' }}>
                Examination Identification & Timing
              </Typography>

              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Assessment Name"
                    placeholder="e.g. Campus Placement Drive 2026 - Phase 1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description & Instructions"
                    placeholder="Provide assessment instructions for candidates..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Total Duration (Minutes)"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    inputProps={{ min: 1 }}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Maximum Attempts"
                    value={maximumAttempts}
                    onChange={(e) => setMaximumAttempts(Number(e.target.value))}
                    inputProps={{ min: 1 }}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Passing Score (%)"
                    value={passingPercentage}
                    onChange={(e) => setPassingPercentage(Number(e.target.value))}
                    inputProps={{ min: 0, max: 100 }}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Number of Paper Sets (e.g. Set A, Set B)"
                    value={numberOfPapers}
                    onChange={(e) => setNumberOfPapers(Number(e.target.value))}
                    inputProps={{ min: 1, max: 10 }}
                    helperText="Enforces unique questions across all generated sets"
                    required
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3.5, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#f8fafc' }}>
                Evaluation & Randomization Controls
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={negativeMarking}
                        onChange={(e) => setNegativeMarking(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Negative Marking"
                  />
                  <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
                    Deduct marks for incorrect MCQ submissions
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={randomQuestions}
                        onChange={(e) => setRandomQuestions(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Randomize Questions"
                  />
                  <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
                    Shuffle candidate question presentation
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={randomOptions}
                        onChange={(e) => setRandomOptions(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Randomize Options"
                  />
                  <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
                    Deterministic option permutation
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Side Summary Card */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <TuneIcon sx={{ color: '#38bdf8' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Selection Blueprint
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  Backend Question Selection Engine executes strict database-side filtering with zero duplicates across papers.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Examination Sets:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{numberOfPapers} Paper(s)</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Duration:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{duration} mins</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Passing Threshold:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{passingPercentage}%</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Negative Marking:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: negativeMarking ? 'warning.main' : 'text.secondary' }}>
                      {negativeMarking ? 'Enabled' : 'Disabled'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* STEP 2: SECTION & TOPIC CONFIGURATION */}
      {activeStep === 1 && (
        <Box>
          {/* Quick Component Addition Toolbar */}
          <Paper
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: 2,
              background: 'rgba(30, 41, 59, 0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: '#f8fafc' }}>
              Add Standard Placement Components:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {AVAILABLE_COMPONENTS.map((comp) => (
                <Button
                  key={comp}
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddSection(comp)}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#e2e8f0',
                    '&:hover': {
                      borderColor: '#38bdf8',
                      backgroundColor: 'rgba(56, 189, 248, 0.08)',
                    },
                  }}
                >
                  {COMPONENT_LABELS[comp]}
                </Button>
              ))}
            </Box>
          </Paper>

          {/* Configured Sections List */}
          <Grid container spacing={3}>
            {sections.map((sec, idx) => (
              <Grid item xs={12} key={idx}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    background: 'rgba(30, 41, 59, 0.7)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    position: 'relative',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Chip
                        label={`Section ${idx + 1}`}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 700 }}
                      />
                      <Chip
                        label={COMPONENT_LABELS[sec.component]}
                        size="small"
                        variant="outlined"
                        sx={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
                      />
                    </Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveSection(idx)}
                      disabled={sections.length <= 1}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Section Title"
                        value={sec.name}
                        onChange={(e) => handleUpdateSection(idx, { name: e.target.value })}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Questions per Paper"
                        value={sec.questionsCount}
                        onChange={(e) => handleUpdateSection(idx, { questionsCount: Number(e.target.value) })}
                        inputProps={{ min: 1 }}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Marks per Question"
                        value={sec.marksPerQuestion}
                        onChange={(e) => handleUpdateSection(idx, { marksPerQuestion: Number(e.target.value) })}
                        inputProps={{ min: 0.5, step: 0.5 }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        size="small"
                        select
                        label="Target Difficulty"
                        value={sec.difficulty || ''}
                        onChange={(e) =>
                          handleUpdateSection(idx, {
                            difficulty: (e.target.value as QuestionDifficulty) || null,
                          })
                        }
                      >
                        <MenuItem value="">Any Difficulty (Mixed)</MenuItem>
                        <MenuItem value="EASY">EASY Only</MenuItem>
                        <MenuItem value="MEDIUM">MEDIUM Only</MenuItem>
                        <MenuItem value="HARD">HARD Only</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        size="small"
                        select
                        label="Question Type"
                        value={sec.questionType || ''}
                        onChange={(e) =>
                          handleUpdateSection(idx, {
                            questionType: (e.target.value as QuestionType) || null,
                          })
                        }
                      >
                        <MenuItem value="">Any Question Type</MenuItem>
                        <MenuItem value="SINGLE_CHOICE">Single Choice (Radio)</MenuItem>
                        <MenuItem value="MULTIPLE_CHOICE">Multiple Choice</MenuItem>
                        <MenuItem value="TRUE_FALSE">True / False</MenuItem>
                        <MenuItem value="FILL_BLANK">Fill in Blanks</MenuItem>
                        <MenuItem value="DESCRIPTIVE">Descriptive / Subjective</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Negative Marks"
                        value={sec.negativeMarks}
                        onChange={(e) => handleUpdateSection(idx, { negativeMarks: Number(e.target.value) })}
                        inputProps={{ min: 0, step: 0.25 }}
                      />
                    </Grid>

                    {/* Topic Matrix Selector */}
                    <Grid item xs={12}>
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            Select Target Topics for {COMPONENT_LABELS[sec.component]}:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button size="small" onClick={() => handleSelectAllTopics(idx)}>
                              Select All
                            </Button>
                            <Button size="small" color="inherit" onClick={() => handleClearTopics(idx)}>
                              Clear
                            </Button>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                          {COMPONENT_TOPICS_MAP[sec.component].map((topic) => {
                            const selected = sec.topics.includes(topic);
                            return (
                              <Chip
                                key={topic}
                                label={topic}
                                size="small"
                                clickable
                                color={selected ? 'primary' : 'default'}
                                variant={selected ? 'filled' : 'outlined'}
                                onClick={() => handleToggleTopic(idx, topic)}
                                sx={{
                                  borderRadius: 1.5,
                                  fontSize: '0.78rem',
                                  fontWeight: selected ? 600 : 400,
                                }}
                              />
                            );
                          })}
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* STEP 3: REVIEW & SCHEDULE */}
      {activeStep === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: 3.5,
                borderRadius: 2,
                background: 'rgba(30, 41, 59, 0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#f8fafc' }}>
                Optional Window Scheduling
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                You can schedule the assessment now or launch it immediately on demand from the detail page.
              </Typography>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Start Date & Time"
                    InputLabelProps={{ shrink: true }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="End Date & Time"
                    InputLabelProps={{ shrink: true }}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3.5, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#f8fafc' }}>
                Configuration Breakdown
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {sections.map((sec, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#38bdf8' }}>
                        {idx + 1}. {sec.name} ({COMPONENT_LABELS[sec.component]})
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {sec.questionsCount} Qs × {numberOfPapers} Papers = {sec.questionsCount * numberOfPapers} Total
                      </Typography>
                    </Box>
                    <Typography variant="caption" display="block" sx={{ color: 'text.secondary', mb: 1 }}>
                      Difficulty: {sec.difficulty || 'Any'} | Type: {sec.questionType || 'Any'} | Marks: {sec.marksPerQuestion} ea.
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {sec.topics.map((t) => (
                        <Chip key={t} label={t} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Final Summary Card */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <CheckCircleOutlineIcon sx={{ color: '#22c55e' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Generation Audit
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Questions per Paper:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{questionsPerPaper}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Total Marks per Paper:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{marksPerPaper}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Paper Sets:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{numberOfPapers}</Typography>
                  </Box>
                  <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#38bdf8' }}>
                      Required Unique Pool:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#38bdf8' }}>
                      {totalUniqueQuestionsNeeded} Questions
                    </Typography>
                  </Box>
                </Box>

                <Alert severity="info" sx={{ fontSize: '0.78rem' }}>
                  The Question Selection Engine will verify that Question Bank contains at least {totalUniqueQuestionsNeeded} eligible, unused questions before atomic paper generation.
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={activeStep === 0 ? () => navigate('/admin/assessments') : handleBack}
          disabled={submitting}
        >
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>

        {activeStep < STEPS.length - 1 ? (
          <Button variant="contained" onClick={handleNext}>
            Proceed to {STEPS[activeStep + 1]}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={18} /> : <CheckCircleOutlineIcon />}
            sx={{
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)',
            }}
          >
            {submitting ? 'Creating Assessment...' : 'Create Assessment'}
          </Button>
        )}
      </Box>
    </Box>
  );
};
