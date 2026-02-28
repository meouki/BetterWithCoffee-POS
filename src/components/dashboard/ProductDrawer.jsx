import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './ProductDrawer.module.css';

const CATEGORIES = ['Cold Drinks', 'Hot Drinks', 'Blended Drinks', 'Frappe Drinks', 'Pastries'];

const emptyForm = {
    name: '',
    category: 'Hot Drinks',
    base_price: '',
    is_available: true,
};

export default function ProductDrawer({ isOpen, product, onClose, onSave }) {
    const isEditing = !!product;
    const [form, setForm] = useState(emptyForm);
    const [originalPrice, setOriginalPrice] = useState(null);

    // Sync form with product being edited
    useEffect(() => {
        if (isOpen) {
            if (product) {
                setForm({
                    name: product.name,
                    category: product.category,
                    base_price: String(product.base_price),
                    is_available: product.is_available,
                });
                setOriginalPrice(product.base_price);
            } else {
                setForm(emptyForm);
                setOriginalPrice(null);
            }
        }
    }, [isOpen, product]);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        const parsedPrice = parseFloat(form.base_price);
        if (!form.name.trim() || isNaN(parsedPrice) || parsedPrice <= 0) return;

        onSave({
            ...(product || {}),
            id: product?.id ?? Date.now(), // Temp ID for new products
            name: form.name.trim(),
            category: form.category,
            base_price: parsedPrice,
            is_available: form.is_available,
        });
        onClose();
    };

    if (!isOpen) return null;

    const priceChanged = isEditing && parseFloat(form.base_price) !== originalPrice;

    return (
        <>
            <div className={styles.drawerBackdrop} onClick={onClose} />
            <div className={styles.drawer} role="dialog" aria-modal="true">
                <div className={styles.drawerHeader}>
                    <h2 className={styles.drawerTitle}>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.drawerBody}>
                    {/* Product Name */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Product Name</label>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="e.g. Spanish Latte"
                            value={form.name}
                            onChange={e => handleChange('name', e.target.value)}
                        />
                    </div>

                    {/* Category */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Category</label>
                        <select
                            className={styles.select}
                            value={form.category}
                            onChange={e => handleChange('category', e.target.value)}
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Base Price */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Base Price</label>
                        <div className={styles.priceWrapper}>
                            <span className={styles.currencySymbol}>₱</span>
                            <input
                                className={`${styles.input} ${styles.priceInput}`}
                                type="number"
                                min="0"
                                step="5"
                                placeholder="0.00"
                                value={form.base_price}
                                onChange={e => handleChange('base_price', e.target.value)}
                            />
                        </div>
                        {priceChanged && (
                            <p className={styles.priceWarning}>
                                ⚠ Changing price will not affect past orders. Historical sales use snapshot prices.
                            </p>
                        )}
                    </div>

                    {/* Availability */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Availability</label>
                        <div className={styles.availRow}>
                            <span className={styles.availLabel}>
                                {form.is_available ? 'Available on menu' : 'Hidden (Sold Out)'}
                            </span>
                            <button
                                className={`${styles.toggle} ${form.is_available ? styles.toggleOn : styles.toggleOff}`}
                                onClick={() => handleChange('is_available', !form.is_available)}
                            >
                                <div className={`${styles.toggleNub} ${form.is_available ? styles.nubOn : styles.nubOff}`} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles.drawerFooter}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button className={styles.saveBtn} onClick={handleSave}>
                        {isEditing ? 'Save Changes' : 'Add Product'}
                    </button>
                </div>
            </div>
        </>
    );
}
