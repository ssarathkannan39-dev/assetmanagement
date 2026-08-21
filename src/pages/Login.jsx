import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorBanner } from '../components/Common.jsx';
import BrandMark from '../components/BrandMark.jsx';

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4 py-10">
      <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-accent opacity-80 blur-3xl" />
      <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-[#d6e85e] opacity-25 blur-3xl" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex items-end justify-between">
          <div className="login-brand"><BrandMark /></div>
          <div className="max-w-[150px] text-right text-[10px] font-mono uppercase tracking-[0.2em] text-[#b9c4b9]">
            Inventory, made visible
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card border-0 p-7 shadow-2xl">
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

        <div className="mt-4 text-center text-xs text-[#aeb9ae] font-mono">
          No account yet? Run <code className="text-zinc-400">npm run seed</code> on the server.
        </div>
      </div>
    </div>
  );
}
