import mammoth from 'mammoth';
import { Question, QuestionChoice, QuestionType } from '../types';

export interface ParseResult {
  questions: Partial<Question>[];
  totalDetected: number;
  mcCount: number;
  essayCount: number;
  rawText: string;
}

/**
 * Clean and filter unwanted header text commonly found in Indonesian school exam headers
 */
function cleanExamHeaderNoise(text: string): string {
  const noisePatterns = [
    /PEMERINTAH\s+(KABUPATEN|KOTA|PROVINSI)[\s\S]*?(MATA\s+PELAJARAN|PETUNJUK|WAKTU)/gi,
    /DINAS\s+PENDIDIKAN[\s\S]*?(MATA\s+PELAJARAN|PETUNJUK|WAKTU)/gi,
    /PENILAIAN\s+(AKHIR|TENGAH)\s+SEMESTER[\s\S]*?(PETUNJUK\s+UMUM|SELAMAT\s+MENGERJAKAN)/gi,
    /ASESMEN\s+(SUMATIF|MADRASAH|SEKOLAH)[\s\S]*?(PETUNJUK\s+UMUM|WAKTU)/gi,
    /PETUNJUK\s+(UMUM|KHUSUS)\s*:\s*[\s\S]*?(?=1[\.\)]|soal\s*1)/gi,
    /^(NAMA|KELAS|NO\.?\s*ABSEN|HARI\/TANGGAL|WAKTU)\s*:.*$/gim,
    /^PILIHLAH\s+SALAH\s+SATU\s+JAWABAN.*$/gim,
    /^BERILAH\s+TANDA\s+SILANG.*$/gim
  ];

  let cleaned = text;
  noisePatterns.forEach((p) => {
    cleaned = cleaned.replace(p, '');
  });
  return cleaned;
}

/**
 * Pre-process text: split horizontal/inline choices into individual lines
 * Example: "A. Merah  B. Biru  C. Hijau  D. Kuning" -> separate lines
 */
function normalizeChoiceLines(text: string): string {
  // Regex to detect inline choices (e.g. space followed by B. or b) or (B) or *B.)
  const inlineChoiceRegex = /(?<=[^\n])\s{2,}(\*?\s*(?:[\(\[]?[A-Ea-e][\.\)\:\-\]]|\boption\s*[A-Ea-e]\b)\s*)/g;
  return text.replace(inlineChoiceRegex, '\n$1');
}

/**
 * Extract bottom answer key section (if present at the end of file)
 * e.g.:
 * KUNCI JAWABAN:
 * 1. A  2. B  3. C  4. D
 * or
 * 1=A, 2=B, 3=C
 */
function extractBottomAnswerKeys(text: string): { cleanedText: string; answerMap: Record<number, string> } {
  const answerMap: Record<number, string> = {};
  const bottomKeyHeaderRegex = /(?:kunci\s*jawaban|kunci\s*soal|answer\s*keys?)\s*[:\n]/i;
  const match = text.match(bottomKeyHeaderRegex);

  if (!match || match.index === undefined) {
    return { cleanedText: text, answerMap };
  }

  const mainText = text.substring(0, match.index);
  const keySection = text.substring(match.index);

  // Extract pairs like "1. A", "1) B", "1=C", "1 : D", "1.A"
  const pairRegex = /(\d+)[\.\)\:\=\s\-]+([A-Ea-e])/g;
  let pairMatch;
  while ((pairMatch = pairRegex.exec(keySection)) !== null) {
    const num = parseInt(pairMatch[1], 10);
    const key = pairMatch[2].toLowerCase();
    answerMap[num] = key;
  }

  return { cleanedText: mainText, answerMap };
}

/**
 * Read File content according to its extension (.docx, .txt, .csv, etc.)
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  // DOCX / DOC
  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    const arrayBuffer = await file.arrayBuffer();
    try {
      const result = await mammoth.extractRawText({ arrayBuffer });
      if (result.value && result.value.trim().length > 0) {
        return result.value;
      }
    } catch {
      // Fallback
    }
  }

  // Plain Text / CSV / Fallback
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      let content = (e.target?.result as string) || '';
      // Clean binary garbage if any
      content = content
        .replace(/%PDF[\s\S]*?%%EOF/g, '')
        .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]/g, ' ')
        .replace(/\s{3,}/g, '\n');
      resolve(content);
    };
    reader.onerror = () => reject(new Error('Gagal membaca berkas.'));
    reader.readAsText(file, 'utf-8');
  });
}

/**
 * Main parser function: parses plain text or extracted document text into structured questions
 */
export function parseQuestionsFromText(
  rawText: string,
  defaultSubject: string = 'Umum',
  defaultMaterial: string = 'Import Soal'
): ParseResult {
  if (!rawText || !rawText.trim()) {
    return { questions: [], totalDetected: 0, mcCount: 0, essayCount: 0, rawText: '' };
  }

  // 1. Extract bottom answer keys if any
  const { cleanedText: textWithoutBottomKeys, answerMap } = extractBottomAnswerKeys(rawText);

  // 2. Pre-process header noise and choice spacing
  const cleaned = cleanExamHeaderNoise(textWithoutBottomKeys);
  const normalized = normalizeChoiceLines(cleaned);

  const rawLines = normalized
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const parsedQuestions: Partial<Question>[] = [];
  let currentQuestion: Partial<Question> | null = null;
  let currentChoices: QuestionChoice[] = [];
  let currentQuestionNumber: number = 0;
  let detectedAnswerKey: string | null = null;
  let detectedExplanation: string | null = null;

  // Question starting patterns:
  // 1. / 1) / (1) / [1] / Soal 1: / No. 1 / Pertanyaan 1
  const questionStartRegex = /^\s*(?:(?:no\.?|soal\s*no\.?|soal|pertanyaan)\s*)?(?:(\d+)[\.\)\:\-\]]|\((\d+)\)|\[(\d+)\])\s*(.*)/i;

  // Choice starting patterns:
  // A. / A) / (A) / [A] / a. / *A. / A. * / Option A:
  const choiceStartRegex = /^\s*(\*?\s*(?:[\(\[]?([a-eA-E])[\.\)\:\-\]]|\boption\s*([a-eA-E])\b))\s*(.*)/i;

  // Inline Answer declaration:
  // Kunci: A / Jawaban: B / Ans: C / Jwb: D
  const answerKeyRegex = /^\s*(?:kunci\s*jawaban|kunci|jawaban|jwb|answer|ans)\s*[:=\s\-]+\s*([a-eA-E])/i;

  // Explanation declaration:
  // Pembahasan: ... / Penjelasan: ...
  const explanationRegex = /^\s*(?:pembahasan|penjelasan|explanation|ket(?:erangan)?)\s*[:=\s\-]+(.*)/i;

  const pushCurrentQuestion = () => {
    if (!currentQuestion || !currentQuestion.questionText) return;

    let qType: QuestionType = 'SHORT_ANSWER';
    let finalCorrectAnswer: string | undefined = undefined;

    if (currentChoices.length > 0) {
      qType = 'MULTIPLE_CHOICE';

      // 1. Check if bottom answer key had an entry for this question number
      const bottomKey = currentQuestionNumber ? answerMap[currentQuestionNumber] : undefined;
      const targetKey = (detectedAnswerKey || bottomKey || '').toLowerCase();

      if (targetKey) {
        currentChoices = currentChoices.map((c) => ({
          ...c,
          isCorrect: c.id === targetKey || c.isCorrect
        }));
      }

      // If still no choice is marked as correct, default to first choice
      if (!currentChoices.some((c) => c.isCorrect)) {
        currentChoices[0].isCorrect = true;
      }

      finalCorrectAnswer = currentChoices.find((c) => c.isCorrect)?.id;
    }

    parsedQuestions.push({
      id: currentQuestion.id || `q_parsed_${Date.now()}_${parsedQuestions.length}`,
      bankId: 'bank_import',
      subject: defaultSubject,
      grade: '',
      material: defaultMaterial,
      type: qType,
      difficulty: 'MEDIUM',
      questionText: currentQuestion.questionText.trim(),
      choices: currentChoices.length > 0 ? currentChoices : undefined,
      correctAnswer: finalCorrectAnswer,
      explanation: detectedExplanation || currentQuestion.explanation,
      score: 5
    });

    currentChoices = [];
    detectedAnswerKey = null;
    detectedExplanation = null;
  };

  rawLines.forEach((line, idx) => {
    // Check if line is Question Start
    const qMatch = line.match(questionStartRegex);
    const isChoice = choiceStartRegex.test(line);
    const isAnswer = answerKeyRegex.test(line);
    const isExplanation = explanationRegex.test(line);

    if (qMatch && !isChoice && !isAnswer && !isExplanation) {
      pushCurrentQuestion();
      const numStr = qMatch[1] || qMatch[2] || qMatch[3];
      currentQuestionNumber = numStr ? parseInt(numStr, 10) : parsedQuestions.length + 1;
      const qText = qMatch[4] ? qMatch[4].trim() : line;

      currentQuestion = {
        id: `q_parsed_${Date.now()}_${idx}`,
        questionText: qText || `Soal No. ${currentQuestionNumber}`
      };
    } else if (isChoice) {
      const cMatch = line.match(choiceStartRegex);
      if (cMatch) {
        if (!currentQuestion) {
          currentQuestionNumber = parsedQuestions.length + 1;
          currentQuestion = {
            id: `q_parsed_${Date.now()}_${idx}`,
            questionText: `Pertanyaan ${currentQuestionNumber}`
          };
        }

        const rawPrefix = cMatch[1];
        const letter = (cMatch[2] || cMatch[3] || 'a').toLowerCase();
        let choiceContent = cMatch[4] ? cMatch[4].trim() : '';

        // Check if star asterisk or (benar)/(kunci) exists in prefix or text
        const isStar =
          rawPrefix.includes('*') ||
          choiceContent.startsWith('*') ||
          choiceContent.endsWith('*') ||
          /\((?:benar|kunci|jawaban)\)/i.test(choiceContent);

        choiceContent = choiceContent
          .replace(/^\s*\*\s*/, '')
          .replace(/\s*\*$/, '')
          .replace(/\((?:benar|kunci|jawaban)\)/gi, '')
          .trim();

        currentChoices.push({
          id: letter,
          text: choiceContent || `Pilihan ${letter.toUpperCase()}`,
          isCorrect: isStar
        });
      }
    } else if (isAnswer) {
      const ansMatch = line.match(answerKeyRegex);
      if (ansMatch) {
        detectedAnswerKey = ansMatch[1].toLowerCase();
      }
    } else if (isExplanation) {
      const expMatch = line.match(explanationRegex);
      if (expMatch) {
        detectedExplanation = expMatch[1].trim();
      }
    } else if (currentQuestion) {
      // Continuation of previous line
      if (currentChoices.length === 0) {
        currentQuestion.questionText = `${currentQuestion.questionText || ''}\n${line}`.trim();
      } else {
        // Continuation of last choice text
        const lastChoice = currentChoices[currentChoices.length - 1];
        if (lastChoice) {
          lastChoice.text = `${lastChoice.text} ${line}`.trim();
        }
      }
    } else {
      // Line before any question number matched
      if (line.length > 5) {
        currentQuestionNumber = parsedQuestions.length + 1;
        currentQuestion = {
          id: `q_parsed_${Date.now()}_${idx}`,
          questionText: line
        };
      }
    }
  });

  pushCurrentQuestion();

  // Fallback: If no question was structured, divide paragraphs into questions
  if (parsedQuestions.length === 0 && rawLines.length > 0) {
    rawLines.forEach((l, i) => {
      if (l.trim().length > 3) {
        parsedQuestions.push({
          id: `q_fb_${Date.now()}_${i}`,
          bankId: 'bank_import',
          subject: defaultSubject,
          grade: '',
          material: defaultMaterial,
          type: 'SHORT_ANSWER',
          difficulty: 'MEDIUM',
          questionText: l.trim(),
          score: 5
        });
      }
    });
  }

  const mcCount = parsedQuestions.filter((q) => q.type === 'MULTIPLE_CHOICE').length;
  const essayCount = parsedQuestions.length - mcCount;

  return {
    questions: parsedQuestions,
    totalDetected: parsedQuestions.length,
    mcCount,
    essayCount,
    rawText
  };
}
