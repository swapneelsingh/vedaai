'use client';
import { Sidebar } from '../../components/layout/Sidebar';
import { TopBar } from '../../components/layout/TopBar';

export default function ToolkitPage() {
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title="AI Teacher's Toolkit" />
        <main className="flex-1 flex items-center justify-center bg-gray-50/50">
          <div className="text-center text-gray-400">
            <p className="text-lg font-medium">AI Teacher's Toolkit</p>
            <p className="text-sm mt-1">Coming soon</p>
          </div>
        </main>
      </div>
    </div>
  );
}
