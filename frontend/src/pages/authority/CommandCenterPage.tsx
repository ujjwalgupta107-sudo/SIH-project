import { useState, useEffect } from 'react';
import { Activity, FileText, MapPin, TrendingUp, AlertTriangle, CheckCircle, Clock, Users, RefreshCw, Filter, Settings, Map, BarChart3, Layers } from 'lucide-react';
import { IncidentMap } from '../../features/command-center/map/IncidentMap';
import type { Incident } from '../../shared/contracts';

const fallbackIncidents: Incident[] = [
  {
    id: 'INC-2026-001',
    citizenId: 'USR-001',
    description: 'Large pothole creating accident risk on main arterial road',
    location: { lat: 26.8467, lng: 80.9462, address: 'Hazratganj, Lucknow' },
    media: { before: ['https://images.unsplash.com/photo-1597069402460-a0d16df8e367?auto=format&fit=crop&w=900'], after: [] },
    aiAnalysis: { classification: 'Pothole', confidence: 0.94, severityScore: 91, riskLevel: 'CRITICAL', explanation: ['High-traffic arterial road', 'Deep cavity detected'], duplicateOf: null },
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
    aiAnalysis: { classification: 'Waterlogging', confidence: 0.89, severityScore: 85, riskLevel: 'HIGH', explanation: ['Standing water >30cm', 'Drainage blockage suspected'], duplicateOf: null },
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
    aiAnalysis: { classification: 'Pothole', confidence: 0.78, severityScore: 65, riskLevel: 'MEDIUM', explanation: ['Near educational institution', 'Moderate depth'], duplicateOf: null },
    department: 'PWD',
    status: 'SUBMITTED',
    timeline: [{ state: 'REPORTED', timestamp: '2026-08-12T08:15:00Z' }],
    createdAt: '2026-08-12T08:15:00Z',
  },
];

const badge = (level: string) => (
  <span className={`badge ${level.toLowerCase()}`}>
    <span className="badge-dot" style={{ backgroundColor: getSeverityColor(level) }} />
    {level}
  </span>
);

const getSeverityColor = (level: string) => {
  const colors: Record<string, string> = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#3b82f6',
  };
  return colors[level] || '#64748b';
};

const getStatusConfig = (status: string) => {
  const configs: Record<string, { icon: any; label: string; class: string }> = {
    REPORTED: { icon: FileText, label: 'Reported', class: 'status-reported' },
    SUBMITTED: { icon: FileText, label: 'Submitted', class: 'status-submitted' },
    ASSESSED: { icon: AlertTriangle, label: 'Assessed', class: 'status-assessed' },
    ASSIGNED: { icon: Users, label: 'Assigned', class: 'status-assigned' },
    IN_PROGRESS: { icon: Clock, label: 'In Progress', class: 'status-in-progress' },
    RESOLVED: { icon: CheckCircle, label: 'Resolved', class: 'status-resolved' },
    REJECTED: { icon: AlertTriangle, label: 'Rejected', class: 'status-rejected' },
  };
  return configs[status] || configs.REPORTED;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export function CommandCenterPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selected, setSelected] = useState<Incident | null>(null);
  const [heat, setHeat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    department: 'all',
    status: 'all',
    severity: 'all',
    dateRange: '7d',
  });

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { setLoading(false); setApiError('Not authenticated'); return; }
        const res = await fetch(`${API_URL}/incidents`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setApiError(null);
          const mapped = data.map((d: any) => ({
            id: d.id,
            citizenId: d.citizen_id || 'unknown',
            description: d.description,
            location: { lat: d.latitude, lng: d.longitude, address: d.address },
            media: { before: [], after: [] },
            aiAnalysis: {
              classification: d.type || 'Unknown',
              confidence: d.confidence || 0,
              severityScore: d.severity || 0,
              riskLevel: d.risk_level || 'LOW',
              explanation: [],
              duplicateOf: null,
            },
            department: d.department || 'Unassigned',
            status: d.status || 'REPORTED',
            timeline: [],
            createdAt: d.created_at,
          }));
          setIncidents(mapped);
          if (!selected || !mapped.find((m: Incident) => m.id === selected.id)) {
            setSelected(mapped[0] || null);
          }
        } else {
          setApiError('Failed to load incidents from server.');
        }
      } catch (err) {
        console.error('Polling failed:', err);
        setApiError('Network error — could not reach server.');
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 15000);
    return () => clearInterval(interval);
  }, [selected]);

  const filteredIncidents = incidents.filter(i => {
    if (filters.department !== 'all' && i.department !== filters.department) return false;
    if (filters.status !== 'all' && i.status !== filters.status) return false;
    if (filters.severity !== 'all' && i.aiAnalysis.riskLevel !== filters.severity) return false;
    return true;
  });

  const stats = {
    total: incidents.length,
    critical: incidents.filter(i => i.aiAnalysis.riskLevel === 'CRITICAL').length,
    inProgress: incidents.filter(i => i.status === 'IN_PROGRESS' || i.status === 'ASSIGNED').length,
    resolved: incidents.filter(i => i.status === 'RESOLVED').length,
    resolutionRate: incidents.length ? Math.round((incidents.filter(i => i.status === 'RESOLVED').length / incidents.length) * 100) : 0,
  };

  return (
    <div className="cc-page">
      <header className="cc-header">
        <div className="header-left">
          <Activity className="logo-icon" size={32} />
          <div>
            <p className="eyebrow">LUCKNOW MUNICIPAL OPERATIONS</p>
            <h1>City Command Center</h1>
          </div>
        </div>
        <div className="header-right">
          <button className="btn btn-outline" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1000); }}>
            <RefreshCw size={18} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <div className="operator">
            <span>OP</span> A. Sharma
          </div>
        </div>
      </header>

      <section className="kpis">
        <article className="kpi">
          <div className="kpi-icon total"><Activity size={24} /></div>
          <div>
            <h3>Active Incidents</h3>
            <b>{stats.total}</b>
            <span>↓ 12% vs last week</span>
          </div>
        </article>
        <article className="kpi critical">
          <div className="kpi-icon critical"><AlertTriangle size={24} /></div>
          <div>
            <h3>Critical</h3>
            <b>{stats.critical}</b>
            <span>Needs immediate triage</span>
          </div>
        </article>
        <article className="kpi">
          <div className="kpi-icon progress"><Clock size={24} /></div>
          <div>
            <h3>In Progress</h3>
            <b>{stats.inProgress}</b>
            <span>Active assignments</span>
          </div>
        </article>
        <article className="kpi">
          <div className="kpi-icon resolved"><CheckCircle size={24} /></div>
          <div>
            <h3>Resolution Rate</h3>
            <b>{stats.resolutionRate}%</b>
            <span>↑ 4.8% this month</span>
          </div>
        </article>
      </section>

      <div className="cc-ops">
        <aside className="cc-filters">
          <div className="panel-title">
            <b>Operational Filters</b>
            <Filter size={18} />
          </div>
          <div className="filter-group">
            <label htmlFor="dept-filter">Department</label>
            <select id="dept-filter" className="select" value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}>
              <option value="all">All Departments</option>
              <option value="PWD">Public Works Dept</option>
              <option value="Municipal Corporation">Municipal Corp</option>
              <option value="Sanitation">Sanitation Dept</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="status-filter">Status</label>
            <select id="status-filter" className="select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="all">All Status</option>
              <option value="REPORTED">Reported</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="ASSESSED">Assessed</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="severity-filter">Severity</label>
            <select id="severity-filter" className="select" value={filters.severity} onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))}>
              <option value="all">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="range-filter">Date Range</label>
            <select id="range-filter" className="select" value={filters.dateRange} onChange={e => setFilters(f => ({ ...f, dateRange: e.target.value }))}>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </aside>

        <section className="cc-map">
          <div className="map-head">
            <span><MapPin size={18} /> Live Operational Map</span>
            <button onClick={() => setHeat(!heat)} className={heat ? 'on' : ''}>
              <Layers size={18} /> Risk Layer
            </button>
          </div>
          <IncidentMap incidents={filteredIncidents} onSelect={setSelected} showPredictions={heat} />
        </section>

        <aside className="cc-intel">
          {selected && (
            <>
              <div className="panel-title">
                <div>
                  <p className="eyebrow">INCIDENT {selected.id}</p>
                  <h2>{selected.aiAnalysis.classification}</h2>
                </div>
                {badge(selected.aiAnalysis.riskLevel)}
              </div>
              <img src={selected.media.before[0]} alt="Original incident evidence" className="incident-image" />
              <div className="incident-meta">
                <div className="meta-row">
                  <span className="meta-label">Confidence</span>
                  <span className="meta-value">{(selected.aiAnalysis.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Severity Score</span>
                  <span className="meta-value">{selected.aiAnalysis.severityScore}/100</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Department</span>
                  <span className="meta-value">{selected.department}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Location</span>
                  <span className="meta-value">{selected.location.address}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Coordinates</span>
                  <span className="meta-value">{selected.location.lat.toFixed(6)}, {selected.location.lng.toFixed(6)}</span>
                </div>
              </div>
              <div className="ai-explanation">
                <h4>AI Analysis</h4>
                <ul>
                  {selected.aiAnalysis.explanation.map((exp, i) => (
                    <li key={i}>{exp}</li>
                  ))}
                </ul>
              </div>
              <div className="timeline">
                <h4>Timeline</h4>
                {selected.timeline.map((event, i) => {
                  const StatusIcon = getStatusConfig(event.state).icon;
                  return (
                    <div key={i} className="timeline-event">
                      <StatusIcon size={16} className={getStatusConfig(event.state).class} />
                      <div>
                        <span className="timeline-state">{event.state.replace('_', ' ')}</span>
                        <span className="timeline-time">{new Date(event.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="actions">
                <button className="btn btn-primary">Assign</button>
                <button className="btn btn-outline">Escalate</button>
                <button className="btn btn-outline">View Details</button>
              </div>
            </>
          )}
          {!selected && (
            <div className="no-selection">
              <FileText size={48} />
              <p>Select an incident from the map or list</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}