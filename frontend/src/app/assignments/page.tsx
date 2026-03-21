'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Plus, FileX } from 'lucide-react';
import { Sidebar } from '../../components/layout/Sidebar';
import { TopBar } from '../../components/layout/TopBar';
import { AssignmentCard } from '../../components/assignment/AssignmentCard';
import { useAssignmentStore } from '../../store/assignmentStore';

export default function AssignmentsPage() {
  const { assignments, fetchAssignments, isLoading } = useAssignmentStore();
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => { fetchAssignments(); }, []);

  const filtered = assignments.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    // <div className="flex h-screen bg-white overflow-hidden">
    //   <Sidebar />
    //   <div className="flex-1 flex flex-col min-w-0 w-full">
    <div className="flex h-screen bg-white overflow-hidden">
  <Sidebar />
  <div className="flex-1 flex flex-col min-w-0 md:ml-0">
        <TopBar title="Home" />
        <main className="flex-1 overflow-y-auto bg-gray-50/50">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <h1 className="text-xl font-bold text-gray-900">Assignments</h1>
            </div>
            <p className="text-sm text-gray-500 mb-5">Manage and create assignments for your classes.</p>

            {/* Search & Filter */}
            <div className="flex items-center gap-3 mb-5">
              <button className="flex items-center gap-2 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 transition-colors">
                <Filter size={14} />
                Filter By
              </button>
              <div className="flex-1 relative max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                  placeholder="Search Assignment"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="card p-4 h-28 shimmer" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              assignments.length === 0 ? (
                <EmptyState onCreateClick={() => router.push('/create-assignment')} />
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <Search size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No assignments match your search</p>
                </div>
              )
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map((a) => (
                  <AssignmentCard key={a._id} assignment={a} />
                ))}
              </div>
            )}
          </div>

          {/* Floating create button */}
          {assignments.length > 0 && (
            <div className="sticky bottom-6 flex justify-center pb-2">
              <button
                onClick={() => router.push('/create-assignment')}
                className="bg-brand-dark text-white px-6 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg hover:bg-gray-800 transition-all duration-150 hover:shadow-xl"
              >
                <Plus size={15} />
                Create Assignment
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-fade-in">
      <div className="w-28 h-28 mb-6 relative">
        <div className="absolute inset-0 bg-gray-100 rounded-full" />
        <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-sm">
          <FileX size={36} className="text-gray-300" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-lg font-bold">×</span>
        </div>
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">No assignments yet</h2>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
      </p>
      <button onClick={onCreateClick} className="btn-primary bg-brand-dark">
        <Plus size={15} />
        Create Your First Assignment
      </button>
    </div>
  );
}
