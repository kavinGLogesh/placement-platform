import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import QuizIcon from '@mui/icons-material/Quiz';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RepeatIcon from '@mui/icons-material/Repeat';
import HistoryIcon from '@mui/icons-material/History';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LanguageIcon from '@mui/icons-material/Language';
import { companyService } from '../../services/company.service.js';
import { CompanyDto, CompanyQuestionIntelligenceDto } from '../../types/company.types.js';

interface CompanyIntelligenceDialogProps {
  open: boolean;
  company: CompanyDto | null;
  onClose: () => void;
  onOpenUpload: (company: CompanyDto) => void;
  onViewQuestions: (company: CompanyDto) => void;
  onCreateAssessment: (company: CompanyDto) => void;
  onReviewDuplicates?: (company: CompanyDto) => void;
}

export const CompanyIntelligenceDialog: React.FC<CompanyIntelligenceDialogProps> = ({
  open,
  company,
  onClose,
  onOpenUpload,
  onViewQuestions,
  onCreateAssessment,
  onReviewDuplicates,
}) => {
  const [loading, setLoading] = useState(false);
  const [intelligence, setIntelligence] = useState<CompanyQuestionIntelligenceDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && company) {
      setLoading(true);
      setError(null);
      companyService
        .getIntelligence(company.id)
        .then((data) => setIntelligence(data))
        .catch((err: any) => {
          const msg = err?.response?.data?.message || 'Failed to load company question intelligence';
          setError(msg);
        })
        .finally(() => setLoading(false));
    } else {
      setIntelligence(null);
    }
  }, [open, company]);

  if (!company) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            label={company.code}
            size="small"
            sx={{
              fontWeight: 800,
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              borderRadius: '4px',
            }}
          />
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {company.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              Company Question Intelligence & Historical Drive Analytics
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, backgroundColor: '#f8fafc' }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
            <CircularProgress size={36} />
            <Typography variant="body2" sx={{ mt: 2, color: '#64748b' }}>
              Aggregating company questions, drive history, and pattern analytics...
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : intelligence ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Top KPI Cards */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined" sx={{ backgroundColor: '#ffffff', borderRadius: 2 }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                      TOTAL QUESTIONS
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
                      <Typography variant="h4" fontWeight={800} color="#0f172a">
                        {intelligence.totalQuestions}
                      </Typography>
                      <QuizIcon sx={{ fontSize: 20, color: '#3b82f6' }} />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Tagged corporate pool
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined" sx={{ backgroundColor: '#ffffff', borderRadius: 2 }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                      REPEATED QUESTIONS
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
                      <Typography variant="h4" fontWeight={800} color="#b45309">
                        {intelligence.repeatedQuestionsCount}
                      </Typography>
                      <RepeatIcon sx={{ fontSize: 20, color: '#d97706' }} />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Multi-year / multi-drive occurrences
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined" sx={{ backgroundColor: '#ffffff', borderRadius: 2 }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                      FREQUENTLY USED
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
                      <Typography variant="h4" fontWeight={800} color="#047857">
                        {intelligence.frequentlyUsedCount}
                      </Typography>
                      <VerifiedUserIcon sx={{ fontSize: 20, color: '#10b981' }} />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Used in &ge; 3 assessments
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card
                  variant="outlined"
                  sx={{
                    backgroundColor: intelligence.possibleDuplicatesCount > 0 ? '#fffbeb' : '#ffffff',
                    borderColor: intelligence.possibleDuplicatesCount > 0 ? '#fde68a' : '#e2e8f0',
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                      POSSIBLE DUPLICATES
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
                      <Typography
                        variant="h4"
                        fontWeight={800}
                        color={intelligence.possibleDuplicatesCount > 0 ? '#d97706' : '#64748b'}
                      >
                        {intelligence.possibleDuplicatesCount}
                      </Typography>
                      <WarningAmberIcon sx={{ fontSize: 20, color: '#f59e0b' }} />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Flagged for Admin review
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Category Breakdown & Difficulty */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={7}>
                <Card variant="outlined" sx={{ backgroundColor: '#ffffff', borderRadius: 2, height: '100%' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#0f172a', mb: 2 }}>
                      Component & Category Distribution
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {[
                        {
                          name: 'Quantitative Aptitude',
                          count: intelligence.categoryBreakdown.quantitativeAptitude,
                          color: '#3b82f6',
                        },
                        {
                          name: 'Logical Reasoning',
                          count: intelligence.categoryBreakdown.logicalReasoning,
                          color: '#8b5cf6',
                        },
                        {
                          name: 'Verbal Ability',
                          count: intelligence.categoryBreakdown.verbalAbility,
                          color: '#ec4899',
                        },
                        {
                          name: 'Technical MCQ',
                          count: intelligence.categoryBreakdown.technicalMcq,
                          color: '#10b981',
                        },
                        {
                          name: 'Coding & Algorithmic',
                          count: intelligence.categoryBreakdown.coding,
                          color: '#f97316',
                        },
                      ].map((cat) => {
                        const pct =
                          intelligence.totalQuestions > 0
                            ? Math.round((cat.count / intelligence.totalQuestions) * 100)
                            : 0;
                        return (
                          <Box key={cat.name}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                                {cat.name}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                {cat.count} <span style={{ color: '#94a3b8', fontWeight: 400 }}>({pct}%)</span>
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={pct}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: '#f1f5f9',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: cat.color,
                                  borderRadius: 3,
                                },
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={5}>
                <Card variant="outlined" sx={{ backgroundColor: '#ffffff', borderRadius: 2, height: '100%' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#0f172a', mb: 2 }}>
                      Difficulty Distribution
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, backgroundColor: '#f0fdf4', borderRadius: 1.5, border: '1px solid #bbf7d0' }}>
                        <Typography variant="body2" fontWeight={600} color="#166534">
                          Easy
                        </Typography>
                        <Typography variant="h6" fontWeight={800} color="#166534">
                          {intelligence.difficultyDistribution.easy}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, backgroundColor: '#eff6ff', borderRadius: 1.5, border: '1px solid #bfdbfe' }}>
                        <Typography variant="body2" fontWeight={600} color="#1e40af">
                          Medium
                        </Typography>
                        <Typography variant="h6" fontWeight={800} color="#1e40af">
                          {intelligence.difficultyDistribution.medium}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, backgroundColor: '#fef2f2', borderRadius: 1.5, border: '1px solid #fecaca' }}>
                        <Typography variant="body2" fontWeight={600} color="#991b1b">
                          Hard
                        </Typography>
                        <Typography variant="h6" fontWeight={800} color="#991b1b">
                          {intelligence.difficultyDistribution.hard}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Historical Years & Evidence Integrity */}
            <Card variant="outlined" sx={{ backgroundColor: '#ffffff', borderRadius: 2 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <HistoryIcon sx={{ fontSize: 18, color: '#475569' }} />
                  <Typography variant="subtitle2" fontWeight={700} color="#0f172a">
                    Drive Years & Source Distribution
                  </Typography>
                </Box>
                {intelligence.yearDistribution.length > 0 ? (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {intelligence.yearDistribution.map((yr) => (
                      <Chip
                        key={yr.year}
                        label={`${yr.year} Drive: ${yr.count} Questions`}
                        variant="outlined"
                        sx={{ fontWeight: 600, color: '#334155', backgroundColor: '#f8fafc' }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No specific drive year records attached. Defaulting to general preparation pool.
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 1 }}>
                  QUESTION EVIDENCE CLASSIFICATION (ACADEMIC INTEGRITY)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={`Company Tagged: ${intelligence.evidenceLabels.companyTagged}`}
                    size="small"
                    sx={{ backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 600 }}
                  />
                  <Chip
                    label={`Reported Question: ${intelligence.evidenceLabels.reportedQuestion}`}
                    size="small"
                    sx={{ backgroundColor: '#ecfdf5', color: '#047857', fontWeight: 600 }}
                  />
                  <Chip
                    label={`Repeated Question: ${intelligence.evidenceLabels.repeatedQuestion}`}
                    size="small"
                    sx={{ backgroundColor: '#fffbeb', color: '#b45309', fontWeight: 600 }}
                  />
                  <Chip
                    label={`Frequently Used: ${intelligence.evidenceLabels.frequentlyUsed}`}
                    size="small"
                    sx={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 600 }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Top Topics */}
            {intelligence.topicDistribution.length > 0 && (
              <Card variant="outlined" sx={{ backgroundColor: '#ffffff', borderRadius: 2 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle2" fontWeight={700} color="#0f172a" sx={{ mb: 1.5 }}>
                    Top Tagged Topics ({intelligence.topicDistribution.length} distinct topics)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {intelligence.topicDistribution.slice(0, 15).map((t) => (
                      <Chip
                        key={`${t.category}-${t.topic}`}
                        label={`${t.topic} (${t.count})`}
                        size="small"
                        sx={{
                          fontWeight: 500,
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, backgroundColor: '#ffffff', display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {company.website && (
            <Button
              size="small"
              variant="text"
              startIcon={<LanguageIcon />}
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: '#64748b' }}
            >
              Corporate Portal
            </Button>
          )}
          {intelligence && intelligence.possibleDuplicatesCount > 0 && onReviewDuplicates && (
            <Button
              size="small"
              variant="outlined"
              color="warning"
              startIcon={<WarningAmberIcon />}
              onClick={() => onReviewDuplicates(company)}
            >
              Review Duplicates ({intelligence.possibleDuplicatesCount})
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1.25 }}>
          <Button
            variant="outlined"
            startIcon={<QuizIcon />}
            onClick={() => onViewQuestions(company)}
          >
            Question Bank
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={() => onOpenUpload(company)}
          >
            Upload Questions
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AssignmentIcon />}
            onClick={() => onCreateAssessment(company)}
          >
            Create Assessment
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
