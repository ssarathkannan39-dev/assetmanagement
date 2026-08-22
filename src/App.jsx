import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Assets from './pages/Assets.jsx';
import AssetDetail from './pages/AssetDetail.jsx';
import AssetForm from './pages/AssetForm.jsx';
import Assignments from './pages/Assignments.jsx';
import Maintenance from './pages/Maintenance.jsx';
import AuditLog from './pages/AuditLog.jsx';     
import Scan from './pages/Scan.jsx';
import Documents from './components/Documents.jsx';
import Accessories from './pages/Accessories.jsx';
import Consumables from './pages/Consumables.jsx';
import Licenses from './pages/Licenses.jsx';
import Profile from './pages/Profile.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import Reports from './pages/Reports.jsx';
import Requirements from './pages/Requirements.jsx';
import SuperDashboard from './pages/SuperDashboard.jsx';
import RequestableItems from './pages/RequestableItems.jsx';
import ResourcePage from './pages/ResourcePage.jsx';
import Import from './pages/Import.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg)] text-accent stencil text-sm">
        Loading workspace...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function hasMenuAccess(user, accessKey) {
  if (!user) return false;
  if (user.role === 'superadmin') return true;
  return Array.isArray(user.menuAccess) ? user.menuAccess.includes(accessKey) : false;
}

function MenuAccessRoute({ children, accessKey }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg)] text-accent stencil text-sm">
        Loading workspace...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!hasMenuAccess(user, accessKey)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();   

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg)] text-accent stencil text-sm">
        Loading workspace...
      </div>
    );
  }

  return user ? <Navigate to="/" replace /> : children;
}

function HomeRoute() {
  const { user } = useAuth();
  if (user?.role === 'asset_user') return <Navigate to="/my-assets" replace />;
  return <Dashboard />;
}

function SuperOnlyRoute() {
  const { user } = useAuth();
  return user?.role === 'superadmin' ? <SuperDashboard /> : <Navigate to="/" replace />;
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="text-center">
        <div className="stencil text-5xl font-bold text-accent">404</div>
        <h1 className="stencil mt-4 text-lg uppercase tracking-widest text-ink">Page not found</h1>
        <p className="mt-2 text-sm text-muted">The requested asset portal page does not exist.</p>
        <Link to="/" className="btn-primary mt-6 inline-block">
          Return to dashboard
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomeRoute />} />
        <Route path="assets" element={<MenuAccessRoute accessKey="all-assets"><Assets /></MenuAccessRoute>} />
        <Route path="assets/new" element={<MenuAccessRoute accessKey="add-asset"><AssetForm /></MenuAccessRoute>} />
        <Route path="assets/:id/edit" element={<MenuAccessRoute accessKey="add-asset"><AssetForm /></MenuAccessRoute>} />
        <Route path="assets/:id" element={<ProtectedRoute><AssetDetail /></ProtectedRoute>} />
        <Route path="assignments" element={<MenuAccessRoute accessKey="assignments"><Assignments /></MenuAccessRoute>} />
        <Route path="maintenance" element={<MenuAccessRoute accessKey="maintenance"><Maintenance /></MenuAccessRoute>} />
        <Route path="accessories" element={<MenuAccessRoute accessKey="accessories"><Accessories /></MenuAccessRoute>} />
        <Route path="consumables" element={<MenuAccessRoute accessKey="consumables"><Consumables /></MenuAccessRoute>} />
        <Route path="licenses" element={<MenuAccessRoute accessKey="licenses"><Licenses /></MenuAccessRoute>} />
        <Route path="profile" element={<Profile />} />
        <Route path="my-assets" element={<MenuAccessRoute accessKey="my-assets"><UserDashboard /></MenuAccessRoute>} />
        <Route path="requestable-items" element={<MenuAccessRoute accessKey="requestable-items"><RequestableItems /></MenuAccessRoute>} />
        <Route path="super-dashboard" element={<SuperOnlyRoute />} />
        <Route path="reports" element={<MenuAccessRoute accessKey="reports"><Reports /></MenuAccessRoute>} />
        <Route path="requirements" element={<MenuAccessRoute accessKey="requirements"><Requirements /></MenuAccessRoute>} />
        <Route path="audit-log" element={<MenuAccessRoute accessKey="audit-log"><AuditLog /></MenuAccessRoute>} />
        <Route path="documents" element={<MenuAccessRoute accessKey="documents"><Documents /></MenuAccessRoute>} />
        <Route path="scan" element={<MenuAccessRoute accessKey="scan-asset"><Scan /></MenuAccessRoute>} />
        <Route path="components" element={<MenuAccessRoute accessKey="components"><ResourcePage kind="components" /></MenuAccessRoute>} />
        <Route path="kits" element={<MenuAccessRoute accessKey="kits"><ResourcePage kind="kits" /></MenuAccessRoute>} />
        <Route path="import" element={<MenuAccessRoute accessKey="import"><Import /></MenuAccessRoute>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}