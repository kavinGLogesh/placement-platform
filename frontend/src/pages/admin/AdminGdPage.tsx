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
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import GroupsIcon from '@mui/icons-material/Groups';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RateReviewIcon from '@mui/icons-material/RateReview';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useAuth } from '../../hooks/useAuth.js';
import { evaluationService } from '../../services/evaluation.service.js';
import { managementService } from '../../services/management.service.js';
import { StudentSelector } from '../../components/evaluation/StudentSelector.js';
import {
  GdRoundDto,
  GdParticipantDto,
  CriterionConfig,
  DEFAULT_GD_CRITERIA,
  AttendanceStatus,
} from '../../types/evaluation.types.js';

export const AdminGdPage: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // GD Rounds State
  const [rounds, setRounds] = useState<GdRoundDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState<string>('ALL');

  // Hierarchy Data for Targeting
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [courses, setCourses] = useState<Array<{ id: string; name: string }>>([]);

  // Create GD Round Dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newScheduledDate, setNewScheduledDate] = useState('');
  const [newDuration, setNewDuration] = useState(30);
  const [newEvaluatorId, setNewEvaluatorId] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedBatchYear, setSelectedBatchYear] = useState('');
  const [criteria, setCriteria] = useState<CriterionConfig[]>([...DEFAULT_GD_CRITERIA]);
  const [createSelectedStudentIds, setCreateSelectedStudentIds] = useState<string[]>([]);

  // Round Details & Evaluation View
  const [selectedRound, setSelectedRound] = useState<GdRoundDto | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Dynamic Student Assignment Dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);

  // Single Evaluation Dialog
  const [evaluatingParticipant, setEvaluatingParticipant] = useState<GdParticipantDto | null>(null);
  const [evaluatingScores, setEvaluatingScores] = useState<Record<string, { score: number; comment?: string }>>({});
  const [evaluatingFeedback, setEvaluatingFeedback] = useState('');
  const [evaluatingSubmitting, setEvaluatingSubmitting] = useState(false);
  const [evaluationSuccessMsg, setEvaluationSuccessMsg] = useState<string | null>(null);

  // Load rounds
  const fetchRounds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await evaluationService.getGdRounds({
        status: statusTab !== 'ALL' ? statusTab : undefined,
      });
      setRounds(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load GD rounds');
    } finally {
      setLoading(false);
    }
  }, [statusTab]);

  useEffect(() => {
    fetchRounds();
  }, [fetchRounds]);

  // Load departments & courses for institutional targeting
  useEffect(() => {
    const loadHierarchy = async () => {
      try {
        const [deptRes, courseRes] = await Promise.all([
          managementService.getDepartments(),
          managementService.getCourses(),
        ]);
        setDepartments(deptRes || []);
        setCourses(courseRes || []);
      } catch (e) {
        console.error('Failed to load hierarchy for GD targeting', e);
      }
    };
    loadHierarchy();
  }, []);

  const refreshSelectedRound = async (roundId: string) => {
    try {
      setDetailsLoading(true);
      const fresh = await evaluationService.getGdRoundById(roundId);
      setSelectedRound(fresh);
      // Also update in list
      setRounds((prev) => prev.map((r) => (r.id === fresh.id ? fresh : r)));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to refresh round details');
    } finally {
      setDetailsLoading(false);
    }
  };

  // Create Round
  const handleOpenCreate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 60);
    const dateStr = now.toISOString().slice(0, 16);
    setNewTitle('');
    setNewTopic('');
    setNewInstructions('');
    setNewScheduledDate(dateStr);
    setNewDuration(30);
    setNewEvaluatorId('');
    setSelectedDeptId('');
    setSelectedCourseId('');
    setSelectedBatchYear('');
    setCriteria(DEFAULT_GD_CRITERIA.map((c) => ({ ...c })));
    setCreateSelectedStudentIds([]);
    setCreateOpen(true);
  };

  const handleAddCriterion = () => {
    setCriteria((prev) => [
      ...prev,
      { name: `Criterion ${prev.length + 1}`, maxMarks: 10, order: prev.length + 1 },
    ]);
  };

  const handleRemoveCriterion = (index: number) => {
    if (criteria.length <= 1) return;
    setCriteria((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateCriterion = (index: number, field: keyof CriterionConfig, value: any) => {
    setCriteria((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleCreateSubmit = async () => {
    if (!newTitle.trim() || !newTopic.trim() || !newScheduledDate) {
      alert('Please fill in title, topic, and scheduled date.');
      return;
    }
    try {
      setCreating(true);
      await evaluationService.createGdRound({
        title: newTitle.trim(),
        topic: newTopic.trim(),
        instructions: newInstructions.trim() || undefined,
        scheduledDate: new Date(newScheduledDate).toISOString(),
        durationMinutes: Number(newDuration),
        evaluatorId: newEvaluatorId.trim() || undefined,
        departmentId: selectedDeptId || undefined,
        courseId: selectedCourseId || undefined,
        batchYear: selectedBatchYear ? Number(selectedBatchYear) : undefined,
        studentIds: createSelectedStudentIds.length > 0 ? createSelectedStudentIds : undefined,
        criteria,
      });
      setCreateOpen(false);
      setCreateSelectedStudentIds([]);
      await fetchRounds();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to create GD round');
    } finally {
      setCreating(false);
    }
  };

  // Student Assignment
  const handleOpenAssign = (round: GdRoundDto) => {
    setSelectedRound(round);
    const existingIds = (round.participants || []).map((p) => p.studentId);
    setSelectedStudentIds([...existingIds]);
    setAssignOpen(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedRound || selectedStudentIds.length === 0) return;
    try {
      setAssigning(true);
      const existingIds = new Set((selectedRound.participants || []).map((p) => p.studentId));
      const newIds = selectedStudentIds.filter((id) => !existingIds.has(id));
      if (newIds.length === 0) {
        alert('All selected students are already assigned to this round.');
        setAssignOpen(false);
        return;
      }
      await evaluationService.assignStudentsToGd(selectedRound.id, newIds);
      setAssignOpen(false);
      setSelectedStudentIds([]);
      await refreshSelectedRound(selectedRound.id);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to assign students');
    } finally {
      setAssigning(false);
    }
  };

  // Attendance
  const handleToggleAttendance = async (part: GdParticipantDto, nextStatus: AttendanceStatus) => {
    if (isSuperAdmin) return;
    try {
      await evaluationService.updateGdAttendance(part.id, nextStatus);
      if (selectedRound) {
        await refreshSelectedRound(selectedRound.id);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update attendance');
    }
  };

  const handleMarkAllPresent = async () => {
    if (!selectedRound || isSuperAdmin) return;
    try {
      const records = selectedRound.participants.map((p) => ({
        participantId: p.id,
        attendance: 'PRESENT' as AttendanceStatus,
      }));
      await evaluationService.batchUpdateGdAttendance(records);
      await refreshSelectedRound(selectedRound.id);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to batch update attendance');
    }
  };

  // Evaluation Dialog
  const handleOpenEvaluation = (participant: GdParticipantDto) => {
    setEvaluatingParticipant(participant);
    setEvaluationSuccessMsg(null);
    const roundCriteria = selectedRound?.criteria || [];
    const initScores: Record<string, { score: number; comment?: string }> = {};

    if (participant.evaluation) {
      participant.evaluation.criterionScores.forEach((cs) => {
        initScores[cs.criterionId] = { score: cs.score, comment: cs.comment };
      });
      setEvaluatingFeedback(participant.evaluation.feedback || '');
    } else {
      roundCriteria.forEach((c) => {
        initScores[c.id] = { score: Math.round(c.maxMarks * 0.7), comment: '' };
      });
      setEvaluatingFeedback('');
    }
    setEvaluatingScores(initScores);
  };

  const handleEvaluationScoreChange = (criterionId: string, val: number) => {
    setEvaluatingScores((prev) => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        score: val,
      },
    }));
  };

  const handleEvaluationCommentChange = (criterionId: string, comment: string) => {
    setEvaluatingScores((prev) => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        comment,
      },
    }));
  };

  const handleSubmitEvaluation = async () => {
    if (!selectedRound || !evaluatingParticipant) return;
    try {
      setEvaluatingSubmitting(true);
      const criterionScores = Object.entries(evaluatingScores).map(([critId, val]) => ({
        criterionId: critId,
        score: Number(val.score),
        comment: val.comment?.trim() || undefined,
      }));

      const res = await evaluationService.submitGdEvaluation(selectedRound.id, {
        participantId: evaluatingParticipant.id,
        feedback: evaluatingFeedback.trim() || undefined,
        criterionScores,
      });

      setEvaluationSuccessMsg(
        `Evaluation recorded: Total ${res.totalScore}/${res.maxPossibleMarks} (${res.percentage}%). ${
          res.comparison ? res.comparison.displayText : ''
        }`
      );

      await refreshSelectedRound(selectedRound.id);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to save GD evaluation');
    } finally {
      setEvaluatingSubmitting(false);
    }
  };

  const handleDeleteRound = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this GD round?')) return;
    try {
      await evaluationService.deleteGdRound(id);
      if (selectedRound?.id === id) {
        setSelectedRound(null);
      }
      await fetchRounds();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete GD round');
    }
  };

  // Live Score Calculator Preview
  const previewMaxMarks = (selectedRound?.criteria || []).reduce((acc, c) => acc + c.maxMarks, 0);
  const previewTotal = Object.values(evaluatingScores).reduce((acc, curr) => acc + (Number(curr?.score) || 0), 0);
  const previewPct = previewMaxMarks > 0 ? Math.round((previewTotal / previewMaxMarks) * 100) : 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="overline" color="#0F2744" fontWeight={700} letterSpacing={1.2}>
            QUALITATIVE EVALUATION SUITE
          </Typography>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em" sx={{ mb: 0.5, color: '#0f172a' }}>
            Group Discussion (GD) Rounds
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Manage GD topics, configure evaluation criteria, track attendance, and record structured human evaluations.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon fontSize="small" />}
            onClick={() => fetchRounds()}
            disabled={loading}
            sx={{
              color: '#0F2744',
              borderColor: '#cbd5e1',
              borderRadius: '6px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              '&:hover': { borderColor: '#0F2744', bgcolor: 'rgba(15, 39, 68, 0.04)' },
            }}
          >
            Refresh
          </Button>
          {!isSuperAdmin && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon fontSize="small" />}
              onClick={handleOpenCreate}
              sx={{
                bgcolor: '#0F2744',
                color: '#ffffff',
                borderRadius: '6px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8125rem',
                '&:hover': { bgcolor: '#0A1C30' },
              }}
            >
              Create GD Round
            </Button>
          )}
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Metric Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ p: 2, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              TOTAL GD ROUNDS
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#0f172a' }}>
              {rounds.length}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ p: 2, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              ACTIVE / SCHEDULED
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#0369a1' }}>
              {rounds.filter((r) => r.status === 'SCHEDULED' || r.status === 'IN_PROGRESS').length}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ p: 2, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              TOTAL EVALUATED
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#047857' }}>
              {rounds.reduce((acc, r) => acc + (r.evaluatedCount || 0), 0)}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ p: 2, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              AVG GD PERFORMANCE
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#0F2744' }}>
              {(() => {
                const evaluatedRounds = rounds.filter((r) => r.averageScore !== null);
                if (evaluatedRounds.length === 0) return '—';
                const avg =
                  evaluatedRounds.reduce((acc, r) => acc + (r.averageScore || 0), 0) /
                  evaluatedRounds.length;
                return `${Math.round(avg)}%`;
              })()}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper elevation={0} sx={{ mb: 3, border: '1px solid #e2e8f0', borderRadius: '8px', bgcolor: '#ffffff' }}>
        <Tabs
          value={statusTab}
          onChange={(_, val) => setStatusTab(val)}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              py: 1.5,
              minHeight: 48,
              color: '#64748b',
              '&.Mui-selected': { color: '#0F2744', fontWeight: 700 },
            },
          }}
        >
          <Tab label="All Rounds" value="ALL" />
          <Tab label="Scheduled" value="SCHEDULED" />
          <Tab label="In Progress" value="IN_PROGRESS" />
          <Tab label="Completed" value="COMPLETED" />
        </Tabs>
      </Paper>

      {/* GD Rounds Grid / Detail Layout */}
      <Grid container spacing={3}>
        {/* Left Column: GD Rounds List */}
        <Grid item xs={12} md={selectedRound ? 5 : 12}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : rounds.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <GroupsIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
              <Typography variant="h6" sx={{ color: '#475569' }}>
                No Group Discussion Rounds Found
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                Create a new GD round to evaluate student communication, confidence, and leadership.
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {rounds.map((round) => {
                const isSelected = selectedRound?.id === round.id;
                return (
                  <Card
                    key={round.id}
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      borderColor: isSelected ? '#2563eb' : 'rgba(226, 232, 240, 0.9)',
                      boxShadow: isSelected ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    <CardContent sx={{ pb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                          {round.title}
                        </Typography>
                        <Chip
                          label={round.status}
                          size="small"
                          color={
                            round.status === 'COMPLETED'
                              ? 'success'
                              : round.status === 'IN_PROGRESS'
                              ? 'warning'
                              : 'primary'
                          }
                          sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500, mb: 1.5 }}>
                        Topic: {round.topic}
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ color: '#64748b', fontSize: '0.8rem', mb: 1 }}>
                        <span>📅 {new Date(round.scheduledDate).toLocaleDateString()}</span>
                        <span>⏱ {round.durationMinutes} mins</span>
                        <span>👥 {round.totalParticipants} students</span>
                      </Stack>
                      {round.averageScore !== null && (
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            label={`Avg Score: ${round.averageScore}% (${round.evaluatedCount}/${round.totalParticipants} evaluated)`}
                            size="small"
                            sx={{ backgroundColor: '#f1f5f9', color: '#0f172a', fontWeight: 600 }}
                          />
                        </Box>
                      )}
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
                      <Button
                        size="small"
                        variant={isSelected ? 'contained' : 'outlined'}
                        startIcon={<VisibilityIcon />}
                        onClick={() => setSelectedRound(round)}
                      >
                        {isSelected ? 'Viewing' : 'View Participants'}
                      </Button>
                      <Stack direction="row" spacing={0.5}>
                        {!isSuperAdmin && (
                          <>
                            <Tooltip title="Assign Students">
                              <IconButton size="small" onClick={() => handleOpenAssign(round)}>
                                <PersonAddIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Round">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteRound(round.id)}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Stack>
                    </CardActions>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Grid>

        {/* Right Column: Selected GD Round Participants & Evaluation */}
        {selectedRound && (
          <Grid item xs={12} md={7}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    {selectedRound.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569', mt: 0.5 }}>
                    <strong>Topic:</strong> {selectedRound.topic}
                  </Typography>
                  {selectedRound.instructions && (
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                      <strong>Instructions:</strong> {selectedRound.instructions}
                    </Typography>
                  )}
                </Box>
                <Stack direction="row" spacing={1}>
                  {!isSuperAdmin && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<HowToRegIcon />}
                      onClick={handleMarkAllPresent}
                    >
                      Mark All Present
                    </Button>
                  )}
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PersonAddIcon />}
                    onClick={() => handleOpenAssign(selectedRound)}
                  >
                    Add Students
                  </Button>
                </Stack>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`Criteria: ${selectedRound.criteria.length} items`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`Total Marks: ${selectedRound.criteria.reduce((a, b) => a + b.maxMarks, 0)}`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`Participants: ${selectedRound.participants.length}`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`Evaluated: ${selectedRound.evaluatedCount}`}
                  size="small"
                  color="success"
                />
              </Box>

              {detailsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : selectedRound.participants.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: '#64748b' }}>
                  <Typography variant="body2">No students assigned to this GD round yet.</Typography>
                  <Button
                    variant="text"
                    startIcon={<PersonAddIcon />}
                    onClick={() => handleOpenAssign(selectedRound)}
                    sx={{ mt: 1 }}
                  >
                    Assign Students Now
                  </Button>
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Dept / Reg</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Attendance</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                        <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedRound.participants.map((part) => {
                        const isEvaluated = Boolean(part.evaluation);
                        return (
                          <TableRow key={part.id} hover>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {part.studentName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748b' }}>
                                {part.collegeEmail}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{part.registerNumber}</Typography>
                              <Typography variant="caption" sx={{ color: '#64748b' }}>
                                {part.departmentName || '—'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={part.attendance}
                                size="small"
                                icon={
                                  part.attendance === 'PRESENT' ? (
                                    <CheckCircleIcon />
                                  ) : part.attendance === 'ABSENT' ? (
                                    <CancelIcon />
                                  ) : (
                                    <HourglassEmptyIcon />
                                  )
                                }
                                color={
                                  part.attendance === 'PRESENT'
                                    ? 'success'
                                    : part.attendance === 'ABSENT'
                                    ? 'error'
                                    : 'warning'
                                }
                                onClick={() => {
                                  if (isSuperAdmin) return;
                                  const next: AttendanceStatus =
                                    part.attendance === 'PRESENT'
                                      ? 'ABSENT'
                                      : part.attendance === 'ABSENT'
                                      ? 'PENDING'
                                      : 'PRESENT';
                                  handleToggleAttendance(part, next);
                                }}
                                sx={{ cursor: isSuperAdmin ? 'default' : 'pointer' }}
                              />
                            </TableCell>
                            <TableCell>
                              {isEvaluated ? (
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#16a34a' }}>
                                    {part.evaluation?.percentage}%
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                                    {part.evaluation?.totalScore} / {part.evaluation?.maxPossibleMarks}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                  Pending
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell sx={{ textAlign: 'right' }}>
                              <Button
                                size="small"
                                variant={isEvaluated ? 'outlined' : 'contained'}
                                color={isEvaluated ? 'primary' : 'success'}
                                startIcon={<RateReviewIcon />}
                                onClick={() => handleOpenEvaluation(part)}
                              >
                                {isEvaluated ? 'View Eval' : 'Evaluate'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Create GD Round Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create New Group Discussion Round</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <TextField
              label="Round Title"
              fullWidth
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., Round 1: AI & Ethics in Engineering"
            />
            <TextField
              label="Discussion Topic"
              fullWidth
              required
              multiline
              rows={2}
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Enter the topic to be presented to the students"
            />
            <TextField
              label="Special Instructions / Guidelines"
              fullWidth
              multiline
              rows={2}
              value={newInstructions}
              onChange={(e) => setNewInstructions(e.target.value)}
              placeholder="Guidelines for students and evaluators..."
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Scheduled Date & Time"
                  type="datetime-local"
                  fullWidth
                  required
                  value={newScheduledDate}
                  onChange={(e) => setNewScheduledDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Duration (minutes)"
                  type="number"
                  fullWidth
                  value={newDuration}
                  onChange={(e) => setNewDuration(Number(e.target.value))}
                />
              </Grid>
            </Grid>

            <Divider>
              <Chip label="Target Audience / Batch (Optional Default)" size="small" />
            </Divider>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Department"
                  fullWidth
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {departments.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Course"
                  fullWidth
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                >
                  <MenuItem value="">All Courses</MenuItem>
                  {courses.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Batch Year"
                  type="number"
                  fullWidth
                  value={selectedBatchYear}
                  onChange={(e) => setSelectedBatchYear(e.target.value)}
                  placeholder="e.g. 2026"
                />
              </Grid>
            </Grid>

            {/* Student Selection for GD Round */}
            <Divider>
              <Chip label="Student Selection (Optional Direct Assignment)" size="small" />
            </Divider>

            <StudentSelector
              initialDepartmentId={selectedDeptId || undefined}
              initialCourseId={selectedCourseId || undefined}
              selectedStudentIds={createSelectedStudentIds}
              onSelectionChange={setCreateSelectedStudentIds}
              title="Select Students for GD Round"
              helperText="Filter by Department → Course → Class → Section. Multi-select across different sections/classes to assign students directly upon round creation."
            />

            <Divider>
              <Chip label="Evaluation Criteria Configuration" size="small" />
            </Divider>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Configurable Criteria (Default: 10 Criteria / 100 Marks Total)
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => setCriteria(DEFAULT_GD_CRITERIA.map((c) => ({ ...c })))}>
                    Reset Defaults
                  </Button>
                  <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={handleAddCriterion}>
                    Add Criterion
                  </Button>
                </Stack>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ width: 50 }}>#</TableCell>
                      <TableCell>Criterion Name</TableCell>
                      <TableCell sx={{ width: 120 }}>Max Marks</TableCell>
                      <TableCell sx={{ width: 60 }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {criteria.map((crit, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            value={crit.name}
                            onChange={(e) => handleUpdateCriterion(idx, 'name', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={crit.maxMarks}
                            onChange={(e) => handleUpdateCriterion(idx, 'maxMarks', Number(e.target.value))}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={criteria.length <= 1}
                            onClick={() => handleRemoveCriterion(idx)}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 1.5, textAlign: 'right' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Total Maximum Marks: {criteria.reduce((a, b) => a + (Number(b.maxMarks) || 0), 0)}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateOpen(false)} disabled={creating}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreateSubmit} disabled={creating}>
            {creating ? (
              <CircularProgress size={24} />
            ) : createSelectedStudentIds.length > 0 ? (
              `Create GD Round (${createSelectedStudentIds.length} Students)`
            ) : (
              'Create GD Round'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Students Dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Assign Students to GD: {selectedRound?.title}
        </DialogTitle>
        <DialogContent dividers>
          {selectedRound && (
            <StudentSelector
              initialDepartmentId={selectedRound.departmentId || undefined}
              initialCourseId={selectedRound.courseId || undefined}
              selectedStudentIds={selectedStudentIds}
              onSelectionChange={setSelectedStudentIds}
              alreadyAssignedStudentIds={(selectedRound.participants || []).map((p) => p.studentId)}
              title={`Target Students for "${selectedRound.title}"`}
              helperText="Filter by Department → Course → Class → Section. Previously assigned students appear selected and locked to prevent duplicates."
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {(() => {
            const existingIds = new Set((selectedRound?.participants || []).map((p) => p.studentId));
            const newCount = selectedStudentIds.filter((id) => !existingIds.has(id)).length;
            return (
              <>
                <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
                <Button
                  variant="contained"
                  onClick={handleAssignSubmit}
                  disabled={assigning || newCount === 0}
                >
                  {assigning ? (
                    <CircularProgress size={24} />
                  ) : newCount === 0 ? (
                    'No New Students Selected'
                  ) : (
                    `Assign ${newCount} New Student${newCount === 1 ? '' : 's'}`
                  )}
                </Button>
              </>
            );
          })()}
        </DialogActions>
      </Dialog>

      {/* Human Evaluator Modal */}
      <Dialog
        open={Boolean(evaluatingParticipant)}
        onClose={() => setEvaluatingParticipant(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Human Evaluation: {evaluatingParticipant?.studentName}
        </DialogTitle>
        <DialogContent dividers>
          {evaluatingParticipant && selectedRound && (
            <Stack spacing={2.5}>
              {evaluationSuccessMsg && (
                <Alert severity="success" onClose={() => setEvaluationSuccessMsg(null)}>
                  {evaluationSuccessMsg}
                </Alert>
              )}

              {/* Student Metadata Card */}
              <Card variant="outlined" sx={{ p: 2, backgroundColor: '#f8fafc' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      STUDENT
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {evaluatingParticipant.studentName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      REGISTRATION NO.
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {evaluatingParticipant.registerNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      DEPARTMENT
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {evaluatingParticipant.departmentName || '—'}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>

              {/* Previous Evaluation Comparison Display */}
              {evaluatingParticipant.evaluation?.comparison && (
                <Alert
                  severity="info"
                  icon={<TrendingUpIcon />}
                  sx={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}
                >
                  <strong>Improvement History: </strong>
                  {evaluatingParticipant.evaluation.comparison.displayText}
                </Alert>
              )}

              {/* Criteria Scores Form */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                Enter Criterion Marks (Human Evaluation)
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
                    <TableRow>
                      <TableCell sx={{ width: 40 }}>#</TableCell>
                      <TableCell sx={{ width: 220 }}>Criterion</TableCell>
                      <TableCell sx={{ width: 140 }}>Score (Max)</TableCell>
                      <TableCell>Criterion Notes / Feedback</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedRound.criteria.map((crit, idx) => {
                      const entry = evaluatingScores[crit.id] || { score: 0, comment: '' };
                      return (
                        <TableRow key={crit.id}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{crit.name}</TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              disabled={isSuperAdmin}
                              inputProps={{ min: 0, max: crit.maxMarks, step: 0.5 }}
                              value={entry.score}
                              onChange={(e) =>
                                handleEvaluationScoreChange(crit.id, Number(e.target.value))
                              }
                              helperText={`Max: ${crit.maxMarks}`}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              fullWidth
                              disabled={isSuperAdmin}
                              placeholder="Observation notes..."
                              value={entry.comment || ''}
                              onChange={(e) =>
                                handleEvaluationCommentChange(crit.id, e.target.value)
                              }
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Overall Feedback */}
              <TextField
                label="Overall Qualitative Feedback"
                multiline
                rows={3}
                fullWidth
                disabled={isSuperAdmin}
                value={evaluatingFeedback}
                onChange={(e) => setEvaluatingFeedback(e.target.value)}
                placeholder="Key strengths, articulation, team leadership, areas of improvement..."
              />

              {/* Authoritative Score Indicator */}
              <Card variant="outlined" sx={{ p: 2, backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#166534' }}>
                      Backend Authoritative Calculation Preview:
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#15803d' }}>
                      Backend is source of truth. Validates min/max bounds and computes sum.
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#166534' }}>
                      {previewTotal} / {previewMaxMarks} ({previewPct}%)
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEvaluatingParticipant(null)}>Close</Button>
          {!isSuperAdmin && (
            <Button
              variant="contained"
              color="success"
              onClick={handleSubmitEvaluation}
              disabled={evaluatingSubmitting}
            >
              {evaluatingSubmitting ? <CircularProgress size={24} /> : 'Save Human Evaluation'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
