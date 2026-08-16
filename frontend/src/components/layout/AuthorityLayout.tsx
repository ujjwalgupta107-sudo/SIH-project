import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Map, BarChart3, Settings, LogOut, Menu, X, Activity, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const authorityNavItems = [
  { path: '/command-center', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/command-center/incidents', label: 'Incidents', icon: FileText },
  { path: '/command-center/map', label: 'Map', icon: Map },
  { path: '/command-center/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/command-center/settings', label: 'Settings', icon: Settings },
];

export function AuthorityLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-layout authority-layout">
      <header className="app-header">
        <div className="header-left">
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link to="/command-center" className="brand" aria-label="Command Center Home">
            <Activity className="brand-icon" size={28} />
            <span className="brand-text">Command Center</span>
          </Link>
        </div>
        <nav className={`main-nav ${mobileMenuOpen ? 'open' : ''}`} aria-label="Authority navigation">
          <ul className="nav-list" role="list">
            {authorityNavItems.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon size={20} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="header-right">
          <div className="user-menu">
            <button className="user-avatar" aria-label="User menu">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </button>
            <div className="user-dropdown">
              <div className="user-info">
                <p className="user-name">{user?.name || 'Officer'}</p>
                <p className="user-role">{user?.role === 'ADMIN' ? 'Administrator' : 'Authority'}</p>
              </div>
              <hr className="dropdown-divider" />
              <button className="dropdown-item" onClick={handleLogout}>
                <LogOut size={16} aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="app-main" role="main">
        <Outlet />
      </main>
    </div>
  );
}