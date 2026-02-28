import { useState } from 'react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingBag,
    Award,
    AlertTriangle
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import styles from './OverviewPage.module.css';

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
    { rank: 1, name: 'Spanish Latte', sales: 145, percent: 100 },
    { rank: 2, name: 'Caramel Macchiato', sales: 120, percent: 85 },
    { rank: 3, name: 'Matcha Frappe', sales: 95, percent: 65 },
    { rank: 4, name: 'Cold Brew', sales: 88, percent: 60 },
    { rank: 5, name: 'Butter Croissant', sales: 64, percent: 45 },
];

const recentOrders = [
    { id: 'ORD-1045', time: '10:42 AM', cashier: 'Alex', items: 3, total: 560, type: 'Dine-In', payment: 'Cash' },
    { id: 'ORD-1044', time: '10:35 AM', cashier: 'Sam', items: 1, total: 180, type: 'Take-Out', payment: 'GCash' },
    { id: 'ORD-1043', time: '10:15 AM', cashier: 'Alex', items: 4, total: 850, type: 'Dine-In', payment: 'Cash' },
    { id: 'ORD-1042', time: '09:50 AM', cashier: 'Sam', items: 2, total: 340, type: 'Take-Out', payment: 'Cash' },
    { id: 'ORD-1041', time: '09:30 AM', cashier: 'Alex', items: 1, total: 220, type: 'Dine-In', payment: 'Maya' },
];

export default function OverviewPage() {
    const [chartRange, setChartRange] = useState('Weekly');

    // Utility to get main CSS variable for charts
    const getAccentColor = () => {
        return getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#D47C3A';
    };

    return (
        <div>
            {/* KPIs */}
            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiHeader}>
                        <span className={styles.kpiLabel}>Today's Revenue</span>
                        <DollarSign size={20} className="text-[var(--color-accent)]" />
                    </div>
                    <div className={styles.kpiValue}>₱24,500.00</div>
                    <div className={`${styles.kpiChange} ${styles.positive}`}>
                        <TrendingUp size={14} /> +12.5% vs yesterday
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiHeader}>
                        <span className={styles.kpiLabel}>Total Orders</span>
                        <ShoppingBag size={20} className="text-[var(--color-accent)]" />
                    </div>
                    <div className={styles.kpiValue}>142</div>
                    <div className={`${styles.kpiChange} ${styles.positive}`}>
                        <TrendingUp size={14} /> +8.2% vs yesterday
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiHeader}>
                        <span className={styles.kpiLabel}>Top Item Today</span>
                        <Award size={20} className="text-[var(--color-accent)]" />
                    </div>
                    <div className={styles.kpiValue} style={{ fontSize: '1.25rem' }}>Spanish Latte</div>
                    <div className={styles.kpiChange} style={{ color: 'var(--color-muted)' }}>
                        45 units sold
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiHeader}>
                        <span className={styles.kpiLabel}>Low Stock Alerts</span>
                        <AlertTriangle size={20} className={styles.negative} />
                    </div>
                    <div className={styles.kpiValue}>3</div>
                    <div className={`${styles.kpiChange} ${styles.negative}`}>
                        Requires immediate attention
                    </div>
                </div>
            </div>

            <div className={styles.mainGrid}>
                {/* Sales Chart */}
                <div className={styles.widgetPanel}>
                    <div className={styles.widgetHeader}>
                        <h3 className={styles.widgetTitle}>Revenue Overview</h3>
                        <div className={styles.filterTabs}>
                            {['Daily', 'Weekly', 'Monthly'].map(range => (
                                <button
                                    key={range}
                                    onClick={() => setChartRange(range)}
                                    className={`${styles.filterBtn} ${chartRange === range ? styles.active : ''}`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="color-mix(in srgb, var(--color-border) 50%, transparent)" vertical={false} />
                                <XAxis dataKey="name" stroke="var(--color-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis
                                    stroke="var(--color-muted)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `₱${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px', color: 'var(--color-text)' }}
                                    itemStyle={{ color: getAccentColor() }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke={getAccentColor()}
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: getAccentColor(), strokeWidth: 2, stroke: 'var(--color-surface)' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Best Sellers */}
                <div className={styles.widgetPanel}>
                    <div className={styles.widgetHeader}>
                        <h3 className={styles.widgetTitle}>Top Sellers</h3>
                    </div>

                    <div className={styles.bestSellerList}>
                        {bestSellers.map(item => (
                            <div key={item.rank} className={styles.sellerItem}>
                                <div className={styles.rank}>{item.rank}</div>
                                <div className={styles.itemDetails}>
                                    <div className={styles.itemNameRow}>
                                        <span>{item.name}</span>
                                        <span className={styles.salesAmount}>{item.sales}</span>
                                    </div>
                                    <div className={styles.barTrack}>
                                        <div
                                            className={styles.barFill}
                                            style={{ width: `${item.percent}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className={styles.tablePanel}>
                <div className={styles.tableHeader}>Recent Orders</div>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Order ID</th>
                                <th className={styles.th}>Time</th>
                                <th className={styles.th}>Cashier</th>
                                <th className={styles.th}>Items</th>
                                <th className={styles.th}>Total</th>
                                <th className={styles.th}>Type</th>
                                <th className={styles.th}>Payment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order, idx) => (
                                <tr key={idx} className={styles.tableRow}>
                                    <td className={`${styles.td} ${styles.orderId}`}>{order.id}</td>
                                    <td className={styles.td}>{order.time}</td>
                                    <td className={styles.td}>{order.cashier}</td>
                                    <td className={styles.td}>{order.items}</td>
                                    <td className={`${styles.td} ${styles.amount}`}>₱{order.total.toFixed(2)}</td>
                                    <td className={styles.td}>
                                        <span className={`${styles.typeBadge} ${order.type === 'Dine-In' ? styles.dineIn : styles.takeOut}`}>
                                            {order.type}
                                        </span>
                                    </td>
                                    <td className={styles.td}>{order.payment}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
