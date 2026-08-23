'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from './Icon';
import { NAV } from './nav';

export default function Sidebar({ collapsed = false, onNavigate }) {
  const pathname = usePathname() || '';
  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex h-full flex-col bg-sidebar text-slate-300">
      <div className={`flex h-14 items-center gap-2 border-b border-sidebar-border px-4 ${collapsed ? 'justify-center px-0' : ''}`}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand font-black text-white">K</span>
        {!collapsed && <span className="truncate font-bold text-white">KHP Admin</span>}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} onClick={onNavigate} title={collapsed ? item.label : undefined}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${collapsed ? 'justify-center px-0' : ''} ${
                active ? 'bg-sidebar-active text-white shadow-inner' : 'text-slate-400 hover:bg-sidebar-hover hover:text-white'
              }`}>
              <Icon name={item.icon} className="h-5 w-5 shrink-0" filled={active} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-light" />}
            </Link>
          );
        })}
      </nav>

      <div className={`border-t border-sidebar-border p-3 text-[11px] text-slate-500 ${collapsed ? 'text-center' : ''}`}>
        {collapsed ? 'v1' : 'MalayaliDoctor · Ops v1'}
      </div>
    </div>
  );
}
