import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeneratedPaper, QuestionType, Section, Question } from '../types';
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface GenerationInput {
  title: string;
  subject: string;
  className: string;
  questionTypes: QuestionType[];
  additionalInstructions?: string;
  fileContent?: string;
  schoolName?: string;
}

function buildPrompt(input: GenerationInput): string {
  const qTypeDetails = input.questionTypes
    .map((q) => `- ${q.type}: ${q.count} questions, ${q.marks} marks each`)
    .join('\n');

  const totalMarks = input.questionTypes.reduce((sum, q) => sum + q.count * q.marks, 0);
  const totalQuestions = input.questionTypes.reduce((sum, q) => sum + q.count, 0);

  return `You are an expert teacher creating a professional examination paper.

Assignment Title: ${input.title}
Subject: ${input.subject}
Class: ${input.className}
Total Questions: ${totalQuestions}
Total Marks: ${totalMarks}

Question Structure:
${qTypeDetails}

${input.fileContent ? `Reference Material:\n${input.fileContent.substring(0, 3000)}\n` : ''}
${input.additionalInstructions ? `Additional Instructions: ${input.additionalInstructions}` : ''}

Create a comprehensive examination paper. Return ONLY a valid JSON object (no markdown, no explanation, no code fences) with this exact structure:
{
  "schoolName": "${input.schoolName || 'Delhi Public School, Sector-4, Bokaro'}",
  "subject": "${input.subject}",
  "className": "${input.className}",
  "timeAllowed": "estimated time (e.g. 45 minutes or 3 hours)",
  "maximumMarks": ${totalMarks},
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions. Each question carries X marks",
      "questions": [
        {
          "id": "unique-id",
          "text": "Full question text here",
          "type": "Short Questions",
          "difficulty": "Easy",
          "marks": 2,
          "answer": "Complete answer text here"
        }
      ],
      "totalMarks": 20
    }
  ]
}

Rules:
- Group questions by type into sections (Section A, B, C, etc.)
- difficulty must be exactly one of: "Easy", "Moderate", "Hard" - distribute evenly
- Each question must have a complete, accurate answer
- Questions must be subject-specific, curriculum-aligned, and educationally sound
- Make questions clear, unambiguous, and appropriately challenging for ${input.className}
- Return ONLY the raw JSON object, no markdown code blocks, no backticks, nothing else`;
}

export async function generateQuestionPaper(
  input: GenerationInput,
  onProgress?: (progress: number) => void
): Promise<GeneratedPaper> {
  onProgress?.(10);

  const prompt = buildPrompt(input);
  onProgress?.(20);

  // Use gemini-1.5-flash (free tier, fast, generous limits)
  const model = genAI.getGenerativeModel({ 
    // model: 'gemini-1.5-flash',
    // model: 'gemini-2.0-flash',
    // model: 'gemini-1.5-flash-latest',
    // model: 'gemini-2.5-flash-preview-04-17',
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  });

  onProgress?.(30);

  const result = await model.generateContent(prompt);
  const rawText = result.response.text();

  onProgress?.(70);

  // Strip markdown code fences if Gemini adds them despite instructions
  // const cleaned = rawText
  //   .replace(/^```json\s*/i, '')
  //   .replace(/^```\s*/i, '')
  //   .replace(/\s*```$/i, '')
  //   .trim();

  // // Extract JSON object
  // const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  // if (!jsonMatch) throw new Error('AI returned invalid response format');

  // const parsed = JSON.parse(jsonMatch[0]);

  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI returned invalid response format');

  // Fix common JSON issues from AI
  let jsonStr = jsonMatch[0]
    .replace(/,\s*}/g, '}')       // trailing comma in objects
    .replace(/,\s*]/g, ']')       // trailing comma in arrays
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ') // control characters
    .replace(/\n/g, ' ')          // newlines inside strings
    .replace(/\t/g, ' ');         // tabs inside strings

  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    // Last resort - truncate to last valid position and close the JSON
    console.error('JSON parse error, attempting recovery...');
    // Find last complete question by cutting at last complete object
    const lastGoodIndex = jsonStr.lastIndexOf(',"answer"');
    if (lastGoodIndex > 0) {
      // Find the closing of that answer string
      const answerEnd = jsonStr.indexOf('"', jsonStr.indexOf(':', lastGoodIndex) + 2);
      const closeFrom = jsonStr.indexOf('"', answerEnd + 1);
      jsonStr = jsonStr.substring(0, closeFrom + 1) + '}]}]}';
    }
    parsed = JSON.parse(jsonStr);
  }
  
  onProgress?.(85);

  // Validate and build structured paper
  const paper: GeneratedPaper = {
    schoolName: parsed.schoolName || 'Delhi Public School',
    subject: parsed.subject || input.subject,
    className: parsed.className || input.className,
    timeAllowed: parsed.timeAllowed || '3 hours',
    maximumMarks: parsed.maximumMarks || 0,
    sections: [],
    answerKey: [],
  };

  for (const sec of parsed.sections || []) {
    const section: Section = {
      title: sec.title,
      instruction: sec.instruction,
      questions: [],
      totalMarks: sec.totalMarks || 0,
    };

    for (const q of sec.questions || []) {
      const question: Question = {
        id: q.id || uuidv4(),
        text: q.text,
        type: q.type,
        difficulty: ['Easy', 'Moderate', 'Hard'].includes(q.difficulty) ? q.difficulty : 'Moderate',
        marks: q.marks || 1,
        answer: q.answer,
      };
      section.questions.push(question);
      if (q.answer) {
        paper.answerKey?.push({ questionId: question.id, answer: q.answer });
      }
    }

    paper.sections.push(section);
  }

  onProgress?.(100);
  return paper;
}
