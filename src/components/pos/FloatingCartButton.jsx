import { ShoppingCart } from 'lucide-react';
import styles from './FloatingCartButton.module.css';

export default function FloatingCartButton({ itemCount, onClick }) {
    if (itemCount === 0) return null;

    return (
        <button
            className={styles.floatingBtn}
            onClick={onClick}
        >
            <ShoppingCart size={24} />
            <div className={styles.badge} key={itemCount}>
                {itemCount}
            </div>
        </button>
    );
}
