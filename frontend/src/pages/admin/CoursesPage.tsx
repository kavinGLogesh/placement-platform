import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { AdminNavTabs } from '../../components/management/AdminNavTabs.js';
import { DataTable, Column } from '../../components/management/DataTable.js';
import { ConfirmDialog } from '../../components/management/ConfirmDialog.js';
import { managementService } from '../../services/management.service.js';
import { Course, Department } from '../../types/management.types.js';

export const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({ departmentId: '', code: '', name: '', durationYears: 4 });

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [courseList, deptList] = await Promise.all([
        managementService.getCourses(selectedDeptFilter || undefined),
        managementService.getDepartments(),
      ]);
      setCourses(courseList);
      setDepartments(deptList);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'Failed to load courses';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedDeptFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenDialog = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        departmentId: course.departmentId,
        code: course.code,
        name: course.name,
        durationYears: course.durationYears,
      });
    } else {
      setEditingCourse(null);
      setFormData({
        departmentId: selectedDeptFilter || departments[0]?.id || '',
        code: '',
        name: '',
        durationYears: 4,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCourse(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingCourse) {
        await managementService.updateCourse(editingCourse.id, {
          code: formData.code,
          name: formData.name,
          durationYears: Number(formData.durationYears),
        });
      } else {
        await managementService.createCourse({
          ...formData,
          durationYears: Number(formData.durationYears),
        });
      }
      handleCloseDialog();
      fetchData();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'Failed to save course';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await managementService.deleteCourse(deleteTarget.id);
      setDeleteTarget(null);
      fetchData();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'Failed to delete course';
      setError(msg);
    } finally {
      setDeleting(false);
    }
  };

  const filteredCourses = useMemo(() => {
    if (!search.trim()) return courses;
    const q = search.toLowerCase();
    return courses.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.department?.name.toLowerCase().includes(q)
    );
  }, [courses, search]);

  const columns: Column<Course>[] = [
    {
      id: 'code',
      label: 'Course Code',
      minWidth: 120,
      render: (c) => (
        <Chip label={c.code} size="small" color="secondary" sx={{ fontWeight: 700, borderRadius: 1.5 }} />
      ),
    },
    {
      id: 'name',
      label: 'Course Degree Name',
      minWidth: 240,
      render: (c) => (
        <Typography variant="body2" fontWeight={600}>
          {c.name}
        </Typography>
      ),
    },
    {
      id: 'department',
      label: 'Department',
      minWidth: 180,
      render: (c) => (
        <Typography variant="body2" color="text.secondary">
          {c.department?.name || '—'}
        </Typography>
      ),
    },
    {
      id: 'duration',
      label: 'Duration',
      minWidth: 100,
      render: (c) => `${c.durationYears} Years`,
    },
    {
      id: 'classes',
      label: 'Classes',
      minWidth: 100,
      render: (c) => c._count?.classes ?? 0,
    },
    {
      id: 'students',
      label: 'Students',
      minWidth: 100,
      render: (c) => (
        <Chip
          label={c._count?.students ?? 0}
          size="small"
          color={c._count?.students ? 'primary' : 'default'}
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 120,
      align: 'right',
      render: (c) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Tooltip title="Edit Course">
            <IconButton size="small" onClick={() => handleOpenDialog(c)} sx={{ color: 'primary.light' }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Course">
            <IconButton size="small" onClick={() => setDeleteTarget(c)} sx={{ color: 'error.light' }}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <AdminNavTabs />

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <div>
          <Typography variant="overline" color="primary.light" fontWeight={700} letterSpacing={1.2}>
            Institutional Hierarchy — Tier 3
          </Typography>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
            Degree Courses
          </Typography>
        </div>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="dept-filter-label">Filter Department</InputLabel>
            <Select
              labelId="dept-filter-label"
              value={selectedDeptFilter}
              label="Filter Department"
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="outlined" color="inherit" startIcon={<RefreshIcon />} onClick={fetchData} disabled={loading}>
            Refresh
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={departments.length === 0}
          >
            Add Course
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" variant="outlined" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {departments.length === 0 && !loading && (
        <Alert severity="warning" variant="outlined" sx={{ mb: 3 }}>
          No Department found. Please create a Department under <b>Departments</b> first before adding courses.
        </Alert>
      )}

      <DataTable
        columns={columns}
        data={filteredCourses}
        loading={loading}
        searchValue={search}
        searchPlaceholder="Search courses by name or code..."
        onSearchChange={setSearch}
        emptyMessage="No degree courses found. Create your first course."
      />

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
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
        <form onSubmit={handleSave}>
          <DialogTitle sx={{ color: '#f9fafb', fontWeight: 700 }}>
            {editingCourse ? 'Edit Degree Course' : 'Add Degree Course'}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {!editingCourse && (
              <TextField
                select
                label="Parent Department"
                required
                fullWidth
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              >
                {departments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.code} — {d.name}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <TextField
              label="Course Code"
              required
              fullWidth
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. BTECH-CSE, BE-ECE"
              helperText="Unique code within the department"
            />

            <TextField
              label="Course Name"
              required
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. B.Tech Computer Science & Engineering"
            />

            <TextField
              label="Duration (Years)"
              type="number"
              required
              fullWidth
              inputProps={{ min: 1, max: 6 }}
              value={formData.durationYears}
              onChange={(e) => setFormData({ ...formData, durationYears: Number(e.target.value) })}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={saving}>
              {saving ? <CircularProgress size={20} color="inherit" /> : 'Save Course'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Course"
        message={`Are you sure you want to delete course "${deleteTarget?.name}" (${deleteTarget?.code})?`}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
};
