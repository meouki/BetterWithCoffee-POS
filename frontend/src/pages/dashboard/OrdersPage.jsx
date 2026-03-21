import { useState, useEffect } from 'react';
import { useOrderContext } from '../../context/OrderContext';
import { Eye, Clock, User, Hash, Calendar, Loader as LoaderIcon } from 'lucide-react';
import Loader from '../../components/shared/Loader';
import styles from './OrdersPage.module.css';

export default function OrdersPage() {
    const { fetchOrders, orders: globalOrders } = useOrderContext();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Date Filtering State
    const [dateFilter, setDateFilter] = useState('Today'); // 'Today', '7Days', '30Days', 'Custom'
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    useEffect(() => {
        const loadFilteredOrders = async () => {
            setIsLoading(true);
            try {
                let start = null;
                let end = null;
                const now = new Date();

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

                // If 'Custom' is selected but both dates aren't filled, default to fetching all (or handle gracefully)
                if (dateFilter !== 'Custom' || (customStart && customEnd)) {
                    // Assuming fetchOrders passes arguments down to api.getAll
                    const data = await fetchOrders(start, end);
                    // Temporarily using internal state to handle the filtered view since context.orders might be global
                    setOrders(data || []);
                }
            } catch (error) {
                console.error("Failed to fetch filtered orders", error);
                setOrders([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadFilteredOrders();
    }, [dateFilter, customStart, customEnd, fetchOrders, globalOrders.length]);


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

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>Order History</h2>
            </div>

            {/* Date Filters */}
            <div className={styles.filterSection}>
                <div className={styles.pillGroup}>
                    <button className={`${styles.filterBtn} ${dateFilter === 'Today' ? styles.activeFilter : ''}`} onClick={() => setDateFilter('Today')}>Today</button>
                    <button className={`${styles.filterBtn} ${dateFilter === '7Days' ? styles.activeFilter : ''}`} onClick={() => setDateFilter('7Days')}>Last 7 Days</button>
                    <button className={`${styles.filterBtn} ${dateFilter === '30Days' ? styles.activeFilter : ''}`} onClick={() => setDateFilter('30Days')}>This Month</button>
                    <button className={`${styles.filterBtn} ${dateFilter === 'Custom' ? styles.activeFilter : ''}`} onClick={() => setDateFilter('Custom')}>Custom</button>
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
                                max={customEnd || undefined}
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
                                min={customStart || undefined}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.tablePanel}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Action</th>
                                <th className={styles.th}>Order Summary</th>
                                <th className={styles.th}>Order #</th>
                                <th className={styles.th}>Date & Time</th>
                                <th className={styles.th}>Cashier</th>
                                <th className={styles.th}>Type</th>
                                <th className={styles.th}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7">
                                        <Loader size="medium" text="Loading history..." />
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className={styles.emptyState}>No orders found for this period.</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id}>
                                        <td className={styles.td}>
                                            <button
                                                className={styles.viewBtn}
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <Eye size={16} /> View
                                            </button>
                                        </td>
                                        <td className={styles.td}>
                                            <span className={styles.orderSummaryText}>{generateOrderSummary(order.items)}</span>
                                        </td>
                                        <td className={styles.td}>
                                            <span className={styles.orderId}>{order.id}</span>
                                        </td>
                                        <td className={styles.td}>{formatDate(order.timestamp)}</td>
                                        <td className={styles.td}>{order.cashier}</td>
                                        <td className={styles.td}>
                                            <span className={`${styles.typeBadge} ${order.order_type === 'Dine-In' ? styles.dineIn : styles.takeOut}`}>
                                                {order.order_type}
                                            </span>
                                        </td>
                                        <td className={`${styles.td} font-bold`}>
                                            ₱{order.total.toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Simple Detail Overlay (Optimized for Dashboard) */}
            {selectedOrder && (
                <div className={styles.overlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Order History Detail</h3>
                            <button onClick={() => setSelectedOrder(null)} className={styles.closeBtn}>✕</button>
                        </div>

                        <div className={styles.receiptSummary}>
                            <h3 className={styles.brandTitle}>Better with Coffee</h3>
                            <p className={styles.receiptType}>ACKNOWLEDGMENT RECEIPT</p>
                            <div className={styles.businessInfo}>
                                <p>TIN: 000-000-000-000</p>
                                <p>123 Coffee Lane, Metro Manila</p>
                            </div>
                        </div>

                        <div className={styles.metaGrid}>
                            <div className={styles.metaItem}>
                                <Hash size={16} className={styles.metaIcon} />
                                <span className="font-semibold">{selectedOrder.id}</span>
                            </div>
                            <div className={styles.metaItem}>
                                <Clock size={16} className={styles.metaIcon} />
                                <span>{formatDate(selectedOrder.timestamp)}</span>
                            </div>
                            <div className={styles.metaItem}>
                                <User size={16} className={styles.metaIcon} />
                                <span>{selectedOrder.cashier}</span>
                            </div>
                        </div>

                        <div className={styles.itemsList}>
                            {selectedOrder.items.map((item, idx) => (
                                <div key={idx} className={styles.itemWrapperDetail}>
                                    <div className={styles.itemRowDetail}>
                                        <div className={styles.itemDesc}>
                                            <span className={styles.itemQty}>{item.quantity}x</span>
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                        <span className={styles.itemPriceDetail}>₱{(item.original_price ? item.original_price * item.quantity : item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                    
                                    {item.modifiers && item.modifiers.length > 0 && (
                                        <div className={styles.itemModifiersDetail}>
                                            {item.modifiers.map((mod, midx) => (
                                                <div key={midx} className={styles.modifierRowDetail}>
                                                    <span className={styles.modifierNameDetail}>{mod.name}</span>
                                                    {parseFloat(mod.price) > 0 && (
                                                        <span>+₱{(parseFloat(mod.price) * item.quantity).toFixed(2)}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className={styles.totalsArea}>
                            <div className={styles.totalRowDetail}>
                                <span>Subtotal</span>
                                <span>₱{selectedOrder.subtotal.toFixed(2)}</span>
                            </div>
                            <div className={styles.totalRowDetail}>
                                <span>VAT (12%)</span>
                                <span>₱{selectedOrder.vat.toFixed(2)}</span>
                            </div>
                            <div className={styles.grandTotalDetail}>
                                <span>Total</span>
                                <span className={styles.accentText}>₱{selectedOrder.total.toFixed(2)}</span>
                            </div>
                            <div className={styles.totalRowDetail} style={{ marginTop: '8px' }}>
                                <span>Cash Tendered</span>
                                <span>{selectedOrder.payment_method === 'Cash' ? `₱${selectedOrder.amount_tendered?.toFixed(2)}` : '---'}</span>
                            </div>
                            <div className={styles.totalRowDetail}>
                                <span>Change</span>
                                <span>₱{selectedOrder.change?.toFixed(2) ?? '0.00'}</span>
                            </div>
                        </div>

                        <div className={styles.footerInfo}>
                            <p className={styles.legalDisclaimer}>THIS IS NOT AN OFFICIAL RECEIPT</p>
                            <p className={styles.personalityQuote}>"Fueling your passion, one cup at a time."</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
