'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import {
  Upload, Plus, Minus, X, ChevronLeft, ChevronRight,
  CalendarIcon, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Sidebar } from '../../components/layout/Sidebar';
import { TopBar } from '../../components/layout/TopBar';
import { useAssignmentStore } from '../../store/assignmentStore';
import { useJobWebSocket } from '../../lib/useWebSocket';
import { WSMessage } from '../../types';
import { clsx } from 'clsx';

const QUESTION_TYPES = [
  'Multiple Choice Questions',
  'Short Questions',
  'Long Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'Fill in the Blanks',
  'True/False Questions',
  'Match the Following',
];

export default function CreateAssignmentPage() {
  const router = useRouter();
  const {
    form, updateForm, addQuestionType, updateQuestionType, removeQuestionType,
    createAssignment, isLoading, setIsGenerating, setGenerationProgress,
    setCurrentJobId, setGeneratedPaper
  } = useAssignmentStore();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [jobId, setJobId] = useState<string | null>(null);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // WebSocket for real-time updates
  useJobWebSocket({
    jobId,
    onMessage: (msg: WSMessage) => {
      if (msg.type === 'JOB_PROGRESS' || msg.type === 'JOB_STATUS') {
        setGenerationProgress((msg as any).progress || 0);
      }
      if (msg.type === 'JOB_COMPLETE') {
        setGeneratedPaper((msg as any).data);
        setIsGenerating(false);
        toast.success('Question paper generated!');
        router.push(`/assignments/${assignmentId}`);
      }
      if (msg.type === 'JOB_ERROR') {
        setIsGenerating(false);
        setIsSubmitting(false);
        toast.error('Generation failed. Please try again.');
      }
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) updateForm({ file: acceptedFiles[0] });
  }, [updateForm]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'], 'image/*': ['.jpg', '.jpeg', '.png'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.className.trim()) e.className = 'Class is required';
    if (!form.dueDate) e.dueDate = 'Due date is required';
    if (form.questionTypes.length === 0) e.questionTypes = 'Add at least one question type';
    form.questionTypes.forEach((qt, i) => {
      if (qt.count <= 0) e[`qt_count_${i}`] = 'Count must be > 0';
      if (qt.marks <= 0) e[`qt_marks_${i}`] = 'Marks must be > 0';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) { toast.error('Please fix the errors'); return; }
    setIsSubmitting(true);
    try {
      const { assignmentId: aId, jobId: jId } = await createAssignment(form);
      setAssignmentId(aId);
      setJobId(jId);
      setCurrentJobId(jId);
      setIsGenerating(true);
      toast.success('Assignment created! Generating paper...');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create assignment');
      setIsSubmitting(false);
    }
  };

  const totalQuestions = form.questionTypes.reduce((s, qt) => s + (qt.count || 0), 0);
  const totalMarks = form.questionTypes.reduce((s, qt) => s + (qt.count || 0) * (qt.marks || 0), 0);

  if (isSubmitting && jobId) {
    return <GeneratingScreen />;
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title="Assignment" backHref="/assignments" />
        <main className="flex-1 overflow-y-auto bg-gray-50/50">
          <div className="max-w-2xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <h1 className="text-xl font-bold text-gray-900">Create Assignment</h1>
              </div>
              <p className="text-sm text-gray-500">Set up a new assignment for your students</p>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-200 rounded-full mb-6">
              <div className="h-full bg-brand-dark rounded-full w-1/3 transition-all" />
            </div>

            <div className="card p-6 space-y-5">
              <div>
                <h2 className="font-semibold text-gray-900 mb-1">Assignment Details</h2>
                <p className="text-xs text-gray-500">Basic information about your assignment</p>
              </div>

              {/* File Upload */}
              <div
                {...getRootProps()}
                className={clsx(
                  'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150',
                  isDragActive ? 'border-brand-orange bg-orange-50' : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                )}
              >
                <input {...getInputProps()} />
                {form.file ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-xs font-bold">✓</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{form.file.name}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); updateForm({ file: null }); }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={22} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-1">Choose a file or drag & drop it here</p>
                    <p className="text-xs text-gray-400">JPEG, PNG, PDF, upto 10MB</p>
                    <button
                      type="button"
                      className="mt-3 px-4 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-white transition-colors"
                    >
                      Browse Files
                    </button>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400 -mt-3">Upload images of your preferred document/image</p>

              {/* Title & Subject */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1.5 block">Assignment Title *</label>
                  <input
                    className={clsx('input-field', errors.title && 'border-red-300 focus:border-red-400')}
                    placeholder="e.g. Quiz on Electricity"
                    value={form.title}
                    onChange={(e) => updateForm({ title: e.target.value })}
                  />
                  {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1.5 block">Subject *</label>
                  <input
                    className={clsx('input-field', errors.subject && 'border-red-300')}
                    placeholder="e.g. Science"
                    value={form.subject}
                    onChange={(e) => updateForm({ subject: e.target.value })}
                  />
                  {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1.5 block">Class *</label>
                  <input
                    className={clsx('input-field', errors.className && 'border-red-300')}
                    placeholder="e.g. Grade 8"
                    value={form.className}
                    onChange={(e) => updateForm({ className: e.target.value })}
                  />
                  {errors.className && <p className="text-xs text-red-500 mt-1">{errors.className}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1.5 block">Due Date *</label>
                  <div className="relative">
                    <input
                      type="date"
                      className={clsx('input-field pr-9', errors.dueDate && 'border-red-300')}
                      value={form.dueDate}
                      onChange={(e) => updateForm({ dueDate: e.target.value })}
                    />
                    <CalendarIcon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>}
                </div>
              </div>

              {/* Question Types */}
              <div>
                <div className="grid grid-cols-[1fr,140px,100px,32px] gap-2 text-xs font-medium text-gray-500 mb-2 px-1">
                  <span>Question Type</span>
                  <span className="text-center">No. of Questions</span>
                  <span className="text-center">Marks</span>
                  <span />
                </div>
                <div className="space-y-2">
                  {form.questionTypes.map((qt, i) => (
                    <div key={i} className="grid grid-cols-[1fr,140px,100px,32px] gap-2 items-center">
                      <select
                        className="input-field text-sm"
                        value={qt.type}
                        onChange={(e) => updateQuestionType(i, { type: e.target.value })}
                      >
                        {QUESTION_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1 justify-center">
                        <button
                          onClick={() => updateQuestionType(i, { count: Math.max(1, qt.count - 1) })}
                          className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <input
                          type="number"
                          className="w-10 text-center text-sm border border-gray-200 rounded-lg py-1 focus:outline-none focus:ring-1 focus:ring-brand-orange/30"
                          value={qt.count}
                          min={1}
                          onChange={(e) => updateQuestionType(i, { count: Math.max(1, parseInt(e.target.value) || 1) })}
                        />
                        <button
                          onClick={() => updateQuestionType(i, { count: qt.count + 1 })}
                          className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-1 justify-center">
                        <button
                          onClick={() => updateQuestionType(i, { marks: Math.max(1, qt.marks - 1) })}
                          className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <input
                          type="number"
                          className="w-8 text-center text-sm border border-gray-200 rounded-lg py-1 focus:outline-none focus:ring-1 focus:ring-brand-orange/30"
                          value={qt.marks}
                          min={1}
                          onChange={(e) => updateQuestionType(i, { marks: Math.max(1, parseInt(e.target.value) || 1) })}
                        />
                        <button
                          onClick={() => updateQuestionType(i, { marks: qt.marks + 1 })}
                          className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeQuestionType(i)}
                        disabled={form.questionTypes.length === 1}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addQuestionType}
                  className="mt-3 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center">
                    <Plus size={12} className="text-white" />
                  </div>
                  Add Question Type
                </button>

                <div className="mt-3 text-right space-y-0.5">
                  <p className="text-sm text-gray-600">Total Questions: <span className="font-semibold">{totalQuestions}</span></p>
                  <p className="text-sm text-gray-600">Total Marks: <span className="font-semibold">{totalMarks}</span></p>
                </div>
              </div>

              {/* Additional Info */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                  Additional Information <span className="text-gray-400">(For better output)</span>
                </label>
                <textarea
                  className="input-field resize-none h-20"
                  placeholder="e.g. Generate a question paper for 3 hour exam duration..."
                  value={form.additionalInstructions}
                  onChange={(e) => updateForm({ additionalInstructions: e.target.value })}
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-5">
              <button
                onClick={() => router.push('/assignments')}
                className="btn-ghost"
              >
                <ChevronLeft size={15} />
                Previous
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="btn-primary bg-brand-dark"
              >
                {isLoading ? <Loader2 size={15} className="animate-spin" /> : <ChevronRight size={15} />}
                {isLoading ? 'Creating...' : 'Next'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function GeneratingScreen() {
  const { generationProgress } = useAssignmentStore();
  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="text-center max-w-sm px-6 animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-6 relative">
          <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
          <div
            className="absolute inset-0 rounded-full border-4 border-brand-orange transition-all duration-500"
            style={{
              background: `conic-gradient(#E8570E ${generationProgress * 3.6}deg, transparent 0deg)`,
              borderColor: 'transparent',
            }}
          />
          <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
            <span className="text-lg font-bold text-brand-orange">{generationProgress}%</span>
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Generating Question Paper</h2>
        <p className="text-sm text-gray-500">Our AI is crafting a comprehensive question paper tailored to your requirements...</p>
        <div className="mt-6 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-orange rounded-full transition-all duration-500"
            style={{ width: `${generationProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
