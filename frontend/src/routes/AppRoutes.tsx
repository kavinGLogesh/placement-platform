import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout.js';
import { HealthStatusPage } from '../pages/HealthStatusPage.js';
import { LoginPage } from '../pages/LoginPage.js';
import { AdminDashboardPage } from '../pages/AdminDashboardPage.js';
import { StudentDashboardPage } from '../pages/StudentDashboardPage.js';
import { CollegePage } from '../pages/admin/CollegePage.js';
import { DepartmentsPage } from '../pages/admin/DepartmentsPage.js';
import { CoursesPage } from '../pages/admin/CoursesPage.js';
import { ClassesPage } from '../pages/admin/ClassesPage.js';
import { SectionsPage } from '../pages/admin/SectionsPage.js';
import { StudentsPage } from '../pages/admin/StudentsPage.js';
import { StudentDetailPage } from '../pages/admin/StudentDetailPage.js';
import { QuestionsPage } from '../pages/admin/QuestionsPage.js';
import { AssessmentsPage } from '../pages/admin/AssessmentsPage.js';
import { AssessmentBuilderPage } from '../pages/admin/AssessmentBuilderPage.js';
import { AssessmentDetailPage } from '../pages/admin/AssessmentDetailPage.js';
import { StudentTestsPage } from '../pages/student/StudentTestsPage.js';
import { StudentAttemptPage } from '../pages/student/StudentAttemptPage.js';
import { StudentResultsPage } from '../pages/student/StudentResultsPage.js';
import { StudentResultDetailPage } from '../pages/student/StudentResultDetailPage.js';
import { AdminAnalyticsPage } from '../pages/admin/AdminAnalyticsPage.js';
import { AdminResultsPage } from '../pages/admin/AdminResultsPage.js';
import { AdminStudentPerformancePage } from '../pages/admin/AdminStudentPerformancePage.js';
import { StudentPerformancePage } from '../pages/student/StudentPerformancePage.js';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage.js';
import { StudentReportsPage } from '../pages/student/StudentReportsPage.js';
import { ProtectedRoute } from './ProtectedRoute.js';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          {/* Phase 1 Health & Architecture Console */}
          <Route index element={<HealthStatusPage />} />

          {/* Phase 2 Auth: Public Login */}
          <Route path="login" element={<LoginPage />} />

          {/* Phase 2 & 3: Protected Admin Management Portal */}
          <Route
            path="admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PLACEMENT_ADMIN']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/college"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PLACEMENT_ADMIN']}>
                <CollegePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/departments"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PLACEMENT_ADMIN']}>
                <DepartmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/courses"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PLACEMENT_ADMIN']}>
                <CoursesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/classes"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PLACEMENT_ADMIN']}>
                <ClassesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/sections"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PLACEMENT_ADMIN']}>
                <SectionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/students"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PLACEMENT_ADMIN']}>
                <StudentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/students/:id"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PLACEMENT_ADMIN']}>
                <StudentDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/questions"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PLACEMENT_ADMIN']}>
                <QuestionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/assessments"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PLACEMENT_ADMIN']}>
                <AssessmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/assessments/create"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PLACEMENT_ADMIN']}>
                <AssessmentBuilderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/assessments/:id"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PLACEMENT_ADMIN']}>
                <AssessmentDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PLACEMENT_ADMIN']}>
                <AdminAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/results"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PLACEMENT_ADMIN']}>
                <AdminResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/reports"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PLACEMENT_ADMIN']}>
                <AdminReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/students/:id/performance"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PLACEMENT_ADMIN']}>
                <AdminStudentPerformancePage />
              </ProtectedRoute>
            }
          />

          {/* Phase 2 & 8 RBAC: Protected Student Workspace */}
          <Route
            path="student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="student/performance"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentPerformancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="student/reports"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentReportsPage />
              </ProtectedRoute>
            }
          />

          {/* Phase 6 Student Assessment Engine Routes */}
          <Route
            path="student/tests"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentTestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="student/tests/available"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentTestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="student/tests/upcoming"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentTestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="student/tests/completed"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentTestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="student/attempt/:attemptId"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentAttemptPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="student/results"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="student/results/:id"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentResultDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
