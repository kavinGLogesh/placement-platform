import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ClassIcon from '@mui/icons-material/Class';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import GradeIcon from '@mui/icons-material/Grade';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { AdminNavTabs } from '../../components/management/AdminNavTabs.js';
import { managementService } from '../../services/management.service.js';
import { Student, StudentStatus } from '../../types/management.types.js';

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Dialog State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    cgpa: 8.0,
    status: 'ACTIVE' as StudentStatus,
  });

  const fetchStudent = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await managementService.getStudentById(id);
      setStudent(data);
      setEditForm({
        name: data.name,
        phone: data.phone || '',
        cgpa: data.cgpa || 8.0,
        status: data.status,
      });
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'Failed to load student details';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      const updated = await managementService.updateStudent(id, {
        name: editForm.name,
        phone: editForm.phone,
        cgpa: Number(editForm.cgpa),
        status: editForm.status,
      });
      setStudent(updated);
      setEditDialogOpen(false);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'Failed to update student profile';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <AdminNavTabs />

      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/students')}
          >
            All Students
          </Button>
          <div>
            <Typography variant="overline" color="primary.light" fontWeight={700} letterSpacing={1.2}>
              Student Placement Profile
            </Typography>
            <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
              {student?.name || 'Loading Student...'}
            </Typography>
          </div>
        </Box>

        {student && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => setEditDialogOpen(true)}
          >
            Edit Profile
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" variant="outlined" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={40} />
        </Box>
      ) : student ? (
        <Grid container spacing={3}>
          {/* Identity & Basic Details */}
          <Grid item xs={12} md={5}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SchoolIcon sx={{ color: '#ffffff', fontSize: 32 }} />
                  </Box>
                  <div>
                    <Typography variant="h6" fontWeight={700}>
                      {student.name}
                    </Typography>
                    <Chip
                      label={student.registerNumber}
                      size="small"
                      color="primary"
                      sx={{ fontFamily: 'monospace', fontWeight: 700, mt: 0.5 }}
                    />
                  </div>
                </Box>

                <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <EmailIcon sx={{ color: 'secondary.light', fontSize: 20 }} />
                    <div>
                      <Typography variant="caption" color="text.secondary">
                        College Email
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {student.collegeEmail}
                      </Typography>
                    </div>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <PhoneIcon sx={{ color: 'warning.light', fontSize: 20 }} />
                    <div>
                      <Typography variant="caption" color="text.secondary">
                        Phone Number
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {student.phone || 'Not provided'}
                      </Typography>
                    </div>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckCircleIcon sx={{ color: 'success.light', fontSize: 20 }} />
                    <div>
                      <Typography variant="caption" color="text.secondary">
                        Placement Account Status
                      </Typography>
                      <div>
                        <Chip
                          label={student.status}
                          size="small"
                          color={
                            student.status === 'ACTIVE'
                              ? 'success'
                              : student.status === 'PLACED'
                              ? 'secondary'
                              : student.status === 'BLOCKED'
                              ? 'error'
                              : 'default'
                          }
                          sx={{ fontWeight: 700, mt: 0.5 }}
                        />
                      </div>
                    </div>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <GradeIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                    <div>
                      <Typography variant="caption" color="text.secondary">
                        Cumulative CGPA
                      </Typography>
                      <Typography variant="h6" fontWeight={800} color="warning.light">
                        {student.cgpa !== null && student.cgpa !== undefined ? Number(student.cgpa).toFixed(2) : 'N/A'}
                      </Typography>
                    </div>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Hierarchy Placement & Academic Progress */}
          <Grid item xs={12} md={7}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon sx={{ color: 'primary.light' }} /> Academic Hierarchy Placement
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Strict 6-tier institutional mapping verifying student cohort association.
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(11, 15, 25, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <BusinessIcon fontSize="inherit" /> Department
                      </Typography>
                      <Typography variant="body1" fontWeight={700} color="primary.light">
                        {student.department?.code}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {student.department?.name}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(11, 15, 25, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <MenuBookIcon fontSize="inherit" /> Degree Course
                      </Typography>
                      <Typography variant="body1" fontWeight={700} color="secondary.light">
                        {student.course?.code}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {student.course?.name}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(11, 15, 25, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ClassIcon fontSize="inherit" /> Academic Class
                      </Typography>
                      <Typography variant="body1" fontWeight={700}>
                        {student.class?.name || '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Year {student.year} • Batch {student.class?.batchYear}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(11, 15, 25, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ViewModuleIcon fontSize="inherit" /> Section
                      </Typography>
                      <Typography variant="body1" fontWeight={700} color="success.light">
                        Section {student.section?.name || '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Assigned Cohort Group
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Registered: {new Date(student.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last Profile Update: {new Date(student.updatedAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : null}

      {/* Edit Profile Modal */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 2.5,
          },
        }}
      >
        <form onSubmit={handleUpdate}>
          <DialogTitle sx={{ color: '#f9fafb', fontWeight: 700 }}>
            Edit Student Information
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField
              label="Full Name"
              required
              fullWidth
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
            <TextField
              label="Phone Number"
              fullWidth
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />
            <TextField
              label="Cumulative CGPA"
              type="number"
              fullWidth
              inputProps={{ min: 0, max: 10, step: 0.01 }}
              value={editForm.cgpa}
              onChange={(e) => setEditForm({ ...editForm, cgpa: Number(e.target.value) })}
            />
            <TextField
              select
              label="Account Status"
              required
              fullWidth
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value as StudentStatus })}
            >
              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
              <MenuItem value="PLACED">PLACED</MenuItem>
              <MenuItem value="INACTIVE">INACTIVE</MenuItem>
              <MenuItem value="BLOCKED">BLOCKED</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setEditDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={saving}>
              {saving ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
