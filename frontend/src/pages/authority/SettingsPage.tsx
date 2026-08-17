import React, { useState } from 'react';
import {
  Sliders,
  Cpu,
  Shield,
  Bell,
  Clock,
  Save,
  CheckCircle2,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('routing');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [potholeThreshold, setPotholeThreshold] = useState(0.65);
  const [waterloggingThreshold, setWaterloggingThreshold] = useState(0.60);
  const [criticalSlaHours, setCriticalSlaHours] = useState(4);
  const [highSlaHours, setHighSlaHours] = useState(12);
  const [autoDispatchEnabled, setAutoDispatchEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="page-header-row">
        <div className="page-title-group">
          <h1>
            <Sliders size={24} color="#f87171" />
            <span>System Configuration & Operational Parameters</span>
          </h1>
          <p>Configure automated department routing rules, AI vision thresholds, and municipal SLA escalations.</p>
        </div>
      </div>

      {savedSuccess && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px'
        }}>
          <CheckCircle2 size={16} />
          <span>System configuration saved and synced across all municipal nodes!</span>
        </div>
      )}

      {/* Tabs Row */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
        {[
          { id: 'routing', label: 'Department Auto-Routing', icon: Layers },
          { id: 'ai', label: 'AI Vision Engine', icon: Cpu },
          { id: 'sla', label: 'SLA & Escalation Rules', icon: Clock },
          { id: 'notifications', label: 'Alerts & Webhooks', icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              className={`filter-pill-btn ${activeTab === tab.id ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Card */}
      <form onSubmit={handleSave} className="enterprise-card">
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeTab === 'routing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)' }}>
                Geospatial & Classification Routing Engine
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Configure which municipal authority receives auto-dispatched tickets based on AI classification tags.
              </p>

              <div className="form-group">
                <label className="form-label">Road Defect / Pothole Routing</label>
                <select className="form-select" defaultValue="PWD">
                  <option value="PWD">Public Works Department (PWD HQ)</option>
                  <option value="NHAI">National Highways Authority (NHAI)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Waterlogging & Flood Routing</label>
                <select className="form-select" defaultValue="DRN">
                  <option value="DRN">Municipal Drainage & Flood Management Division</option>
                  <option value="SAN">Sanitation & Water Works</option>
                </select>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer', marginTop: '6px' }}>
                <input
                  type="checkbox"
                  checked={autoDispatchEnabled}
                  onChange={(e) => setAutoDispatchEnabled(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#06b6d4' }}
                />
                <span>Enable Immediate Automated Dispatch for Critical Severity (&gt;80) Hazards</span>
              </label>
            </div>
          )}

          {activeTab === 'ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)' }}>
                YOLOv8 Edge Neural Network Hyperparameters
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Pothole Detection Confidence Cutoff</span>
                  <strong>{(potholeThreshold * 100).toFixed(0)}%</strong>
                </label>
                <input
                  type="range"
                  min="0.3"
                  max="0.95"
                  step="0.05"
                  value={potholeThreshold}
                  onChange={(e) => setPotholeThreshold(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#06b6d4' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Waterlogging / Flood Confidence Cutoff</span>
                  <strong>{(waterloggingThreshold * 100).toFixed(0)}%</strong>
                </label>
                <input
                  type="range"
                  min="0.3"
                  max="0.95"
                  step="0.05"
                  value={waterloggingThreshold}
                  onChange={(e) => setWaterloggingThreshold(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#06b6d4' }}
                />
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Active Weights Model: <strong>yolo26n.pt</strong> (Ultralytics PyTorch Engine) • Hardware Acceleration: <strong>CUDA / DirectML</strong>
              </div>
            </div>
          )}

          {activeTab === 'sla' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)' }}>
                Service Level Agreement (SLA) Limits
              </div>

              <div className="form-group">
                <label className="form-label">Critical Emergency Hazard SLA (Hours)</label>
                <input
                  type="number"
                  min="1"
                  max="48"
                  className="form-input"
                  value={criticalSlaHours}
                  onChange={(e) => setCriticalSlaHours(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">High Priority Hazard SLA (Hours)</label>
                <input
                  type="number"
                  min="1"
                  max="72"
                  className="form-input"
                  value={highSlaHours}
                  onChange={(e) => setHighSlaHours(Number(e.target.value))}
                />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)' }}>
                Authority Alert Broadcasts & Webhooks
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#06b6d4' }}
                />
                <span>Send Emergency Email alerts to On-Duty Division Chief</span>
              </label>

              <div className="form-group">
                <label className="form-label">Emergency Webhook URL (Slack / Teams / Municipal Portal)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://hooks.slack.com/services/..."
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>Save System Parameters</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}