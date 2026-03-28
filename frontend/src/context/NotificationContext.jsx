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
        try {
            const fetchedLogs = await notificationsApi.getAll();
            setLogs(fetchedLogs || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    }, []);

    // Load logs on mount
    useEffect(() => {
        if (currentUser) {
            fetchLogs();
        }
    }, [fetchLogs, currentUser]);

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

        try {
            // Send to backend
            await notificationsApi.add({ 
                type, 
                message, 
                details, 
                cashier: actorName,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to save notification persistency:', error);
            // We still want to show it in UI even if DB pipe is broken
        }

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
    }, [currentUser]);

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
