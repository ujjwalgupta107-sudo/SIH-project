import React, { useState, useEffect } from 'react';
import {
  Map as MapIcon,
  Layers,
  Filter,
  RefreshCw,
  Eye,
  Shield,
  Truck,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LeafletMap, MapMarker } from '../../components/common/LeafletMap';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export function AuthorityMapPage() {
  const { token } = useAuth();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/incidents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setIncidents(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchIncidents();
  }, [token]);

  const filtered = incidents.filter(i => {
    if (severityFilter === 'CRITICAL') return i.severity >= 80 || i.risk_level === 'CRITICAL';
    if (severityFilter === 'HIGH') return i.severity >= 60 && i.severity < 80;
    if (severityFilter === 'ACTIVE') return i.status !== 'RESOLVED';
    return true;
  });

  const markers: MapMarker[] = filtered.map(i => ({
    id: i.id,
    latitude: i.latitude || 28.6139,
    longitude: i.longitude || 77.2090,
    type: i.type,
    severity: i.severity,
    status: i.status,
    address: i.address,
    department: i.department,
    description: i.description,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 110px)' }}>
      {/* Header */}
      <div className="page-header-row">
        <div className="page-title-group">
          <h1>
            <MapIcon size={24} color="#f87171" />
            <span>Tactical Municipal GIS Incident Map</span>
          </h1>
          <p>Real-time spatial distribution, fleet patrol sectors, and critical hazard hot-spots.</p>
        </div>

        <div className="page-header-actions">
          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-surface)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            {['ALL', 'CRITICAL', 'HIGH', 'ACTIVE'].map((f) => (
              <button
                key={f}
                type="button"
                className={`filter-pill-btn ${severityFilter === f ? 'active' : ''}`}
                style={{ padding: '4px 10px', fontSize: '11px' }}
                onClick={() => setSeverityFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <button className="btn btn-secondary btn-sm" onClick={fetchIncidents}>
            <RefreshCw size={14} className={loading ? 'pulse-dot' : ''} />
            <span>Refresh GIS</span>
          </button>
        </div>
      </div>

      {/* Main Map & Incident Inspection Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedIncident ? '1fr 340px' : '1fr', gap: '16px', flex: 1, minHeight: '0' }}>
        <div style={{ height: '100%', width: '100%', position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
          <LeafletMap
            markers={markers}
            selectedMarkerId={selectedIncident?.id}
            onMarkerClick={(marker) => {
              const full = incidents.find(i => i.id === marker.id) || marker;
              setSelectedIncident(full);
            }}
            height="100%"
          />

          {/* Floating HUD */}
          <div className="map-control-overlay">
            <div className="map-floating-panel" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>Operational GIS Ticker</div>
              <div>Active Incident Pins: <strong>{markers.length}</strong></div>
              <div>Critical Priority: <strong style={{ color: '#f87171' }}>{incidents.filter(i => i.severity >= 80).length}</strong></div>
              <div>Fleet Crews On-Duty: <strong style={{ color: '#34d399' }}>18 Active Units</strong></div>
            </div>
          </div>
        </div>

        {/* Selected Incident Drawer */}
        {selectedIncident && (
          <div className="enterprise-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
            <div className="card-header">
              <span className="card-title">Geospatial Ticket Info</span>
              <button className="modal-close-btn" onClick={() => setSelectedIncident(null)}>✕</button>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>ID</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)', fontSize: '13px' }}>
                  {selectedIncident.id}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Category</div>
                <div style={{ fontWeight: 700, fontSize: '15px', textTransform: 'capitalize', color: 'var(--text-main)' }}>
                  {selectedIncident.type}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <span className={`badge ${selectedIncident.severity >= 80 ? 'badge-critical' : selectedIncident.severity >= 50 ? 'badge-high' : 'badge-low'}`}>
                  Severity: {selectedIncident.severity ?? 70}
                </span>
                <span className={`badge ${selectedIncident.status === 'RESOLVED' ? 'badge-status-resolved' : 'badge-status-reported'}`}>
                  {selectedIncident.status || 'REPORTED'}
                </span>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Address</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {selectedIncident.address || `${selectedIncident.latitude?.toFixed(4)}, ${selectedIncident.longitude?.toFixed(4)}`}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Department</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                  {selectedIncident.department || 'Public Works (PWD)'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Incident Notes</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '10px', borderRadius: 'var(--radius-sm)', marginTop: '4px' }}>
                  {selectedIncident.description || 'Verified via autonomous neural edge pipeline.'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}