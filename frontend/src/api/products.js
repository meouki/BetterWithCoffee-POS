// Simulated API Service for Products
// This file acts as the single source of truth for product data operations.

const LOCAL_STORAGE_KEY = 'bwc_products';

const defaultProducts = [
    { id: 1, name: 'Caramel Macchiato', base_price: 180, is_available: true, category: 'Hot Drinks', modifiers: true },
    { id: 2, name: 'Spanish Latte', base_price: 190, is_available: true, category: 'Hot Drinks', modifiers: true },
    { id: 3, name: 'Matcha Frappe', base_price: 220, is_available: true, category: 'Frappe Drinks', modifiers: true },
    { id: 4, name: 'Cold Brew', base_price: 160, is_available: false, category: 'Cold Drinks', modifiers: false },
    { id: 5, name: 'Blueberry Cheesecake', base_price: 250, is_available: true, category: 'Pastries', modifiers: false },
    { id: 6, name: 'Butter Croissant', base_price: 120, is_available: true, category: 'Pastries', modifiers: false },
];

/**
 * Simulates a network delay to make the UI behave like it's connected to a real API.
 */
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const productsApi = {
    /**
     * Fetch all products
     */
    getAll: async () => {
        await delay(100);
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        // Initialize if empty
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultProducts));
        return defaultProducts;
    },

    /**
     * Create a new product
     */
    create: async (productData) => {
        await delay();
        const products = await productsApi.getAll();
        const newProduct = {
            ...productData,
            id: Date.now(), // Generate mock ID
        };
        const updatedProducts = [...products, newProduct];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProducts));
        return newProduct;
    },

    /**
     * Update an existing product
     */
    update: async (id, updateData) => {
        await delay();
        const products = await productsApi.getAll();
        const index = products.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Product not found');

        const updatedProduct = { ...products[index], ...updateData };
        const updatedProducts = [
            ...products.slice(0, index),
            updatedProduct,
            ...products.slice(index + 1)
        ];

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProducts));
        return updatedProduct;
    },

    /**
     * Delete a product
     */
    delete: async (id) => {
        await delay();
        const products = await productsApi.getAll();
        const updatedProducts = products.filter(p => p.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProducts));
        return id;
    }
};
