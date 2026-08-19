import { useEffect, useState, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import client from '../api/client.js';
import StatusChip from '../components/StatusChip.jsx';
import { Spinner, ErrorBanner, EmptyState } from '../components/Common.jsx';

const TYPES = ['repair', 'routine', 'upgrade', 'inspection'];
const STATUSES = ['scheduled', 'in_progress', 'completed', 'cancelled'];
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—');

function LogModal({ presetAssetId, onClose, onDone }) {
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState({
    asset: presetAssetId || '',
    type: 'repair',
    description: '',
    cost: '',
    vendor: '',
    scheduledDate: '',
    performedBy: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    client.get('/assets', { params: { limit: 100 } }).then(({ data }) => setAssets(data.items));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        cost: form.cost === '' ? undefined : Number(form.cost),
        scheduledDate: form.scheduledDate ? new Date(form.scheduledDate).toISOString() : undefined,
      };
      Object.keys(payload).forEach((k) => payload[k] === '' && delete payload[k]);
      await client.post('/maintenance', payload);
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log maintenance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <form onSubmit={submit} className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="stencil text-lg text-zinc-50 mb-4">Log Maintenance</h3>
        <ErrorBanner message={error} />
        <div className="space-y-3">
          <div>
            <label className="label">Asset *</label>
            <select className="input" required value={form.asset} onChange={(e) => setForm({ ...form, asset: e.target.value })}>
              <option value="">Select an asset…</option>
              {assets.map((a) => (
                <option key={a._id} value={a._id}>{a.assetTag} — {a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Type *</label>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea className="input" rows={2} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Cost (USD)</label>
              <input className="input" type="number" min="0" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
            </div>
            <div>
              <label className="label">Scheduled Date</label>
              <input className="input" type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Vendor / Performed By</label>
            <input className="input" value={form.performedBy} onChange={(e) => setForm({ ...form, performedBy: e.target.value })} placeholder="Internal IT / Vendor name" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving…' : 'Log Maintenance'}</button>
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default function Maintenance() {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLog, setShowLog] = useState(Boolean(location.state?.assetId));

  const load = useCallback(() => {
    setLoading(true);
    client
      .get('/maintenance', { params: status ? { status, limit: 50 } : { limit: 50 } })
      .then(({ data }) => setItems(data.items))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load maintenance records'))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const markCompleted = async (recordId) => {
    try {
      await client.put(`/maintenance/${recordId}`, { status: 'completed', completedDate: new Date().toISOString() });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update record');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="stencil text-2xl font-bold text-zinc-50">Maintenance</h1>
          <p className="text-sm text-muted mt-1">Repairs, upgrades & inspections</p>
        </div>
        <div className="flex gap-3">
          <select className="input max-w-[160px]" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <button className="btn-primary" onClick={() => setShowLog(true)}>+ Log Maintenance</button>
        </div>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner label="LOADING MAINTENANCE" />
      ) : items.length === 0 ? (
        <EmptyState title="No maintenance records" subtitle="Log a repair, upgrade, or inspection to get started." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] font-mono uppercase tracking-wider text-muted">
                <th className="text-left px-4 py-3">Asset</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Description</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m._id} className="border-b border-line last:border-0 hover:bg-panel2/60 transition-colors">
                  <td className="px-4 py-3">
                    {m.asset ? (
                      <Link to={`/assets/${m.asset._id}`} className="font-mono text-accent hover:underline">{m.asset.assetTag}</Link>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-100 capitalize">{m.type}</td>
                  <td className="px-4 py-3 text-muted max-w-xs truncate">{m.description}</td>
                  <td className="px-4 py-3 text-muted">{fmtDate(m.scheduledDate || m.createdAt)}</td>
                  <td className="px-4 py-3"><StatusChip status={m.status} /></td>
                  <td className="px-4 py-3 text-right">
                    {m.status !== 'completed' && m.status !== 'cancelled' && (
                      <button className="btn-outline text-xs py-1" onClick={() => markCompleted(m._id)}>Mark Done</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showLog && (
        <LogModal
          presetAssetId={location.state?.assetId}
          onClose={() => setShowLog(false)}
          onDone={() => { setShowLog(false); load(); }}
        />
      )}
    </div>
  );
}
