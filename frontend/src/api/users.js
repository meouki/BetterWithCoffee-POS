import { apiClient } from './apiClient';

export const usersApi = {
    getAll: async () => {
        const response = await apiClient.get('/api/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    },

    login: async (username, password) => {
        const response = await apiClient.post('/api/users/login', { username, password });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');
        return data;
    },

    create: async (userData) => {
        const response = await apiClient.post('/api/users', userData);
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to create user');
        return data;
    },

    update: async (id, updates) => {
        const response = await apiClient.patch(`/api/users/${id}`, updates);
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to update user');
        return data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/api/users/${id}`);
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete user');
        }
        return true;
    }
};
