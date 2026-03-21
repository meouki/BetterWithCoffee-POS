import { useState, useEffect } from 'react';
import { X, Camera, Trash2, Plus } from 'lucide-react';
import { useProductContext } from '../../context/ProductContext';
import styles from './ProductDrawer.module.css';

const emptyForm = {
    name: '',
    category_name: '', // Will be set to first category in useEffect
    base_price: '',
    is_available: true,
    modifiers: false,
    has_sugar_selector: false,
    has_milk_selector: false,
    addons: [],
    image_url: '',
};

export default function ProductDrawer({ isOpen, product, onClose, onSave }) {
    const { categories } = useProductContext();
    const isEditing = !!product;
    const [form, setForm] = useState(emptyForm);
    const [originalPrice, setOriginalPrice] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // Sync form with product being edited
    useEffect(() => {
        if (isOpen) {
            if (product) {
                setForm({
                    name: product.name,
                    category_name: product.category_name,
                    base_price: String(product.base_price),
                    is_available: product.is_available,
                    modifiers: product.modifiers || false,
                    has_sugar_selector: product.has_sugar_selector || false,
                    has_milk_selector: product.has_milk_selector || false,
                    addons: product.addons || [],
                    image_url: product.image_url || '',
                });
                setOriginalPrice(product.base_price);
            } else {
                setForm({
                    ...emptyForm,
                    category_name: categories.length > 0 ? categories[0].name : ''
                });
                setOriginalPrice(null);
            }
            setSelectedFile(null);
        }
    }, [isOpen, product, categories]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // In a real app, you'd upload to server here.
        // For now, we'll create a local preview URL.
        const previewUrl = URL.createObjectURL(file);
        setSelectedFile(file);
        handleChange('image_url', previewUrl);
    };

    const removeImage = (e) => {
        e.stopPropagation();
        setSelectedFile(null);
        handleChange('image_url', '');
    };

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
            category_name: form.category_name,
            base_price: parsedPrice,
            is_available: form.is_available,
            modifiers: form.modifiers || form.addons.length > 0 || form.has_sugar_selector || form.has_milk_selector,
            has_sugar_selector: form.has_sugar_selector,
            has_milk_selector: form.has_milk_selector,
            addons: form.addons,
            image_url: form.image_url,
            imageFile: selectedFile // Pass the actual file
        });
        onClose();
    };

    const handleAddAddon = () => {
        setForm(prev => ({
            ...prev,
            addons: [...prev.addons, { name: '', price: '0' }]
        }));
    };

    const handleUpdateAddon = (index, field, value) => {
        setForm(prev => {
            const newAddons = [...prev.addons];
            newAddons[index] = { ...newAddons[index], [field]: value };
            return { ...prev, addons: newAddons };
        });
    };

    const handleRemoveAddon = (index) => {
        setForm(prev => ({
            ...prev,
            addons: prev.addons.filter((_, i) => i !== index)
        }));
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
                    {/* Image Upload */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Product Image</label>
                        <div className={styles.imageUploadContainer}>
                            {form.image_url ? (
                                <>
                                    <img src={form.image_url} alt="Preview" className={styles.previewImage} />
                                    <button className={styles.removeImageBtn} onClick={removeImage} title="Remove image">
                                        <Trash2 size={16} />
                                    </button>
                                </>
                            ) : (
                                <div className={styles.uploadPlaceholder}>
                                    <Camera size={32} />
                                    <span>Click to upload photo</span>
                                    <span style={{ fontSize: '0.7rem' }}>(WebP, PNG, JPG)</span>
                                </div>
                            )}
                            <input
                                type="file"
                                className={styles.hiddenInput}
                                accept="image/webp, image/png, image/jpeg"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

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
                            value={form.category_name}
                            onChange={e => handleChange('category_name', e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
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

                    {/* Customizations Section */}
                    <div className={styles.sectionDivider}>Customizations</div>

                    <div className={styles.fieldGroup}>
                        <div className={styles.availRow}>
                            <div>
                                <div className={styles.availLabel}>Sugar Level Selector</div>
                                <div className={styles.availDesc}>Enable 0% - 100% options in POS</div>
                            </div>
                            <button
                                className={`${styles.toggle} ${form.has_sugar_selector ? styles.toggleOn : styles.toggleOff}`}
                                onClick={() => handleChange('has_sugar_selector', !form.has_sugar_selector)}
                            >
                                <div className={`${styles.toggleNub} ${form.has_sugar_selector ? styles.nubOn : styles.nubOff}`} />
                            </button>
                        </div>
                    </div>

                    <div className={styles.fieldGroup}>
                        <div className={styles.availRow}>
                            <div>
                                <div className={styles.availLabel}>Milk Alternative Selector</div>
                                <div className={styles.availDesc}>Enable Oat/Almond options in POS</div>
                            </div>
                            <button
                                className={`${styles.toggle} ${form.has_milk_selector ? styles.toggleOn : styles.toggleOff}`}
                                onClick={() => handleChange('has_milk_selector', !form.has_milk_selector)}
                            >
                                <div className={`${styles.toggleNub} ${form.has_milk_selector ? styles.nubOn : styles.nubOff}`} />
                            </button>
                        </div>
                    </div>

                    <div className={styles.fieldGroup}>
                        <div className={styles.addonHeader}>
                            <label className={styles.label}>Product Add-ons</label>
                            <button className={styles.addAddonBtn} onClick={handleAddAddon}>
                                <Plus size={14} /> Add Row
                            </button>
                        </div>
                        
                        <div className={styles.addonList}>
                            {form.addons.map((addon, index) => (
                                <div key={index} className={styles.addonRow}>
                                    <input 
                                        className={styles.addonNameInput} 
                                        placeholder="Add-on Name (e.g. Hot Sauce)"
                                        value={addon.name}
                                        onChange={(e) => handleUpdateAddon(index, 'name', e.target.value)}
                                    />
                                    <div className={styles.addonPriceWrapper}>
                                        <span>₱</span>
                                        <input 
                                            type="number"
                                            className={styles.addonPriceInput}
                                            value={addon.price}
                                            onChange={(e) => handleUpdateAddon(index, 'price', e.target.value)}
                                        />
                                    </div>
                                    <button className={styles.removeAddonBtn} onClick={() => handleRemoveAddon(index)}>
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            {form.addons.length === 0 && (
                                <div className={styles.emptyAddons}>No specific add-ons defined for this product.</div>
                            )}
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
