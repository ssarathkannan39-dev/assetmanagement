import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import client from '../api/client.js';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const save = async (event) => {
    event.preventDefault();
    setMessage(''); setError('');
    try {
      const { data } = await client.patch('/auth/me', form);
      updateUser(data.user);
      setMessage('Profile updated successfully.');
      setForm((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update profile.');
    }
  };
  return <div className="max-w-3xl space-y-6">
    <div><h1 className="text-3xl font-bold text-[#172033]">Profile & security</h1><p className="mt-1 text-sm text-muted">Manage your administrator identity and password.</p></div>
    <form onSubmit={save} className="card grid gap-5 p-6 md:grid-cols-2">
      <div className="md:col-span-2 flex items-center gap-4 border-b border-line pb-5">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-blue-100 text-xl font-bold text-accent">{(user?.name || 'A').slice(0, 1).toUpperCase()}</div>
        <div><div className="font-semibold text-[#172033]">{user?.name}</div><div className="text-sm text-muted capitalize">{user?.role} account</div></div>
      </div>
      <label className="label">Full name<input className="input mt-2" value={form.name} onChange={(e) => update('name', e.target.value)} /></label>
      <label className="label">Email<input type="email" className="input mt-2" value={form.email} onChange={(e) => update('email', e.target.value)} /></label>
      <div className="md:col-span-2 border-t border-line pt-5"><h2 className="font-semibold text-[#172033]">Change password</h2><p className="mt-1 text-xs text-muted">Leave both fields blank to keep your current password.</p></div>
      <label className="label">Current password<input type="password" className="input mt-2" value={form.currentPassword} onChange={(e) => update('currentPassword', e.target.value)} /></label>
      <label className="label">New password<input type="password" className="input mt-2" value={form.newPassword} onChange={(e) => update('newPassword', e.target.value)} /></label>
      <div className="md:col-span-2 flex items-center justify-between">{(message || error) && <span className={error ? 'text-sm text-red-500' : 'text-sm text-emerald-600'}>{error || message}</span>}<button className="btn-primary ml-auto">Save changes</button></div>
    </form>
  </div>;
}
