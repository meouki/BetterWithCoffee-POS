import { Utensils, ShoppingBag } from 'lucide-react';
import styles from './OrderTypeSelector.module.css';

export default function OrderTypeSelector({ onSelect }) {
    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2 className={styles.title}>Select Order Type</h2>
                <div className={styles.btnGroup}>
                    <button
                        onClick={() => onSelect('Dine-In')}
                        className={`pos-btn ${styles.typeBtn} ${styles.dineIn}`}
                    >
                        <Utensils size={24} />
                        <span className={styles.btnText}>Dine-In</span>
                    </button>

                    <button
                        onClick={() => onSelect('Take-Out')}
                        className={`pos-btn ${styles.typeBtn} ${styles.takeOut}`}
                    >
                        <ShoppingBag size={24} />
                        <span className={styles.btnText}>Take-Out</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
