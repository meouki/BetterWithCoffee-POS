// Simulated API Service for Orders
const LOCAL_STORAGE_KEY = 'bwc_orders';

// Seed initial orders for visualization
const initialOrders = [
    {
        id: 'ORD-1001',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        items: [{ id: 1, name: 'Caramel Macchiato', quantity: 2, price: 180 }],
        subtotal: 360,
        vat: 43.2,
        total: 403.2,
        payment_method: 'Cash',
        order_type: 'Dine-In',
        cashier: 'System Seed'
    },
    {
        id: 'ORD-1002',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), // 1 hour ago
        items: [{ id: 3, name: 'Matcha Frappe', quantity: 1, price: 220 }],
        subtotal: 220,
        vat: 26.4,
        total: 246.4,
        payment_method: 'GCash',
        order_type: 'Take-Out',
        cashier: 'J. Dela Cruz'
    }
];

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const ordersApi = {
    /**
     * Fetch all orders
     */
    getAll: async () => {
        await delay(100);
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialOrders));
        return initialOrders;
    },

    /**
     * Create a new order
     */
    create: async (orderData) => {
        await delay();
        const orders = await ordersApi.getAll();
        const newOrder = {
            ...orderData,
            id: `ORD-${Date.now().toString().slice(-6)}`,
            timestamp: new Date().toISOString()
        };
        const updatedOrders = [newOrder, ...orders];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedOrders));
        return newOrder;
    }
};
