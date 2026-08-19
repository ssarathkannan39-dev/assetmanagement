import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorBanner } from '../components/Common.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="stencil text-3xl font-bold text-zinc-50 tracking-tight">
            ASSET<span className="text-accent">RAK</span>
          </div>
          <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted mt-2">
            IT Inventory Control System
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card p-6">
          <ErrorBanner message={error} />

          <div className="mb-4">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Signing In…' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-muted mt-4 font-mono">
          No account yet? Run <code className="text-zinc-400">npm run seed</code> on the server.
        </div>
      </div>
    </div>
  );
}
