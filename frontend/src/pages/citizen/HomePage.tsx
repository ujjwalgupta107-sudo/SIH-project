import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Radio,
  CheckCircle,
  Clock,
  AlertTriangle,
  Award,
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export function HomePage() {
  const { user, token } = useAuth();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyIncidents() {
      try {
        const res = await fetch(`${API_URL}/incidents/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setIncidents(data);
        }
      } catch (err) {
        console.error('Failed to load incidents', err);
      } finally {
        setLoading(false);
      }
    }
    if (token) {
      fetchMyIncidents();
    } else {
      setLoading(false);
    }
  }, [token]);

  const totalReports = incidents.length;
  const inProgress = incidents.filter(i => i.status === 'IN_PROGRESS' || i.status === 'ASSIGNED').length;
  const resolved = incidents.filter(i => i.status === 'RESOLVED').length;
  const karmaPoints = totalReports * 50 + resolved * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(14, 28, 54, 0.95), rgba(8, 14, 26, 0.95))',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          right: '-50px',
          top: '-50px',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15), transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '4px 10px', borderRadius: 'var(--radius-full)', width: 'fit-content', color: 'var(--accent-cyan)', fontSize: '11.5px', fontWeight: 600 }}>
            <Sparkles size={13} />
            <span>AI-Driven Autonomous Civic Intelligence</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Welcome back, {user?.name || 'Citizen Guardian'}
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Report road hazards, potholes, or flood risks instantly. Your reports are automatically analyzed via YOLOv8 Edge Vision and routed to municipal authorities.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', zIndex: 2 }}>
          <Link to="/report" className="btn btn-cyan btn-lg">
            <PlusCircle size={18} />
            <span>Report New Hazard</span>
          </Link>
          <Link to="/live-detection" className="btn btn-secondary btn-lg">
            <Radio size={18} />
            <span>Live Scanner</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Grid */}
      <div className="grid-4">
        <div className="metric-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">My Submissions</span>
            <div className="kpi-icon-box blue">
              <Clock size={18} />
            </div>
          </div>
          <div className="kpi-main-val">{totalReports}</div>
          <div className="kpi-bottom-row">
            <span>Total civic hazards filed</span>
            <span className="kpi-trend-pill positive">
              <TrendingUp size={12} /> Active
            </span>
          </div>
        </div>

        <div className="metric-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">In Triage & Repair</span>
            <div className="kpi-icon-box amber">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="kpi-main-val">{inProgress}</div>
          <div className="kpi-bottom-row">
            <span>Dispatched to PWD / Drainage</span>
            <span className="kpi-trend-pill neutral">In Motion</span>
          </div>
        </div>

        <div className="metric-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Fixed & Verified</span>
            <div className="kpi-icon-box green">
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="kpi-main-val">{resolved}</div>
          <div className="kpi-bottom-row">
            <span>Resolved municipal hazards</span>
            <span className="kpi-trend-pill positive">100% Verified</span>
          </div>
        </div>

        <div className="metric-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Civic Karma Score</span>
            <div className="kpi-icon-box cyan">
              <Award size={18} />
            </div>
          </div>
          <div className="kpi-main-val">{karmaPoints} pts</div>
          <div className="kpi-bottom-row">
            <span>Level 3 Community Guardian</span>
            <span className="kpi-trend-pill positive">Top 5%</span>
          </div>
        </div>
      </div>

      {/* Split Section: Recent Reports & City GIS Map Teaser */}
      <div className="grid-split-60-40">
        {/* Recent Reports List */}
        <div className="enterprise-card">
          <div className="card-header">
            <div className="card-title-block">
              <span className="card-title">Recent Submissions</span>
              <span className="badge badge-low">{incidents.length} Records</span>
            </div>
            <Link to="/history" style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card-body" style={{ padding: '0' }}>
            {loading ? (
              <div className="loading-state-container">
                <div className="pulse-dot" style={{ width: '12px', height: '12px' }} />
                <span>Loading your reports...</span>
              </div>
            ) : incidents.length === 0 ? (
              <div className="empty-state-container">
                <ShieldCheck className="empty-state-icon" />
                <div className="empty-state-title">No Incidents Reported Yet</div>
                <p className="empty-state-desc">
                  Notice a pothole or waterlogged street? Click below to file an instant AI report.
                </p>
                <Link to="/report" className="btn btn-cyan btn-sm">
                  <PlusCircle size={14} />
                  <span>Report First Hazard</span>
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {incidents.slice(0, 4).map((inc, idx) => (
                  <div
                    key={inc.id || idx}
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px'
                      }}>
                        {inc.type?.toLowerCase().includes('water') ? '🌊' : '🕳️'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-main)', textTransform: 'capitalize' }}>
                          {inc.type}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} />
                          <span>{inc.address || `${inc.latitude?.toFixed(3)}, ${inc.longitude?.toFixed(3)}`}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className={`badge ${inc.severity >= 80 ? 'badge-critical' : inc.severity >= 50 ? 'badge-high' : 'badge-low'}`}>
                        {inc.severity >= 80 ? 'Critical' : inc.severity >= 50 ? 'High' : 'Moderate'}
                      </span>
                      <span className={`badge ${inc.status === 'RESOLVED' ? 'badge-status-resolved' : inc.status === 'IN_PROGRESS' ? 'badge-status-inprogress' : 'badge-status-reported'}`}>
                        {inc.status || 'REPORTED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* City Live Radar & AI Capabilities Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="enterprise-card">
            <div className="card-header">
              <span className="card-title">Live City Radar</span>
              <Link to="/map" style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                Fullscreen Map →
              </Link>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                Active municipal crews are patrolling high-density zones. Check verified safety corridors in your vicinity.
              </p>
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Patrol Coverage</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-cyan)' }}>98.4% Urban Area</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Avg Response</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#34d399' }}>3.2 Hours</div>
                </div>
              </div>
              <Link to="/map" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                <span>Open Interactive Map</span>
              </Link>
            </div>
          </div>

          <div className="enterprise-card" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(99, 102, 241, 0.1))' }}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                <Radio size={16} />
                <span>Edge AI Vision Scanner</span>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                Mount your smartphone on your vehicle dashboard to scan and auto-tag road hazards hands-free in real time.
              </p>
              <Link to="/live-detection" className="btn btn-cyan btn-sm" style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
                <span>Launch Live Scanner</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}