import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client.js';
import BrandMark from '../components/BrandMark.jsx';

const MENU = [
  { key: 'dashboard', label: 'Dashboard', icon: '⌂', to: '/', end: true },
  { key: 'calendar', label: 'Calendar', icon: '▦', to: '/calendar' },
  { key: 'super-dashboard', label: 'Super dashboard', icon: '✦', to: '/super-dashboard' },
  { key: 'requirements', label: 'Requirements', icon: '✓', to: '/requirements' },
  {
    key: 'assets',
    label: 'Asset Management',
    icon: '▦',
    children: [
      { key: 'all-assets', label: 'Asset Inventory', to: '/assets' },
      { key: 'add-asset', label: 'Add Asset', to: '/assets/new' },
      { key: 'deployed-assets', label: 'Deployed Assets', to: '/assets?status=assigned' },
      { key: 'ready-assets', label: 'Ready to Deploy', to: '/assets?status=available' },
      { key: 'pending-assets', label: 'Pending', to: '/assets?status=in_maintenance' },
      { key: 'undeployable-assets', label: 'Un-deployable', to: '/assets?status=lost' },
      { key: 'byod-assets', label: 'BYOD', to: '/assets?status=byod' },
      { key: 'archived-assets', label: 'Archived', to: '/assets?status=retired' },
      { key: 'requestable-assets', label: 'Requestable', to: '/requestable-items' },
      { key: 'audit-due', label: 'Due for Audit', to: '/audit-log' },
      { key: 'checkin-due', label: 'Due for Checkin', to: '/assignments?status=overdue' },
      { key: 'scan-asset', label: 'Scan Asset Tag', to: '/scan' },
      { key: 'quick-scan-checkin', label: 'Quick Scan Checkin', to: '/scan' },
      { key: 'bulk-checkout', label: 'Bulk Checkout', to: '/assignments' },
      { key: 'requested-assets', label: 'Requested', to: '/my-assets?tab=requested' },
      { key: 'deleted-assets', label: 'Deleted', to: '/assets?status=deleted' },
      { key: 'scanner-audit', label: 'Scanner Bulk Audit', to: '/audit-log' },
    ],
  },
  { key: 'assignments', label: 'Assignments', icon: '⇄', to: '/assignments' },
  { key: 'maintenance', label: 'Maintenances', icon: '⚒', to: '/maintenance' },
  {
    key: 'inventory',
    label: 'Inventory',
    icon: '▤',
    children: [
      { key: 'accessories', label: 'Accessories', to: '/accessories' },
      { key: 'consumables', label: 'Consumables', to: '/consumables' },
      { key: 'licenses', label: 'Licenses', to: '/licenses' },
      { key: 'documents', label: 'Documents', to: '/documents' },
      { key: 'components', label: 'Components', to: '/components' },
      { key: 'kits', label: 'Predefined Kits', to: '/kits' },
    ],
  },
  { key: 'reports', label: 'Reports', icon: '▥', to: '/reports' },
  {
    key: 'people',
    label: 'People',
    icon: '♟',
    children: [
      { key: 'all-users', label: 'All Users', to: '/users' },
      { key: 'my-profile', label: 'My Profile', to: '/profile' },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: '⚙',
    children: [
      { key: 'categories', label: 'Categories', to: '/profile' },
      { key: 'custom-fields', label: 'Custom Fields', to: '/profile' },
      { key: 'status-labels', label: 'Status Labels', to: '/profile' },
    ],
  },
  { key: 'audit-log', label: 'Audit Log', icon: '≣', to: '/audit-log' },
  { key: 'my-assets', label: 'My Asset Dashboard', icon: '▣', to: '/my-assets' },
  { key: 'requestable-items', label: 'Requestable Items', icon: '＋', to: '/requestable-items' },
  { key: 'import', label: 'Import', icon: '↥', to: '/import' },
];

export const DEFAULT_ROLE_ACCESS = {
  superadmin: MENU.flatMap((item) => item.children ? [item.key, ...item.children.map((child) => child.key)] : [item.key]),
  admin: ['dashboard', 'calendar', 'requirements', 'assets', 'all-assets', 'deployed-assets', 'ready-assets', 'pending-assets', 'undeployable-assets', 'byod-assets', 'archived-assets', 'requestable-assets', 'audit-due', 'checkin-due', 'add-asset', 'scan-asset', 'quick-scan-checkin', 'bulk-checkout', 'requested-assets', 'deleted-assets', 'scanner-audit', 'assignments', 'maintenance', 'inventory', 'accessories', 'consumables', 'licenses', 'documents', 'components', 'kits', 'reports', 'people', 'all-users', 'my-profile', 'audit-log', 'import', 'my-assets', 'requestable-items'],
  asset_user: ['dashboard', 'calendar', 'my-assets', 'requestable-items', 'maintenance', 'documents', 'profile'],
};

export const MENU_ACCESS_OPTIONS = MENU.flatMap((item) => item.children ? item.children.map((child) => ({ key: child.key, label: child.label, route: child.to })) : [{ key: item.key, label: item.label, route: item.to }]);

const getMenuAccessSet = (user) => {
  const access = Array.isArray(user?.menuAccess) && user.menuAccess.length ? user.menuAccess : DEFAULT_ROLE_ACCESS[user?.role] || [];
  return new Set(access);
};

const getVisibleMenu = (user) => {
  if (!user) return [];
  if (user.role === 'superadmin') return MENU;

  const allowed = getMenuAccessSet(user);
  return MENU.filter((item) => {
    if (item.children) {
      const children = item.children.filter((child) => allowed.has(child.key));
      if (!children.length) return false;
      return true;
    }
    return allowed.has(item.key);
  }).map((item) => (
    item.children
      ? { ...item, children: item.children.filter((child) => allowed.has(child.key)) }
      : item
  )).filter((item) => !item.children || item.children.length);
};

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
    {open && <div className="mx-3 border-l border-[#385474] bg-[#142844] py-1 pl-9 pr-2">{item.children.map((child) => <NavLink key={`${item.key}-${child.key}`} to={child.to} className={({ isActive }) => `block py-2 text-xs transition ${isActive ? 'font-semibold text-[#bfdbfe]' : 'text-[#9eb0c2] hover:text-white'}`}>{child.label}</NavLink>)}</div>}
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('assetrak_theme') === 'midnight');
  const menu = getVisibleMenu(user);
  const currentLabel = useMemo(() => {
    const entries = menu.flatMap((item) => item.children ? item.children : [item]);
    const match = entries.find((item) => item.to === location.pathname) || entries.filter((item) => item.to && item.to !== '/').find((item) => location.pathname.startsWith(`${item.to}/`));
    return match?.label || 'Dashboard';
  }, [location.pathname, menu]);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'midnight' : 'royal';
    localStorage.setItem('assetrak_theme', darkMode ? 'midnight' : 'royal');
  }, [darkMode]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

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

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    const loadNotifications = () => api.get('/notifications', { params: { limit: 30 } })
      .then(({ data }) => active && setNotifications(data.notifications || []))
      .catch(() => {});
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 60000);
    return () => { active = false; window.clearInterval(timer); };
  }, [user]);

  const commands = [
    ['Open dashboard', '/', '⌂'],
    ['Manage assets', '/assets', '▦'],
    ['Create an asset', '/assets/new', '+'],
    ['Open reports', '/reports', '▥'],
    ['Open calendar', '/calendar', '▦'],
    ['Open profile', '/profile', '♟'],
  ];
  const go = (path) => {
    setPaletteOpen(false);
    setSearch('');
    navigate(path);
  };
  const unreadCount = notifications.filter((item) => !item.readAt).length;
  const notificationPath = (notification) => {
    if (notification.entityType === 'Assignment') return '/assignments';
    if (notification.entityType === 'Maintenance') return '/maintenance';
    return '/';
  };
  const openNotification = async (notification) => {
    setNotificationsOpen(false);
    if (!notification.readAt) {
      setNotifications((items) => items.map((item) => item._id === notification._id ? { ...item, readAt: new Date().toISOString() } : item));
      await api.patch(`/notifications/${notification._id}/read`).catch(() => {});
    }
    navigate(notificationPath(notification));
  };
  const markAllNotificationsRead = async () => {
    setNotifications((items) => items.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
    await api.patch('/notifications/read-all').catch(() => {});
  };

  return <div className={`app-shell flex min-h-screen ${darkMode ? 'theme-midnight' : ''}`}>
    {mobileNavOpen && <button type="button" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} className="fixed inset-0 z-20 bg-slate-950/50 lg:hidden" />}
    <aside className={`sidebar-scroll fixed inset-y-0 left-0 z-30 w-64 flex-col overflow-y-auto bg-[#0f1f35] shadow-xl ${mobileNavOpen ? 'flex' : 'hidden'} lg:flex`}>
      <div className="flex h-20 items-center gap-3 border-b border-[#263f5d] px-5">
        <BrandMark compact />
      </div>
      <nav className="flex-1 py-4">{menu.map((item) => <MenuItem key={item.label} item={item} open={openGroups[item.label]} onToggle={() => setOpenGroups((prev) => ({ ...prev, [item.label]: !prev[item.label] }))} />)}</nav>
      <div className="border-t border-[#263f5d] p-4"><Link to="/profile" className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#2563eb] font-bold text-white">{(user?.name || 'A').slice(0, 1).toUpperCase()}</div><div className="min-w-0"><div className="truncate text-sm font-semibold text-white">{user?.name}</div><div className="truncate text-xs text-[#9eb0c2]">{user?.role}</div></div></Link><button onClick={logout} className="mt-3 w-full rounded border border-[#385474] px-3 py-1.5 text-xs text-[#b8c5d2] hover:border-[#93c5fd] hover:text-white">Sign out</button></div>
    </aside>
    <div className="ml-0 flex min-h-screen min-w-0 flex-1 flex-col lg:ml-64">
      <header className="app-header sticky top-0 z-20 flex min-h-20 flex-wrap items-center gap-2 border-b border-line bg-[#fffdf8] px-3 py-3 text-ink shadow-sm sm:gap-3 sm:px-6">
        <button type="button" onClick={() => setMobileNavOpen((value) => !value)} className="rounded border border-line px-3 py-2 text-xs text-muted lg:hidden" aria-label="Toggle navigation">Menu</button>
        <div className="mr-auto min-w-0"><div className="truncate text-[10px] font-mono uppercase tracking-[0.2em] text-muted">Workspace / current view</div><div className="truncate text-lg font-semibold">{currentLabel}</div></div>
        <button onClick={() => setPaletteOpen(true)} className="hidden rounded border border-line px-2 py-2 text-[10px] text-muted lg:block">CTRL K</button>
        <button type="button" onClick={() => setPaletteOpen(true)} className="rounded border border-line px-3 py-2 text-xs text-muted md:hidden" aria-label="Search assets">Search</button>
        <div className="relative hidden w-64 md:block"><input value={search} onFocus={() => setPaletteOpen(true)} onChange={(e) => setSearch(e.target.value)} placeholder="Search asset tag..." className="w-full rounded-md border border-line bg-[#f3f1ec] px-3 py-2 text-xs text-ink outline-none placeholder:text-muted focus:border-accent" />{search && <button onClick={() => setSearch('')} className="absolute right-2 top-1.5 text-sm text-muted">×</button>}{search && paletteOpen && <div className="absolute left-0 top-11 z-50 w-full rounded-md border border-line bg-[#fffdf8] py-2 text-ink shadow-xl">{assetResults.length ? assetResults.map((asset) => <button type="button" onClick={() => go(`/assets/${asset._id}`)} className="block w-full px-3 py-2 text-left hover:bg-[#f3f1ec]" key={asset._id}><div className="text-xs font-semibold">{asset.name}</div><div className="text-[10px] text-muted">{asset.assetTag} · {asset.status}</div></button>) : <div className="px-3 py-2 text-xs text-muted">No matching assets</div>}</div>}</div>
        <div className="hidden items-center gap-1 text-[10px] text-[#d7f2f8] xl:flex"><span className={`h-2 w-2 rounded-full ${systemOnline ? 'bg-emerald-300' : 'bg-red-300'}`} />{systemOnline ? 'ONLINE' : 'OFFLINE'}</div>
        <button type="button" onClick={() => setDarkMode((value) => !value)} className="rounded px-2 py-2 text-sm text-muted hover:bg-[#f3f1ec]" title="Toggle visual mode">{darkMode ? '☀' : '◐'}</button>
        <div className="relative"><button type="button" onClick={() => setNotificationsOpen((value) => !value)} className="relative rounded px-2 py-2 text-lg text-muted hover:bg-[#f3f1ec]" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} title="Notifications">♢{unreadCount > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}</button>{notificationsOpen && <div className="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-1.5rem))] rounded-md border border-line bg-panel text-ink shadow-xl"><div className="flex items-center justify-between border-b border-line px-4 py-3"><strong className="text-sm">Notifications</strong><button type="button" onClick={markAllNotificationsRead} className="text-[10px] text-accent hover:underline">Mark all read</button></div><div className="max-h-80 overflow-y-auto">{notifications.length ? notifications.map((notification) => <button type="button" key={notification._id} onClick={() => openNotification(notification)} className={`block w-full border-b border-line px-4 py-3 text-left hover:bg-panel2 ${notification.readAt ? 'opacity-60' : ''}`}><span className="block text-xs font-semibold">{notification.title}</span><span className="mt-1 block text-xs text-muted">{notification.message}</span><span className="mt-1 block text-[10px] text-muted">{new Date(notification.createdAt).toLocaleString()}</span></button>) : <p className="px-4 py-8 text-center text-xs text-muted">No notifications yet.</p>}</div></div>}</div>
        {user?.role !== 'asset_user' && <div className="relative"><button onClick={() => setCreateOpen((value) => !value)} className="rounded-md bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8]">Create new ▾</button>{createOpen && <div className="absolute right-0 top-11 w-52 rounded-md border border-line bg-panel py-2 text-sm text-ink shadow-xl">{CREATE_ITEMS.map(([label, to]) => <Link onClick={() => setCreateOpen(false)} className="block px-4 py-2 hover:bg-[#f1f5f9] hover:text-accent" key={to} to={to}>{label}</Link>)}</div>}</div>}
        <div className="relative"><button onClick={() => setProfileOpen((value) => !value)} className="flex items-center gap-2 rounded px-2 py-1 hover:bg-[#f1f5f9]"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#0f1f35] text-sm font-bold text-[#bfdbfe]">{(user?.name || 'A').slice(0, 1).toUpperCase()}</span><span className="hidden text-xs font-semibold sm:block">{user?.name || 'Admin'}</span><span className="text-xs">▾</span></button>{profileOpen && <div className="absolute right-0 top-11 w-44 rounded-md border border-line bg-panel py-2 text-sm text-ink shadow-xl"><Link className="block px-4 py-2 hover:bg-[#f1f5f9]" to="/profile">My profile</Link><Link className="block px-4 py-2 hover:bg-[#f1f5f9]" to="/reports">Reports</Link><button onClick={logout} className="block w-full px-4 py-2 text-left hover:bg-[#f1f5f9]">Sign out</button></div>}</div>
      </header>
      <main className="flex-1 bg-[var(--bg)]"><div className="page-enter mx-auto w-full max-w-[1440px] px-3 py-4 sm:px-5 sm:py-6 lg:px-8"><Outlet /></div></main>
    </div>
    {paletteOpen && <div className="fixed inset-0 z-40 bg-[#10212a]/50 p-4 pt-[12vh]" onMouseDown={() => setPaletteOpen(false)}><div className="app-palette mx-auto max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="border-b border-slate-200 px-4 py-3"><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search assets or type a command..." className="w-full text-sm text-[#172033] outline-none" /></div><div className="max-h-80 overflow-y-auto p-2">{search && assetResults.map((asset) => <button type="button" onClick={() => go(`/assets/${asset._id}`)} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-blue-50" key={asset._id}><span className="text-accent">▦</span><span><b className="block text-sm text-[#172033]">{asset.name}</b><small className="text-xs text-slate-500">{asset.assetTag} · {asset.status}</small></span></button>)}{!search && commands.map(([label, path, icon]) => <button type="button" onClick={() => go(path)} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-blue-50" key={path}><span className="grid h-7 w-7 place-items-center rounded bg-blue-50 text-accent">{icon}</span><span className="text-sm text-[#172033]">{label}</span><span className="ml-auto text-xs text-slate-400">↵</span></button>)}{search && !assetResults.length && <div className="p-5 text-center text-sm text-slate-500">No results found.</div>}</div><div className="border-t border-slate-200 px-4 py-2 text-[10px] text-slate-400">ESC to close · CTRL K to open</div></div></div>}
  </div>;
}
