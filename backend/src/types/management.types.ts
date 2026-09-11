import { StudentStatus } from '@prisma/client';

export { StudentStatus };

// =============================================================================
// DTOs & Entity Interfaces
// =============================================================================

export interface CollegeDto {
  id: string;
  code: string;
  name: string;
  address?: string | null;
  website?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    departments: number;
  };
}

export interface CreateCollegeDto {
  code: string;
  name: string;
  address?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface UpdateCollegeDto {
  code?: string;
  name?: string;
  address?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface DepartmentDto {
  id: string;
  collegeId: string;
  code: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  college?: { id: string; code: string; name: string };
  _count?: {
    courses: number;
    classes: number;
    students: number;
  };
}

export interface CreateDepartmentDto {
  collegeId: string;
  code: string;
  name: string;
}

export interface UpdateDepartmentDto {
  code?: string;
  name?: string;
}

export interface CourseDto {
  id: string;
  departmentId: string;
  code: string;
  name: string;
  durationYears: number;
  createdAt: Date;
  updatedAt: Date;
  department?: { id: string; code: string; name: string };
  _count?: {
    classes: number;
    students: number;
  };
}

export interface CreateCourseDto {
  departmentId: string;
  code: string;
  name: string;
  durationYears?: number;
}

export interface UpdateCourseDto {
  code?: string;
  name?: string;
  durationYears?: number;
}

export interface ClassDto {
  id: string;
  departmentId: string;
  courseId: string;
  batchYear: number;
  currentYear: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  department?: { id: string; code: string; name: string };
  course?: { id: string; code: string; name: string };
  _count?: {
    sections: number;
    students: number;
  };
}

export interface CreateClassDto {
  departmentId: string;
  courseId: string;
  batchYear: number;
  currentYear: number;
  name?: string;
}

export interface UpdateClassDto {
  name?: string;
  currentYear?: number;
}

export interface SectionDto {
  id: string;
  classId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  class?: {
    id: string;
    name: string;
    batchYear: number;
    currentYear: number;
    course?: { id: string; code: string; name: string };
  };
  _count?: {
    students: number;
  };
}

export interface CreateSectionDto {
  classId: string;
  name: string;
}

export interface UpdateSectionDto {
  name?: string;
}

export interface StudentDto {
  id: string;
  userId?: string | null;
  registerNumber: string;
  name: string;
  collegeEmail: string;
  phone?: string | null;
  departmentId: string;
  courseId: string;
  classId: string;
  sectionId: string;
  year: number;
  cgpa?: number | null;
  status: StudentStatus;
  createdAt: Date;
  updatedAt: Date;
  department?: { id: string; code: string; name: string };
  course?: { id: string; code: string; name: string };
  class?: { id: string; name: string; batchYear: number; currentYear: number };
  section?: { id: string; name: string };
}

export interface CreateStudentDto {
  registerNumber: string;
  name: string;
  collegeEmail: string;
  phone?: string;
  departmentId: string;
  courseId: string;
  classId: string;
  sectionId: string;
  year: number;
  cgpa?: number;
  status?: StudentStatus;
}

export interface UpdateStudentDto {
  name?: string;
  phone?: string;
  departmentId?: string;
  courseId?: string;
  classId?: string;
  sectionId?: string;
  year?: number;
  cgpa?: number;
  status?: StudentStatus;
}

// =============================================================================
// Server-side Query, Pagination & Filter Types
// =============================================================================

export interface StudentQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  courseId?: string;
  classId?: string;
  sectionId?: string;
  year?: number;
  status?: StudentStatus;
  sortBy?: 'name' | 'registerNumber' | 'collegeEmail' | 'cgpa' | 'year' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

// =============================================================================
// Excel Import Types
// =============================================================================

export interface ExcelImportRowError {
  row: number;
  registerNumber?: string;
  field?: string;
  message: string;
}

export interface ExcelImportResult {
  importedCount: number;
  failedCount: number;
  duplicateCount: number;
  errors: ExcelImportRowError[];
}
