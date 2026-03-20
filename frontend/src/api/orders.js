// API Service for Orders — Connected to Express Backend
const API_URL = import.meta.env.VITE_API_URL || '';
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
     * Fetch all orders, optionally filtered by date range
     */
    getAll: async (startDate = null, endDate = null) => {
        const now = Date.now();
        if (isServerOffline && (now - lastRetryTime < RETRY_COOLDOWN)) {
            return filterOfflineOrders(getOfflineOrders(), startDate, endDate);
        }

        try {
            let url = `${API_URL}/api/orders`;
            const params = new URLSearchParams();
            if (startDate) params.append('from', startDate);
            if (endDate) params.append('to', endDate);
            if (params.toString()) url += `?${params.toString()}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch orders');

            isServerOffline = false;
            const orders = await response.json();

            // Cache locally for offline fallback (only unfiltered)
            if (!startDate && !endDate) {
                saveOfflineOrders(orders);
            }
            return orders;
        } catch (error) {
            isServerOffline = true;
            lastRetryTime = now;
            console.warn('Backend offline, using cached orders');
            return filterOfflineOrders(getOfflineOrders(), startDate, endDate);
        }
    },

    /**
     * Create a new order
     */
    create: async (orderData) => {
        const now = Date.now();
        // Build the order payload
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
                price: item.price
            }))
        };

        // If server is known offline, save locally
        if (isServerOffline && (now - lastRetryTime < RETRY_COOLDOWN)) {
            return saveOrderOffline(payload);
        }

        try {
            const response = await fetch(`${API_URL}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Failed to create order');

            isServerOffline = false;
            const newOrder = await response.json();

            // Also cache locally
            const cached = getOfflineOrders();
            cached.unshift(newOrder);
            saveOfflineOrders(cached);

            return newOrder;
        } catch (error) {
            isServerOffline = true;
            lastRetryTime = now;
            console.warn('Backend offline, saving order locally');
            return saveOrderOffline(payload);
        }
    }
};

// Helper: save order to localStorage when offline
function saveOrderOffline(orderData) {
    const cached = getOfflineOrders();
    cached.unshift(orderData);
    saveOfflineOrders(cached);
    return orderData;
}

// Helper: filter offline orders by date
function filterOfflineOrders(orders, startDate, endDate) {
    if (!startDate && !endDate) return orders;

    return orders.filter(order => {
        const orderDate = new Date(order.timestamp);
        let isValid = true;

        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            isValid = isValid && orderDate >= start;
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            isValid = isValid && orderDate <= end;
        }

        return isValid;
    });
}
