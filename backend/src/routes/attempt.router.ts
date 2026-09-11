import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import { Role } from '../types/auth.types.js';
import { attemptController } from '../controllers/attempt.controller.js';

export const attemptRouter = Router();

// Protect attempt endpoints with Token Authentication & STUDENT Role
attemptRouter.use(authenticateToken);
attemptRouter.use(requireRole(Role.STUDENT));

attemptRouter.get('/:attemptId', attemptController.getAttempt);
attemptRouter.post('/:attemptId/answers', attemptController.saveAnswer);
attemptRouter.post('/:attemptId/submit', attemptController.submitAttempt);
