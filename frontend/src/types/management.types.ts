export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'PLACED' | 'BLOCKED';

export interface College {
  id: string;
  code: string;
  name: string;
  address?: string | null;
  website?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    departments: number;
  };
}

export interface CreateCollegeInput {
  code: string;
  name: string;
  address?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface Department {
  id: string;
  collegeId: string;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  college?: { id: string; code: string; name: string };
  _count?: {
    courses: number;
    classes: number;
    students: number;
  };
}

export interface CreateDepartmentInput {
  collegeId: string;
  code: string;
  name: string;
}

export interface Course {
  id: string;
  departmentId: string;
  code: string;
  name: string;
  durationYears: number;
  createdAt: string;
  updatedAt: string;
  department?: { id: string; code: string; name: string };
  _count?: {
    classes: number;
    students: number;
  };
}

export interface CreateCourseInput {
  departmentId: string;
  code: string;
  name: string;
  durationYears?: number;
}

export interface ClassEntity {
  id: string;
  departmentId: string;
  courseId: string;
  batchYear: number;
  currentYear: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  department?: { id: string; code: string; name: string };
  course?: { id: string; code: string; name: string };
  _count?: {
    sections: number;
    students: number;
  };
}

export interface CreateClassInput {
  departmentId: string;
  courseId: string;
  batchYear: number;
  currentYear: number;
  name: string;
}

export interface Section {
  id: string;
  classId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  class?: { id: string; name: string; batchYear: number; currentYear: number };
  _count?: {
    students: number;
  };
}

export interface CreateSectionInput {
  classId: string;
  name: string;
}

export interface Student {
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
  createdAt: string;
  updatedAt: string;
  department?: { id: string; code: string; name: string };
  course?: { id: string; code: string; name: string };
  class?: { id: string; name: string; batchYear: number; currentYear: number };
  section?: { id: string; name: string };
}

export interface CreateStudentInput {
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

export interface UpdateStudentInput {
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

export interface StudentFilters {
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
