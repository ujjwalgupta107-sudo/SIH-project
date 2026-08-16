import { Outlet, Link, useLocation } from 'react-router-dom';
import { House, Video, History, MapPin, BarChart3, User, LogOut, Menu, X, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const citizenNavItems = [
  { path: '/home', label: 'Home', icon: House },
  { path: '/report', label: 'Report Issue', icon: Video },
  { path: '/live-detection', label: 'Live Detection', icon: Video },
  { path: '/history', label: 'My Reports', icon: History },
  { path: '/map', label: 'City Map', icon: MapPin },
  { path: '/insights', label: 'Insights', icon: BarChart3 },
  { path: '/profile', label: 'Profile', icon: User },
];

export function CitizenLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-layout citizen-layout">
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
          <Link to="/home" className="brand" aria-label="CivicShield Home">
            <Shield className="brand-icon" size={28} />
            <span className="brand-text">CivicShield</span>
          </Link>
        </div>
        <nav className={`main-nav ${mobileMenuOpen ? 'open' : ''}`} aria-label="Citizen navigation">
          <ul className="nav-list" role="list">
            {citizenNavItems.map(item => (
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
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </button>
            <div className="user-dropdown">
              <div className="user-info">
                <p className="user-name">{user?.name || 'Citizen'}</p>
                <p className="user-role">Citizen</p>
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