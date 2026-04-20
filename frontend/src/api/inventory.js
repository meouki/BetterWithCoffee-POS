import { apiClient } from './apiClient';

export const inventoryApi = {
    // Ingredients CRUD
    getAll: async () => {
        const response = await apiClient.get('/api/inventory');
        if (!response.ok) throw new Error('Failed to fetch ingredients');
        return response.json();
    },

    create: async (data) => {
        const response = await apiClient.post('/api/inventory', data);
        if (!response.ok) throw new Error('Failed to create ingredient');
        return response.json();
    },

    update: async (id, data) => {
        const response = await apiClient.patch(`/api/inventory/${id}`, data);
        if (!response.ok) throw new Error('Failed to update ingredient');
        return response.json();
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/api/inventory/${id}`);
        if (!response.ok) throw new Error('Failed to delete ingredient');
        return response.json();
    },

    // Stock Logs
    getLogs: async () => {
        const response = await apiClient.get('/api/inventory/logs');
        if (!response.ok) throw new Error('Failed to fetch stock logs');
        return response.json();
    },

    checkStock: async (items) => {
        const response = await apiClient.post('/api/inventory/check-stock', { items });
        if (!response.ok) throw new Error('Failed to check stock');
        return response.json();
    }
};

export const recipesApi = {
    getByProduct: async (productId) => {
        const response = await apiClient.get(`/api/recipes?product_id=${productId}`);
        if (!response.ok) throw new Error('Failed to fetch recipes');
        return response.json();
    },

    create: async (data) => {
        const response = await apiClient.post('/api/recipes', data);
        if (!response.ok) throw new Error('Failed to create recipe');
        return response.json();
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/api/recipes/${id}`);
        if (!response.ok) throw new Error('Failed to delete recipe');
        return response.json();
    },
};

export const productSizesApi = {
    getByProduct: async (productId) => {
        const response = await apiClient.get(`/api/product-sizes?product_id=${productId}`);
        if (!response.ok) throw new Error('Failed to fetch product sizes');
        return response.json();
    },

    create: async (data) => {
        const response = await apiClient.post('/api/product-sizes', data);
        if (!response.ok) throw new Error('Failed to create product size');
        return response.json();
    },

    update: async (id, data) => {
        const response = await apiClient.patch(`/api/product-sizes/${id}`, data);
        if (!response.ok) throw new Error('Failed to update product size');
        return response.json();
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/api/product-sizes/${id}`);
        if (!response.ok) throw new Error('Failed to delete product size');
        return response.json();
    },
};
