import { useState } from 'react';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import ProductDrawer from '../../components/dashboard/ProductDrawer';
import { useProductContext } from '../../context/ProductContext';
import { toast } from 'react-hot-toast';
import styles from './MenuManagementPage.module.css';

export default function MenuManagementPage() {
    const { 
        products, isLoading, error, addProduct, updateProduct, deleteProduct, toggleAvailability,
        categories, addCategory, deleteCategory
    } = useProductContext();
    
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
                toast.success('Product updated successfully');
            } else {
                // Add new
                const { id, ...newProductObj } = savedProduct; // strip temp ID
                await addProduct(newProductObj);
                toast.success('Product created successfully');
            }
        } catch (err) {
            console.error(err);
            alert("Failed to save product.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this product?')) {
            try {
                await deleteProduct(id);
                toast.success('Product deleted');
            } catch (err) {
                console.error(err);
                alert("Failed to delete product.");
            }
        }
    };

    const handleToggleAvailability = async (id) => {
        try {
            await toggleAvailability(id);
            toast.success('Availability updated');
        } catch (err) {
            console.error(err);
            alert("Failed to update availability.");
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCatName.trim()) return;
        try {
            await addCategory(newCatName.trim());
            setNewCatName('');
            toast.success('Category added');
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Failed to add category');
        }
    };

    const handleDeleteCategory = async (id, name) => {
        if (window.confirm(`Delete category "${name}"? This won't delete products.`)) {
            try {
                await deleteCategory(id);
                toast.success('Category removed');
            } catch (err) {
                console.error(err);
            }
        }
    };

    if (isLoading) return <div className="p-8 text-center text-muted"><Loader2 className="animate-spin mx-auto" size={48} /></div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>Menu Management</h2>
                <div className={styles.headerActions}>
                    <button 
                        className={styles.secondaryBtn}
                        onClick={() => setIsManagingCats(!isManagingCats)}
                    >
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
                            placeholder="New category name (e.g. Fries)"
                            className={styles.catInput}
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                        />
                        <button 
                            className={styles.addCatBtn}
                            onClick={handleAddCategory}
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
                                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
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
                    className={`${styles.tabBtn} ${activeTab === 'All' ? styles.active : ''}`}
                    onClick={() => setActiveTab('All')}
                >
                    All
                </button>
                {categories.map(cat => (
                    <button 
                        key={cat.id}
                        className={`${styles.tabBtn} ${activeTab === cat.name ? styles.active : ''}`}
                        onClick={() => setActiveTab(cat.name)}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            <div className={styles.tablePanel}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Actions</th>
                                <th className={styles.th}>Product</th>
                                <th className={styles.th}>Base Price</th>
                                <th className={styles.th}>Availability</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id} className={styles.tableRow}>
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

            <ProductDrawer 
                isOpen={isDrawerOpen}
                product={editingProduct}
                categories={categories}
                onClose={handleCloseDrawer}
                onSave={handleSave}
            />
        </div>
    );
}
