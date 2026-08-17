import React, { useState, useEffect } from 'react';
import { Bell, Search, Sparkles, Shield, User, LogOut, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface CommandHeaderProps {
  breadcrumb: string;
  roleLabel: string;
}

export function CommandHeader({ breadcrumb, roleLabel }: CommandHeaderProps) {
  const { user, logout } = useAuth();
  const [time, setTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="command-header">
      <div className="header-left-group">
        <div className="header-breadcrumbs">
          <span>CivicShield</span>
          <span>/</span>
          <span>{roleLabel}</span>
          <span>/</span>
          <span className="breadcrumb-active">{breadcrumb}</span>
        </div>

        <div className="header-system-status">
          <div className="pulse-dot" />
          <span>AI Edge Connected</span>
        </div>
      </div>

      <div className="header-right-group">
        <div className="header-clock" title="Local System Time">
          ⏱️ {time || '00:00:00'}
        </div>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="header-action-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell size={16} />
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#06b6d4',
              display: 'inline-block'
            }} />
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '44px',
              right: '0',
              width: '320px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              padding: '14px',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '12.5px' }}>Operational Alerts</span>
                <span style={{ fontSize: '10.5px', color: 'var(--accent-cyan)' }}>Real-time Feed</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px', padding: '8px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
                  <AlertTriangle size={16} color="#ef4444" style={{ minWidth: '16px' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#f87171' }}>Critical Pothole Reported</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Sector 4 Express Highway - High risk to 2-wheelers</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', padding: '8px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
                  <CheckCircle size={16} color="#10b981" style={{ minWidth: '16px' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#34d399' }}>Drainage Cleared & Verified</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Waterlogging resolved at Ward 12 Main Junction</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Quick Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 10px 4px 4px',
              color: 'var(--text-main)',
              fontSize: '12px'
            }}
          >
            <div className="user-avatar-badge" style={{ width: '26px', height: '26px', fontSize: '11px' }}>
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span style={{ fontWeight: 600 }}>{user?.name || user?.email?.split('@')[0] || 'User'}</span>
          </button>

          {showProfileMenu && (
            <div style={{
              position: 'absolute',
              top: '44px',
              right: '0',
              width: '200px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              padding: '8px',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ padding: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>{user?.name || 'Authorized User'}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>
              <button
                onClick={logout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  color: '#f87171',
                  background: 'transparent',
                  width: '100%',
                  textAlign: 'left',
                  fontSize: '12.5px',
                  fontWeight: 600
                }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
