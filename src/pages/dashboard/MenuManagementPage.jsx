import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import ProductDrawer from '../../components/dashboard/ProductDrawer';
import styles from './MenuManagementPage.module.css';

// Mock Data
const initialProducts = [
    { id: 1, name: 'Caramel Macchiato', base_price: 180, is_available: true, category: 'Hot Drinks' },
    { id: 2, name: 'Spanish Latte', base_price: 190, is_available: true, category: 'Hot Drinks' },
    { id: 3, name: 'Matcha Frappe', base_price: 220, is_available: true, category: 'Frappe Drinks' },
    { id: 4, name: 'Cold Brew', base_price: 160, is_available: false, category: 'Cold Drinks' },
    { id: 5, name: 'Blueberry Cheesecake', base_price: 250, is_available: true, category: 'Pastries' },
    { id: 6, name: 'Butter Croissant', base_price: 120, is_available: true, category: 'Pastries' },
];

const categories = ['All', 'Cold Drinks', 'Hot Drinks', 'Blended Drinks', 'Frappe Drinks', 'Pastries'];

export default function MenuManagementPage() {
    const [products, setProducts] = useState(initialProducts);
    const [activeTab, setActiveTab] = useState('All');

    // Drawer state
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null); // null = add mode

    const filteredProducts = activeTab === 'All'
        ? products
        : products.filter(p => p.category === activeTab);

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

    const handleSave = (savedProduct) => {
        if (editingProduct) {
            // Edit existing
            setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
        } else {
            // Add new
            setProducts(prev => [...prev, savedProduct]);
        }
    };

    const handleDelete = (id) => {
        if (!window.confirm('Remove this product from the menu? Existing orders are not affected.')) return;
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const toggleAvailability = (id) => {
        setProducts(prev => prev.map(p =>
            p.id === id ? { ...p, is_available: !p.is_available } : p
        ));
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>Menu Management</h2>
                <button className={`pos-btn ${styles.addBtn}`} onClick={handleOpenAdd}>
                    <Plus size={18} /> Add Product
                </button>
            </div>

            <div className={styles.tabs}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`${styles.tabBtn} ${activeTab === cat ? styles.active : ''}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className={styles.tablePanel}>
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
                                            <div className={styles.productAvatar}>{product.name.charAt(0)}</div>
                                            <div>
                                                <div className={styles.productName}>{product.name}</div>
                                                <div className={styles.productCategory}>{product.category}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={`${styles.td} ${styles.price}`}>
                                        ₱{product.base_price.toFixed(2)}
                                    </td>
                                    <td className={styles.td}>
                                        <button
                                            className={`${styles.toggleSwitch} ${product.is_available ? styles.toggleActive : styles.toggleInactive}`}
                                            onClick={() => toggleAvailability(product.id)}
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
