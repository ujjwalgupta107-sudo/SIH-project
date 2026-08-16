import { useState, useEffect } from 'react';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Filter, Layers, Crosshair, AlertCircle, CheckCircle, Info, Download, Expand, Eye, Edit } from 'lucide-react';
import type { Incident } from '../../shared/contracts';

const mockIncidents: Incident[] = [
  {
    id: 'INC-2026-001',
    citizenId: 'USR-001',
    description: 'Large pothole creating accident risk on main arterial road',
    location: { lat: 26.8467, lng: 80.9462, address: 'Hazratganj, Lucknow' },
    media: { before: ['https://images.unsplash.com/photo-1597069402460-a0d16df8e367?auto=format&fit=crop&w=900'], after: [] },
    aiAnalysis: { classification: 'Pothole', confidence: 0.94, severityScore: 91, riskLevel: 'CRITICAL', explanation: ['High-traffic arterial road'], duplicateOf: null },
    department: 'PWD',
    status: 'ASSIGNED',
    timeline: [{ state: 'REPORTED', timestamp: '2026-08-10T10:08:00Z' }, { state: 'ASSIGNED', timestamp: '2026-08-10T10:12:00Z' }],
    createdAt: '2026-08-10T10:08:00Z',
  },
  {
    id: 'INC-2026-002',
    citizenId: 'USR-002',
    description: 'Severe waterlogging after heavy rainfall',
    location: { lat: 26.8647, lng: 80.9982, address: 'Gomti Nagar, Lucknow' },
    media: { before: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=900'], after: [] },
    aiAnalysis: { classification: 'Waterlogging', confidence: 0.89, severityScore: 85, riskLevel: 'HIGH', explanation: ['Standing water >30cm'], duplicateOf: null },
    department: 'Municipal Corporation',
    status: 'IN_PROGRESS',
    timeline: [{ state: 'REPORTED', timestamp: '2026-08-05T14:22:00Z' }, { state: 'ASSIGNED', timestamp: '2026-08-05T14:30:00Z' }, { state: 'IN_PROGRESS', timestamp: '2026-08-06T09:00:00Z' }],
    createdAt: '2026-08-05T14:22:00Z',
  },
  {
    id: 'INC-2026-003',
    citizenId: 'USR-003',
    description: 'Pothole near school zone',
    location: { lat: 26.8347, lng: 80.9262, address: 'Alambagh, Lucknow' },
    media: { before: ['https://images.unsplash.com/photo-1581091012184-80c870ee247e?auto=format&fit=crop&w=900'], after: [] },
    aiAnalysis: { classification: 'Pothole', confidence: 0.78, severityScore: 65, riskLevel: 'MEDIUM', explanation: ['Near educational institution'], duplicateOf: null },
    department: 'PWD',
    status: 'SUBMITTED',
    timeline: [{ state: 'REPORTED', timestamp: '2026-08-12T08:15:00Z' }],
    createdAt: '2026-08-12T08:15:00Z',
  },
  {
    id: 'INC-2026-004',
    citizenId: 'USR-004',
    description: 'Waterlogging in residential area',
    location: { lat: 26.8747, lng: 81.0082, address: 'Indira Nagar, Lucknow' },
    media: { before: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=900'], after: [] },
    aiAnalysis: { classification: 'Waterlogging', confidence: 0.82, severityScore: 58, riskLevel: 'MEDIUM', explanation: ['Residential drainage issue'], duplicateOf: null },
    department: 'Municipal Corporation',
    status: 'RESOLVED',
    timeline: [{ state: 'REPORTED', timestamp: '2026-08-01T10:00:00Z' }, { state: 'ASSIGNED', timestamp: '2026-08-01T10:30:00Z' }, { state: 'IN_PROGRESS', timestamp: '2026-08-02T09:00:00Z' }, { state: 'RESOLVED', timestamp: '2026-08-03T16:00:00Z' }],
    createdAt: '2026-08-01T10:00:00Z',
  },
];

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
  REPORTED: '#3b82f6',
  ASSESSED: '#a855f7',
  ASSIGNED: '#a855f7',
};

export function AuthorityMapPage() {
  const [viewport, setViewport] = useState({
    latitude: 26.8467,
    longitude: 80.9462,
    zoom: 12,
  });
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'pothole' | 'waterlogging'>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'SUBMITTED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | 'REPORTED' | 'ASSESSED' | 'ASSIGNED'>('all');
  const [filterDepartment, setFilterDepartment] = useState<'all' | 'PWD' | 'Municipal Corporation' | 'Sanitation'>('all');
  const [showFilters, setShowFilters] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showClusters, setShowClusters] = useState(true);
  const [baseMap, setBaseMap] = useState<'streets' | 'satellite' | 'dark'>('streets');

  const baseMapStyles = {
    streets: 'https://demotiles.maplibre.org/style.json',
    satellite: 'https://api.maptiler.com/maps/satellite/style.json?key=demo',
    dark: 'https://demotiles.maplibre.org/style.json',
  };

  const filteredIncidents = mockIncidents.filter(incident => {
    if (filterType !== 'all' && incident.aiAnalysis.classification.toLowerCase() !== filterType) return false;
    if (filterSeverity !== 'all' && incident.aiAnalysis.riskLevel !== filterSeverity) return false;
    if (filterStatus !== 'all' && incident.status !== filterStatus) return false;
    if (filterDepartment !== 'all' && incident.department !== filterDepartment) return false;
    return true;
  });

  const handleViewportChange = (e: { viewState: typeof viewport }) => {
    setViewport(e.viewState);
  };

  const MarkerComponent = ({ incident, isSelected }: { incident: Incident; isSelected: boolean }) => (
    <div className={`custom-marker ${isSelected ? 'selected' : ''}`}>
      <button
        className="marker-button"
        style={{ backgroundColor: severityColors[incident.aiAnalysis.riskLevel] }}
        onClick={() => setSelectedIncident(incident)}
        aria-label={`View ${incident.id}`}
      >
        {incident.aiAnalysis.classification === 'Pothole' && <AlertCircle size={16} />}
        {incident.aiAnalysis.classification === 'Waterlogging' && <Info size={16} />}
      </button>
      {isSelected && <div className="marker-pulse" style={{ borderColor: severityColors[incident.aiAnalysis.riskLevel] }} />}
    </div>
  );

  const getStatusInfo = (status: string) => {
    const configs: Record<string, { label: string }> = {
      REPORTED: { label: 'Reported' },
      SUBMITTED: { label: 'Submitted' },
      ASSESSED: { label: 'Assessed' },
      ASSIGNED: { label: 'Assigned' },
      IN_PROGRESS: { label: 'In Progress' },
      RESOLVED: { label: 'Resolved' },
      REJECTED: { label: 'Rejected' },
    };
    return configs[status] || { label: status };
  };

  return (
    <div className="page authority-page map-page">
      <header className="page-header">
        <div>
          <h1>Incident Map</h1>
          <p className="muted">Geospatial view of all civic incidents</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} /> {showFilters ? 'Hide' : 'Show'} Filters
          </button>
          <button className="btn btn-outline" onClick={() => setShowHeatmap(!showHeatmap)}>
            <Layers size={18} /> {showHeatmap ? 'Hide' : 'Show'} Heatmap
          </button>
          <button className="btn btn-primary">
            <Download size={18} /> Export View
          </button>
        </div>
      </header>

      {showFilters && (
        <div className="filters-panel authority-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label>Issue Type</label>
              <select className="select" value={filterType} onChange={e => setFilterType(e.target.value as any)}>
                <option value="all">All Types</option>
                <option value="pothole">Pothole</option>
                <option value="waterlogging">Waterlogging</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Severity</label>
              <select className="select" value={filterSeverity} onChange={e => setFilterSeverity(e.target.value as any)}>
                <option value="all">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Status</label>
              <select className="select" value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}>
                <option value="all">All Status</option>
                <option value="REPORTED">Reported</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="ASSESSED">Assessed</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Department</label>
              <select className="select" value={filterDepartment} onChange={e => setFilterDepartment(e.target.value as any)}>
                <option value="all">All Departments</option>
                <option value="PWD">Public Works Dept</option>
                <option value="Municipal Corporation">Municipal Corp</option>
                <option value="Sanitation">Sanitation Dept</option>
              </select>
            </div>
          </div>
          <div className="map-options">
            <label className="option-toggle">
              <input type="checkbox" checked={showClusters} onChange={e => setShowClusters(e.target.checked)} />
              <span>Cluster Markers</span>
            </label>
            <label className="option-toggle">
              <input type="checkbox" checked={showHeatmap} onChange={e => setShowHeatmap(e.target.checked)} />
              <span>Heatmap Layer</span>
            </label>
            <div className="filter-group" style={{ minWidth: '150px' }}>
              <label>Base Map</label>
              <select className="select" value={baseMap} onChange={e => setBaseMap(e.target.value as any)}>
                <option value="streets">Streets</option>
                <option value="satellite">Satellite</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="map-container">
        <Map
          initialViewState={viewport}
          onMove={handleViewportChange}
          mapStyle={baseMapStyles[baseMap]}
        >
          <NavigationControl position="top-right" />
          {filteredIncidents.map(incident => (
            <Marker key={incident.id} longitude={incident.location.lng} latitude={incident.location.lat}>
              <MarkerComponent incident={incident} isSelected={selectedIncident?.id === incident.id} />
            </Marker>
          ))}
          {selectedIncident && (
            <Popup
              longitude={selectedIncident.location.lng}
              latitude={selectedIncident.location.lat}
              onClose={() => setSelectedIncident(null)}
              anchor="top"
              offset={20}
              closeButton={false}
            >
              <div className="incident-popup authority-popup">
                <div className="popup-header">
                  <h4>{selectedIncident.id}</h4>
                  <span className="severity-badge" style={{ backgroundColor: `${severityColors[selectedIncident.aiAnalysis.riskLevel]}20`, color: severityColors[selectedIncident.aiAnalysis.riskLevel] }}>
                    {selectedIncident.aiAnalysis.riskLevel}
                  </span>
                </div>
                <p className="popup-type">
                  <AlertCircle size={14} /> {selectedIncident.aiAnalysis.classification}
                  <span className="confidence">{(selectedIncident.aiAnalysis.confidence * 100).toFixed(0)}%</span>
                </p>
                <p className="popup-location">
                  <MapPin size={14} /> {selectedIncident.location.address}
                </p>
                <div className="popup-meta">
                  <div className="meta-item">
                    <span className="meta-label">Status</span>
                    <span className="meta-value">
                      <span className="status-dot" style={{ backgroundColor: statusColors[selectedIncident.status] }} />
                      {getStatusInfo(selectedIncident.status).label}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Department</span>
                    <span className="meta-value">{selectedIncident.department}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Score</span>
                    <span className="meta-value">{selectedIncident.aiAnalysis.severityScore}/100</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Reported</span>
                    <span className="meta-value">{new Date(selectedIncident.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="popup-actions">
                  <button className="btn btn-primary btn-sm"><Eye size={14} /> View Details</button>
                  <button className="btn btn-outline btn-sm"><Edit size={14} /> Assign</button>
                </div>
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
            <span className="stat-label">Visible Incidents</span>
          </div>
          <div className="stat">
            <span className="stat-value">{filteredIncidents.filter(i => i.aiAnalysis.riskLevel === 'CRITICAL').length}</span>
            <span className="stat-label">Critical</span>
          </div>
          <div className="stat">
            <span className="stat-value">{filteredIncidents.filter(i => i.status === 'RESOLVED').length}</span>
            <span className="stat-label">Resolved</span>
          </div>
          <div className="stat">
            <span className="stat-value">{new Set(filteredIncidents.map(i => i.department)).size}</span>
            <span className="stat-label">Departments</span>
          </div>
        </div>
      </div>
    </div>
  );
}