import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Paper,
  Radio,
  Checkbox,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import { DataTable, Column } from '../../components/management/DataTable.js';
import { ConfirmDialog } from '../../components/management/ConfirmDialog.js';
import { questionService } from '../../services/question.service.js';
import {
  Question,
  CreateQuestionInput,
  UpdateQuestionInput,
  QuestionCategory,
  QuestionDifficulty,
  QuestionType,
  QuestionStatus,
  CATEGORY_TOPICS_MAP,
  CreateQuestionOptionInput,
} from '../../types/question.types.js';

export const QuestionsPage: React.FC = () => {
  // Data & Pagination
  const [questions, setQuestions] = useState<Question[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const urlCompanyId = searchParams.get('companyId') || '';
  const [companyFilter, setCompanyFilter] = useState<string>(urlCompanyId);

  // Search, Filters & Sorting
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<QuestionCategory | ''>('');
  const [topicFilter, setTopicFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<QuestionDifficulty | ''>('');
  const [typeFilter, setTypeFilter] = useState<QuestionType | ''>('');
  const [statusFilter, setStatusFilter] = useState<QuestionStatus | ''>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Detail View Dialog
  const [viewQuestion, setViewQuestion] = useState<Question | null>(null);

  // Create / Edit Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [formCategory, setFormCategory] = useState<QuestionCategory>('QUANTITATIVE_APTITUDE');
  const [formTopic, setFormTopic] = useState<string>('Percentage');
  const [formDifficulty, setFormDifficulty] = useState<QuestionDifficulty>('MEDIUM');
  const [formType, setFormType] = useState<QuestionType>('SINGLE_CHOICE');
  const [formText, setFormText] = useState<string>('');
  const [formMarks, setFormMarks] = useState<number>(1.0);
  const [formNegativeMarks, setFormNegativeMarks] = useState<number>(0.0);
  const [formCorrectAnswer, setFormCorrectAnswer] = useState<string>('');
  const [formExplanation, setFormExplanation] = useState<string>('');
  const [formStatus, setFormStatus] = useState<QuestionStatus>('ACTIVE');
  const [formOptions, setFormOptions] = useState<CreateQuestionOptionInput[]>([
    { optionText: '', optionOrder: 1, isCorrect: true },
    { optionText: '', optionOrder: 2, isCorrect: false },
    { optionText: '', optionOrder: 3, isCorrect: false },
    { optionText: '', optionOrder: 4, isCorrect: false },
  ]);

  // Delete Dialog
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch Questions
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await questionService.getQuestions({
        page: page + 1,
        limit: rowsPerPage,
        search: search.trim() || undefined,
        category: categoryFilter || undefined,
        topic: topicFilter.trim() || undefined,
        difficulty: difficultyFilter || undefined,
        questionType: typeFilter || undefined,
        status: statusFilter || undefined,
        companyId: companyFilter || undefined,
        sortBy: sortBy as 'createdAt' | 'marks' | 'difficulty' | 'questionType' | 'category',
        sortOrder,
      });
      setQuestions(res.data);
      setTotalCount(res.pagination.totalCount);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'Failed to fetch questions';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, categoryFilter, topicFilter, difficultyFilter, typeFilter, statusFilter, companyFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Dynamic available topics based on chosen category
  const filterTopics = categoryFilter ? CATEGORY_TOPICS_MAP[categoryFilter] : [];
  const formAvailableTopics = CATEGORY_TOPICS_MAP[formCategory] || [];

  // Reset or initialize options when Question Type changes in form
  const handleTypeChange = (newType: QuestionType) => {
    setFormType(newType);
    if (newType === 'TRUE_FALSE') {
      setFormOptions([
        { optionText: 'True', optionOrder: 1, isCorrect: true },
        { optionText: 'False', optionOrder: 2, isCorrect: false },
      ]);
    } else if (newType === 'SINGLE_CHOICE' || newType === 'MULTIPLE_CHOICE') {
      if (formOptions.length < 2) {
        setFormOptions([
          { optionText: '', optionOrder: 1, isCorrect: true },
          { optionText: '', optionOrder: 2, isCorrect: false },
        ]);
      }
    } else {
      setFormOptions([]);
    }
  };

  const handleOpenDialog = (q?: Question) => {
    setFormError(null);
    if (q) {
      setEditingQuestion(q);
      setFormCategory(q.category);
      setFormTopic(q.topic);
      setFormDifficulty(q.difficulty);
      setFormType(q.questionType);
      setFormText(q.questionText);
      setFormMarks(q.marks);
      setFormNegativeMarks(q.negativeMarks);
      setFormCorrectAnswer(q.correctAnswer || '');
      setFormExplanation(q.explanation || '');
      setFormStatus(q.status);
      setFormOptions(
        q.options.map((o) => ({
          optionText: o.optionText,
          optionOrder: o.optionOrder,
          isCorrect: o.isCorrect,
        }))
      );
    } else {
      setEditingQuestion(null);
      const defaultCat: QuestionCategory = categoryFilter || 'QUANTITATIVE_APTITUDE';
      const defaultTopic = CATEGORY_TOPICS_MAP[defaultCat][0] || 'Percentage';
      setFormCategory(defaultCat);
      setFormTopic(defaultTopic);
      setFormDifficulty('MEDIUM');
      setFormType('SINGLE_CHOICE');
      setFormText('');
      setFormMarks(1.0);
      setFormNegativeMarks(0.25);
      setFormCorrectAnswer('');
      setFormExplanation('');
      setFormStatus('ACTIVE');
      setFormOptions([
        { optionText: '', optionOrder: 1, isCorrect: true },
        { optionText: '', optionOrder: 2, isCorrect: false },
        { optionText: '', optionOrder: 3, isCorrect: false },
        { optionText: '', optionOrder: 4, isCorrect: false },
      ]);
    }
    setDialogOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Client side option validation before submission
    if (formType === 'SINGLE_CHOICE' || formType === 'MULTIPLE_CHOICE' || formType === 'TRUE_FALSE') {
      const emptyOpt = formOptions.some((o) => !o.optionText.trim());
      if (emptyOpt) {
        setFormError('All options must have non-empty text');
        return;
      }
      const correctCount = formOptions.filter((o) => o.isCorrect).length;
      if (formType === 'SINGLE_CHOICE' && correctCount !== 1) {
        setFormError(`SINGLE_CHOICE requires exactly 1 correct option (selected: ${correctCount})`);
        return;
      }
      if (formType === 'MULTIPLE_CHOICE' && correctCount < 1) {
        setFormError('MULTIPLE_CHOICE requires at least 1 correct option');
        return;
      }
      if (formType === 'TRUE_FALSE' && correctCount !== 1) {
        setFormError('TRUE_FALSE requires exactly 1 correct option');
        return;
      }
    } else if (formType === 'FILL_BLANK' && !formCorrectAnswer.trim()) {
      setFormError('FILL_BLANK questions require an exact Correct Answer');
      return;
    }

    setSaving(true);
    try {
      const payload: CreateQuestionInput = {
        category: formCategory,
        topic: formTopic,
        difficulty: formDifficulty,
        questionType: formType,
        questionText: formText.trim(),
        marks: Number(formMarks),
        negativeMarks: Number(formNegativeMarks),
        correctAnswer: formCorrectAnswer.trim() || undefined,
        explanation: formExplanation.trim() || undefined,
        status: formStatus,
        options:
          formType === 'FILL_BLANK' || formType === 'DESCRIPTIVE'
            ? []
            : formOptions.map((o, idx) => ({
              optionText: o.optionText.trim(),
              optionOrder: idx + 1,
              isCorrect: o.isCorrect,
            })),
      };

      if (editingQuestion) {
        await questionService.updateQuestion(editingQuestion.id, payload as UpdateQuestionInput);
      } else {
        await questionService.createQuestion(payload);
      }

      setDialogOpen(false);
      setEditingQuestion(null);
      fetchQuestions();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'Failed to save question';
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (q: Question) => {
    const newStatus: QuestionStatus = q.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await questionService.updateQuestionStatus(q.id, newStatus);
      fetchQuestions();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'Failed to toggle status';
      setError(msg);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await questionService.deleteQuestion(deleteTarget.id);
      setDeleteTarget(null);
      fetchQuestions();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'Failed to delete question';
      setError(msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleSortChange = (colId: string) => {
    if (sortBy === colId) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(colId);
      setSortOrder('asc');
    }
  };

  const columns: Column<Question>[] = [
    {
      id: 'questionText',
      label: 'Question',
      minWidth: 260,
      render: (q) => (
        <div>
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              cursor: 'pointer',
              '&:hover': { color: 'primary.light' },
            }}
            onClick={() => setViewQuestion(q)}
          >
            {q.questionText}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {q.options.length > 0 ? `${q.options.length} Options` : q.questionType}
          </Typography>
        </div>
      ),
    },
    {
      id: 'category',
      label: 'Category & Topic',
      minWidth: 180,
      sortable: true,
      render: (q) => (
        <div>
          <Chip
            label={q.category.replace('_', ' ')}
            size="small"
            color={
              q.category === 'TECHNICAL_MCQ'
                ? 'primary'
                : q.category === 'CODING'
                  ? 'secondary'
                  : q.category === 'QUANTITATIVE_APTITUDE'
                    ? 'info'
                    : 'default'
            }
            sx={{ fontWeight: 700, fontSize: '0.7rem', height: 20, mb: 0.5 }}
          />
          <Typography variant="body2" color="text.secondary">
            {q.topic}
          </Typography>
        </div>
      ),
    },
    {
      id: 'difficulty',
      label: 'Difficulty',
      minWidth: 100,
      sortable: true,
      render: (q) => {
        const color =
          q.difficulty === 'EASY' ? 'success' : q.difficulty === 'MEDIUM' ? 'warning' : 'error';
        return <Chip label={q.difficulty} size="small" color={color} sx={{ fontWeight: 700 }} />;
      },
    },
    {
      id: 'questionType',
      label: 'Type',
      minWidth: 130,
      sortable: true,
      render: (q) => (
        <Chip
          label={q.questionType.replace('_', ' ')}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600, fontSize: '0.72rem' }}
        />
      ),
    },
    {
      id: 'marks',
      label: 'Marks',
      minWidth: 90,
      sortable: true,
      render: (q) => (
        <div>
          <Typography variant="body2" fontWeight={700} color="primary.light">
            +{q.marks}
          </Typography>
          {q.negativeMarks > 0 && (
            <Typography variant="caption" color="error.light">
              -{q.negativeMarks}
            </Typography>
          )}
        </div>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 110,
      render: (q) => (
        <Tooltip title={`Click to ${q.status === 'ACTIVE' ? 'deactivate' : 'activate'}`}>
          <Chip
            label={q.status}
            size="small"
            color={q.status === 'ACTIVE' ? 'success' : 'default'}
            sx={{ fontWeight: 700, cursor: 'pointer' }}
            onClick={() => handleToggleStatus(q)}
          />
        </Tooltip>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 130,
      align: 'right',
      render: (q) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Tooltip title="View Question Details">
            <IconButton size="small" onClick={() => setViewQuestion(q)} sx={{ color: 'secondary.light' }}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Question">
            <IconButton size="small" onClick={() => handleOpenDialog(q)} sx={{ color: 'primary.light' }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Question">
            <IconButton size="small" onClick={() => setDeleteTarget(q)} sx={{ color: 'error.light' }}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <div>
          <Typography variant="overline" sx={{ color: '#0f3674', fontWeight: 700, letterSpacing: '0.06em' }}>
            ASSESSMENT AUTHORING ENGINE
          </Typography>
          <Typography variant="h5" fontWeight={700} sx={{ color: '#0f172a', mb: 0.5 }}>
            Authoritative Question Bank
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Multi-component repository with category tagging, difficulty levels, and automated test set generation.
          </Typography>
        </div>

        <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchQuestions}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Create Question
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {companyFilter && (
        <Alert
          severity="info"
          sx={{ mb: 2.5, alignItems: 'center' }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                setCompanyFilter('');
                setSearchParams({});
              }}
            >
              Clear Filter
            </Button>
          }
        >
          Filtering Question Bank by Company Track ID: <strong>{companyFilter}</strong>
        </Alert>
      )}

      {/* Filter Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2.5,
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <FilterListIcon sx={{ color: '#0f3674', fontSize: 18 }} />
          <Typography variant="subtitle2" fontWeight={700} color="#0f172a">
            Multi-Parameter Question Filter
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl size="small" fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => {
                  setCategoryFilter(e.target.value as QuestionCategory | '');
                  setTopicFilter('');
                  setPage(0);
                }}
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="QUANTITATIVE_APTITUDE">Quantitative Aptitude</MenuItem>
                <MenuItem value="LOGICAL_REASONING">Logical Reasoning</MenuItem>
                <MenuItem value="VERBAL_ABILITY">Verbal Ability</MenuItem>
                <MenuItem value="TECHNICAL_MCQ">Technical MCQ</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl size="small" fullWidth>
              <InputLabel>Topic</InputLabel>
              <Select
                value={topicFilter}
                label="Topic"
                disabled={!categoryFilter}
                onChange={(e) => {
                  setTopicFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All Topics</MenuItem>
                {filterTopics.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={difficultyFilter}
                label="Difficulty"
                onChange={(e) => {
                  setDifficultyFilter(e.target.value as QuestionDifficulty | '');
                  setPage(0);
                }}
              >
                <MenuItem value="">All Difficulties</MenuItem>
                <MenuItem value="EASY">Easy</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HARD">Hard</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Question Type</InputLabel>
              <Select
                value={typeFilter}
                label="Question Type"
                onChange={(e) => {
                  setTypeFilter(e.target.value as QuestionType | '');
                  setPage(0);
                }}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="SINGLE_CHOICE">Single Choice</MenuItem>
                <MenuItem value="MULTIPLE_CHOICE">Multiple Choice</MenuItem>
                <MenuItem value="TRUE_FALSE">True / False</MenuItem>
                <MenuItem value="FILL_BLANK">Fill in Blank</MenuItem>
                <MenuItem value="DESCRIPTIVE">Descriptive</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={1.6}>
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => {
                  setStatusFilter(e.target.value as QuestionStatus | '');
                  setPage(0);
                }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                <MenuItem value="DRAFT">DRAFT</MenuItem>
                <MenuItem value="ARCHIVED">ARCHIVED</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={1.6}>
            <Button
              variant="outlined"
              color="inherit"
              fullWidth
              startIcon={<RefreshIcon />}
              onClick={() => {
                setSearch('');
                setCategoryFilter('');
                setTopicFilter('');
                setDifficultyFilter('');
                setTypeFilter('');
                setStatusFilter('');
                setPage(0);
              }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Question DataTable */}
      <DataTable
        columns={columns}
        data={questions}
        loading={loading}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        searchValue={search}
        searchPlaceholder="Search question text or topic..."
        onSearchChange={(val) => {
          setSearch(val);
          setPage(0);
        }}
        onPageChange={(newPage) => setPage(newPage)}
        onRowsPerPageChange={(newLimit) => {
          setRowsPerPage(newLimit);
          setPage(0);
        }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        emptyMessage="No assessment questions found matching criteria."
      />

      {/* Create / Edit Question Modal */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1)',
          },
        }}
      >
        <form onSubmit={handleSaveQuestion}>
          <DialogTitle
            sx={{
              color: '#0f172a',
              fontWeight: 700,
              fontSize: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #e2e8f0',
              pb: 2,
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700} color="#0f172a">
                {editingQuestion ? 'Edit Assessment Question' : 'Author New Assessment Question'}
              </Typography>
              <Typography variant="caption" color="#64748b">
                Configure question classification, scoring weights, prompt, and answer choices.
              </Typography>
            </Box>
            <IconButton onClick={() => setDialogOpen(false)} size="small" sx={{ color: '#64748b' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 3, pb: 3 }}>
            {formError && (
              <Alert severity="error" variant="outlined" onClose={() => setFormError(null)}>
                {formError}
              </Alert>
            )}

            {/* SECTION 1: Classification & Scoring */}
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 2,
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} color="#0f172a" sx={{ mb: 2 }}>
                1. Question Classification & Scoring
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Category"
                    required
                    fullWidth
                    value={formCategory}
                    onChange={(e) => {
                      const newCat = e.target.value as QuestionCategory;
                      setFormCategory(newCat);
                      const defaultTopic = CATEGORY_TOPICS_MAP[newCat][0] || '';
                      setFormTopic(defaultTopic);
                    }}
                  >
                    <MenuItem value="QUANTITATIVE_APTITUDE">Quantitative Aptitude</MenuItem>
                    <MenuItem value="LOGICAL_REASONING">Logical Reasoning</MenuItem>
                    <MenuItem value="VERBAL_ABILITY">Verbal Ability</MenuItem>
                    <MenuItem value="TECHNICAL_MCQ">Technical MCQ</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Authoritative Topic"
                    required
                    fullWidth
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value)}
                  >
                    {formAvailableTopics.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    label="Difficulty"
                    required
                    fullWidth
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as QuestionDifficulty)}
                  >
                    <MenuItem value="EASY">Easy</MenuItem>
                    <MenuItem value="MEDIUM">Medium</MenuItem>
                    <MenuItem value="HARD">Hard</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    label="Question Type"
                    required
                    fullWidth
                    value={formType}
                    onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
                  >
                    <MenuItem value="SINGLE_CHOICE">Single Choice (1 Correct)</MenuItem>
                    <MenuItem value="MULTIPLE_CHOICE">Multiple Choice (1+ Correct)</MenuItem>
                    <MenuItem value="TRUE_FALSE">True / False</MenuItem>
                    <MenuItem value="FILL_BLANK">Fill in the Blank</MenuItem>
                    <MenuItem value="DESCRIPTIVE">Descriptive</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    label="Status"
                    required
                    fullWidth
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as QuestionStatus)}
                  >
                    <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                    <MenuItem value="DRAFT">DRAFT</MenuItem>
                    <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                    <MenuItem value="ARCHIVED">ARCHIVED</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Marks (Positive)"
                    type="number"
                    required
                    fullWidth
                    inputProps={{ min: 0.25, max: 50, step: 0.25 }}
                    value={formMarks}
                    onChange={(e) => setFormMarks(Number(e.target.value))}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Negative Marks"
                    type="number"
                    required
                    fullWidth
                    inputProps={{ min: 0, max: formMarks, step: 0.25 }}
                    value={formNegativeMarks}
                    onChange={(e) => setFormNegativeMarks(Number(e.target.value))}
                    helperText={`Deducted on incorrect answer (Max: ${formMarks})`}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* SECTION 2: Question Statement / Prompt */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="#0f172a" sx={{ mb: 1 }}>
                2. Question Statement / Prompt
              </Typography>
              <TextField
                label="Question Text"
                required
                fullWidth
                multiline
                rows={3}
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                placeholder="Enter the complete question prompt, code snippet, or scenario..."
              />
            </Box>

            {/* SECTION 3: Dynamic Options Management */}
            {(formType === 'SINGLE_CHOICE' || formType === 'MULTIPLE_CHOICE' || formType === 'TRUE_FALSE') && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="#0f172a">
                      3. Options & Correct Answer Selection
                    </Typography>
                    <Typography variant="caption" color="#64748b">
                      Mark the correct option using the selector on the left.
                    </Typography>
                  </Box>
                  {formType !== 'TRUE_FALSE' && formOptions.length < 6 && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() =>
                        setFormOptions([
                          ...formOptions,
                          { optionText: '', optionOrder: formOptions.length + 1, isCorrect: false },
                        ])
                      }
                      sx={{ bgcolor: '#ffffff' }}
                    >
                      Add Option
                    </Button>
                  )}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {formOptions.map((opt, idx) => (
                    <Paper
                      key={idx}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        backgroundColor: opt.isCorrect ? '#f0fdf4' : '#ffffff',
                        border: opt.isCorrect ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                        borderRadius: 2,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {formType === 'SINGLE_CHOICE' || formType === 'TRUE_FALSE' ? (
                        <Radio
                          checked={opt.isCorrect}
                          color="success"
                          onChange={() => {
                            const updated = formOptions.map((o, i) => ({
                              ...o,
                              isCorrect: i === idx,
                            }));
                            setFormOptions(updated);
                          }}
                        />
                      ) : (
                        <Checkbox
                          checked={opt.isCorrect}
                          color="success"
                          onChange={(e) => {
                            const updated = [...formOptions];
                            updated[idx].isCorrect = e.target.checked;
                            setFormOptions(updated);
                          }}
                        />
                      )}

                      <TextField
                        size="small"
                        fullWidth
                        disabled={formType === 'TRUE_FALSE'}
                        label={`Option ${idx + 1}`}
                        value={opt.optionText}
                        onChange={(e) => {
                          const updated = [...formOptions];
                          updated[idx].optionText = e.target.value;
                          setFormOptions(updated);
                        }}
                        placeholder={`Enter Option ${idx + 1} text`}
                      />

                      {formType !== 'TRUE_FALSE' && formOptions.length > 2 && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            const updated = formOptions.filter((_, i) => i !== idx);
                            setFormOptions(updated);
                          }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Paper>
                  ))}
                </Box>
              </Paper>
            )}

            {/* Fill Blank Correct Answer */}
            {formType === 'FILL_BLANK' && (
              <Box>
                <Typography variant="subtitle2" fontWeight={700} color="#0f172a" sx={{ mb: 1 }}>
                  3. Exact Correct Answer Key
                </Typography>
                <TextField
                  label="Exact Correct Answer"
                  required
                  fullWidth
                  value={formCorrectAnswer}
                  onChange={(e) => setFormCorrectAnswer(e.target.value)}
                  placeholder="Enter exact keyword or phrase expected from student..."
                  helperText="Case-insensitive exact match evaluation against student input"
                />
              </Box>
            )}

            {/* Descriptive Model Criteria */}
            {formType === 'DESCRIPTIVE' && (
              <Box>
                <Typography variant="subtitle2" fontWeight={700} color="#0f172a" sx={{ mb: 1 }}>
                  3. Model Answer & Scoring Rubric
                </Typography>
                <TextField
                  label="Model Answer / Scoring Rubric"
                  fullWidth
                  multiline
                  rows={2}
                  value={formCorrectAnswer}
                  onChange={(e) => setFormCorrectAnswer(e.target.value)}
                  placeholder="Optional grading guidelines or expected points..."
                />
              </Box>
            )}

            {/* SECTION 4: Explanation */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="#0f172a" sx={{ mb: 1 }}>
                4. Solution Explanation & Notes
              </Typography>
              <TextField
                label="Solution Explanation (Provided after assessment)"
                fullWidth
                multiline
                rows={2}
                value={formExplanation}
                onChange={(e) => setFormExplanation(e.target.value)}
                placeholder="Step-by-step reasoning or theoretical derivation..."
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <Button onClick={() => setDialogOpen(false)} variant="outlined" color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={saving} sx={{ px: 3 }}>
              {saving ? <CircularProgress size={20} color="inherit" /> : 'Save Question'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Question Detail Modal */}
      <Dialog
        open={!!viewQuestion}
        onClose={() => setViewQuestion(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1)',
          },
        }}
      >
        {viewQuestion && (
          <>
            <DialogTitle
              sx={{
                color: '#0f172a',
                fontWeight: 700,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #e2e8f0',
                pb: 2,
              }}
            >
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip label={viewQuestion.category.replace('_', ' ')} color="primary" size="small" sx={{ fontWeight: 700 }} />
                <Chip label={viewQuestion.topic} variant="outlined" size="small" sx={{ fontWeight: 600, color: '#334155', borderColor: '#cbd5e1' }} />
                <Chip
                  label={viewQuestion.difficulty}
                  size="small"
                  color={viewQuestion.difficulty === 'EASY' ? 'success' : viewQuestion.difficulty === 'MEDIUM' ? 'warning' : 'error'}
                  sx={{ fontWeight: 700 }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label={`+${viewQuestion.marks} / -${viewQuestion.negativeMarks} Marks`} size="small" sx={{ fontWeight: 700, bgcolor: '#eff6ff', color: '#1d4ed8' }} />
                <IconButton onClick={() => setViewQuestion(null)} size="small" sx={{ color: '#64748b' }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
              <Paper variant="outlined" sx={{ p: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                <Typography variant="caption" fontWeight={700} color="#64748b" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1 }}>
                  Question Statement
                </Typography>
                <Typography variant="body1" fontWeight={600} color="#0f172a" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {viewQuestion.questionText}
                </Typography>
              </Paper>

              {/* Options Breakdown */}
              {viewQuestion.options.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} color="#0f172a" sx={{ mb: 1.5 }}>
                    Options & Correctness Evaluation:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {viewQuestion.options.map((opt) => (
                      <Paper
                        key={opt.id}
                        elevation={0}
                        sx={{
                          p: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          bgcolor: opt.isCorrect ? '#f0fdf4' : '#ffffff',
                          border: opt.isCorrect ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                          borderRadius: 2,
                        }}
                      >
                        {opt.isCorrect ? (
                          <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                        ) : (
                          <Box sx={{ width: 18, height: 18, borderRadius: '50%', border: '1px solid #cbd5e1' }} />
                        )}
                        <Typography variant="body2" color="#0f172a" fontWeight={opt.isCorrect ? 700 : 500}>
                          {opt.optionText}
                        </Typography>
                        {opt.isCorrect && (
                          <Chip label="Correct Answer" size="small" color="success" sx={{ ml: 'auto', height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                        )}
                      </Paper>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Text answer if Fill Blank */}
              {viewQuestion.questionType === 'FILL_BLANK' && viewQuestion.correctAnswer && (
                <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #86efac' }}>
                  <Typography variant="caption" color="#166534" fontWeight={700}>
                    Correct Answer:
                  </Typography>
                  <Typography variant="body1" fontWeight={700} color="#14532d">
                    {viewQuestion.correctAnswer}
                  </Typography>
                </Box>
              )}

              {/* Explanation */}
              {viewQuestion.explanation && (
                <Box sx={{ p: 2, bgcolor: '#eff6ff', borderRadius: 2, border: '1px solid #bfdbfe' }}>
                  <Typography variant="caption" color="#1d4ed8" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <HelpOutlineIcon fontSize="inherit" /> Solution Explanation:
                  </Typography>
                  <Typography variant="body2" color="#1e3a8a" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                    {viewQuestion.explanation}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ borderColor: '#e2e8f0' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="caption" color="#64748b">
                  Assessment Usages: <strong>{viewQuestion._count?.usages ?? 0} times</strong>
                </Typography>
                <Typography variant="caption" color="#64748b">
                  Created: <strong>{new Date(viewQuestion.createdAt).toLocaleDateString()}</strong>
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <Button onClick={() => setViewQuestion(null)} variant="outlined" color="inherit">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Assessment Question"
        message="Are you sure you want to delete this question? Questions that have already been used in institutional assessments are protected and cannot be deleted."
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
};
