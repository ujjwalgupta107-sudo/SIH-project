import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  CheckCircle,
  Clock,
  AlertTriangle,
  Award,
  Download,
  Calendar,
  Layers,
  Zap
} from 'lucide-react';

export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30D');

  const departmentData = [
    { name: 'Public Works (PWD)', active: 18, resolved: 84, sla: '96.2%', color: '#38bdf8' },
    { name: 'Drainage Department', active: 9, resolved: 52, sla: '94.8%', color: '#06b6d4' },
    { name: 'Sanitation Department', active: 6, resolved: 38, sla: '98.1%', color: '#a855f7' },
  ];

  const resolutionDistribution = [
    { label: '< 2 Hours (Emergency)', count: 42, pct: 38, color: '#10b981' },
    { label: '2 - 6 Hours (High Priority)', count: 48, pct: 44, color: '#38bdf8' },
    { label: '6 - 24 Hours (Standard)', count: 16, pct: 15, color: '#f59e0b' },
    { label: '> 24 Hours (Complex Repair)', count: 4, pct: 3, color: '#ef4444' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="page-header-row">
        <div className="page-title-group">
          <h1>
            <TrendingUp size={24} color="#f87171" />
            <span>Executive Municipal Operations Analytics</span>
          </h1>
          <p>Macro performance metrics, department SLA adherence, MTTR distributions, and AI precision telemetry.</p>
        </div>

        <div className="page-header-actions">
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-surface)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            {['7D', '30D', '90D', 'YTD'].map((r) => (
              <button
                key={r}
                type="button"
                className={`filter-pill-btn ${dateRange === r ? 'active' : ''}`}
                style={{ padding: '4px 10px', fontSize: '11.5px' }}
                onClick={() => setDateRange(r)}
              >
                {r}
              </button>
            ))}
          </div>

          <button className="btn btn-secondary btn-sm" onClick={() => alert('Exporting Municipal Report CSV...')}>
            <Download size={14} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Top 4 Performance Cards */}
      <div className="grid-4">
        <div className="metric-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">SLA Compliance Rate</span>
            <div className="kpi-icon-box green">
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="kpi-main-val">96.4%</div>
          <div className="kpi-bottom-row">
            <span>Target: &gt;95.0%</span>
            <span className="kpi-trend-pill positive">+1.8% vs Target</span>
          </div>
        </div>

        <div className="metric-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Mean Time to Resolve (MTTR)</span>
            <div className="kpi-icon-box cyan">
              <Clock size={18} />
            </div>
          </div>
          <div className="kpi-main-val">3.4 Hours</div>
          <div className="kpi-bottom-row">
            <span>Reduced by 48 mins</span>
            <span className="kpi-trend-pill positive">Faster Triage</span>
          </div>
        </div>

        <div className="metric-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Total Hazardous Fixed</span>
            <div className="kpi-icon-box blue">
              <Layers size={18} />
            </div>
          </div>
          <div className="kpi-main-val">174</div>
          <div className="kpi-bottom-row">
            <span>In current period ({dateRange})</span>
            <span className="kpi-trend-pill positive">+14% Volume</span>
          </div>
        </div>

        <div className="metric-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">AI False Positive Rate</span>
            <div className="kpi-icon-box amber">
              <Zap size={18} />
            </div>
          </div>
          <div className="kpi-main-val">2.8%</div>
          <div className="kpi-bottom-row">
            <span>YOLOv8 autonomous filter</span>
            <span className="kpi-trend-pill positive">Ultra Low</span>
          </div>
        </div>
      </div>

      {/* Main Split Charts */}
      <div className="grid-split-60-40">
        {/* Department SLA & Workload Scorecard */}
        <div className="enterprise-card">
          <div className="card-header">
            <div className="card-title-block">
              <BarChart3 size={16} color="#06b6d4" />
              <span className="card-title">Department Workload & SLA Compliance</span>
            </div>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {departmentData.map((dept, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>{dept.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Active: <strong>{dept.active}</strong> • Resolved: <strong>{dept.resolved}</strong>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>SLA Score</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#34d399' }}>{dept.sla}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${(dept.resolved / (dept.resolved + dept.active)) * 100}%`,
                      height: '100%',
                      background: dept.color,
                      borderRadius: 'var(--radius-full)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution Time Distribution */}
        <div className="enterprise-card">
          <div className="card-header">
            <div className="card-title-block">
              <PieChart size={16} color="#a855f7" />
              <span className="card-title">Resolution Velocity Distribution</span>
            </div>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {resolutionDistribution.map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.label}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{item.count} tickets ({item.pct}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ width: `${item.pct}%`, height: '100%', background: item.color, borderRadius: 'var(--radius-full)' }} />
                </div>
              </div>
            ))}

            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle size={16} />
              <span>82% of all critical infrastructure hazards are repaired within 6 hours.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}