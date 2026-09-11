import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Grid,
  Paper,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { AdminNavTabs } from '../../components/management/AdminNavTabs.js';
import { DataTable, Column } from '../../components/management/DataTable.js';
import { ConfirmDialog } from '../../components/management/ConfirmDialog.js';
import { assessmentService } from '../../services/assessment.service.js';
import {
  AssessmentDto,
  AssessmentStatus,
  AssessmentQueryFilters,
} from '../../types/assessment.types.js';

export const AssessmentsPage: React.FC = () => {
  const navigate = useNavigate();

  // Data & Pagination
  const [assessments, setAssessments] = useState<AssessmentDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Tabs
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState<AssessmentStatus | 'ALL'>('ALL');
  const sortBy = 'createdAt';
  const sortOrder: 'asc' | 'desc' = 'desc';

  // Delete Dialog
  const [deleteTarget, setDeleteTarget] = useState<AssessmentDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch Assessments
  const fetchAssessments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: AssessmentQueryFilters = {
        page: page + 1,
        limit: rowsPerPage,
        search: search.trim() || undefined,
        status: statusTab !== 'ALL' ? statusTab : undefined,
        sortBy: sortBy as AssessmentQueryFilters['sortBy'],
        sortOrder,
      };

      const result = await assessmentService.getAssessments(filters);
      setAssessments(result.data);
      setTotalCount(result.pagination.totalCount);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load assessments';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, statusTab, sortBy, sortOrder]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await assessmentService.deleteAssessment(deleteTarget.id);
      setDeleteTarget(null);
      await fetchAssessments();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete assessment';
      setError(msg);
    } finally {
      setDeleting(false);
    }
  };

  // Metrics summary
  const publishedCount = assessments.filter((a) => a.status === 'PUBLISHED').length;
  const scheduledCount = assessments.filter((a) => a.status === 'SCHEDULED').length;
  const draftCount = assessments.filter((a) => a.status === 'DRAFT').length;

  const getStatusColor = (status: AssessmentStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return 'success';
      case 'SCHEDULED':
        return 'info';
      case 'DRAFT':
        return 'warning';
      case 'ARCHIVED':
        return 'default';
      default:
        return 'default';
    }
  };

  // Table Columns
  const columns: Column<AssessmentDto>[] = [
    {
      id: 'name',
      label: 'Assessment',
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#f1f5f9' }}>
            {row.name}
          </Typography>
          {row.description && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {row.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (row) => (
        <Chip
          label={row.status}
          size="small"
          color={getStatusColor(row.status) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
          sx={{ fontWeight: 700, fontSize: '0.72rem' }}
        />
      ),
    },
    {
      id: 'duration',
      label: 'Duration & Attempts',
      render: (row) => (
        <Box>
          <Typography variant="body2">{row.duration} mins</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Max Attempts: {row.maximumAttempts}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'numberOfPapers',
      label: 'Papers / Sets',
      render: (row) => (
        <Chip
          label={`${row.numberOfPapers} ${row.numberOfPapers === 1 ? 'Paper' : 'Papers'}`}
          size="small"
          variant="outlined"
          sx={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
        />
      ),
    },
    {
      id: 'totalQuestions',
      label: 'Questions & Marks',
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.totalQuestions} Questions
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Total: {row.totalMarks} Marks ({row.passingPercentage}% to pass)
          </Typography>
        </Box>
      ),
    },
    {
      id: 'schedule',
      label: 'Schedule',
      render: (row) => {
        if (!row.startDate && !row.endDate) {
          return <Typography variant="caption" sx={{ color: 'text.secondary' }}>Unscheduled</Typography>;
        }
        return (
          <Box>
            <Typography variant="caption" display="block">
              {row.startDate ? new Date(row.startDate).toLocaleDateString() : 'Immediate'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              to {row.endDate ? new Date(row.endDate).toLocaleDateString() : 'Indefinite'}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
          <Tooltip title="View & Manage Assessment">
            <IconButton
              size="small"
              onClick={() => navigate(`/admin/assessments/${row.id}`)}
              sx={{ color: 'primary.light' }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Assessment">
            <span>
              <IconButton
                size="small"
                onClick={() => setDeleteTarget(row)}
                disabled={row.status === 'PUBLISHED'}
                sx={{ color: 'error.main' }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Institutional Nav Tabs */}
      <AdminNavTabs />

      {/* Header Banner */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 4,
        }}
      >
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
            Assessment Management & Engine
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Configure multi-component placement evaluations, enforce monthly no-repeat rules, and generate deterministic test papers.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchAssessments()}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/assessments/create')}
            sx={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
            }}
          >
            Build Assessment
          </Button>
        </Box>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 2,
              background: 'rgba(30, 41, 59, 0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                color: '#38bdf8',
              }}
            >
              <AssignmentIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Total Assessments
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                {totalCount}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 2,
              background: 'rgba(30, 41, 59, 0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                color: '#22c55e',
              }}
            >
              <CheckCircleIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Published Active
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                {publishedCount}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 2,
              background: 'rgba(30, 41, 59, 0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                color: '#0ea5e9',
              }}
            >
              <ScheduleIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Scheduled
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                {scheduledCount}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 2,
              background: 'rgba(30, 41, 59, 0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                backgroundColor: 'rgba(234, 179, 8, 0.1)',
                color: '#eab308',
              }}
            >
              <EditNoteIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Draft In Progress
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                {draftCount}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filter Tabs & Search Bar */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          background: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={7}>
            <Tabs
              value={statusTab}
              onChange={(_, val) => {
                setStatusTab(val);
                setPage(0);
              }}
              textColor="primary"
              indicatorColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="All Statuses" value="ALL" sx={{ textTransform: 'none', fontWeight: 600 }} />
              <Tab label="Draft" value="DRAFT" sx={{ textTransform: 'none', fontWeight: 600 }} />
              <Tab label="Scheduled" value="SCHEDULED" sx={{ textTransform: 'none', fontWeight: 600 }} />
              <Tab label="Published" value="PUBLISHED" sx={{ textTransform: 'none', fontWeight: 600 }} />
              <Tab label="Archived" value="ARCHIVED" sx={{ textTransform: 'none', fontWeight: 600 }} />
            </Tabs>
          </Grid>

          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search assessments by name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Assessment Table */}
      <Paper
        sx={{
          borderRadius: 2,
          background: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataTable
            columns={columns}
            data={assessments}
            totalCount={totalCount}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(newPage) => setPage(newPage)}
            onRowsPerPageChange={(newRows) => {
              setRowsPerPage(newRows);
              setPage(0);
            }}
            emptyMessage="No assessments found matching the configured criteria."
          />
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Assessment"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? All configured sections, generated papers, and assignments will be permanently removed.`}
        confirmText="Delete Assessment"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
};
