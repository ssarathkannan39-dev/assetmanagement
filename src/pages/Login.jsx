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
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="login-shell">
      <div className="login-panel">
        <div className="login-hero">
          <div className="brand-banner">
            <div className="brand-banner-inner">
              <BrandMark />
              <span className="brand-banner-tag">Inventory, made visible</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="login-eyebrow">Operational visibility</p>
            <h1 className="login-title">Track every asset with total clarity.</h1>
            <p className="login-copy">
              Manage inventory, maintenance, and movement across every site from one secure control center.
            </p>
          </div>

          <div className="login-metrics">
            <div>
              <strong>4.2K</strong>
              <span>Assets monitored</span>
            </div>
            <div>
              <strong>98.6%</strong>
              <span>Uptime score</span>
            </div>
          </div>
        </div>

        <div className="login-form-panel">
          <div className="login-form-header">
            <p className="login-eyebrow text-[#1d4ed8]">Welcome back</p>
            <h2>Sign in</h2>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <ErrorBanner message={error} />

            <div className="field-group">
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@gmail.com"
                required
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="field-group">
              <label className="label">Password</label>
              <div className="password-wrap">
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="super@123"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Signing In…' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <div>Demo superadmin: <span>superadmin@gmail.com / super@123</span></div>
            <div>No account yet? Run <code>npm run seed</code> on the server.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
