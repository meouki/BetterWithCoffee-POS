import { createContext, useContext, useState } from 'react';

/**
 * Role Hierarchy:
 *   Master  — Full access: manage users, products, view all reports, settings
 *   Admin   — Read-only overview + reports. Cannot add/edit products or users.
 *   Cashier — POS only
 */

const AuthContext = createContext(null);

// Mock Users Database
const MOCK_USERS = [
    { id: 1, name: 'Master User', username: 'master', role: 'Master', password: 'master123' },
    { id: 2, name: 'Admin User', username: 'admin', role: 'Admin', password: 'admin123' },
    { id: 3, name: 'Cashier One', username: 'cashier1', role: 'Cashier', password: 'cashier123' },
];

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('bwc_user');
        return saved ? JSON.parse(saved) : null;
    });

    const login = async (username, password) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const user = MOCK_USERS.find(u => u.username === username && u.password === password);
        if (user) {
            const { password, ...safeUser } = user; // Don't store password in state/localStorage
            setCurrentUser(safeUser);
            localStorage.setItem('bwc_user', JSON.stringify(safeUser));
            return safeUser;
        }
        throw new Error('Invalid username or password');
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
