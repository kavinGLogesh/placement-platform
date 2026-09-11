import { AssessmentDto, AssessmentPaperDto } from '../types/assessment.types.js';
import { AttemptAnswerDto } from '../types/attempt.types.js';

export interface CalculatedScore {
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  accuracy: number;
  isPassed: boolean;
}

export class ScoringService {
  /**
   * Authoritatively evaluates student answers against the assigned Phase 5 examination paper
   */
  calculateScore(
    assessment: AssessmentDto,
    paper: AssessmentPaperDto,
    answers: AttemptAnswerDto[]
  ): CalculatedScore {
    let totalMarks = 0;
    let rawScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const answerMap = new Map<string, AttemptAnswerDto>();
    for (const ans of answers) {
      answerMap.set(ans.questionId, ans);
    }

    const questions = paper.questions || [];

    for (const q of questions) {
      const qMarks = q.marks ?? 1.0;
      const qNegative = assessment.negativeMarking ? (q.negativeMarks ?? 0.0) : 0.0;
      totalMarks += qMarks;

      const ans = answerMap.get(q.questionId);

      const hasSelectedOptions = Array.isArray(ans?.selectedOptionIds) && ans.selectedOptionIds.length > 0;
      const hasTextAnswer = typeof ans?.textAnswer === 'string' && ans.textAnswer.trim().length > 0;

      if (!ans || (!hasSelectedOptions && !hasTextAnswer)) {
        unansweredCount++;
        continue;
      }

      // 1. Single Choice & True/False
      if (q.questionType === 'SINGLE_CHOICE' || q.questionType === 'TRUE_FALSE') {
        const correctOpt = (q.randomizedOptions || []).find((opt) => opt.isCorrect);
        const studentSelected = ans.selectedOptionIds ? ans.selectedOptionIds[0] : null;

        if (correctOpt && studentSelected === correctOpt.id) {
          correctCount++;
          rawScore += qMarks;
        } else {
          incorrectCount++;
          rawScore -= qNegative;
        }
      }
      // 2. Multiple Choice
      else if (q.questionType === 'MULTIPLE_CHOICE') {
        const correctOptIds = new Set(
          (q.randomizedOptions || []).filter((opt) => opt.isCorrect).map((opt) => opt.id)
        );
        const studentSelectedIds = new Set(ans.selectedOptionIds || []);

        const isExactMatch =
          correctOptIds.size === studentSelectedIds.size &&
          Array.from(correctOptIds).every((id) => studentSelectedIds.has(id));

        if (isExactMatch) {
          correctCount++;
          rawScore += qMarks;
        } else {
          incorrectCount++;
          rawScore -= qNegative;
        }
      }
      // 3. Fill in Blank
      else if (q.questionType === 'FILL_BLANK') {
        const correctText = (q.randomizedOptions || []).find((opt) => opt.isCorrect)?.optionText || '';
        const studentText = ans.textAnswer ? ans.textAnswer.trim().toLowerCase() : '';

        if (correctText && studentText === correctText.trim().toLowerCase()) {
          correctCount++;
          rawScore += qMarks;
        } else {
          incorrectCount++;
          rawScore -= qNegative;
        }
      }
      // 4. Other types (Default objective check)
      else {
        const correctOpt = (q.randomizedOptions || []).find((opt) => opt.isCorrect);
        if (correctOpt && ans.selectedOptionIds && ans.selectedOptionIds.includes(correctOpt.id)) {
          correctCount++;
          rawScore += qMarks;
        } else {
          incorrectCount++;
          rawScore -= qNegative;
        }
      }
    }

    const obtainedMarks = Math.max(0, Math.round(rawScore * 100) / 100);
    const roundedTotalMarks = Math.round(totalMarks * 100) / 100;
    const percentage =
      roundedTotalMarks > 0
        ? Math.max(0, Math.min(100, Math.round(((obtainedMarks / roundedTotalMarks) * 100) * 100) / 100))
        : 0;

    const totalAnswered = correctCount + incorrectCount;
    const accuracy =
      totalAnswered > 0 ? Math.round(((correctCount / totalAnswered) * 100) * 100) / 100 : 0;

    const isPassed = percentage >= (assessment.passingPercentage ?? 50.0);

    return {
      totalMarks: roundedTotalMarks,
      obtainedMarks,
      percentage,
      correctCount,
      incorrectCount,
      unansweredCount,
      accuracy,
      isPassed,
    };
  }
}

export const scoringService = new ScoringService();
