'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '⊞' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Goodbye.');
      router.push('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-ink text-cream">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-ink-600">
        <span className="font-display text-xl text-cream tracking-tight">Taskwell</span>
        <div className="w-8 h-px bg-clay mt-2" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        <p className="font-mono text-xs text-ink-400 uppercase tracking-widest px-2 mb-4">
          Navigation
        </p>
        {navItems.map(({ label, href, icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 text-sm font-body font-medium transition-all duration-150',
              pathname === href
                ? 'bg-clay text-cream'
                : 'text-ink-300 hover:text-cream hover:bg-ink-700'
            )}
          >
            <span className="text-base leading-none">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      {/* User section */}
      <div className="px-4 py-6 border-t border-ink-700">
        <div className="flex items-center gap-3 px-3 mb-4">
          <div className="w-8 h-8 bg-clay flex items-center justify-center flex-shrink-0">
            <span className="font-display text-sm text-cream">
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-body text-sm text-cream font-medium truncate">{user?.name}</p>
            <p className="font-mono text-xs text-ink-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-body text-ink-400 hover:text-cream hover:bg-ink-700 transition-all duration-150"
        >
          <span className="text-base leading-none">→</span>
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col z-20">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-ink text-cream px-4 py-4 flex items-center justify-between border-b border-ink-700">
        <span className="font-display text-lg">Taskwell</span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-8 h-8 flex flex-col items-center justify-center gap-1.5"
        >
          <span className={clsx('w-5 h-px bg-cream transition-all', mobileOpen && 'rotate-45 translate-y-1.5')} />
          <span className={clsx('w-5 h-px bg-cream transition-all', mobileOpen && 'opacity-0')} />
          <span className={clsx('w-5 h-px bg-cream transition-all', mobileOpen && '-rotate-45 -translate-y-1.5')} />
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-ink/60 z-30"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 h-screen w-72 z-40 animate-slide-in-right">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Mobile top bar spacer */}
      <div className="lg:hidden h-14" />
    </>
  );
}
