import * as XLSX from 'xlsx';
import {
  QuestionCategory,
  QuestionDifficulty,
  QuestionType,
  CATEGORY_TOPICS_MAP,
  CreateQuestionDto,
  CreateQuestionOptionDto,
} from '../types/question.types.js';
import { AppError } from '../middleware/errorHandler.js';
import { env } from '../config/env.config.js';

export interface GeminiParsedQuestionResult {
  detectedCompany: string | null;
  detectedYear: number | null;
  totalParsed: number;
  questions: CreateQuestionDto[];
}

export class GeminiQuestionParserService {
  /**
   * Main entrypoint to process uploaded document, spreadsheet, image, or text via Gemini API
   */
  async analyzeDocument(params: {
    file?: { buffer: Buffer; originalname: string; mimetype: string };
    text?: string;
    apiKey?: string;
    targetCompanyId?: string;
  }): Promise<GeminiParsedQuestionResult> {
    const apiKey =
      params.apiKey?.trim() ||
      process.env.GEMINI_API_KEY?.trim() ||
      env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      throw new AppError(
        'Gemini API Key is not configured. Please add GEMINI_API_KEY=your_key to your backend .env file.',
        400
      );
    }

    const { contentsParts, fileContext } = await this.prepareContents(params.file, params.text);

    const promptText = `You are an expert assessment authoring and placement examination intelligence engine.
Analyze the provided document/file (${fileContext}) and extract all assessment questions present.

STRICT TAXONOMY RULES:
1. CATEGORY must be EXACTLY ONE of:
   - "QUANTITATIVE_APTITUDE"
   - "LOGICAL_REASONING"
   - "VERBAL_ABILITY"
   - "TECHNICAL_MCQ"
   - "CODING"

2. TOPIC must be strictly selected from the allowed topics for that category:
   QUANTITATIVE_APTITUDE: ${CATEGORY_TOPICS_MAP.QUANTITATIVE_APTITUDE.join(', ')}
   LOGICAL_REASONING: ${CATEGORY_TOPICS_MAP.LOGICAL_REASONING.join(', ')}
   VERBAL_ABILITY: ${CATEGORY_TOPICS_MAP.VERBAL_ABILITY.join(', ')}
   TECHNICAL_MCQ: ${CATEGORY_TOPICS_MAP.TECHNICAL_MCQ.join(', ')}
   CODING: ${CATEGORY_TOPICS_MAP.CODING.join(', ')}

3. DIFFICULTY must be: "EASY", "MEDIUM", or "HARD" (default to MEDIUM if uncertain).
4. QUESTION_TYPE must be: "SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "FILL_BLANK", or "DESCRIPTIVE".
5. For SINGLE_CHOICE, MULTIPLE_CHOICE, and TRUE_FALSE:
   - Provide an "options" array with { "optionText": string, "isCorrect": boolean }.
   - If the original document indicates the correct answer (e.g. "Answer: B" or option circled/checked), mark that option as isCorrect: true.
   - If answer is not marked, designate the most accurate answer option as isCorrect: true.
   - Ensure at least 1 option has isCorrect: true.
6. For FILL_BLANK or DESCRIPTIVE:
   - Provide "correctAnswer" with the exact answer or rubric points.
7. marks: number (e.g. 1.0 or 2.0). negativeMarks: number (e.g. 0.25 or 0.0).
8. detectedCompany: identify if the questions belong to a company track (e.g. "Wipro", "TCS", "Cognizant", "Infosys", "Accenture", etc.). Otherwise null.
9. detectedYear: year if mentioned (e.g. 2024, 2025), otherwise null.

OUTPUT MUST BE VALID JSON matching this exact structure:
{
  "detectedCompany": "string or null",
  "detectedYear": 2024,
  "questions": [
    {
      "questionText": "Question statement...",
      "category": "QUANTITATIVE_APTITUDE",
      "topic": "Percentage",
      "difficulty": "MEDIUM",
      "questionType": "SINGLE_CHOICE",
      "marks": 1.0,
      "negativeMarks": 0.25,
      "correctAnswer": null,
      "explanation": "Step by step reasoning...",
      "options": [
        { "optionText": "Option A text", "isCorrect": false },
        { "optionText": "Option B text", "isCorrect": true },
        { "optionText": "Option C text", "isCorrect": false },
        { "optionText": "Option D text", "isCorrect": false }
      ]
    }
  ]
}`;

    const parts: any[] = [{ text: promptText }, ...contentsParts];

    // Call Gemini API (1.5-flash with fallback to 2.0-flash / 1.5-pro)
    const geminiResponse = await this.callGeminiApi(apiKey, parts);

    return this.normalizeGeminiResponse(geminiResponse, params.targetCompanyId);
  }

  /**
   * Prepares file or text into appropriate Gemini API request parts
   */
  private async prepareContents(
    file?: { buffer: Buffer; originalname: string; mimetype: string },
    text?: string
  ): Promise<{ contentsParts: any[]; fileContext: string }> {
    const parts: any[] = [];
    let fileContext = 'Text Input';

    if (file) {
      const ext = file.originalname.split('.').pop()?.toLowerCase() || '';
      fileContext = `Filename: ${file.originalname}, MIME: ${file.mimetype}`;

      // Handle Excel / CSV spreadsheets
      if (['xlsx', 'xls', 'csv'].includes(ext)) {
        try {
          const workbook = XLSX.read(file.buffer, { type: 'buffer' });
          let sheetData = '';
          for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const csv = XLSX.utils.sheet_to_csv(sheet);
            sheetData += `--- SHEET: ${sheetName} ---\n${csv}\n\n`;
          }
          parts.push({
            text: `[EXCEL SPREADSHEET CONTENT]:\n${sheetData}`,
          });
        } catch (err: any) {
          throw new AppError(`Failed to parse Excel spreadsheet: ${err.message}`, 400);
        }
      }
      // Handle Word Documents (.docx)
      else if (ext === 'docx') {
        const docText = this.extractTextFromDocx(file.buffer);
        parts.push({
          text: `[WORD DOCUMENT CONTENT]:\n${docText}`,
        });
      }
      // Handle PDF (Native Gemini multimodal)
      else if (ext === 'pdf' || file.mimetype === 'application/pdf') {
        const base64Data = file.buffer.toString('base64');
        parts.push({
          inline_data: {
            mime_type: 'application/pdf',
            data: base64Data,
          },
        });
      }
      // Handle Images (PNG, JPG, WEBP)
      else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext) || file.mimetype.startsWith('image/')) {
        const mime = file.mimetype.startsWith('image/')
          ? file.mimetype
          : ext === 'png'
            ? 'image/png'
            : ext === 'webp'
              ? 'image/webp'
              : 'image/jpeg';
        const base64Data = file.buffer.toString('base64');
        parts.push({
          inline_data: {
            mime_type: mime,
            data: base64Data,
          },
        });
      }
      // Plain text or markdown
      else {
        const rawText = file.buffer.toString('utf-8');
        parts.push({
          text: `[FILE CONTENT]:\n${rawText}`,
        });
      }
    }

    if (text && text.trim()) {
      parts.push({
        text: `[USER PROVIDED QUESTION TEXT / NOTES]:\n${text.trim()}`,
      });
    }

    if (parts.length === 0) {
      throw new AppError('No document file or question text was provided for analysis.', 400);
    }

    return { contentsParts: parts, fileContext };
  }

  /**
   * Simple helper to extract readable text from .docx buffer
   */
  private extractTextFromDocx(buffer: Buffer): string {
    const raw = buffer.toString('utf-8');
    const matches = raw.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
    if (matches && matches.length > 0) {
      return matches
        .map((m) => m.replace(/<[^>]+>/g, ''))
        .filter(Boolean)
        .join(' ');
    }
    // Fallback: strip basic non-printable characters
    // eslint-disable-next-line no-control-regex
    return raw.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, ' ').substring(0, 100000);
  }

  /**
   * Invokes Google Gemini REST API
   */
  private async callGeminiApi(apiKey: string, parts: any[]): Promise<any> {
    const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
    let lastError: any = null;

    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts,
              },
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          let errJson;
          try {
            errJson = JSON.parse(errText);
          } catch {
            // ignore
          }
          const message = errJson?.error?.message || response.statusText || `Gemini API error (${response.status})`;
          lastError = new Error(`Gemini ${model}: ${message}`);
          continue; // Try next model fallback
        }

        const data: any = await response.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidateText) {
          throw new Error('Gemini response was empty or blocked by safety filters.');
        }

        try {
          return JSON.parse(candidateText);
        } catch {
          // If response contained markdown code blocks ```json ... ```
          const cleaned = candidateText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
          return JSON.parse(cleaned);
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    throw new AppError(
      `Failed to analyze document with Gemini API: ${lastError?.message || 'Unknown error'}`,
      400
    );
  }

  /**
   * Normalizes and verifies Gemini output against authoritative taxonomy
   */
  private normalizeGeminiResponse(
    raw: any,
    targetCompanyId?: string
  ): GeminiParsedQuestionResult {
    const detectedCompany = typeof raw?.detectedCompany === 'string' ? raw.detectedCompany.trim() : null;
    const detectedYear = typeof raw?.detectedYear === 'number' ? raw.detectedYear : null;
    const rawQuestions: any[] = Array.isArray(raw?.questions) ? raw.questions : [];

    const questions: CreateQuestionDto[] = [];

    for (let i = 0; i < rawQuestions.length; i++) {
      const q = rawQuestions[i];
      if (!q || typeof q !== 'object') continue;

      const questionText = String(q.questionText || '').trim();
      if (!questionText) continue;

      // 1. Category Normalization
      const category = this.normalizeCategory(q.category);

      // 2. Topic Normalization
      const topic = this.normalizeTopic(category, q.topic);

      // 3. Difficulty Normalization
      let difficulty: QuestionDifficulty = 'MEDIUM';
      if (['EASY', 'MEDIUM', 'HARD'].includes(String(q.difficulty).toUpperCase())) {
        difficulty = String(q.difficulty).toUpperCase() as QuestionDifficulty;
      }

      // 4. Question Type Normalization
      let questionType: QuestionType = 'SINGLE_CHOICE';
      if (
        ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK', 'DESCRIPTIVE'].includes(
          String(q.questionType).toUpperCase()
        )
      ) {
        questionType = String(q.questionType).toUpperCase() as QuestionType;
      }

      // 5. Options Normalization
      const options: CreateQuestionOptionDto[] = [];
      if (
        questionType === 'SINGLE_CHOICE' ||
        questionType === 'MULTIPLE_CHOICE' ||
        questionType === 'TRUE_FALSE'
      ) {
        const rawOpts = Array.isArray(q.options) ? q.options : [];
        rawOpts.forEach((opt: any, idx: number) => {
          if (opt && typeof opt === 'object') {
            const text = String(opt.optionText || '').trim();
            if (text) {
              options.push({
                optionText: text,
                optionOrder: idx + 1,
                isCorrect: Boolean(opt.isCorrect),
              });
            }
          }
        });

        // Ensure at least 1 option is marked correct
        if (options.length > 0 && !options.some((o) => o.isCorrect)) {
          options[0].isCorrect = true;
        }

        // Default TRUE_FALSE if missing
        if (questionType === 'TRUE_FALSE' && options.length === 0) {
          options.push(
            { optionText: 'True', optionOrder: 1, isCorrect: true },
            { optionText: 'False', optionOrder: 2, isCorrect: false }
          );
        }
      }

      questions.push({
        companyId: targetCompanyId || undefined,
        category,
        topic,
        difficulty,
        questionType,
        questionText,
        marks: typeof q.marks === 'number' && q.marks > 0 ? q.marks : 1.0,
        negativeMarks: typeof q.negativeMarks === 'number' && q.negativeMarks >= 0 ? q.negativeMarks : 0.25,
        correctAnswer: q.correctAnswer ? String(q.correctAnswer).trim() : undefined,
        explanation: q.explanation ? String(q.explanation).trim() : undefined,
        status: 'ACTIVE',
        options,
      });
    }

    return {
      detectedCompany,
      detectedYear,
      totalParsed: questions.length,
      questions,
    };
  }

  private normalizeCategory(cat: any): QuestionCategory {
    const s = String(cat || '').toUpperCase().trim();
    if (s.includes('QUANT') || s.includes('MATH') || s.includes('APTITUDE')) return 'QUANTITATIVE_APTITUDE';
    if (s.includes('LOGIC') || s.includes('REASON')) return 'LOGICAL_REASONING';
    if (s.includes('VERBAL') || s.includes('ENGLISH') || s.includes('GRAMMAR')) return 'VERBAL_ABILITY';
    if (s.includes('CODING') || s.includes('PROGRAM')) return 'CODING';
    if (s.includes('TECH') || s.includes('MCQ') || s.includes('COMPUTER')) return 'TECHNICAL_MCQ';
    return 'QUANTITATIVE_APTITUDE';
  }

  private normalizeTopic(cat: QuestionCategory, rawTopic: any): string {
    const available = CATEGORY_TOPICS_MAP[cat];
    const s = String(rawTopic || '').toLowerCase().trim();

    // Exact or partial match
    for (const valid of available) {
      if (valid.toLowerCase() === s) return valid;
    }
    for (const valid of available) {
      if (s.includes(valid.toLowerCase()) || valid.toLowerCase().includes(s)) return valid;
    }

    // Default to first valid topic in category
    return available[0];
  }
}

export const geminiQuestionParserService = new GeminiQuestionParserService();
