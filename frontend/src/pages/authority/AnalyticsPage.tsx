import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Users, MapPin, BarChart3, PieChart, Activity, Download, Filter } from 'lucide-react';
import { useState } from 'react';

export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const analytics = {
    overview: {
      totalIncidents: 1247,
      resolved: 987,
      inProgress: 189,
      critical: 23,
      avgResolutionTime: '2.8 days',
      slaCompliance: 87,
      citizenSatisfaction: 4.2,
    },
    byType: [
      { type: 'Pothole', count: 623, resolved: 512, avgTime: '2.1d', severity: 'HIGH' },
      { type: 'Waterlogging', count: 489, resolved: 387, avgTime: '3.5d', severity: 'CRITICAL' },
    ],
    byDepartment: [
      { dept: 'PWD', total: 623, resolved: 512, pending: 111, sla: 89 },
      { dept: 'Municipal Corp', total: 489, resolved: 387, pending: 102, sla: 82 },
      { dept: 'Sanitation', total: 135, resolved: 88, pending: 47, sla: 76 },
    ],
    monthlyTrend: [
      { month: 'Mar', reported: 180, resolved: 165, critical: 12 },
      { month: 'Apr', reported: 210, resolved: 195, critical: 8 },
      { month: 'May', reported: 245, resolved: 220, critical: 15 },
      { month: 'Jun', reported: 198, resolved: 180, critical: 5 },
      { month: 'Jul', reported: 234, resolved: 210, critical: 18 },
      { month: 'Aug', reported: 180, resolved: 158, critical: 9 },
    ],
    hotspots: [
      { area: 'Hazratganj', incidents: 45, type: 'Pothole', trend: '+12%' },
      { area: 'Gomti Nagar', incidents: 38, type: 'Waterlogging', trend: '+8%' },
      { area: 'Alambagh', incidents: 32, type: 'Pothole', trend: '-5%' },
      { area: 'Indira Nagar', incidents: 28, type: 'Waterlogging', trend: '+15%' },
      { area: 'Chowk', incidents: 24, type: 'Mixed', trend: '+3%' },
    ],
    slaBreaches: [
      { incident: 'INC-2026-045', type: 'Waterlogging', dept: 'Municipal Corp', overdue: '3 days', severity: 'CRITICAL' },
      { incident: 'INC-2026-078', type: 'Pothole', dept: 'PWD', overdue: '2 days', severity: 'HIGH' },
    ],
  };

  const maxReported = Math.max(...analytics.monthlyTrend.map(m => m.reported));
  const maxCritical = Math.max(...analytics.monthlyTrend.map(m => m.critical));

  return (
    <div className="page authority-page analytics-page">
      <header className="page-header">
        <div>
          <h1>Analytics</h1>
          <p className="muted">Operational insights and performance metrics</p>
        </div>
        <div className="header-actions">
          <select className="select" value={dateRange} onChange={e => setDateRange(e.target.value)}>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <select className="select" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}>
            <option value="all">All Departments</option>
            <option value="PWD">PWD</option>
            <option value="Municipal Corp">Municipal Corp</option>
            <option value="Sanitation">Sanitation</option>
          </select>
          <button className="btn btn-primary"><Download size={18} /> Export Report</button>
        </div>
      </header>

      <section className="kpi-section">
        <div className="kpi-grid">
          <article className="kpi-card">
            <div className="kpi-icon total"><Activity size={24} /></div>
            <div>
              <p className="kpi-value">{analytics.overview.totalIncidents.toLocaleString()}</p>
              <p className="kpi-label">Total Incidents</p>
              <p className="kpi-trend positive"><TrendingUp size={14} /> 12% vs last period</p>
            </div>
          </article>
          <article className="kpi-card">
            <div className="kpi-icon resolved"><CheckCircle size={24} /></div>
            <div>
              <p className="kpi-value">{analytics.overview.resolved.toLocaleString()}</p>
              <p className="kpi-label">Resolved</p>
              <p className="kpi-trend positive"><TrendingUp size={14} /> {analytics.overview.slaCompliance}% SLA compliance</p>
            </div>
          </article>
          <article className="kpi-card critical">
            <div className="kpi-icon critical"><AlertTriangle size={24} /></div>
            <div>
              <p className="kpi-value">{analytics.overview.critical}</p>
              <p className="kpi-label">Critical Open</p>
              <p className="kpi-trend negative"><TrendingDown size={14} /> {analytics.overview.inProgress} in progress</p>
            </div>
          </article>
          <article className="kpi-card">
            <div className="kpi-icon time"><Clock size={24} /></div>
            <div>
              <p className="kpi-value">{analytics.overview.avgResolutionTime}</p>
              <p className="kpi-label">Avg Resolution</p>
              <p className="kpi-trend positive"><TrendingDown size={14} /> 0.3 days improvement</p>
            </div>
          </article>
          <article className="kpi-card">
            <div className="kpi-icon satisfaction"><Users size={24} /></div>
            <div>
              <p className="kpi-value">{analytics.overview.citizenSatisfaction}/5</p>
              <p className="kpi-label">Citizen Satisfaction</p>
              <p className="kpi-trend positive"><TrendingUp size={14} /> Above target</p>
            </div>
          </article>
          <article className="kpi-card">
            <div className="kpi-icon sla"><BarChart3 size={24} /></div>
            <div>
              <p className="kpi-value">{analytics.overview.slaCompliance}%</p>
              <p className="kpi-label">SLA Compliance</p>
              <p className="kpi-trend positive"><TrendingUp size={14} /> Target: 85%</p>
            </div>
          </article>
        </div>
      </section>

      <div className="charts-grid">
        <section className="chart-card">
          <header className="chart-header">
            <h2>Incidents by Type</h2>
            <p className="muted">Distribution and resolution rates</p>
          </header>
          <div className="type-breakdown">
            {analytics.byType.map(item => (
              <div key={item.type} className="type-row">
                <div className="type-info">
                  <span className="type-icon">{item.type === 'Pothole' ? '🕳️' : '💧'}</span>
                  <div>
                    <span className="type-name">{item.type}</span>
                    <span className="type-severity">{item.severity} severity</span>
                  </div>
                </div>
                <div className="type-stats">
                  <div className="stat-mini">
                    <span className="stat-value">{item.count}</span>
                    <span className="stat-label">Total</span>
                  </div>
                  <div className="stat-mini">
                    <span className="stat-value resolved">{item.resolved}</span>
                    <span className="stat-label">Resolved</span>
                  </div>
                  <div className="stat-mini">
                    <span className="stat-value">{item.avgTime}</span>
                    <span className="stat-label">Avg Time</span>
                  </div>
                  <div className="progress-mini">
                    <div className="progress-bar" style={{ width: `${(item.resolved / item.count) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="chart-card">
          <header className="chart-header">
            <h2>Department Performance</h2>
            <p className="muted">SLA compliance by department</p>
          </header>
          <div className="dept-performance">
            {analytics.byDepartment.map(item => (
              <div key={item.dept} className="dept-row">
                <div className="dept-info">
                  <span className="dept-name">{item.dept}</span>
                  <span className="dept-sla">{item.sla}% SLA</span>
                </div>
                <div className="dept-bars">
                  <div className="bar-group">
                    <div className="bar total" style={{ width: '100%' }} />
                    <div className="bar resolved" style={{ width: `${(item.resolved / item.total) * 100}%` }} />
                    <div className="bar pending" style={{ width: `${(item.pending / item.total) * 100}%`, marginLeft: `${(item.resolved / item.total) * 100}%` }} />
                  </div>
                  <div className="bar-legend">
                    <span className="legend-dot resolved" /> Resolved
                    <span className="legend-dot pending" /> Pending
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="chart-card full-width">
          <header className="chart-header">
            <h2>Monthly Trend</h2>
            <p className="muted">Reported vs Resolved vs Critical</p>
          </header>
          <div className="trend-chart">
            <div className="chart-area">
              {analytics.monthlyTrend.map((item, idx) => (
                <div key={item.month} className="trend-bar-group">
                  <div className="bar-wrapper">
                    <div className="bar reported" style={{ height: `${(item.reported / maxReported) * 100}%` }} title={`${item.reported} reported`} />
                    <div className="bar resolved" style={{ height: `${(item.resolved / maxReported) * 100}%` }} title={`${item.resolved} resolved`} />
                    <div className="bar critical" style={{ height: `${(item.critical / maxCritical) * 100}%` }} title={`${item.critical} critical`} />
                  </div>
                  <span className="bar-label">{item.month}</span>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <span className="legend-item"><span className="legend-color reported" /> Reported</span>
              <span className="legend-item"><span className="legend-color resolved" /> Resolved</span>
              <span className="legend-item"><span className="legend-color critical" /> Critical</span>
            </div>
          </div>
        </section>

        <section className="chart-card">
          <header className="chart-header">
            <h2>Top Hotspots</h2>
            <p className="muted">Areas with highest incident density</p>
          </header>
          <div className="hotspots-list">
            {analytics.hotspots.map((item, idx) => (
              <div key={item.area} className="hotspot-row">
                <span className="hotspot-rank">#{idx + 1}</span>
                <div className="hotspot-info">
                  <span className="hotspot-name">{item.area}</span>
                  <span className="hotspot-type">{item.type}</span>
                </div>
                <span className="hotspot-count">{item.incidents}</span>
                <span className={`hotspot-trend ${item.trend.startsWith('+') ? 'positive' : 'negative'}`}>{item.trend}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="chart-card">
          <header className="chart-header">
            <h2>SLA Breaches</h2>
            <p className="muted">Incidents exceeding resolution timeframes</p>
          </header>
          <div className="sla-breaches">
            {analytics.slaBreaches.map(item => (
              <div key={item.incident} className="breach-row">
                <div className="breach-info">
                  <span className="breach-id">{item.incident}</span>
                  <span className="breach-type">{item.type}</span>
                </div>
                <span className="breach-dept">{item.dept}</span>
                <span className={`breach-overdue ${item.severity === 'CRITICAL' ? 'critical' : item.severity === 'HIGH' ? 'high' : ''}`}>
                  {item.severity} • {item.overdue} overdue
                </span>
                <button className="btn btn-ghost btn-sm">Escalate</button>
              </div>
            ))}
          </div>
        </section>

        <section className="chart-card full-width">
          <header className="chart-header">
            <h2>Resolution Time Distribution</h2>
            <p className="muted">Time to resolve by severity level</p>
          </header>
          <div className="resolution-distribution">
            {[
              { severity: 'CRITICAL', avg: '1.2 days', median: '0.8 days', p90: '2.5 days', color: '#ef4444' },
              { severity: 'HIGH', avg: '2.1 days', median: '1.8 days', p90: '3.8 days', color: '#f97316' },
              { severity: 'MEDIUM', avg: '4.5 days', median: '3.2 days', p90: '7.1 days', color: '#eab308' },
              { severity: 'LOW', avg: '6.8 days', median: '5.5 days', p90: '10.2 days', color: '#3b82f6' },
            ].map(item => (
              <div key={item.severity} className="dist-row">
                <span className="dist-severity" style={{ color: item.color }}>{item.severity}</span>
                <div className="dist-bar" style={{ backgroundColor: item.color }} />
                <div className="dist-stats">
                  <span>Avg: {item.avg}</span>
                  <span>Median: {item.median}</span>
                  <span>P90: {item.p90}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}