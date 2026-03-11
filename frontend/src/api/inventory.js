// API Service for Inventory — Connected to Express Backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Circuit breaker for offline fallback
let isServerOffline = false;
let lastRetryTime = 0;
const RETRY_COOLDOWN = 60000;

export const inventoryApi = {
    /**
     * Fetch all inventory items
     */
    getAll: async () => {
        const now = Date.now();
        if (isServerOffline && (now - lastRetryTime < RETRY_COOLDOWN)) {
            return [];
        }

        try {
            const response = await fetch(`${API_URL}/api/inventory`);
            if (!response.ok) throw new Error('Failed to fetch inventory');

            isServerOffline = false;
            return await response.json();
        } catch (error) {
            isServerOffline = true;
            lastRetryTime = now;
            console.warn('Backend offline, inventory unavailable');
            return [];
        }
    },

    /**
     * Create a new inventory item
     */
    create: async (itemData) => {
        try {
            const response = await fetch(`${API_URL}/api/inventory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            });
            if (!response.ok) throw new Error('Failed to create inventory item');

            isServerOffline = false;
            return await response.json();
        } catch (error) {
            console.error('Failed to create inventory item:', error);
            throw error;
        }
    },

    /**
     * Update stock/threshold for an inventory item
     */
    update: async (id, updateData) => {
        try {
            const response = await fetch(`${API_URL}/api/inventory/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            if (!response.ok) throw new Error('Failed to update inventory item');

            isServerOffline = false;
            return await response.json();
        } catch (error) {
            console.error('Failed to update inventory item:', error);
            throw error;
        }
    },

    /**
     * Delete an inventory item
     */
    delete: async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/inventory/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete inventory item');

            isServerOffline = false;
            return id;
        } catch (error) {
            console.error('Failed to delete inventory item:', error);
            throw error;
        }
    }
};
