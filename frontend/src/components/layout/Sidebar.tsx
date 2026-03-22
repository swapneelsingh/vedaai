// 'use client';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import {
//   LayoutGrid, Users, FileText, BookOpen, Library,
//   Settings, Plus
// } from 'lucide-react';
// import { clsx } from 'clsx';

// const navItems = [
//   { label: 'Home', icon: LayoutGrid, href: '/' },
//   { label: 'My Groups', icon: Users, href: '/groups' },
//   { label: 'Assignments', icon: FileText, href: '/assignments' },
//   { label: "AI Teacher's Toolkit", icon: BookOpen, href: '/toolkit' },
//   { label: 'My Library', icon: Library, href: '/library' },
// ];

// export function Sidebar() {
//   const pathname = usePathname();

//   return (
//     <aside className="w-[220px] min-h-screen bg-white border-r border-gray-200 flex flex-col">
//       {/* Logo */}
//       <div className="px-4 pt-5 pb-4">
//         <div className="flex items-center gap-2">
//           <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center">
//             <span className="text-white font-bold text-sm">V</span>
//           </div>
//           <span className="font-semibold text-gray-900 text-base">VedaAI</span>
//         </div>
//       </div>

//       {/* CTA */}
//       <div className="px-3 mb-4">
//         <Link href="/create-assignment">
//           <button className="w-full bg-brand-dark text-white rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors duration-150">
//             <Plus size={15} />
//             Create Assignment
//           </button>
//         </Link>
//       </div>

//       {/* Nav */}
//       <nav className="flex-1 px-3 space-y-0.5">
//         {navItems.map(({ label, icon: Icon, href }) => {
//           const isActive = href === '/'
//             ? pathname === '/'
//             : pathname.startsWith(href);
//           return (
//             <Link key={href} href={href}>
//               <div className={clsx('sidebar-nav-item', isActive && 'active')}>
//                 <Icon size={16} className="shrink-0" />
//                 <span>{label}</span>
//               </div>
//             </Link>
//           );
//         })}
//       </nav>

//       {/* Footer */}
//       <div className="px-3 pb-4 space-y-1">
//         <div className="sidebar-nav-item">
//           <Settings size={16} />
//           <span>Settings</span>
//         </div>
//         <div className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl mt-1">
//           <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden shrink-0">
//             <span className="text-amber-700 font-bold text-xs">DPS</span>
//           </div>
//           <div className="min-w-0">
//             <p className="text-xs font-semibold text-gray-900 truncate">Delhi Public School</p>
//             <p className="text-xs text-gray-500 truncate">Bokaro Steel City</p>
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// }



'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid, Users, FileText, BookOpen, Library,
  Settings, Plus, Menu, X
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-3 left-3 z-50 p-2 rounded-lg bg-white border border-gray-200 shadow-sm md:hidden"
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed md:static inset-y-0 left-0 z-40 w-[220px] min-h-screen bg-white border-r border-gray-200 flex flex-col transition-transform duration-300',
        'md:translate-x-0',
        isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
      )}>
        {/* Logo */}
        {/* <div className="px-4 pt-5 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="font-semibold text-gray-900 text-base">VedaAI</span>
          </div>
        </div> */}
        {/* Logo */}
<div className="px-4 pt-5 pb-4">
  <div className="flex items-center gap-2.5">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{background: 'linear-gradient(145deg, #E8570E 0%, #C04010 50%, #8B1A1A 100%)'}}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M4 4L12 20L20 4H16L12 13L8 4H4Z" fill="white" strokeLinejoin="round"/>
      </svg>
    </div>
    <span className="font-bold text-gray-900 text-lg tracking-tight">VedaAI</span>
  </div>
</div>

        {/* CTA */}
        {/* <div className="px-3 mb-4">
          <Link href="/create-assignment" onClick={() => setIsOpen(false)}>
            <button className="w-full bg-brand-dark text-white rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors duration-150">
              <Plus size={15} />
              Create Assignment
            </button>
          </Link>
        </div> */}
        {/* CTA */}
<div className="px-3 mb-4">
  <Link href="/create-assignment" onClick={() => setIsOpen(false)}>
    <button className="w-full text-white rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-150 hover:opacity-90 shadow-lg"
      style={{
        background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)',
        border: '2px solid #E8570E',
        boxShadow: '0 0 0 1px #E8570E, 0 4px 15px rgba(232, 87, 14, 0.3)'
      }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
        <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/>
        <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75L19 15z"/>
      </svg>
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
              <Link key={href} href={href} onClick={() => setIsOpen(false)}>
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
    </>
  );
}