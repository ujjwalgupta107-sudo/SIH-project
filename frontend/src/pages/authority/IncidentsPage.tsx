import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Search,
  Filter,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Sliders,
  X,
  RefreshCw,
  Edit,
  Save,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LeafletMap } from '../../components/common/LeafletMap';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export function IncidentsPage() {
  const { token } = useAuth();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);

  // Edit / Triage State
  const [editingStatus, setEditingStatus] = useState<string>('REPORTED');
  const [editingDept, setEditingDept] = useState<string>('Public Works (PWD)');
  const [editingSeverity, setEditingSeverity] = useState<number>(70);
  const [saving, setSaving] = useState(false);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/incidents`, {
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
  };

  useEffect(() => {
    if (token) fetchIncidents();
  }, [token]);

  const openInspector = (inc: any) => {
    setSelectedIncident(inc);
    setEditingStatus(inc.status || 'REPORTED');
    setEditingDept(inc.department || 'Public Works (PWD)');
    setEditingSeverity(inc.severity ?? 65);
  };

  const handleSaveTriage = async () => {
    if (!selectedIncident) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/incidents/${selectedIncident.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: editingStatus,
          department: editingDept,
          severity: editingSeverity,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setIncidents(prev => prev.map(i => i.id === selectedIncident.id ? updated : i));
        setSelectedIncident(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      (inc.type && inc.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inc.address && inc.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inc.id && inc.id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;
    const matchesDept = deptFilter === 'ALL' || (inc.department && inc.department.includes(deptFilter));

    return matchesSearch && matchesStatus && matchesDept;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="page-header-row">
        <div className="page-title-group">
          <h1>
            <FileSpreadsheet size={24} color="#f87171" />
            <span>Incident Management & Authority Queue</span>
          </h1>
          <p>Operational triage data grid with multi-department routing, severity adjustments, and resolution tracking.</p>
        </div>

        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={fetchIncidents}>
            <RefreshCw size={14} className={loading ? 'pulse-dot' : ''} />
            <span>Refresh Queue</span>
          </button>
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
              placeholder="Search by ID, issue type, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: '160px', padding: '6px 12px', fontSize: '12px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="REPORTED">Reported</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            className="form-select"
            style={{ width: '180px', padding: '6px 12px', fontSize: '12px' }}
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            <option value="PWD">Public Works (PWD)</option>
            <option value="Drainage">Drainage Dept</option>
            <option value="Sanitation">Sanitation Dept</option>
          </select>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredIncidents.length}</strong> of <strong>{incidents.length}</strong> incidents
        </div>
      </div>

      {/* Main Table */}
      <div className="enterprise-card" style={{ padding: '0' }}>
        {loading ? (
          <div className="loading-state-container">
            <div className="pulse-dot" style={{ width: '12px', height: '12px' }} />
            <span>Loading municipal queue...</span>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="empty-state-container">
            <FileSpreadsheet className="empty-state-icon" />
            <div className="empty-state-title">No Incident Tickets Match Filters</div>
            <p className="empty-state-desc">Try resetting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="table-responsive-wrapper" style={{ border: 'none', borderRadius: '0' }}>
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Category</th>
                  <th>Geospatial Location</th>
                  <th>Severity Score</th>
                  <th>Handling Department</th>
                  <th>Status</th>
                  <th>Reported At</th>
                  <th>Actions</th>
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
                      <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
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
                        onClick={() => openInspector(inc)}
                      >
                        <Eye size={13} />
                        <span>Inspect & Triage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Authority Inspection & Triage Modal */}
      {selectedIncident && (
        <div className="modal-backdrop-overlay" onClick={() => setSelectedIncident(null)}>
          <div className="modal-dialog-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="modal-title">Triage Terminal: {selectedIncident.id}</span>
                <span className={`badge ${selectedIncident.severity >= 80 ? 'badge-critical' : 'badge-high'}`}>
                  Sev {selectedIncident.severity}
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedIncident(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Top Quick Status Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Operational Status</label>
                  <select
                    className="form-select"
                    value={editingStatus}
                    onChange={(e) => setEditingStatus(e.target.value)}
                  >
                    <option value="REPORTED">REPORTED (Triage)</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS (Crew On-site)</option>
                    <option value="RESOLVED">RESOLVED (Verified Fix)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Dispatch Department</label>
                  <select
                    className="form-select"
                    value={editingDept}
                    onChange={(e) => setEditingDept(e.target.value)}
                  >
                    <option value="Public Works Department">Public Works (PWD)</option>
                    <option value="Drainage Department">Drainage Dept</option>
                    <option value="Sanitation Department">Sanitation Dept</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Severity Rating (1-100)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="form-input"
                    value={editingSeverity}
                    onChange={(e) => setEditingSeverity(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Hazard Details */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Citizen Description</div>
                <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '13px' }}>
                  {selectedIncident.description || 'Verified via autonomous neural edge pipeline.'}
                </div>
              </div>

              {/* Mini Map */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  📍 {selectedIncident.address}
                </div>
                <div style={{ height: '160px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <LeafletMap
                    center={[selectedIncident.latitude || 28.6139, selectedIncident.longitude || 77.2090]}
                    zoom={15}
                    height="160px"
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
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedIncident(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveTriage} disabled={saving}>
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Apply Triage Updates'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}