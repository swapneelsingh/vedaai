'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid, Users, FileText, BookOpen, Library,
  Settings, Plus
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { label: 'Home', icon: LayoutGrid, href: '/' },
  { label: 'My Groups', icon: Users, href: '/groups' },
  { label: 'Assignments', icon: FileText, href: '/assignments' },
  { label: "AI Teacher's Toolkit", icon: BookOpen, href: '/toolkit' },
  { label: 'My Library', icon: Library, href: '/library' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="font-semibold text-gray-900 text-base">VedaAI</span>
        </div>
      </div>

      {/* CTA */}
      <div className="px-3 mb-4">
        <Link href="/create-assignment">
          <button className="w-full bg-brand-dark text-white rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors duration-150">
            <Plus size={15} />
            Create Assignment
          </button>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ label, icon: Icon, href }) => {
          const isActive = href === '/'
            ? pathname === '/'
            : pathname.startsWith(href);
          return (
            <Link key={href} href={href}>
              <div className={clsx('sidebar-nav-item', isActive && 'active')}>
                <Icon size={16} className="shrink-0" />
                <span>{label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 space-y-1">
        <div className="sidebar-nav-item">
          <Settings size={16} />
          <span>Settings</span>
        </div>
        <div className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl mt-1">
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden shrink-0">
            <span className="text-amber-700 font-bold text-xs">DPS</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">Delhi Public School</p>
            <p className="text-xs text-gray-500 truncate">Bokaro Steel City</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
