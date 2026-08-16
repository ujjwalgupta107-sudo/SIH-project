import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setShake(false);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className={`login-card ${shake ? 'shake' : ''}`}>
        <div className="login-header">
          <Shield className="login-logo" size={48} />
          <h1>CivicShield AI</h1>
          <p className="login-subtitle">Smart Civic Infrastructure Monitoring</p>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="email" className="input-label">Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                id="email"
                className="input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password" className="input-label">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-text">Signing in...</span>
              </>
            ) : (
              <>
                <span className="btn-text">Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="muted">Demo credentials:</p>
          <div className="demo-credentials">
            <code>citizen@civicshield.ai</code> / <code>citizen123</code>
            <br />
            <code>authority@civicshield.ai</code> / <code>authority123</code>
          </div>
        </div>
      </div>
    </div>
  );
}