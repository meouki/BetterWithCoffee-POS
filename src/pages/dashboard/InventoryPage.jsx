import { useState } from 'react';
import { PackagePlus, Edit2 } from 'lucide-react';
import styles from './InventoryPage.module.css';

// Mock Data
const mockInventory = [
    { id: 1, name: 'Espresso Beans', category: 'Raw Materials', stock: 12, unit: 'kg', threshold: 5, last_updated: '2026-10-24 08:30 AM' },
    { id: 2, name: 'Whole Milk', category: 'Dairy', stock: 4, unit: 'L', threshold: 10, last_updated: '2026-10-24 06:15 AM' },
    { id: 3, name: 'Oat Milk', category: 'Dairy', stock: 8, unit: 'L', threshold: 5, last_updated: '2026-10-23 09:00 PM' },
    { id: 4, name: 'Vanilla Syrup', category: 'Syrups', stock: 2, unit: 'btl', threshold: 3, last_updated: '2026-10-20 02:45 PM' },
    { id: 5, name: 'Takeout Cups (Cold)', category: 'Packaging', stock: 450, unit: 'pcs', threshold: 500, last_updated: '2026-10-24 07:00 AM' },
    { id: 6, name: 'Matcha Powder', category: 'Raw Materials', stock: 0.5, unit: 'kg', threshold: 1, last_updated: '2026-10-15 11:20 AM' },
];

export default function InventoryPage() {
    const [inventory] = useState(mockInventory);

    const getStatus = (stock, threshold) => {
        if (stock <= threshold * 0.2) return { label: 'Critical', class: styles.statusCritical };
        if (stock <= threshold) return { label: 'Low', class: styles.statusLow };
        return { label: 'OK', class: styles.statusOk };
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>Inventory Stock</h2>
                <button className={styles.actionBtn}>
                    <PackagePlus size={18} /> Restock Items
                </button>
            </div>

            <div className={styles.tablePanel}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Item</th>
                                <th className={styles.th}>Current Stock</th>
                                <th className={styles.th}>Threshold</th>
                                <th className={styles.th}>Status</th>
                                <th className={styles.th}>Last Updated</th>
                                <th className={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map(item => {
                                const status = getStatus(item.stock, item.threshold);
                                return (
                                    <tr key={item.id} className={styles.tableRow}>
                                        <td className={styles.td}>
                                            <div className={styles.itemName}>{item.name}</div>
                                            <div className={styles.itemCategory}>{item.category}</div>
                                        </td>
                                        <td className={`${styles.td} ${styles.stockData}`}>
                                            {item.stock} {item.unit}
                                        </td>
                                        <td className={`${styles.td} ${styles.stockData} text-[var(--color-muted)]`}>
                                            {item.threshold} {item.unit}
                                        </td>
                                        <td className={styles.td}>
                                            <span className={`${styles.statusBadge} ${status.class}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className={`${styles.td} ${styles.dateText}`}>
                                            {item.last_updated}
                                        </td>
                                        <td className={styles.td}>
                                            <button className={styles.editBtn}>
                                                <Edit2 size={16} /> Edit
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
