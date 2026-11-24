import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Guards & Layout
import { ProtectedRoute, AdminRoute, PermissionRoute } from './routes/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PendingApproval from './pages/auth/PendingApproval';

// Admin Pages
import Overview from './pages/admin/Overview';
import PendingRequests from './pages/admin/PendingRequests';
import Employees from './pages/admin/Employees';
import RolesPermissions from './pages/admin/RolesPermissions';
import AuditLogs from './pages/admin/AuditLogs';

// Resource & Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import Profile from './pages/employee/Profile';
import ProjectResources from './pages/employee/ProjectResources';
import SalesResources from './pages/employee/SalesResources';

// Root redirect component
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'Admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pending-approval" element={<PendingApproval />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              {/* Admin Portal Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<Overview />} />
                <Route path="/admin/requests" element={<PendingRequests />} />
                <Route path="/admin/employees" element={<Employees />} />
                <Route path="/admin/roles-permissions" element={<RolesPermissions />} />
                <Route path="/admin/audit-logs" element={<AuditLogs />} />
                <Route path="/admin/projects" element={<ProjectResources />} />
                <Route path="/admin/sales" element={<SalesResources />} />
              </Route>

              {/* Employee Portal Routes */}
              <Route path="/dashboard" element={<EmployeeDashboard />} />
              <Route path="/profile" element={<Profile />} />

              {/* Independent Section Routes Protected by Permission Guard */}
              <Route element={<PermissionRoute permission="projects" />}>
                <Route path="/projects" element={<ProjectResources />} />
              </Route>

              <Route element={<PermissionRoute permission="sales" />}>
                <Route path="/sales" element={<SalesResources />} />
              </Route>
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;