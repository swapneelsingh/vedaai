'use client';
import { Bell, ChevronDown, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface TopBarProps {
  title?: string;
  subtitle?: string;
  backHref?: string;
  showStatus?: boolean;
}

export function TopBar({ title, subtitle, backHref, showStatus }: TopBarProps) {
  return (
    // <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0">
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 pl-14 md:pl-6 shrink-0">
      <div className="flex items-center gap-3">
        {backHref && (
          <Link href={backHref} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={18} />
          </Link>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          <span>{title || 'Home'}</span>
        </div>
        {subtitle && (
          <>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-900 font-medium">{subtitle}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell size={18} />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors">
          <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
              <span className="text-xs font-medium text-white">JD</span>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-700">John Doe</span>
          <ChevronDown size={14} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
}
