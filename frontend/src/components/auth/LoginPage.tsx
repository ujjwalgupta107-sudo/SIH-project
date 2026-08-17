import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
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

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="enterprise-login-screen">
      <div className="login-glow-orb-1" />
      <div className="login-glow-orb-2" />

      <div className="enterprise-login-card">
        <div className="login-header-banner">
          <div className="login-brand-logo">
            <Shield size={30} />
          </div>
          <h1>CivicShield AI</h1>
          <p>Next-Gen Municipal Intelligence & Citizen Incident Response</p>
        </div>

        {/* 1-Click Demo Accounts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ⚡ Instant Demo Login
          </div>
          <div className="demo-login-quick-switches">
            <button
              type="button"
              className="demo-switch-btn"
              onClick={() => handleDemoFill('citizen@civicshield.ai', 'citizen123')}
            >
              <span>👤 Citizen Demo</span>
              <span>citizen@civicshield.ai</span>
            </button>
            <button
              type="button"
              className="demo-switch-btn"
              onClick={() => handleDemoFill('authority@civicshield.ai', 'authority123')}
            >
              <span>🛡️ Authority HQ</span>
              <span>authority@civicshield.ai</span>
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--severity-critical-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '12.5px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Work / Citizen Email</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
              <input
                id="email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="citizen@civicshield.ai"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Security Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '38px', paddingRight: '38px' }}
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', background: 'transparent', color: 'var(--text-muted)' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-cyan btn-lg"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Access Command Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          Protected by CivicShield Zero-Trust Neural Architecture • 256-bit JWT Encryption
        </div>
      </div>
    </div>
  );
}