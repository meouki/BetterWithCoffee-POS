import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * A wrapper for routes that require authentication.
 * Redirects to `/login` if not authenticated.
 * 
 * If `allowedRoles` is provided, restricts access to specific roles.
 */
export default function ProtectedRoute({ allowedRoles = [] }) {
    const { currentUser } = useAuth();
    const location = useLocation();

    // 1. Not logged in -> Send to Login
    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Logged in, but route restricted by role -> Send to safe default
    if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
        if (currentUser.role === 'Cashier') {
            return <Navigate to="/pos" replace />;
        }
        return <Navigate to="/dashboard/overview" replace />;
    }

    // 3. Authenticated and Authorized
    return <Outlet />;
}
