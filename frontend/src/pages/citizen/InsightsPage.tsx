import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
  Shield,
  Zap,
  Users,
  AlertCircle
} from 'lucide-react';

export function InsightsPage() {
  const weeklyData = [
    { day: 'Mon', reports: 12, resolved: 10 },
    { day: 'Tue', reports: 19, resolved: 15 },
    { day: 'Wed', reports: 8, resolved: 8 },
    { day: 'Thu', reports: 22, resolved: 18 },
    { day: 'Fri', reports: 26, resolved: 21 },
    { day: 'Sat', reports: 14, resolved: 12 },
    { day: 'Sun', reports: 9, resolved: 8 },
  ];

  const maxVal = 30;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="page-header-row">
        <div className="page-title-group">
          <h1>
            <BarChart3 size={24} color="#06b6d4" />
            <span>Community Impact & Civic Analytics</span>
          </h1>
          <p>Macro municipal resolution velocity, neighborhood safety scores, and guardian rankings.</p>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid-4">
        <div className="metric-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">City Resolution Rate</span>
            <div className="kpi-icon-box green">
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="kpi-main-val">87.4%</div>
          <div className="kpi-bottom-row">
            <span>+4.2% from last month</span>
            <span className="kpi-trend-pill positive">Optimized</span>
          </div>
        </div>

        <div className="metric-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Avg Repair Turnaround</span>
            <div className="kpi-icon-box cyan">
              <Clock size={18} />
            </div>
          </div>
          <div className="kpi-main-val">4.6 Hours</div>
          <div className="kpi-bottom-row">
            <span>For high-severity road hazards</span>
            <span className="kpi-trend-pill positive">Fast Dispatch</span>
          </div>
        </div>

        <div className="metric-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">AI Edge Precision</span>
            <div className="kpi-icon-box blue">
              <Zap size={18} />
            </div>
          </div>
          <div className="kpi-main-val">94.8%</div>
          <div className="kpi-bottom-row">
            <span>YOLOv8 bounding box mAP</span>
            <span className="kpi-trend-pill positive">Validated</span>
          </div>
        </div>

        <div className="metric-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Active Citizen Guardians</span>
            <div className="kpi-icon-box amber">
              <Users size={18} />
            </div>
          </div>
          <div className="kpi-main-val">1,420</div>
          <div className="kpi-bottom-row">
            <span>Across 24 municipal wards</span>
            <span className="kpi-trend-pill positive">+18% Weekly</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid-split-60-40">
        {/* Weekly Incident Flow Bar Chart (Custom Clean SVG Chart) */}
        <div className="enterprise-card">
          <div className="card-header">
            <div className="card-title-block">
              <TrendingUp size={16} color="#06b6d4" />
              <span className="card-title">Weekly Inflow vs Resolution Trend</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '10px', height: '10px', background: '#06b6d4', borderRadius: '2px' }} />
                <span>Reported</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '2px' }} />
                <span>Resolved</span>
              </div>
            </div>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', padding: '0 10px 10px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
              {weeklyData.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', width: '100%', justifyContent: 'center', height: '180px' }}>
                    {/* Reported Bar */}
                    <div
                      style={{
                        width: '40%',
                        height: `${(d.reports / maxVal) * 100}%`,
                        background: 'linear-gradient(180deg, #38bdf8, #0284c7)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'var(--transition)'
                      }}
                      title={`${d.day} Reported: ${d.reports}`}
                    />
                    {/* Resolved Bar */}
                    <div
                      style={{
                        width: '40%',
                        height: `${(d.resolved / maxVal) * 100}%`,
                        background: 'linear-gradient(180deg, #34d399, #059669)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'var(--transition)'
                      }}
                      title={`${d.day} Resolved: ${d.resolved}`}
                    />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{d.day}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>Peak Hazard Filing Time: <strong>08:30 AM - 10:30 AM (Rush Hour)</strong></span>
              <span style={{ color: '#34d399', fontWeight: 600 }}>Zero SLA Breaches This Week</span>
            </div>
          </div>
        </div>

        {/* Hazard Category Breakdown & Top Wards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="enterprise-card">
            <div className="card-header">
              <span className="card-title">Hazard Class Distribution</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { name: 'Road Potholes & Asphalt Fractures', count: 64, pct: 58, color: '#38bdf8' },
                { name: 'Drainage Flooding & Waterlogging', count: 32, pct: 29, color: '#06b6d4' },
                { name: 'Debris & Waste Blockages', count: 14, pct: 13, color: '#a855f7' },
              ].map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{item.count} ({item.pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: `${item.pct}%`, height: '100%', background: item.color, borderRadius: 'var(--radius-full)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="enterprise-card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))' }}>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>Guardian Milestone Unlocked!</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Your neighborhood was awarded <strong>Top Clean Safety Corridor</strong> this quarter.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}