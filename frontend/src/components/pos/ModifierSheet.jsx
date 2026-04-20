import { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { productSizesApi } from '../../api/inventory';
import styles from './ModifierSheet.module.css';

export default function ModifierSheet({ isOpen, product, onClose, onAddToCart }) {
    const [sugarLevel, setSugarLevel] = useState('100%');
    const [selectedAddons, setSelectedAddons] = useState([]); // Array of addon objects { name, price }
    
    // Sizing state
    const [sizes, setSizes] = useState([]);
    const [selectedSize, setSelectedSize] = useState(null);
    const [isLoadingSizes, setIsLoadingSizes] = useState(false);

    const [totalPrice, setTotalPrice] = useState(0);

    const hasSugar = !!product?.has_sugar_selector;
    const hasSizes = !!product?.has_sizes;
    
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
            setSelectedAddons([]);
            setSelectedSize(null);
            
            if (hasSizes) {
                setIsLoadingSizes(true);
                productSizesApi.getByProduct(product.id)
                    .then(data => {
                        setSizes(data);
                        if (data.length > 0) {
                            setSelectedSize(data[0]); // Default to first size
                        }
                    })
                    .catch(err => console.error("Failed to load sizes:", err))
                    .finally(() => setIsLoadingSizes(false));
            } else {
                setSizes([]);
            }
        }
    }, [product, hasSizes]);

    useEffect(() => {
        if (!product) return;

        let extraCost = 0;

        // Dynamic Add-ons
        selectedAddons.forEach(addon => {
            extraCost += parseFloat(addon.price || 0);
        });

        const activeBasePrice = selectedSize ? (product.base_price + parseFloat(selectedSize.price_adjustment || 0)) : product.base_price;
        setTotalPrice(activeBasePrice + extraCost);
    }, [sugarLevel, selectedAddons, selectedSize, product]);

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
        
        if (hasSizes && selectedSize) {
            const adj = parseFloat(selectedSize.price_adjustment || 0);
            selectedMods.push({ name: `Size: ${selectedSize.name}`, price: 0 }); // price is baked into original_price
        }
        
        if (hasSugar && sugarLevel !== '100%') {
            selectedMods.push({ name: `Sugar: ${sugarLevel}`, price: 0 });
        }
        if (selectedAddons.length > 0) {
            selectedMods.push(...selectedAddons.map(a => ({ 
                name: a.name, 
                price: parseFloat(a.price || 0) 
            })));
        }

        const baseForCart = selectedSize ? (product.base_price + parseFloat(selectedSize.price_adjustment || 0)) : product.base_price;

        onAddToCart({
            ...product,
            modifiers: selectedMods,
            price: totalPrice,
            original_price: baseForCart
        });

        onClose();
    };

    const activeBasePriceDisplay = selectedSize ? (product.base_price + parseFloat(selectedSize.price_adjustment || 0)) : (product.base_price || 0);

    return (
        <div className={styles.overlay}>
            <div className={styles.sheet}>

                <div className={styles.header}>
                    <h2 className={styles.title}>{product.name}</h2>
                    <p className={styles.basePrice}>Base: ₱{activeBasePriceDisplay.toFixed(2)}</p>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.scrollArea}>

                    {hasSizes && (
                        <div className={styles.group}>
                            <h3 className={styles.groupTitle}>Size Options</h3>
                            {isLoadingSizes ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-muted)', fontSize: '0.875rem' }}>
                                    <Loader size={16} className="spin" /> Loading sizes...
                                </div>
                            ) : sizes.length === 0 ? (
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-warning)' }}>No sizes defined. Please set up sizes in Menu Management.</p>
                            ) : (
                                <div className={styles.grid2}>
                                    {sizes.map(size => {
                                        const sizePrice = product.base_price + parseFloat(size.price_adjustment || 0);
                                        return (
                                            <button
                                                key={size.id}
                                                onClick={() => setSelectedSize(size)}
                                                className={`${styles.modBtn} ${selectedSize?.id === size.id ? styles.active : ''}`}
                                            >
                                                <span>{size.name}</span>
                                                <span className={styles.modCost}>₱{sizePrice.toFixed(2)}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

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

                    {!hasSizes && !hasSugar && addons.length === 0 && (
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
