import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BusinessIcon from '@mui/icons-material/Business';
import { DataTable, Column } from '../../components/management/DataTable.js';
import { ConfirmDialog } from '../../components/management/ConfirmDialog.js';
import { assessmentService } from '../../services/assessment.service.js';
import { companyService } from '../../services/company.service.js';
import {
  AssessmentDto,
  AssessmentStatus,
  AssessmentQueryFilters,
} from '../../types/assessment.types.js';
import { CompanyDto } from '../../types/company.types.js';

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
  const [companyFilter, setCompanyFilter] = useState<string>('ALL');
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const sortBy = 'createdAt';
  const sortOrder: 'asc' | 'desc' = 'desc';

  // Load Companies for Filter
  useEffect(() => {
    companyService
      .getCompanies({ limit: 100, isActive: true })
      .then((res) => {
        setCompanies(Array.isArray(res?.data) ? res.data : []);
      })
      .catch(() => setCompanies([]));
  }, []);

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
        companyId:
          companyFilter !== 'ALL' && companyFilter !== 'GENERAL'
            ? companyFilter
            : undefined,
        isCompanyAssessment:
          companyFilter === 'GENERAL' ? false : undefined,
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
  }, [page, rowsPerPage, search, statusTab, companyFilter, sortBy, sortOrder]);

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

  const renderStatusChip = (status: AssessmentStatus) => {
    let bg = '#f1f5f9';
    let color = '#475569';
    let border = '#cbd5e1';

    if (status === 'PUBLISHED') {
      bg = '#ecfdf5';
      color = '#047857';
      border = '#a7f3d0';
    } else if (status === 'SCHEDULED') {
      bg = '#eff6ff';
      color = '#0369a1';
      border = '#bfdbfe';
    } else if (status === 'DRAFT') {
      bg = '#fef3c7';
      color = '#b45309';
      border = '#fde68a';
    }

    return (
      <Chip
        label={status}
        size="small"
        sx={{
          fontWeight: 700,
          fontSize: '0.7rem',
          borderRadius: '4px',
          backgroundColor: bg,
          color,
          border: `1px solid ${border}`,
        }}
      />
    );
  };

  // Table Columns
  const columns: Column<AssessmentDto>[] = [
    {
      id: 'name',
      label: 'Assessment Title',
      minWidth: 260,
      render: (row) => (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
              {row.name}
            </Typography>
            {row.company && (
              <Chip
                icon={<BusinessIcon sx={{ fontSize: '13px !important' }} />}
                label={row.company.code}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  backgroundColor: '#eff6ff',
                  color: '#0f3674',
                  border: '1px solid #bfdbfe',
                  borderRadius: '3px',
                }}
              />
            )}
            {row.isCompanyAssessment && !row.company && (
              <Chip
                icon={<BusinessIcon sx={{ fontSize: '13px !important' }} />}
                label="Company Mock"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  backgroundColor: '#eff6ff',
                  color: '#0f3674',
                  borderRadius: '3px',
                }}
              />
            )}
          </Box>
          {row.description && (
            <Typography
              variant="caption"
              sx={{
                color: '#64748b',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mt: 0.25,
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
      minWidth: 120,
      render: (row) => renderStatusChip(row.status),
    },
    {
      id: 'duration',
      label: 'Duration & Attempts',
      minWidth: 140,
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>{row.duration} mins</Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Max Attempts: {row.maximumAttempts}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'numberOfPapers',
      label: 'Paper Sets',
      minWidth: 110,
      render: (row) => (
        <Chip
          label={`${row.numberOfPapers} ${row.numberOfPapers === 1 ? 'Paper Set' : 'Paper Sets'}`}
          size="small"
          sx={{
            fontSize: '0.72rem',
            fontWeight: 600,
            color: '#0369a1',
            borderColor: '#bfdbfe',
            backgroundColor: '#eff6ff',
            borderRadius: '4px',
            border: '1px solid #bfdbfe',
          }}
        />
      ),
    },
    {
      id: 'totalQuestions',
      label: 'Questions & Pass Mark',
      minWidth: 160,
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
            {row.totalQuestions} Questions
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Total: {row.totalMarks} Marks ({row.passingPercentage}% to pass)
          </Typography>
        </Box>
      ),
    },
    {
      id: 'schedule',
      label: 'Schedule Window',
      minWidth: 150,
      render: (row) => {
        if (!row.startDate && !row.endDate) {
          return <Typography variant="caption" sx={{ color: '#94a3b8' }}>Unscheduled (Immediate)</Typography>;
        }
        return (
          <Box>
            <Typography variant="caption" display="block" sx={{ color: '#1e293b', fontWeight: 600 }}>
              {row.startDate ? new Date(row.startDate).toLocaleDateString() : 'Immediate'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
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
      minWidth: 110,
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
          <Tooltip title="View & Configure Assessment">
            <IconButton
              size="small"
              onClick={() => navigate(`/admin/assessments/${row.id}`)}
              sx={{ color: '#0f3674' }}
            >
              <VisibilityIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Assessment">
            <span>
              <IconButton
                size="small"
                onClick={() => setDeleteTarget(row)}
                disabled={row.status === 'PUBLISHED'}
                sx={{ color: '#dc2626' }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      {/* Enterprise Header */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.5 }}>
            <AssignmentIcon sx={{ fontSize: 24, color: '#0f3674' }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
              Assessment Management & Engine
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Configure multi-component placement evaluations, enforce monthly no-repeat rules, and generate deterministic test papers.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.25 }}>
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
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/assessments/create')}
          >
            Build Assessment
          </Button>
        </Box>
      </Box>

      {/* Metric Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
            }}
          >
            <CardContent sx={{ p: '0 !important' }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, letterSpacing: '0.04em' }}>
                TOTAL ASSESSMENTS
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', mt: 0.5, mb: 0.5 }}>
                {totalCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Configured across all tracks
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
            }}
          >
            <CardContent sx={{ p: '0 !important' }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, letterSpacing: '0.04em' }}>
                PUBLISHED & ACTIVE
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#047857', mt: 0.5, mb: 0.5 }}>
                {publishedCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#047857', display: 'flex', alignItems: 'center' }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 13, mr: 0.5 }} /> Ready for student attempts
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
            }}
          >
            <CardContent sx={{ p: '0 !important' }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, letterSpacing: '0.04em' }}>
                UPCOMING SCHEDULED
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0369a1', mt: 0.5, mb: 0.5 }}>
                {scheduledCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Timed placement drives
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
            }}
          >
            <CardContent sx={{ p: '0 !important' }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, letterSpacing: '0.04em' }}>
                DRAFTS IN PROGRESS
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#b45309', mt: 0.5, mb: 0.5 }}>
                {draftCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Under section authoring
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filter Tabs & Search Bar */}
      <Box
        sx={{
          p: 2,
          mb: 2.5,
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <Tabs
              value={statusTab}
              onChange={(_, val) => {
                setStatusTab(val);
                setPage(0);
              }}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 36,
                '& .MuiTab-root': {
                  minHeight: 36,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 1.5,
                },
              }}
            >
              <Tab label="All Statuses" value="ALL" />
              <Tab label="Draft" value="DRAFT" />
              <Tab label="Scheduled" value="SCHEDULED" />
              <Tab label="Published" value="PUBLISHED" />
              <Tab label="Archived" value="ARCHIVED" />
            </Tabs>
          </Grid>

          <Grid item xs={12} sm={6} md={3.5}>
            <FormControl fullWidth size="small">
              <InputLabel id="company-filter-label">Recruiter Track</InputLabel>
              <Select
                labelId="company-filter-label"
                value={companyFilter}
                label="Recruiter Track"
                onChange={(e) => {
                  setCompanyFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Tracks (General + Company)</MenuItem>
                <MenuItem value="GENERAL">General Assessments Only</MenuItem>
                {companies.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3.5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search assessments..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Assessment DataTable */}
      <DataTable
        columns={columns}
        data={assessments}
        totalCount={totalCount}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(newPage) => setPage(newPage)}
        onRowsPerPageChange={(newRows) => {
          setRowsPerPage(newRows);
          setPage(0);
        }}
        emptyMessage="No assessments found matching the configured criteria."
      />

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
