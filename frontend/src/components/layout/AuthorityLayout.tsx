import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSpreadsheet,
  MapPin,
  TrendingUp,
  Sliders,
  LogOut,
  Activity,
  Cpu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CommandHeader } from './CommandHeader';

const authorityNavItems = [
  { path: '/command-center', label: 'Command Overview', icon: LayoutDashboard },
  { path: '/command-center/incidents', label: 'Incident Triage & Queue', icon: FileSpreadsheet, badge: 'Live' },
  { path: '/command-center/map', label: 'Tactical GIS Map', icon: MapPin },
  { path: '/command-center/analytics', label: 'Municipal Analytics', icon: TrendingUp },
  { path: '/command-center/settings', label: 'System Configuration', icon: Sliders },
];

export function AuthorityLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const currentItem = authorityNavItems.find(item => item.path === location.pathname);
  const breadcrumb = currentItem ? currentItem.label : 'Dashboard';

  return (
    <div className="app-container">
      {/* Enterprise Sidebar */}
      <aside className="enterprise-sidebar">
        <div>
          {/* Brand Header */}
          <div className="sidebar-brand-area">
            <div className="brand-shield-icon" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
              <Activity size={22} />
            </div>
            <div className="brand-text-block">
              <span className="brand-title">COMMAND CENTER</span>
              <span className="brand-tagline">Municipal HQ Division</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="sidebar-nav-container">
            <div className="nav-section-title">Operations Control</div>
            {authorityNavItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/command-center'}
                  className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
                >
                  <div className="nav-link-left">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="nav-item-badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}

            <div className="nav-section-title" style={{ marginTop: '16px' }}>AI Detection Engine</div>
            <div style={{
              margin: '0 8px',
              padding: '12px',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '11px',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '4px' }}>
                <Cpu size={14} />
                <span>YOLOv8 Edge Vision</span>
              </div>
              <div>Model: <strong style={{ color: 'var(--text-main)' }}>yolo26n.pt</strong></div>
              <div>Active Classes: <strong>Pothole, Flood</strong></div>
            </div>
          </div>
        </div>

        {/* Sidebar User Footer */}
        <div className="sidebar-footer">
          <div className="user-profile-widget">
            <div className="user-meta-left">
              <div className="user-avatar-badge" style={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b)' }}>
                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="user-info-text">
                <span className="user-name-title">{user?.name || user?.email?.split('@')[0] || 'Commander'}</span>
                <span className="user-role-pill" style={{ color: '#f87171' }}>Municipal Officer</span>
              </div>
            </div>
            <button
              onClick={logout}
              className="logout-icon-btn"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="app-main-viewport">
        <CommandHeader breadcrumb={breadcrumb} roleLabel="Municipal Command Center" />
        <main className="page-body-container" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}