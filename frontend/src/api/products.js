// API Service for Products — Connected to Express Backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const LOCAL_STORAGE_KEY = 'bwc_products';

// Circuit breaker for offline fallback
let isServerOffline = false;
let lastRetryTime = 0;
const RETRY_COOLDOWN = 60000; // 1 minute

const getOfflineProducts = () => {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
    } catch {
        return [];
    }
};

const saveOfflineProducts = (products) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
};

export const productsApi = {
    /**
     * Fetch all products from the backend
     */
    getAll: async () => {
        const now = Date.now();
        if (isServerOffline && (now - lastRetryTime < RETRY_COOLDOWN)) {
            return getOfflineProducts();
        }

        try {
            const response = await fetch(`${API_URL}/api/products`);
            if (!response.ok) throw new Error('Failed to fetch products');

            isServerOffline = false;
            const products = await response.json();

            // Cache locally for offline fallback
            saveOfflineProducts(products);
            return products;
        } catch (error) {
            isServerOffline = true;
            lastRetryTime = now;
            console.warn('Backend offline, using cached products');
            return getOfflineProducts();
        }
    },

    /**
     * Create a new product (supports image upload via FormData)
     */
    create: async (productData) => {
        try {
            let body;
            let headers = {};

            // If productData is already FormData (image upload), use it directly
            if (productData instanceof FormData) {
                body = productData;
                // Don't set Content-Type — browser will set it with boundary
            } else {
                // Regular JSON
                body = JSON.stringify(productData);
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetch(`${API_URL}/api/products`, {
                method: 'POST',
                headers,
                body
            });
            if (!response.ok) throw new Error('Failed to create product');

            isServerOffline = false;
            const newProduct = await response.json();

            // Update local cache
            const cached = getOfflineProducts();
            cached.push(newProduct);
            saveOfflineProducts(cached);

            return newProduct;
        } catch (error) {
            console.error('Failed to create product:', error);
            throw error;
        }
    },

    /**
     * Update an existing product
     */
    update: async (id, updateData) => {
        try {
            const response = await fetch(`${API_URL}/api/products/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            if (!response.ok) throw new Error('Failed to update product');

            isServerOffline = false;
            const updatedProduct = await response.json();

            // Update local cache
            const cached = getOfflineProducts();
            const index = cached.findIndex(p => p.id === id);
            if (index !== -1) cached[index] = updatedProduct;
            saveOfflineProducts(cached);

            return updatedProduct;
        } catch (error) {
            console.error('Failed to update product:', error);
            throw error;
        }
    },

    /**
     * Delete a product
     */
    delete: async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/products/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete product');

            isServerOffline = false;

            // Update local cache
            const cached = getOfflineProducts();
            const updatedCache = cached.filter(p => p.id !== id);
            saveOfflineProducts(updatedCache);

            return id;
        } catch (error) {
            console.error('Failed to delete product:', error);
            throw error;
        }
    }
};
