// API Service for Notifications (Logs)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const LOCAL_STORAGE_KEY = 'bwc_offline_logs';

// Circuit breaker to avoid console spam when backend is off
let isServerOffline = false;
let lastRetryTime = 0;
const RETRY_COOLDOWN = 60000; // 1 minute

const getOfflineLogs = () => {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
    } catch {
        return [];
    }
};

const saveOfflineLog = (logData) => {
    const logs = getOfflineLogs();
    const newLog = {
        ...logData,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    // Keep last 500 logs locally
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(logs.slice(0, 500)));
    return newLog;
};

export const notificationsApi = {
    /**
     * Fetch all logs from the backend text files
     */
    getAll: async () => {
        const now = Date.now();
        if (isServerOffline && (now - lastRetryTime < RETRY_COOLDOWN)) {
            return getOfflineLogs();
        }

        try {
            const response = await fetch(`${API_URL}/api/logs`);
            if (!response.ok) throw new Error('Failed to fetch logs');

            isServerOffline = false; // Reset on success
            const serverLogs = await response.json();
            return serverLogs;
        } catch (error) {
            isServerOffline = true;
            lastRetryTime = now;
            // Silently fall back to local storage if backend is off
            return getOfflineLogs();
        }
    },

    /**
     * Add a new log entry to the backend text file
     * @param {Object} logData - { type: 'SALE'|'MENU_EDIT'|'ALERT', message: string, details: string, cashier: string }
     */
    add: async (logData) => {
        const now = Date.now();
        // If server is known to be offline, just use local storage immediately
        if (isServerOffline && (now - lastRetryTime < RETRY_COOLDOWN)) {
            return saveOfflineLog(logData);
        }

        try {
            const response = await fetch(`${API_URL}/api/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logData)
            });
            if (!response.ok) throw new Error('Failed to save log');

            isServerOffline = false; // Reset on success
            // Also keep it locally just in case they go offline later
            saveOfflineLog(logData);

            return await response.json();
        } catch (error) {
            isServerOffline = true;
            lastRetryTime = now;
            // If backend is off, silently save to local storage so it persists locally
            return saveOfflineLog(logData);
        }
    },

    /**
     * Clear all logs on the backend
     */
    clearAll: async () => {
        try {
            localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear offline logs
            const response = await fetch(`${API_URL}/api/logs`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to clear logs');
            return await response.json();
        } catch (error) {
            return { success: true, fake: true };
        }
    }
};
