import { prisma } from '../config/prisma.config.js';
import {
  QuestionDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionQueryFilters,
  QuestionUsageDto,
  CreateQuestionUsageDto,
  QuestionStatus,
  QuestionOptionDto,
} from '../types/question.types.js';
import { PaginatedResult } from '../types/management.types.js';
import { AppError } from '../middleware/errorHandler.js';

class InMemoryQuestionStore {
  public questions: Map<string, QuestionDto> = new Map();
  public usages: Map<string, QuestionUsageDto> = new Map();
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Seed realistic sample questions across categories
    const q1Id = 'q-sample-quant-001';
    const q1: QuestionDto = {
      id: q1Id,
      category: 'QUANTITATIVE_APTITUDE',
      topic: 'Percentage',
      difficulty: 'MEDIUM',
      questionType: 'SINGLE_CHOICE',
      questionText: 'A fruit seller had some apples. He sells 40% apples and still has 420 apples. Originally, how many apples did he have?',
      marks: 2.0,
      negativeMarks: 0.5,
      correctAnswer: '700 apples',
      explanation: 'Suppose he had x apples originally. (100 - 40)% of x = 420 => 60% of x = 420 => x = (420 * 100) / 60 = 700.',
      status: 'ACTIVE',
      createdById: 'usr-super-admin-001',
      createdAt: new Date(),
      updatedAt: new Date(),
      options: [
        { id: 'opt-q1-1', questionId: q1Id, optionText: '588 apples', optionOrder: 1, isCorrect: false, createdAt: new Date(), updatedAt: new Date() },
        { id: 'opt-q1-2', questionId: q1Id, optionText: '600 apples', optionOrder: 2, isCorrect: false, createdAt: new Date(), updatedAt: new Date() },
        { id: 'opt-q1-3', questionId: q1Id, optionText: '700 apples', optionOrder: 3, isCorrect: true, createdAt: new Date(), updatedAt: new Date() },
        { id: 'opt-q1-4', questionId: q1Id, optionText: '672 apples', optionOrder: 4, isCorrect: false, createdAt: new Date(), updatedAt: new Date() },
      ],
      _count: { usages: 0 },
    };

    const q2Id = 'q-sample-tech-001';
    const q2: QuestionDto = {
      id: q2Id,
      category: 'TECHNICAL_MCQ',
      topic: 'Data Structures',
      difficulty: 'HARD',
      questionType: 'SINGLE_CHOICE',
      questionText: 'What is the worst-case time complexity of searching an element in an un-balanced Binary Search Tree (BST)?',
      marks: 2.0,
      negativeMarks: 0.5,
      correctAnswer: 'O(N)',
      explanation: 'In the worst case (skewed binary tree), a BST degenerates into a singly linked list, requiring O(N) time.',
      status: 'ACTIVE',
      createdById: 'usr-super-admin-001',
      createdAt: new Date(),
      updatedAt: new Date(),
      options: [
        { id: 'opt-q2-1', questionId: q2Id, optionText: 'O(1)', optionOrder: 1, isCorrect: false, createdAt: new Date(), updatedAt: new Date() },
        { id: 'opt-q2-2', questionId: q2Id, optionText: 'O(log N)', optionOrder: 2, isCorrect: false, createdAt: new Date(), updatedAt: new Date() },
        { id: 'opt-q2-3', questionId: q2Id, optionText: 'O(N)', optionOrder: 3, isCorrect: true, createdAt: new Date(), updatedAt: new Date() },
        { id: 'opt-q2-4', questionId: q2Id, optionText: 'O(N log N)', optionOrder: 4, isCorrect: false, createdAt: new Date(), updatedAt: new Date() },
      ],
      _count: { usages: 0 },
    };

    const q3Id = 'q-sample-tf-001';
    const q3: QuestionDto = {
      id: q3Id,
      category: 'LOGICAL_REASONING',
      topic: 'Statement & Conclusion',
      difficulty: 'EASY',
      questionType: 'TRUE_FALSE',
      questionText: 'Is every square a rectangle?',
      marks: 1.0,
      negativeMarks: 0.25,
      correctAnswer: 'True',
      explanation: 'A square has all four angles equal to 90 degrees and opposite sides parallel and equal, meeting all definitions of a rectangle.',
      status: 'ACTIVE',
      createdById: 'usr-super-admin-001',
      createdAt: new Date(),
      updatedAt: new Date(),
      options: [
        { id: 'opt-q3-1', questionId: q3Id, optionText: 'True', optionOrder: 1, isCorrect: true, createdAt: new Date(), updatedAt: new Date() },
        { id: 'opt-q3-2', questionId: q3Id, optionText: 'False', optionOrder: 2, isCorrect: false, createdAt: new Date(), updatedAt: new Date() },
      ],
      _count: { usages: 0 },
    };

    const qCoding1Id = 'q-sample-coding-001';
    const qCoding1: QuestionDto = {
      id: qCoding1Id,
      category: 'CODING',
      topic: 'Arrays',
      difficulty: 'EASY',
      questionType: 'DESCRIPTIVE',
      questionText: 'Two Sum\nGiven an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`.\n\nInput Format:\n- First line contains space-separated integers representing nums.\n- Second line contains an integer target.\n\nOutput Format:\n- Output two space-separated indices in ascending order.',
      marks: 10.0,
      negativeMarks: 0.0,
      correctAnswer: JSON.stringify({
        title: 'Two Sum',
        description: 'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`.\n\nInput Format:\n- First line contains space-separated integers representing nums.\n- Second line contains an integer target.\n\nOutput Format:\n- Output two space-separated indices in ascending order.',
        inputFormat: 'Line 1: space-separated integers.\nLine 2: target integer.',
        outputFormat: 'Two space-separated indices.',
        constraints: [
          '2 <= nums.length <= 10^4',
          '-10^9 <= nums[i] <= 10^9',
          'Exactly one valid solution exists.',
        ],
        timeLimitSeconds: 2.0,
        memoryLimitKb: 128000,
        starterCode: {
          c: '#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n',
          cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n',
          python: 'import sys\n\ndef two_sum():\n    lines = sys.stdin.read().strip().split("\\n")\n    if len(lines) < 2:\n        return\n    nums = list(map(int, lines[0].split()))\n    target = int(lines[1])\n    lookup = {}\n    for i, num in enumerate(nums):\n        comp = target - num\n        if comp in lookup:\n            print(f"{lookup[comp]} {i}")\n            return\n        lookup[num] = i\n\nif __name__ == "__main__":\n    two_sum()\n',
          java: 'import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        // Write your solution here\n    }\n}\n',
        },
        testCases: [
          {
            index: 1,
            isSample: true,
            input: '2 7 11 15\n9',
            expectedOutput: '0 1',
            explanation: 'nums[0] + nums[1] = 2 + 7 = 9, so the indices are 0 1.',
          },
          {
            index: 2,
            isSample: true,
            input: '3 2 4\n6',
            expectedOutput: '1 2',
            explanation: 'nums[1] + nums[2] = 2 + 4 = 6, so the indices are 1 2.',
          },
          {
            index: 3,
            isSample: false,
            input: '3 3\n6',
            expectedOutput: '0 1',
          },
          {
            index: 4,
            isSample: false,
            input: '1 5 8 10 14\n24',
            expectedOutput: '3 4',
          },
        ],
      }),
      explanation: 'Use a hash map to look up complements in O(N) time.',
      status: 'ACTIVE',
      createdById: 'usr-super-admin-001',
      createdAt: new Date(),
      updatedAt: new Date(),
      options: [],
      _count: { usages: 0 },
    };

    const qCoding2Id = 'q-sample-coding-002';
    const qCoding2: QuestionDto = {
      id: qCoding2Id,
      category: 'CODING',
      topic: 'Strings',
      difficulty: 'MEDIUM',
      questionType: 'DESCRIPTIVE',
      questionText: 'Valid Palindrome\nA phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nInput Format:\nA single string.\n\nOutput Format:\ntrue or false.',
      marks: 10.0,
      negativeMarks: 0.0,
      correctAnswer: JSON.stringify({
        title: 'Valid Palindrome',
        description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nInput Format:\nA single string.\n\nOutput Format:\ntrue or false.',
        inputFormat: 'A single string on one line.',
        outputFormat: 'true or false',
        constraints: ['1 <= s.length <= 2 * 10^5'],
        timeLimitSeconds: 2.0,
        memoryLimitKb: 128000,
        starterCode: {
          c: '#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}\n',
          cpp: '#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}\n',
          python: 'import sys\n\ndef is_palindrome():\n    s = sys.stdin.read().strip().lower()\n    clean = "".join(ch for ch in s if ch.isalnum())\n    print("true" if clean == clean[::-1] else "false")\n\nif __name__ == "__main__":\n    is_palindrome()\n',
          java: 'import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}\n',
        },
        testCases: [
          {
            index: 1,
            isSample: true,
            input: 'A man a plan a canal Panama',
            expectedOutput: 'true',
            explanation: '"amanaplanacanalpanama" is a palindrome.',
          },
          {
            index: 2,
            isSample: true,
            input: 'race a car',
            expectedOutput: 'false',
            explanation: '"raceacar" is not a palindrome.',
          },
          {
            index: 3,
            isSample: false,
            input: ' ',
            expectedOutput: 'true',
          },
          {
            index: 4,
            isSample: false,
            input: '0P',
            expectedOutput: 'false',
          },
        ],
      }),
      explanation: 'Clean the string by removing non-alphanumeric characters and compare with its reverse.',
      status: 'ACTIVE',
      createdById: 'usr-super-admin-001',
      createdAt: new Date(),
      updatedAt: new Date(),
      options: [],
      _count: { usages: 0 },
    };

    this.questions.set(q1.id, q1);
    this.questions.set(q2.id, q2);
    this.questions.set(q3.id, q3);
    this.questions.set(qCoding1.id, qCoding1);
    this.questions.set(qCoding2.id, qCoding2);

    this.initialized = true;
  }
}

export class QuestionRepository {
  public memStore = new InMemoryQuestionStore();

  constructor() {
    if (process.env.NODE_ENV === 'test') {
      this.memStore.initialize();
    }
  }

  // ===========================================================================
  // 1. CREATE QUESTION WITH OPTIONS
  // ===========================================================================
  async createQuestion(payload: CreateQuestionDto, createdById?: string): Promise<QuestionDto> {
    const id = `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();

    const optionsData: QuestionOptionDto[] = (payload.options || []).map((opt, idx) => ({
      id: `opt-${id}-${idx + 1}`,
      questionId: id,
      optionText: opt.optionText.trim(),
      optionOrder: opt.optionOrder,
      isCorrect: opt.isCorrect,
      createdAt: now,
      updatedAt: now,
    }));

    if (process.env.NODE_ENV === 'test') {
      await this.memStore.initialize();
      const memoryRecord: QuestionDto = {
        id,
        category: payload.category,
        topic: payload.topic.trim(),
        difficulty: payload.difficulty || 'MEDIUM',
        questionType: payload.questionType || 'SINGLE_CHOICE',
        questionText: payload.questionText.trim(),
        marks: payload.marks ?? 1.0,
        negativeMarks: payload.negativeMarks ?? 0.0,
        correctAnswer: payload.correctAnswer?.trim() || null,
        explanation: payload.explanation?.trim() || null,
        status: payload.status || 'ACTIVE',
        createdById: createdById || null,
        createdAt: now,
        updatedAt: now,
        options: optionsData,
        _count: { usages: 0 },
      };
      this.memStore.questions.set(memoryRecord.id, memoryRecord);
      return memoryRecord;
    }

    const created = await prisma.question.create({
      data: {
        category: payload.category,
        topic: payload.topic.trim(),
        difficulty: payload.difficulty || 'MEDIUM',
        questionType: payload.questionType || 'SINGLE_CHOICE',
        questionText: payload.questionText.trim(),
        marks: payload.marks ?? 1.0,
        negativeMarks: payload.negativeMarks ?? 0.0,
        correctAnswer: payload.correctAnswer?.trim() || null,
        explanation: payload.explanation?.trim() || null,
        status: payload.status || 'ACTIVE',
        createdById: createdById || null,
        options: {
          create: optionsData.map((o) => ({
            optionText: o.optionText,
            optionOrder: o.optionOrder,
            isCorrect: o.isCorrect,
          })),
        },
      },
      include: {
        options: true,
        createdBy: { select: { id: true, email: true } },
        _count: { select: { usages: true } },
      },
    });

    return created as unknown as QuestionDto;
  }

  // ===========================================================================
  // 2. FIND QUESTIONS (SERVER-SIDE FILTER, SEARCH, SORT, PAGINATE)
  // ===========================================================================
  async findQuestions(filters: QuestionQueryFilters = {}): Promise<PaginatedResult<QuestionDto>> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 10));
    const skip = (page - 1) * limit;

    if (process.env.NODE_ENV === 'test') {
      await this.memStore.initialize();
      let list = Array.from(this.memStore.questions.values());

      if (filters.category) {
        list = list.filter((q) => q.category === filters.category);
      }
      if (filters.topic) {
        const t = filters.topic.toLowerCase();
        list = list.filter((q) => q.topic.toLowerCase().includes(t));
      }
      if (filters.difficulty) {
        list = list.filter((q) => q.difficulty === filters.difficulty);
      }
      if (filters.questionType) {
        list = list.filter((q) => q.questionType === filters.questionType);
      }
      if (filters.status) {
        list = list.filter((q) => q.status === filters.status);
      }
      if (filters.search) {
        const s = filters.search.toLowerCase();
        list = list.filter(
          (q) => q.questionText.toLowerCase().includes(s) || q.topic.toLowerCase().includes(s)
        );
      }

      const sortField = filters.sortBy || 'createdAt';
      const isAsc = filters.sortOrder === 'asc';

      list.sort((a, b) => {
        let valA: unknown = (a as unknown as Record<string, unknown>)[sortField];
        let valB: unknown = (b as unknown as Record<string, unknown>)[sortField];

        if (sortField === 'createdAt') {
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
        }

        if (valA === valB) return 0;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return isAsc ? valA - valB : valB - valA;
        }

        return isAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });

      const totalCount = list.length;
      const totalPages = Math.ceil(totalCount / limit) || 1;
      const paginated = list.slice(skip, skip + limit);

      return {
        data: paginated,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    }

    const whereClause: Record<string, unknown> = {};

    if (filters.category) whereClause.category = filters.category;
    if (filters.topic) whereClause.topic = { contains: filters.topic };
    if (filters.difficulty) whereClause.difficulty = filters.difficulty;
    if (filters.questionType) whereClause.questionType = filters.questionType;
    if (filters.status) whereClause.status = filters.status;

    if (filters.search) {
      whereClause.OR = [
        { questionText: { contains: filters.search } },
        { topic: { contains: filters.search } },
      ];
    }

    const orderBy: Record<string, 'asc' | 'desc'> = {};
    const sortField = filters.sortBy || 'createdAt';
    orderBy[sortField] = filters.sortOrder === 'asc' ? 'asc' : 'desc';

    const [totalCount, items] = await Promise.all([
      prisma.question.count({ where: whereClause }),
      prisma.question.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy,
        include: {
          options: { orderBy: { optionOrder: 'asc' } },
          createdBy: { select: { id: true, email: true } },
          _count: { select: { usages: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return {
      data: items as unknown as QuestionDto[],
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  // ===========================================================================
  // 3. FIND QUESTION BY ID
  // ===========================================================================
  async findQuestionById(id: string): Promise<QuestionDto | null> {
    if (process.env.NODE_ENV === 'test') {
      await this.memStore.initialize();
      return this.memStore.questions.get(id) || null;
    }

    const item = await prisma.question.findUnique({
      where: { id },
      include: {
        options: { orderBy: { optionOrder: 'asc' } },
        createdBy: { select: { id: true, email: true } },
        _count: { select: { usages: true } },
      },
    });
    return (item as unknown as QuestionDto) || null;
  }

  // ===========================================================================
  // 4. UPDATE QUESTION
  // ===========================================================================
  async updateQuestion(id: string, payload: UpdateQuestionDto): Promise<QuestionDto> {
    const existing = await this.findQuestionById(id);
    if (!existing) {
      throw new AppError('Question not found', 404);
    }

    const now = new Date();
    let updatedOptions = existing.options;

    if (payload.options !== undefined) {
      updatedOptions = payload.options.map((opt, idx) => ({
        id: `opt-${id}-${idx + 1}`,
        questionId: id,
        optionText: opt.optionText.trim(),
        optionOrder: opt.optionOrder,
        isCorrect: opt.isCorrect,
        createdAt: now,
        updatedAt: now,
      }));
    }

    const updatedMemory: QuestionDto = {
      ...existing,
      category: payload.category ?? existing.category,
      topic: payload.topic ? payload.topic.trim() : existing.topic,
      difficulty: payload.difficulty ?? existing.difficulty,
      questionType: payload.questionType ?? existing.questionType,
      questionText: payload.questionText ? payload.questionText.trim() : existing.questionText,
      marks: payload.marks ?? existing.marks,
      negativeMarks: payload.negativeMarks ?? existing.negativeMarks,
      correctAnswer: payload.correctAnswer !== undefined ? payload.correctAnswer?.trim() || null : existing.correctAnswer,
      explanation: payload.explanation !== undefined ? payload.explanation?.trim() || null : existing.explanation,
      status: payload.status ?? existing.status,
      updatedAt: now,
      options: updatedOptions,
    };

    if (process.env.NODE_ENV === 'test') {
      this.memStore.questions.set(id, updatedMemory);
      return updatedMemory;
    }

    await prisma.$transaction(async (tx) => {
      if (payload.options !== undefined) {
        await tx.questionOption.deleteMany({ where: { questionId: id } });
        if (payload.options.length > 0) {
          await tx.questionOption.createMany({
            data: payload.options.map((o) => ({
              questionId: id,
              optionText: o.optionText.trim(),
              optionOrder: o.optionOrder,
              isCorrect: o.isCorrect,
            })),
          });
        }
      }

      await tx.question.update({
        where: { id },
        data: {
          category: payload.category,
          topic: payload.topic ? payload.topic.trim() : undefined,
          difficulty: payload.difficulty,
          questionType: payload.questionType,
          questionText: payload.questionText ? payload.questionText.trim() : undefined,
          marks: payload.marks,
          negativeMarks: payload.negativeMarks,
          correctAnswer: payload.correctAnswer !== undefined ? payload.correctAnswer?.trim() || null : undefined,
          explanation: payload.explanation !== undefined ? payload.explanation?.trim() || null : undefined,
          status: payload.status,
        },
      });
    });

    const fresh = await this.findQuestionById(id);
    if (!fresh) {
      throw new AppError('Question not found after update', 404);
    }
    return fresh;
  }

  // ===========================================================================
  // 5. UPDATE QUESTION STATUS
  // ===========================================================================
  async updateQuestionStatus(id: string, status: QuestionStatus): Promise<QuestionDto> {
    const existing = await this.findQuestionById(id);
    if (!existing) {
      throw new AppError('Question not found', 404);
    }

    if (process.env.NODE_ENV === 'test') {
      const updated = { ...existing, status, updatedAt: new Date() };
      this.memStore.questions.set(id, updated);
      return updated;
    }

    const item = await prisma.question.update({
      where: { id },
      data: { status },
      include: {
        options: { orderBy: { optionOrder: 'asc' } },
        createdBy: { select: { id: true, email: true } },
        _count: { select: { usages: true } },
      },
    });
    return item as unknown as QuestionDto;
  }

  // ===========================================================================
  // 6. DELETE QUESTION (WITH USAGE PROTECTION)
  // ===========================================================================
  async deleteQuestion(id: string): Promise<void> {
    const existing = await this.findQuestionById(id);
    if (!existing) {
      throw new AppError('Question not found', 404);
    }

    if (process.env.NODE_ENV === 'test') {
      const inMemoryUsageCount = Array.from(this.memStore.usages.values()).filter(
        (u) => u.questionId === id
      ).length;
      if (inMemoryUsageCount > 0 || (existing._count?.usages && existing._count.usages > 0)) {
        throw new AppError('Cannot delete question that has already been used in assessments', 400);
      }
      this.memStore.questions.delete(id);
      return;
    }

    const dbUsageCount = await prisma.questionUsage.count({ where: { questionId: id } });
    if (dbUsageCount > 0) {
      throw new AppError('Cannot delete question that has already been used in assessments', 400);
    }

    await prisma.question.delete({ where: { id } });
  }

  // ===========================================================================
  // 7. QUESTION USAGE (PHASE 5 PREPARATION)
  // ===========================================================================
  async recordQuestionUsage(payload: CreateQuestionUsageDto): Promise<QuestionUsageDto> {
    const question = await this.findQuestionById(payload.questionId);
    if (!question) {
      throw new AppError('Question not found', 404);
    }

    const id = `use-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();

    if (process.env.NODE_ENV === 'test') {
      const memoryUsage: QuestionUsageDto = {
        id,
        questionId: payload.questionId,
        assessmentId: payload.assessmentId || null,
        studentId: payload.studentId || null,
        usageMonth: payload.usageMonth,
        usageYear: payload.usageYear,
        usedAt: now,
      };
      this.memStore.usages.set(id, memoryUsage);
      return memoryUsage;
    }

    const created = await prisma.questionUsage.create({
      data: {
        questionId: payload.questionId,
        assessmentId: payload.assessmentId || null,
        studentId: payload.studentId || null,
        usageMonth: payload.usageMonth,
        usageYear: payload.usageYear,
        usedAt: now,
      },
    });
    return created;
  }
}

export const questionRepository = new QuestionRepository();
