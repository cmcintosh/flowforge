import { Outlet, NavLink } from 'react-router-dom';
import { Workflow, Key, Activity } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { to: '/workflows', label: 'Workflows', icon: Workflow },
  { to: '/credentials', label: 'Credentials', icon: Key },
  { to: '/executions', label: 'Executions', icon: Activity },
];

export function Layout() {
  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-[var(--flowforge-surface)] border-r border-[var(--flowforge-border)] flex flex-col">
        <div className="px-4 py-5 border-b border-[var(--flowforge-border)]">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <span className="text-[var(--flowforge-accent)]">⚡</span>
            FlowForge
          </h1>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-[var(--flowforge-accent)]/10 text-[var(--flowforge-accent)] border-r-2 border-[var(--flowforge-accent)]'
                    : 'text-[var(--flowforge-text-muted)] hover:text-[var(--flowforge-text)] hover:bg-white/5'
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
