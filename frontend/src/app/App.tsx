import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginPage } from '../components/auth/LoginPage';
import { CitizenLayout } from '../components/layout/CitizenLayout';
import { AuthorityLayout } from '../components/layout/AuthorityLayout';
import { HomePage } from '../pages/citizen/HomePage';
import { ReportPage } from '../pages/citizen/ReportPage';
import { LiveDetectionPage } from '../pages/citizen/LiveDetectionPage';
import { HistoryPage } from '../pages/citizen/HistoryPage';
import { MapPage } from '../pages/citizen/MapPage';
import { InsightsPage } from '../pages/citizen/InsightsPage';
import { ProfilePage } from '../pages/citizen/ProfilePage';
import { CommandCenterPage } from '../pages/authority/CommandCenterPage';
import { IncidentsPage } from '../pages/authority/IncidentsPage';
import { AuthorityMapPage } from '../pages/authority/MapPage';
import { AnalyticsPage } from '../pages/authority/AnalyticsPage';
import { SettingsPage } from '../pages/authority/SettingsPage';

function CitizenRouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="loading-screen" role="status"><div className="spinner" /><p>Loading...</p></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'CITIZEN') {
    return <Navigate to="/command-center" replace />;
  }

  return <>{children}</>;
}

function AuthorityRouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="loading-screen" role="status"><div className="spinner" /><p>Loading...</p></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'AUTHORITY' && user?.role !== 'ADMIN') {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}

function PublicRouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading-screen" role="status"><div className="spinner" /><p>Loading...</p></div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export function App() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen" role="status" aria-label="Initializing application">
        <div className="spinner" />
        <p>Initializing CivicShield...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRouteGuard>
            <LoginPage />
          </PublicRouteGuard>
        }
      />

      <Route
        element={
          <CitizenRouteGuard>
            <CitizenLayout />
          </CitizenRouteGuard>
        }
      >
        <Route path="/home" element={<HomePage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/live-detection" element={<LiveDetectionPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
      </Route>

      <Route
        element={
          <AuthorityRouteGuard>
            <AuthorityLayout />
          </AuthorityRouteGuard>
        }
      >
        <Route path="/command-center" element={<CommandCenterPage />} />
        <Route path="/command-center/incidents" element={<IncidentsPage />} />
        <Route path="/command-center/map" element={<AuthorityMapPage />} />
        <Route path="/command-center/analytics" element={<AnalyticsPage />} />
        <Route path="/command-center/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}