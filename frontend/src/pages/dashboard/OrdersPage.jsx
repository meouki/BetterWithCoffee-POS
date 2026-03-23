import { useState, useEffect, useRef, useCallback } from 'react';
import { useOrderContext } from '../../context/OrderContext';
import { Eye, Clock, User, Hash, Calendar } from 'lucide-react';
import Loader from '../../components/shared/Loader';
import styles from './OrdersPage.module.css';

const ROW_HEIGHT = 64; // Approximate height of a row including borders

export default function OrdersPage() {
    const { fetchOrders } = useOrderContext();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [meta, setMeta] = useState({ currentPage: 1, hasMore: true, totalItems: 0 });
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Date Filtering State
    const [dateFilter, setDateFilter] = useState('Today'); 
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    // Virtualization State
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef(null);

    // Initial load and filter change
    const loadInitialOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const { start, end } = getDateRange();
            const response = await fetchOrders(start, end, 1, 50);
            setOrders(response.orders || []);
            setMeta(response.meta);
            if (containerRef.current) containerRef.current.scrollTop = 0;
            setScrollTop(0);
        } catch (error) {
            console.error("Failed to fetch initial orders", error);
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    }, [dateFilter, customStart, customEnd, fetchOrders]);

    useEffect(() => {
        loadInitialOrders();
    }, [loadInitialOrders]);

    const getDateRange = () => {
        const now = new Date();
        let start = null;
        let end = null;

        if (dateFilter === 'Today') {
            start = new Date(now.setHours(0, 0, 0, 0)).toISOString();
            end = new Date(now.setHours(23, 59, 59, 999)).toISOString();
        } else if (dateFilter === '7Days') {
            const last7 = new Date();
            last7.setDate(now.getDate() - 7);
            start = last7.toISOString();
        } else if (dateFilter === '30Days') {
            const last30 = new Date();
            last30.setDate(now.getDate() - 30);
            start = last30.toISOString();
        } else if (dateFilter === 'Custom' && customStart && customEnd) {
            start = new Date(customStart).toISOString();
            end = new Date(customEnd).setHours(23, 59, 59, 999);
            end = new Date(end).toISOString();
        }
        return { start, end };
    };

    const loadMore = async () => {
        if (isLoadingMore || !meta.hasMore) return;
        setIsLoadingMore(true);
        try {
            const { start, end } = getDateRange();
            const nextPage = meta.currentPage + 1;
            const response = await fetchOrders(start, end, nextPage, 50);
            setOrders(prev => [...prev, ...response.orders]);
            setMeta(response.meta);
        } catch (error) {
            console.error("Failed to fetch more orders", error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        setScrollTop(scrollTop);

        // Infinite Scroll trigger
        if (scrollHeight - scrollTop - clientHeight < 200) {
            loadMore();
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const generateOrderSummary = (items) => {
        if (!items || items.length === 0) return "No items";
        const firstItem = `${items[0].quantity}x ${items[0].name}`;
        if (items.length > 1) {
            return `${firstItem} + ${items.length - 1} more`;
        }
        return firstItem;
    };

    // Virtualization Calculations
    const visibleCount = 15; // Number of items to render
    const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 5);
    const endIndex = Math.min(orders.length, startIndex + visibleCount + 10);
    const visibleOrders = orders.slice(startIndex, endIndex);
    const totalContentHeight = Math.max(orders.length * ROW_HEIGHT, 400);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>Order History</h2>
            </div>

            <div className={styles.filterSection}>
                <div className={styles.pillGroup}>
                    {['Today', '7Days', '30Days', 'Custom'].map(f => (
                        <button 
                            key={f}
                            className={`${styles.filterBtn} ${dateFilter === f ? styles.activeFilter : ''}`} 
                            onClick={() => setDateFilter(f)}
                        >
                            {f === '7Days' ? 'Last 7 Days' : f === '30Days' ? 'This Month' : f}
                        </button>
                    ))}
                </div>

                {dateFilter === 'Custom' && (
                    <div className={styles.customDateInput}>
                        <div className={styles.dateWrapper}>
                            <Calendar size={16} className={styles.dateIcon} />
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                            />
                        </div>
                        <span className={styles.dateSeparator}>to</span>
                        <div className={styles.dateWrapper}>
                            <Calendar size={16} className={styles.dateIcon} />
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div 
                className={styles.listContainer}
                onScroll={handleScroll}
                ref={containerRef}
            >
                {/* Virtualized Header - matching grid cols of rows */}
                <div className={styles.listHeader}>
                    <div className={styles.colAction}>Action</div>
                    <div className={styles.colSummary}>Summary</div>
                    <div className={styles.colId}>Order #</div>
                    <div className={styles.colDate}>Date & Time</div>
                    <div className={styles.colCashier}>Cashier</div>
                    <div className={styles.colType}>Type</div>
                    <div className={styles.colTotal}>Total</div>
                </div>

                <div className={styles.listDataContent}>
                    {isLoading ? (
                        <div className={styles.centeredLoader}>
                            <Loader size="medium" text="Loading history..." />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className={styles.emptyState}>No orders found for this period.</div>
                    ) : (
                        <div style={{ height: totalContentHeight, position: 'relative' }}>
                            {visibleOrders.map((order, index) => (
                                <div 
                                    className={styles.virtualRow} 
                                    key={order.id}
                                    style={{ 
                                        position: 'absolute', 
                                        top: (startIndex + index) * ROW_HEIGHT,
                                        height: ROW_HEIGHT,
                                        width: '100%'
                                    }}
                                >
                                    <div className={styles.colAction}>
                                        <button className={styles.viewBtn} onClick={() => setSelectedOrder(order)}>
                                            <Eye size={14} /> View
                                        </button>
                                    </div>
                                    <div className={styles.colSummary}>
                                        <span className={styles.summaryText}>{generateOrderSummary(order.items)}</span>
                                    </div>
                                    <div className={styles.colId}>{order.id}</div>
                                    <div className={styles.colDate}>{formatDate(order.timestamp)}</div>
                                    <div className={styles.colCashier}>{order.cashier}</div>
                                    <div className={styles.colType}>
                                        <span className={`${styles.typeBadge} ${order.order_type === 'Dine-In' ? styles.dineIn : styles.takeOut}`}>
                                            {order.order_type}
                                        </span>
                                    </div>
                                    <div className={styles.colTotal}>₱{order.total.toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    {isLoadingMore && (
                        <div className={styles.bottomLoader}>
                             <div className={styles.dotPulse}></div>
                             <span>Loading more orders...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedOrder && (
                <div className={styles.overlay} onClick={() => setSelectedOrder(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Order Detail</h3>
                            <button onClick={() => setSelectedOrder(null)} className={styles.closeBtn}>✕</button>
                        </div>

                        <div className={styles.receiptSummary}>
                            <h3 className={styles.brandTitle}>Better with Coffee</h3>
                            <p className={styles.receiptType}>ACKNOWLEDGMENT RECEIPT</p>
                        </div>

                        <div className={styles.metaGrid}>
                            <div className={styles.metaItem}><Hash size={14} /> <strong>{selectedOrder.id}</strong></div>
                            <div className={styles.metaItem}><Clock size={14} /> {formatDate(selectedOrder.timestamp)}</div>
                            <div className={styles.metaItem}><User size={14} /> {selectedOrder.cashier}</div>
                        </div>

                        <div className={styles.itemsList}>
                            {selectedOrder.items.map((item, idx) => (
                                <div key={idx} className={styles.itemWrapperDetail}>
                                    <div className={styles.itemRowDetail}>
                                        <span>{item.quantity}x {item.name}</span>
                                        <span>₱{(item.original_price || item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                    {item.modifiers?.map((mod, midx) => (
                                        <div key={midx} className={styles.modifierRowDetail}>
                                            <span>• {mod.name}</span>
                                            <span>+₱{(mod.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        <div className={styles.totalsArea}>
                            <div className={styles.totalRowDetail}><span>Total</span> <span className={styles.accentText}>₱{selectedOrder.total.toFixed(2)}</span></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
