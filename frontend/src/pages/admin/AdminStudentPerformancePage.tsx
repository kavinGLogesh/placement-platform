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
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CodeIcon from '@mui/icons-material/Code';
import CategoryIcon from '@mui/icons-material/Category';
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
import { AdminNavTabs } from '../../components/management/AdminNavTabs.js';
import { analyticsService } from '../../services/analytics.service.js';

export const AdminStudentPerformancePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: drilldown,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['studentDrilldown', id],
    queryFn: () => analyticsService.getStudentDrilldown(id || ''),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Box>
        <AdminNavTabs />
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (isError || !drilldown) {
    return (
      <Box>
        <AdminNavTabs />
        <Alert
          severity="error"
          sx={{ my: 4 }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          {error instanceof Error ? error.message : 'Student performance records not found'}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/results')}>
          Back to Results
        </Button>
      </Box>
    );
  }

  const { student, summary, assessmentHistory, categoryPerformance, codingPerformance } = drilldown;

  const categoryChartData = categoryPerformance.map((c) => ({
    name: c.displayName,
    accuracy: c.accuracy,
    avgScore: c.averageScore,
  }));

  return (
    <Box>
      <AdminNavTabs />

      {/* Navigation and Title */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/results')}
          sx={{ mb: 2 }}
        >
          Back to Results Registry
        </Button>

        {/* Profile Card Banner */}
        <Card sx={{ p: 3, bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SchoolIcon sx={{ fontSize: 48, color: 'primary.light' }} />
              <div>
                <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
                  {student.name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Reg No: <strong>{student.registerNumber}</strong> • {student.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {student.departmentName} ({student.departmentCode}) • {student.courseName} • Class {student.className} • Section {student.sectionName}
                </Typography>
              </div>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip label={`Batch: ${student.batchYear}`} variant="outlined" />
              {student.cgpa > 0 && <Chip label={`CGPA: ${student.cgpa}`} color="primary" />}
              <Chip label={student.status} color="success" sx={{ fontWeight: 700 }} />
            </Box>
          </Box>
        </Card>
      </Box>

      {/* Summary KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ bgcolor: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                Assigned Tests
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#818cf8" sx={{ my: 0.5 }}>
                {summary.totalAssigned}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Allocated assessments
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
                {summary.totalCompleted}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Submitted attempts
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
                Passed Tests
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#c084fc" sx={{ my: 0.5 }}>
                {summary.totalPassed}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Met cutoff criteria
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ bgcolor: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                Pass Rate
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#f472b6" sx={{ my: 0.5 }}>
                {summary.passRate}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Passed / Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Category Breakdown & Coding Performance */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Category Accuracy */}
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 3, height: '100%', bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CategoryIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Candidate Component Breakdown
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Accuracy & average scores across test components for this candidate.
            </Typography>

            {categoryChartData.length > 0 ? (
              <Box sx={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis unit="%" domain={[0, 100]} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: 8 }}
                      formatter={(val: any) => [`${val}%`]}
                    />
                    <Legend />
                    <Bar dataKey="accuracy" name="Accuracy %" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgScore" name="Avg Score %" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Alert severity="info">No component assessment data recorded yet.</Alert>
            )}
          </Card>
        </Grid>

        {/* Coding Assessment Performance */}
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3, height: '100%', bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CodeIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Coding Assessment Performance
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Phase 7 secure code execution statistics.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <Typography variant="caption" color="text.secondary">Total Submissions</Typography>
                  <Typography variant="h5" fontWeight={800}>{codingPerformance.totalSubmissions}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <Typography variant="caption" color="#34d399">Accepted Solutions</Typography>
                  <Typography variant="h5" fontWeight={800} color="#34d399">{codingPerformance.acceptedCount}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <Typography variant="caption" color="#fbbf24">Partial / Wrong</Typography>
                  <Typography variant="h5" fontWeight={800} color="#fbbf24">{codingPerformance.partialCount + codingPerformance.failedCount}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  <Typography variant="caption" color="#818cf8">Test Cases Pass Ratio</Typography>
                  <Typography variant="h5" fontWeight={800} color="#818cf8">{codingPerformance.passedTestsRatio}%</Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Programming Languages Used:
              </Typography>
              {codingPerformance.languagesUsed.length > 0 ? (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {codingPerformance.languagesUsed.map((lang) => (
                    <Chip key={lang} label={lang} size="small" color="primary" variant="outlined" />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No coding problems submitted yet.
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Assessment History Table */}
      <Card sx={{ mb: 4, p: 3, bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Complete Assessment History ({assessmentHistory.length})
        </Typography>

        {assessmentHistory.length > 0 ? (
          <TableContainer component={Paper} sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Assessment Title</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Marks Awarded</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Percentage</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Accuracy</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Correct</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Incorrect</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Unanswered</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Pass / Fail</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Completed At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assessmentHistory.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{r.assessmentTitle}</TableCell>
                    <TableCell>{r.obtainedMarks} / {r.totalMarks}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{r.percentage}%</TableCell>
                    <TableCell>{r.accuracy}%</TableCell>
                    <TableCell sx={{ color: '#34d399' }}>{r.correctCount}</TableCell>
                    <TableCell sx={{ color: '#f87171' }}>{r.incorrectCount}</TableCell>
                    <TableCell color="text.secondary">{r.unansweredCount}</TableCell>
                    <TableCell>
                      <Chip
                        icon={r.isPassed ? <CheckCircleOutlineIcon /> : <CancelOutlinedIcon />}
                        label={r.isPassed ? 'PASS' : 'FAIL'}
                        size="small"
                        color={r.isPassed ? 'success' : 'error'}
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell color="text.secondary">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">
            Candidate has not completed any assessments yet.
          </Alert>
        )}
      </Card>
    </Box>
  );
};
