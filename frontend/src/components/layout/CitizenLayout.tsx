import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  PlusCircle,
  Video,
  ClipboardList,
  Map,
  BarChart3,
  User,
  LogOut,
  Shield,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CommandHeader } from './CommandHeader';

const citizenNavItems = [
  { path: '/home', label: 'Dashboard', icon: Home },
  { path: '/report', label: 'Report Hazard', icon: PlusCircle, badge: 'AI' },
  { path: '/live-detection', label: 'Live Edge Scanner', icon: Radio, badge: 'Live' },
  { path: '/history', label: 'My Submissions', icon: ClipboardList },
  { path: '/map', label: 'City Radar Map', icon: Map },
  { path: '/insights', label: 'Community Impact', icon: BarChart3 },
  { path: '/profile', label: 'Citizen Profile', icon: User },
];

export function CitizenLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const currentItem = citizenNavItems.find(item => item.path === location.pathname);
  const breadcrumb = currentItem ? currentItem.label : 'Portal';

  return (
    <div className="app-container">
      {/* Enterprise Sidebar */}
      <aside className="enterprise-sidebar">
        <div>
          {/* Brand Header */}
          <div className="sidebar-brand-area">
            <div className="brand-shield-icon">
              <Shield size={22} />
            </div>
            <div className="brand-text-block">
              <span className="brand-title">CivicShield AI</span>
              <span className="brand-tagline">Citizen Guardian Portal</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="sidebar-nav-container">
            <div className="nav-section-title">Operations & Reports</div>
            {citizenNavItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
                >
                  <div className="nav-link-left">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && <span className="nav-item-badge">{item.badge}</span>}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Sidebar User Footer */}
        <div className="sidebar-footer">
          <div className="user-profile-widget">
            <div className="user-meta-left">
              <div className="user-avatar-badge">
                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'C'}
              </div>
              <div className="user-info-text">
                <span className="user-name-title">{user?.name || user?.email?.split('@')[0] || 'Citizen'}</span>
                <span className="user-role-pill">Verified Citizen</span>
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
        <CommandHeader breadcrumb={breadcrumb} roleLabel="Citizen Portal" />
        <main className="page-body-container" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}