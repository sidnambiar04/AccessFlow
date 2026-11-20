import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// 1. Base Authentication & Account Status Guard
export const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Account status enforcement
    if (user.status === 'pending') {
        return <Navigate to="/pending-approval" replace />;
    }

    if (user.status === 'rejected' || user.status === 'suspended') {
        return <Navigate to="/account-status" replace />;
    }

    return <Outlet />;
};

// 2. Admin-Only Route Guard
export const AdminRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return null;

    if (user?.role !== 'Admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

// 3. Independent Permission Guard (projects / sales)
export const PermissionRoute = ({ permission }) => {
    const { user, loading } = useAuth();

    if (loading) return null;

    // Admin always has access
    if (user?.role === 'Admin') {
        return <Outlet />;
    }

    // Check section permission
    if (!user?.permissions?.[permission]) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};