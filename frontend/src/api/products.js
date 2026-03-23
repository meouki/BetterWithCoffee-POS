import { apiClient } from './apiClient';

export const productsApi = {
    getAll: async () => {
        const response = await apiClient.get('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        return response.json();
    },

    create: async (productData) => {
        // Handle FormData for images
        const response = await apiClient.post('/api/products', productData);
        if (!response.ok) throw new Error('Failed to create product');
        return response.json();
    },

    update: async (id, productData) => {
        const response = await apiClient.patch(`/api/products/${id}`, productData);
        if (!response.ok) throw new Error('Failed to update product');
        return response.json();
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/api/products/${id}`);
        if (!response.ok) throw new Error('Failed to delete product');
        return true;
    }
};
