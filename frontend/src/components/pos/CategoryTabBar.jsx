import { useProductContext } from '../../context/ProductContext';
import styles from './CategoryTabBar.module.css';

export default function CategoryTabBar({ activeCategory, onSelectCategory }) {
    const { categories } = useProductContext();
    const allCategories = ['All', ...categories.map(c => c.name)];

    return (
        <div className={styles.tabBarWrapper}>
            <div className={styles.tabScrollArea}>
                {allCategories.map((category) => (
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
