import ProductCard from './ProductCard';
import styles from './MenuGrid.module.css';

export default function MenuGrid({ category, onProductClick }) {
    const mockProducts = [
        { id: 1, name: 'Caramel Macchiato', base_price: 180, is_available: true, category: 'Hot Drinks', modifiers: true },
        { id: 2, name: 'Spanish Latte', base_price: 190, is_available: true, category: 'Hot Drinks', modifiers: true },
        { id: 3, name: 'Matcha Frappe', base_price: 220, is_available: true, category: 'Frappe Drinks', modifiers: true },
        { id: 4, name: 'Cold Brew', base_price: 160, is_available: true, category: 'Cold Drinks', modifiers: false },
        { id: 5, name: 'Blueberry Cheesecake', base_price: 250, is_available: false, category: 'Pastries', modifiers: false },
        { id: 6, name: 'Butter Croissant', base_price: 120, is_available: true, category: 'Pastries', modifiers: false },
    ];

    const filtered = category === 'All'
        ? mockProducts
        : mockProducts.filter(p => p.category === category);

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
