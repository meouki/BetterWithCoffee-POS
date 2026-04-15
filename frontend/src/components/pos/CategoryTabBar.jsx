import { useProductContext } from '../../context/ProductContext';
import { 
    LayoutGrid, 
    Coffee, 
    CupSoda, 
    IceCream, 
    Utensils, 
    Cookie, 
    Flame, 
    Waves 
} from 'lucide-react';
import styles from './CategoryTabBar.module.css';

const CATEGORY_ICONS = {
    'All': LayoutGrid,
    'Coffee': Coffee,
    'Hot Drinks': Flame,
    'Cold Drinks': Waves,
    'Blended Drinks': CupSoda,
    'Snacks': Cookie,
    'Dessert': IceCream,
    'Meals': Utensils,
};

export default function CategoryTabBar({ activeCategory, onSelectCategory }) {
    const { categories } = useProductContext();
    const allCategories = ['All', ...categories.map(c => c.name)];

    const getIcon = (category) => {
        const Icon = CATEGORY_ICONS[category] || Coffee;
        return <Icon size={20} className={styles.icon} />;
    };

    return (
        <div className={styles.tabBarWrapper}>
            <div className={styles.tabScrollArea}>
                {allCategories.map((category) => (
                    <button
                        key={category}
                        onClick={() => onSelectCategory(category)}
                        className={`${styles.tabBtn} ${activeCategory === category ? styles.active : styles.inactive}`}
                    >
                        {getIcon(category)}
                        <span>{category}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
