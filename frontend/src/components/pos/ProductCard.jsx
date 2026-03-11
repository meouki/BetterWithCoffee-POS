import { Plus } from 'lucide-react';
import styles from './ProductCard.module.css';

export default function ProductCard({ id, name, base_price, image_url, is_available, modifiers, onAdd }) {
    return (
        <button
            onClick={() => onAdd({ id, name, base_price, modifiers })}
            disabled={!is_available}
            className={`pos-btn ${styles.cardWrapper} ${is_available ? styles.available : styles.unavailable}`}
        >
            <div className={styles.imageContainer}>
                {image_url ? (
                    <img src={image_url} alt={name} className={styles.productImg} />
                ) : (
                    <span className={styles.placeholderText}>{name.charAt(0)}</span>
                )}
            </div>

            <div className={styles.infoContainer}>
                <h3 className={styles.productName}>{name}</h3>
                <div className={styles.bottomRow}>
                    <span className={styles.price}>₱{base_price.toFixed(2)}</span>
                    <div className={styles.addBtn}>
                        <Plus size={14} />
                    </div>
                </div>
            </div>

            {!is_available && (
                <div className={styles.soldOutOverlay}>
                    <span className={styles.soldOutBadge}>Sold Out</span>
                </div>
            )}
        </button>
    );
}
