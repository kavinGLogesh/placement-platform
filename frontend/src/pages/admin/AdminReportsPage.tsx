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
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Pagination,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import DescriptionIcon from '@mui/icons-material/Description';
import AssessmentIcon from '@mui/icons-material/Assignment';
import BusinessIcon from '@mui/icons-material/Business';
import PsychologyIcon from '@mui/icons-material/Psychology';
import QuizIcon from '@mui/icons-material/Quiz';
import CodeIcon from '@mui/icons-material/Code';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import RefreshIcon from '@mui/icons-material/Refresh';
import ClearIcon from '@mui/icons-material/Clear';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import { AdminNavTabs } from '../../components/management/AdminNavTabs.js';
import { reportService } from '../../services/report.service.js';
import { ExportFormat } from '../../types/report.types.js';

type ReportType =
  | 'students'
  | 'assessments'
  | 'departments'
  | 'topics'
  | 'questions'
  | 'coding'
  | 'funnel';

export const AdminReportsPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('students');

  // Unified Filter States
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [departmentId, setDepartmentId] = useState<string>('');
  const [assessmentId, setAssessmentId] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [isPassed, setIsPassed] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [exportLoading, setExportLoading] = useState<string | null>(null);

  // Clear filters helper
  const handleClearFilters = () => {
    setDepartmentId('');
    setAssessmentId('');
    setCategory('');
    setIsPassed('');
    setStartDate('');
    setEndDate('');
    setSearch('');
    setPage(1);
  };

  // Build active filter query
  const queryParams = {
    page,
    limit,
    departmentId: departmentId || undefined,
    assessmentId: assessmentId || undefined,
    category: category || undefined,
    isPassed: isPassed !== '' ? isPassed === 'true' : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    search: search ? search.trim() : undefined,
  };

  // Fetch Report Data based on active tab
  const {
    data: reportData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['adminReport', selectedReport, queryParams],
    queryFn: async () => {
      switch (selectedReport) {
        case 'students':
          return reportService.getStudentReport(queryParams);
        case 'assessments':
          return reportService.getAssessmentReport(queryParams);
        case 'departments':
          return reportService.getDepartmentReport(queryParams);
        case 'topics':
          return reportService.getTopicReport(queryParams);
        case 'questions':
          return reportService.getQuestionReport(queryParams);
        case 'coding':
          return reportService.getCodingReport(queryParams);
        case 'funnel':
          return reportService.getFunnelReport(queryParams);
        default:
          return null;
      }
    },
    staleTime: 10000,
  });

  // Handle Export Download
  const handleExport = async (format: ExportFormat) => {
    try {
      setExportLoading(format);
      await reportService.downloadReport(selectedReport, format, queryParams);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to generate export file. Please verify parameters and try again.');
    } finally {
      setExportLoading(null);
    }
  };

  const reportTabs = [
    { value: 'students', label: 'Student Performance', icon: <DescriptionIcon fontSize="small" /> },
    { value: 'assessments', label: 'Assessment Results', icon: <AssessmentIcon fontSize="small" /> },
    { value: 'departments', label: 'Department Performance', icon: <BusinessIcon fontSize="small" /> },
    { value: 'topics', label: 'Topic Performance', icon: <PsychologyIcon fontSize="small" /> },
    { value: 'questions', label: 'Question Analysis', icon: <QuizIcon fontSize="small" /> },
    { value: 'coding', label: 'Coding Assessments', icon: <CodeIcon fontSize="small" /> },
    { value: 'funnel', label: 'Placement Funnel', icon: <TrendingUpIcon fontSize="small" /> },
  ];

  const currentData = reportData as any;
  const currentRows: any[] = currentData?.rows || [];
  const currentStages: any[] = currentData?.stages || [];
  const currentPagination = currentData?.pagination;

  return (
    <Box>
      {/* Header Banner */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" color="primary.light" fontWeight={700} letterSpacing={1.2}>
          Institutional Audit & Export Module • Phase 9
        </Typography>
        <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em" sx={{ mb: 1 }}>
          Placement Reports, Exports & Printing Center
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Generate official placement audit reports, psychometric evaluations, department scorecards, and multi-format exports (Excel, CSV, PDF, Print HTML).
        </Typography>
      </Box>

      {/* Main Admin Navigation */}
      <AdminNavTabs />

      {/* Report Selector Tabs */}
      <Paper sx={{ mb: 3, bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Tabs
          value={selectedReport}
          onChange={(_, val) => {
            setSelectedReport(val);
            setPage(1);
          }}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.88rem',
              py: 1.5,
              display: 'flex',
              flexDirection: 'row',
              gap: 1,
            },
          }}
        >
          {reportTabs.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} iconPosition="start" />
          ))}
        </Tabs>
      </Paper>

      {/* Action Bar & Filter Section */}
      <Card sx={{ mb: 3, bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <CardContent sx={{ py: 2 }}>
          {/* Export Buttons */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              mb: 2,
              pb: 2,
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterAltIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={700}>
                Report Filters & Parameters
              </Typography>
            </Box>

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
                PDF Document
              </Button>
              <Button
                variant="contained"
                size="small"
                color="primary"
                startIcon={exportLoading === 'html' ? <CircularProgress size={16} /> : <PrintIcon />}
                disabled={Boolean(exportLoading)}
                onClick={() => handleExport('html')}
              >
                Print Preview
              </Button>
            </Box>
          </Box>

          {/* Filter Inputs */}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Student Search"
                placeholder="Name, Reg No, Email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                size="small"
                select
                label="Result Status"
                value={isPassed}
                onChange={(e) => setIsPassed(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="true">Passed Only</MenuItem>
                <MenuItem value="false">Failed Only</MenuItem>
              </TextField>
            </Grid>

            {(selectedReport === 'topics' || selectedReport === 'questions') && (
              <Grid item xs={6} sm={3} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="QUANTITATIVE_APTITUDE">Quantitative Aptitude</MenuItem>
                  <MenuItem value="LOGICAL_REASONING">Logical Reasoning</MenuItem>
                  <MenuItem value="VERBAL_ABILITY">Verbal Ability</MenuItem>
                  <MenuItem value="TECHNICAL_MCQ">Technical MCQ</MenuItem>
                  <MenuItem value="CODING">Coding Challenge</MenuItem>
                </TextField>
              </Grid>
            )}

            <Grid item xs={6} sm={3} md={2}>
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

            <Grid item xs={6} sm={3} md={2}>
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

            <Grid item xs={12} sm={6} md={1} sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Clear Filters">
                <IconButton size="small" onClick={handleClearFilters} color="inherit">
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh Data">
                <IconButton size="small" onClick={() => refetch()} color="primary">
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : 'Failed to fetch report data from server'}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* KPI Summary Cards */}
          {reportData?.summary && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {Object.entries(reportData.summary).map(([key, val]) => (
                <Grid item xs={6} sm={4} md={2.4} key={key}>
                  <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Typography>
                      <Typography variant="h6" fontWeight={800} sx={{ mt: 0.5 }}>
                        {typeof val === 'number' && key.toLowerCase().includes('rate')
                          ? `${val}%`
                          : typeof val === 'number' && key.toLowerCase().includes('percentage')
                          ? `${val}%`
                          : String(val)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Report Data Table */}
          <TableContainer
            component={Paper}
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 2,
              mb: 3,
            }}
          >
            <Table size="small">
              <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)' }}>
                {selectedReport === 'students' && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Register No</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Dept</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Class</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Completed</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Marks</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Average %</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Accuracy</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                )}

                {selectedReport === 'assessments' && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Assessment</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Register No</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Candidate</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Dept</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Marks</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Score %</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Accuracy</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Result</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Submitted At</TableCell>
                  </TableRow>
                )}

                {selectedReport === 'departments' && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Department Name</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Enrolled</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Attempts</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Passed</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Pass Rate</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Average %</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Accuracy</TableCell>
                  </TableRow>
                )}

                {selectedReport === 'topics' && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Topic Name</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Questions</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Attempts</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Correct</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Accuracy %</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Proficiency</TableCell>
                  </TableRow>
                )}

                {selectedReport === 'questions' && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Question Text</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Topic</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Difficulty</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Appeared</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Answered</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Success %</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Rating</TableCell>
                  </TableRow>
                )}

                {selectedReport === 'coding' && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Candidate</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Register No</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Assessment</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Challenge</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Lang</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Tests Passed</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Exec Time</TableCell>
                  </TableRow>
                )}

                {selectedReport === 'funnel' && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Funnel Stage</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Candidate Count</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Stage %</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Drop-off %</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Module Status</TableCell>
                  </TableRow>
                )}
              </TableHead>

              <TableBody>
                {/* 1. Students Table */}
                {selectedReport === 'students' &&
                  currentRows.map((r: any) => (
                    <TableRow key={r.studentId} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.registerNumber}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{r.studentName}</TableCell>
                      <TableCell>{r.departmentCode}</TableCell>
                      <TableCell>{r.className || r.sectionName || '-'}</TableCell>
                      <TableCell align="center">{r.assessmentsCompleted}</TableCell>
                      <TableCell align="right">
                        {r.totalMarksObtained} / {r.totalMarksPossible}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {r.averagePercentage}%
                      </TableCell>
                      <TableCell align="right">{r.averageAccuracy}%</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={r.overallPassed ? 'PASS' : 'FAIL'}
                          color={r.overallPassed ? 'success' : 'error'}
                          sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}

                {/* 2. Assessments Table */}
                {selectedReport === 'assessments' &&
                  currentRows.map((r: any) => (
                    <TableRow key={r.resultId} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{r.assessmentTitle}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{r.registerNumber}</TableCell>
                      <TableCell>{r.studentName}</TableCell>
                      <TableCell>{r.departmentCode}</TableCell>
                      <TableCell align="right">
                        {r.obtainedMarks} / {r.totalMarks}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {r.percentage}%
                      </TableCell>
                      <TableCell align="right">{r.accuracy}%</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={r.isPassed ? 'PASS' : 'FAIL'}
                          color={r.isPassed ? 'success' : 'error'}
                          sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '-'}
                      </TableCell>
                    </TableRow>
                  ))}

                {/* 3. Departments Table */}
                {selectedReport === 'departments' &&
                  currentRows.map((r: any) => (
                    <TableRow key={r.departmentId} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{r.departmentCode}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{r.departmentName}</TableCell>
                      <TableCell align="center">{r.enrolledStudents}</TableCell>
                      <TableCell align="center">{r.totalAttemptsCompleted}</TableCell>
                      <TableCell align="center">{r.totalPassed}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {r.passRate}%
                      </TableCell>
                      <TableCell align="right">{r.averagePercentage}%</TableCell>
                      <TableCell align="right">{r.averageAccuracy}%</TableCell>
                    </TableRow>
                  ))}

                {/* 4. Topics Table */}
                {selectedReport === 'topics' &&
                  currentRows.map((r: any, idx: number) => (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{r.category.replace(/_/g, ' ')}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{r.topic}</TableCell>
                      <TableCell align="center">{r.totalQuestions}</TableCell>
                      <TableCell align="center">{r.totalAttempts}</TableCell>
                      <TableCell align="center">{r.correctAnswers}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {r.accuracyPercentage}%
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={r.proficiencyRating}
                          color={
                            r.proficiencyRating === 'Strong'
                              ? 'success'
                              : r.proficiencyRating === 'Moderate'
                              ? 'warning'
                              : 'error'
                          }
                          sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}

                {/* 5. Questions Table */}
                {selectedReport === 'questions' &&
                  currentRows.map((r: any) => (
                    <TableRow key={r.questionId} hover>
                      <TableCell sx={{ maxWidth: 280 }}>{r.questionSnippet}</TableCell>
                      <TableCell>{r.category.replace(/_/g, ' ')}</TableCell>
                      <TableCell>{r.topic}</TableCell>
                      <TableCell>
                        <Chip size="small" label={r.difficulty} variant="outlined" sx={{ fontSize: '0.7rem' }} />
                      </TableCell>
                      <TableCell align="center">{r.timesAppeared}</TableCell>
                      <TableCell align="center">{r.timesAnswered}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {r.successRatePercentage}%
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>{r.discriminationRating}</TableCell>
                    </TableRow>
                  ))}

                {/* 6. Coding Table */}
                {selectedReport === 'coding' &&
                  currentRows.map((r: any) => (
                    <TableRow key={r.submissionId} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{r.studentName}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{r.registerNumber}</TableCell>
                      <TableCell>{r.assessmentTitle}</TableCell>
                      <TableCell>{r.questionTopic}</TableCell>
                      <TableCell>
                        <Chip size="small" label={r.language} sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={r.status}
                          color={r.status === 'ACCEPTED' ? 'success' : 'error'}
                          sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {r.passedTestCount} / {r.totalTestCount}
                      </TableCell>
                      <TableCell align="right">
                        {r.executionTime !== null ? `${r.executionTime}s` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}

                {/* 7. Funnel Table */}
                {selectedReport === 'funnel' &&
                  currentStages.map((s: any) => (
                    <TableRow key={s.stage} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{s.stage}</TableCell>
                      <TableCell align="center" sx={{ fontSize: '1rem', fontWeight: 800 }}>
                        {s.count}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {s.percentage}%
                      </TableCell>
                      <TableCell align="right">{s.dropOffRate}%</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={s.isImplemented ? 'IMPLEMENTED' : 'NOT IMPLEMENTED (PHASE 9+)'}
                          color={s.isImplemented ? 'success' : 'default'}
                          variant="outlined"
                          sx={{ fontSize: '0.72rem' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}

                {/* Empty State */}
                {currentRows.length === 0 && currentStages.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        No report records found matching the specified parameters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Controls */}
          {currentPagination && currentPagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Pagination
                count={currentPagination.totalPages}
                page={page}
                onChange={(_, val) => setPage(val)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default AdminReportsPage;
