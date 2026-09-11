import { Router } from 'express';
import { questionController } from '../controllers/question.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import { Role } from '../types/auth.types.js';
import {
  validateCreateQuestion,
  validateUpdateQuestion,
  validateQuestionQuery,
} from '../validators/question.validator.js';

export const questionRouter = Router();

// All question bank management routes are strictly restricted to SUPER_ADMIN & PLACEMENT_ADMIN
questionRouter.use(authenticateToken);
questionRouter.use(requireRole(Role.SUPER_ADMIN, Role.PLACEMENT_ADMIN));

// Category-Topics master dictionary lookup
questionRouter.get('/categories', questionController.getCategories);

// Core Question Bank CRUD
questionRouter.post('/', validateCreateQuestion, questionController.createQuestion);
questionRouter.get('/', validateQuestionQuery, questionController.getQuestions);
questionRouter.get('/:id', questionController.getQuestionById);
questionRouter.put('/:id', validateUpdateQuestion, questionController.updateQuestion);
questionRouter.patch('/:id/status', questionController.updateQuestionStatus);
questionRouter.delete('/:id', questionController.deleteQuestion);

// Question Usage Tracking (Phase 5 preparation)
questionRouter.post('/:id/usage', questionController.recordQuestionUsage);
