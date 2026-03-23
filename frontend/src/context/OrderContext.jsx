import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ordersApi } from '../api/orders';
import { useNotificationContext } from './NotificationContext';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export function OrderProvider({ children }) {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { currentUser } = useAuth();

    // Initial load - Fetch TODAY's orders by default for live tracking
    const loadOrders = useCallback(async (silent = false) => {
        if (!currentUser) return; // Don't fetch if not logged in
        if (!silent) setIsLoading(true);
        try {
            const today = new Date();
            const start = new Date(today.setHours(0, 0, 0, 0)).toISOString();
            const end = new Date(today.setHours(23, 59, 59, 999)).toISOString();
            
            // Limit today's fetch to 500 (safe enough for one active day)
            const response = await ordersApi.getAll(start, end, 1, 500);
            setOrders(response.orders || []);
        } catch (err) {
            console.error('Failed to load orders', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            loadOrders();
            
            // Polling for "Live Tracking" across devices - only daily orders
            const interval = setInterval(() => {
                loadOrders(true); // Silent update
            }, 15000); // 15 seconds

            return () => clearInterval(interval);
        }
    }, [loadOrders, currentUser]);

    const { addNotification } = useNotificationContext();

    /**
     * Fetch raw orders for analytics (e.g., charts) without pagination
     */
    const fetchAnalytics = useCallback(async (startDate, endDate) => {
        try {
            const data = await ordersApi.getRaw(startDate, endDate);
            return data;
        } catch (err) {
            console.error('Failed to fetch analytics orders', err);
            return [];
        }
    }, []);

    /**
     * Fetch orders with date range and pagination
     */
    const fetchOrders = useCallback(async (startDate, endDate, page = 1, limit = 50) => {
        try {
            const response = await ordersApi.getAll(startDate, endDate, page, limit);
            return response; // Returns { orders, meta }
        } catch (err) {
            console.error('Failed to fetch filtered orders', err);
            return { orders: [], meta: { hasMore: false } };
        }
    }, []);

    const createOrder = useCallback(async (orderData) => {
        try {
            const newOrder = await ordersApi.create(orderData);
            setOrders(prev => [newOrder, ...prev]);

            // Dispatch notification
            const itemCount = newOrder.items.reduce((acc, i) => acc + i.quantity, 0);
            addNotification(
                'SALE',
                `New Order: ₱${newOrder.total.toFixed(2)}`,
                `${itemCount} items sold via ${newOrder.payment_method} (${newOrder.order_type})`
            );

            return newOrder;
        } catch (err) {
            console.error('Failed to create order', err);
            throw err;
        }
    }, [addNotification]);

    // Analytics Helpers
    const getTodayRevenue = () => {
        const today = new Date().toDateString();
        return orders
            .filter(o => new Date(o.timestamp).toDateString() === today)
            .reduce((sum, o) => sum + o.total, 0);
    };

    const getTodayOrderCount = () => {
        const today = new Date().toDateString();
        return orders.filter(o => new Date(o.timestamp).toDateString() === today).length;
    };

    return (
        <OrderContext.Provider
            value={{
                orders,
                isLoading,
                createOrder,
                fetchOrders,
                fetchAnalytics,
                refreshOrders: loadOrders,
                getTodayRevenue,
                getTodayOrderCount
            }}
        >
            {children}
        </OrderContext.Provider>
    );
}

export function useOrderContext() {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrderContext must be used within an OrderProvider');
    }
    return context;
}
