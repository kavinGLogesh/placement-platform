import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Grid,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TimerIcon from '@mui/icons-material/Timer';
import { useNavigate, useLocation } from 'react-router-dom';
import { attemptService } from '../../services/attempt.service.js';
import { StudentAssessmentItemDto, StudentTestStatus } from '../../types/attempt.types.js';

export const StudentTestsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from URL path
  const getTabFromPath = (): StudentTestStatus | 'ALL' => {
    if (location.pathname.includes('/available')) return 'AVAILABLE';
    if (location.pathname.includes('/upcoming')) return 'UPCOMING';
    if (location.pathname.includes('/completed')) return 'COMPLETED';
    return 'ALL';
  };

  const [activeTab, setActiveTab] = useState<StudentTestStatus | 'ALL'>(getTabFromPath());
  const [tests, setTests] = useState<StudentAssessmentItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  useEffect(() => {
    loadTests();
  }, [activeTab]);

  const loadTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const filter = activeTab === 'ALL' ? undefined : activeTab;
      const data = await attemptService.getStudentTests(filter);
      setTests(data);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to load assessments';
      setError(msg || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: StudentTestStatus | 'ALL') => {
    setActiveTab(newValue);
    if (newValue === 'AVAILABLE') navigate('/student/tests/available');
    else if (newValue === 'UPCOMING') navigate('/student/tests/upcoming');
    else if (newValue === 'COMPLETED') navigate('/student/tests/completed');
    else navigate('/student/tests');
  };

  const handleStartTest = async (testId: string) => {
    setStartingId(testId);
    setError(null);
    try {
      const attempt = await attemptService.startAssessment(testId);
      navigate(`/student/attempt/${attempt.id}`);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to start assessment';
      setError(msg || 'Failed to start assessment');
      setStartingId(null);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Top Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <div>
          <Typography variant="overline" color="primary.light" fontWeight={700} letterSpacing={1.2}>
            Placement Examination System
          </Typography>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
            My Assigned Assessments
          </Typography>
        </div>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AssessmentIcon />}
            onClick={() => navigate('/student/results')}
          >
            My Results
          </Button>
          <Button
            variant="text"
            size="small"
            onClick={() => navigate('/student/dashboard')}
          >
            Profile
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
          <Tab label="All Tests" value="ALL" />
          <Tab label="Available" value="AVAILABLE" icon={<PlayArrowIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Upcoming" value="UPCOMING" icon={<ScheduleIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Completed" value="COMPLETED" icon={<CheckCircleIcon fontSize="small" />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : tests.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6, px: 3, background: 'rgba(255,255,255,0.02)' }}>
          <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" fontWeight={700} gutterBottom>
            No Assessments Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activeTab === 'ALL'
              ? 'You do not have any assessments assigned at this time.'
              : `You have no ${activeTab.toLowerCase()} assessments.`}
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {tests.map((test) => {
            const isAvailable = test.status === 'AVAILABLE';
            const isUpcoming = test.status === 'UPCOMING';
            const isCompleted = test.status === 'COMPLETED';
            const hasActiveAttempt = Boolean(test.activeAttemptId);

            return (
              <Grid item xs={12} sm={6} lg={4} key={test.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    border: hasActiveAttempt
                      ? '1px solid rgba(59, 130, 246, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: hasActiveAttempt ? '0 4px 20px rgba(59, 130, 246, 0.15)' : undefined,
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Typography variant="h6" fontWeight={700} sx={{ pr: 1 }}>
                        {test.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={hasActiveAttempt ? 'IN PROGRESS' : test.status}
                        color={
                          hasActiveAttempt
                            ? 'warning'
                            : isAvailable
                            ? 'success'
                            : isUpcoming
                            ? 'info'
                            : 'default'
                        }
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>

                    {test.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                        {test.description}
                      </Typography>
                    )}

                    <Divider sx={{ my: 1.5 }} />

                    {/* Metadata Grid */}
                    <Grid container spacing={1} sx={{ mt: 0.5 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <TimerIcon sx={{ fontSize: 14 }} /> Duration
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {test.duration} mins
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <HelpOutlineIcon sx={{ fontSize: 14 }} /> Questions
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {test.totalQuestions || 'Multiple'}
                        </Typography>
                      </Grid>

                      <Grid item xs={6} sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Passing Mark
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {test.passingPercentage}%
                        </Typography>
                      </Grid>

                      <Grid item xs={6} sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Negative Marking
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color={test.negativeMarking ? 'warning.main' : 'text.primary'}>
                          {test.negativeMarking ? 'Yes' : 'No'}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 2, pt: 1, borderTop: '1px dashed rgba(255,255,255,0.08)' }}>
                      <Typography variant="caption" color="text.secondary">
                        Attempts: {test.attemptsCount} of {test.maximumAttempts} used
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    {isAvailable && (
                      <Button
                        fullWidth
                        variant="contained"
                        color={hasActiveAttempt ? 'warning' : 'primary'}
                        startIcon={<PlayArrowIcon />}
                        disabled={startingId === test.id}
                        onClick={() =>
                          hasActiveAttempt && test.activeAttemptId
                            ? navigate(`/student/attempt/${test.activeAttemptId}`)
                            : handleStartTest(test.id)
                        }
                      >
                        {startingId === test.id
                          ? 'Starting...'
                          : hasActiveAttempt
                          ? 'Resume Assessment'
                          : 'Start Assessment'}
                      </Button>
                    )}

                    {isUpcoming && (
                      <Button fullWidth variant="outlined" disabled startIcon={<ScheduleIcon />}>
                        Opens on {test.startDate ? new Date(test.startDate).toLocaleDateString() : 'Scheduled'}
                      </Button>
                    )}

                    {isCompleted && test.lastResultId && (
                      <Button
                        fullWidth
                        variant="outlined"
                        color="success"
                        startIcon={<AssessmentIcon />}
                        onClick={() => navigate(`/student/results/${test.lastResultId}`)}
                      >
                        View Results
                      </Button>
                    )}

                    {isCompleted && !test.lastResultId && (
                      <Button fullWidth variant="outlined" disabled>
                        Completed
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};
