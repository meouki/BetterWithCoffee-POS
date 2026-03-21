import { useState, useEffect } from 'react';
import { X, Receipt, CheckCircle2 } from 'lucide-react';
import styles from './CheckoutModal.module.css';

export default function CheckoutModal({ isOpen, onClose, cartItems, onComplete }) {
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [tendered, setTendered] = useState('');

    useEffect(() => {
        if (isOpen) {
            setPaymentMethod('Cash');
            setTendered('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const vat = total - (total / 1.12);
    const subtotal = total - vat;

    const tenderedAmount = parseFloat(tendered) || 0;
    const change = tenderedAmount - total;
    const isCashValid = paymentMethod === 'Cash' ? (tenderedAmount >= total) : true;

    const handleConfirm = () => {
        if (!isCashValid) return;

        const orderData = {
            items: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price, // Snapshot total price
                original_price: item.original_price, // Base price
                modifiers: item.modifiers // Array of {name, price}
            })),
            subtotal,
            vat,
            total,
            payment_method: paymentMethod,
            amount_tendered: paymentMethod === 'Cash' ? tenderedAmount : total,
            change: paymentMethod === 'Cash' ? Math.max(0, change) : 0
        };

        // Pass order straight to parent, which will pop the ReceiptModal
        onComplete(orderData);
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>

                <div className={styles.header}>
                    <h2 className={styles.title}>Confirm Order</h2>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.scrollArea}>

                    <h3 className={styles.sectionTitle}>Order Summary</h3>
                    <div className={styles.orderSummary}>
                        {cartItems.map((item, idx) => (
                            <div key={idx} className={styles.summaryRow}>
                                <span className="truncate pr-4">{item.quantity}x {item.name}</span>
                                <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}

                        <div className={`${styles.summaryRow} ${styles.total}`}>
                            <span className={styles.totalLabel}>Total Due</span>
                            <span>₱{total.toFixed(2)}</span>
                        </div>
                    </div>

                    <h3 className={styles.sectionTitle}>Payment Method</h3>
                    <div className={styles.paymentToggle}>
                        <button
                            className={`${styles.toggleBtn} ${paymentMethod === 'Cash' ? styles.active : ''}`}
                            onClick={() => setPaymentMethod('Cash')}
                        >
                            Cash
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${paymentMethod === 'GCash' ? styles.active : ''}`}
                            onClick={() => setPaymentMethod('GCash')}
                        >
                            GCash / Maya
                        </button>
                    </div>

                    {paymentMethod === 'Cash' ? (
                        <div className={styles.amountGroup}>
                            <label className={styles.sectionTitle}>Amount Tendered</label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.currencySymbol}>₱</span>
                                <input
                                    type="number"
                                    value={tendered}
                                    onChange={(e) => setTendered(e.target.value)}
                                    className={styles.amountInput}
                                    placeholder="0.00"
                                    autoFocus
                                />
                            </div>

                            <div className={`${styles.changeRow} ${tenderedAmount > 0 ? (change >= 0 ? styles.changeValid : styles.changeInvalid) : ''}`}>
                                <span>Change</span>
                                <span>₱{Math.max(0, change).toFixed(2)}</span>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.gcashMessage}>
                            <p>Awaiting customer scan.</p>
                            <p className="mt-2 text-xs opacity-70">Confirming will dispatch receipt to printer immediately.</p>
                        </div>
                    )}

                </div>

                <div className={styles.footer}>
                    <button
                        className={`pos-btn ${styles.confirmBtn}`}
                        disabled={!isCashValid}
                        onClick={handleConfirm}
                    >
                        <Receipt size={20} />
                        Confirm & Print Receipt
                    </button>
                </div>
            </div>
        </div>
    );
}
