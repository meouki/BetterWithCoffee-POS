import { useState } from 'react';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import ProductDrawer from '../../components/dashboard/ProductDrawer';
import { useProductContext } from '../../context/ProductContext';
import { useNotificationContext } from '../../context/NotificationContext';
import styles from './MenuManagementPage.module.css';

export default function MenuManagementPage() {
    const { 
        products, isLoading, error, addProduct, updateProduct, deleteProduct, toggleAvailability,
        categories, addCategory, deleteCategory
    } = useProductContext();
    const { addNotification } = useNotificationContext();
    const [activeTab, setActiveTab] = useState('All');
    const [isManagingCats, setIsManagingCats] = useState(false);
    const [newCatName, setNewCatName] = useState('');

    // Drawer state
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null); // null = add mode

    const filteredProducts = activeTab === 'All'
        ? products
        : products.filter(p => p.category_name === activeTab);

    // --- Handlers ---

    const handleOpenAdd = () => {
        setEditingProduct(null);
        setIsDrawerOpen(true);
    };

    const handleOpenEdit = (product) => {
        setEditingProduct(product);
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setEditingProduct(null);
    };

    const handleSave = async (savedProduct) => {
        try {
            if (editingProduct) {
                // Edit existing
                await updateProduct(savedProduct.id, savedProduct);
                addNotification('MENU_EDIT', 'Product Updated', `Menu item "${savedProduct.name}" was modified.`);
            } else {
                // Add new
                const { id, ...newProductObj } = savedProduct; // strip temp ID
                await addProduct(newProductObj);
                addNotification('MENU_EDIT', 'Product Created', `New menu item "${savedProduct.name}" was added.`);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to save product.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this product from the menu? Existing orders are not affected.')) return;
        try {
            const product = products.find(p => p.id === id);
            await deleteProduct(id);
            if (product) {
                addNotification('MENU_EDIT', 'Product Deleted', `Menu item "${product.name}" was removed.`);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to delete product.");
        }
    };

    const handleToggleAvailability = async (id) => {
        try {
            await toggleAvailability(id);
            const product = products.find(p => p.id === id);
            if (product) {
                const status = !product.is_available ? 'Available' : 'Sold Out';
                addNotification('MENU_EDIT', 'Status Changed', `Product "${product.name}" marked as ${status}.`);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to update availability.");
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>Menu Management</h2>
                <div className={styles.headerActions}>
                    <button className={styles.secondaryBtn} onClick={() => setIsManagingCats(!isManagingCats)}>
                        {isManagingCats ? 'Close Categories' : 'Manage Categories'}
                    </button>
                    <button className={`pos-btn ${styles.addBtn}`} onClick={handleOpenAdd}>
                        <Plus size={18} /> Add Product
                    </button>
                </div>
            </div>

            {isManagingCats && (
                <div className={styles.categoryManager}>
                    <div className={styles.catInputRow}>
                        <input 
                            type="text" 
                            placeholder="New category name (e.g. Fries)" 
                            className={styles.catInput}
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                        />
                        <button 
                            className={styles.addCatBtn}
                            onClick={async () => {
                                if (!newCatName.trim()) return;
                                try {
                                    await addCategory(newCatName);
                                    setNewCatName('');
                                } catch (err) {
                                    alert(err.message);
                                }
                            }}
                        >
                            <Plus size={16} /> Add
                        </button>
                    </div>
                    <div className={styles.catPillList}>
                        {categories.map(cat => (
                            <div key={cat.id} className={styles.catPill}>
                                {cat.name}
                                <button 
                                    className={styles.delCatBtn}
                                    onClick={async () => {
                                        if (window.confirm(`Delete "${cat.name}"? Only empty categories can be deleted.`)) {
                                            try { await deleteCategory(cat.id); } 
                                            catch (err) { alert(err.message); }
                                        }
                                    }}
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={styles.tabs}>
                <button
                    onClick={() => setActiveTab('All')}
                    className={`${styles.tabBtn} ${activeTab === 'All' ? styles.active : ''}`}
                >
                    All
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveTab(cat.name)}
                        className={`${styles.tabBtn} ${activeTab === cat.name ? styles.active : ''}`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            <div className={styles.tablePanel}>
                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px', color: 'var(--color-muted)' }}>
                        <Loader2 className="animate-spin" size={32} />
                    </div>
                ) : error ? (
                    <div className={styles.emptyMessage} style={{ color: 'var(--color-error)' }}>
                        Error loading products: {error}
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>Product</th>
                                    <th className={styles.th}>Base Price</th>
                                    <th className={styles.th}>Availability</th>
                                    <th className={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(product => (
                                    <tr key={product.id} className={styles.tableRow}>
                                        <td className={styles.td}>
                                            <div className={styles.productCell}>
                                                <div className={styles.productAvatar}>
                                                    {product.image_url ? (
                                                        <img src={product.image_url} alt={product.name} className={styles.productImg} />
                                                    ) : (
                                                        product.name.charAt(0)
                                                    )}
                                                </div>
                                                <div>
                                                    <div className={styles.productName}>{product.name}</div>
                                                    <div className={styles.productCategory}>{product.category_name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={`${styles.td} ${styles.price}`}>
                                            ₱{product.base_price.toFixed(2)}
                                        </td>
                                        <td className={styles.td}>
                                            <button
                                                className={`${styles.toggleSwitch} ${product.is_available ? styles.toggleActive : styles.toggleInactive}`}
                                                onClick={() => handleToggleAvailability(product.id)}
                                                title={product.is_available ? 'Mark as sold out' : 'Mark as available'}
                                            >
                                                <div className={`${styles.toggleNub} ${product.is_available ? styles.toggleNubActive : styles.toggleNubInactive}`} />
                                            </button>
                                        </td>
                                        <td className={styles.td}>
                                            <div className={styles.actionCell}>
                                                <button
                                                    className={`${styles.iconBtn} ${styles.edit}`}
                                                    title="Edit product"
                                                    onClick={() => handleOpenEdit(product)}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className={`${styles.iconBtn} ${styles.delete}`}
                                                    title="Delete product"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredProducts.length === 0 && (
                            <div className={styles.emptyMessage}>
                                No products found in this category.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add / Edit Drawer */}
            <ProductDrawer
                isOpen={isDrawerOpen}
                product={editingProduct}
                onClose={handleCloseDrawer}
                onSave={handleSave}
            />
        </div>
    );
}
