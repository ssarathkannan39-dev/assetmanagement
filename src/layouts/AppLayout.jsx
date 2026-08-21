import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client.js';
import BrandMark from '../components/BrandMark.jsx';

const MENU = [
  { label: 'Dashboard', icon: '⌂', to: '/', end: true },
  { label: 'Super dashboard', icon: '✦', to: '/super-dashboard' },
  { label: 'My asset dashboard', icon: '▣', to: '/my-assets' },
  { label: 'Requirements', icon: '✓', to: '/requirements' },
  {
    label: 'Assets',
    icon: '▦',
    children: [
      { label: 'All assets', to: '/assets' },
      { label: 'Add asset', to: '/assets/new' },
      { label: 'Scan asset tag', to: '/scan' },
    ],
  },
  { label: 'Assignments', icon: '⇄', to: '/assignments' },
  { label: 'Maintenance', icon: '⚒', to: '/maintenance' },
  {
    label: 'Inventory',
    icon: '▤',
    children: [
      { label: 'Accessories', to: '/accessories' },
      { label: 'Consumables', to: '/consumables' },
      { label: 'Licenses', to: '/licenses' },
      { label: 'Documents', to: '/documents' },
      { label: 'Components', to: '/accessories' },
      { label: 'Predefined kits', to: '/accessories' },
    ],
  },
  { label: 'Import', icon: '⇧', to: '/reports' },
  {
    label: 'Settings',
    icon: '⚙',
    children: [
      { label: 'Custom fields', to: '/profile' },
      { label: 'Status labels', to: '/profile' },
      { label: 'Categories', to: '/profile' },
      { label: 'System reports', to: '/reports' },
    ],
  },
  {
    label: 'People',
    icon: '♟',
    children: [
      { label: 'All users', to: '/profile' },
      { label: 'My asset dashboard', to: '/my-assets' },
      { label: 'My profile', to: '/profile' },
    ],
  },
  { label: 'Audit log', icon: '≣', to: '/audit-log' },
  { label: 'Reports', icon: '▥', to: '/reports' },
];

const ASSET_USER_MENU = [
  { label: 'My asset dashboard', icon: '▣', to: '/my-assets' },
  { label: 'Requestable items', icon: '＋', to: '/my-assets?tab=requestable' },
  { label: 'Requested items', icon: '◷', to: '/my-assets?tab=requested' },
  { label: 'Maintenance', icon: '⚒', to: '/maintenance' },
  { label: 'Documents', icon: '▤', to: '/documents' },
];

const CREATE_ITEMS = [
  ['Asset', '/assets/new'],
  ['Accessory', '/accessories'],
  ['Consumable', '/consumables'],
  ['License', '/licenses'],
  ['Maintenance record', '/maintenance'],
];

function MenuItem({ item, open, onToggle }) {
  const location = useLocation();
  const active = item.to === location.pathname || item.children?.some((child) => location.pathname.startsWith(child.to));
  if (!item.children) {
    return <NavLink to={item.to} end={item.end} className={({ isActive }) => `group mx-3 flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] transition ${isActive ? 'bg-[#dbeafe] text-[#0f1f35] font-semibold' : 'text-[#b8c5d2] hover:bg-[#1c3150] hover:text-white'}`}><span className="w-5 text-center text-base text-[#93c5fd]">{item.icon}</span>{item.label}</NavLink>;
  }
  return <div>
    <button type="button" onClick={onToggle} className={`mx-3 flex w-[calc(100%-1.5rem)] items-center gap-3 rounded-md px-3 py-2.5 text-left text-[13px] transition ${active ? 'text-white' : 'text-[#b8c5d2] hover:bg-[#1c3150] hover:text-white'}`}>
      <span className="w-5 text-center text-base text-[#93c5fd]">{item.icon}</span><span className="flex-1">{item.label}</span><span className={`text-xs transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
    </button>
    {open && <div className="mx-3 border-l border-[#385474] bg-[#142844] py-1 pl-9 pr-2">{item.children.map((child) => <NavLink key={`${item.label}-${child.to}`} to={child.to} className={({ isActive }) => `block py-2 text-xs transition ${isActive ? 'font-semibold text-[#bfdbfe]' : 'text-[#9eb0c2] hover:text-white'}`}>{child.label}</NavLink>)}</div>}
  </div>;
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState(() => Object.fromEntries(MENU.filter((item) => item.children).map((item) => [item.label, true])));
  const [createOpen, setCreateOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [assetResults, setAssetResults] = useState([]);
  const [systemOnline, setSystemOnline] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('assetrak_theme') === 'midnight');
  const menu = user?.role === 'asset_user' ? ASSET_USER_MENU : user?.role === 'superadmin' ? MENU : MENU.filter((item) => item.to !== '/super-dashboard');
  const currentLabel = useMemo(() => {
    const entries = menu.flatMap((item) => item.children || item);
    const match = entries.find((item) => item.to === location.pathname) || entries.filter((item) => item.to && item.to !== '/').find((item) => location.pathname.startsWith(`${item.to}/`));
    return match?.label || 'Dashboard';
  }, [location.pathname, menu]);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'midnight' : 'royal';
    localStorage.setItem('assetrak_theme', darkMode ? 'midnight' : 'royal');
  }, [darkMode]);

  useEffect(() => {
    const onShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen(true);
      }
      if (event.key === 'Escape') {
        setPaletteOpen(false);
        setCreateOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener('keydown', onShortcut);
    return () => window.removeEventListener('keydown', onShortcut);
  }, []);

  useEffect(() => {
    let active = true;
    const checkHealth = () => api.get('/health').then(() => active && setSystemOnline(true)).catch(() => active && setSystemOnline(false));
    checkHealth();
    const timer = window.setInterval(checkHealth, 30000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setAssetResults([]);
      return undefined;
    }
    const timer = window.setTimeout(() => {
      api.get('/assets', { params: { search: search.trim(), limit: 6 } })
        .then(({ data }) => setAssetResults(data.items || data.data || data || []))
        .catch(() => setAssetResults([]));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const commands = [
    ['Open dashboard', '/', '⌂'],
    ['Manage assets', '/assets', '▦'],
    ['Create an asset', '/assets/new', '+'],
    ['Open reports', '/reports', '▥'],
    ['Open profile', '/profile', '♟'],
  ];
  const go = (path) => {
    setPaletteOpen(false);
    setSearch('');
    navigate(path);
  };

  return <div className={`app-shell flex min-h-screen ${darkMode ? 'theme-midnight' : ''}`}>
    <aside className="sidebar-scroll fixed inset-y-0 left-0 z-30 flex w-64 flex-col overflow-y-auto bg-[#0f1f35] shadow-xl">
      <div className="flex h-20 items-center gap-3 border-b border-[#263f5d] px-5">
        <BrandMark compact />
      </div>
      <nav className="flex-1 py-4">{menu.map((item) => <MenuItem key={item.label} item={item} open={openGroups[item.label]} onToggle={() => setOpenGroups((prev) => ({ ...prev, [item.label]: !prev[item.label] }))} />)}</nav>
      <div className="border-t border-[#263f5d] p-4"><Link to="/profile" className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#2563eb] font-bold text-white">{(user?.name || 'A').slice(0, 1).toUpperCase()}</div><div className="min-w-0"><div className="truncate text-sm font-semibold text-white">{user?.name}</div><div className="truncate text-xs text-[#9eb0c2]">{user?.role}</div></div></Link><button onClick={logout} className="mt-3 w-full rounded border border-[#385474] px-3 py-1.5 text-xs text-[#b8c5d2] hover:border-[#93c5fd] hover:text-white">Sign out</button></div>
    </aside>
    <div className="ml-64 flex min-h-screen min-w-0 flex-1 flex-col">
      <header className="sticky top-0 z-20 flex min-h-20 flex-wrap items-center gap-3 border-b border-line bg-[#fffdf8] px-6 py-3 text-ink shadow-sm">
        <div className="mr-auto"><div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">Workspace / current view</div><div className="text-lg font-semibold">{currentLabel}</div></div>
        <button onClick={() => setPaletteOpen(true)} className="hidden rounded border border-line px-2 py-2 text-[10px] text-muted lg:block">CTRL K</button>
        <div className="relative hidden w-64 md:block"><input value={search} onFocus={() => setPaletteOpen(true)} onChange={(e) => setSearch(e.target.value)} placeholder="Search asset tag..." className="w-full rounded-md border border-line bg-[#f3f1ec] px-3 py-2 text-xs text-ink outline-none placeholder:text-muted focus:border-accent" />{search && <button onClick={() => setSearch('')} className="absolute right-2 top-1.5 text-sm text-muted">×</button>}{search && paletteOpen && <div className="absolute left-0 top-11 z-50 w-full rounded-md border border-line bg-[#fffdf8] py-2 text-ink shadow-xl">{assetResults.length ? assetResults.map((asset) => <button type="button" onClick={() => go(`/assets/${asset._id}`)} className="block w-full px-3 py-2 text-left hover:bg-[#f3f1ec]" key={asset._id}><div className="text-xs font-semibold">{asset.name}</div><div className="text-[10px] text-muted">{asset.assetTag} · {asset.status}</div></button>) : <div className="px-3 py-2 text-xs text-muted">No matching assets</div>}</div>}</div>
        <div className="hidden items-center gap-1 text-[10px] text-[#d7f2f8] xl:flex"><span className={`h-2 w-2 rounded-full ${systemOnline ? 'bg-emerald-300' : 'bg-red-300'}`} />{systemOnline ? 'ONLINE' : 'OFFLINE'}</div>
        <button type="button" onClick={() => setDarkMode((value) => !value)} className="rounded px-2 py-2 text-sm text-muted hover:bg-[#f3f1ec]" title="Toggle visual mode">{darkMode ? '☀' : '◐'}</button>
        {user?.role !== 'asset_user' && <div className="relative"><button onClick={() => setCreateOpen((value) => !value)} className="rounded-md bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8]">Create new ▾</button>{createOpen && <div className="absolute right-0 top-11 w-52 rounded-md border border-line bg-panel py-2 text-sm text-ink shadow-xl">{CREATE_ITEMS.map(([label, to]) => <Link onClick={() => setCreateOpen(false)} className="block px-4 py-2 hover:bg-[#f1f5f9] hover:text-accent" key={to} to={to}>{label}</Link>)}</div>}</div>}
        <div className="relative"><button onClick={() => setProfileOpen((value) => !value)} className="flex items-center gap-2 rounded px-2 py-1 hover:bg-[#f1f5f9]"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#0f1f35] text-sm font-bold text-[#bfdbfe]">{(user?.name || 'A').slice(0, 1).toUpperCase()}</span><span className="hidden text-xs font-semibold sm:block">{user?.name || 'Admin'}</span><span className="text-xs">▾</span></button>{profileOpen && <div className="absolute right-0 top-11 w-44 rounded-md border border-line bg-panel py-2 text-sm text-ink shadow-xl"><Link className="block px-4 py-2 hover:bg-[#f1f5f9]" to="/profile">My profile</Link><Link className="block px-4 py-2 hover:bg-[#f1f5f9]" to="/reports">Reports</Link><button onClick={logout} className="block w-full px-4 py-2 text-left hover:bg-[#f1f5f9]">Sign out</button></div>}</div>
      </header>
      <main className="flex-1 bg-[var(--bg)]"><div className="page-enter mx-auto w-full max-w-[1440px] px-5 py-6 lg:px-8"><Outlet /></div></main>
    </div>
    {paletteOpen && <div className="fixed inset-0 z-40 bg-[#10212a]/50 p-4 pt-[12vh]" onMouseDown={() => setPaletteOpen(false)}><div className="mx-auto max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="border-b border-slate-200 px-4 py-3"><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search assets or type a command..." className="w-full text-sm text-[#172033] outline-none" /></div><div className="max-h-80 overflow-y-auto p-2">{search && assetResults.map((asset) => <button type="button" onClick={() => go(`/assets/${asset._id}`)} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-blue-50" key={asset._id}><span className="text-accent">▦</span><span><b className="block text-sm text-[#172033]">{asset.name}</b><small className="text-xs text-slate-500">{asset.assetTag} · {asset.status}</small></span></button>)}{!search && commands.map(([label, path, icon]) => <button type="button" onClick={() => go(path)} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-blue-50" key={path}><span className="grid h-7 w-7 place-items-center rounded bg-blue-50 text-accent">{icon}</span><span className="text-sm text-[#172033]">{label}</span><span className="ml-auto text-xs text-slate-400">↵</span></button>)}{search && !assetResults.length && <div className="p-5 text-center text-sm text-slate-500">No results found.</div>}</div><div className="border-t border-slate-200 px-4 py-2 text-[10px] text-slate-400">ESC to close · CTRL K to open</div></div></div>}
  </div>;
}
