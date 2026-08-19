import { Navigate, Route, Routes } from 'react-router-dom';
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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-ink text-muted stencil text-sm">
        LOADING SYSTEM…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="assets" element={<Assets />} />
        <Route path="assets/new" element={<AssetForm />} />
        <Route path="assets/:id" element={<AssetDetail />} />
        <Route path="assets/:id/edit" element={<AssetForm />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="audit-log" element={<AuditLog />} />
        <Route path="documents" element={<Documents />} />
        <Route path="scan" element={<Scan />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}