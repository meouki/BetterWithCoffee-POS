import { createContext, useContext, useState } from 'react';

/**
 * Role Hierarchy:
 *   Master  — Full access: manage users, products, view all reports, settings
 *   Admin   — Read-only overview + reports. Cannot add/edit products or users.
 *   Cashier — POS only
 */

const AuthContext = createContext(null);

// Simulate a logged-in user. In production this comes from the backend session.
const DEMO_USER = {
    id: 1,
    name: 'Master User',
    username: 'master',
    role: 'Master', // Change to 'Admin' or 'Cashier' to test restrictions
};

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(DEMO_USER);

    const isMaster = currentUser?.role === 'Master';
    const isAdmin = currentUser?.role === 'Admin';
    const isCashier = currentUser?.role === 'Cashier';

    // Granular permissions
    const can = {
        manageUsers: isMaster,
        manageProducts: isMaster,
        viewReports: isMaster || isAdmin,
        viewOverview: isMaster || isAdmin,
        usePOS: isMaster || isAdmin || isCashier,
    };

    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser, can, isMaster, isAdmin, isCashier }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
