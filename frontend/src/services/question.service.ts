import { apiClient } from '../api/axios.client.js';
import {
  Question,
  CreateQuestionInput,
  UpdateQuestionInput,
  QuestionFilters,
  QuestionStatus,
  CATEGORY_TOPICS_MAP,
} from '../types/question.types.js';
import { PaginatedResult } from '../types/management.types.js';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const questionService = {
  async getQuestions(filters: QuestionFilters = {}): Promise<PaginatedResult<Question>> {
    const res = await apiClient.get<ApiResponse<PaginatedResult<Question>>>('/questions', {
      params: filters,
    });
    return res.data.data;
  },

  async getQuestionById(id: string): Promise<Question> {
    const res = await apiClient.get<ApiResponse<Question>>(`/questions/${id}`);
    return res.data.data;
  },

  async createQuestion(payload: CreateQuestionInput): Promise<Question> {
    const res = await apiClient.post<ApiResponse<Question>>('/questions', payload);
    return res.data.data;
  },

  async updateQuestion(id: string, payload: UpdateQuestionInput): Promise<Question> {
    const res = await apiClient.put<ApiResponse<Question>>(`/questions/${id}`, payload);
    return res.data.data;
  },

  async updateQuestionStatus(id: string, status: QuestionStatus): Promise<Question> {
    const res = await apiClient.patch<ApiResponse<Question>>(`/questions/${id}/status`, { status });
    return res.data.data;
  },

  async deleteQuestion(id: string): Promise<void> {
    await apiClient.delete(`/questions/${id}`);
  },

  async getCategoryTopicsMap(): Promise<typeof CATEGORY_TOPICS_MAP> {
    const res = await apiClient.get<ApiResponse<typeof CATEGORY_TOPICS_MAP>>('/questions/categories');
    return res.data.data;
  },
};
