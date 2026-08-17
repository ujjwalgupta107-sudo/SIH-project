import React, { useState } from 'react';
import {
  User,
  Shield,
  Award,
  Bell,
  Key,
  CheckCircle2,
  Mail,
  Lock,
  Smartphone,
  Save,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const [displayName, setDisplayName] = useState(user?.name || 'Verified Citizen');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="page-header-row">
        <div className="page-title-group">
          <h1>
            <User size={24} color="#06b6d4" />
            <span>Citizen Profile & Security</span>
          </h1>
          <p>Manage your account credentials, notifications, and civic reputation score.</p>
        </div>

        <div className="page-header-actions">
          <button className="btn btn-danger btn-sm" onClick={logout}>
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px'
        }}>
          <CheckCircle2 size={16} />
          <span>Profile configuration saved successfully!</span>
        </div>
      )}

      {/* Profile Identity Card */}
      <div className="enterprise-card">
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div className="user-avatar-badge" style={{ width: '72px', height: '72px', fontSize: '28px' }}>
            {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'C'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>
                {displayName}
              </h2>
              <span className="badge badge-low">Level 3 Guardian</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{user?.email}</div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>Role: <strong style={{ color: 'var(--text-main)' }}>{user?.role}</strong></span>
              <span>Account Status: <strong style={{ color: '#34d399' }}>Verified Active</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings Form */}
      <div className="enterprise-card">
        <div className="card-header">
          <span className="card-title">Account Settings</span>
        </div>

        <form onSubmit={handleSave} className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              type="text"
              className="form-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="emailAddress">Registered Email</label>
            <input
              id="emailAddress"
              type="email"
              className="form-input"
              value={user?.email || ''}
              disabled
              style={{ opacity: 0.7 }}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Notification Preferences</div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#06b6d4' }}
              />
              <span>Receive email alerts when my incident is assigned or resolved</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#06b6d4' }}
              />
              <span>Receive urgent SMS broadcasts for neighborhood emergency alerts</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="submit" className="btn btn-cyan">
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}