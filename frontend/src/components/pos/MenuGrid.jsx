import ProductCard from './ProductCard';
import { useProductContext } from '../../context/ProductContext';
import { Loader2 } from 'lucide-react';
import styles from './MenuGrid.module.css';

export default function MenuGrid({ category, onProductClick }) {
    const { products, isLoading, error } = useProductContext();

    const filtered = category === 'All'
        ? products
        : products.filter(p => p.category_name === category);

    if (isLoading) {
        return (
            <div className={styles.gridWrapper} style={{ display: 'flex', justifyContent: 'center', gridColumn: '1 / -1', padding: '48px', color: 'var(--color-muted)' }}>
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.gridWrapper} style={{ display: 'flex', justifyContent: 'center', gridColumn: '1 / -1', padding: '48px', color: 'var(--color-error)' }}>
                Error loading products.
            </div>
        );
    }

    return (
        <div className={styles.gridWrapper}>
            {filtered.map(product => (
                <ProductCard
                    key={product.id}
                    {...product}
                    onAdd={onProductClick}
                />
            ))}
            {filtered.length === 0 && (
                <div className={styles.emptyState}>
                    <p>No items found in this category.</p>
                </div>
            )}
        </div>
    );
}
