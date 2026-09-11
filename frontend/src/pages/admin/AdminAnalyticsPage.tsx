import React, { useState } from 'react';
import {
  Typography,
  Box,
  Card,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import LayersIcon from '@mui/icons-material/Layers';
import SchoolIcon from '@mui/icons-material/School';
import CategoryIcon from '@mui/icons-material/Category';
import { AdminNavTabs } from '../../components/management/AdminNavTabs.js';
import { analyticsService } from '../../services/analytics.service.js';
import { managementService } from '../../services/management.service.js';
import { assessmentService } from '../../services/assessment.service.js';

export const AdminAnalyticsPage: React.FC = () => {
  // Filters
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Auxiliary queries for filters
  const { data: departments } = useQuery({
    queryKey: ['filterDepartments'],
    queryFn: () => managementService.getDepartments(),
    staleTime: 300000,
  });

  const { data: assessmentsData } = useQuery({
    queryKey: ['filterAssessments'],
    queryFn: () => assessmentService.getAssessments({ limit: 100 }),
    staleTime: 300000,
  });

  const activeFilters = {
    departmentId: selectedDeptId || undefined,
    assessmentId: selectedAssessmentId || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  // Queries for Analytics
  const {
    data: funnel,
    isLoading: loadingFunnel,
    refetch: refetchFunnel,
  } = useQuery({
    queryKey: ['placementFunnel', activeFilters],
    queryFn: () => analyticsService.getPlacementFunnel(activeFilters),
  });

  const {
    data: departmentAnalytics,
    isLoading: loadingDept,
    refetch: refetchDept,
  } = useQuery({
    queryKey: ['deptAnalytics', activeFilters],
    queryFn: () =>
      analyticsService.getDepartmentAnalytics({
        assessmentId: activeFilters.assessmentId,
        startDate: activeFilters.startDate,
        endDate: activeFilters.endDate,
      }),
  });

  const {
    data: topicAnalytics,
    isLoading: loadingTopics,
    refetch: refetchTopics,
  } = useQuery({
    queryKey: ['topicAnalytics', activeFilters],
    queryFn: () => analyticsService.getTopicAnalytics(activeFilters),
  });

  const handleResetFilters = () => {
    setSelectedDeptId('');
    setSelectedAssessmentId('');
    setStartDate('');
    setEndDate('');
  };

  const handleRefreshAll = () => {
    refetchFunnel();
    refetchDept();
    refetchTopics();
  };

  // Department chart data
  const deptChartData = (departmentAnalytics || []).map((d) => ({
    name: d.departmentCode || d.departmentName,
    fullName: d.departmentName,
    avgScore: d.averageScore,
    passRate: d.passPercentage,
    participation: d.participationRate,
  }));

  // Category chart data
  const categoryChartData = (topicAnalytics?.categories || []).map((c) => ({
    category: c.displayName,
    accuracy: c.accuracy,
    avgScore: c.averageScore,
    attempted: c.attemptedCount,
  }));

  return (
    <Box>
      <AdminNavTabs />

      {/* Header */}
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
            Phase 8 • Authoritative Institutional Intelligence
          </Typography>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
            Analytics, Placement Funnel & Performance Hub
          </Typography>
        </div>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshAll}
          >
            Refresh Analytics
          </Button>
        </Box>
      </Box>

      {/* Filter Toolbar */}
      <Card sx={{ mb: 4, p: 2.5, bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FilterAltIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>
            Authoritative Filters
          </Typography>
        </Box>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Department"
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
            >
              <MenuItem value="">All Departments</MenuItem>
              {(departments || []).map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Assessment"
              value={selectedAssessmentId}
              onChange={(e) => setSelectedAssessmentId(e.target.value)}
            >
              <MenuItem value="">All Assessments</MenuItem>
              {(assessmentsData?.data || []).map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Start Date"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="End Date"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={12} md={1}>
            <Button
              fullWidth
              variant="text"
              color="inherit"
              size="small"
              onClick={handleResetFilters}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* 1. Placement Funnel Visualizer */}
      <Card sx={{ mb: 4, p: 3, bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <LayersIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>
            End-to-End Placement Pipeline Funnel
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Pipeline stages computed strictly from real student attempt and result database records.
        </Typography>

        {loadingFunnel ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : funnel ? (
          <Grid container spacing={2}>
            {funnel.stages.map((st, index) => {
              const colors = [
                '#6366f1',
                '#38bdf8',
                '#34d399',
                '#10b981',
                '#94a3b8',
                '#64748b',
              ];
              const color = colors[index % colors.length];

              return (
                <Grid item xs={12} sm={6} md={4} lg={2} key={st.stage}>
                  <Card
                    sx={{
                      p: 2,
                      height: '100%',
                      bgcolor: st.isImplemented ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid',
                      borderColor: st.isImplemented ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                      borderTop: `4px solid ${color}`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                          {index + 1}. {st.stage}
                        </Typography>
                        {!st.isImplemented ? (
                          <Chip label="Future" size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                        ) : (
                          <Chip label="Active" size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                        )}
                      </Box>
                      <Typography variant="h4" fontWeight={800} sx={{ color, my: 1 }}>
                        {st.count}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, st.conversionRate)}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          mb: 1,
                          bgcolor: 'rgba(255, 255, 255, 0.06)',
                          '& .MuiLinearProgress-bar': { bgcolor: color },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" display="block">
                        <strong>{st.conversionRate}%</strong> of Registered
                      </Typography>
                      {index > 0 && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          <strong>{st.stageConversionRate}%</strong> step conversion
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block', fontSize: '0.7rem' }}>
                      {st.description}
                    </Typography>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Alert severity="info">No funnel data available</Alert>
        )}
      </Card>

      {/* 2. Department Comparisons & Category Mastery */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Department Comparison Chart */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ p: 3, height: '100%', bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <SchoolIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Department Performance Comparison
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Comparative average score %, pass percentage %, and cohort participation rate %.
            </Typography>

            {loadingDept ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : deptChartData.length > 0 ? (
              <Box sx={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis unit="%" domain={[0, 100]} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: 8 }}
                      formatter={(val: any) => [`${val}%`]}
                    />
                    <Legend />
                    <Bar dataKey="avgScore" name="Avg Score %" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="passRate" name="Pass Rate %" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="participation" name="Participation %" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Alert severity="info">No departmental results recorded yet</Alert>
            )}
          </Card>
        </Grid>

        {/* Category Accuracy Chart */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ p: 3, height: '100%', bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CategoryIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Assessment Component Accuracy
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Accuracy percentage across Aptitude, Reasoning, Verbal, Technical MCQ & Coding.
            </Typography>

            {loadingTopics ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : categoryChartData.length > 0 ? (
              <Box sx={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                    <XAxis type="number" unit="%" domain={[0, 100]} stroke="#94a3b8" />
                    <YAxis dataKey="category" type="category" width={110} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: 8 }}
                      formatter={(val: any) => [`${val}%`]}
                    />
                    <Legend />
                    <Bar dataKey="accuracy" name="Accuracy %" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="avgScore" name="Avg Score %" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Alert severity="info">No component assessment data recorded yet</Alert>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* 3. Topic Strengths and Weaknesses Matrix */}
      <Card sx={{ mb: 4, p: 3, bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Topic Strengths & Weaknesses Matrix
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Authoritative granular accuracy breakdown per question topic.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip label="Strong (≥75%)" color="success" size="small" />
            <Chip label="Average (50-74%)" color="warning" size="small" />
            <Chip label="Weak (<50%)" color="error" size="small" />
          </Box>
        </Box>

        {topicAnalytics?.topics && topicAnalytics.topics.length > 0 ? (
          <TableContainer component={Paper} sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Topic Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Component</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Questions Answered</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Correct</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Accuracy</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Average Score</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Classification</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topicAnalytics.topics.map((t) => (
                  <TableRow key={`${t.category}-${t.topic}`} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{t.topic}</TableCell>
                    <TableCell color="text.secondary">{t.category}</TableCell>
                    <TableCell>{t.attemptedCount}</TableCell>
                    <TableCell>{t.correctCount}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t.accuracy}%</TableCell>
                    <TableCell>{t.averageScore}%</TableCell>
                    <TableCell>
                      <Chip
                        label={t.strength}
                        size="small"
                        color={
                          t.strength === 'STRONG'
                            ? 'success'
                            : t.strength === 'AVERAGE'
                            ? 'warning'
                            : 'error'
                        }
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">
            Topic breakdown will appear here as students answer assessment questions.
          </Alert>
        )}
      </Card>
    </Box>
  );
};
