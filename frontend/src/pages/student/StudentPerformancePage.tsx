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
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CategoryIcon from '@mui/icons-material/Category';
import CodeIcon from '@mui/icons-material/Code';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { analyticsService } from '../../services/analytics.service.js';

export const StudentPerformancePage: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: performance,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['studentPerformanceData'],
    queryFn: () => analyticsService.getStudentPerformance(),
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !performance) {
    return (
      <Box sx={{ p: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/student/dashboard')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          {error instanceof Error ? error.message : 'Failed to load performance analytics'}
        </Alert>
      </Box>
    );
  }

  const { summary, trends, categoryPerformance, topicPerformance, codingPerformance, assessmentHistory } =
    performance;

  const categoryChartData = categoryPerformance.map((c) => ({
    name: c.displayName,
    accuracy: c.accuracy,
    avgScore: c.averageScore,
  }));

  return (
    <Box>
      {/* Navigation Header */}
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
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/student/dashboard')}
            sx={{ mb: 1 }}
          >
            Dashboard
          </Button>
          <Typography variant="overline" color="primary.light" fontWeight={700} letterSpacing={1.2} display="block">
            Student Analytics Hub • Phase 8
          </Typography>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
            My Performance, Trends & Mastery
          </Typography>
        </div>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ bgcolor: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                Tests Taken
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#818cf8" sx={{ my: 0.5 }}>
                {summary.totalAssessmentsTaken}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Completed submissions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ bgcolor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                Tests Passed
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#34d399" sx={{ my: 0.5 }}>
                {summary.totalPassed}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Met cutoff percentage
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ bgcolor: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                Average Score
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#38bdf8" sx={{ my: 0.5 }}>
                {summary.averageScore}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Across all attempts
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
                Correct answers ratio
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ bgcolor: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                Highest Score
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#c084fc" sx={{ my: 0.5 }}>
                {summary.highestScore}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Personal best record
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
                Clearance percentage
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Score & Accuracy Progression Trends */}
      <Card sx={{ mb: 4, p: 3, bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <TrendingUpIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Score & Accuracy Timeline Trends
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Chronological performance trajectory across completed assessments.
        </Typography>

        {trends.length > 0 ? (
          <Box sx={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis unit="%" domain={[0, 100]} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: 8 }}
                  formatter={(val: any) => [`${val}%`]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  name="Score %"
                  stroke="#6366f1"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  name="Accuracy %"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Alert severity="info">Complete at least one assessment to visualize your score progression timeline.</Alert>
        )}
      </Card>

      {/* Category Breakdown & Coding Performance */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Category Performance */}
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 3, height: '100%', bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CategoryIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Component Mastery Breakdown
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Your accuracy and score across Aptitude, Reasoning, Verbal, Technical & Coding.
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
                    <Bar dataKey="accuracy" name="Accuracy %" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgScore" name="Avg Score %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Alert severity="info">No component data recorded yet.</Alert>
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

      {/* Topic Strengths & Weaknesses Table */}
      {topicPerformance && topicPerformance.length > 0 && (
        <Card sx={{ mb: 4, p: 3, bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Topic Mastery & Strengths Matrix
          </Typography>
          <TableContainer component={Paper} sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Topic Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Component</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Answered</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Correct</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Accuracy</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topicPerformance.map((t) => (
                  <TableRow key={`${t.category}-${t.topic}`} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{t.topic}</TableCell>
                    <TableCell color="text.secondary">{t.category}</TableCell>
                    <TableCell>{t.attemptedCount}</TableCell>
                    <TableCell>{t.correctCount}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t.accuracy}%</TableCell>
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
        </Card>
      )}

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
                  <TableCell sx={{ fontWeight: 700 }}>Score Awarded</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Percentage</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Accuracy</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Correct</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Incorrect</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
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
          <Alert severity="info">You haven't completed any assessments yet.</Alert>
        )}
      </Card>
    </Box>
  );
};
