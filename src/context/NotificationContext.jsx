import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationsApi } from '../api/notifications';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [logs, setLogs] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { currentUser } = useAuth();

    // Initial fetch function
    const fetchLogs = useCallback(async () => {
        const fetchedLogs = await notificationsApi.getAll();
        if (fetchedLogs.length > 0) {
            setLogs(fetchedLogs);
        }
    }, []);

    // Load logs on mount
    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // Optional: Auto-poll if we want the dashboard to update silently (e.g. every 30s)
    useEffect(() => {
        // Only pool if user is Master or Admin
        if (currentUser?.role === 'Master' || currentUser?.role === 'Admin') {
            const interval = setInterval(() => {
                fetchLogs();
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [fetchLogs, currentUser]);

    /**
     * @param {string} type 'SALE' | 'MENU_EDIT' | 'ALERT'
     * @param {string} message summary string
     * @param {string} details extended data
     */
    const addNotification = useCallback(async (type, message, details = "") => {
        const actorName = currentUser?.name || 'Unknown Staff';

        // Send to backend text file
        await notificationsApi.add({ type, message, details, cashier: actorName });

        // Optimistically add to UI list and bump unread count
        const newLog = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            type,
            message,
            details,
            cashier: actorName
        };

        setLogs(prev => [newLog, ...prev]);
        setUnreadCount(prev => prev + 1);
    }, []);

    const markAllRead = useCallback(() => {
        setUnreadCount(0);
    }, []);

    const clearLogs = useCallback(async () => {
        await notificationsApi.clearAll();
        setLogs([]);
        setUnreadCount(0);
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                logs,
                unreadCount,
                addNotification,
                markAllRead,
                clearLogs,
                refreshLogs: fetchLogs
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotificationContext() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationContext must be used within a NotificationProvider');
    }
    return context;
}
