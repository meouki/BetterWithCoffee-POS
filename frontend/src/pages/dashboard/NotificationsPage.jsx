import { useEffect, useMemo } from 'react';
import { useNotificationContext } from '../../context/NotificationContext';
import { Download, Trash2, Bell, AlertTriangle, FileEdit, ShoppingBag } from 'lucide-react';
import styles from './NotificationsPage.module.css';

export default function NotificationsPage() {
    const { logs, markAllRead, clearLogs, refreshLogs } = useNotificationContext();

    useEffect(() => {
        markAllRead();
        // optionally refresh on mount to ensure latest from backend
        refreshLogs();
    }, [markAllRead, refreshLogs]);

    const handleDownloadTXT = () => {
        if (logs.length === 0) return;

        let txtContent = "=== Better with Coffee: System Logs ===\n\n";
        logs.forEach(log => {
            const date = new Date(log.timestamp).toLocaleString();
            txtContent += `[${date}] [${log.type}] ${log.message}\n`;
            if (log.details) {
                txtContent += `    Details: ${log.details}\n`;
            }
            txtContent += `    Actor: ${log.cashier}\n\n`;
        });

        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `bwc_logs_${new Date().toISOString().split('T')[0]}.txt`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleClearLogs = async () => {
        if (window.confirm("Are you sure you want to permanently delete all server logs? This cannot be undone.")) {
            await clearLogs();
        }
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'SALE': return <ShoppingBag size={20} className={styles.iconSale} />;
            case 'MENU_EDIT': return <FileEdit size={20} className={styles.iconEdit} />;
            case 'ALERT': return <AlertTriangle size={20} className={styles.iconAlert} />;
            default: return <Bell size={20} className={styles.iconDefault} />;
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>System Logs</h2>
                <div className={styles.actions}>
                    <button className={styles.downloadBtn} onClick={handleDownloadTXT} disabled={logs.length === 0}>
                        <Download size={18} /> Download TXT
                    </button>
                    <button className={styles.clearBtn} onClick={handleClearLogs} disabled={logs.length === 0}>
                        <Trash2 size={18} /> Clear Server Logs
                    </button>
                </div>
            </div>

            <div className={styles.listContainer}>
                {logs.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Bell className={styles.emptyIcon} size={48} />
                        <p>No system logs found.</p>
                        <span>Logs will appear here when sales are made or the menu is updated.</span>
                    </div>
                ) : (
                    <div className={styles.logList}>
                        {logs.map((log) => (
                            <div key={log.id || Math.random()} className={styles.logItem}>
                                <div className={styles.logIconWrapper}>
                                    {getIconForType(log.type)}
                                </div>
                                <div className={styles.logContent}>
                                    <div className={styles.logTopRow}>
                                        <span className={styles.logMessage}>{log.message}</span>
                                        <span className={styles.logTime}>
                                            {new Date(log.timestamp).toLocaleString(undefined, {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    {log.details && (
                                        <div className={styles.logDetails}>{log.details}</div>
                                    )}
                                    <div className={styles.logActor}>Actor: {log.cashier}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
