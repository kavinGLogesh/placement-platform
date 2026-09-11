import React from 'react';
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
  LinearProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BusinessIcon from '@mui/icons-material/Business';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ClassIcon from '@mui/icons-material/Class';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import QuizIcon from '@mui/icons-material/Quiz';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BarChartIcon from '@mui/icons-material/BarChart';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useAuth } from '../hooks/useAuth.js';
import { AdminNavTabs } from '../components/management/AdminNavTabs.js';
import { analyticsService } from '../services/analytics.service.js';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    data: overview,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['adminOverviewKPIs'],
    queryFn: () => analyticsService.getAdminOverview(),
    staleTime: 30000,
  });

  const { data: funnelData } = useQuery({
    queryKey: ['adminFunnelQuick'],
    queryFn: () => analyticsService.getPlacementFunnel(),
    staleTime: 60000,
  });

  const modules = [
    {
      title: 'Analytics Hub',
      tier: 'Phase 8',
      path: '/admin/analytics',
      icon: <BarChartIcon sx={{ fontSize: 32, color: '#3b82f6' }} />,
      desc: 'Placement funnel, department comparisons, and topic strengths/weaknesses',
    },
    {
      title: 'Results Registry',
      tier: 'Phase 8',
      path: '/admin/results',
      icon: <FactCheckIcon sx={{ fontSize: 32, color: '#10b981' }} />,
      desc: 'Authoritative student marks, percentages, accuracy, pass/fail status & search',
    },
    {
      title: 'Assessment Builder',
      tier: 'Phase 5',
      path: '/admin/assessments',
      icon: <AssignmentIcon sx={{ fontSize: 32, color: '#38bdf8' }} />,
      desc: 'Assessment configuration, selection engine, multi-paper generation & assignment',
    },
    {
      title: 'Question Bank',
      tier: 'Phase 4',
      path: '/admin/questions',
      icon: <QuizIcon sx={{ fontSize: 32, color: '#f43f5e' }} />,
      desc: 'Authoritative assessment questions, types, marks & options',
    },
    {
      title: 'Student Registry',
      tier: 'Tier 6',
      path: '/admin/students',
      icon: <PeopleAltIcon sx={{ fontSize: 32, color: '#8b5cf6' }} />,
      desc: 'Student CRUD, server pagination & bulk Excel import',
    },
    {
      title: 'Departments',
      tier: 'Tier 2',
      path: '/admin/departments',
      icon: <BusinessIcon sx={{ fontSize: 32, color: '#06b6d4' }} />,
      desc: 'Academic engineering & science departments',
    },
    {
      title: 'Degree Courses',
      tier: 'Tier 3',
      path: '/admin/courses',
      icon: <MenuBookIcon sx={{ fontSize: 32, color: '#10b981' }} />,
      desc: 'Undergraduate and postgraduate degrees',
    },
    {
      title: 'Classes & Batches',
      tier: 'Tier 4',
      path: '/admin/classes',
      icon: <ClassIcon sx={{ fontSize: 32, color: '#f59e0b' }} />,
      desc: 'Graduation cohorts and academic years',
    },
  ];

  return (
    <Box>
      <AdminNavTabs />

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
            Administration Console • Phase 8 Authoritative Analytics
          </Typography>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
            Institutional Control Center & Assessment Dashboard
          </Typography>
        </div>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<BarChartIcon />}
            onClick={() => navigate('/admin/analytics')}
          >
            Analytics Hub
          </Button>
          <Button
            variant="outlined"
            startIcon={<FactCheckIcon />}
            onClick={() => navigate('/admin/results')}
          >
            All Results
          </Button>
          <Chip
            icon={<AdminPanelSettingsIcon />}
            label={`Role: ${user?.role}`}
            color={user?.role === 'SUPER_ADMIN' ? 'primary' : 'secondary'}
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
          {error instanceof Error ? error.message : 'Failed to load executive analytics summary'}
        </Alert>
      )}

      {/* Executive KPI Cards */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Executive Key Performance Indicators
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ bgcolor: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                  Total Students
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#818cf8" sx={{ my: 0.5 }}>
                  {overview?.totalStudents || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Active: {overview?.activeStudents || 0} candidates
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ bgcolor: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                  Participation
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#38bdf8" sx={{ my: 0.5 }}>
                  {overview?.overallParticipationRate || 0}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Across registered cohorts
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
                  {overview?.averageScore || 0}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  All completed results
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ bgcolor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                  Pass Percentage
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#fbbf24" sx={{ my: 0.5 }}>
                  {overview?.passPercentage || 0}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Meeting assessment cut-off
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ bgcolor: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                  Total Attempts
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#c084fc" sx={{ my: 0.5 }}>
                  {overview?.totalAttempts || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Assessment attempts started
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ bgcolor: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                  Assessments
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#f472b6" sx={{ my: 0.5 }}>
                  {overview?.totalAssessments || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Active: {overview?.activeAssessments || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Placement Funnel Snapshot */}
      {funnelData && (
        <Card sx={{ mb: 4, p: 2.5, bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Placement Pipeline & Assessment Funnel
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Registered → Appeared → Completed → Passed → Interview (Future) → Selected (Future)
              </Typography>
            </Box>
            <Button
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/admin/analytics')}
            >
              Detailed Funnel Analytics
            </Button>
          </Box>

          <Grid container spacing={2}>
            {funnelData.stages.map((st) => (
              <Grid item xs={6} sm={4} md={2} key={st.stage}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: st.isImplemented
                      ? 'rgba(255, 255, 255, 0.03)'
                      : 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid',
                    borderColor: st.isImplemented
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(255, 255, 255, 0.03)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {st.stage}
                    </Typography>
                    {!st.isImplemented && (
                      <Chip label="Future" size="small" sx={{ fontSize: '0.65rem', height: 18 }} />
                    )}
                  </Box>
                  <Typography variant="h5" fontWeight={800} sx={{ my: 0.5 }}>
                    {st.count}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, st.conversionRate)}
                    sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {st.conversionRate}% of cohort
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Card>
      )}

      {/* Live Results Stream Table */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Live Assessment Results Feed
          </Typography>
          <Button
            size="small"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/admin/results')}
          >
            View Full Results Registry ({overview?.totalAttempts || 0})
          </Button>
        </Box>

        {overview?.recentResults && overview.recentResults.length > 0 ? (
          <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Candidate</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Register No.</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Assessment</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Score</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Accuracy</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {overview.recentResults.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{item.studentName}</TableCell>
                    <TableCell color="text.secondary">{item.registerNumber}</TableCell>
                    <TableCell>{item.assessmentTitle}</TableCell>
                    <TableCell>{item.departmentCode || item.departmentName || '—'}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {item.percentage}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.obtainedMarks}/{item.totalMarks} marks
                      </Typography>
                    </TableCell>
                    <TableCell>{item.accuracy}%</TableCell>
                    <TableCell>
                      <Chip
                        icon={item.isPassed ? <CheckCircleOutlineIcon /> : <CancelOutlinedIcon />}
                        label={item.isPassed ? 'PASS' : 'FAIL'}
                        size="small"
                        color={item.isPassed ? 'success' : 'error'}
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => navigate(`/admin/students/${item.studentId}/performance`)}
                      >
                        Performance
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Card sx={{ p: 3, textAlign: 'center', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
            <Typography variant="body2" color="text.secondary">
              No recent assessment results submitted yet. Results will stream here in real-time as students complete assessments.
            </Typography>
          </Card>
        )}
      </Box>

      {/* Institutional Modules Grid */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Management Hub & Institutional Hierarchy
      </Typography>
      <Grid container spacing={2.5}>
        {modules.map((m) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={m.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  borderColor: 'primary.main',
                },
              }}
            >
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  {m.icon}
                  <Chip label={m.tier} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                </Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {m.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
                  {m.desc}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate(m.path)}
                >
                  Open {m.title}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
