import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle,
  Truck,
  Layers,
  ArrowRight,
  RefreshCw,
  Eye,
  CheckCircle2,
  Shield,
  Sparkles,
  Zap,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LeafletMap, MapMarker } from '../../components/common/LeafletMap';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export function CommandCenterPage() {
  const { token } = useAuth();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/incidents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIncidents(data);
        if (data.length > 0 && !selectedIncident) {
          setSelectedIncident(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load command center incidents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchIncidents();
  }, [token]);

  const handleUpdateStatus = async (id: string, newStatus: string, dept?: string) => {
    setUpdatingId(id);
    try {
      const payload: any = { status: newStatus };
      if (dept) payload.department = dept;

      const res = await fetch(`${API_URL}/incidents/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        setIncidents(prev => prev.map(i => i.id === id ? updated : i));
        if (selectedIncident?.id === id) {
          setSelectedIncident(updated);
        }
      }
    } catch (err) {
      console.error('Failed to update incident', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const totalIncidents = incidents.length;
  const criticalCount = incidents.filter(i => (i.severity >= 80 || i.risk_level === 'CRITICAL') && i.status !== 'RESOLVED').length;
  const inProgressCount = incidents.filter(i => i.status === 'IN_PROGRESS' || i.status === 'ASSIGNED').length;
  const resolvedCount = incidents.filter(i => i.status === 'RESOLVED').length;

  const markers: MapMarker[] = incidents.map(i => ({
    id: i.id,
    latitude: i.latitude || 28.6139,
    longitude: i.longitude || 77.2090,
    type: i.type,
    severity: i.severity,
    status: i.status,
    address: i.address,
    department: i.department,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Operations Header */}
      <div className="page-header-row">
        <div className="page-title-group">
          <h1>
            <Activity size={24} color="#f87171" />
            <span>Municipal Command Center & Real-Time Incident Stream</span>
          </h1>
          <p>Autonomous AI triage, instant department routing, and live geospatial emergency dispatch.</p>
        </div>

        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={fetchIncidents}>
            <RefreshCw size={14} className={loading ? 'pulse-dot' : ''} />
            <span>Refresh Telemetry</span>
          </button>
          <Link to="/command-center/incidents" className="btn btn-primary btn-sm">
            <span>Incident Queue</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* 4 Operations KPI Cards */}
      <div className="grid-4">
        <div className="metric-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Active City Incidents</span>
            <div className="kpi-icon-box blue">
              <Layers size={18} />
            </div>
          </div>
          <div className="kpi-main-val">{totalIncidents}</div>
          <div className="kpi-bottom-row">
            <span>Across all metropolitan zones</span>
            <span className="kpi-trend-pill positive">Live Feed</span>
          </div>
        </div>

        <div className="metric-kpi-card" style={{ borderColor: criticalCount > 0 ? 'rgba(239, 68, 68, 0.4)' : undefined }}>
          <div className="kpi-top-row">
            <span className="kpi-label">Critical Emergency Queue</span>
            <div className="kpi-icon-box red">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="kpi-main-val" style={{ color: '#f87171' }}>{criticalCount}</div>
          <div className="kpi-bottom-row">
            <span>High-risk hazards requiring dispatch</span>
            <span className="kpi-trend-pill negative">SLA: &lt;4h</span>
          </div>
        </div>

        <div className="metric-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Dispatched & In Progress</span>
            <div className="kpi-icon-box amber">
              <Truck size={18} />
            </div>
          </div>
          <div className="kpi-main-val">{inProgressCount}</div>
          <div className="kpi-bottom-row">
            <span>Field crews actively on-site</span>
            <span className="kpi-trend-pill neutral">Active Operations</span>
          </div>
        </div>

        <div className="metric-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Resolved & Verified</span>
            <div className="kpi-icon-box green">
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="kpi-main-val">{resolvedCount}</div>
          <div className="kpi-bottom-row">
            <span>{totalIncidents ? ((resolvedCount / totalIncidents) * 100).toFixed(0) : 100}% Resolution Rate</span>
            <span className="kpi-trend-pill positive">Target Met</span>
          </div>
        </div>
      </div>

      {/* Main Split: Live Tactical Map & Real-time Triage Feed */}
      <div className="grid-split-60-40">
        {/* Tactical Map Container */}
        <div className="enterprise-card" style={{ display: 'flex', flexDirection: 'column', height: '520px' }}>
          <div className="card-header">
            <div className="card-title-block">
              <MapPin size={16} color="#06b6d4" />
              <span className="card-title">Live Tactical Operations Map</span>
              <span className="badge badge-low">{markers.length} Active Pins</span>
            </div>
            <Link to="/command-center/map" style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              Fullscreen Map →
            </Link>
          </div>

          <div style={{ flex: 1, position: 'relative' }}>
            <LeafletMap
              markers={markers}
              selectedMarkerId={selectedIncident?.id}
              onMarkerClick={(marker) => {
                const full = incidents.find(i => i.id === marker.id) || marker;
                setSelectedIncident(full);
              }}
              height="100%"
            />
          </div>
        </div>

        {/* Live Incident Action Stream & Quick Dispatch Panel */}
        <div className="enterprise-card" style={{ display: 'flex', flexDirection: 'column', height: '520px' }}>
          <div className="card-header">
            <span className="card-title">Priority Incident Triage Queue</span>
            <span className="badge badge-status-reported">Real-time Stream</span>
          </div>

          <div className="card-body" style={{ flex: 1, overflowY: 'auto', padding: '0', display: 'flex', flexDirection: 'column' }}>
            {incidents.length === 0 ? (
              <div className="empty-state-container">
                <CheckCircle2 className="empty-state-icon" style={{ color: '#34d399' }} />
                <div className="empty-state-title">All Municipal Corridors Clear</div>
                <p className="empty-state-desc">No active hazard tickets in the queue.</p>
              </div>
            ) : (
              incidents.slice(0, 6).map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid var(--border-subtle)',
                      background: isSelected ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                      borderLeft: isSelected ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-main)', textTransform: 'capitalize' }}>
                          {inc.type}
                        </span>
                        <span className={`badge ${inc.severity >= 80 ? 'badge-critical' : inc.severity >= 50 ? 'badge-high' : 'badge-low'}`}>
                          Sev {inc.severity}
                        </span>
                      </div>
                      <span className={`badge ${inc.status === 'RESOLVED' ? 'badge-status-resolved' : inc.status === 'IN_PROGRESS' ? 'badge-status-inprogress' : 'badge-status-reported'}`}>
                        {inc.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      📍 {inc.address || `${inc.latitude?.toFixed(3)}, ${inc.longitude?.toFixed(3)}`}
                    </div>

                    {isSelected && (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-secondary btn-sm"
                          disabled={updatingId === inc.id}
                          onClick={() => handleUpdateStatus(inc.id, 'IN_PROGRESS', 'Public Works (PWD)')}
                        >
                          <span>Dispatch PWD</span>
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          disabled={updatingId === inc.id}
                          onClick={() => handleUpdateStatus(inc.id, 'IN_PROGRESS', 'Drainage Dept')}
                        >
                          <span>Dispatch Drainage</span>
                        </button>
                        <button
                          className="btn btn-success btn-sm"
                          disabled={updatingId === inc.id}
                          onClick={() => handleUpdateStatus(inc.id, 'RESOLVED')}
                        >
                          <CheckCircle size={12} />
                          <span>Mark Fixed</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}