import { useState, useMemo, useEffect } from 'react';
import { useOrderContext } from '../../context/OrderContext';
import { Download, Calendar } from 'lucide-react';
import Loader from '../../components/shared/Loader';
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
export default function ReportsPage() {
    const { orders } = useOrderContext();
    const [activeTab, setActiveTab] = useState('Sales');
    const [dateRange, setDateRange] = useState('7Days'); // 'Today', '7Days', '30Days', 'Custom'
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Simulate loading on range change for a "premium" feel
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 400);
        return () => clearTimeout(timer);
    }, [dateRange, customStart, customEnd]);

    const filteredOrders = useMemo(() => {
        const now = new Date();
        let start = new Date();
        let end = new Date();

        if (dateRange === 'Today') {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        } else if (dateRange === '7Days') {
            start.setDate(now.getDate() - 7);
        } else if (dateRange === '30Days') {
            start.setDate(now.getDate() - 30);
        } else if (dateRange === 'Custom' && customStart && customEnd) {
            start = new Date(customStart);
            start.setHours(0, 0, 0, 0);
            end = new Date(customEnd);
            end.setHours(23, 59, 59, 999);
        } else {
            return orders; // Default/Fallback
        }

        return orders.filter(o => {
            const d = new Date(o.timestamp);
            return d >= start && d <= end;
        });
    }, [orders, dateRange, customStart, customEnd]);

    const revenueData = useMemo(() => {
        // Simple day-based aggregation for the chart
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const data = days.map(day => ({ name: day, revenue: 0 }));

        filteredOrders.forEach(o => {
            const dayIdx = new Date(o.timestamp).getDay();
            data[dayIdx].revenue += o.total;
        });

        // Reorder to start from 6 days ago
        const todayIdx = new Date().getDay();
        const reordered = [];
        for (let i = 6; i >= 0; i--) {
            const idx = (todayIdx - i + 7) % 7;
            reordered.push(data[idx]);
        }
        return reordered;
    }, [filteredOrders]);

    const metrics = useMemo(() => {
        const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
        const totalOrders = filteredOrders.length;
        const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        const payments = filteredOrders.reduce((acc, o) => {
            acc[o.payment_method] = (acc[o.payment_method] || 0) + 1;
            return acc;
        }, {});
        const topPayment = Object.entries(payments).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        return { totalRevenue, totalOrders, aov, topPayment };
    }, [filteredOrders]);

    const bestSellers = useMemo(() => {
        const items = {};
        filteredOrders.forEach(o => {
            o.items.forEach(item => {
                if (!items[item.name]) {
                    items[item.name] = { name: item.name, units: 0, revenue: 0, category: 'Product' };
                }
                items[item.name].units += item.quantity;
                items[item.name].revenue += item.quantity * item.price;
            });
        });
        return Object.values(items).sort((a, b) => b.units - a.units).map((item, idx) => ({
            ...item,
            rank: idx + 1
        })).slice(0, 10);
    }, [filteredOrders]);

    const cashierPerformance = useMemo(() => {
        const cashiers = {};
        filteredOrders.forEach(o => {
            if (!cashiers[o.cashier]) {
                cashiers[o.cashier] = { name: o.cashier, orders: 0, revenue: 0, items: {} };
            }
            cashiers[o.cashier].orders += 1;
            cashiers[o.cashier].revenue += o.total;
            o.items.forEach(item => {
                cashiers[o.cashier].items[item.name] = (cashiers[o.cashier].items[item.name] || 0) + item.quantity;
            });
        });
        return Object.values(cashiers).map((c, idx) => ({
            id: idx + 1,
            name: c.name,
            orders: c.orders,
            revenue: c.revenue,
            aov: c.revenue / c.orders,
            top: Object.entries(c.items).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
        }));
    }, [filteredOrders]);

    const handleExportCSV = () => {
        const headers = ['Order ID', 'Timestamp', 'Items Count', 'Subtotal', 'VAT', 'Total', 'Payment', 'Type', 'Cashier'];
        const rows = filteredOrders.map(o => [
            o.id,
            o.timestamp,
            o.items.reduce((s, i) => s + i.quantity, 0),
            o.subtotal.toFixed(2),
            o.vat.toFixed(2),
            o.total.toFixed(2),
            o.payment_method,
            o.order_type,
            o.cashier
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `bwc_report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Utility to get main CSS variable for charts
    const getAccentColor = () => {
        return getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#D47C3A';
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>Reports & Analytics</h2>
                <button className={styles.actionBtn} onClick={handleExportCSV}>
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

            {/* Date Filters (Consistent with Orders) */}
            <div className={styles.filterSection}>
                <div className={styles.pillGroup}>
                    <button className={`${styles.filterBtnPill} ${dateRange === 'Today' ? styles.activeFilter : ''}`} onClick={() => setDateRange('Today')}>Today</button>
                    <button className={`${styles.filterBtnPill} ${dateRange === '7Days' ? styles.activeFilter : ''}`} onClick={() => setDateRange('7Days')}>Last 7 Days</button>
                    <button className={`${styles.filterBtnPill} ${dateRange === '30Days' ? styles.activeFilter : ''}`} onClick={() => setDateRange('30Days')}>This Month</button>
                    <button className={`${styles.filterBtnPill} ${dateRange === 'Custom' ? styles.activeFilter : ''}`} onClick={() => setDateRange('Custom')}>Custom</button>
                </div>

                {dateRange === 'Custom' && (
                    <div className={styles.customDateInput}>
                        <div className={styles.dateWrapper}>
                            <Calendar size={16} className={styles.dateIcon} />
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                max={customEnd || undefined}
                            />
                        </div>
                        <span className={styles.dateSeparator}>to</span>
                        <div className={styles.dateWrapper}>
                            <Calendar size={16} className={styles.dateIcon} />
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                min={customStart || undefined}
                            />
                        </div>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div style={{ padding: '80px 0' }}>
                    <Loader size="large" text="Updating reports..." />
                </div>
            ) : (
                <>
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
                                            tickFormatter={(value) => value >= 1000 ? `₱${(value / 1000).toFixed(1)}k` : `₱${value}`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'color-mix(in srgb, var(--color-surface) 50%, transparent)' }}
                                            contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px', color: 'var(--color-text)' }}
                                        />
                                        <Bar 
                                            dataKey="revenue" 
                                            fill={getAccentColor()} 
                                            radius={[6, 6, 0, 0]} 
                                            barSize={45}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className={styles.metricsGrid}>
                                <div className={styles.metricCard}>
                                    <div className={styles.metricLabel}>Total Period Revenue</div>
                                    <div className={styles.metricValue}>₱{metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                </div>
                                <div className={styles.metricCard}>
                                    <div className={styles.metricLabel}>Total Orders</div>
                                    <div className={styles.metricValue}>{metrics.totalOrders}</div>
                                </div>
                                <div className={styles.metricCard}>
                                    <div className={styles.metricLabel}>Avg. Order Value</div>
                                    <div className={styles.metricValue}>₱{metrics.aov.toFixed(2)}</div>
                                </div>
                                <div className={styles.metricCard}>
                                    <div className={styles.metricLabel}>Top Payment Method</div>
                                    <div className={styles.metricValue} style={{ fontFamily: 'var(--font-ui)' }}>{metrics.topPayment}</div>
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
                </>
            )}
        </div>
    );
}
