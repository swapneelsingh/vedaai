import Anthropic from '@anthropic-ai/sdk';
import { GeneratedPaper, QuestionType, Section, Question } from '../types';
import { v4 as uuidv4 } from 'uuid';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

Create a comprehensive examination paper. Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
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
- Return ONLY the JSON, nothing else`;
}

export async function generateQuestionPaper(
  input: GenerationInput,
  onProgress?: (progress: number) => void
): Promise<GeneratedPaper> {
  onProgress?.(10);

  const prompt = buildPrompt(input);
  onProgress?.(20);

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  onProgress?.(70);

  const rawText = message.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('');

  // Extract JSON from response
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI returned invalid response format');

  const parsed = JSON.parse(jsonMatch[0]);
  onProgress?.(85);

  // Validate and enrich structure
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
