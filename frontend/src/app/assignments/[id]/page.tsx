'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Download, RefreshCw, Loader2, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Sidebar } from '../../../components/layout/Sidebar';
import { TopBar } from '../../../components/layout/TopBar';
import { useAssignmentStore } from '../../../store/assignmentStore';
import { useJobWebSocket } from '../../../lib/useWebSocket';
import { WSMessage, GeneratedPaper } from '../../../types';
import { exportToPDF } from '../../../lib/pdfExport';
import { clsx } from 'clsx';

const DIFFICULTY_STYLES = {
  Easy: 'difficulty-easy',
  Moderate: 'difficulty-moderate',
  Hard: 'difficulty-hard',
};

export default function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    currentAssignment, generatedPaper, isLoading,
    fetchAssignment, fetchGeneratedPaper, regenerateAssignment,
    setGeneratedPaper, setIsGenerating, setGenerationProgress, generationProgress
  } = useAssignmentStore();

  const [jobId, setJobId] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useJobWebSocket({
    jobId,
    onMessage: (msg: WSMessage) => {
      if (msg.type === 'JOB_PROGRESS') setGenerationProgress((msg as any).progress);
      if (msg.type === 'JOB_COMPLETE') {
        setGeneratedPaper((msg as any).data);
        setIsGenerating(false);
        setIsRegenerating(false);
        toast.success('Paper regenerated!');
      }
      if (msg.type === 'JOB_ERROR') {
        setIsGenerating(false);
        setIsRegenerating(false);
        toast.error('Regeneration failed');
      }
    },
  });

  useEffect(() => {
    if (id) {
      fetchAssignment(id);
      fetchGeneratedPaper(id);
    }
  }, [id]);

  const handleRegenerate = async () => {
    if (!id) return;
    setIsRegenerating(true);
    try {
      const { jobId: jId } = await regenerateAssignment(id);
      setJobId(jId);
      toast.success('Regenerating paper...');
    } catch {
      setIsRegenerating(false);
    }
  };

  const handleExport = async () => {
    if (!generatedPaper) return;
    setIsExporting(true);
    try {
      await exportToPDF(generatedPaper);
      toast.success('PDF exported!');
    } catch {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <TopBar title="Home" subtitle="Assignment Output" backHref="/assignments" />
        <main className="flex-1 overflow-y-auto bg-gray-50/30">
          <div className="max-w-3xl mx-auto p-6">
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-5">
              <div>
                {currentAssignment && (
                  <>
                    <h1 className="text-lg font-bold text-gray-900">{currentAssignment.title}</h1>
                    <p className="text-sm text-gray-500">{currentAssignment.subject} · Class {currentAssignment.className}</p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="btn-ghost text-sm"
                >
                  {isRegenerating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  Regenerate
                </button>
                <button
                  onClick={handleExport}
                  disabled={!generatedPaper || isExporting}
                  className="btn-primary"
                >
                  {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  Download as PDF
                </button>
              </div>
            </div>

            {/* Loading */}
            {isLoading && !generatedPaper && (
              <div className="card p-12 text-center animate-pulse">
                <Loader2 size={32} className="mx-auto mb-3 text-brand-orange animate-spin" />
                <p className="text-sm text-gray-500">Loading question paper...</p>
              </div>
            )}

            {/* Generating progress */}
            {isRegenerating && (
              <div className="card p-6 mb-4 flex items-center gap-4 animate-fade-in">
                <div className="w-10 h-10 rounded-full border-4 border-gray-100 border-t-brand-orange animate-spin shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Regenerating paper...</p>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full">
                    <div className="h-full bg-brand-orange rounded-full transition-all" style={{ width: `${generationProgress}%` }} />
                  </div>
                </div>
                <span className="text-sm font-semibold text-brand-orange">{generationProgress}%</span>
              </div>
            )}

            {/* Generated Paper */}
            {generatedPaper && !isRegenerating && (
              <QuestionPaperView paper={generatedPaper} />
            )}

            {/* No paper yet */}
            {!isLoading && !generatedPaper && !isRegenerating && currentAssignment?.jobStatus === 'failed' && (
              <div className="card p-12 text-center">
                <p className="text-gray-500 mb-4">Generation failed. Please try regenerating.</p>
                <button onClick={handleRegenerate} className="btn-primary mx-auto">
                  <RefreshCw size={14} /> Try Again
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function QuestionPaperView({ paper }: { paper: GeneratedPaper }) {
  const [showAnswers, setShowAnswers] = useState(false);
  let globalQNum = 1;

  return (
    <div className="card overflow-hidden animate-fade-in" id="question-paper">
      {/* Paper Header */}
      <div className="bg-gray-900 text-white p-6 text-center">
        <h1 className="text-lg font-bold mb-1">{paper.schoolName}</h1>
        <p className="text-sm text-gray-300">Subject: {paper.subject}</p>
        <p className="text-sm text-gray-300">Class: {paper.className}</p>
      </div>

      <div className="p-6">
        {/* Meta */}
        <div className="flex justify-between text-sm mb-4 pb-4 border-b border-gray-100">
          <span className="text-gray-600">Time Allowed: <strong>{paper.timeAllowed}</strong></span>
          <span className="text-gray-600">Maximum Marks: <strong>{paper.maximumMarks}</strong></span>
        </div>

        <p className="text-xs text-gray-500 italic mb-4">All questions are compulsory unless stated otherwise.</p>

        {/* Student Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 pb-4 border-b border-gray-100">
          <div className="text-sm text-gray-600">Name: <span className="inline-block w-32 border-b border-gray-400" /></div>
          <div className="text-sm text-gray-600">Roll Number: <span className="inline-block w-24 border-b border-gray-400" /></div>
          <div className="text-sm text-gray-600">Class: <span className="inline-block w-16 border-b border-gray-400" /> Section: <span className="inline-block w-12 border-b border-gray-400" /></div>
        </div>

        {/* Toggle Answers */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className="text-xs text-brand-orange hover:underline font-medium"
          >
            {showAnswers ? 'Hide' : 'Show'} Answer Key
          </button>
        </div>

        {/* Sections */}
        {paper.sections.map((section, si) => (
          <div key={si} className="mb-6">
            <div className="text-center mb-3">
              <h2 className="text-base font-bold text-gray-900">{section.title}</h2>
              <p className="text-xs text-gray-500 italic">{section.instruction}</p>
            </div>

            <div className="space-y-3">
              {section.questions.map((q, qi) => {
                const num = globalQNum++;
                return (
                  <div key={q.id} className="group">
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-semibold text-gray-500 shrink-0 w-5">{num}.</span>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm text-gray-800 leading-relaxed">{q.text}</p>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={clsx(
                              'text-xs px-2 py-0.5 rounded-full font-medium border',
                              DIFFICULTY_STYLES[q.difficulty] || 'bg-gray-100 text-gray-600 border-gray-200'
                            )}>
                              {q.difficulty}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">[{q.marks}M]</span>
                          </div>
                        </div>
                        {showAnswers && q.answer && (
                          <div className="mt-2 p-2.5 bg-green-50 rounded-lg border border-green-100 animate-fade-in">
                            <p className="text-xs font-medium text-green-700 mb-0.5">Answer:</p>
                            <p className="text-xs text-green-800 leading-relaxed">{q.answer}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-right mt-2 text-xs text-gray-400">Section total: {section.totalMarks} marks</div>
          </div>
        ))}

        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 font-medium">— End of Question Paper —</p>
        </div>
      </div>
    </div>
  );
}
