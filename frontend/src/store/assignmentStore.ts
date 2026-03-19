import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Assignment, CreateAssignmentForm, GeneratedPaper, QuestionType } from '../types';
import { api } from '../lib/api';

interface AssignmentStore {
  // State
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  generatedPaper: GeneratedPaper | null;
  isLoading: boolean;
  isGenerating: boolean;
  generationProgress: number;
  error: string | null;
  currentJobId: string | null;

  // Form state
  form: CreateAssignmentForm;

  // Actions
  fetchAssignments: () => Promise<void>;
  fetchAssignment: (id: string) => Promise<void>;
  createAssignment: (form: CreateAssignmentForm) => Promise<{ assignmentId: string; jobId: string }>;
  deleteAssignment: (id: string) => Promise<void>;
  regenerateAssignment: (id: string) => Promise<{ jobId: string }>;
  fetchGeneratedPaper: (id: string) => Promise<void>;
  setGeneratedPaper: (paper: GeneratedPaper) => void;
  setGenerationProgress: (progress: number) => void;
  setIsGenerating: (val: boolean) => void;
  setCurrentJobId: (jobId: string | null) => void;
  updateForm: (updates: Partial<CreateAssignmentForm>) => void;
  resetForm: () => void;
  addQuestionType: () => void;
  updateQuestionType: (index: number, updates: Partial<QuestionType>) => void;
  removeQuestionType: (index: number) => void;
  clearError: () => void;
}

const defaultForm: CreateAssignmentForm = {
  title: '',
  subject: '',
  className: '',
  dueDate: '',
  questionTypes: [{ type: 'Multiple Choice Questions', count: 4, marks: 1 }],
  additionalInstructions: '',
  file: null,
};

export const useAssignmentStore = create<AssignmentStore>()(
  devtools(
    (set, get) => ({
      assignments: [],
      currentAssignment: null,
      generatedPaper: null,
      isLoading: false,
      isGenerating: false,
      generationProgress: 0,
      error: null,
      currentJobId: null,
      form: { ...defaultForm },

      fetchAssignments: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.get('/assignments');
          set({ assignments: res.data.data, isLoading: false });
        } catch (err: any) {
          set({ error: err.response?.data?.error || 'Failed to fetch assignments', isLoading: false });
        }
      },

      fetchAssignment: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.get(`/assignments/${id}`);
          set({ currentAssignment: res.data.data, isLoading: false });
        } catch (err: any) {
          set({ error: err.response?.data?.error || 'Failed to fetch assignment', isLoading: false });
        }
      },

      createAssignment: async (form: CreateAssignmentForm) => {
        set({ isLoading: true, error: null });
        try {
          const formData = new FormData();
          const payload = {
            title: form.title,
            subject: form.subject,
            className: form.className,
            dueDate: form.dueDate,
            questionTypes: form.questionTypes,
            additionalInstructions: form.additionalInstructions,
          };
          formData.append('data', JSON.stringify(payload));
          if (form.file) formData.append('file', form.file);

          const res = await api.post('/assignments', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          set({ isLoading: false });
          return res.data.data;
        } catch (err: any) {
          const error = err.response?.data?.error || 'Failed to create assignment';
          set({ error, isLoading: false });
          throw new Error(error);
        }
      },

      deleteAssignment: async (id: string) => {
        try {
          await api.delete(`/assignments/${id}`);
          set((state) => ({
            assignments: state.assignments.filter((a) => a._id !== id),
          }));
        } catch (err: any) {
          set({ error: err.response?.data?.error || 'Failed to delete assignment' });
        }
      },

      regenerateAssignment: async (id: string) => {
        set({ isGenerating: true, generationProgress: 0, error: null });
        try {
          const res = await api.post(`/assignments/${id}/regenerate`);
          return res.data.data;
        } catch (err: any) {
          set({ error: err.response?.data?.error || 'Failed to regenerate', isGenerating: false });
          throw new Error(err.response?.data?.error || 'Failed to regenerate');
        }
      },

      fetchGeneratedPaper: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.get(`/assignments/${id}/paper`);
          set({ generatedPaper: res.data.data, isLoading: false });
        } catch (err: any) {
          set({ error: err.response?.data?.error || 'Failed to fetch paper', isLoading: false });
        }
      },

      setGeneratedPaper: (paper) => set({ generatedPaper: paper }),
      setGenerationProgress: (progress) => set({ generationProgress: progress }),
      setIsGenerating: (val) => set({ isGenerating: val }),
      setCurrentJobId: (jobId) => set({ currentJobId: jobId }),

      updateForm: (updates) =>
        set((state) => ({ form: { ...state.form, ...updates } })),

      resetForm: () => set({ form: { ...defaultForm } }),

      addQuestionType: () =>
        set((state) => ({
          form: {
            ...state.form,
            questionTypes: [
              ...state.form.questionTypes,
              { type: 'Short Questions', count: 3, marks: 2 },
            ],
          },
        })),

      updateQuestionType: (index, updates) =>
        set((state) => ({
          form: {
            ...state.form,
            questionTypes: state.form.questionTypes.map((qt, i) =>
              i === index ? { ...qt, ...updates } : qt
            ),
          },
        })),

      removeQuestionType: (index) =>
        set((state) => ({
          form: {
            ...state.form,
            questionTypes: state.form.questionTypes.filter((_, i) => i !== index),
          },
        })),

      clearError: () => set({ error: null }),
    }),
    { name: 'assignment-store' }
  )
);
