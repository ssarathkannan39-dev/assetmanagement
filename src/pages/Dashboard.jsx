import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import client from '../api/client.js';
import { StatCard, Spinner, ErrorBanner } from '../components/Common.jsx';

const STATUS_COLORS = {
  available: '#5fead4',
  assigned: '#ffb020',
  in_maintenance: '#ff6a2b',
  retired: '#5f6b64',
  lost: '#f87171',
};

const currency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get('/dashboard/stats')
      .then(({ data }) => setStats(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="LOADING DASHBOARD" />;
  if (error) return <ErrorBanner message={error} />;
  if (!stats) return null;

  const statusData = stats.byStatus.map((s) => ({ name: s._id, value: s.count }));
  const categoryData = stats.byCategory.map((c) => ({ name: c._id, count: c.count }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="stencil text-2xl font-bold text-zinc-50">Dashboard</h1>
          <p className="text-sm text-muted mt-1">Fleet overview & activity</p>
        </div>
        <Link to="/assets/new" className="btn-primary">+ New Asset</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Assets" value={stats.totalAssets} accent />
        <StatCard label="Active Assignments" value={stats.activeAssignments} />
        <StatCard label="Maintenance Pending" value={stats.upcomingMaintenance} />
        <StatCard label="Warranties Expiring (30d)" value={stats.expiringWarranties} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted mb-4">Status Breakdown</div>
          {statusData.length === 0 ? (
            <div className="text-sm text-muted py-10 text-center">No assets yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#8a9690'} stroke="#141a17" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1b2320', border: '1px solid #2a332e', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {statusData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted font-mono">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: STATUS_COLORS[s.name] || '#8a9690' }} />
                {s.name.replace(/_/g, ' ')} ({s.value})
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted mb-4">Assets by Category</div>
          {categoryData.length === 0 ? (
            <div className="text-sm text-muted py-10 text-center">No assets yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a332e" horizontal={false} />
                <XAxis type="number" stroke="#8a9690" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="#8a9690" fontSize={11} width={100} />
                <Tooltip contentStyle={{ background: '#1b2320', border: '1px solid #2a332e', fontSize: 12 }} cursor={{ fill: '#1b232033' }} />
                <Bar dataKey="count" fill="#ff6a2b" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card p-6">
        <div className="text-[11px] font-mono uppercase tracking-wider text-muted mb-2">Total Asset Value</div>
        <div className="stencil text-3xl font-bold text-zinc-50">{currency(stats.totalAssetValue)}</div>
      </div>
    </div>
  );
}
