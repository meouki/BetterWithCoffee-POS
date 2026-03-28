import { apiClient } from './apiClient';

export const categoriesApi = {
    getAll: async () => {
        const response = await apiClient.get('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        return response.json();
    },

    create: async (categoryData) => {
        const response = await apiClient.post('/api/categories', categoryData);
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to create category');
        }
        return response.json();
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/api/categories/${id}`);
        if (!response.ok) throw new Error('Failed to delete category');
        return true;
    }
};
