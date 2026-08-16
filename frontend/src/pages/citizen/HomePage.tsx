import { Shield, AlertTriangle, CheckCircle, Clock, MapPin, Camera, Video, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { predictImage, PredictResponse } from '../../services/ml';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats] = useState({
    reported: 12,
    inProgress: 3,
    resolved: 8,
    critical: 1,
  });

  const quickActions = [
    { label: 'Report Issue', href: '/report', icon: Camera, description: 'Submit a new civic issue with photo/video', variant: 'primary' },
    { label: 'Live Detection', href: '/live-detection', icon: Video, description: 'Real-time AI detection from camera', variant: 'secondary' },
    { label: 'View Reports', href: '/history', icon: Shield, description: 'Track your submitted reports', variant: 'secondary' },
    { label: 'City Map', href: '/map', icon: MapPin, description: 'View incidents in your area', variant: 'secondary' },
  ];

  return (
    <div className="page home-page">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="status-indicator active" />
            <span>AI Monitoring Active</span>
          </div>
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'Citizen'}</h1>
          <p className="hero-subtitle">Report civic issues. Track resolutions. Make your city better.</p>
          <div className="hero-actions">
            <Link to="/report" className="btn btn-primary btn-lg">
              <Camera size={20} /> Report an Issue
            </Link>
            <Link to="/live-detection" className="btn btn-outline btn-lg">
              <Video size={20} /> Live Detection
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <div className="hero-card-header">
              <Shield size={32} className="hero-card-icon" />
              <span className="pulse-ring" />
            </div>
            <p className="hero-card-title">AI-Powered Detection</p>
            <p className="hero-card-desc">Real-time analysis for potholes and waterlogging</p>
            <div className="detection-classes">
              <span className="detection-badge pothole">Pothole</span>
              <span className="detection-badge waterlogging">Waterlogging</span>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-grid">
          <article className="stat-card">
            <div className="stat-icon reported"><AlertTriangle size={24} /></div>
            <div className="stat-content">
              <p className="stat-value">{stats.reported}</p>
              <p className="stat-label">Total Reported</p>
            </div>
          </article>
          <article className="stat-card">
            <div className="stat-icon in-progress"><Clock size={24} /></div>
            <div className="stat-content">
              <p className="stat-value">{stats.inProgress}</p>
              <p className="stat-label">In Progress</p>
            </div>
          </article>
          <article className="stat-card">
            <div className="stat-icon resolved"><CheckCircle size={24} /></div>
            <div className="stat-content">
              <p className="stat-value">{stats.resolved}</p>
              <p className="stat-label">Resolved</p>
            </div>
          </article>
          <article className="stat-card critical">
            <div className="stat-icon critical"><AlertTriangle size={24} /></div>
            <div className="stat-content">
              <p className="stat-value">{stats.critical}</p>
              <p className="stat-label">Critical</p>
            </div>
          </article>
        </div>
      </section>

      <section className="quick-actions-section">
        <header className="section-header">
          <h2>Quick Actions</h2>
          <p>Common tasks to help you get started</p>
        </header>
        <div className="actions-grid">
          {quickActions.map(action => (
            <Link key={action.href} to={action.href} className={`action-card ${action.variant}`}>
              <div className="action-icon">
                <action.icon size={24} />
              </div>
              <div className="action-content">
                <h3>{action.label}</h3>
                <p>{action.description}</p>
              </div>
              <TrendingUp size={20} className="action-arrow" />
            </Link>
          ))}
        </div>
      </section>

      <section className="recent-section">
        <header className="section-header">
          <div>
            <h2>Recent Activity</h2>
            <p>Your latest civic engagement</p>
          </div>
          <Link to="/history" className="btn btn-ghost btn-sm">View All</Link>
        </header>
        <div className="empty-state">
          <AlertTriangle size={48} className="empty-icon" />
          <h3>No reports yet</h3>
          <p>Start by reporting your first civic issue</p>
          <Link to="/report" className="btn btn-primary">Report Issue</Link>
        </div>
      </section>
    </div>
  );
}