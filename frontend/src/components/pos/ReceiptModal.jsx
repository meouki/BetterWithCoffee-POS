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
                        <h3 className={styles.brandTitle}>Better with Coffee</h3>
                        <p className={styles.receiptType}>ACKNOWLEDGMENT RECEIPT</p>
                        <div className={styles.businessInfo}>
                            <p>TIN: 000-000-000-000</p>
                            <p>Business Address: Mexico, Pampanga</p>
                        </div>
                        <div className={styles.divider}></div>
                        <p>Order #{id}</p>
                        <p>{dateOpts}</p>
                        <p>Type: {order_type}</p>
                        <div className={styles.divider}></div>
                    </div>

                    <div className={styles.receiptItems}>
                        {items.map((item, idx) => (
                            <div key={idx} className={styles.itemWrapper}>
                                <div className={styles.receiptItem}>
                                    <div className={styles.itemMain}>
                                        <span className={styles.itemQty}>{item.quantity}x</span>
                                        <span className={styles.itemName}>{item.name}</span>
                                    </div>
                                    <span className={styles.itemPrice}>₱{(item.original_price ? item.original_price * item.quantity : item.price * item.quantity).toFixed(2)}</span>
                                </div>
                                
                                {item.modifiers && item.modifiers.length > 0 && (
                                    <div className={styles.itemModifiers}>
                                        {item.modifiers.map((mod, midx) => (
                                            <div key={midx} className={styles.modifierRow}>
                                                <span className={styles.modifierName}>{mod.name}</span>
                                                {parseFloat(mod.price) > 0 && (
                                                    <span className={styles.modifierPrice}>+₱{(parseFloat(mod.price) * item.quantity).toFixed(2)}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                        <div className={styles.totalRow} style={{ marginTop: '8px' }}>
                            <span>Cash</span>
                            <span>{payment_method === 'Cash' ? `₱${receiptData.amount_tendered?.toFixed(2)}` : '---'}</span>
                        </div>
                        <div className={styles.totalRow}>
                            <span>Change</span>
                            <span>₱{receiptData.change?.toFixed(2) ?? '0.00'}</span>
                        </div>
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.receiptFooter}>
                        <p className={styles.legalDisclaimer}>THIS IS NOT AN OFFICIAL RECEIPT</p>
                        <div className={styles.footerDivider}></div>
                        <p className={styles.personalityQuote}>"Fueling your passion, one cup at a time."</p>
                        <p>Thank you for choosing</p>
                        <p className={styles.footerBrand}>Better with Coffee!</p>
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
