import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <div className="loading-screen">Authenticating...</div>; // Simple loading
    }

    if (!currentUser) {
        return <Navigate to="/admin/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        // Redirect to a generic authorized page or home if role doesn't match
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
