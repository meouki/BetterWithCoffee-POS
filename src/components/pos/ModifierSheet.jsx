import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './ModifierSheet.module.css';

export default function ModifierSheet({ isOpen, product, onClose, onAddToCart }) {
    const [sugarLevel, setSugarLevel] = useState('100%');
    const [milkType, setMilkType] = useState('Regular');
    const [addOns, setAddOns] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        if (product) {
            setTotalPrice(product.base_price);
            // Reset selections
            setSugarLevel('100%');
            setMilkType('Regular');
            setAddOns([]);
        }
    }, [product]);

    useEffect(() => {
        if (!product) return;

        let extraCost = 0;

        // Milk options
        if (milkType === 'Oat Milk') extraCost += 20;
        if (milkType === 'Almond Milk') extraCost += 25;

        // Add-ons
        if (addOns.includes('Extra Shot')) extraCost += 30;
        if (addOns.includes('Whipped Cream')) extraCost += 15;
        if (addOns.includes('Syrup')) extraCost += 10;

        setTotalPrice(product.base_price + extraCost);
    }, [sugarLevel, milkType, addOns, product]);

    if (!isOpen || !product) return null;

    const toggleAddOn = (item) => {
        if (addOns.includes(item)) {
            setAddOns(addOns.filter(a => a !== item));
        } else {
            setAddOns([...addOns, item]);
        }
    };

    const handleConfirm = () => {
        const selectedMods = [
            `Sugar: ${sugarLevel}`,
            `Milk: ${milkType}`
        ];

        if (addOns.length > 0) {
            selectedMods.push(...addOns.map(a => `+${a}`));
        }

        onAddToCart({
            ...product,
            modifiers: selectedMods,
            price: totalPrice,
            original_price: product.base_price
        });

        onClose();
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.sheet}>

                <div className={styles.header}>
                    <h2 className={styles.title}>{product.name}</h2>
                    <p className={styles.basePrice}>Base: ₱{product.base_price.toFixed(2)}</p>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.scrollArea}>

                    <div className={styles.group}>
                        <h3 className={styles.groupTitle}>Sugar Level</h3>
                        <div className={styles.grid}>
                            {['0%', '25%', '50%', '75%', '100%'].map(level => (
                                <button
                                    key={level}
                                    onClick={() => setSugarLevel(level)}
                                    className={`${styles.modBtn} ${sugarLevel === level ? styles.active : ''}`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.group}>
                        <h3 className={styles.groupTitle}>Milk Alternative</h3>
                        <div className={styles.grid2}>
                            <button
                                onClick={() => setMilkType('Regular')}
                                className={`${styles.modBtn} ${milkType === 'Regular' ? styles.active : ''}`}
                            >
                                Regular
                            </button>
                            <button
                                onClick={() => setMilkType('Oat Milk')}
                                className={`${styles.modBtn} ${milkType === 'Oat Milk' ? styles.active : ''}`}
                            >
                                <span>Oat Milk</span>
                                <span className={styles.modCost}>+₱20</span>
                            </button>
                            <button
                                onClick={() => setMilkType('Almond Milk')}
                                className={`${styles.modBtn} ${milkType === 'Almond Milk' ? styles.active : ''}`}
                            >
                                <span>Almond Milk</span>
                                <span className={styles.modCost}>+₱25</span>
                            </button>
                        </div>
                    </div>

                    <div className={styles.group}>
                        <h3 className={styles.groupTitle}>Add-ons</h3>
                        <div className={styles.grid2}>
                            <button
                                onClick={() => toggleAddOn('Extra Shot')}
                                className={`${styles.modBtn} ${addOns.includes('Extra Shot') ? styles.active : ''}`}
                            >
                                <span>Extra Shot</span>
                                <span className={styles.modCost}>+₱30</span>
                            </button>
                            <button
                                onClick={() => toggleAddOn('Whipped Cream')}
                                className={`${styles.modBtn} ${addOns.includes('Whipped Cream') ? styles.active : ''}`}
                            >
                                <span>Whipped Cream</span>
                                <span className={styles.modCost}>+₱15</span>
                            </button>
                            <button
                                onClick={() => toggleAddOn('Syrup')}
                                className={`${styles.modBtn} ${addOns.includes('Syrup') ? styles.active : ''}`}
                            >
                                <span>Syrup</span>
                                <span className={styles.modCost}>+₱10</span>
                            </button>
                        </div>
                    </div>

                </div>

                <div className={styles.footer}>
                    <div className={styles.totalRow}>
                        <span>Item Total</span>
                        <span className={styles.totalPrice}>₱{totalPrice.toFixed(2)}</span>
                    </div>
                    <button
                        className={`pos-btn ${styles.addBtn}`}
                        onClick={handleConfirm}
                    >
                        Add to Order
                    </button>
                </div>

            </div>
        </div>
    );
}
