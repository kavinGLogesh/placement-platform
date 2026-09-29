import React, { useState, useEffect, useMemo } from 'react';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { AdminNavTabs } from '../../components/management/AdminNavTabs.js';
import { DataTable, Column } from '../../components/management/DataTable.js';
import { ConfirmDialog } from '../../components/management/ConfirmDialog.js';
import { managementService } from '../../services/management.service.js';
import { Department, College } from '../../types/management.types.js';

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ collegeId: '', code: '', name: '' });
  const [dialogError, setDialogError] = useState<string | null>(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [deptList, collegeList] = await Promise.all([
        managementService.getDepartments(),
        managementService.getColleges(),
      ]);
      setDepartments(deptList);
      setColleges(collegeList);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load departments';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = (dept?: Department) => {
    setDialogError(null);
    if (dept) {
      setEditingDept(dept);
      setFormData({
        collegeId: dept.collegeId,
        code: dept.code,
        name: dept.name,
      });
    } else {
      setEditingDept(null);
      setFormData({
        collegeId: colleges[0]?.id || '',
        code: '',
        name: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingDept(null);
    setDialogError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setDialogError(null);
    setError(null);
    try {
      if (editingDept) {
        await managementService.updateDepartment(editingDept.id, {
          code: formData.code,
          name: formData.name,
        });
      } else {
        await managementService.createDepartment(formData);
      }
      handleCloseDialog();
      fetchData();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save department';
      setDialogError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      await managementService.deleteDepartment(deleteTarget.id);
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete department';
      setError(msg);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // Client-side search filtering
  const filteredDepartments = useMemo(() => {
    if (!search.trim()) return departments;
    const q = search.toLowerCase();
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.college?.name.toLowerCase().includes(q)
    );
  }, [departments, search]);

  const columns: Column<Department>[] = [
    {
      id: 'code',
      label: 'Dept Code',
      minWidth: 120,
      render: (d) => (
        <Chip label={d.code} size="small" color="primary" sx={{ fontWeight: 700, borderRadius: 1.5 }} />
      ),
    },
    {
      id: 'name',
      label: 'Department Name',
      minWidth: 240,
      render: (d) => (
        <Typography variant="body2" fontWeight={600}>
          {d.name}
        </Typography>
      ),
    },
    {
      id: 'college',
      label: 'Parent College',
      minWidth: 160,
      render: (d) => (
        <Typography variant="body2" color="text.secondary">
          {d.college?.name || d.college?.code || '—'}
        </Typography>
      ),
    },
    {
      id: 'courses',
      label: 'Courses',
      minWidth: 100,
      render: (d) => d._count?.courses ?? 0,
    },
    {
      id: 'classes',
      label: 'Classes',
      minWidth: 100,
      render: (d) => d._count?.classes ?? 0,
    },
    {
      id: 'students',
      label: 'Students',
      minWidth: 100,
      render: (d) => (
        <Chip
          label={d._count?.students ?? 0}
          size="small"
          color={d._count?.students ? 'info' : 'default'}
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
      render: (d) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Tooltip title="Edit Department">
            <IconButton size="small" onClick={() => handleOpenDialog(d)} sx={{ color: 'primary.light' }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Department">
            <IconButton size="small" onClick={() => setDeleteTarget(d)} sx={{ color: 'error.light' }}>
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
            Institutional Hierarchy — Tier 2
          </Typography>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
            Academic Departments
          </Typography>
        </div>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={colleges.length === 0}
          >
            Add Department
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" variant="outlined" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {colleges.length === 0 && !loading && (
        <Alert severity="warning" variant="outlined" sx={{ mb: 3 }}>
          No College found. Please register a College first under the <b>College</b> tab before creating departments.
        </Alert>
      )}

      <DataTable
        columns={columns}
        data={filteredDepartments}
        loading={loading}
        searchValue={search}
        searchPlaceholder="Search departments by name or code..."
        onSearchChange={setSearch}
        emptyMessage="No departments found. Create your first academic department."
      />

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 2.5,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <form onSubmit={handleSave}>
          <DialogTitle sx={{ color: '#0f172a', fontWeight: 700, borderBottom: '1px solid #e2e8f0', pb: 2 }}>
            {editingDept ? 'Edit Department' : 'Create Academic Department'}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2.5 }}>
            {dialogError && (
              <Alert severity="error" variant="outlined" onClose={() => setDialogError(null)}>
                {dialogError}
              </Alert>
            )}

            {!editingDept && colleges.length > 1 && (
              <TextField
                select
                label="Parent College"
                required
                fullWidth
                value={formData.collegeId}
                onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
              >
                {colleges.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </MenuItem>
                ))}
              </TextField>
            )}

            <TextField
              label="Department Name"
              required
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Computer Science, Commerce, Mathematics"
              helperText="Full academic department name"
            />

            <TextField
              label="Department Code"
              required
              fullWidth
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. CS, COM, MATH, ENG"
              helperText="Unique abbreviation code for the department"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={saving}>
              {saving ? <CircularProgress size={20} color="inherit" /> : 'Save Department'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Department"
        message={`Are you sure you want to delete department "${deleteTarget?.name}" (${deleteTarget?.code})? This will restrictively protect existing courses and students.`}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
};
