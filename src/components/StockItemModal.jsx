import { useState } from 'react';
import api from '../api/client.js';

/**
 * `resource` is the API path segment: 'accessories' or 'consumables'.
 * Both models share the same core fields, so one modal covers both.
 */
export default function StockItemModal({ resource, item, onClose, onSaved }) {
  const isEdit = Boolean(item);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: item?.name || '',
    category: item?.category || '',
    manufacturer: item?.manufacturer || '',
    modelNumber: item?.modelNumber || '',
    totalQty: item?.totalQty ?? 0,
    minQty: item?.minQty ?? 0,
    purchaseDate: item?.purchaseDate ? item.purchaseDate.slice(0, 10) : '',
    cost: item?.cost ?? '',
    notes: item?.notes || '',
  });

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name) {
      setError('Name is required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        category: form.category,
        manufacturer: form.manufacturer,
        modelNumber: form.modelNumber,
        totalQty: Number(form.totalQty) || 0,
        minQty: Number(form.minQty) || 0,
        purchaseDate: form.purchaseDate || undefined,
        cost: form.cost === '' ? undefined : Number(form.cost),
        notes: form.notes,
      };

      if (isEdit) {
        await api.patch(`/${resource}/${item._id}`, payload);
      } else {
        await api.post(`/${resource}`, payload);
      }
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto border border-white/10 bg-ink shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="stencil text-sm font-semibold uppercase tracking-widest text-white">
            {isEdit ? 'Edit Item' : 'New Item'}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-white text-xs uppercase tracking-widest">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-5">
          <Field label="Name">
            <input value={form.name} onChange={handleChange('name')} className="input" required />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Category">
              <input value={form.category} onChange={handleChange('category')} className="input" />
            </Field>
            <Field label="Manufacturer">
              <input value={form.manufacturer} onChange={handleChange('manufacturer')} className="input" />
            </Field>
          </div>

          <Field label="Model number">
            <input value={form.modelNumber} onChange={handleChange('modelNumber')} className="input" />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label={isEdit ? 'Total qty (adjust to restock)' : 'Total qty'}>
              <input
                type="number"
                min="0"
                value={form.totalQty}
                onChange={handleChange('totalQty')}
                className="input"
              />
            </Field>
            <Field label="Reorder threshold">
              <input type="number" min="0" value={form.minQty} onChange={handleChange('minQty')} className="input" />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Purchase date">
              <input type="date" value={form.purchaseDate} onChange={handleChange('purchaseDate')} className="input" />
            </Field>
            <Field label="Unit cost">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.cost}
                onChange={handleChange('cost')}
                className="input"
              />
            </Field>
          </div>

          <Field label="Notes">
            <textarea value={form.notes} onChange={handleChange('notes')} rows={2} className="input resize-none" />
          </Field>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border border-white/10 px-4 py-2 text-xs uppercase tracking-widest text-muted hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-xs uppercase tracking-widest text-amber-400 hover:bg-amber-500/20 disabled:opacity-50"
            >
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted stencil">
        {label}
      </span>
      {children}
    </label>
  );
}