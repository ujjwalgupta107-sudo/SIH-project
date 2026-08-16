import { TrendingUp, TrendingDown, Target, Clock, AlertTriangle, CheckCircle, MapPin, BarChart3 } from 'lucide-react';

export function InsightsPage() {
  const insights = {
    totalReports: 47,
    reportsThisMonth: 12,
    resolvedRate: 78,
    avgResolutionTime: '3.2 days',
    topIssues: [
      { type: 'pothole', count: 28, trend: '+12%' },
      { type: 'waterlogging', count: 15, trend: '-5%' },
      { type: 'garbage_pile', count: 4, trend: '+2%' },
    ],
    severityBreakdown: [
      { level: 'CRITICAL', count: 3, color: '#ef4444' },
      { level: 'HIGH', count: 12, color: '#f97316' },
      { level: 'MEDIUM', count: 22, color: '#eab308' },
      { level: 'LOW', count: 10, color: '#3b82f6' },
    ],
    monthlyTrend: [
      { month: 'Mar', reports: 8, resolved: 6 },
      { month: 'Apr', reports: 12, resolved: 9 },
      { month: 'May', reports: 15, resolved: 11 },
      { month: 'Jun', reports: 9, resolved: 8 },
      { month: 'Jul', reports: 14, resolved: 10 },
      { month: 'Aug', reports: 12, resolved: 9 },
    ],
  };

  return (
    <div className="page insights-page">
      <header className="page-header">
        <h1>Insights</h1>
        <p className="muted">Your civic engagement analytics</p>
      </header>

      <section className="kpi-section">
        <div className="kpi-grid">
          <article className="kpi-card">
            <div className="kpi-icon total"><TrendingUp size={24} /></div>
            <div className="kpi-content">
              <p className="kpi-value">{insights.totalReports}</p>
              <p className="kpi-label">Total Reports</p>
              <p className="kpi-trend positive"><TrendingUp size={14} /> {insights.reportsThisMonth} this month</p>
            </div>
          </article>
          <article className="kpi-card">
            <div className="kpi-icon resolved"><CheckCircle size={24} /></div>
            <div className="kpi-content">
              <p className="kpi-value">{insights.resolvedRate}%</p>
              <p className="kpi-label">Resolution Rate</p>
              <p className="kpi-trend positive"><TrendingUp size={14} /> Above average</p>
            </div>
          </article>
          <article className="kpi-card">
            <div className="kpi-icon time"><Clock size={24} /></div>
            <div className="kpi-content">
              <p className="kpi-value">{insights.avgResolutionTime}</p>
              <p className="kpi-label">Avg Resolution</p>
              <p className="kpi-trend negative"><TrendingDown size={14} /> 0.3 days faster</p>
            </div>
          </article>
          <article className="kpi-card">
            <div className="kpi-icon critical"><AlertTriangle size={24} /></div>
            <div className="kpi-content">
              <p className="kpi-value">3</p>
              <p className="kpi-label">Critical Issues</p>
              <p className="kpi-trend">Active monitoring</p>
            </div>
          </article>
        </div>
      </section>

      <div className="charts-grid">
        <section className="chart-card">
          <header className="chart-header">
            <h2>Top Issue Types</h2>
            <p className="muted">Your most reported categories</p>
          </header>
          <div className="issue-types-list">
            {insights.topIssues.map(item => (
              <div key={item.type} className="issue-type-row">
                <div className="issue-type-info">
                  <span className="issue-icon">{item.type === 'pothole' ? '🕳️' : item.type === 'waterlogging' ? '💧' : '🗑️'}</span>
                  <div>
                    <span className="issue-name">{item.type.replace('_', ' ')}</span>
                    <span className="issue-count">{item.count} reports</span>
                  </div>
                </div>
                <div className="issue-trend">
                  <div className={`trend-bar ${item.trend.startsWith('+') ? 'positive' : 'negative'}`} style={{ width: `${Math.min(Math.abs(parseInt(item.trend)) * 5, 100)}%` }} />
                  <span className={`trend-value ${item.trend.startsWith('+') ? 'positive' : 'negative'}`}>{item.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="chart-card">
          <header className="chart-header">
            <h2>Severity Breakdown</h2>
            <p className="muted">Distribution of reported severity levels</p>
          </header>
          <div className="severity-breakdown">
            {insights.severityBreakdown.map(item => (
              <div key={item.level} className="severity-row">
                <div className="severity-info">
                  <span className="severity-dot" style={{ backgroundColor: item.color }} />
                  <span className="severity-name">{item.level}</span>
                </div>
                <div className="severity-bar-container">
                  <div className="severity-bar" style={{ width: `${(item.count / 47) * 100}%`, backgroundColor: item.color }} />
                </div>
                <span className="severity-count">{item.count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="chart-card full-width">
          <header className="chart-header">
            <h2>Monthly Activity</h2>
            <p className="muted">Reports vs Resolutions over time</p>
          </header>
          <div className="monthly-chart">
            <div className="chart-bars">
              {insights.monthlyTrend.map((item, idx) => (
                <div key={item.month} className="chart-bar-group">
                  <div className="bar-wrapper">
                    <div className="bar reports" style={{ height: `${(item.reports / 15) * 100}%` }} title={`${item.reports} reports`} />
                    <div className="bar resolved" style={{ height: `${(item.resolved / 15) * 100}%` }} title={`${item.resolved} resolved`} />
                  </div>
                  <span className="bar-label">{item.month}</span>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <span className="legend-item reports"><span className="legend-color" /> Reports</span>
              <span className="legend-item resolved"><span className="legend-color" /> Resolved</span>
            </div>
          </div>
        </section>
      </div>

      <section className="chart-card">
        <header className="chart-header">
          <h2>Your Impact</h2>
          <p className="muted">How your reports make a difference</p>
        </header>
        <div className="impact-grid">
          <div className="impact-item">
            <Target size={32} />
            <h3>47 Issues Reported</h3>
            <p>Helping identify infrastructure problems</p>
          </div>
          <div className="impact-item">
            <CheckCircle size={32} />
            <h3>37 Resolved</h3>
            <p>Directly contributed to fixes</p>
          </div>
          <div className="impact-item">
            <MapPin size={32} />
            <h3>12 Areas Covered</h3>
            <p>Reports across multiple neighborhoods</p>
          </div>
          <div className="impact-item">
            <BarChart3 size={32} />
            <h3>78% Success Rate</h3>
            <p>Above city average of 65%</p>
          </div>
        </div>
      </section>
    </div>
  );
}