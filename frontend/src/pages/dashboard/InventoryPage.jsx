import { useState, useEffect, useCallback } from 'react';
import { PackagePlus, Edit2, Trash2, X, Check, RefreshCw, History, Package, AlertTriangle } from 'lucide-react';
import { inventoryApi } from '../../api/inventory';
import toast from 'react-hot-toast';
import styles from './InventoryPage.module.css';

const emptyForm = { name: '', category: '', stock: '', unit: '', threshold: '' };

function IngredientDrawer({ isOpen, ingredient, onClose, onSaved, existingCategories = [] }) {
    const isEditing = !!ingredient;
    const [form, setForm] = useState(emptyForm);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setForm(ingredient
                ? { name: ingredient.name, category: ingredient.category, stock: String(ingredient.stock), unit: ingredient.unit, threshold: String(ingredient.threshold || 0) }
                : emptyForm
            );
        }
    }, [isOpen, ingredient]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!form.name.trim() || !form.unit.trim()) return toast.error('Name and unit are required.');
        setIsSaving(true);
        try {
            if (isEditing) {
                const updated = await inventoryApi.update(ingredient.id, {
                    name: form.name.trim(),
                    category: form.category.trim(),
                    stock: Math.max(0, parseFloat(form.stock) || 0),
                    unit: form.unit.trim(),
                    threshold: Math.max(0, parseFloat(form.threshold) || 0),
                });
                onSaved(updated, 'edit');
                toast.success('Ingredient updated');
            } else {
                const created = await inventoryApi.create({
                    name: form.name.trim(),
                    category: form.category.trim() || 'General',
                    stock: Math.max(0, parseFloat(form.stock) || 0),
                    unit: form.unit.trim(),
                    threshold: Math.max(0, parseFloat(form.threshold) || 0),
                });
                onSaved(created, 'add');
                toast.success('Ingredient added');
            }
            onClose();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className={styles.drawerBackdrop} onClick={onClose} />
            <div className={styles.drawer} role="dialog">
                <div className={styles.drawerHeader}>
                    <h2 className={styles.drawerTitle}>{isEditing ? 'Edit Ingredient' : 'Add Ingredient'}</h2>
                    <button className={styles.drawerCloseBtn} onClick={onClose}><X size={20} /></button>
                </div>
                <div className={styles.drawerBody}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Ingredient Name</label>
                        <input className={styles.input} maxLength={100} placeholder="e.g. Coffee Beans" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Category</label>
                        <input list="category-options" className={styles.input} maxLength={50} placeholder="e.g. Raw Materials, Dairy" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
                        <datalist id="category-options">
                            {existingCategories.map((cat, idx) => (
                                <option key={idx} value={cat} />
                            ))}
                        </datalist>
                    </div>
                    <div className={styles.fieldRow}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Current Stock</label>
                            <input className={styles.input} type="number" min="0" max="100000" step="0.01" placeholder="0" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Unit</label>
                            <input list="common-units" className={styles.input} maxLength={20} placeholder="g, ml, pcs, kg" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} />
                            <datalist id="common-units">
                                <option value="g">Grams</option>
                                <option value="kg">Kilograms</option>
                                <option value="ml">Milliliters</option>
                                <option value="L">Liters</option>
                                <option value="oz">Ounces</option>
                                <option value="pcs">Pieces</option>
                                <option value="shots">Shots</option>
                                <option value="pumps">Pumps</option>
                                <option value="cups">Cups</option>
                            </datalist>
                        </div>
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Low Stock Threshold</label>
                        <input className={styles.input} type="number" min="0" max="100000" step="0.01" placeholder="0 to disable alerts" value={form.threshold} onChange={e => setForm(p => ({ ...p, threshold: e.target.value }))} />
                        <p className={styles.fieldHint}>A warning badge appears when stock falls at or below this value.</p>
                    </div>
                </div>
                <div className={styles.drawerFooter}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Ingredient')}
                    </button>
                </div>
            </div>
        </>
    );
}

function StockLogPanel({ logs, isLoading, onRefresh }) {
    const getReasonBadge = (reason) => {
        switch (reason) {
            case 'order': return <span className={`${styles.reasonBadge} ${styles.reasonOrder}`}>Order</span>;
            case 'restock': return <span className={`${styles.reasonBadge} ${styles.reasonRestock}`}>Restock</span>;
            case 'manual': return <span className={`${styles.reasonBadge} ${styles.reasonManual}`}>Manual</span>;
            default: return <span className={`${styles.reasonBadge} ${styles.reasonManual}`}>{reason}</span>;
        }
    };

    if (isLoading) return <div className={styles.loadingState}>Loading stock logs...</div>;

    return (
        <div className={styles.tablePanel}>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Timestamp</th>
                            <th className={styles.th}>Ingredient</th>
                            <th className={styles.th}>Change</th>
                            <th className={styles.th}>Stock After</th>
                            <th className={styles.th}>Reason</th>
                            <th className={styles.th}>Reference</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr><td colSpan={6} className={styles.emptyMessage}>No stock movement logs yet.</td></tr>
                        ) : logs.map(log => (
                            <tr key={log.id} className={styles.tableRow}>
                                <td className={`${styles.td} ${styles.dateText}`}>
                                    {new Date(log.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className={styles.td}>
                                    <span className={styles.itemName}>{log.inventory?.name ?? `ID #${log.inventory_id}`}</span>
                                </td>
                                <td className={`${styles.td} ${styles.stockData}`}>
                                    <span className={log.change_qty < 0 ? styles.changeNeg : styles.changePos}>
                                        {log.change_qty > 0 ? '+' : ''}{log.change_qty} {log.inventory?.unit ?? ''}
                                    </span>
                                </td>
                                <td className={`${styles.td} ${styles.stockData}`}>{log.stock_after} {log.inventory?.unit ?? ''}</td>
                                <td className={styles.td}>{getReasonBadge(log.reason)}</td>
                                <td className={`${styles.td} ${styles.refText}`}>{log.reference_id ?? '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function InventoryPage() {
    const [activeTab, setActiveTab] = useState('ingredients');
    const [ingredients, setIngredients] = useState([]);
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLogsLoading, setIsLogsLoading] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const loadIngredients = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await inventoryApi.getAll();
            setIngredients(data);
        } catch (err) {
            toast.error('Failed to load ingredients');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadLogs = useCallback(async () => {
        setIsLogsLoading(true);
        try {
            const data = await inventoryApi.getLogs();
            setLogs(data);
        } catch (err) {
            toast.error('Failed to load stock logs');
        } finally {
            setIsLogsLoading(false);
        }
    }, []);

    useEffect(() => { loadIngredients(); }, [loadIngredients]);

    useEffect(() => {
        if (activeTab === 'logs') loadLogs();
    }, [activeTab, loadLogs]);

    const handleSaved = (item, mode) => {
        if (mode === 'add') setIngredients(prev => [...prev, item]);
        else setIngredients(prev => prev.map(i => i.id === item.id ? item : i));
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this ingredient? This may affect product recipes.')) return;
        try {
            await inventoryApi.delete(id);
            setIngredients(prev => prev.filter(i => i.id !== id));
            toast.success('Ingredient deleted');
        } catch (err) {
            toast.error(err.message);
        }
    };

    const getStatus = (stock, threshold) => {
        if (!threshold || threshold <= 0) return null;
        if (stock <= threshold * 0.25) return { label: 'Critical', cls: styles.statusCritical };
        if (stock <= threshold) return { label: 'Low', cls: styles.statusLow };
        return { label: 'OK', cls: styles.statusOk };
    };

    const existingCategories = [...new Set(ingredients.map(i => i.category).filter(Boolean))];

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>Inventory</h2>
                <div className={styles.headerActions}>
                    <button className={styles.refreshBtn} onClick={activeTab === 'logs' ? loadLogs : loadIngredients} title="Refresh">
                        <RefreshCw size={16} />
                    </button>
                    {activeTab === 'ingredients' && (
                        <button className={styles.actionBtn} onClick={() => { setEditingItem(null); setDrawerOpen(true); }}>
                            <PackagePlus size={18} /> Add Ingredient
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.tabBar}>
                <button className={`${styles.tabBtn} ${activeTab === 'ingredients' ? styles.tabActive : ''}`} onClick={() => setActiveTab('ingredients')}>
                    <Package size={16} /> Ingredients
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'logs' ? styles.tabActive : ''}`} onClick={() => setActiveTab('logs')}>
                    <History size={16} /> Stock Log
                </button>
            </div>

            {activeTab === 'ingredients' && (
                isLoading ? (
                    <div className={styles.loadingState}>Loading ingredients...</div>
                ) : (
                    <div className={styles.tablePanel}>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.th}>Ingredient</th>
                                        <th className={styles.th}>Current Stock</th>
                                        <th className={styles.th}>Threshold</th>
                                        <th className={styles.th}>Status</th>
                                        <th className={styles.th}>Last Updated</th>
                                        <th className={styles.th}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ingredients.length === 0 ? (
                                        <tr><td colSpan={6} className={styles.emptyMessage}>No ingredients yet. Add one to get started.</td></tr>
                                    ) : ingredients.map(item => {
                                        const status = getStatus(item.stock, item.threshold);
                                        return (
                                            <tr key={item.id} className={styles.tableRow}>
                                                <td className={styles.td}>
                                                    <div className={styles.itemName}>{item.name}</div>
                                                    <div className={styles.itemCategory}>{item.category}</div>
                                                </td>
                                                <td className={`${styles.td} ${styles.stockData}`}>
                                                    {item.stock} <span className={styles.unitText}>{item.unit}</span>
                                                </td>
                                                <td className={`${styles.td} ${styles.stockData} ${styles.mutedText}`}>
                                                    {item.threshold > 0 ? `${item.threshold} ${item.unit}` : '—'}
                                                </td>
                                                <td className={styles.td}>
                                                    {status ? (
                                                        <span className={`${styles.statusBadge} ${status.cls}`}>
                                                            {status.label === 'Critical' || status.label === 'Low' ? <AlertTriangle size={11} style={{ marginRight: 3 }} /> : null}
                                                            {status.label}
                                                        </span>
                                                    ) : <span className={styles.mutedText}>—</span>}
                                                </td>
                                                <td className={`${styles.td} ${styles.dateText}`}>
                                                    {item.last_updated ? new Date(item.last_updated).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                                                </td>
                                                <td className={styles.td}>
                                                    <div className={styles.actionCell}>
                                                        <button className={`${styles.iconBtn} ${styles.editBtn}`} title="Edit" onClick={() => { setEditingItem(item); setDrawerOpen(true); }}>
                                                            <Edit2 size={15} />
                                                        </button>
                                                        <button className={`${styles.iconBtn} ${styles.deleteBtn}`} title="Delete" onClick={() => handleDelete(item.id)}>
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            )}

            {activeTab === 'logs' && (
                <StockLogPanel logs={logs} isLoading={isLogsLoading} onRefresh={loadLogs} />
            )}

            <IngredientDrawer
                isOpen={drawerOpen}
                ingredient={editingItem}
                onClose={() => setDrawerOpen(false)}
                onSaved={handleSaved}
                existingCategories={existingCategories}
            />
        </div>
    );
}
