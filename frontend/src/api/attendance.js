const API_URL = import.meta.env.VITE_API_URL || '';

export const attendanceApi = {
    getRecords: async (userId) => {
        const response = await fetch(`${API_URL}/api/attendance/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch attendance records');
        return response.json();
    },

    getStats: async (username) => {
        const response = await fetch(`${API_URL}/api/attendance/stats/${username}`);
        if (!response.ok) throw new Error('Failed to fetch user stats');
        return response.json();
    },

    clockIn: async (userId) => {
        const response = await fetch(`${API_URL}/api/attendance/clock-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to clock in');
        return data;
    },

    clockOut: async (userId) => {
        const response = await fetch(`${API_URL}/api/attendance/clock-out`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to clock out');
        return data;
    },

    setDayOff: async (userId, date) => {
        const response = await fetch(`${API_URL}/api/attendance/day-off`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, date })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to set day off');
        return data;
    }
};
