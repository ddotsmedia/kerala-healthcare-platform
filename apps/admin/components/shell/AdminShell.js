'use client';

// AdminShell — dark collapsible sidebar + top bar + theme + toasts + shortcuts.
// Fixed sidebar on desktop, drawer on mobile. Chrome is hidden on /login.

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import KeyboardShortcuts from './KeyboardShortcuts';
import { ToastProvider } from './Toast';
import { crumbFor } from './nav';
import Icon from './Icon';

export default function AdminShell({ children }) {
  const pathname = usePathname() || '';
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    try { setCollapsed(localStorage.getItem('khp-admin-collapsed') === '1'); } catch { /* noop */ }
  }, []);
  useEffect(() => { setDrawer(false); }, [pathname]); // close drawer on navigation
  useEffect(() => {
    const close = () => setDrawer(false);
    window.addEventListener('admin:escape', close);
    return () => window.removeEventListener('admin:escape', close);
  }, []);

  const toggleCollapse = () => {
    setCollapsed((c) => { const n = !c; try { localStorage.setItem('khp-admin-collapsed', n ? '1' : '0'); } catch { /* noop */ } return n; });
  };

  if (pathname === '/login') return <ToastProvider>{children}</ToastProvider>;

  const crumbs = crumbFor(pathname);

  return (
    <ToastProvider>
      <div className="min-h-screen">
        {/* Desktop sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 hidden lg:block ${collapsed ? 'w-16' : 'w-60'}`} style={{ transition: 'width .2s ease' }}>
          <Sidebar collapsed={collapsed} />
        </aside>

        {/* Mobile drawer */}
        {drawer && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} />
            <div className="absolute inset-y-0 left-0 w-64 shadow-2xl" style={{ animation: 'toastIn .2s ease' }}>
              <Sidebar collapsed={false} onNavigate={() => setDrawer(false)} />
            </div>
          </div>
        )}

        {/* Main column */}
        <div className={`flex min-h-screen flex-col ${collapsed ? 'lg:pl-16' : 'lg:pl-60'}`} style={{ transition: 'padding .2s ease' }}>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur">
            <button onClick={() => { if (window.innerWidth >= 1024) toggleCollapse(); else setDrawer(true); }}
              aria-label="Toggle navigation" className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-soft hover:text-brand hover:border-brand">
              <Icon name="menu" className="h-5 w-5" />
            </button>
            <nav className="flex min-w-0 items-center gap-1.5 text-sm" aria-label="Breadcrumb">
              {crumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-ink-soft">/</span>}
                  <span className={i === crumbs.length - 1 ? 'truncate font-semibold text-ink' : 'text-ink-soft'}>{c}</span>
                </span>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <NotificationBell />
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white" title="Admin">A</div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
      <KeyboardShortcuts />
    </ToastProvider>
  );
}
