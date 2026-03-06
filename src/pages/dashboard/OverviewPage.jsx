import { useState, useMemo } from 'react';
import { useOrderContext } from '../../context/OrderContext';
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

export default function OverviewPage() {
    const { orders } = useOrderContext();
    const [chartRange, setChartRange] = useState('Weekly');

    const todayOrders = useMemo(() => {
        const today = new Date().toDateString();
        return orders.filter(o => new Date(o.timestamp).toDateString() === today);
    }, [orders]);

    const todayRevenue = useMemo(() => {
        return todayOrders.reduce((sum, o) => sum + o.total, 0);
    }, [todayOrders]);

    const topSellingItem = useMemo(() => {
        const counts = {};
        todayOrders.forEach(order => {
            order.items.forEach(item => {
                counts[item.name] = (counts[item.name] || 0) + item.quantity;
            });
        });

        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        return sorted.length > 0 ? { name: sorted[0][0], count: sorted[0][1] } : { name: 'None', count: 0 };
    }, [todayOrders]);

    const recentOrders = useMemo(() => {
        return orders.slice(0, 10);
    }, [orders]);

    // Aggregating data for Best Sellers Widget (All time)
    const bestSellers = useMemo(() => {
        const counts = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                counts[item.name] = (counts[item.name] || 0) + item.quantity;
            });
        });
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
        if (sorted.length === 0) return [];
        const max = sorted[0][1];
        return sorted.map(([name, sales], idx) => ({
            rank: idx + 1,
            name,
            sales,
            percent: (sales / max) * 100
        }));
    }, [orders]);

    // Mock data for chart for now, as we don't have enough history usually
    const revenueData = [
        { name: 'Mon', revenue: 12400 },
        { name: 'Tue', revenue: 14200 },
        { name: 'Wed', revenue: 11800 },
        { name: 'Thu', revenue: 18500 },
        { name: 'Fri', revenue: 24300 },
        { name: 'Sat', revenue: 32100 },
        { name: 'Sun', revenue: 28400 },
    ];

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
                    <div className={styles.kpiValue}>₱{todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <div className={`${styles.kpiChange} ${styles.positive}`}>
                        <TrendingUp size={14} /> Live tracking active
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiHeader}>
                        <span className={styles.kpiLabel}>Total Orders</span>
                        <ShoppingBag size={20} className="text-[var(--color-accent)]" />
                    </div>
                    <div className={styles.kpiValue}>{todayOrders.length}</div>
                    <div className={`${styles.kpiChange} ${styles.positive}`}>
                        <TrendingUp size={14} /> Today
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiHeader}>
                        <span className={styles.kpiLabel}>Top Item Today</span>
                        <Award size={20} className="text-[var(--color-accent)]" />
                    </div>
                    <div className={styles.kpiValue} style={{ fontSize: '1.25rem' }}>{topSellingItem.name}</div>
                    <div className={styles.kpiChange} style={{ color: 'var(--color-muted)' }}>
                        {topSellingItem.count} units sold today
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
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className={styles.emptyMessage}>No orders found.</td>
                                </tr>
                            ) : (
                                recentOrders.map((order, idx) => (
                                    <tr key={idx} className={styles.tableRow}>
                                        <td className={`${styles.td} ${styles.orderId}`}>{order.id}</td>
                                        <td className={styles.td}>{new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td className={styles.td}>{order.cashier}</td>
                                        <td className={styles.td}>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                                        <td className={`${styles.td} ${styles.amount}`}>₱{order.total.toFixed(2)}</td>
                                        <td className={styles.td}>
                                            <span className={`${styles.typeBadge} ${order.order_type === 'Dine-In' ? styles.dineIn : styles.takeOut}`}>
                                                {order.order_type}
                                            </span>
                                        </td>
                                        <td className={styles.td}>{order.payment_method}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
