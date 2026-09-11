import { Request, Response, NextFunction } from 'express';
import { QuestionService, questionService } from '../services/question.service.js';
import { sendSuccess } from '../utils/response.util.js';
import { QuestionQueryFilters, QuestionStatus } from '../types/question.types.js';
import { AppError } from '../middleware/errorHandler.js';

export class QuestionController {
  constructor(private readonly service: QuestionService = questionService) {}

  createQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const createdById = req.user?.sub;
      const question = await this.service.createQuestion(req.body, createdById);
      sendSuccess(res, 'Question created successfully', question, 201);
    } catch (error) {
      next(error);
    }
  };

  getQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: QuestionQueryFilters = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        search: req.query.search ? String(req.query.search) : undefined,
        category: req.query.category as QuestionQueryFilters['category'],
        topic: req.query.topic ? String(req.query.topic) : undefined,
        difficulty: req.query.difficulty as QuestionQueryFilters['difficulty'],
        questionType: req.query.questionType as QuestionQueryFilters['questionType'],
        status: req.query.status as QuestionQueryFilters['status'],
        sortBy: req.query.sortBy as QuestionQueryFilters['sortBy'],
        sortOrder: req.query.sortOrder as QuestionQueryFilters['sortOrder'],
      };

      const result = await this.service.getQuestions(filters);
      sendSuccess(res, 'Questions retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  };

  getQuestionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const question = await this.service.getQuestionById(id);
      sendSuccess(res, 'Question details retrieved', question);
    } catch (error) {
      next(error);
    }
  };

  updateQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const question = await this.service.updateQuestion(id, req.body);
      sendSuccess(res, 'Question updated successfully', question);
    } catch (error) {
      next(error);
    }
  };

  updateQuestionStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const { status } = req.body as { status?: QuestionStatus };
      if (!status) {
        throw new AppError("Field 'status' is required", 400);
      }
      const question = await this.service.updateQuestionStatus(id, status);
      sendSuccess(res, 'Question status updated successfully', question);
    } catch (error) {
      next(error);
    }
  };

  deleteQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      await this.service.deleteQuestion(id);
      sendSuccess(res, 'Question deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  recordQuestionUsage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const { assessmentId, studentId, usageMonth, usageYear } = req.body;
      const usage = await this.service.recordQuestionUsage({
        questionId: id,
        assessmentId,
        studentId,
        usageMonth: Number(usageMonth) || new Date().getMonth() + 1,
        usageYear: Number(usageYear) || new Date().getFullYear(),
      });
      sendSuccess(res, 'Question usage recorded successfully', usage, 201);
    } catch (error) {
      next(error);
    }
  };

  getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const map = this.service.getCategoryTopicsMap();
      sendSuccess(res, 'Category-topics mapping retrieved', map);
    } catch (error) {
      next(error);
    }
  };
}

export const questionController = new QuestionController();
