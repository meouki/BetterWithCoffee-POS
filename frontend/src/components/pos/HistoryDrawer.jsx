import { useState } from 'react';
import { X, History, ShoppingBag, Hash, Clock, User } from 'lucide-react';
import { useOrderContext } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import styles from './HistoryDrawer.module.css';

export default function HistoryDrawer({ isOpen, onClose }) {
    const { orders } = useOrderContext();
    const { currentUser } = useAuth();
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Filter to only show today's orders for THIS cashier
    const today = new Date().toDateString();
    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.timestamp).toDateString();
        return orderDate === today && order.cashier === currentUser?.name;
    });

    // Only show recent orders (last 20)
    const recentOrders = filteredOrders.slice(0, 20);

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <div 
                className={`${styles.drawerOverlay} ${isOpen ? styles.drawerOverlayOpen : ''}`} 
                onClick={onClose}
            />
            <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        <History size={20} className="text-[var(--color-accent)]" /> 
                        Your History
                    </h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.content}>
                    {recentOrders.length === 0 ? (
                        <div className={styles.emptyState}>
                            <ShoppingBag size={48} strokeWidth={1} />
                            <p>No orders yet this shift.</p>
                        </div>
                    ) : (
                        recentOrders.map((order) => (
                            <div 
                                key={order.id} 
                                className={styles.orderCard}
                                onClick={() => setSelectedOrder(order)}
                                role="button"
                                tabIndex={0}
                            >
                                <div className={styles.orderHeader}>
                                    <span className={styles.orderId}>{order.id}</span>
                                    <span className={styles.orderTime}>
                                        {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                
                                <div className={styles.itemList}>
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className={styles.itemRow}>
                                            <span className={styles.itemName}>{item.name}</span>
                                            <span className={styles.itemQty}>x{item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.footer}>
                                    <span className={styles.totalLabel}>Paid via {order.payment_method}</span>
                                    <span className={styles.totalValue}>₱{order.total.toFixed(2)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedOrder && (
                <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Order Detail</h3>
                            <button onClick={() => setSelectedOrder(null)} className={styles.closeModalBtn}>
                                <X size={20} />
                            </button>
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
                            <div className={styles.totalRowDetail}>
                                <span>Total</span> 
                                <span className={styles.accentText}>₱{selectedOrder.total.toFixed(2)}</span>
                            </div>
                            <div className={styles.subTotalRow}>
                                <span>Paid via {selectedOrder.payment_method}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
