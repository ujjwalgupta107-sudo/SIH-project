import { useState } from 'react';
import { User, Shield, Mail, Lock, Settings, Bell, LogOut, Edit2, Save, X, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: true,
    push: true,
    statusUpdates: true,
    assignments: true,
    resolutions: true,
    weeklyDigest: false,
  });

  const handleSaveProfile = () => {
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setFormData({ name: user?.name || '', email: user?.email || '', phone: '', address: '' });
    setEditing(false);
  };

  const handlePasswordChange = () => {
    if (passwordData.new !== passwordData.confirm) {
      alert('Passwords do not match');
      return;
    }
    if (passwordData.new.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="page profile-page">
      <header className="page-header">
        <h1>Profile</h1>
        <p className="muted">Manage your account settings</p>
      </header>

      <div className="profile-layout">
        <aside className="profile-sidebar">
          <div className="profile-header">
            <div className="avatar-large">
              {formData.name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2>{formData.name || user?.name || 'Citizen'}</h2>
            <p className="user-email">{user?.email}</p>
            <span className="role-badge citizen">Citizen</span>
          </div>
          <nav className="profile-nav">
            <button
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={20} /> Profile
            </button>
            <button
              className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Lock size={20} /> Security
            </button>
            <button
              className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell size={20} /> Notifications
            </button>
          </nav>
          <div className="profile-danger-zone">
            <button className="btn btn-danger btn-full" onClick={handleLogout}>
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        </aside>

        <main className="profile-main">
          {activeTab === 'profile' && (
            <section className="profile-section">
              <header className="section-header">
                <h2>Personal Information</h2>
                <p className="muted">Manage your profile details</p>
              </header>
              <form className="profile-form" onSubmit={e => { e.preventDefault(); handleSaveProfile(); }}>
                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="avatar" className="input-label">Profile Photo</label>
                    <div className="avatar-upload">
                      <div className="avatar-preview">
                        {formData.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <label className="btn btn-outline" htmlFor="avatar">
                        <Camera size={18} /> Change Photo
                      </label>
                      <input type="file" id="avatar" accept="image/*" style={{ display: 'none' }} />
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="name" className="input-label">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      className="input"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      disabled={!editing}
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="email" className="input-label">Email</label>
                    <input
                      type="email"
                      id="email"
                      className="input"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      disabled={true}
                    />
                    <p className="input-helper">Email cannot be changed</p>
                  </div>
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="phone" className="input-label">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      className="input"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!editing}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="address" className="input-label">Address</label>
                    <textarea
                      id="address"
                      className="textarea"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      disabled={!editing}
                      rows={3}
                      placeholder="Your residential address for better service routing"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  {editing ? (
                    <>
                      <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                        <X size={18} /> Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        <Save size={18} /> Save Changes
                      </button>
                    </>
                  ) : (
                    <button type="button" className="btn btn-primary" onClick={() => setEditing(true)}>
                      <Edit2 size={18} /> Edit Profile
                    </button>
                  )}
                </div>
              </form>
            </section>
          )}

          {activeTab === 'security' && (
            <section className="profile-section">
              <header className="section-header">
                <h2>Security Settings</h2>
                <p className="muted">Manage your password and security preferences</p>
              </header>
              <div className="security-card">
                <h3>Change Password</h3>
                <form className="security-form" onSubmit={e => { e.preventDefault(); handlePasswordChange(); }}>
                  <div className="input-group">
                    <label htmlFor="currentPassword" className="input-label">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      className="input"
                      value={passwordData.current}
                      onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="newPassword" className="input-label">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      className="input"
                      value={passwordData.new}
                      onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                    />
                    <p className="input-helper">Minimum 8 characters</p>
                  </div>
                  <div className="input-group">
                    <label htmlFor="confirmPassword" className="input-label">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      className="input"
                      value={passwordData.confirm}
                      onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      <Save size={18} /> Update Password
                    </button>
                  </div>
                </form>
              </div>
              <div className="security-card">
                <h3>Active Sessions</h3>
                <p className="muted">Manage your logged-in devices</p>
                <div className="session-list">
                  <div className="session-item current">
                    <div className="session-info">
                      <span className="session-device">Current Device</span>
                      <span className="session-location">Chrome on Windows • Lucknow, IN</span>
                    </div>
                    <span className="session-badge current">Active</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'notifications' && (
            <section className="profile-section">
              <header className="section-header">
                <h2>Notification Preferences</h2>
                <p className="muted">Choose how you want to be notified</p>
              </header>
              <div className="notification-prefs">
                <div className="pref-group">
                  <h3>Delivery Methods</h3>
                  <label className="pref-toggle">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.email}
                      onChange={e => setNotificationPrefs({ ...notificationPrefs, email: e.target.checked })}
                    />
                    <span className="toggle-slider" />
                    <div className="pref-info">
                      <Mail size={20} />
                      <div>
                        <span className="pref-title">Email Notifications</span>
                        <span className="pref-desc">Receive updates via email</span>
                      </div>
                    </div>
                  </label>
                  <label className="pref-toggle">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.push}
                      onChange={e => setNotificationPrefs({ ...notificationPrefs, push: e.target.checked })}
                    />
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
                  <h3>Notification Types</h3>
                  {[
                    { key: 'statusUpdates', title: 'Status Updates', desc: 'When your report status changes' },
                    { key: 'assignments', title: 'Assignments', desc: 'When your report is assigned to a department' },
                    { key: 'resolutions', title: 'Resolutions', desc: 'When your reported issue is resolved' },
                    { key: 'weeklyDigest', title: 'Weekly Digest', desc: 'Summary of civic activity in your area' },
                  ].map(item => (
                    <label key={item.key} className="pref-toggle">
                      <input
                        type="checkbox"
                        checked={notificationPrefs[item.key as keyof typeof notificationPrefs]}
                        onChange={e => setNotificationPrefs({ ...notificationPrefs, [item.key]: e.target.checked })}
                      />
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
              </div>
            </section>
          )}

          <div className="account-info">
            <h3>Account Information</h3>
            <dl className="info-list">
              <dt>Role</dt>
              <dd><span className="role-badge citizen">Citizen</span></dd>
              <dt>Member Since</dt>
              <dd>August 2026</dd>
              <dt>Reports Submitted</dt>
              <dd>47</dd>
              <dt>Resolution Rate</dt>
              <dd>78%</dd>
            </dl>
          </div>
        </main>
      </div>
    </div>
  );
}