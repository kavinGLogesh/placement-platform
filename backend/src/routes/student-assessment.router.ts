import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import { Role } from '../types/auth.types.js';
import { attemptController } from '../controllers/attempt.controller.js';
import { analyticsController } from '../controllers/analytics.controller.js';

export const studentAssessmentRouter = Router();

// Protect all student routes with Token Authentication & STUDENT Role
studentAssessmentRouter.use(authenticateToken);
studentAssessmentRouter.use(requireRole(Role.STUDENT));

// Phase 8: Student Dashboard & Performance
studentAssessmentRouter.get('/dashboard', analyticsController.getStudentDashboard);
studentAssessmentRouter.get('/performance', analyticsController.getStudentPerformance);

// 1. Student Tests listing & filtering
studentAssessmentRouter.get('/tests', attemptController.getStudentTests);
studentAssessmentRouter.get('/tests/available', (req, res, next) => {
  req.query.status = 'AVAILABLE';
  attemptController.getStudentTests(req, res, next);
});
studentAssessmentRouter.get('/tests/upcoming', (req, res, next) => {
  req.query.status = 'UPCOMING';
  attemptController.getStudentTests(req, res, next);
});
studentAssessmentRouter.get('/tests/completed', (req, res, next) => {
  req.query.status = 'COMPLETED';
  attemptController.getStudentTests(req, res, next);
});

// 2. Start Assessment
studentAssessmentRouter.post('/assessments/:assessmentId/start', attemptController.startAssessment);

// 3. Attempt interactions
studentAssessmentRouter.get('/attempts/:attemptId', attemptController.getAttempt);
studentAssessmentRouter.post('/attempts/:attemptId/answers', attemptController.saveAnswer);
studentAssessmentRouter.post('/attempts/:attemptId/submit', attemptController.submitAttempt);

// 4. Student Results
studentAssessmentRouter.get('/results', attemptController.getStudentResults);
studentAssessmentRouter.get('/results/:id', attemptController.getResultDetail);
