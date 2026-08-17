import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Search,
  Filter,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  PlusCircle,
  X,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LeafletMap } from '../../components/common/LeafletMap';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export function HistoryPage() {
  const { token } = useAuth();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);

  useEffect(() => {
    async function fetchIncidents() {
      try {
        const res = await fetch(`${API_URL}/incidents/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setIncidents(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchIncidents();
  }, [token]);

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      (inc.type && inc.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inc.address && inc.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inc.id && inc.id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="page-header-row">
        <div className="page-title-group">
          <h1>
            <ClipboardList size={24} color="#06b6d4" />
            <span>My Submitted Incident Reports</span>
          </h1>
          <p>Track live municipal triage, department dispatch, and resolution verification for your reports.</p>
        </div>

        <div className="page-header-actions">
          <Link to="/report" className="btn btn-cyan">
            <PlusCircle size={16} />
            <span>Report New Hazard</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-left-controls">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon-inside" />
            <input
              type="text"
              className="search-input-field"
              placeholder="Search by ID, issue or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {['ALL', 'REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
            <button
              key={status}
              type="button"
              className={`filter-pill-btn ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredIncidents.length}</strong> of <strong>{incidents.length}</strong> reports
        </div>
      </div>

      {/* Incidents Table / Cards */}
      <div className="enterprise-card" style={{ padding: '0' }}>
        {loading ? (
          <div className="loading-state-container">
            <div className="pulse-dot" style={{ width: '12px', height: '12px' }} />
            <span>Loading submissions from database...</span>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="empty-state-container">
            <ClipboardList className="empty-state-icon" />
            <div className="empty-state-title">No Incident Records Found</div>
            <p className="empty-state-desc">
              {searchTerm || statusFilter !== 'ALL'
                ? 'Try adjusting your search query or status filter.'
                : 'You have not submitted any civic reports yet. Report a pothole or flood to get started!'}
            </p>
          </div>
        ) : (
          <div className="table-responsive-wrapper" style={{ border: 'none', borderRadius: '0' }}>
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Incident ID</th>
                  <th>Category</th>
                  <th>Geospatial Location</th>
                  <th>Severity Score</th>
                  <th>Target Department</th>
                  <th>Resolution Status</th>
                  <th>Filed Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncidents.map((inc) => (
                  <tr key={inc.id}>
                    <td className="table-id-cell">
                      {inc.id.slice(0, 8)}...
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, textTransform: 'capitalize' }}>
                        <span>{inc.type?.toLowerCase().includes('water') ? '🌊' : '🕳️'}</span>
                        <span>{inc.type}</span>
                      </div>
                    </td>
                    <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}>
                        <MapPin size={13} color="#06b6d4" style={{ minWidth: '13px' }} />
                        <span title={inc.address}>{inc.address || `${inc.latitude?.toFixed(4)}, ${inc.longitude?.toFixed(4)}`}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${inc.severity >= 80 ? 'badge-critical' : inc.severity >= 50 ? 'badge-high' : 'badge-low'}`}>
                        {inc.severity}/100 {inc.severity >= 80 ? 'Critical' : inc.severity >= 50 ? 'High' : 'Moderate'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {inc.department || 'Public Works (PWD)'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${inc.status === 'RESOLVED' ? 'badge-status-resolved' : inc.status === 'IN_PROGRESS' ? 'badge-status-inprogress' : 'badge-status-reported'}`}>
                        <div className="badge-dot" />
                        <span>{inc.status || 'REPORTED'}</span>
                      </span>
                    </td>
                    <td className="table-date-cell">
                      {new Date(inc.created_at || Date.now()).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedIncident(inc)}
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Slide-over Modal */}
      {selectedIncident && (
        <div className="modal-backdrop-overlay" onClick={() => setSelectedIncident(null)}>
          <div className="modal-dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="modal-title">Incident Audit Ref: {selectedIncident.id}</span>
                <span className={`badge ${selectedIncident.status === 'RESOLVED' ? 'badge-status-resolved' : 'badge-status-reported'}`}>
                  {selectedIncident.status}
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedIncident(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Category and Severity Banner */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Type</div>
                  <div style={{ fontWeight: 700, fontSize: '14px', textTransform: 'capitalize', color: 'var(--text-main)', marginTop: '2px' }}>
                    {selectedIncident.type}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Severity Rating</div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: selectedIncident.severity >= 80 ? '#f87171' : '#38bdf8', marginTop: '2px' }}>
                    {selectedIncident.severity}/100 ({selectedIncident.risk_level || 'ELEVATED'})
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Assigned Division</div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--accent-cyan)', marginTop: '2px' }}>
                    {selectedIncident.department || 'Public Works (PWD)'}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Citizen Hazard Description</div>
                <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '13px' }}>
                  {selectedIncident.description || 'No detailed description recorded.'}
                </div>
              </div>

              {/* Mini Map Location */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  📍 {selectedIncident.address} ({selectedIncident.latitude?.toFixed(4)}, {selectedIncident.longitude?.toFixed(4)})
                </div>
                <div style={{ height: '180px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <LeafletMap
                    center={[selectedIncident.latitude || 28.6139, selectedIncident.longitude || 77.2090]}
                    zoom={15}
                    height="180px"
                    markers={[
                      {
                        id: selectedIncident.id,
                        latitude: selectedIncident.latitude || 28.6139,
                        longitude: selectedIncident.longitude || 77.2090,
                        type: selectedIncident.type,
                        severity: selectedIncident.severity,
                        address: selectedIncident.address,
                      }
                    ]}
                  />
                </div>
              </div>

              {/* Resolution Stepper */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>Resolution Lifecycle Progress</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                  {[
                    { step: '1. Logged', done: true },
                    { step: '2. AI Assessed', done: true },
                    { step: '3. Crew Dispatched', done: selectedIncident.status === 'IN_PROGRESS' || selectedIncident.status === 'RESOLVED' },
                    { step: '4. Verified Fix', done: selectedIncident.status === 'RESOLVED' },
                  ].map((s, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 4px',
                        borderRadius: 'var(--radius-sm)',
                        background: s.done ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface)',
                        border: `1px solid ${s.done ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'}`,
                        fontSize: '11px',
                        fontWeight: 600,
                        color: s.done ? '#34d399' : 'var(--text-muted)'
                      }}
                    >
                      {s.step}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedIncident(null)}>
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}