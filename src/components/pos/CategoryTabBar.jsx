import styles from './CategoryTabBar.module.css';

export default function CategoryTabBar({ activeCategory, onSelectCategory }) {
    const categories = [
        'All',
        'Cold Drinks',
        'Hot Drinks',
        'Blended Drinks',
        'Frappe Drinks',
        'Pastries'
    ];

    return (
        <div className={styles.tabBarWrapper}>
            <div className={styles.tabScrollArea}>
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => onSelectCategory(category)}
                        className={`${styles.tabBtn} ${activeCategory === category ? styles.active : styles.inactive}`}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
}
