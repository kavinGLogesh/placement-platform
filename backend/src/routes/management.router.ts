import { Router } from 'express';
import multer from 'multer';
import { managementController } from '../controllers/management.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import { Role } from '../types/auth.types.js';
import {
  validateCollegeInput,
  validateDepartmentInput,
  validateCourseInput,
  validateClassInput,
  validateSectionInput,
  validateStudentInput,
  validateStudentQuery,
} from '../validators/management.validator.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
});

export const collegeRouter = Router();
export const departmentRouter = Router();
export const courseRouter = Router();
export const classRouter = Router();
export const sectionRouter = Router();
export const studentManagementRouter = Router();

// Enforce authentication & admin authorization for all management routes
const adminAuth = [authenticateToken, requireRole(Role.SUPER_ADMIN, Role.PLACEMENT_ADMIN)];

// =============================================================================
// 1. COLLEGES (/api/colleges)
// =============================================================================
collegeRouter.use(...adminAuth);
collegeRouter.get('/', managementController.getColleges);
collegeRouter.post('/', validateCollegeInput, managementController.createCollege);
collegeRouter.get('/:id', managementController.getCollegeById);
collegeRouter.put('/:id', managementController.updateCollege);
collegeRouter.delete('/:id', managementController.deleteCollege);

// =============================================================================
// 2. DEPARTMENTS (/api/departments)
// =============================================================================
departmentRouter.use(...adminAuth);
departmentRouter.get('/', managementController.getDepartments);
departmentRouter.post('/', validateDepartmentInput, managementController.createDepartment);
departmentRouter.get('/:id', managementController.getDepartmentById);
departmentRouter.put('/:id', managementController.updateDepartment);
departmentRouter.delete('/:id', managementController.deleteDepartment);

// =============================================================================
// 3. COURSES (/api/courses)
// =============================================================================
courseRouter.use(...adminAuth);
courseRouter.get('/', managementController.getCourses);
courseRouter.post('/', validateCourseInput, managementController.createCourse);
courseRouter.get('/:id', managementController.getCourseById);
courseRouter.put('/:id', managementController.updateCourse);
courseRouter.delete('/:id', managementController.deleteCourse);

// =============================================================================
// 4. CLASSES (/api/classes)
// =============================================================================
classRouter.use(...adminAuth);
classRouter.get('/', managementController.getClasses);
classRouter.post('/', validateClassInput, managementController.createClass);
classRouter.get('/:id', managementController.getClassById);
classRouter.put('/:id', managementController.updateClass);
classRouter.delete('/:id', managementController.deleteClass);

// =============================================================================
// 5. SECTIONS (/api/sections)
// =============================================================================
sectionRouter.use(...adminAuth);
sectionRouter.get('/', managementController.getSections);
sectionRouter.post('/', validateSectionInput, managementController.createSection);
sectionRouter.get('/:id', managementController.getSectionById);
sectionRouter.put('/:id', managementController.updateSection);
sectionRouter.delete('/:id', managementController.deleteSection);

// =============================================================================
// 6. STUDENTS & BULK IMPORT (/api/students)
// =============================================================================
studentManagementRouter.use(...adminAuth);

// Bulk import & templates (register before /:id parameter)
studentManagementRouter.post('/import', upload.single('file'), managementController.importStudents);
studentManagementRouter.get('/import/template', managementController.downloadTemplate);
studentManagementRouter.post('/import/error-report', managementController.downloadErrorReport);

// Server-side paginated & filtered CRUD
studentManagementRouter.get('/', validateStudentQuery, managementController.getStudents);
studentManagementRouter.post('/', validateStudentInput, managementController.createStudent);
studentManagementRouter.get('/:id', managementController.getStudentById);
studentManagementRouter.put('/:id', managementController.updateStudent);
studentManagementRouter.delete('/:id', managementController.deleteStudent);
