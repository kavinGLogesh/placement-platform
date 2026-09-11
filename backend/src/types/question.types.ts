import {
  QuestionCategory,
  QuestionDifficulty,
  QuestionType,
  QuestionStatus,
} from '@prisma/client';

export { QuestionCategory, QuestionDifficulty, QuestionType, QuestionStatus };

// =============================================================================
// Authoritative Category -> Topics Master Matrix
// =============================================================================
export const CATEGORY_TOPICS_MAP: Record<QuestionCategory, readonly string[]> = {
  QUANTITATIVE_APTITUDE: [
    'Percentage',
    'Profit & Loss',
    'Ratio & Proportion',
    'Average',
    'Time & Work',
    'Time Speed Distance',
    'Simple Interest',
    'Compound Interest',
    'Probability',
    'Number System',
    'Permutation & Combination',
    'Data Interpretation',
  ] as const,
  LOGICAL_REASONING: [
    'Number Series',
    'Letter Series',
    'Coding-Decoding',
    'Blood Relations',
    'Direction Sense',
    'Syllogism',
    'Analogy',
    'Classification',
    'Seating Arrangement',
    'Puzzles',
    'Statement & Conclusion',
    'Data Sufficiency',
  ] as const,
  VERBAL_ABILITY: [
    'Synonyms',
    'Antonyms',
    'Grammar',
    'Vocabulary',
    'Error Detection',
    'Sentence Correction',
    'Fill in the Blanks',
    'Para Jumbles',
    'Reading Comprehension',
    'Tenses',
    'Articles',
    'Prepositions',
  ] as const,
  TECHNICAL_MCQ: [
    'C',
    'C++',
    'Java',
    'Python',
    'Data Structures',
    'Algorithms',
    'DBMS',
    'Operating Systems',
    'Computer Networks',
    'OOP',
  ] as const,
  CODING: [
    'Arrays',
    'Strings',
    'Data Structures',
    'Algorithms',
    'Dynamic Programming',
    'Recursion',
    'Math',
    'Bit Manipulation',
  ] as const,
};

// =============================================================================
// DTOs & Interfaces
// =============================================================================

export interface QuestionOptionDto {
  id: string;
  questionId: string;
  optionText: string;
  optionOrder: number;
  isCorrect: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateQuestionOptionDto {
  id?: string;
  optionText: string;
  optionOrder: number;
  isCorrect: boolean;
}

export interface QuestionDto {
  id: string;
  category: QuestionCategory;
  topic: string;
  difficulty: QuestionDifficulty;
  questionType: QuestionType;
  questionText: string;
  marks: number;
  negativeMarks: number;
  correctAnswer?: string | null;
  explanation?: string | null;
  status: QuestionStatus;
  createdById?: string | null;
  createdAt: Date;
  updatedAt: Date;
  options: QuestionOptionDto[];
  createdBy?: { id: string; email: string } | null;
  _count?: {
    usages: number;
  };
}

export interface CreateQuestionDto {
  id?: string;
  category: QuestionCategory;
  topic: string;
  difficulty?: QuestionDifficulty;
  questionType?: QuestionType;
  questionText: string;
  marks?: number;
  negativeMarks?: number;
  correctAnswer?: string;
  explanation?: string;
  status?: QuestionStatus;
  options?: CreateQuestionOptionDto[];
}

export interface UpdateQuestionDto {
  category?: QuestionCategory;
  topic?: string;
  difficulty?: QuestionDifficulty;
  questionType?: QuestionType;
  questionText?: string;
  marks?: number;
  negativeMarks?: number;
  correctAnswer?: string;
  explanation?: string;
  status?: QuestionStatus;
  options?: CreateQuestionOptionDto[];
}

export interface QuestionQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: QuestionCategory;
  topic?: string;
  difficulty?: QuestionDifficulty;
  questionType?: QuestionType;
  status?: QuestionStatus;
  sortBy?: 'createdAt' | 'marks' | 'difficulty' | 'questionType' | 'category';
  sortOrder?: 'asc' | 'desc';
}

export interface QuestionUsageDto {
  id: string;
  questionId: string;
  assessmentId?: string | null;
  studentId?: string | null;
  usageMonth: number;
  usageYear: number;
  usedAt: Date;
}

export interface CreateQuestionUsageDto {
  questionId: string;
  assessmentId?: string;
  studentId?: string;
  usageMonth: number;
  usageYear: number;
}
