import { useCallback, useEffect, useState } from 'react';
import api from '../api/client.js';
import { EmptyState, ErrorBanner, Spinner } from '../components/Common.jsx';

const CONFIG = {
  components: { title: 'Components', endpoint: '/components', fields: [['name', 'Name'], ['category', 'Category'], ['manufacturer', 'Manufacturer'], ['modelNumber', 'Model number'], ['serialNumber', 'Serial number'], ['quantity', 'Quantity']] },
  kits: { title: 'Predefined Kits', endpoint: '/kits', fields: [['name', 'Name'], ['description', 'Description']] },
};

export default function ResourcePage({ kind }) {
  const config = CONFIG[kind];
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const { data } = await api.get(config.endpoint, { params: { search: search || undefined, limit: 100 } }); setItems(data.data || []); }
    catch (err) { setError(err.response?.data?.message || `Could not load ${config.title.toLowerCase()}.`); }
    finally { setLoading(false); }
  }, [config.endpoint, config.title, search]);
  useEffect(() => { const timer = setTimeout(load, 250); return () => clearTimeout(timer); }, [load]);

  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    try { await api.post(config.endpoint, kind === 'components' ? { ...form, quantity: Number(form.quantity || 1) } : form); setForm({}); setShowForm(false); await load(); }
    catch (err) { setError(err.response?.data?.message || 'Could not save record.'); }
    finally { setSaving(false); }
  };
  const remove = async (id) => { if (!window.confirm('Delete this record?')) return; try { await api.delete(`${config.endpoint}/${id}`); load(); } catch (err) { setError(err.response?.data?.message || 'Could not delete record.'); } };

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="dashboard-eyebrow">Inventory / {kind}</div><h1 className="mt-2 text-3xl font-semibold text-ink">{config.title}</h1><p className="mt-1 text-sm text-muted">Manage live records stored in the asset database.</p></div><button type="button" onClick={() => setShowForm((value) => !value)} className="btn-primary text-xs">{showForm ? 'Close' : `Add ${kind === 'kits' ? 'kit' : 'component'}`}</button></div>
    {showForm && <form onSubmit={save} className="card grid gap-4 p-5 sm:grid-cols-2">{config.fields.map(([key, label]) => <label key={key} className="label">{label}<input className="input mt-2" type={key === 'quantity' ? 'number' : 'text'} min={key === 'quantity' ? 0 : undefined} value={form[key] || ''} onChange={(event) => setForm({ ...form, [key]: event.target.value })} required={key === 'name'} /></label>)}<div className="flex justify-end sm:col-span-2"><button className="btn-primary text-xs" disabled={saving}>{saving ? 'Saving...' : 'Save record'}</button></div></form>}
    <section className="dashboard-panel overflow-hidden"><div className="border-b border-line p-4"><input className="input w-full sm:max-w-xs" placeholder={`Search ${config.title.toLowerCase()}...`} value={search} onChange={(event) => setSearch(event.target.value)} /></div><ErrorBanner message={error} />{loading ? <Spinner label={`LOADING ${kind.toUpperCase()}`} /> : !items.length ? <EmptyState title={`No ${kind} found`} subtitle="Create the first record to begin managing this module." /> : <div className="overflow-x-auto"><table className="data-table w-full min-w-[640px] text-left"><thead><tr><th>Name</th><th>{kind === 'components' ? 'Category' : 'Description'}</th><th>{kind === 'components' ? 'Quantity' : 'Items'}</th><th className="text-right">Action</th></tr></thead><tbody>{items.map((item) => <tr key={item._id}><td className="font-semibold text-ink">{item.name}</td><td>{kind === 'components' ? item.category : item.description || '—'}</td><td>{kind === 'components' ? item.quantity : `${item.items?.length || 0} items`}</td><td className="text-right"><button type="button" onClick={() => remove(item._id)} className="text-xs text-red-600 hover:underline">Delete</button></td></tr>)}</tbody></table></div>}</section>
  </div>;
}
