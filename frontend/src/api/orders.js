import { apiClient } from './apiClient';

const LOCAL_STORAGE_KEY = 'bwc_orders';

// Circuit breaker for offline fallback
let isServerOffline = false;
let lastRetryTime = 0;
const RETRY_COOLDOWN = 60000; // 1 minute

const getOfflineOrders = () => {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
    } catch {
        return [];
    }
};

const saveOfflineOrders = (orders) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orders));
};

export const ordersApi = {
    /**
     * Fetch all orders, optionally filtered by date range and pagination
     */
    getAll: async (startDate = null, endDate = null, page = 1, limit = 50) => {
        const now = Date.now();
        if (isServerOffline && (now - lastRetryTime < RETRY_COOLDOWN)) {
            const cached = filterOfflineOrders(getOfflineOrders(), startDate, endDate);
            return { orders: cached, meta: { hasMore: false, totalItems: cached.length } };
        }

        try {
            const params = new URLSearchParams();
            if (startDate) params.append('from', startDate);
            if (endDate) params.append('to', endDate);
            params.append('page', page);
            params.append('limit', limit);

            const response = await apiClient.get(`/api/orders?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch orders');

            isServerOffline = false;
            const data = await response.json();

            // Cache locally for offline fallback (only first page of recent orders)
            if (!startDate && !endDate && page === 1) {
                saveOfflineOrders(data.orders);
            }
            return data;
        } catch (error) {
            isServerOffline = true;
            lastRetryTime = now;
            console.warn('Backend offline, using cached orders');
            const cached = filterOfflineOrders(getOfflineOrders(), startDate, endDate);
            return { orders: cached, meta: { hasMore: false, totalItems: cached.length } };
        }
    },

    /**
     * Fetch raw orders for analytics (no pagination)
     */
    getRaw: async (startDate = null, endDate = null) => {
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('from', startDate);
            if (endDate) params.append('to', endDate);
            params.append('limit', 1000); 

            const response = await apiClient.get(`/api/orders?${params.toString()}`);
            const data = await response.json();
            return data.orders || [];
        } catch (error) {
            console.error('Analytics fetch failed', error);
            return [];
        }
    },

    /**
     * Create a new order
     */
    create: async (orderData) => {
        const now = Date.now();
        const payload = {
            id: orderData.id || `ORD-${Date.now().toString().slice(-6)}`,
            timestamp: orderData.timestamp || new Date().toISOString(),
            subtotal: orderData.subtotal,
            vat: orderData.vat,
            total: orderData.total,
            payment_method: orderData.payment_method,
            order_type: orderData.order_type,
            cashier: orderData.cashier,
            amount_tendered: orderData.amount_tendered,
            change: orderData.change,
            items: orderData.items.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                original_price: item.original_price,
                modifiers: item.modifiers
            }))
        };

        if (isServerOffline && (now - lastRetryTime < RETRY_COOLDOWN)) {
            return saveOrderOffline(payload);
        }

        try {
            const response = await apiClient.post('/api/orders', payload);
            if (!response.ok) throw new Error('Failed to create order');

            isServerOffline = false;
            const newOrder = await response.json();

            // Also cache locally
            const cached = getOfflineOrders();
            cached.unshift(newOrder);
            saveOfflineOrders(cached.slice(0, 100)); // Keep only recent 100

            return newOrder;
        } catch (error) {
            isServerOffline = true;
            lastRetryTime = now;
            return saveOrderOffline(payload);
        }
    }
};

function saveOrderOffline(orderData) {
    const cached = getOfflineOrders();
    cached.unshift(orderData);
    saveOfflineOrders(cached);
    return orderData;
}

function filterOfflineOrders(orders, startDate, endDate) {
    if (!startDate && !endDate) return orders;
    return orders.filter(order => {
        const orderDate = new Date(order.timestamp);
        let isValid = true;
        if (startDate) isValid = isValid && orderDate >= new Date(startDate);
        if (endDate) isValid = isValid && orderDate <= new Date(endDate);
        return isValid;
    });
}
