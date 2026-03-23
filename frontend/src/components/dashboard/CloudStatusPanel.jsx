import { useState, useEffect } from 'react';
import { Cloud, Globe, Copy, RefreshCw, Smartphone, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './CloudStatusPanel.module.css';

export default function CloudStatusPanel() {
    const [status, setStatus] = useState({ status: 'loading', url: null });
    const [isLoading, setIsLoading] = useState(false);

    const fetchStatus = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/notifications/cloud-status');
            const data = await response.json();
            setStatus(data);
        } catch (error) {
            console.error('Failed to fetch cloud status', error);
            setStatus({ status: 'error', url: null });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        // Poll status every 10 seconds while the panel is visible
        const interval = setInterval(fetchStatus, 10000);
        return () => clearInterval(interval);
    }, []);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('URL Copied to clipboard');
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <div className={`${styles.statusDot} ${styles[status.status]}`} />
                    <h3 className={styles.title}>Cloud Access</h3>
                </div>
                <button 
                    onClick={fetchStatus} 
                    className={`${styles.refreshBtn} ${isLoading ? styles.spinning : ''}`}
                    disabled={isLoading}
                >
                    <RefreshCw size={14} />
                </button>
            </div>

            {status.status === 'active' && status.url ? (
                <div className={styles.activeContent}>
                    <div className={styles.urlBox}>
                        <Globe size={18} className={styles.globeIcon} />
                        <span className={styles.urlText}>{status.url}</span>
                        <button 
                            onClick={() => copyToClipboard(status.url)} 
                            className={styles.copyBtn}
                            title="Copy URL"
                        >
                            <Copy size={16} />
                        </button>
                    </div>

                    <div className={styles.mobileTip}>
                        <Smartphone size={16} />
                        <span>Open this URL on your tablet or smartphone to access the POS remotely.</span>
                    </div>

                    <div className={styles.warningBox}>
                        <AlertCircle size={14} />
                        <span>Quick Tunnels are temporary. Link resets if the main PC restarts.</span>
                    </div>
                </div>
            ) : status.status === 'inactive' ? (
                <div className={styles.inactiveBox}>
                    <Cloud size={24} className={styles.cloudOffIcon} />
                    <p>Cloud access is currently disabled for this instance.</p>
                </div>
            ) : status.status === 'starting' ? (
                <div className={styles.loadingBox}>
                    <div className={styles.simpleSpinner} />
                    <p>Connecting to Cloudflare...</p>
                </div>
            ) : (
                <div className={styles.errorBox}>
                    <AlertCircle size={20} />
                    <p>Could not reach the tunnel manager.</p>
                </div>
            )}
        </div>
    );
}
