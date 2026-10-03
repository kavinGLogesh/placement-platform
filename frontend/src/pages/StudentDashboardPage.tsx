import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Card,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { useAuth } from '../hooks/useAuth.js';
import { analyticsService } from '../services/analytics.service.js';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['studentDashboardMetrics'],
    queryFn: () => analyticsService.getStudentDashboard(),
    staleTime: 30000,
  });

  const summary = dashboardData?.summary || {
    totalAssigned: 0,
    completedAssessments: 0,
    availableAssessments: 0,
    averageScore: 0,
    passRate: 0,
    averageAccuracy: 0,
  };

  const studentDisplayName = user?.email ? user.email.split('@')[0].replace('.', ' ') : 'Student';

  return (
    <Box>
      {/* Student Portal Header */}
      <Box
        sx={{
          mb: 3,
          p: { xs: 2.5, md: 3 },
          borderRadius: '8px',
          bgcolor: '#ffffff',
          border: '1px solid #DCE6F5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <SchoolIcon sx={{ fontSize: 18, color: '#1765B5' }} />
            <Typography variant="overline" sx={{ color: '#1765B5', fontWeight: 700, letterSpacing: '0.06em' }}>
              CANDIDATE EXAMINATION PORTAL
            </Typography>
            <Chip
              label="Student Portal"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                fontWeight: 600,
                borderRadius: '4px',
                bgcolor: '#E4EEFC',
                color: '#1765B5',
                border: '1px solid #D1DEF0',
              }}
            />
          </Box>
          <Typography variant="h5" fontWeight={700} sx={{ color: '#14264B', textTransform: 'capitalize', mb: 0.5 }}>
            Welcome back, {studentDisplayName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review assigned placement examinations, attempt scheduled company tests, and inspect comprehensive topic performance.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.25 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={() => navigate('/student/tests')}
          >
            Go to Tests ({summary.availableAssessments})
          </Button>
          <Button
            variant="outlined"
            startIcon={<AssignmentTurnedInIcon />}
            onClick={() => navigate('/student/results')}
          >
            My Results
          </Button>
        </Box>
      </Box>

      {isError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          {error instanceof Error ? error.message : 'Failed to load dashboard metrics'}
        </Alert>
      )}

      {/* KPI Stats Grid */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5, mb: 3.5, bgcolor: '#ffffff', borderRadius: '8px', border: '1px solid #DCE6F5' }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Grid container spacing={2} sx={{ mb: 3.5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                p: 2.25,
                bgcolor: '#ffffff',
                border: '1px solid #DCE6F5',
                borderRadius: '8px',
              }}
            >
              <Typography variant="caption" sx={{ color: '#7182A0', fontWeight: 600, letterSpacing: '0.04em' }}>
                AVAILABLE ASSESSMENTS
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#1765B5', my: 0.5 }}>
                {summary.availableAssessments}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Ready to attempt right now
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                p: 2.25,
                bgcolor: '#ffffff',
                border: '1px solid #DCE6F5',
                borderRadius: '8px',
              }}
            >
              <Typography variant="caption" sx={{ color: '#7182A0', fontWeight: 600, letterSpacing: '0.04em' }}>
                COMPLETED TESTS
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#14264B', my: 0.5 }}>
                {summary.completedAssessments}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Out of {summary.totalAssigned} assigned tests
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                p: 2.25,
                bgcolor: '#ffffff',
                border: '1px solid #DCE6F5',
                borderRadius: '8px',
              }}
            >
              <Typography variant="caption" sx={{ color: '#7182A0', fontWeight: 600, letterSpacing: '0.04em' }}>
                AVERAGE SCORE
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#047857', my: 0.5 }}>
                {summary.averageScore}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, summary.averageScore)}
                sx={{ height: 5, borderRadius: '3px', my: 0.75, bgcolor: '#E7EEFA', '& .MuiLinearProgress-bar': { bgcolor: '#047857' } }}
              />
              <Typography variant="caption" color="text.secondary">
                Across all completed papers
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                p: 2.25,
                bgcolor: '#ffffff',
                border: '1px solid #DCE6F5',
                borderRadius: '8px',
              }}
            >
              <Typography variant="caption" sx={{ color: '#7182A0', fontWeight: 600, letterSpacing: '0.04em' }}>
                QUALIFICATION PASS RATE
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#b45309', my: 0.5 }}>
                {summary.passRate}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, summary.passRate)}
                sx={{ height: 5, borderRadius: '3px', my: 0.75, bgcolor: '#E7EEFA', '& .MuiLinearProgress-bar': { bgcolor: '#b45309' } }}
              />
              <Typography variant="caption" color="text.secondary">
                {summary.averageAccuracy}% average question accuracy
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Main Grid: Available Tests & Recent Results */}
      <Grid container spacing={2.5}>
        {/* Available Tests */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              height: '100%',
              bgcolor: '#ffffff',
              border: '1px solid #DCE6F5',
              borderRadius: '8px',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} color="#14264B">
                  Available Assessments
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tests ready for immediate candidate attempt
                </Typography>
              </Box>
              <Button size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />} onClick={() => navigate('/student/tests')} sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                All Tests
              </Button>
            </Box>

            {dashboardData?.upcomingAssessments && dashboardData.upcomingAssessments.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {dashboardData.upcomingAssessments.map((test) => (
                  <Box
                    key={test.id}
                    sx={{
                      p: 2,
                      bgcolor: '#EDF2FF',
                      border: '1px solid #D1DEF0',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 1.5,
                      transition: 'border-color 0.15s ease',
                      '&:hover': {
                        borderColor: '#1765B5',
                        bgcolor: '#ffffff',
                      },
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant="subtitle2" fontWeight={700} color="#14264B">
                        {test.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.75, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#7182A0' }}>
                          <AccessTimeIcon sx={{ fontSize: 15 }} />
                          <Typography variant="caption" fontWeight={600}>
                            {test.durationMinutes} mins
                          </Typography>
                        </Box>
                        <Chip
                          label={`${test.totalMarks} Marks`}
                          size="small"
                          sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#ffffff', border: '1px solid #D1DEF0', fontWeight: 600, borderRadius: '3px' }}
                        />
                        <Chip
                          label={`Pass: ${test.passingPercentage}%`}
                          size="small"
                          sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#ffffff', border: '1px solid #D1DEF0', color: '#047857', fontWeight: 600, borderRadius: '3px' }}
                        />
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<PlayArrowIcon sx={{ fontSize: 16 }} />}
                      onClick={() => navigate('/student/tests')}
                      sx={{ px: 2, py: 0.6, fontSize: '0.8rem' }}
                    >
                      Start Test
                    </Button>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#EDF2FF', borderRadius: '6px', border: '1px dashed #D1DEF0' }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 32, color: '#047857', mb: 1 }} />
                <Typography variant="subtitle2" fontWeight={700} color="#14264B">
                  You are all caught up!
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  No pending tests assigned right now. Check back later or review your scorecards.
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Recent Results */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              height: '100%',
              bgcolor: '#ffffff',
              border: '1px solid #DCE6F5',
              borderRadius: '8px',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} color="#14264B">
                  Recent Results
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Your latest examination scores and evaluation breakdown
                </Typography>
              </Box>
              <Button size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />} onClick={() => navigate('/student/results')} sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                All Results
              </Button>
            </Box>

            {dashboardData?.recentResults && dashboardData.recentResults.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#EDF2FF' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: '#526584', fontSize: '0.78rem', py: 1.25 }}>Assessment</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#526584', fontSize: '0.78rem', py: 1.25 }}>Score</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#526584', fontSize: '0.78rem', py: 1.25 }}>Accuracy</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#526584', fontSize: '0.78rem', py: 1.25 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#526584', fontSize: '0.78rem', py: 1.25 }} align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.recentResults.map((r) => (
                      <TableRow key={r.id} hover sx={{ '&:hover': { bgcolor: '#EDF2FF' } }}>
                        <TableCell sx={{ fontWeight: 600, color: '#14264B', fontSize: '0.82rem' }}>{r.assessmentTitle}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} color="#14264B" sx={{ fontSize: '0.82rem' }}>
                            {r.percentage}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {r.obtainedMarks}/{r.totalMarks} marks
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ color: '#405678', fontWeight: 600, fontSize: '0.82rem' }}>{r.accuracy}%</TableCell>
                        <TableCell>
                          <Chip
                            icon={r.isPassed ? <CheckCircleOutlineIcon sx={{ '&&': { fontSize: 14 } }} /> : <CancelOutlinedIcon sx={{ '&&': { fontSize: 14 } }} />}
                            label={r.isPassed ? 'PASS' : 'FAIL'}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              borderRadius: '4px',
                              bgcolor: r.isPassed ? '#ecfdf5' : '#fef2f2',
                              color: r.isPassed ? '#047857' : '#b91c1c',
                              border: '1px solid',
                              borderColor: r.isPassed ? '#a7f3d0' : '#fecaca',
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => navigate('/student/reports')}
                            sx={{ fontWeight: 600, fontSize: '0.78rem' }}
                          >
                            Scorecard
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#EDF2FF', borderRadius: '6px', border: '1px dashed #D1DEF0' }}>
                <EmojiEventsIcon sx={{ fontSize: 32, color: '#8293B0', mb: 1 }} />
                <Typography variant="subtitle2" fontWeight={700} color="#14264B">
                  No submissions yet
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  When you complete an assessment, your score and topic breakdown will appear right here.
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

