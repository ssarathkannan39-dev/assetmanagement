import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client.js';

const cards = [
  ['assets', 'Assets', '/assets', 'bg-[#35c5c3]', '▦'],
  ['licenses', 'Licenses', '/licenses', 'bg-[#d91f68]', '▣'],
  ['accessories', 'Accessories', '/accessories', 'bg-[#ff851b]', '⌨'],
  ['consumables', 'Consumables', '/consumables', 'bg-[#655fae]', '◕'],
  ['components', 'Components', '/accessories', 'bg-[#f0a20b]', '▤'],
  ['people', 'People', '/profile', 'bg-[#3b8fb9]', '♟'],
];

const statusLabels = {
  available: 'Ready to deploy',
  assigned: 'Assigned',
  in_maintenance: 'In maintenance',
  retired: 'Retired',
  lost: 'Lost',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState('');
  const load = () => Promise.all([api.get('/dashboard/summary'), api.get('/dashboard/activity', { params: { limit: 10 } })])
    .then(([summaryRes, activityRes]) => { setSummary(summaryRes.data); setActivity(activityRes.data?.data || []); setError(''); })
    .catch((err) => setError(err.response?.data?.message || 'Dashboard data could not be loaded.'));
  useEffect(() => {
    load();
    const timer = window.setInterval(load, 60000);
    return () => window.clearInterval(timer);
  }, []);
  const statuses = useMemo(() => Object.entries(summary?.byStatus || {}), [summary]);
  const maxStatus = Math.max(1, ...statuses.map(([, count]) => count));
  const total = summary?.totalAssets || 0;
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold text-[#263746]">Dashboard</h1><p className="mt-1 text-sm text-slate-500">Welcome back, {user?.name || 'Administrator'}. Live inventory overview.</p></div><div className="flex gap-2"><button type="button" onClick={load} className="btn-outline text-xs">↻ Refresh</button><Link to="/reports" className="btn-primary text-xs">Download reports</Link></div></div>
    {error && <div className="rounded border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">⚠ {error}</div>}
    <div className="rounded border-l-4 border-[#00aeda] bg-[#09b9de] px-4 py-3 text-xs font-medium text-white">PSG Asset Management is operating in live mode. Dashboard statistics refresh automatically every minute.</div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{cards.map(([key, label, to, color, icon]) => <Link to={to} key={key} className={`${color} group relative min-h-[118px] overflow-hidden rounded-sm p-4 text-white shadow-sm transition hover:-translate-y-1`}><div className="text-3xl font-bold">{summary?.totalAssets && key === 'assets' ? summary.totalAssets : summary?.totals?.[key] ?? 0}</div><div className="mt-1 text-sm">{label}</div><div className="mt-4 text-[11px] opacity-90">View all →</div><span className="absolute -right-2 bottom-2 text-7xl opacity-15 transition group-hover:scale-110">{icon}</span></Link>)}</div>
    <div className="grid gap-5 lg:grid-cols-5"><section className="card overflow-hidden lg:col-span-3"><div className="flex items-center justify-between border-b border-line px-4 py-3"><h2 className="text-lg font-medium text-[#263746]">Recent activity</h2><Link to="/audit-log" className="text-xs text-accent">View all →</Link></div><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Created by</th><th className="px-4 py-3">Target</th></tr></thead><tbody className="divide-y divide-line">{activity.length ? activity.map((log) => <tr key={log._id} className="hover:bg-blue-50/40"><td className="px-4 py-3 text-slate-500">{log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}</td><td className="px-4 py-3 font-medium text-[#263746]">{log.action?.replace(/_/g, ' ')}</td><td className="px-4 py-3 text-slate-600">{log.performedBy?.name || 'System'}</td><td className="px-4 py-3 text-accent">{log.entityLabel || log.entityType}</td></tr>) : <tr><td colSpan="4" className="px-4 py-10 text-center text-slate-500">No recent activity.</td></tr>}</tbody></table></div></section>
      <section className="card lg:col-span-2"><div className="border-b border-line px-4 py-3"><h2 className="text-lg font-medium text-[#263746]">Assets by status</h2><p className="text-xs text-slate-500">Live lifecycle distribution</p></div><div className="space-y-4 p-5">{statuses.length ? statuses.map(([status, count]) => <div key={status}><div className="mb-1 flex justify-between text-xs"><span className="text-slate-600">{statusLabels[status] || status}</span><b className="text-[#263746]">{count}</b></div><div className="h-3 rounded bg-slate-100"><div className="h-3 rounded bg-[#008f4c]" style={{ width: `${count / maxStatus * 100}%` }} /></div></div>) : <p className="py-8 text-center text-sm text-slate-500">No asset status data.</p>}<div className="mt-5 border-t border-line pt-4 text-xs text-slate-500">Total managed assets: <b className="text-[#263746]">{total}</b></div></div></section></div>
    <div className="grid gap-5 lg:grid-cols-2"><section className="card p-5"><h2 className="text-lg font-medium text-[#263746]">Asset categories</h2><div className="mt-4 grid grid-cols-2 gap-3">{Object.entries(summary?.byCategory || {}).slice(0, 8).map(([category, count]) => <Link to="/assets" className="rounded bg-slate-50 p-3 hover:bg-blue-50" key={category}><div className="text-xs text-slate-500">{category}</div><div className="mt-1 text-xl font-semibold text-[#263746]">{count}</div></Link>)}{!summary?.byCategory && <p className="text-sm text-slate-500">Category statistics will appear when assets are added.</p>}</div></section><section className="card p-5"><h2 className="text-lg font-medium text-[#263746]">Quick actions</h2><div className="mt-4 grid grid-cols-2 gap-3">{[['Create asset', '/assets/new'], ['Record maintenance', '/maintenance'], ['Assign asset', '/assignments'], ['Export report', '/reports']].map(([label, to]) => <Link className="rounded border border-line p-3 text-sm font-medium text-accent hover:bg-blue-50" key={to} to={to}>＋ {label}</Link>)}</div></section></div>
  </div>;
}
