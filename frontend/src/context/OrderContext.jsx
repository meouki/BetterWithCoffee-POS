import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ordersApi } from '../api/orders';
import { useNotificationContext } from './NotificationContext';

const OrderContext = createContext();

export function OrderProvider({ children }) {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial load
    const loadOrders = useCallback(async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const data = await ordersApi.getAll();
            setOrders(data);
        } catch (err) {
            console.error('Failed to load orders', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
        
        // Polling for "Live Tracking" across devices
        const interval = setInterval(() => {
            loadOrders(true); // Silent update
        }, 10000); // Every 10 seconds

        return () => clearInterval(interval);
    }, [loadOrders]);

    const { addNotification } = useNotificationContext();

    const fetchOrders = useCallback(async (startDate, endDate) => {
        try {
            const data = await ordersApi.getAll(startDate, endDate);
            return data;
        } catch (err) {
            console.error('Failed to fetch filtered orders', err);
            return [];
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
