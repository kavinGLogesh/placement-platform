import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Card,
  CardContent,
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
  Paper,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import SchoolIcon from '@mui/icons-material/School';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import InsightsIcon from '@mui/icons-material/Insights';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SmartToyIcon from '@mui/icons-material/SmartToy';
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

  return (
    <Box>
      {/* Header Banner */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <div>
          <Typography variant="overline" color="primary.light" fontWeight={700} letterSpacing={1.2}>
            Student Workspace • Phase 8 Analytics
          </Typography>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
            Candidate Dashboard & Placement Progress
          </Typography>
        </div>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<InsightsIcon />}
            onClick={() => navigate('/student/performance')}
          >
            My Performance
          </Button>
          <Button
            variant="outlined"
            startIcon={<AssignmentIcon />}
            onClick={() => navigate('/student/tests')}
          >
            Assessments
          </Button>
          <Button
            variant="outlined"
            color="info"
            onClick={() => navigate('/student/reports')}
          >
            My Reports
          </Button>
          <Chip
            icon={<SchoolIcon />}
            label={`Student: ${user?.email || 'Candidate'}`}
            color="success"
            sx={{ fontWeight: 700, py: 2, px: 1 }}
          />
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

      {/* KPI Cards */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ bgcolor: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                  Assigned
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#818cf8" sx={{ my: 0.5 }}>
                  {summary.totalAssigned}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total allocated tests
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ bgcolor: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                  Completed
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#38bdf8" sx={{ my: 0.5 }}>
                  {summary.completedAssessments}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Submissions generated
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ bgcolor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                  Average Score
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#34d399" sx={{ my: 0.5 }}>
                  {summary.averageScore}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Overall percentage
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ bgcolor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                  Accuracy
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#fbbf24" sx={{ my: 0.5 }}>
                  {summary.averageAccuracy}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Correct / Attempted
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ bgcolor: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                  Pass Rate
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#c084fc" sx={{ my: 0.5 }}>
                  {summary.passRate}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Passed / Completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ bgcolor: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                  Available
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#f472b6" sx={{ my: 0.5 }}>
                  {summary.availableAssessments}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Ready to attempt
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Placement Readiness Banner (Coming Soon / Future AI Capability) */}
      <Card
        sx={{
          mb: 4,
          p: 3,
          bgcolor: 'rgba(99, 102, 241, 0.04)',
          border: '1px dashed rgba(99, 102, 241, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SmartToyIcon sx={{ fontSize: 42, color: 'primary.main' }} />
          <div>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                Placement Readiness Score
              </Typography>
              <Chip label="Coming Soon / Future AI Capability" color="primary" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Predictive placement matching and AI-powered hiring recommendations will arrive in a future capability module. Continue taking benchmark tests to build your authoritative profile.
            </Typography>
          </div>
        </Box>
        <Button variant="outlined" color="primary" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/student/performance')}>
          View Detailed Mastery
        </Button>
      </Card>

      {/* Main Grid: Upcoming Tests & Recent Results */}
      <Grid container spacing={3}>
        {/* Available / Upcoming Tests */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, height: '100%', bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                Available & Upcoming Assessments
              </Typography>
              <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/student/tests')}>
                All Tests
              </Button>
            </Box>

            {dashboardData?.upcomingAssessments && dashboardData.upcomingAssessments.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {dashboardData.upcomingAssessments.map((test) => (
                  <Card
                    key={test.id}
                    sx={{
                      p: 2,
                      bgcolor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {test.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Duration: {test.durationMinutes} mins • Total: {test.totalMarks} marks • Pass: {test.passingPercentage}%
                      </Typography>
                    </div>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PlayArrowIcon />}
                      onClick={() => navigate('/student/tests')}
                    >
                      Start
                    </Button>
                  </Card>
                ))}
              </Box>
            ) : (
              <Alert severity="info">
                No new assessments pending. All assigned assessments have been completed or scheduled later.
              </Alert>
            )}
          </Card>
        </Grid>

        {/* Recent Results */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, height: '100%', bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                Recent Assessment Results
              </Typography>
              <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/student/results')}>
                All Results
              </Button>
            </Box>

            {dashboardData?.recentResults && dashboardData.recentResults.length > 0 ? (
              <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Assessment</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Score</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Accuracy</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.recentResults.map((r) => (
                      <TableRow key={r.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{r.assessmentTitle}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {r.percentage}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {r.obtainedMarks}/{r.totalMarks}
                          </Typography>
                        </TableCell>
                        <TableCell>{r.accuracy}%</TableCell>
                        <TableCell>
                          <Chip
                            icon={r.isPassed ? <CheckCircleOutlineIcon /> : <CancelOutlinedIcon />}
                            label={r.isPassed ? 'PASS' : 'FAIL'}
                            size="small"
                            color={r.isPassed ? 'success' : 'error'}
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">
                No results generated yet. Once you complete an assessment, your authoritative score will appear here.
              </Alert>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
