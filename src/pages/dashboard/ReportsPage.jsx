import { useState } from 'react';
import { Download } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import styles from './ReportsPage.module.css';

// Mock Data
const revenueData = [
    { name: 'Mon', revenue: 12400 },
    { name: 'Tue', revenue: 14200 },
    { name: 'Wed', revenue: 11800 },
    { name: 'Thu', revenue: 18500 },
    { name: 'Fri', revenue: 24300 },
    { name: 'Sat', revenue: 32100 },
    { name: 'Sun', revenue: 28400 },
];

const bestSellers = [
    { rank: 1, name: 'Spanish Latte', category: 'Hot Drinks', units: 145, revenue: 27550 },
    { rank: 2, name: 'Caramel Macchiato', category: 'Hot Drinks', units: 120, revenue: 21600 },
    { rank: 3, name: 'Matcha Frappe', category: 'Frappe Drinks', units: 95, revenue: 20900 },
    { rank: 4, name: 'Cold Brew', category: 'Cold Drinks', units: 88, revenue: 14080 },
    { rank: 5, name: 'Butter Croissant', category: 'Pastries', units: 64, revenue: 7680 },
];

const cashierPerformance = [
    { id: 1, name: 'Alex Rivera', orders: 485, revenue: 125400, aov: 258, top: 'Spanish Latte' },
    { id: 2, name: 'Sam Chen', orders: 412, revenue: 98500, aov: 239, top: 'Caramel Macchiato' },
    { id: 3, name: 'Jordan Lee', orders: 380, revenue: 95000, aov: 250, top: 'Matcha Frappe' },
];

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState('Sales');
    const [dateRange, setDateRange] = useState('7days');

    // Utility to get main CSS variable for charts
    const getAccentColor = () => {
        return getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#D47C3A';
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>Reports & Analytics</h2>
                <button className={styles.actionBtn}>
                    <Download size={18} /> Export CSV
                </button>
            </div>

            <div className={styles.tabs}>
                {['Sales', 'Best Sellers', 'Cashiers'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`${styles.tabBtn} ${activeTab === tab ? styles.active : ''}`}
                    >
                        {tab} Report
                    </button>
                ))}
            </div>

            <div className={styles.controlsRow}>
                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className={styles.dateSelect}
                >
                    <option value="today">Today</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="month">This Month</option>
                </select>
            </div>

            {activeTab === 'Sales' && (
                <div>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="color-mix(in srgb, var(--color-border) 50%, transparent)" vertical={false} />
                                <XAxis dataKey="name" stroke="var(--color-muted)" tickLine={false} axisLine={false} />
                                <YAxis
                                    stroke="var(--color-muted)"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `₱${value / 1000}k`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'color-mix(in srgb, var(--color-surface) 50%, transparent)' }}
                                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px', color: 'var(--color-text)' }}
                                />
                                <Bar dataKey="revenue" fill={getAccentColor()} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className={styles.metricsGrid}>
                        <div className={styles.metricCard}>
                            <div className={styles.metricLabel}>Total Period Revenue</div>
                            <div className={styles.metricValue}>₱141,700</div>
                        </div>
                        <div className={styles.metricCard}>
                            <div className={styles.metricLabel}>Total Orders</div>
                            <div className={styles.metricValue}>568</div>
                        </div>
                        <div className={styles.metricCard}>
                            <div className={styles.metricLabel}>Avg. Order Value</div>
                            <div className={styles.metricValue}>₱249.47</div>
                        </div>
                        <div className={styles.metricCard}>
                            <div className={styles.metricLabel}>Top Payment Method</div>
                            <div className={styles.metricValue} style={{ fontFamily: 'var(--font-ui)' }}>GCash (62%)</div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'Best Sellers' && (
                <div className={styles.tablePanel}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>Rank</th>
                                    <th className={styles.th}>Product</th>
                                    <th className={styles.th}>Units Sold</th>
                                    <th className={styles.th}>Revenue Generated</th>
                                    <th className={styles.th}>Performance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bestSellers.map((item, idx) => (
                                    <tr key={item.rank} className={styles.tableRow}>
                                        <td className={styles.td}>
                                            <div className={`${styles.rankBadge} ${idx < 3 ? styles.top : ''}`}>
                                                #{item.rank}
                                            </div>
                                        </td>
                                        <td className={styles.td}>
                                            <div className={styles.productName}>{item.name}</div>
                                            <div className={styles.productCategory}>{item.category}</div>
                                        </td>
                                        <td className={`${styles.td} ${styles.dataValue}`}>{item.units}</td>
                                        <td className={`${styles.td} ${styles.dataValue} text-[var(--color-accent)]`}>
                                            ₱{item.revenue.toLocaleString()}
                                        </td>
                                        <td className={styles.td} style={{ width: '30%' }}>
                                            <div className={styles.dataValue}>{((item.units / bestSellers[0].units) * 100).toFixed(0)}% of top</div>
                                            <div className={styles.barTrack}>
                                                <div
                                                    className={styles.barFill}
                                                    style={{ width: `${(item.units / bestSellers[0].units) * 100}%` }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'Cashiers' && (
                <div className={styles.tablePanel}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>Cashier</th>
                                    <th className={styles.th}>Orders Processed</th>
                                    <th className={styles.th}>Total Handled</th>
                                    <th className={styles.th}>AOV</th>
                                    <th className={styles.th}>Most Sold Item</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cashierPerformance.map((cashier) => (
                                    <tr key={cashier.id} className={styles.tableRow}>
                                        <td className={styles.td}>
                                            <div className="flex items-center gap-3">
                                                <div className={styles.avatar}>
                                                    {cashier.name.charAt(0)}
                                                </div>
                                                <div className={styles.productName}>{cashier.name}</div>
                                            </div>
                                        </td>
                                        <td className={`${styles.td} ${styles.dataValue}`}>{cashier.orders}</td>
                                        <td className={`${styles.td} ${styles.dataValue} text-[var(--color-accent)]`}>
                                            ₱{cashier.revenue.toLocaleString()}
                                        </td>
                                        <td className={`${styles.td} ${styles.dataValue}`}>₱{cashier.aov}</td>
                                        <td className={styles.td}>{cashier.top}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
    );
}
