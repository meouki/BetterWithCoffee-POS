import { createContext, useContext, useState, useEffect } from 'react';
import { usersApi } from '../api/users';
import toast from 'react-hot-toast';

/**
 * Role Hierarchy:
 *   Master  — Full access: manage users, products, view all reports, settings
 *   Admin   — Read-only overview + reports. Cannot add/edit products or users.
 *   Cashier — POS only
 */

const AuthContext = createContext(null);

// Role permissions logic moved into a helper or keep here
// MOCK_USERS removed as we use the database now

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('bwc_user');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        const handleAuthError = (event) => {
            const message = event.detail?.message || 'Session invalidated.';
            toast.error(`⚠️ ${message} Your account was logged in on another device.`, {
                duration: 6000,
                id: 'auth-kickout' // Prevent duplicate toasts
            });
            logout();
        };

        window.addEventListener('pulsepoint-auth-error', handleAuthError);
        return () => window.removeEventListener('pulsepoint-auth-error', handleAuthError);
    }, []);

    const login = async (username, password) => {
        try {
            const user = await usersApi.login(username, password);
            setCurrentUser(user);
            localStorage.setItem('bwc_user', JSON.stringify(user));
            return user;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('bwc_user');
    };

    const isMaster = currentUser?.role === 'Master';
    const isAdmin = currentUser?.role === 'Admin';
    const isCashier = currentUser?.role === 'Cashier';

    // Granular permissions
    const can = {
        manageUsers: isMaster,
        manageProducts: isMaster,
        viewReports: isMaster || isAdmin,
        viewOverview: isMaster || isAdmin,
        viewOrders: isMaster || isAdmin,
        usePOS: isMaster || isAdmin || isCashier,
    };

    return (
        <AuthContext.Provider value={{
            currentUser,
            setCurrentUser,
            login,
            logout,
            can,
            isMaster,
            isAdmin,
            isCashier
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
