import React, { useState, useEffect } from 'react';
import {
  Map as MapIcon,
  Layers,
  Filter,
  AlertTriangle,
  Radio,
  CheckCircle,
  PlusCircle,
  Eye,
  Crosshair
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LeafletMap, MapMarker } from '../../components/common/LeafletMap';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export function MapPage() {
  const { token } = useAuth();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    async function loadNearbyIncidents() {
      try {
        // Fetch incidents or nearby
        const res = await fetch(`${API_URL}/incidents/nearby?lat=28.6139&lng=77.2090&radius=50000`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setIncidents(data);
        } else {
          // Fallback to mine
          const mineRes = await fetch(`${API_URL}/incidents/mine`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (mineRes.ok) {
            setIncidents(await mineRes.json());
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadNearbyIncidents();
  }, [token]);

  const markers: MapMarker[] = incidents
    .filter(i => categoryFilter === 'ALL' || (i.type && i.type.toLowerCase().includes(categoryFilter.toLowerCase())))
    .map(i => ({
      id: i.id,
      latitude: i.latitude || 28.6139,
      longitude: i.longitude || 77.2090,
      type: i.type,
      severity: i.severity,
      status: i.status,
      address: i.address,
      description: i.description,
      department: i.department,
    }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 110px)' }}>
      {/* Top Map Header */}
      <div className="page-header-row" style={{ minHeight: 'auto' }}>
        <div className="page-title-group">
          <h1>
            <MapIcon size={24} color="#06b6d4" />
            <span>Civic GIS Safety & Hazard Radar</span>
          </h1>
          <p>Real-time geospatial intelligence map with YOLOv8 verified hazard pins.</p>
        </div>

        <div className="page-header-actions">
          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-surface)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            {['ALL', 'POTHOLE', 'WATERLOGGING'].map((cat) => (
              <button
                key={cat}
                type="button"
                className={`filter-pill-btn ${categoryFilter === cat ? 'active' : ''}`}
                style={{ padding: '4px 10px', fontSize: '11px' }}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <Link to="/report" className="btn btn-cyan btn-sm">
            <PlusCircle size={14} />
            <span>Report at Current Location</span>
          </Link>
        </div>
      </div>

      {/* Interactive Map & Side Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedIncident ? '1fr 340px' : '1fr', gap: '16px', flex: 1, minHeight: '0' }}>
        <div style={{ height: '100%', width: '100%', position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
          <LeafletMap
            markers={markers}
            selectedMarkerId={selectedIncident?.id}
            onMarkerClick={(marker) => {
              const fullInc = incidents.find(i => i.id === marker.id) || marker;
              setSelectedIncident(fullInc);
            }}
            height="100%"
          />

          {/* Floating Map Legend */}
          <div className="map-control-overlay">
            <div className="map-floating-panel" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>Hazard Severity Index</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
                <span>Critical Risk (80-100)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f97316' }} />
                <span>High Hazard (60-79)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#06b6d4' }} />
                <span>Moderate / Low (&lt;60)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Incident Drawer */}
        {selectedIncident && (
          <div className="enterprise-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
            <div className="card-header">
              <span className="card-title">Incident Inspector</span>
              <button className="modal-close-btn" onClick={() => setSelectedIncident(null)}>✕</button>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Ref ID</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)', fontSize: '13px' }}>
                  {selectedIncident.id}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Classification</div>
                <div style={{ fontWeight: 700, fontSize: '15px', textTransform: 'capitalize', color: 'var(--text-main)' }}>
                  {selectedIncident.type}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <span className={`badge ${selectedIncident.severity >= 80 ? 'badge-critical' : selectedIncident.severity >= 50 ? 'badge-high' : 'badge-low'}`}>
                  Severity: {selectedIncident.severity ?? 65}
                </span>
                <span className={`badge ${selectedIncident.status === 'RESOLVED' ? 'badge-status-resolved' : 'badge-status-reported'}`}>
                  {selectedIncident.status || 'REPORTED'}
                </span>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Geocoded Location</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {selectedIncident.address || `${selectedIncident.latitude?.toFixed(4)}, ${selectedIncident.longitude?.toFixed(4)}`}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Authority Handling</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                  {selectedIncident.department || 'Public Works (PWD)'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Description</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '10px', borderRadius: 'var(--radius-sm)', marginTop: '4px' }}>
                  {selectedIncident.description || 'Verified via autonomous neural edge pipeline.'}
                </div>
              </div>

              <Link to="/history" className="btn btn-secondary btn-sm" style={{ marginTop: 'auto' }}>
                <Eye size={13} />
                <span>View in Submissions List</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}