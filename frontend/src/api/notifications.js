import { apiClient } from './apiClient';

export const notificationsApi = {
    getAll: async () => {
        const response = await apiClient.get('/api/notifications');
        if (!response.ok) throw new Error('Failed to fetch notifications');
        return response.json();
    },

    add: async (notification) => {
        const response = await apiClient.post('/api/notifications', notification);
        if (!response.ok) throw new Error('Failed to create notification');
        return response.json();
    },

    clearAll: async () => {
        const response = await apiClient.delete('/api/notifications');
        if (!response.ok) throw new Error('Failed to clear notifications');
        return true;
    },

    getUnreadCount: async () => {
        const response = await apiClient.get('/api/notifications/unread-count');
        if (!response.ok) throw new Error('Failed to fetch unread count');
        return response.json();
    },

    markAsRead: async (id) => {
        const response = await apiClient.patch(`/api/notifications/${id}/read`);
        if (!response.ok) throw new Error('Failed to mark notification as read');
        return true;
    },

    markAllAsRead: async () => {
        const response = await apiClient.post('/api/notifications/read-all');
        if (!response.ok) throw new Error('Failed to mark all as read');
        return true;
    },

    getCloudStatus: async () => {
        // Special Case: Cloud status might be needed before/during auth, 
        // but we protect it for consistency.
        const response = await apiClient.get('/api/notifications/cloud-status');
        if (!response.ok) throw new Error('Failed to fetch cloud status');
        return response.json();
    }
};
