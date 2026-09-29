import { AppError } from '../middleware/errorHandler.js';
import {
  CreateGdRoundDto,
  UpdateGdRoundDto,
  SubmitGdEvaluationDto,
  CreateInterviewRoundDto,
  UpdateInterviewRoundDto,
  SubmitInterviewEvaluationDto,
  AttendanceStatus,
  InterviewType,
  GdRoundStatus,
  InterviewRoundStatus,
  DEFAULT_GD_CRITERIA,
  DEFAULT_INTERVIEW_CRITERIA,
  CriterionConfig,
} from '../types/evaluation.types.js';

const VALID_INTERVIEW_TYPES: InterviewType[] = ['MOCK', 'HR', 'TECHNICAL', 'MANAGERIAL'];
const VALID_GD_STATUSES: GdRoundStatus[] = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const VALID_INTERVIEW_STATUSES: InterviewRoundStatus[] = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const VALID_ATTENDANCE_STATUSES: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'PENDING'];

export function validateAttendanceStatus(val: any): AttendanceStatus {
  if (!val || typeof val !== 'string' || !VALID_ATTENDANCE_STATUSES.includes(val.toUpperCase() as AttendanceStatus)) {
    throw new AppError(
      `Invalid attendance status '${val}'. Allowed: ${VALID_ATTENDANCE_STATUSES.join(', ')}`,
      400
    );
  }
  return val.toUpperCase() as AttendanceStatus;
}

export function validateCreateGdRound(body: any): CreateGdRoundDto {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request payload is required', 400);
  }

  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
    throw new AppError('GD round title is required and cannot be empty', 400);
  }

  if (!body.topic || typeof body.topic !== 'string' || !body.topic.trim()) {
    throw new AppError('GD topic is required and cannot be empty', 400);
  }

  if (!body.scheduledDate) {
    throw new AppError('Scheduled date is required', 400);
  }
  const dateObj = new Date(body.scheduledDate);
  if (isNaN(dateObj.getTime())) {
    throw new AppError('Scheduled date must be a valid date format', 400);
  }

  let durationMinutes = 30;
  if (body.durationMinutes !== undefined) {
    durationMinutes = parseInt(String(body.durationMinutes), 10);
    if (isNaN(durationMinutes) || durationMinutes < 5 || durationMinutes > 360) {
      throw new AppError('Duration must be between 5 and 360 minutes', 400);
    }
  }

  let criteria: CriterionConfig[] = DEFAULT_GD_CRITERIA;
  if (body.criteria && Array.isArray(body.criteria)) {
    if (body.criteria.length === 0) {
      throw new AppError('At least one evaluation criterion is required', 400);
    }
    criteria = body.criteria.map((c: any, index: number) => {
      if (!c.name || typeof c.name !== 'string' || !c.name.trim()) {
        throw new AppError(`Criterion at position ${index + 1} must have a valid name`, 400);
      }
      const maxMarks = c.maxMarks !== undefined ? parseFloat(String(c.maxMarks)) : 10;
      if (isNaN(maxMarks) || maxMarks <= 0 || maxMarks > 100) {
        throw new AppError(`Criterion '${c.name}' max marks must be a positive number up to 100`, 400);
      }
      return {
        name: c.name.trim(),
        maxMarks,
        order: c.order !== undefined ? parseInt(String(c.order), 10) : index + 1,
      };
    });
  }

  let studentIds: string[] | undefined;
  if (body.studentIds !== undefined) {
    if (!Array.isArray(body.studentIds)) {
      throw new AppError('studentIds must be an array of student IDs', 400);
    }
    studentIds = body.studentIds.map((id: any) => String(id).trim()).filter(Boolean);
  }

  return {
    title: body.title.trim(),
    topic: body.topic.trim(),
    instructions: body.instructions?.trim() || undefined,
    scheduledDate: dateObj,
    durationMinutes,
    evaluatorId: body.evaluatorId?.trim() || undefined,
    departmentId: body.departmentId?.trim() || undefined,
    courseId: body.courseId?.trim() || undefined,
    batchYear: body.batchYear ? parseInt(String(body.batchYear), 10) : undefined,
    criteria,
    studentIds,
  };
}

export function validateUpdateGdRound(body: any): UpdateGdRoundDto {
  if (!body || typeof body !== 'object') {
    throw new AppError('Update payload is required', 400);
  }

  const dto: UpdateGdRoundDto = {};

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim()) {
      throw new AppError('Title cannot be empty', 400);
    }
    dto.title = body.title.trim();
  }

  if (body.topic !== undefined) {
    if (typeof body.topic !== 'string' || !body.topic.trim()) {
      throw new AppError('Topic cannot be empty', 400);
    }
    dto.topic = body.topic.trim();
  }

  if (body.instructions !== undefined) {
    dto.instructions = body.instructions ? String(body.instructions).trim() : undefined;
  }

  if (body.scheduledDate !== undefined) {
    const d = new Date(body.scheduledDate);
    if (isNaN(d.getTime())) {
      throw new AppError('Scheduled date must be a valid date format', 400);
    }
    dto.scheduledDate = d;
  }

  if (body.durationMinutes !== undefined) {
    const dur = parseInt(String(body.durationMinutes), 10);
    if (isNaN(dur) || dur < 5 || dur > 360) {
      throw new AppError('Duration must be between 5 and 360 minutes', 400);
    }
    dto.durationMinutes = dur;
  }

  if (body.status !== undefined) {
    const st = String(body.status).toUpperCase() as GdRoundStatus;
    if (!VALID_GD_STATUSES.includes(st)) {
      throw new AppError(`Invalid status '${body.status}'. Allowed: ${VALID_GD_STATUSES.join(', ')}`, 400);
    }
    dto.status = st;
  }

  if (body.evaluatorId !== undefined) {
    dto.evaluatorId = body.evaluatorId ? String(body.evaluatorId).trim() : null;
  }
  if (body.departmentId !== undefined) {
    dto.departmentId = body.departmentId ? String(body.departmentId).trim() : null;
  }
  if (body.courseId !== undefined) {
    dto.courseId = body.courseId ? String(body.courseId).trim() : null;
  }
  if (body.batchYear !== undefined) {
    dto.batchYear = body.batchYear ? parseInt(String(body.batchYear), 10) : null;
  }

  return dto;
}

export function validateSubmitGdEvaluation(
  body: any,
  definedCriteria: Array<{ id: string; name: string; maxMarks: number }>
): SubmitGdEvaluationDto {
  if (!body || typeof body !== 'object') {
    throw new AppError('Evaluation payload is required', 400);
  }

  if (!body.participantId || typeof body.participantId !== 'string' || !body.participantId.trim()) {
    throw new AppError('Participant ID is required', 400);
  }

  if (!Array.isArray(body.criterionScores) || body.criterionScores.length === 0) {
    throw new AppError('Criterion scores must be a non-empty array', 400);
  }

  const criterionMap = new Map(definedCriteria.map((c) => [c.id, c]));

  // Check for required criteria coverage
  const submittedIds = new Set<string>();
  const validatedScores = body.criterionScores.map((item: any, idx: number) => {
    if (!item.criterionId || typeof item.criterionId !== 'string') {
      throw new AppError(`Item at position ${idx + 1} is missing criterionId`, 400);
    }
    const criterion = criterionMap.get(item.criterionId);
    if (!criterion) {
      throw new AppError(`Unknown criterion ID '${item.criterionId}' for this GD round`, 400);
    }
    if (submittedIds.has(item.criterionId)) {
      throw new AppError(`Duplicate score submitted for criterion '${criterion.name}'`, 400);
    }
    submittedIds.add(item.criterionId);

    const score = parseFloat(String(item.score));
    if (isNaN(score)) {
      throw new AppError(`Score for '${criterion.name}' must be a valid number`, 400);
    }
    if (score < 0) {
      throw new AppError(`Score for '${criterion.name}' cannot be negative (min: 0)`, 400);
    }
    if (score > criterion.maxMarks) {
      throw new AppError(
        `Score for '${criterion.name}' cannot exceed maximum allowed marks (${criterion.maxMarks})`,
        400
      );
    }

    return {
      criterionId: item.criterionId,
      score,
      comment: item.comment ? String(item.comment).trim() : undefined,
    };
  });

  // Verify that all configured criteria for this round have been evaluated
  for (const c of definedCriteria) {
    if (!submittedIds.has(c.id)) {
      throw new AppError(`Missing required score for criterion: '${c.name}'`, 400);
    }
  }

  return {
    participantId: body.participantId.trim(),
    feedback: body.feedback ? String(body.feedback).trim() : undefined,
    criterionScores: validatedScores,
  };
}

export function validateCreateInterviewRound(body: any): CreateInterviewRoundDto {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request payload is required', 400);
  }

  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
    throw new AppError('Interview round title is required and cannot be empty', 400);
  }

  const interviewType = String(body.interviewType || 'TECHNICAL').toUpperCase() as InterviewType;
  if (!VALID_INTERVIEW_TYPES.includes(interviewType)) {
    throw new AppError(
      `Invalid interview type '${body.interviewType}'. Allowed: ${VALID_INTERVIEW_TYPES.join(', ')}`,
      400
    );
  }

  if (!body.scheduledDate) {
    throw new AppError('Scheduled date is required', 400);
  }
  const dateObj = new Date(body.scheduledDate);
  if (isNaN(dateObj.getTime())) {
    throw new AppError('Scheduled date must be a valid date format', 400);
  }

  let durationMinutes = 30;
  if (body.durationMinutes !== undefined) {
    durationMinutes = parseInt(String(body.durationMinutes), 10);
    if (isNaN(durationMinutes) || durationMinutes < 5 || durationMinutes > 360) {
      throw new AppError('Duration must be between 5 and 360 minutes', 400);
    }
  }

  let criteria: CriterionConfig[] = DEFAULT_INTERVIEW_CRITERIA;
  if (body.criteria && Array.isArray(body.criteria)) {
    if (body.criteria.length === 0) {
      throw new AppError('At least one evaluation criterion is required', 400);
    }
    criteria = body.criteria.map((c: any, index: number) => {
      if (!c.name || typeof c.name !== 'string' || !c.name.trim()) {
        throw new AppError(`Criterion at position ${index + 1} must have a valid name`, 400);
      }
      const maxMarks = c.maxMarks !== undefined ? parseFloat(String(c.maxMarks)) : 10;
      if (isNaN(maxMarks) || maxMarks <= 0 || maxMarks > 100) {
        throw new AppError(`Criterion '${c.name}' max marks must be a positive number up to 100`, 400);
      }
      return {
        name: c.name.trim(),
        maxMarks,
        order: c.order !== undefined ? parseInt(String(c.order), 10) : index + 1,
      };
    });
  }

  let studentIds: string[] | undefined;
  if (body.studentIds !== undefined) {
    if (!Array.isArray(body.studentIds)) {
      throw new AppError('studentIds must be an array of student IDs', 400);
    }
    studentIds = body.studentIds.map((id: any) => String(id).trim()).filter(Boolean);
  }

  return {
    title: body.title.trim(),
    interviewType,
    instructions: body.instructions?.trim() || undefined,
    scheduledDate: dateObj,
    durationMinutes,
    evaluatorId: body.evaluatorId?.trim() || undefined,
    departmentId: body.departmentId?.trim() || undefined,
    courseId: body.courseId?.trim() || undefined,
    batchYear: body.batchYear ? parseInt(String(body.batchYear), 10) : undefined,
    criteria,
    studentIds,
  };
}

export function validateUpdateInterviewRound(body: any): UpdateInterviewRoundDto {
  if (!body || typeof body !== 'object') {
    throw new AppError('Update payload is required', 400);
  }

  const dto: UpdateInterviewRoundDto = {};

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim()) {
      throw new AppError('Title cannot be empty', 400);
    }
    dto.title = body.title.trim();
  }

  if (body.interviewType !== undefined) {
    const t = String(body.interviewType).toUpperCase() as InterviewType;
    if (!VALID_INTERVIEW_TYPES.includes(t)) {
      throw new AppError(`Invalid interview type '${body.interviewType}'. Allowed: ${VALID_INTERVIEW_TYPES.join(', ')}`, 400);
    }
    dto.interviewType = t;
  }

  if (body.instructions !== undefined) {
    dto.instructions = body.instructions ? String(body.instructions).trim() : undefined;
  }

  if (body.scheduledDate !== undefined) {
    const d = new Date(body.scheduledDate);
    if (isNaN(d.getTime())) {
      throw new AppError('Scheduled date must be a valid date format', 400);
    }
    dto.scheduledDate = d;
  }

  if (body.durationMinutes !== undefined) {
    const dur = parseInt(String(body.durationMinutes), 10);
    if (isNaN(dur) || dur < 5 || dur > 360) {
      throw new AppError('Duration must be between 5 and 360 minutes', 400);
    }
    dto.durationMinutes = dur;
  }

  if (body.status !== undefined) {
    const st = String(body.status).toUpperCase() as InterviewRoundStatus;
    if (!VALID_INTERVIEW_STATUSES.includes(st)) {
      throw new AppError(`Invalid status '${body.status}'. Allowed: ${VALID_INTERVIEW_STATUSES.join(', ')}`, 400);
    }
    dto.status = st;
  }

  if (body.evaluatorId !== undefined) {
    dto.evaluatorId = body.evaluatorId ? String(body.evaluatorId).trim() : null;
  }
  if (body.departmentId !== undefined) {
    dto.departmentId = body.departmentId ? String(body.departmentId).trim() : null;
  }
  if (body.courseId !== undefined) {
    dto.courseId = body.courseId ? String(body.courseId).trim() : null;
  }
  if (body.batchYear !== undefined) {
    dto.batchYear = body.batchYear ? parseInt(String(body.batchYear), 10) : null;
  }

  return dto;
}

export function validateSubmitInterviewEvaluation(
  body: any,
  definedCriteria: Array<{ id: string; name: string; maxMarks: number }>
): SubmitInterviewEvaluationDto {
  if (!body || typeof body !== 'object') {
    throw new AppError('Evaluation payload is required', 400);
  }

  if (!body.participantId || typeof body.participantId !== 'string' || !body.participantId.trim()) {
    throw new AppError('Participant ID is required', 400);
  }

  if (!Array.isArray(body.criterionScores) || body.criterionScores.length === 0) {
    throw new AppError('Criterion scores must be a non-empty array', 400);
  }

  const criterionMap = new Map(definedCriteria.map((c) => [c.id, c]));

  const submittedIds = new Set<string>();
  const validatedScores = body.criterionScores.map((item: any, idx: number) => {
    if (!item.criterionId || typeof item.criterionId !== 'string') {
      throw new AppError(`Item at position ${idx + 1} is missing criterionId`, 400);
    }
    const criterion = criterionMap.get(item.criterionId);
    if (!criterion) {
      throw new AppError(`Unknown criterion ID '${item.criterionId}' for this interview round`, 400);
    }
    if (submittedIds.has(item.criterionId)) {
      throw new AppError(`Duplicate score submitted for criterion '${criterion.name}'`, 400);
    }
    submittedIds.add(item.criterionId);

    const score = parseFloat(String(item.score));
    if (isNaN(score)) {
      throw new AppError(`Score for '${criterion.name}' must be a valid number`, 400);
    }
    if (score < 0) {
      throw new AppError(`Score for '${criterion.name}' cannot be negative (min: 0)`, 400);
    }
    if (score > criterion.maxMarks) {
      throw new AppError(
        `Score for '${criterion.name}' cannot exceed maximum allowed marks (${criterion.maxMarks})`,
        400
      );
    }

    return {
      criterionId: item.criterionId,
      score,
      comment: item.comment ? String(item.comment).trim() : undefined,
    };
  });

  for (const c of definedCriteria) {
    if (!submittedIds.has(c.id)) {
      throw new AppError(`Missing required score for criterion: '${c.name}'`, 400);
    }
  }

  return {
    participantId: body.participantId.trim(),
    strengths: body.strengths ? String(body.strengths).trim() : undefined,
    areasForImprovement: body.areasForImprovement ? String(body.areasForImprovement).trim() : undefined,
    overallFeedback: body.overallFeedback ? String(body.overallFeedback).trim() : undefined,
    criterionScores: validatedScores,
  };
}
