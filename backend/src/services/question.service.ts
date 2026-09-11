import { QuestionRepository, questionRepository } from '../repositories/question.repository.js';
import {
  QuestionDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionQueryFilters,
  QuestionUsageDto,
  CreateQuestionUsageDto,
  QuestionStatus,
  CATEGORY_TOPICS_MAP,
} from '../types/question.types.js';
import { PaginatedResult } from '../types/management.types.js';
import { AppError } from '../middleware/errorHandler.js';
import { validateCategoryTopic, validateQuestionOptions } from '../validators/question.validator.js';

export class QuestionService {
  constructor(private readonly repository: QuestionRepository = questionRepository) {}

  async createQuestion(payload: CreateQuestionDto, createdById?: string): Promise<QuestionDto> {
    validateCategoryTopic(payload.category, payload.topic);
    validateQuestionOptions(payload.questionType || 'SINGLE_CHOICE', payload.options, payload.correctAnswer);
    return this.repository.createQuestion(payload, createdById);
  }

  async getQuestions(filters: QuestionQueryFilters = {}): Promise<PaginatedResult<QuestionDto>> {
    return this.repository.findQuestions(filters);
  }

  async getQuestionById(id: string): Promise<QuestionDto> {
    const question = await this.repository.findQuestionById(id);
    if (!question) {
      throw new AppError('Question not found', 404);
    }
    return question;
  }

  async updateQuestion(id: string, payload: UpdateQuestionDto): Promise<QuestionDto> {
    const existing = await this.getQuestionById(id);

    const category = payload.category ?? existing.category;
    const topic = payload.topic ?? existing.topic;
    validateCategoryTopic(category, topic);

    const qType = payload.questionType ?? existing.questionType;
    if (payload.options !== undefined || payload.correctAnswer !== undefined) {
      validateQuestionOptions(qType, payload.options, payload.correctAnswer ?? existing.correctAnswer);
    }

    return this.repository.updateQuestion(id, payload);
  }

  async updateQuestionStatus(id: string, status: QuestionStatus): Promise<QuestionDto> {
    await this.getQuestionById(id);
    return this.repository.updateQuestionStatus(id, status);
  }

  async deleteQuestion(id: string): Promise<void> {
    await this.getQuestionById(id);
    return this.repository.deleteQuestion(id);
  }

  async recordQuestionUsage(payload: CreateQuestionUsageDto): Promise<QuestionUsageDto> {
    await this.getQuestionById(payload.questionId);
    return this.repository.recordQuestionUsage(payload);
  }

  getCategoryTopicsMap(): typeof CATEGORY_TOPICS_MAP {
    return CATEGORY_TOPICS_MAP;
  }
}

export const questionService = new QuestionService();
