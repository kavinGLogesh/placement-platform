export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';

export interface SanitizedOptionDto {
  id: string;
  optionText: string;
  optionOrder: number;
}

export interface SanitizedPaperQuestionDto {
  id: string;
  paperId: string;
  questionId: string;
  questionOrder: number;
  marks: number;
  negativeMarks: number;
  questionText: string;
  category: string;
  topic: string;
  difficulty: string;
  questionType: string;
  options: SanitizedOptionDto[];
}

export interface AttemptAnswerDto {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptionIds?: string[] | null;
  textAnswer?: string | null;
  isMarkedForReview: boolean;
  answeredAt: Date | string;
  version: number;
}

export interface AssessmentAttemptDto {
  id: string;
  studentId: string;
  assessmentId: string;
  paperId?: string | null;
  attemptNumber: number;
  startTime: Date | string;
  expectedEndTime: Date | string;
  status: AttemptStatus;
  currentQuestion: number;
  submittedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  assessment?: {
    id: string;
    name: string;
    description?: string | null;
    duration: number;
    passingPercentage: number;
    negativeMarking: boolean;
    totalMarks?: number;
    totalQuestions?: number;
  };
  questions?: SanitizedPaperQuestionDto[];
  answers?: AttemptAnswerDto[];
}

export interface AssessmentResultDto {
  id: string;
  attemptId: string;
  assessmentId: string;
  studentId: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  accuracy: number;
  isPassed: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  assessment?: {
    id: string;
    name: string;
    duration: number;
    passingPercentage: number;
  };
}

export type StudentTestStatus = 'AVAILABLE' | 'UPCOMING' | 'COMPLETED';

export interface StudentAssessmentItemDto {
  id: string;
  name: string;
  description?: string | null;
  duration: number;
  passingPercentage: number;
  negativeMarking: boolean;
  totalMarks: number;
  totalQuestions: number;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  status: StudentTestStatus;
  maximumAttempts: number;
  attemptsCount: number;
  activeAttemptId?: string | null;
  lastResultId?: string | null;
}

export interface SaveAnswerDto {
  questionId: string;
  selectedOptionIds?: string[] | null;
  textAnswer?: string | null;
  isMarkedForReview?: boolean;
  currentQuestion?: number;
  version?: number;
  clientTimestamp?: string;
}

export interface BatchSyncAnswersDto {
  answers: SaveAnswerDto[];
  currentQuestion?: number;
}
