export type QuestionCategory =
  | 'QUANTITATIVE_APTITUDE'
  | 'LOGICAL_REASONING'
  | 'VERBAL_ABILITY'
  | 'TECHNICAL_MCQ'
  | 'CODING';

export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type QuestionType =
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'FILL_BLANK'
  | 'DESCRIPTIVE';

export type QuestionStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

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

export interface QuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  optionOrder: number;
  isCorrect: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionOptionInput {
  optionText: string;
  optionOrder: number;
  isCorrect: boolean;
}

export interface Question {
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
  createdAt: string;
  updatedAt: string;
  options: QuestionOption[];
  createdBy?: { id: string; email: string } | null;
  _count?: {
    usages: number;
  };
}

export interface CreateQuestionInput {
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
  options?: CreateQuestionOptionInput[];
}

export interface UpdateQuestionInput {
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
  options?: CreateQuestionOptionInput[];
}

export interface QuestionFilters {
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
