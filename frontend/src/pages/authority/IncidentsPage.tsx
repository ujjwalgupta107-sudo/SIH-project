import { useState, useEffect, useRef } from 'react';
import { FileText, Filter, ChevronDown, ChevronUp, Eye, Edit, MapPin, AlertTriangle, CheckCircle, Clock, Download, MoreHorizontal, Trash2, ArrowUpDown } from 'lucide-react';
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

const statusConfig: Record<string, { icon: any; label: string; class: string }> = {
  REPORTED: { icon: FileText, label: 'Reported', class: 'status-reported' },
  SUBMITTED: { icon: FileText, label: 'Submitted', class: 'status-submitted' },
  ASSESSED: { icon: AlertTriangle, label: 'Assessed', class: 'status-assessed' },
  ASSIGNED: { icon: CheckCircle, label: 'Assigned', class: 'status-assigned' },
  IN_PROGRESS: { icon: Clock, label: 'In Progress', class: 'status-in-progress' },
  RESOLVED: { icon: CheckCircle, label: 'Resolved', class: 'status-resolved' },
  REJECTED: { icon: AlertTriangle, label: 'Rejected', class: 'status-rejected' },
};

const severityColors: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#3b82f6',
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    department: 'all',
    status: 'all',
    severity: 'all',
    type: 'all',
    dateRange: '30d',
  });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });
  const [selectedIncidents, setSelectedIncidents] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [bulkAction, setBulkAction] = useState<'assign' | 'status' | 'export' | ''>('');
  const selectAllRef = useRef<HTMLInputElement>(null);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredIncidents = incidents
    .filter(i => {
      if (filters.search && !i.id.toLowerCase().includes(filters.search.toLowerCase()) &&
        !i.description.toLowerCase().includes(filters.search.toLowerCase()) &&
        !i.location.address.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.department !== 'all' && i.department !== filters.department) return false;
      if (filters.status !== 'all' && i.status !== filters.status) return false;
      if (filters.severity !== 'all' && i.aiAnalysis.riskLevel !== filters.severity) return false;
      if (filters.type !== 'all' && i.aiAnalysis.classification.toLowerCase() !== filters.type) return false;
      return true;
    })
    .sort((a, b) => {
      let aVal = a[sortConfig.key as keyof Incident];
      let bVal = b[sortConfig.key as keyof Incident];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
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
        } else {
          setApiError('Failed to load incidents');
        }
      } catch (err) {
        setApiError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedIncidents.length > 0 && selectedIncidents.length < filteredIncidents.length;
    }
  }, [selectedIncidents, filteredIncidents.length]);

  const toggleSelect = (id: string) => {
    setSelectedIncidents(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIncidents.length === filteredIncidents.length) {
      setSelectedIncidents([]);
    } else {
      setSelectedIncidents(filteredIncidents.map(i => i.id));
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedIncidents.length === 0) return;
    alert(`Bulk ${bulkAction} for ${selectedIncidents.length} incidents`);
    setSelectedIncidents([]);
    setBulkAction('');
  };

  const getStatusInfo = (status: string) => statusConfig[status] || statusConfig.REPORTED;

  return (
    <div className="page authority-page incidents-page">
      <header className="page-header">
        <div>
          <h1>Incidents</h1>
          <p className="muted">Manage and triage civic incidents</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} /> {showFilters ? 'Hide' : 'Show'} Filters
          </button>
          <button className="btn btn-primary">
            <Download size={18} /> Export
          </button>
        </div>
      </header>

      {showFilters && (
        <div className="filters-bar">
          <div className="filter-group search-group">
            <input
              type="text"
              className="input"
              placeholder="Search incidents..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>
          <div className="filter-group">
            <select className="select" value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}>
              <option value="all">All Departments</option>
              <option value="PWD">Public Works Dept</option>
              <option value="Municipal Corporation">Municipal Corp</option>
              <option value="Sanitation">Sanitation Dept</option>
            </select>
          </div>
          <div className="filter-group">
            <select className="select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
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
            <select className="select" value={filters.severity} onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))}>
              <option value="all">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div className="filter-group">
            <select className="select" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
              <option value="all">All Types</option>
              <option value="pothole">Pothole</option>
              <option value="waterlogging">Waterlogging</option>
            </select>
          </div>
        </div>
      )}

      {selectedIncidents.length > 0 && (
        <div className="bulk-actions-bar">
          <span>{selectedIncidents.length} selected</span>
          <select className="select" value={bulkAction} onChange={e => setBulkAction(e.target.value as any)}>
            <option value="">Bulk Action</option>
            <option value="assign">Assign Department</option>
            <option value="status">Update Status</option>
            <option value="export">Export Selected</option>
          </select>
          <button className="btn btn-primary" onClick={handleBulkAction} disabled={!bulkAction}>Apply</button>
          <button className="btn btn-ghost" onClick={() => setSelectedIncidents([])}>Clear</button>
        </div>
      )}

      <div className="table-container">
        <table className="incidents-table" role="table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={selectedIncidents.length === filteredIncidents.length && filteredIncidents.length > 0}
                  onChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </th>
              <th onClick={() => handleSort('id')}>
                Incident ID <ArrowUpDown size={14} className={sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''} />
              </th>
              <th onClick={() => handleSort('aiAnalysis.classification')}>
                Type <ArrowUpDown size={14} className={sortConfig.key === 'aiAnalysis.classification' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''} />
              </th>
              <th onClick={() => handleSort('aiAnalysis.riskLevel')}>
                Severity <ArrowUpDown size={14} className={sortConfig.key === 'aiAnalysis.riskLevel' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''} />
              </th>
              <th onClick={() => handleSort('location.address')}>
                Location <ArrowUpDown size={14} className={sortConfig.key === 'location.address' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''} />
              </th>
              <th onClick={() => handleSort('status')}>
                Status <ArrowUpDown size={14} className={sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''} />
              </th>
              <th onClick={() => handleSort('department')}>
                Department <ArrowUpDown size={14} className={sortConfig.key === 'department' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''} />
              </th>
              <th onClick={() => handleSort('createdAt')}>
                Reported <ArrowUpDown size={14} className={sortConfig.key === 'createdAt' ? (sortConfig.direction === 'asc' ? 'asc' : 'desc') : ''} />
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncidents.map(incident => {
              const statusInfo = getStatusInfo(incident.status);
              const StatusIcon = statusInfo.icon;
              return (
                <tr key={incident.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIncidents.includes(incident.id)}
                      onChange={() => toggleSelect(incident.id)}
                      aria-label={`Select ${incident.id}`}
                    />
                  </td>
                  <td className="incident-id"><code>{incident.id}</code></td>
                  <td>
                    <span className="issue-type">{incident.aiAnalysis.classification}</span>
                    <span className="confidence-tag">{(incident.aiAnalysis.confidence * 100).toFixed(0)}%</span>
                  </td>
                  <td>
                    <span className="severity-badge" style={{ backgroundColor: `${severityColors[incident.aiAnalysis.riskLevel]}20`, color: severityColors[incident.aiAnalysis.riskLevel] }}>
                      {incident.aiAnalysis.riskLevel}
                    </span>
                  </td>
                  <td>
                    <MapPin size={14} aria-hidden="true" />
                    <span>{incident.location.address}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${statusInfo.class}`}>
                      <StatusIcon size={14} aria-hidden="true" />
                      {statusInfo.label}
                    </span>
                  </td>
                  <td>{incident.department}</td>
                  <td>{new Date(incident.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-ghost btn-sm" aria-label={`View ${incident.id}`}><Eye size={16} /></button>
                      <button className="btn btn-ghost btn-sm" aria-label={`Edit ${incident.id}`}><Edit size={16} /></button>
                      <button className="btn btn-ghost btn-sm" aria-label={`Map ${incident.id}`}><MapPin size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredIncidents.length === 0 && (
        <div className="empty-state">
          <FileText size={48} className="empty-icon" />
          <h3>No Incidents Found</h3>
          <p>Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  );
}