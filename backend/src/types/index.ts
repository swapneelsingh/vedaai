export interface QuestionType {
  type: string;
  count: number;
  marks: number;
}

export interface CreateAssignmentDTO {
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  questionTypes: QuestionType[];
  additionalInstructions?: string;
  fileContent?: string;
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

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface WSMessage {
  type: 'JOB_STATUS' | 'JOB_PROGRESS' | 'JOB_COMPLETE' | 'JOB_ERROR';
  jobId: string;
  status?: JobStatus;
  progress?: number;
  data?: GeneratedPaper;
  error?: string;
}
