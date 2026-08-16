import { useState, useEffect } from 'react';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Filter, Layers, Crosshair, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface Incident {
  id: string;
  type: string;
  severity: string;
  status: string;
  location: { lat: number; lng: number; address: string };
  confidence: number;
  date: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const severityColors: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#3b82f6',
};

const statusColors: Record<string, string> = {
  SUBMITTED: '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  RESOLVED: '#22c55e',
  REJECTED: '#ef4444',
  DRAFT: '#64748b',
};

export function MapPage() {
  const [viewport, setViewport] = useState({
    latitude: 26.8467,
    longitude: 80.9462,
    zoom: 12,
  });
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'pothole' | 'waterlogging'>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'SUBMITTED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const filteredIncidents = incidents.filter(incident => {
    if (filterType !== 'all' && incident.type !== filterType) return false;
    if (filterSeverity !== 'all' && incident.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && incident.status !== filterStatus) return false;
    return true;
  });

  const handleMapClick = (e: any) => {
    if (!e.features || e.features.length === 0) {
      setSelectedIncident(null);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setViewport(v => ({ ...v, latitude: loc.lat, longitude: loc.lng, zoom: 15 }));
      },
      err => console.warn('Geolocation failed:', err),
      { enableHighAccuracy: true }
    );
  };

  const loadIncidents = async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(`${API_URL}/incidents/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((d: any) => ({
          id: d.id,
          type: d.type || 'Unknown',
          severity: d.risk_level || 'LOW',
          status: d.status || 'REPORTED',
          location: { lat: d.latitude, lng: d.longitude, address: d.address },
          confidence: d.confidence || 0,
          date: d.created_at?.split('T')[0] || '',
        }));
        setIncidents(mapped);
      }
    } catch (err) {
      console.warn('Map API error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
    loadIncidents();
  }, []);

  const handleViewportChange = (e: { viewState: typeof viewport }) => {
    setViewport(e.viewState);
  };

  const MarkerComponent = ({ incident }: { incident: Incident }) => (
    <div className="custom-marker">
      <button
        className="marker-button"
        style={{ backgroundColor: severityColors[incident.severity] }}
        onClick={() => setSelectedIncident(incident)}
        aria-label={`View ${incident.id}`}
      >
        {incident.type === 'pothole' && <AlertCircle size={16} />}
        {incident.type === 'waterlogging' && <Info size={16} />}
      </button>
    </div>
  );

  return (
    <div className="page map-page">
      <header className="page-header">
        <div>
          <h1>City Map</h1>
          <p className="muted">View civic incidents in your area</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={getCurrentLocation}>
            <Crosshair size={18} /> My Location
          </button>
          <button className="btn btn-outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} /> Filters
          </button>
        </div>
      </header>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Issue Type</label>
            <select
              className="select"
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
            >
              <option value="all">All Types</option>
              <option value="pothole">Pothole</option>
              <option value="waterlogging">Waterlogging</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Severity</label>
            <select
              className="select"
              value={filterSeverity}
              onChange={e => setFilterSeverity(e.target.value as any)}
            >
              <option value="all">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select
              className="select"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      )}

      <div className="map-container">
        <Map
          initialViewState={viewport}
          onMove={handleViewportChange}
          mapStyle={import.meta.env.VITE_MAP_STYLE_URL || 'https://demotiles.maplibre.org/style.json'}
          onClick={handleMapClick}
        >
          <NavigationControl position="top-right" />
          {filteredIncidents.map(incident => (
            <Marker key={incident.id} longitude={incident.location.lng} latitude={incident.location.lat}>
              <MarkerComponent incident={incident} />
            </Marker>
          ))}
          {userLocation && (
            <Marker longitude={userLocation.lng} latitude={userLocation.lat}>
              <div className="user-marker" title="Your Location">
                <Crosshair size={24} style={{ color: '#00d4ff', filter: 'drop-shadow(0 0 4px #00d4ff)' }} />
              </div>
            </Marker>
          )}
          {selectedIncident && (
            <Popup
              longitude={selectedIncident.location.lng}
              latitude={selectedIncident.location.lat}
              onClose={() => setSelectedIncident(null)}
              anchor="top"
              offset={20}
            >
              <div className="incident-popup">
                <div className="popup-header">
                  <h4>{selectedIncident.id}</h4>
                  <span className={`severity-badge ${selectedIncident.severity.toLowerCase()}`}>{selectedIncident.severity}</span>
                </div>
                <p className="popup-type">
                  <MapPin size={14} /> {selectedIncident.type.replace('_', ' ')}
                  <span className="confidence">{(selectedIncident.confidence * 100).toFixed(0)}%</span>
                </p>
                <p className="popup-location">{selectedIncident.location.address}</p>
                <p className="popup-status">
                  <span className="status-dot" style={{ backgroundColor: statusColors[selectedIncident.status] }} />
                  {selectedIncident.status.replace('_', ' ')}
                </p>
                <p className="popup-date">Reported: {selectedIncident.date}</p>
              </div>
            </Popup>
          )}
        </Map>

        <div className="map-legend">
          <div className="legend-section">
            <h4>Severity</h4>
            <div className="legend-items">
              {Object.entries(severityColors).map(([label, color]) => (
                <div key={label} className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: color }} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="legend-section">
            <h4>Status</h4>
            <div className="legend-items">
              {Object.entries(statusColors).map(([label, color]) => (
                <div key={label} className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: color }} />
                  <span>{label.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="map-stats">
          <div className="stat">
            <span className="stat-value">{filteredIncidents.length}</span>
            <span className="stat-label">Incidents Shown</span>
          </div>
          <div className="stat">
            <span className="stat-value">{incidents.filter(i => i.severity === 'CRITICAL').length}</span>
            <span className="stat-label">Critical</span>
          </div>
          <div className="stat">
            <span className="stat-value">{incidents.filter(i => i.status === 'RESOLVED').length}</span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
}