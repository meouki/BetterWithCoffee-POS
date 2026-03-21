import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './ModifierSheet.module.css';

export default function ModifierSheet({ isOpen, product, onClose, onAddToCart }) {
    const [sugarLevel, setSugarLevel] = useState('100%');
    const [milkType, setMilkType] = useState('Regular');
    const [selectedAddons, setSelectedAddons] = useState([]); // Array of addon objects { name, price }
    const [totalPrice, setTotalPrice] = useState(0);

    const hasSugar = !!product?.has_sugar_selector;
    const hasMilk = !!product?.has_milk_selector;
    
    // Safety parse in case Sequelize getter hasn't run on the frontend object
    let addons = [];
    try {
        addons = typeof product?.addons === 'string' ? JSON.parse(product.addons) : (product?.addons || []);
    } catch (e) {
        addons = [];
    }
    
    useEffect(() => {
        if (product) {
            setTotalPrice(product.base_price);
            // Reset selections
            setSugarLevel('100%');
            setMilkType('Regular');
            setSelectedAddons([]);
        }
    }, [product]);

    useEffect(() => {
        if (!product) return;

        let extraCost = 0;

        // Milk options
        if (hasMilk) {
            if (milkType === 'Oat Milk') extraCost += 20;
            if (milkType === 'Almond Milk') extraCost += 25;
        }

        // Dynamic Add-ons
        selectedAddons.forEach(addon => {
            extraCost += parseFloat(addon.price || 0);
        });

        setTotalPrice(product.base_price + extraCost);
    }, [sugarLevel, milkType, selectedAddons, product, hasMilk]);

    if (!isOpen || !product) return null;

    const toggleAddOn = (addon) => {
        const isSelected = selectedAddons.some(a => a.name === addon.name);
        if (isSelected) {
            setSelectedAddons(selectedAddons.filter(a => a.name !== addon.name));
        } else {
            setSelectedAddons([...selectedAddons, addon]);
        }
    };

    const handleConfirm = () => {
        const selectedMods = [];
        
        if (hasSugar && sugarLevel !== '100%') {
            selectedMods.push({ name: `Sugar: ${sugarLevel}`, price: 0 });
        }
        if (hasMilk && milkType !== 'None') {
            // Find milk price if any (assuming milk alternatives might have prices in the future, 
            // but for now we'll just store the selection)
            selectedMods.push({ name: `Milk: ${milkType}`, price: 0 });
        }
        if (selectedAddons.length > 0) {
            selectedMods.push(...selectedAddons.map(a => ({ 
                name: a.name, 
                price: parseFloat(a.price || 0) 
            })));
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

                    {hasSugar && (
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
                    )}

                    {hasMilk && (
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
                    )}

                    {addons.length > 0 && (
                        <div className={styles.group}>
                            <h3 className={styles.groupTitle}>Add-ons</h3>
                            <div className={styles.grid2}>
                                {addons.map((addon, idx) => {
                                    const isSelected = selectedAddons.some(a => a.name === addon.name);
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => toggleAddOn(addon)}
                                            className={`${styles.modBtn} ${isSelected ? styles.active : ''}`}
                                        >
                                            <span>{addon.name}</span>
                                            {parseFloat(addon.price) > 0 && (
                                                <span className={styles.modCost}>+₱{parseFloat(addon.price)}</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {!hasSugar && !hasMilk && addons.length === 0 && (
                        <div className={styles.emptyMods}>
                            No specific customizations defined for this item.
                        </div>
                    )}

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
