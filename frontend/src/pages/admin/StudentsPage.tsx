import React, { useState, useEffect, useCallback } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FilterListIcon from '@mui/icons-material/FilterList';
import { AdminNavTabs } from '../../components/management/AdminNavTabs.js';
import { DataTable, Column } from '../../components/management/DataTable.js';
import { ConfirmDialog } from '../../components/management/ConfirmDialog.js';
import { managementService } from '../../services/management.service.js';
import {
  Student,
  CreateStudentInput,
  UpdateStudentInput,
  Department,
  Course,
  ClassEntity,
  Section,
  StudentStatus,
  ExcelImportResult,
} from '../../types/management.types.js';

export const StudentsPage: React.FC = () => {
  const navigate = useNavigate();

  // Data & Pagination
  const [students, setStudents] = useState<Student[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search, Filters & Sorting
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [yearFilter, setYearFilter] = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState<StudentStatus | ''>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Relational Hierarchy Options
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  // Create / Edit Student Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentForm, setStudentForm] = useState<CreateStudentInput>({
    registerNumber: '',
    name: '',
    collegeEmail: '',
    phone: '',
    departmentId: '',
    courseId: '',
    classId: '',
    sectionId: '',
    year: 1,
    cgpa: 8.0,
    status: 'ACTIVE',
  });

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Bulk Excel Import Dialog & State
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ExcelImportResult | null>(null);
  const [downloadingReport, setDownloadingReport] = useState(false);

  // Fetch Hierarchy Lookups
  const fetchLookups = async () => {
    try {
      const [deptList, courseList, classList, secList] = await Promise.all([
        managementService.getDepartments(),
        managementService.getCourses(),
        managementService.getClasses(),
        managementService.getSections(),
      ]);
      setDepartments(deptList);
      setCourses(courseList);
      setClasses(classList);
      setSections(secList);
    } catch {
      // Non-blocking lookup load
    }
  };

  useEffect(() => {
    fetchLookups();
  }, []);

  // Fetch Paginated Students
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await managementService.getStudents({
        page: page + 1,
        limit: rowsPerPage,
        search: search.trim() || undefined,
        departmentId: departmentId || undefined,
        courseId: courseId || undefined,
        classId: classId || undefined,
        sectionId: sectionId || undefined,
        year: yearFilter !== '' ? Number(yearFilter) : undefined,
        status: statusFilter || undefined,
        sortBy: sortBy as 'name' | 'registerNumber' | 'collegeEmail' | 'cgpa' | 'year' | 'createdAt',
        sortOrder,
      });
      setStudents(res.data);
      setTotalCount(res.pagination.totalCount);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'Failed to fetch students';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, departmentId, courseId, classId, sectionId, yearFilter, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Form dependent cascading options
  const formCourses = courses.filter((c) => !studentForm.departmentId || c.departmentId === studentForm.departmentId);
  const formClasses = classes.filter((cl) => !studentForm.courseId || cl.courseId === studentForm.courseId);
  const formSections = sections.filter((s) => !studentForm.classId || s.classId === studentForm.classId);

  const handleOpenStudentDialog = (st?: Student) => {
    if (st) {
      setEditingStudent(st);
      setStudentForm({
        registerNumber: st.registerNumber,
        name: st.name,
        collegeEmail: st.collegeEmail,
        phone: st.phone || '',
        departmentId: st.departmentId,
        courseId: st.courseId,
        classId: st.classId,
        sectionId: st.sectionId,
        year: st.year,
        cgpa: st.cgpa || 8.0,
        status: st.status,
      });
    } else {
      const defaultDept = departments[0];
      const defaultCourse = courses.find((c) => c.departmentId === defaultDept?.id) || courses[0];
      const defaultClass = classes.find((cl) => cl.courseId === defaultCourse?.id) || classes[0];
      const defaultSection = sections.find((s) => s.classId === defaultClass?.id) || sections[0];

      setEditingStudent(null);
      setStudentForm({
        registerNumber: '',
        name: '',
        collegeEmail: '',
        phone: '',
        departmentId: defaultDept?.id || '',
        courseId: defaultCourse?.id || '',
        classId: defaultClass?.id || '',
        sectionId: defaultSection?.id || '',
        year: defaultClass?.currentYear || 1,
        cgpa: 8.0,
        status: 'ACTIVE',
      });
    }
    setDialogOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingStudent) {
        const updatePayload: UpdateStudentInput = {
          name: studentForm.name,
          phone: studentForm.phone,
          departmentId: studentForm.departmentId,
          courseId: studentForm.courseId,
          classId: studentForm.classId,
          sectionId: studentForm.sectionId,
          year: Number(studentForm.year),
          cgpa: studentForm.cgpa ? Number(studentForm.cgpa) : undefined,
          status: studentForm.status,
        };
        await managementService.updateStudent(editingStudent.id, updatePayload);
      } else {
        await managementService.createStudent({
          ...studentForm,
          year: Number(studentForm.year),
          cgpa: studentForm.cgpa ? Number(studentForm.cgpa) : undefined,
        });
      }
      setDialogOpen(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'Failed to save student';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await managementService.deleteStudent(deleteTarget.id);
      setDeleteTarget(null);
      fetchStudents();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'Failed to delete student';
      setError(msg);
    } finally {
      setDeleting(false);
    }
  };

  // Excel Bulk Import Handlers
  const handleUploadExcel = async () => {
    if (!importFile) return;
    setImporting(true);
    setError(null);
    try {
      const result = await managementService.importStudents(importFile);
      setImportResult(result);
      fetchStudents();
      fetchLookups();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'Bulk import failed';
      setError(msg);
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await managementService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Students_Import_Template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'Failed to download template';
      setError(msg);
    }
  };

  const handleDownloadErrorReport = async () => {
    if (!importResult?.errors?.length) return;
    setDownloadingReport(true);
    try {
      const blob = await managementService.downloadErrorReport(importResult.errors);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Import_Errors_Report.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'Failed to download error report';
      setError(msg);
    } finally {
      setDownloadingReport(false);
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

  const columns: Column<Student>[] = [
    {
      id: 'registerNumber',
      label: 'Register No.',
      minWidth: 140,
      sortable: true,
      render: (s) => (
        <Typography
          variant="body2"
          fontWeight={700}
          sx={{ fontFamily: 'monospace', color: 'primary.light', cursor: 'pointer' }}
          onClick={() => navigate(`/admin/students/${s.id}`)}
        >
          {s.registerNumber}
        </Typography>
      ),
    },
    {
      id: 'name',
      label: 'Student Name',
      minWidth: 180,
      sortable: true,
      render: (s) => (
        <div>
          <Typography variant="body2" fontWeight={600}>
            {s.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {s.collegeEmail}
          </Typography>
        </div>
      ),
    },
    {
      id: 'department',
      label: 'Dept & Course',
      minWidth: 160,
      render: (s) => (
        <div>
          <Chip label={s.department?.code || '—'} size="small" sx={{ mr: 0.5, fontWeight: 600 }} />
          <Chip label={s.course?.code || '—'} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
        </div>
      ),
    },
    {
      id: 'class',
      label: 'Class & Section',
      minWidth: 140,
      render: (s) => (
        <Typography variant="body2" color="text.secondary">
          {s.class?.name ? `${s.class.name} / Sec ${s.section?.name || ''}` : '—'}
        </Typography>
      ),
    },
    {
      id: 'year',
      label: 'Year',
      minWidth: 80,
      sortable: true,
      render: (s) => `Yr ${s.year}`,
    },
    {
      id: 'cgpa',
      label: 'CGPA',
      minWidth: 90,
      sortable: true,
      render: (s) => (
        <Chip
          label={s.cgpa !== null && s.cgpa !== undefined ? Number(s.cgpa).toFixed(2) : '—'}
          size="small"
          color={Number(s.cgpa) >= 8.5 ? 'success' : Number(s.cgpa) >= 7.0 ? 'primary' : 'warning'}
          sx={{ fontWeight: 700 }}
        />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 110,
      render: (s) => {
        const color =
          s.status === 'ACTIVE'
            ? 'success'
            : s.status === 'PLACED'
            ? 'secondary'
            : s.status === 'BLOCKED'
            ? 'error'
            : 'default';
        return <Chip label={s.status} size="small" color={color} sx={{ fontWeight: 700 }} />;
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 140,
      align: 'right',
      render: (s) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Tooltip title="View Profile">
            <IconButton size="small" onClick={() => navigate(`/admin/students/${s.id}`)} sx={{ color: 'secondary.light' }}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Student">
            <IconButton size="small" onClick={() => handleOpenStudentDialog(s)} sx={{ color: 'primary.light' }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Student">
            <IconButton size="small" onClick={() => setDeleteTarget(s)} sx={{ color: 'error.light' }}>
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

      {/* Page Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <div>
          <Typography variant="overline" color="primary.light" fontWeight={700} letterSpacing={1.2}>
            Institutional Hierarchy — Tier 6
          </Typography>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
            Student Placement Registry
          </Typography>
        </div>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<UploadFileIcon />}
            onClick={() => {
              setImportResult(null);
              setImportFile(null);
              setImportDialogOpen(true);
            }}
          >
            Bulk Excel Import
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenStudentDialog()}
            disabled={departments.length === 0 || sections.length === 0}
          >
            Register Student
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" variant="outlined" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filter Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          backgroundColor: 'rgba(17, 24, 39, 0.65)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FilterListIcon sx={{ color: 'primary.light', fontSize: 20 }} />
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
            Server-Side Multi-Parameter Filtering
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl size="small" fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={departmentId}
                label="Department"
                onChange={(e) => {
                  setDepartmentId(e.target.value);
                  setCourseId('');
                  setClassId('');
                  setSectionId('');
                  setPage(0);
                }}
              >
                <MenuItem value="">All Departments</MenuItem>
                {departments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.code} - {d.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl size="small" fullWidth>
              <InputLabel>Course</InputLabel>
              <Select
                value={courseId}
                label="Course"
                onChange={(e) => {
                  setCourseId(e.target.value);
                  setClassId('');
                  setSectionId('');
                  setPage(0);
                }}
              >
                <MenuItem value="">All Courses</MenuItem>
                {courses
                  .filter((c) => !departmentId || c.departmentId === departmentId)
                  .map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.code}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Academic Year</InputLabel>
              <Select
                value={yearFilter}
                label="Academic Year"
                onChange={(e) => {
                  setYearFilter(e.target.value as number | '');
                  setPage(0);
                }}
              >
                <MenuItem value="">All Years</MenuItem>
                <MenuItem value={1}>1st Year</MenuItem>
                <MenuItem value={2}>2nd Year</MenuItem>
                <MenuItem value={3}>3rd Year</MenuItem>
                <MenuItem value={4}>4th Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={2.4}>
            <FormControl size="small" fullWidth>
              <InputLabel>Placement Status</InputLabel>
              <Select
                value={statusFilter}
                label="Placement Status"
                onChange={(e) => {
                  setStatusFilter(e.target.value as StudentStatus | '');
                  setPage(0);
                }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="PLACED">PLACED</MenuItem>
                <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                <MenuItem value="BLOCKED">BLOCKED</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={2.8} sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="inherit"
              fullWidth
              startIcon={<RefreshIcon />}
              onClick={() => {
                setSearch('');
                setDepartmentId('');
                setCourseId('');
                setClassId('');
                setSectionId('');
                setYearFilter('');
                setStatusFilter('');
                setPage(0);
              }}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Student DataTable */}
      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        searchValue={search}
        searchPlaceholder="Search by student name, register number, or college email..."
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
        emptyMessage="No students found matching current query or filters."
      />

      {/* Create / Edit Student Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 2.5,
          },
        }}
      >
        <form onSubmit={handleSaveStudent}>
          <DialogTitle sx={{ color: '#f9fafb', fontWeight: 700 }}>
            {editingStudent ? 'Edit Student Details' : 'Register New Student'}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Register Number"
                  required
                  fullWidth
                  disabled={!!editingStudent}
                  value={studentForm.registerNumber}
                  onChange={(e) => setStudentForm({ ...studentForm, registerNumber: e.target.value.toUpperCase() })}
                  placeholder="e.g. 717721CSR001"
                  helperText={editingStudent ? 'Register number cannot be changed' : 'Unique student register number'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Student Full Name"
                  required
                  fullWidth
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  placeholder="e.g. Logeshwaran K"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="College Email Address"
                  required
                  type="email"
                  fullWidth
                  disabled={!!editingStudent}
                  value={studentForm.collegeEmail}
                  onChange={(e) => setStudentForm({ ...studentForm, collegeEmail: e.target.value.toLowerCase() })}
                  placeholder="logesh@college.edu"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Contact Phone"
                  fullWidth
                  value={studentForm.phone}
                  onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                  placeholder="+91 9876543210"
                />
              </Grid>

              {/* Cascading Hierarchy Selectors */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Department"
                  required
                  fullWidth
                  value={studentForm.departmentId}
                  onChange={(e) => {
                    const deptId = e.target.value;
                    const cList = courses.filter((c) => c.departmentId === deptId);
                    setStudentForm({
                      ...studentForm,
                      departmentId: deptId,
                      courseId: cList[0]?.id || '',
                      classId: '',
                      sectionId: '',
                    });
                  }}
                >
                  {departments.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.code} — {d.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Degree Course"
                  required
                  fullWidth
                  value={studentForm.courseId}
                  onChange={(e) => {
                    const cId = e.target.value;
                    const clList = classes.filter((cl) => cl.courseId === cId);
                    setStudentForm({
                      ...studentForm,
                      courseId: cId,
                      classId: clList[0]?.id || '',
                      sectionId: '',
                    });
                  }}
                >
                  {formCourses.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Academic Class"
                  required
                  fullWidth
                  value={studentForm.classId}
                  onChange={(e) => {
                    const clId = e.target.value;
                    const secList = sections.filter((s) => s.classId === clId);
                    const selectedCl = classes.find((cl) => cl.id === clId);
                    setStudentForm({
                      ...studentForm,
                      classId: clId,
                      sectionId: secList[0]?.id || '',
                      year: selectedCl?.currentYear || studentForm.year,
                    });
                  }}
                >
                  {formClasses.map((cl) => (
                    <MenuItem key={cl.id} value={cl.id}>
                      {cl.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Section"
                  required
                  fullWidth
                  value={studentForm.sectionId}
                  onChange={(e) => setStudentForm({ ...studentForm, sectionId: e.target.value })}
                >
                  {formSections.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      Section {s.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Current Year"
                  type="number"
                  required
                  fullWidth
                  inputProps={{ min: 1, max: 6 }}
                  value={studentForm.year}
                  onChange={(e) => setStudentForm({ ...studentForm, year: Number(e.target.value) })}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Current CGPA"
                  type="number"
                  fullWidth
                  inputProps={{ min: 0, max: 10, step: 0.01 }}
                  value={studentForm.cgpa ?? ''}
                  onChange={(e) => setStudentForm({ ...studentForm, cgpa: Number(e.target.value) })}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Account Status"
                  required
                  fullWidth
                  value={studentForm.status}
                  onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value as StudentStatus })}
                >
                  <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                  <MenuItem value="PLACED">PLACED</MenuItem>
                  <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                  <MenuItem value="BLOCKED">BLOCKED</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={saving}>
              {saving ? <CircularProgress size={20} color="inherit" /> : 'Save Student'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Bulk Excel Import Modal */}
      <Dialog
        open={importDialogOpen}
        onClose={() => !importing && setImportDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 2.5,
          },
        }}
      >
        <DialogTitle sx={{ color: '#f9fafb', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Bulk Student Excel Import</span>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadTemplate}
          >
            Download Official Template (.xlsx)
          </Button>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Upload student records using <code>.xlsx</code>, <code>.xls</code>, or <code>.csv</code>. The importer automatically performs relational validation, checks email & register number uniqueness, and executes atomic batched insertion.
          </Typography>

          {/* File Picker Box */}
          <Box
            sx={{
              p: 4,
              border: '2px dashed rgba(99, 102, 241, 0.4)',
              borderRadius: 2.5,
              backgroundColor: 'rgba(99, 102, 241, 0.03)',
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'rgba(99, 102, 241, 0.06)',
              },
            }}
            onClick={() => document.getElementById('excel-file-input')?.click()}
          >
            <input
              id="excel-file-input"
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setImportFile(e.target.files[0]);
                  setImportResult(null);
                }
              }}
            />
            <UploadFileIcon sx={{ fontSize: 48, color: 'primary.light', mb: 1 }} />
            <Typography variant="h6" fontWeight={700}>
              {importFile ? importFile.name : 'Select or drop Excel/CSV spreadsheet here'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supported formats: .xlsx, .xls, .csv (up to 10MB)
            </Typography>
          </Box>

          {/* Action Trigger */}
          {importFile && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUploadExcel}
                disabled={importing}
                startIcon={importing ? <CircularProgress size={18} color="inherit" /> : <UploadFileIcon />}
              >
                {importing ? 'Validating & Importing...' : 'Execute Bulk Import'}
              </Button>
            </Box>
          )}

          {/* Import Results Summary */}
          {importResult && (
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <CheckCircleOutlineIcon sx={{ color: 'success.main', fontSize: 28 }} />
                    <Typography variant="h4" fontWeight={800} color="success.main">
                      {importResult.importedCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Successfully Imported
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <ErrorOutlineIcon sx={{ color: 'error.main', fontSize: 28 }} />
                    <Typography variant="h4" fontWeight={800} color="error.main">
                      {importResult.failedCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Failed Rows
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <Typography variant="h4" fontWeight={800} color="warning.main" sx={{ mt: 1 }}>
                      {importResult.duplicateCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Duplicates Rejected
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Error Breakdown Table */}
              {importResult.errors?.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={700} color="error.light">
                      Row-Level Validation Rejection Details ({importResult.errors.length} issues)
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadErrorReport}
                      disabled={downloadingReport}
                    >
                      {downloadingReport ? 'Generating...' : 'Download CSV Error Report'}
                    </Button>
                  </Box>

                  <TableContainer component={Paper} sx={{ maxHeight: 240, bgcolor: 'rgba(11, 15, 25, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ bgcolor: '#111827', color: 'text.secondary', fontWeight: 700 }}>Row</TableCell>
                          <TableCell sx={{ bgcolor: '#111827', color: 'text.secondary', fontWeight: 700 }}>Register No</TableCell>
                          <TableCell sx={{ bgcolor: '#111827', color: 'text.secondary', fontWeight: 700 }}>Field</TableCell>
                          <TableCell sx={{ bgcolor: '#111827', color: 'text.secondary', fontWeight: 700 }}>Error Reason</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {importResult.errors.map((err, idx) => (
                          <TableRow key={idx}>
                            <TableCell sx={{ fontFamily: 'monospace', color: 'warning.light' }}>{err.row}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace' }}>{err.registerNumber || '—'}</TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>{err.field || 'General'}</TableCell>
                            <TableCell sx={{ color: 'error.light' }}>{err.message}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setImportDialogOpen(false)} color="inherit" disabled={importing}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Student Record"
        message={`Are you sure you want to permanently delete student "${deleteTarget?.name}" (${deleteTarget?.registerNumber})?`}
        loading={deleting}
        onConfirm={handleDeleteStudent}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
};
