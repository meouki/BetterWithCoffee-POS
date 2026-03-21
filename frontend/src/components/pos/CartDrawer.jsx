import { ChevronDown, Trash2, Minus, Plus, X } from 'lucide-react';
import styles from './CartDrawer.module.css';

export default function CartDrawer({
    isOpen,
    onClose,
    cartItems,
    orderType,
    onUpdateQuantity,
    onRemoveItem,
    onClearCart,
    onCheckout
}) {
    if (!isOpen) return null;

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const vat = total - (total / 1.12);
    const subtotal = total - vat;

    return (
        <div className={styles.overlay}>
            <div className={styles.drawer}>

                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        Current Order
                        <span className={`${styles.typeBadge} ${orderType === 'Dine-In' ? styles.dineIn : styles.takeOut}`}>
                            {orderType}
                        </span>
                    </div>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <ChevronDown className="md:hidden" size={24} />
                        <X className="hidden md:block" size={24} />
                    </button>
                </div>

                <div className={styles.content}>
                    {cartItems.length === 0 ? (
                        <div className={styles.emptyState}>
                            Your cart is empty.
                        </div>
                    ) : (
                        cartItems.map((item, index) => (
                            <div key={index} className={styles.itemRow}>
                                <div className={styles.itemInfo}>
                                    <div className={styles.itemName}>{item.name}</div>
                                        <div className={styles.modList}>
                                            {item.modifiers.map((mod, midx) => (
                                                <div key={midx} className={styles.modItem}>
                                                    <span>{mod.name}</span>
                                                    {parseFloat(mod.price) > 0 && <span>+₱{parseFloat(mod.price).toFixed(2)}</span>}
                                                </div>
                                            ))}
                                        </div>
                                </div>

                                <div className={styles.itemActions}>
                                    <div className={styles.itemPrice}>
                                        ₱{(item.price * item.quantity).toFixed(2)}
                                    </div>

                                    <div className={styles.qtyControl}>
                                        <button
                                            className={styles.qtyBtn}
                                            onClick={() => onUpdateQuantity(index, -1)}
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className={styles.qtyText}>{item.quantity}</span>
                                        <button
                                            className={styles.qtyBtn}
                                            onClick={() => onUpdateQuantity(index, 1)}
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => onRemoveItem(index)}
                                    >
                                        <Trash2 size={12} /> Remove
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className={styles.footer}>
                    <div className={styles.summaryRow}>
                        <span>Subtotal</span>
                        <span>₱{subtotal.toFixed(2)}</span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span>VAT (12%)</span>
                        <span>₱{vat.toFixed(2)}</span>
                    </div>
                    <div className={styles.summaryTotal}>
                        <span>Total</span>
                        <span>₱{total.toFixed(2)}</span>
                    </div>

                    <button
                        className={`pos-btn ${styles.checkoutBtn}`}
                        disabled={cartItems.length === 0}
                        onClick={onCheckout}
                    >
                        Proceed to Checkout
                    </button>

                    <button
                        className={styles.clearBtn}
                        onClick={onClearCart}
                        disabled={cartItems.length === 0}
                    >
                        Clear Order
                    </button>
                </div>
            </div>
        </div>
    );
}
