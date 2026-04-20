import { apiClient } from './apiClient';

export const attendanceApi = {
    clockIn: async (userId) => {
        const response = await apiClient.post('/api/attendance/clock-in', { user_id: userId });
        if (!response.ok) throw new Error('Failed to clock in');
        return response.json();
    },

    clockOut: async (userId) => {
        const response = await apiClient.post('/api/attendance/clock-out', { user_id: userId });
        if (!response.ok) throw new Error('Failed to clock out');
        return response.json();
    },

    getToday: async () => {
        const response = await apiClient.get('/api/attendance/today');
        if (!response.ok) throw new Error('Failed to fetch attendance');
        return response.json();
    },

    getRecords: async (userId) => {
        const response = await apiClient.get(`/api/attendance/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch user attendance');
        return response.json();
    },

    getStats: async (username) => {
        const response = await apiClient.get(`/api/attendance/stats/${username}`);
        if (!response.ok) throw new Error('Failed to fetch user stats');
        return response.json();
    },

    getLogs: async (startDate = null, endDate = null) => {
        const params = new URLSearchParams();
        if (startDate) params.append('from', startDate);
        if (endDate) params.append('to', endDate);
        
        let url = '/api/attendance/logs';
        if (params.toString()) url += `?${params.toString()}`;

        const response = await apiClient.get(url);
        if (!response.ok) throw new Error('Failed to fetch attendance logs');
        return response.json();
    },

    setDayOff: async (userId, date = null) => {
        const response = await apiClient.post('/api/attendance/day-off', { user_id: userId, date });
        if (!response.ok) throw new Error('Failed to set day off');
        return response.json();
    }
};
