import { apiClient } from './apiClient';

export const inventoryApi = {
    getAllLogs: async () => {
        const response = await apiClient.get('/api/inventory');
        if (!response.ok) throw new Error('Failed to fetch inventory logs');
        return response.json();
    },

    logAction: async (actionData) => {
        const response = await apiClient.post('/api/inventory', actionData);
        if (!response.ok) throw new Error('Failed to log inventory action');
        return response.json();
    },

    getSummary: async () => {
        const response = await apiClient.get('/api/inventory/summary');
        if (!response.ok) throw new Error('Failed to fetch inventory summary');
        return response.json();
    }
};
