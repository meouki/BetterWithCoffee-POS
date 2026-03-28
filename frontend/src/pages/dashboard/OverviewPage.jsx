import { useState, useMemo, useEffect } from 'react';
import { useOrderContext } from '../../context/OrderContext';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingBag,
    Award,
    AlertTriangle,
    Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { inventoryApi } from '../../api/inventory';
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
    const { orders, fetchAnalytics } = useOrderContext();
    const [chartRange, setChartRange] = useState('Weekly');
    const [historicalData, setHistoricalData] = useState([]);
    const [isChartLoading, setIsChartLoading] = useState(false);
    const [lowStockCount, setLowStockCount] = useState(0);
    const navigate = useNavigate();

    // Fetch low stock items for KPI
    useEffect(() => {
        const fetchStockAlerts = async () => {
            try {
                const data = await inventoryApi.getAll();
                const lowItems = data.filter(item => item.threshold > 0 && item.stock <= item.threshold);
                setLowStockCount(lowItems.length);
            } catch (error) {
                console.error("Failed to fetch inventory for overview", error);
            }
        };
        fetchStockAlerts();
    }, []);

    // Fetch historical data for charts when range changes
    useEffect(() => {
        const loadChartData = async () => {
            setIsChartLoading(true);
            try {
                const now = new Date();
                let start = new Date();
                
                if (chartRange === 'Daily') {
                    start.setHours(now.getHours() - 24);
                } else if (chartRange === 'Weekly') {
                    start.setDate(now.getDate() - 7);
                } else {
                    // Monthly
                    start.setMonth(now.getMonth() - 1);
                }
                
                const data = await fetchAnalytics(start.toISOString(), now.toISOString());
                setHistoricalData(data || []);
            } catch (error) {
                console.error("Chart data fetch failed", error);
            } finally {
                setIsChartLoading(false);
            }
        };

        loadChartData();
    }, [chartRange, fetchAnalytics]);

    // Use 'orders' (today's live state) for landing stats, 
    // but use 'historicalData' for the actual charts and all-time sellers
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
        // Just show the first 10 of today's live orders
        return orders.slice(0, 10);
    }, [orders]);

    // Aggregating data for Best Sellers Widget (from the fetched chart period)
    const bestSellers = useMemo(() => {
        const counts = {};
        const source = historicalData.length > 0 ? historicalData : todayOrders;
        source.forEach(order => {
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
    }, [historicalData, todayOrders]);

    // Revenue chart data based on selected range
    const revenueData = useMemo(() => {
        const now = new Date();
        const dataSource = historicalData.length > 0 ? historicalData : orders;

        if (chartRange === 'Daily') {
            const hours = [];
            for (let i = 12; i >= 0; i--) {
                const blockStart = new Date(now);
                blockStart.setHours(now.getHours() - i * 2, 0, 0, 0);
                const blockEnd = new Date(blockStart);
                blockEnd.setHours(blockStart.getHours() + 2);

                const revenue = dataSource
                    .filter(o => {
                        const d = new Date(o.timestamp);
                        return d >= blockStart && d < blockEnd;
                    })
                    .reduce((sum, o) => sum + o.total, 0);

                hours.push({
                    name: blockStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    revenue
                });
            }
            return hours;
        } else if (chartRange === 'Weekly') {
            const days = [];
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            for (let i = 6; i >= 0; i--) {
                const day = new Date(now);
                day.setDate(now.getDate() - i);
                day.setHours(0, 0, 0, 0);
                const end = new Date(day);
                end.setHours(23, 59, 59, 999);

                const revenue = dataSource
                    .filter(o => {
                        const d = new Date(o.timestamp);
                        return d >= day && d <= end;
                    })
                    .reduce((sum, o) => sum + o.total, 0);

                days.push({ name: dayNames[day.getDay()], revenue });
            }
            return days;
        } else {
            const weeks = [];
            for (let i = 3; i >= 0; i--) {
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - (i + 1) * 7);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 7);

                const revenue = dataSource
                    .filter(o => {
                        const d = new Date(o.timestamp);
                        return d >= weekStart && d < weekEnd;
                    })
                    .reduce((sum, o) => sum + o.total, 0);

                const label = `${weekStart.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
                weeks.push({ name: label, revenue });
            }
            return weeks;
        }
    }, [historicalData, orders, chartRange]);

    // Utility to get main CSS variable for charts
    const getAccentColor = () => {
        return getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#D47C3A';
    };

    return (
        <div>
            {/* KPIs */}
            <div className={styles.kpiGrid}>
                <div 
                    className={styles.kpiCard} 
                    onClick={() => navigate('/dashboard/reports')}
                    style={{ cursor: 'pointer' }}
                >
                    <div className={styles.kpiHeader}>
                        <span className={styles.kpiLabel}>Today's Revenue</span>
                        <DollarSign size={20} className="text-[var(--color-accent)]" />
                    </div>
                    <div className={styles.kpiValue}>₱{todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <div className={`${styles.kpiChange} ${styles.positive}`}>
                        <TrendingUp size={14} /> Live tracking active
                    </div>
                </div>

                <div 
                    className={styles.kpiCard}
                    onClick={() => navigate('/dashboard/orders')}
                    style={{ cursor: 'pointer' }}
                >
                    <div className={styles.kpiHeader}>
                        <span className={styles.kpiLabel}>Total Orders</span>
                        <ShoppingBag size={20} className="text-[var(--color-accent)]" />
                    </div>
                    <div className={styles.kpiValue}>{todayOrders.length}</div>
                    <div className={`${styles.kpiChange} ${styles.positive}`}>
                        <TrendingUp size={14} /> Today
                    </div>
                </div>

                <div 
                    className={styles.kpiCard}
                    onClick={() => navigate('/dashboard/reports')}
                    style={{ cursor: 'pointer' }}
                >
                    <div className={styles.kpiHeader}>
                        <span className={styles.kpiLabel}>Top Item Today</span>
                        <Award size={20} className="text-[var(--color-accent)]" />
                    </div>
                    <div className={styles.kpiValue} style={{ fontSize: '1.25rem' }}>{topSellingItem.name}</div>
                    <div className={styles.kpiChange} style={{ color: 'var(--color-muted)' }}>
                        {topSellingItem.count} units sold today
                    </div>
                </div>

                <div 
                    className={`${styles.kpiCard} ${lowStockCount > 0 ? styles.alertCard : ''}`} 
                    onClick={() => navigate('/dashboard/inventory')}
                    style={{ cursor: 'pointer' }}
                >
                    <div className={styles.kpiHeader}>
                        <span className={styles.kpiLabel}>Stock Alerts</span>
                        {lowStockCount > 0 ? (
                            <AlertTriangle size={20} className={styles.negative} />
                        ) : (
                            <Package size={20} className={styles.positive} />
                        )}
                    </div>
                    <div className={styles.kpiValue}>{lowStockCount}</div>
                    <div className={`${styles.kpiChange} ${lowStockCount > 0 ? styles.negative : styles.positive}`}>
                        {lowStockCount > 0 ? 'Requires attention' : 'All stock healthy'}
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
                                    tickFormatter={(value) => value >= 1000 ? `₱${(value / 1000).toFixed(1)}k` : `₱${value}`}
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
