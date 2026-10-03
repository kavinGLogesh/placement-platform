import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { questionService } from '../../services/question.service.js';
import { CompanyDto } from '../../types/company.types.js';
import { CreateQuestionInput } from '../../types/question.types.js';
import { QuestionContentRenderer } from '../common/QuestionContentRenderer.js';

interface AiQuestionImportDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companies: CompanyDto[];
  defaultCompanyId?: string;
}

export const AiQuestionImportDialog: React.FC<AiQuestionImportDialogProps> = ({
  open,
  onClose,
  onSuccess,
  companies,
  defaultCompanyId = '',
}) => {
  // Step: 0 = Input & Upload, 1 = Review & Confirm, 2 = Success Summary
  const [step, setStep] = useState<0 | 1 | 2>(0);

  // File & Input state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [manualText, setManualText] = useState<string>('');
  const [showManualText, setShowManualText] = useState<boolean>(false);

  // Company track assignment
  const [targetCompanyId, setTargetCompanyId] = useState<string>(defaultCompanyId);

  // Analysis status & extracted data
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [importing, setImporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedQuestions, setExtractedQuestions] = useState<CreateQuestionInput[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [detectedCompany, setDetectedCompany] = useState<string | null>(null);
  const [detectedYear, setDetectedYear] = useState<number | null>(null);

  // Import result
  const [importedCount, setImportedCount] = useState<number>(0);

  useEffect(() => {
    if (open) {
      setTargetCompanyId(defaultCompanyId);
      setError(null);
    }
  }, [open, defaultCompanyId]);

  const handleReset = () => {
    setStep(0);
    setSelectedFile(null);
    setManualText('');
    setShowManualText(false);
    setError(null);
    setExtractedQuestions([]);
    setSelectedIndices(new Set());
    setDetectedCompany(null);
    setDetectedYear(null);
    setImportedCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile && !manualText.trim()) {
      setError('Please select a file (PDF, Excel, Docx, Image) or paste questions text.');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const res = await questionService.aiAnalyzeDocument({
        file: selectedFile || undefined,
        text: manualText.trim() || undefined,
        companyId: targetCompanyId || undefined,
      });

      if (!res.questions || res.questions.length === 0) {
        setError('No assessment questions could be recognized from the provided document. Please check the document format.');
        return;
      }

      // Check if Gemini detected a company that matches our registered companies
      if (res.detectedCompany) {
        setDetectedCompany(res.detectedCompany);
        if (!targetCompanyId) {
          const match = companies.find(
            (c) =>
              c.name.toLowerCase().includes(res.detectedCompany!.toLowerCase()) ||
              res.detectedCompany!.toLowerCase().includes(c.name.toLowerCase()) ||
              c.code.toLowerCase() === res.detectedCompany!.toLowerCase()
          );
          if (match) {
            setTargetCompanyId(match.id);
          }
        }
      }
      setDetectedYear(res.detectedYear);

      // Map questions with initial targetCompanyId
      const prepared = res.questions.map((q) => ({
        ...q,
        companyId: targetCompanyId || q.companyId || null,
      }));

      setExtractedQuestions(prepared);
      // Select all by default
      setSelectedIndices(new Set(prepared.map((_, i) => i)));
      setStep(1); // Proceed to review step
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to analyze document with Gemini API.';
      setError(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleToggleSelectQuestion = (index: number) => {
    const updated = new Set(selectedIndices);
    if (updated.has(index)) {
      updated.delete(index);
    } else {
      updated.add(index);
    }
    setSelectedIndices(updated);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIndices(new Set(extractedQuestions.map((_, i) => i)));
    } else {
      setSelectedIndices(new Set());
    }
  };

  const handleDeleteExtractedQuestion = (index: number) => {
    const updated = extractedQuestions.filter((_, i) => i !== index);
    setExtractedQuestions(updated);
    const newSelected = new Set<number>();
    updated.forEach((_, idx) => newSelected.add(idx));
    setSelectedIndices(newSelected);
  };

  const handleCompanyChangeForAll = (companyId: string) => {
    setTargetCompanyId(companyId);
    setExtractedQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        companyId: companyId || null,
      }))
    );
  };

  const handleFinalImport = async () => {
    const questionsToImport = extractedQuestions
      .filter((_, i) => selectedIndices.has(i))
      .map((q) => ({
        ...q,
        companyId: targetCompanyId || q.companyId || null,
      }));

    if (questionsToImport.length === 0) {
      setError('Please select at least one question to import.');
      return;
    }

    setImporting(true);
    setError(null);

    try {
      const res = await questionService.bulkCreateQuestions(questionsToImport);
      setImportedCount(res.created.length);
      setStep(2); // Success step
      onSuccess();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to import questions to database.';
      setError(msg);
    } finally {
      setImporting(false);
    }
  };

  // Helper for file type icon
  const getFileIcon = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <PictureAsPdfIcon sx={{ color: '#ef4444', fontSize: 32 }} />;
    if (['xlsx', 'xls', 'csv'].includes(ext || '')) return <TableChartIcon sx={{ color: '#10b981', fontSize: 32 }} />;
    if (['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) return <ImageIcon sx={{ color: '#3b82f6', fontSize: 32 }} />;
    return <DescriptionIcon sx={{ color: '#6366f1', fontSize: 32 }} />;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 25px 50px -12px rgba(20, 38, 75, 0.25)',
          overflow: 'hidden',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: '#14264B',
          color: '#ffffff',
          py: 2.25,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              bgcolor: 'rgba(56, 189, 248, 0.15)',
              p: 1,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AutoAwesomeIcon sx={{ color: '#38bdf8', fontSize: 24 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#ffffff', lineHeight: 1.2 }}>
                AI Question Import & Document Analyzer
              </Typography>
              <Chip
                label="Gemini Active"
                size="small"
                sx={{
                  bgcolor: 'rgba(34, 197, 94, 0.2)',
                  color: '#4ade80',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  height: 20,
                  border: '1px solid rgba(74, 222, 128, 0.3)',
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#8293B0' }}>
              Multi-format question extractor powered by Google Gemini multimodal intelligence
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: '#8293B0', '&:hover': { color: '#ffffff' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Progress Bar for Active Tasks */}
      {(analyzing || importing) && <LinearProgress color="info" />}

      <DialogContent sx={{ p: 3, bgcolor: '#EDF2FF' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* ========================================================================= */}
        {/* STEP 0: Upload & Target Selection */}
        {/* ========================================================================= */}
        {step === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Target Company Track Selection */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                bgcolor: '#ffffff',
                border: '1px solid #DCE6F5',
                borderRadius: 2.5,
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} color="#14264B" sx={{ mb: 1.5 }}>
                1. Target Recruitment Company Track
              </Typography>

              <FormControl size="small" fullWidth>
                <InputLabel>Company Track Destination</InputLabel>
                <Select
                  value={targetCompanyId}
                  label="Company Track Destination"
                  onChange={(e) => setTargetCompanyId(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Auto-detect from Document (or leave Global)</em>
                  </MenuItem>
                  {companies.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
                If set to auto-detect, Gemini will analyze if the document belongs to a specific company exam (e.g. Wipro, TCS, Infosys).
              </Typography>
            </Paper>

            {/* Document / File Upload Card */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                bgcolor: '#ffffff',
                border: '1px solid #DCE6F5',
                borderRadius: 2.5,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={700} color="#14264B">
                  2. Question Document / Exam Paper Upload
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => setShowManualText(!showManualText)}
                  sx={{ textTransform: 'none', fontSize: '0.8rem' }}
                >
                  {showManualText ? 'Hide Text Input' : 'Or Paste Raw Text'}
                </Button>
              </Box>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp,.txt"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              {!selectedFile ? (
                <Box
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    border: '2px dashed',
                    borderColor: dragOver ? 'primary.main' : '#D1DEF0',
                    borderRadius: 2.5,
                    p: 3.5,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: dragOver ? '#eff6ff' : '#EDF2FF',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: '#E7EEFA',
                    },
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 44, color: '#7182A0', mb: 1 }} />
                  <Typography variant="subtitle1" fontWeight={700} color="#14264B">
                    Drag and drop your exam document here
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    or click to browse from your computer
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, justifyContent: 'center', flexWrap: 'wrap', mt: 1 }}>
                    <Chip label="PDF (.pdf)" size="small" variant="outlined" />
                    <Chip label="Excel (.xlsx, .csv)" size="small" variant="outlined" />
                    <Chip label="Word (.docx)" size="small" variant="outlined" />
                    <Chip label="Images (.png, .jpg, .webp)" size="small" variant="outlined" />
                  </Box>
                </Box>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: '#f0fdf4',
                    borderColor: '#86efac',
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                    {getFileIcon(selectedFile)}
                    <Box>
                      <Typography variant="body2" fontWeight={700} color="#14264B">
                        {selectedFile.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI extraction
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    Remove
                  </Button>
                </Paper>
              )}

              {/* Optional Text Paste Box */}
              {showManualText && (
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Paste Question Statement(s) / Test Raw Text"
                    placeholder="Example:
1. What is the value of 25% of 400?
A) 100
B) 120
C) 80
D) 50
Answer: A
Explanation: 0.25 * 400 = 100."
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                  />
                </Box>
              )}
            </Paper>
          </Box>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: Review & Confirm Extracted Questions */}
        {/* ========================================================================= */}
        {step === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Extraction Banner */}
            <Alert
              severity="success"
              icon={<CheckCircleOutlineIcon />}
              sx={{
                borderRadius: 2,
                '& .MuiAlert-message': { width: '100%' },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Gemini AI successfully extracted {extractedQuestions.length} questions!
                  </Typography>
                  <Typography variant="caption">
                    Review and verify questions below before importing to the authoritative question bank.
                  </Typography>
                </Box>
                {detectedCompany && (
                  <Chip
                    label={`Detected Company: ${detectedCompany}${detectedYear ? ` (${detectedYear})` : ''}`}
                    size="small"
                    color="info"
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Box>
            </Alert>

            {/* Quick Action Bar */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: '#ffffff',
                border: '1px solid #DCE6F5',
                borderRadius: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedIndices.size === extractedQuestions.length && extractedQuestions.length > 0}
                      indeterminate={selectedIndices.size > 0 && selectedIndices.size < extractedQuestions.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={600} color="#14264B">
                      Select All ({selectedIndices.size} of {extractedQuestions.length} selected)
                    </Typography>
                  }
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 260 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Target Track:
                </Typography>
                <FormControl size="small" fullWidth>
                  <Select
                    value={targetCompanyId}
                    onChange={(e) => handleCompanyChangeForAll(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>Global Question Bank (General)</em>
                    </MenuItem>
                    {companies.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Paper>

            {/* Extracted Questions List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '55vh', overflowY: 'auto', pr: 0.5 }}>
              {extractedQuestions.map((q, idx) => {
                const isSelected = selectedIndices.has(idx);
                return (
                  <Paper
                    key={idx}
                    elevation={0}
                    sx={{
                      p: 2.25,
                      bgcolor: isSelected ? '#ffffff' : '#EDF2FF',
                      border: isSelected ? '1.5px solid #0284c7' : '1px solid #DCE6F5',
                      borderRadius: 2.5,
                      transition: 'all 0.15s ease',
                      opacity: isSelected ? 1 : 0.6,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleToggleSelectQuestion(idx)}
                          color="primary"
                          size="small"
                        />
                        <Typography variant="subtitle2" fontWeight={700} color="#14264B">
                          Question #{idx + 1}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={q.category.replace('_', ' ')} size="small" color="primary" sx={{ fontWeight: 700, fontSize: '0.68rem', height: 20 }} />
                        <Chip label={q.topic} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.68rem', height: 20 }} />
                        <Chip
                          label={q.difficulty}
                          size="small"
                          color={q.difficulty === 'EASY' ? 'success' : q.difficulty === 'MEDIUM' ? 'warning' : 'error'}
                          sx={{ fontWeight: 700, fontSize: '0.68rem', height: 20 }}
                        />
                        <IconButton size="small" color="error" onClick={() => handleDeleteExtractedQuestion(idx)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Question text with graphic renderer */}
                    <Box sx={{ pl: 4, mb: 1.5 }}>
                      <QuestionContentRenderer content={q.questionText} sx={{ fontWeight: 600, color: '#14264B' }} />
                    </Box>

                    {/* Options list if multiple choice */}
                    {q.options && q.options.length > 0 && (
                      <Box sx={{ pl: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Grid container spacing={1}>
                          {q.options.map((opt, optIdx) => (
                            <Grid item xs={12} sm={6} key={optIdx}>
                              <Box
                                sx={{
                                  p: 1.25,
                                  borderRadius: 1.5,
                                  bgcolor: opt.isCorrect ? '#f0fdf4' : '#EDF2FF',
                                  border: opt.isCorrect ? '1.5px solid #16a34a' : '1px solid #DCE6F5',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                }}
                              >
                                {opt.isCorrect ? (
                                  <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 18 }} />
                                ) : (
                                  <RadioButtonUncheckedIcon sx={{ color: '#8293B0', fontSize: 18 }} />
                                )}
                                <Typography variant="body2" color="#14264B" fontWeight={opt.isCorrect ? 700 : 500}>
                                  {opt.optionText}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}

                    {/* Solution Explanation */}
                    {q.explanation && (
                      <Box sx={{ pl: 4, mt: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontStyle: 'italic' }}>
                          <HelpOutlineIcon sx={{ fontSize: 14 }} /> Explanation: {q.explanation}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                );
              })}
            </Box>
          </Box>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: Import Completed Summary */}
        {/* ========================================================================= */}
        {step === 2 && (
          <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: '#f0fdf4',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 44 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="#14264B" sx={{ mb: 1 }}>
              Questions Successfully Imported!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 480, mx: 'auto' }}>
              <strong>{importedCount} assessment questions</strong> have been validated, classified, and written to the authoritative Question Bank.
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button variant="outlined" color="inherit" onClick={handleReset}>
                Import Another Document
              </Button>
              <Button variant="contained" color="primary" onClick={handleClose}>
                View Question Bank
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>

      {/* Footer Actions */}
      <DialogActions sx={{ p: 2.5, bgcolor: '#ffffff', borderTop: '1px solid #DCE6F5', justifyContent: 'space-between' }}>
        {step === 0 && (
          <>
            <Button onClick={handleClose} variant="outlined" color="inherit">
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={analyzing || (!selectedFile && !manualText.trim())}
              startIcon={analyzing ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
              onClick={handleAnalyze}
              sx={{
                px: 3,
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #0369a1 0%, #075985 100%)' },
              }}
            >
              {analyzing ? 'Analyzing with Gemini...' : 'Analyze Document with AI'}
            </Button>
          </>
        )}

        {step === 1 && (
          <>
            <Button onClick={() => setStep(0)} variant="outlined" color="inherit" disabled={importing}>
              Back to Upload
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={importing || selectedIndices.size === 0}
              startIcon={importing ? <CircularProgress size={18} color="inherit" /> : <CloudUploadIcon />}
              onClick={handleFinalImport}
              sx={{ px: 3 }}
            >
              {importing ? 'Importing Questions...' : `Import ${selectedIndices.size} Questions to Bank`}
            </Button>
          </>
        )}

        {step === 2 && (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" color="primary" onClick={handleClose} sx={{ px: 3 }}>
              Done
            </Button>
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
};
