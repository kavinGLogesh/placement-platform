
import { Router } from 'express';
import multer from 'multer';
import { questionController } from '../controllers/question.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import { Role } from '../types/auth.types.js';
import {
  validateCreateQuestion,
  validateUpdateQuestion,
  validateQuestionQuery,
} from '../validators/question.validator.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit for documents, images, and spreadsheets
});

export const questionRouter = Router();

// Question bank management routes are strictly restricted to operational PLACEMENT_ADMIN
questionRouter.use(authenticateToken);
questionRouter.use(requireRole(Role.PLACEMENT_ADMIN));

// AI-powered document analysis and question extraction (Gemini multimodal)
questionRouter.post('/ai-analyze', upload.single('file'), questionController.aiAnalyzeDocument);

// Bulk question creation
questionRouter.post('/bulk', questionController.bulkCreateQuestions);

// Category-Topics master dictionary lookup
questionRouter.get('/categories', questionController.getCategories);

// AI-powered classification routes (placed before /:id)
questionRouter.post('/ai/detect', questionController.autoDetectClassification);
questionRouter.post('/ai/batch-classify', questionController.batchClassifyQuestions);
questionRouter.get('/ai/needs-review', questionController.getQuestionsNeedingReview);

// Core Question Bank CRUD
questionRouter.post('/', validateCreateQuestion, questionController.createQuestion);
questionRouter.get('/', validateQuestionQuery, questionController.getQuestions);
questionRouter.get('/:id', questionController.getQuestionById);
questionRouter.put('/:id', validateUpdateQuestion, questionController.updateQuestion);
questionRouter.patch('/:id/status', questionController.updateQuestionStatus);
questionRouter.delete('/:id', questionController.deleteQuestion);

// AI Single Question Classification & Admin Review
questionRouter.post('/:id/classify', questionController.classifyQuestion);
questionRouter.post('/:id/review-classification', questionController.reviewClassification);

// Question Usage Tracking (Phase 5 preparation)
questionRouter.post('/:id/usage', questionController.recordQuestionUsage);

