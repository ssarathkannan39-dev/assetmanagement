import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '◧', end: true },
  { to: '/assets', label: 'Assets', icon: '▣' },
  { to: '/assignments', label: 'Assignments', icon: '⇄' },
  { to: '/maintenance', label: 'Maintenance', icon: '⚙' },
  { to: '/scan', label: 'Scan Tag', icon: '▤' },
  { to: '/audit-log', label: 'Audit Log', icon: '≣' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();  

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 border-r border-line bg-panel flex flex-col">
        <div className="px-5 py-6 border-b border-line">
          <div className="stencil text-xl font-bold text-zinc-50 tracking-tight">
            ASSET<span className="text-accent">RAK</span>
          </div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted mt-1">
            Inventory Control
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent text-ink'
                    : 'text-zinc-300 hover:bg-panel2 hover:text-zinc-50'
                }`
              }
            >
              <span className="stencil text-base w-4 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-line">
          <div className="text-sm text-zinc-100 font-medium truncate">{user?.name}</div>
          <div className="text-xs text-muted truncate mb-3">{user?.email}</div>
          <button onClick={logout} className="btn-outline w-full text-xs py-1.5">
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
