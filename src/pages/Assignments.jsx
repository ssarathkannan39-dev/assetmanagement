import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client.js';
import StatusChip from '../components/StatusChip.jsx';
import { Spinner, ErrorBanner, EmptyState } from '../components/Common.jsx';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—');

export default function Assignments() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    client
      .get('/assignments', { params: status ? { status, limit: 50 } : { limit: 50 } })
      .then(({ data }) => setItems(data.items))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load assignments'))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const handleReturn = async (assignmentId) => {
    setActionError('');
    try {
      await client.put(`/assignments/${assignmentId}/return`, {});
      load();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to return asset');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="stencil text-2xl font-bold text-zinc-50">Assignments</h1>
          <p className="text-sm text-muted mt-1">Who has what, and since when</p>
        </div>
        <select className="input max-w-[160px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="active">Active</option>
          <option value="returned">Returned</option>
          <option value="">All</option>
        </select>
      </div>

      <ErrorBanner message={error || actionError} />

      {loading ? (
        <Spinner label="LOADING ASSIGNMENTS" />
      ) : items.length === 0 ? (
        <EmptyState title="No assignments" subtitle="Assign an asset from its detail page to see it here." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] font-mono uppercase tracking-wider text-muted">
                <th className="text-left px-4 py-3">Asset</th>
                <th className="text-left px-4 py-3">Assigned To</th>
                <th className="text-left px-4 py-3">Department</th>
                <th className="text-left px-4 py-3">Since</th>    
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Action</th>
              </tr>
            </thead>  
            <tbody>
              {items.map((a) => (
                <tr key={a._id} className="border-b border-line last:border-0 hover:bg-panel2/60 transition-colors">
                  <td className="px-4 py-3">
                    {a.asset ? (
                      <Link to={`/assets/${a.asset._id}`} className="font-mono text-accent hover:underline">{a.asset.assetTag}</Link>
                    ) : '—'}
                    <div className="text-xs text-muted">{a.asset?.name}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-100">{a.assignedTo?.name}</td>
                  <td className="px-4 py-3 text-muted">{a.assignedTo?.department || '—'}</td>
                  <td className="px-4 py-3 text-muted">{fmtDate(a.assignedDate)}</td>
                  <td className="px-4 py-3"><StatusChip status={a.status} /></td>
                  <td className="px-4 py-3 text-right">
                    {a.status === 'active' && (
                      <button className="btn-outline text-xs py-1" onClick={() => handleReturn(a._id)}>Return</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
