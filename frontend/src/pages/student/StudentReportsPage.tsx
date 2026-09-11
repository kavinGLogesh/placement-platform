import React, { useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { reportService } from '../../services/report.service.js';
import { ExportFormat } from '../../types/report.types.js';

export const StudentReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [exportLoading, setExportLoading] = useState<string | null>(null);

  const {
    data: report,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['studentOwnReport'],
    queryFn: () => reportService.getStudentOwnReport(),
    staleTime: 30000,
  });

  const handleExport = async (format: ExportFormat) => {
    try {
      setExportLoading(format);
      await reportService.downloadStudentOwnReport(format);
    } catch (err) {
      console.error('Student export failed:', err);
      alert('Failed to generate export file. Please try again.');
    } finally {
      setExportLoading(null);
    }
  };

  return (
    <Box>
      {/* Header & Back Button */}
      <Box
        sx={{
          mb: 3,
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
            sx={{ mb: 1, color: 'text.secondary' }}
            size="small"
          >
            Back to Dashboard
          </Button>
          <Typography variant="overline" color="success.light" fontWeight={700} letterSpacing={1.2}>
            Student Workspace • Phase 9 Reports
          </Typography>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
            My Performance Transcript & Official Report
          </Typography>
        </div>

        {/* Export Buttons */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={exportLoading === 'xlsx' ? <CircularProgress size={16} /> : <TableChartIcon />}
            disabled={Boolean(exportLoading)}
            onClick={() => handleExport('xlsx')}
            sx={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}
          >
            Excel (.xlsx)
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={exportLoading === 'csv' ? <CircularProgress size={16} /> : <DownloadIcon />}
            disabled={Boolean(exportLoading)}
            onClick={() => handleExport('csv')}
            sx={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
          >
            CSV
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={exportLoading === 'pdf' ? <CircularProgress size={16} /> : <PictureAsPdfIcon />}
            disabled={Boolean(exportLoading)}
            onClick={() => handleExport('pdf')}
            sx={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.4)' }}
          >
            PDF Transcript
          </Button>
          <Button
            variant="contained"
            size="small"
            color="primary"
            startIcon={exportLoading === 'html' ? <CircularProgress size={16} /> : <PrintIcon />}
            disabled={Boolean(exportLoading)}
            onClick={() => handleExport('html')}
          >
            Print Layout
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
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
          {error instanceof Error ? error.message : 'Failed to load student performance report'}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        report && (
          <>
            {/* Student Profile Info Card */}
            <Card
              sx={{
                mb: 3,
                bgcolor: 'rgba(16, 185, 129, 0.04)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
              }}
            >
              <CardContent sx={{ py: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      Candidate Name
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {report.student.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} md={2}>
                    <Typography variant="caption" color="text.secondary">
                      Register Number
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {report.student.registerNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} md={2}>
                    <Typography variant="caption" color="text.secondary">
                      Department
                    </Typography>
                    <Typography variant="subtitle2">
                      {report.student.departmentName} ({report.student.departmentCode})
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} md={2}>
                    <Typography variant="caption" color="text.secondary">
                      Course & Year
                    </Typography>
                    <Typography variant="subtitle2">
                      {report.student.courseCode} • Year {report.student.year}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      Institutional Email
                    </Typography>
                    <Typography variant="subtitle2">{report.student.collegeEmail}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Performance KPIs */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={4} md={2.4}>
                <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                      Tests Completed
                    </Typography>
                    <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}>
                      {report.summary.totalAssessmentsCompleted} / {report.summary.totalAssessmentsAssigned}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={4} md={2.4}>
                <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                      Average Score
                    </Typography>
                    <Typography variant="h5" fontWeight={800} color="primary.light" sx={{ mt: 0.5 }}>
                      {report.summary.averageScore}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={4} md={2.4}>
                <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                      Average Percentage
                    </Typography>
                    <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}>
                      {report.summary.averagePercentage}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={4} md={2.4}>
                <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                      Overall Accuracy
                    </Typography>
                    <Typography variant="h5" fontWeight={800} color="#06b6d4" sx={{ mt: 0.5 }}>
                      {report.summary.overallAccuracy}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={4} md={2.4}>
                <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                      Pass Rate
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight={800}
                      color={report.summary.passRate >= 60 ? 'success.main' : 'error.main'}
                      sx={{ mt: 0.5 }}
                    >
                      {report.summary.passRate}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Assessment History Table */}
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
              Assessment Results History
            </Typography>
            <TableContainer
              component={Paper}
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 2,
                mb: 4,
              }}
            >
              <Table size="small">
                <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Assessment Title</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Total Marks</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Obtained Marks</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Percentage</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Accuracy</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Result</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Submitted At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.assessments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No assessment results on record.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.assessments.map((a) => (
                      <TableRow key={a.assessmentId} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{a.assessmentTitle}</TableCell>
                        <TableCell align="right">{a.totalMarks}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{a.obtainedMarks}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>{a.percentage}%</TableCell>
                        <TableCell align="right">{a.accuracy}%</TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={a.isPassed ? 'PASSED' : 'FAILED'}
                            color={a.isPassed ? 'success' : 'error'}
                            sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                          {a.submittedAt ? new Date(a.submittedAt).toLocaleString() : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Topic & Skill Proficiency Breakdown */}
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
              Topic & Skill Competency Profile
            </Typography>
            <TableContainer
              component={Paper}
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 2,
                mb: 4,
              }}
            >
              <Table size="small">
                <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Topic Name</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Accuracy Rate</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Proficiency Assessment</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.topicProficiency.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No topic competency data available yet. Complete an assessment to generate your skill profile.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.topicProficiency.map((t, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{t.category.replace(/_/g, ' ')}</TableCell>
                        <TableCell>{t.topic}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>{t.accuracyPercentage}%</TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={t.proficiencyRating}
                            color={
                              t.proficiencyRating === 'Strong'
                                ? 'success'
                                : t.proficiencyRating === 'Moderate'
                                ? 'warning'
                                : 'error'
                            }
                            sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )
      )}
    </Box>
  );
};

export default StudentReportsPage;
