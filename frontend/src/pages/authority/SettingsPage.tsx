import { useState } from 'react';
import { User, Shield, Bell, Mail, Lock, Database, Globe, Palette, Key, Save, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'appearance' | 'integrations'>('general');
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'integrations', label: 'Integrations', icon: Globe },
  ];

  const [settings, setSettings] = useState({
    general: {
      organizationName: 'Lucknow Municipal Corporation',
      timezone: 'Asia/Kolkata',
      language: 'en',
      dateFormat: 'DD/MM/YYYY',
      autoAssign: true,
      slaHours: 48,
      escalationHours: 24,
    },
    notifications: {
      emailEnabled: true,
      pushEnabled: true,
      newIncidentEmail: true,
      assignmentEmail: true,
      resolutionEmail: true,
      slaBreachEmail: true,
      dailyDigest: true,
      weeklyReport: false,
    },
    security: {
      twoFA: false,
      sessionTimeout: 60,
      passwordExpiry: 90,
      ipWhitelist: '',
      auditLogRetention: 365,
    },
    appearance: {
      theme: 'dark',
      mapStyle: 'dark',
      density: 'comfortable',
      animations: true,
      reducedMotion: false,
    },
    integrations: {
      emailProvider: 'smtp',
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPass: '',
      webhookUrl: '',
      apiKey: '',
    },
  });

  const handleSave = async (section: string) => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
  };

  return (
    <div className="page authority-page settings-page">
      <header className="page-header">
        <h1>Settings</h1>
        <p className="muted">Configure your command center preferences</p>
      </header>

      <div className="settings-layout">
        <nav className="settings-nav">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id as any)}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <main className="settings-main">
          {activeTab === 'general' && (
            <section className="settings-section">
              <header className="section-header">
                <h2>General Settings</h2>
                <p className="muted">Basic configuration for your command center</p>
              </header>
              <form className="settings-form" onSubmit={e => { e.preventDefault(); handleSave('general'); }}>
                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="orgName" className="input-label">Organization Name</label>
                    <input type="text" id="orgName" className="input" value={settings.general.organizationName} onChange={e => setSettings(s => ({ ...s, general: { ...s.general, organizationName: e.target.value } }))} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="timezone" className="input-label">Timezone</label>
                    <select id="timezone" className="select" value={settings.general.timezone} onChange={e => setSettings(s => ({ ...s, general: { ...s.general, timezone: e.target.value } }))}>
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label htmlFor="language" className="input-label">Language</label>
                    <select id="language" className="select" value={settings.general.language} onChange={e => setSettings(s => ({ ...s, general: { ...s.general, language: e.target.value } }))}>
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="dateFormat" className="input-label">Date Format</label>
                    <select id="dateFormat" className="select" value={settings.general.dateFormat} onChange={e => setSettings(s => ({ ...s, general: { ...s.general, dateFormat: e.target.value } }))}>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="slaHours" className="input-label">Default SLA (hours)</label>
                    <input type="number" id="slaHours" className="input" value={settings.general.slaHours} onChange={e => setSettings(s => ({ ...s, general: { ...s.general, slaHours: Number(e.target.value) } }))} min={1} max={168} />
                  </div>
                  <div className="input-group">
                    <label htmlFor="escalationHours" className="input-label">Escalation Threshold (hours)</label>
                    <input type="number" id="escalationHours" className="input" value={settings.general.escalationHours} onChange={e => setSettings(s => ({ ...s, general: { ...s.general, escalationHours: Number(e.target.value) } }))} min={1} max={72} />
                  </div>
                </div>
                <div className="form-row">
                  <label className="toggle-label">
                    <input type="checkbox" checked={settings.general.autoAssign} onChange={e => setSettings(s => ({ ...s, general: { ...s.general, autoAssign: e.target.checked } }))} />
                    <span className="toggle-slider" />
                    <div>
                      <span className="toggle-title">Auto-assign incidents</span>
                      <span className="toggle-desc">Automatically assign incidents to departments based on AI classification</span>
                    </div>
                  </label>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save General Settings'}
                  </button>
                </div>
              </form>
            </section>
          )}

          {activeTab === 'notifications' && (
            <section className="settings-section">
              <header className="section-header">
                <h2>Notification Preferences</h2>
                <p className="muted">Configure how and when you receive alerts</p>
              </header>
              <form className="settings-form" onSubmit={e => { e.preventDefault(); handleSave('notifications'); }}>
                <div className="pref-group">
                  <h3>Delivery Methods</h3>
                  <label className="pref-toggle">
                    <input type="checkbox" checked={settings.notifications.emailEnabled} onChange={e => setSettings(s => ({ ...s, notifications: { ...s.notifications, emailEnabled: e.target.checked } }))} />
                    <span className="toggle-slider" />
                    <div className="pref-info">
                      <Mail size={20} />
                      <div>
                        <span className="pref-title">Email Notifications</span>
                        <span className="pref-desc">Receive notifications via email</span>
                      </div>
                    </div>
                  </label>
                  <label className="pref-toggle">
                    <input type="checkbox" checked={settings.notifications.pushEnabled} onChange={e => setSettings(s => ({ ...s, notifications: { ...s.notifications, pushEnabled: e.target.checked } }))} />
                    <span className="toggle-slider" />
                    <div className="pref-info">
                      <Bell size={20} />
                      <div>
                        <span className="pref-title">Push Notifications</span>
                        <span className="pref-desc">Browser notifications when online</span>
                      </div>
                    </div>
                  </label>
                </div>
                <div className="pref-group">
                  <h3>Notification Triggers</h3>
                  {[
                    { key: 'newIncidentEmail', title: 'New Incident', desc: 'When a new incident is reported' },
                    { key: 'assignmentEmail', title: 'Assignment', desc: 'When an incident is assigned to you/your department' },
                    { key: 'resolutionEmail', title: 'Resolution', desc: 'When an incident is marked as resolved' },
                    { key: 'slaBreachEmail', title: 'SLA Breach', desc: 'When an incident exceeds SLA timeframe' },
                  ].map(item => (
                    <label key={item.key} className="pref-toggle">
                      <input type="checkbox" checked={settings.notifications[item.key as keyof typeof settings.notifications]} onChange={e => setSettings(s => ({ ...s, notifications: { ...s.notifications, [item.key]: e.target.checked } }))} />
                      <span className="toggle-slider" />
                      <div className="pref-info">
                        <div>
                          <span className="pref-title">{item.title}</span>
                          <span className="pref-desc">{item.desc}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="pref-group">
                  <h3>Digest Reports</h3>
                  <label className="pref-toggle">
                    <input type="checkbox" checked={settings.notifications.dailyDigest} onChange={e => setSettings(s => ({ ...s, notifications: { ...s.notifications, dailyDigest: e.target.checked } }))} />
                    <span className="toggle-slider" />
                    <div className="pref-info">
                      <div>
                        <span className="pref-title">Daily Digest</span>
                        <span className="pref-desc">Summary of daily activity every morning</span>
                      </div>
                    </div>
                  </label>
                  <label className="pref-toggle">
                    <input type="checkbox" checked={settings.notifications.weeklyReport} onChange={e => setSettings(s => ({ ...s, notifications: { ...s.notifications, weeklyReport: e.target.checked } }))} />
                    <span className="toggle-slider" />
                    <div className="pref-info">
                      <div>
                        <span className="pref-title">Weekly Report</span>
                        <span className="pref-desc">Comprehensive weekly analytics report</span>
                      </div>
                    </div>
                  </label>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Notification Settings'}
                  </button>
                </div>
              </form>
            </section>
          )}

          {activeTab === 'security' && (
            <section className="settings-section">
              <header className="section-header">
                <h2>Security Settings</h2>
                <p className="muted">Manage authentication and access control</p>
              </header>
              <form className="settings-form" onSubmit={e => { e.preventDefault(); handleSave('security'); }}>
                <div className="pref-group">
                  <h3>Authentication</h3>
                  <label className="pref-toggle">
                    <input type="checkbox" checked={settings.security.twoFA} onChange={e => setSettings(s => ({ ...s, security: { ...s.security, twoFA: e.target.checked } }))} />
                    <span className="toggle-slider" />
                    <div className="pref-info">
                      <Shield size={20} />
                      <div>
                        <span className="pref-title">Two-Factor Authentication</span>
                        <span className="pref-desc">Require 2FA for all authority accounts</span>
                      </div>
                    </div>
                  </label>
                </div>
                <div className="pref-group">
                  <h3>Session Management</h3>
                  <div className="form-row">
                    <div className="input-group">
                      <label htmlFor="sessionTimeout" className="input-label">Session Timeout (minutes)</label>
                      <input type="number" id="sessionTimeout" className="input" value={settings.security.sessionTimeout} onChange={e => setSettings(s => ({ ...s, security: { ...s.security, sessionTimeout: Number(e.target.value) } }))} min={5} max={480} />
                    </div>
                    <div className="input-group">
                      <label htmlFor="passwordExpiry" className="input-label">Password Expiry (days)</label>
                      <input type="number" id="passwordExpiry" className="input" value={settings.security.passwordExpiry} onChange={e => setSettings(s => ({ ...s, security: { ...s.security, passwordExpiry: Number(e.target.value) } }))} min={30} max={365} />
                    </div>
                  </div>
                </div>
                <div className="pref-group">
                  <h3>Access Control</h3>
                  <div className="input-group">
                    <label htmlFor="ipWhitelist" className="input-label">IP Whitelist (CIDR notation, comma-separated)</label>
                    <textarea id="ipWhitelist" className="textarea" value={settings.security.ipWhitelist} onChange={e => setSettings(s => ({ ...s, security: { ...s.security, ipWhitelist: e.target.value } }))} rows={3} placeholder="192.168.1.0/24, 10.0.0.0/8" />
                    <p className="input-helper">Leave empty to allow all IPs</p>
                  </div>
                </div>
                <div className="pref-group">
                  <h3>Audit & Compliance</h3>
                  <div className="input-group">
                    <label htmlFor="auditLogRetention" className="input-label">Audit Log Retention (days)</label>
                    <input type="number" id="auditLogRetention" className="input" value={settings.security.auditLogRetention} onChange={e => setSettings(s => ({ ...s, security: { ...s.security, auditLogRetention: Number(e.target.value) } }))} min={30} max={2555} />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Security Settings'}
                  </button>
                </div>
              </form>
            </section>
          )}

          {activeTab === 'appearance' && (
            <section className="settings-section">
              <header className="section-header">
                <h2>Appearance</h2>
                <p className="muted">Customize the look and feel</p>
              </header>
              <form className="settings-form" onSubmit={e => { e.preventDefault(); handleSave('appearance'); }}>
                <div className="pref-group">
                  <h3>Theme</h3>
                  <div className="theme-options">
                    {['dark', 'light', 'system'].map(theme => (
                      <label key={theme} className={`theme-option ${settings.appearance.theme === theme ? 'selected' : ''}`}>
                        <input type="radio" name="theme" value={theme} checked={settings.appearance.theme === theme} onChange={e => setSettings(s => ({ ...s, appearance: { ...s.appearance, theme: e.target.value } }))} />
                        <div className="theme-preview">
                          <div className={`theme-color ${theme}`} />
                        </div>
                        <span className="theme-name">{theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="pref-group">
                  <h3>Map Style</h3>
                  <select className="select" value={settings.appearance.mapStyle} onChange={e => setSettings(s => ({ ...s, appearance: { ...s.appearance, mapStyle: e.target.value } }))}>
                    <option value="dark">Dark</option>
                    <option value="streets">Streets</option>
                    <option value="satellite">Satellite</option>
                    <option value="light">Light</option>
                  </select>
                </div>
                <div className="pref-group">
                  <h3>Interface Density</h3>
                  <select className="select" value={settings.appearance.density} onChange={e => setSettings(s => ({ ...s, appearance: { ...s.appearance, density: e.target.value } }))}>
                    <option value="compact">Compact</option>
                    <option value="comfortable">Comfortable</option>
                    <option value="spacious">Spacious</option>
                  </select>
                </div>
                <div className="pref-group">
                  <h3>Accessibility</h3>
                  <label className="pref-toggle">
                    <input type="checkbox" checked={settings.appearance.animations} onChange={e => setSettings(s => ({ ...s, appearance: { ...s.appearance, animations: e.target.checked } }))} />
                    <span className="toggle-slider" />
                    <div className="pref-info">
                      <div>
                        <span className="pref-title">Animations</span>
                        <span className="pref-desc">Enable UI transitions and animations</span>
                      </div>
                    </div>
                  </label>
                  <label className="pref-toggle">
                    <input type="checkbox" checked={settings.appearance.reducedMotion} onChange={e => setSettings(s => ({ ...s, appearance: { ...s.appearance, reducedMotion: e.target.checked } }))} />
                    <span className="toggle-slider" />
                    <div className="pref-info">
                      <div>
                        <span className="pref-title">Reduced Motion</span>
                        <span className="pref-desc">Respect system prefers-reduced-motion setting</span>
                      </div>
                    </div>
                  </label>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Appearance Settings'}
                  </button>
                </div>
              </form>
            </section>
          )}

          {activeTab === 'integrations' && (
            <section className="settings-section">
              <header className="section-header">
                <h2>Integrations</h2>
                <p className="muted">Configure external service connections</p>
              </header>
              <form className="settings-form" onSubmit={e => { e.preventDefault(); handleSave('integrations'); }}>
                <div className="pref-group">
                  <h3>Email Service</h3>
                  <select className="select" value={settings.integrations.emailProvider} onChange={e => setSettings(s => ({ ...s, integrations: { ...s.integrations, emailProvider: e.target.value } }))}>
                    <option value="smtp">SMTP</option>
                    <option value="sendgrid">SendGrid</option>
                    <option value="resend">Resend</option>
                    <option value="mailgun">Mailgun</option>
                  </select>
                  <div className="form-row">
                    <div className="input-group">
                      <label htmlFor="smtpHost" className="input-label">SMTP Host</label>
                      <input type="text" id="smtpHost" className="input" value={settings.integrations.smtpHost} onChange={e => setSettings(s => ({ ...s, integrations: { ...s.integrations, smtpHost: e.target.value } }))} placeholder="smtp.example.com" />
                    </div>
                    <div className="input-group">
                      <label htmlFor="smtpPort" className="input-label">Port</label>
                      <input type="number" id="smtpPort" className="input" value={settings.integrations.smtpPort} onChange={e => setSettings(s => ({ ...s, integrations: { ...s.integrations, smtpPort: Number(e.target.value) } }))} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="input-group">
                      <label htmlFor="smtpUser" className="input-label">Username</label>
                      <input type="text" id="smtpUser" className="input" value={settings.integrations.smtpUser} onChange={e => setSettings(s => ({ ...s, integrations: { ...s.integrations, smtpUser: e.target.value } }))} />
                    </div>
                    <div className="input-group">
                      <label htmlFor="smtpPass" className="input-label">Password</label>
                      <input type="password" id="smtpPass" className="input" value={settings.integrations.smtpPass} onChange={e => setSettings(s => ({ ...s, integrations: { ...s.integrations, smtpPass: e.target.value } }))} />
                    </div>
                  </div>
                </div>
                <div className="pref-group">
                  <h3>Webhooks</h3>
                  <div className="input-group">
                    <label htmlFor="webhookUrl" className="input-label">Webhook URL</label>
                    <input type="url" id="webhookUrl" className="input" value={settings.integrations.webhookUrl} onChange={e => setSettings(s => ({ ...s, integrations: { ...s.integrations, webhookUrl: e.target.value } }))} placeholder="https://your-app.com/webhook" />
                    <p className="input-helper">Receive real-time incident updates</p>
                  </div>
                </div>
                <div className="pref-group">
                  <h3>API Access</h3>
                  <div className="input-group">
                    <label htmlFor="apiKey" className="input-label">API Key</label>
                    <div className="input-wrapper">
                      <input type="password" id="apiKey" className="input" value={settings.integrations.apiKey} onChange={e => setSettings(s => ({ ...s, integrations: { ...s.integrations, apiKey: e.target.value } }))} placeholder="••••••••••••••••" />
                      <button type="button" className="icon-button"><Key size={20} /></button>
                    </div>
                    <p className="input-helper">Used for external system integration</p>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Integration Settings'}
                  </button>
                </div>
              </form>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}