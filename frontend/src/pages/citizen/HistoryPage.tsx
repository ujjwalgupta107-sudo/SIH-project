import { useState, useEffect } from 'react';
import { FileText, MapPin, AlertCircle, CheckCircle, Clock, XCircle, Filter, ChevronDown, Download, Eye } from 'lucide-react';
import { getDrafts, removeDraft, OfflineIncident } from '../../services/offlineQueue';
import { useNavigate } from 'react-router-dom';

type Status = 'DRAFT' | 'SUBMITTED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

const statusConfig: Record<Status, { icon: any; label: string; class: string }> = {
  DRAFT: { icon: FileText, label: 'Draft', class: 'status-draft' },
  SUBMITTED: { icon: Clock, label: 'Submitted', class: 'status-submitted' },
  IN_PROGRESS: { icon: AlertCircle, label: 'In Progress', class: 'status-in-progress' },
  RESOLVED: { icon: CheckCircle, label: 'Resolved', class: 'status-resolved' },
  REJECTED: { icon: XCircle, label: 'Rejected', class: 'status-rejected' },
};

interface Incident {
  id: string;
  type: string;
  severity: string;
  location: string;
  status: Status;
  date: string;
  authority: string;
  department: string;
  confidence: number;
  isDraft?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export function HistoryPage() {
  const [drafts, setDrafts] = useState<OfflineIncident[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'severity'>('date');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDrafts();
    loadIncidents();
  }, []);

  const loadDrafts = async () => {
    const data = await getDrafts();
    setDrafts(data);
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
        const mapped: Incident[] = data.map((inc: any) => ({
          id: inc.id,
          type: inc.type,
          severity: inc.risk_level,
          location: inc.address,
          status: inc.status === 'REPORTED' ? 'SUBMITTED' : inc.status as Status,
          date: inc.created_at?.split('T')[0] || '',
          authority: inc.authority || inc.department || 'Assigned',
          department: inc.department || 'Unassigned',
          confidence: inc.confidence,
        }));
        setIncidents(mapped);
      } else {
        setApiError('Could not load incidents from server.');
      }
    } catch {
      setApiError('Network error — showing offline drafts only.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDraft = async (id: string) => {
    await removeDraft(id);
    loadDrafts();
  };

  const handleViewIncident = (id: string) => {
    navigate(`/history/${id}`);
  };

  const draftIncidents: Incident[] = drafts.map(d => ({
    id: d.id.slice(0, 12),
    type: d.type.toLowerCase(),
    severity: 'MEDIUM',
    location: d.latitude && d.longitude ? `Lat: ${d.latitude.toFixed(4)}, Lng: ${d.longitude.toFixed(4)}` : 'Unknown',
    status: 'DRAFT',
    date: new Date(d.timestamp).toISOString().split('T')[0],
    authority: 'Pending',
    department: 'Pending',
    confidence: 0,
    isDraft: true,
  }));

  const filteredIncidents = [...incidents, ...draftIncidents].filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  }).sort((a, b) => {
    if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'status') return a.status.localeCompare(b.status);
    return 0;
  });

  const getStatusInfo = (status: Status) => statusConfig[status] || statusConfig.DRAFT;

  return (
    <div className="page history-page">
      <header className="page-header">
        <div>
          <h1>My Reports</h1>
          <p className="muted">Track your submitted civic issues</p>
        </div>
        <div className="header-actions">
          <select
            className="select"
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select
            className="select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            aria-label="Sort by"
          >
            <option value="date">Date (Newest)</option>
            <option value="status">Status</option>
            <option value="severity">Severity</option>
          </select>
        </div>
      </header>

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading reports...</p>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} className="empty-icon" />
          <h3>No Reports Found</h3>
          <p>{filter !== 'all' ? `No reports with status "${filter}"` : 'You haven\'t submitted any reports yet'}</p>
          {filter !== 'all' && <button className="btn btn-outline" onClick={() => setFilter('all')}>Clear Filter</button>}
        </div>
      ) : (
        <div className="incidents-table-container">
          <table className="incidents-table" role="table">
            <thead>
              <tr>
                <th>Incident ID</th>
                <th>Issue Type</th>
                <th>Severity</th>
                <th>Location</th>
                <th>Status</th>
                <th>Date</th>
                <th>Authority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.map((incident, idx) => {
                const statusInfo = getStatusInfo(incident.status);
                const StatusIcon = statusInfo.icon;
                return (
                  <tr key={`${incident.id}-${idx}`}>
                    <td className="incident-id">
                      <code>{incident.id}</code>
                      {incident.isDraft && <span className="draft-badge">DRAFT</span>}
                    </td>
                    <td>
                      <span className="issue-type">{incident.type.replace('_', ' ')}</span>
                      {incident.confidence > 0 && (
                        <span className="confidence-tag">{(incident.confidence * 100).toFixed(0)}%</span>
                      )}
                    </td>
                    <td>
                      <span className={`severity-badge ${incident.severity.toLowerCase()}`}>{incident.severity}</span>
                    </td>
                    <td>
                      <MapPin size={14} aria-hidden="true" />
                      <span>{incident.location}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${statusInfo.class}`}>
                        <StatusIcon size={14} aria-hidden="true" />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>{incident.date}</td>
                    <td>
                      <div className="authority-info">
                        <span className="authority">{incident.authority}</span>
                        <span className="department">{incident.department}</span>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {!incident.isDraft && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleViewIncident(incident.id)}
                            aria-label={`View ${incident.id}`}
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        {incident.isDraft && (
                          <>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => navigate('/report')}
                              aria-label="Complete draft"
                            >
                              Complete
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRemoveDraft(incident.id)}
                              aria-label="Delete draft"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}