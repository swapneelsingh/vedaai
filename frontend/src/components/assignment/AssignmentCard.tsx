'use client';
import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, Trash2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { Assignment } from '../../types';
import { useAssignmentStore } from '../../store/assignmentStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AssignmentCardProps {
  assignment: Assignment;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700 animate-pulse',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { deleteAssignment } = useAssignmentStore();
  const router = useRouter();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDelete = async () => {
    setMenuOpen(false);
    toast.promise(deleteAssignment(assignment._id), {
      loading: 'Deleting...',
      success: 'Assignment deleted',
      error: 'Failed to delete',
    });
  };

  const handleView = () => {
    setMenuOpen(false);
    router.push(`/assignments/${assignment._id}`);
  };

  const totalQuestions = assignment.questionTypes.reduce((s, qt) => s + qt.count, 0);
  const totalMarks = assignment.questionTypes.reduce((s, qt) => s + qt.count * qt.marks, 0);

  return (
    <div className="card p-4 hover:shadow-card-hover transition-all duration-200 animate-fade-in group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{assignment.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{assignment.subject} · Class {assignment.className}</p>
        </div>
        <div className="relative ml-2 shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-7 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[160px] animate-fade-in">
              <button
                onClick={handleView}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Eye size={14} /> View Assignment
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[assignment.jobStatus]}`}>
          {assignment.jobStatus === 'processing' ? 'Generating...' : assignment.jobStatus.charAt(0).toUpperCase() + assignment.jobStatus.slice(1)}
        </span>
        <span className="text-xs text-gray-400">{totalQuestions}Q · {totalMarks}M</span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          <span className="font-medium text-gray-600">Assigned on:</span>{' '}
          {format(new Date(assignment.createdAt), 'dd-MM-yyyy')}
        </span>
        <span>
          <span className="font-medium text-gray-600">Due:</span>{' '}
          {format(new Date(assignment.dueDate), 'dd-MM-yyyy')}
        </span>
      </div>
    </div>
  );
}
