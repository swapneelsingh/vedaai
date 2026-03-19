export interface QuestionType {
  type: string;
  count: number;
  marks: number;
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  questionTypes: QuestionType[];
  additionalInstructions?: string;
  jobId?: string;
  jobStatus: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  text: string;
  type: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  marks: number;
  answer?: string;
}

export interface Section {
  title: string;
  instruction: string;
  questions: Question[];
  totalMarks: number;
}

export interface GeneratedPaper {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maximumMarks: number;
  sections: Section[];
  answerKey?: { questionId: string; answer: string }[];
}

export interface CreateAssignmentForm {
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  questionTypes: QuestionType[];
  additionalInstructions: string;
  file?: File | null;
}

export type WSMessage =
  | { type: 'CONNECTED'; jobId: string }
  | { type: 'JOB_STATUS'; jobId: string; status: string; progress: number }
  | { type: 'JOB_PROGRESS'; jobId: string; status: string; progress: number }
  | { type: 'JOB_COMPLETE'; jobId: string; status: string; progress: number; data: GeneratedPaper }
  | { type: 'JOB_ERROR'; jobId: string; status: string; error: string };
