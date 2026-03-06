import { CheckCircle2, Copy, FileText, Printer, RotateCcw } from 'lucide-react';
import styles from './ReceiptModal.module.css';

export default function ReceiptModal({ isOpen, receiptData, onNewOrder }) {
    if (!isOpen || !receiptData) return null;

    const { items, subtotal, vat, total, payment_method, order_type, timestamp, id } = receiptData;
    const dateOpts = new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(timestamp));

    const handlePrint = () => {
        // In a real app, this would hit /api/print. 
        // We'll simulate a success toast here.
        import('react-hot-toast').then(({ toast }) => {
            toast.success('Sent to Thermal Printer');
        });
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>

                <h2 className={styles.successTitle}>
                    <CheckCircle2 size={32} className={styles.successIcon} />
                    Order Complete
                </h2>

                <div className={styles.receiptPaper}>
                    <div className={styles.receiptHeader}>
                        <h3>Better with Coffee</h3>
                        <p>POS System</p>
                        <div className={styles.divider}></div>
                        <p>Order #{id}</p>
                        <p>{dateOpts}</p>
                        <p>Type: {order_type}</p>
                        <div className={styles.divider}></div>
                    </div>

                    <div className={styles.receiptItems}>
                        {items.map((item, idx) => (
                            <div key={idx} className={styles.receiptItem}>
                                <div className={styles.itemMain}>
                                    <span className={styles.itemQty}>{item.quantity}x</span>
                                    <span className={styles.itemName}>{item.name}</span>
                                </div>
                                <span className={styles.itemPrice}>₱{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.receiptTotals}>
                        <div className={styles.totalRow}>
                            <span>Subtotal</span>
                            <span>₱{subtotal.toFixed(2)}</span>
                        </div>
                        <div className={styles.totalRow}>
                            <span>VAT (12%)</span>
                            <span>₱{vat.toFixed(2)}</span>
                        </div>
                        <div className={styles.grandTotal}>
                            <span>Total</span>
                            <span>₱{total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.receiptFooter}>
                        <p>Payment: {payment_method}</p>
                        <p>Thank you for choosing</p>
                        <p>Better with Coffee!</p>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={`pos-btn ${styles.printBtn}`} onClick={handlePrint}>
                        <Printer size={18} />
                        Print Receipt
                    </button>
                    <button className={`pos-btn ${styles.newOrderBtn}`} onClick={onNewOrder}>
                        <RotateCcw size={18} />
                        New Order
                    </button>
                </div>

            </div>
        </div>
    );
}
