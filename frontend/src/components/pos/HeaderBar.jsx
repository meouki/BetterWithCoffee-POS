import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, History } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ProfilePanel from '../shared/ProfilePanel';
import styles from './HeaderBar.module.css';

export default function HeaderBar({ orderType, onOrderTypeClick, onHistoryClick, isHistoryOpen }) {
    const { currentUser, isMaster, isAdmin } = useAuth();
    const canSwitch = isMaster || isAdmin;
    const [time, setTime] = useState(new Date());
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) +
            ' — ' +
            date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    };

    const initial = currentUser?.name?.charAt(0).toUpperCase() ?? '?';
    const displayName = currentUser?.username ?? currentUser?.name ?? 'User';

    return (
        <>
            <div className={styles.headerBar}>
                <div className={styles.leftSection}>
                    <button 
                        className={`${styles.historyBtn} ${isHistoryOpen ? styles.active : ''}`}
                        onClick={onHistoryClick}
                        title="View Shift History"
                    >
                        <History size={18} />
                        <span className={styles.switchText}>History</span>
                    </button>
                    <div className={styles.typeToggleWrapper}>
                        <button
                            onClick={() => onOrderTypeClick(orderType === 'Dine-In' ? 'Take-Out' : 'Dine-In')}
                            className={`${styles.typeToggle} ${orderType === 'Dine-In' ? styles.bgDine : styles.bgTake}`}
                            title={`Click to switch to ${orderType === 'Dine-In' ? 'Take-Out' : 'Dine-In'}`}
                        >
                            <span className={styles.dot}></span>
                            {orderType}
                        </button>
                    </div>
                </div>

                <div className={styles.clock}>{formatTime(time)}</div>

                <div className={styles.rightSection}>
                    {canSwitch && (
                        <Link to="/dashboard/overview" className={styles.switchBtn} title="Switch to Dashboard">
                            <LayoutDashboard size={18} />
                            <span className={styles.switchText}>Dashboard</span>
                        </Link>
                    )}
                    <button
                        className={styles.userPill}
                        onClick={() => setIsProfileOpen(true)}
                        title="View profile"
                        aria-label="Open profile"
                    >
                        <div className={styles.userAvatar}>{initial}</div>
                        <span className={styles.cashierName}>{displayName}</span>
                    </button>
                </div>
            </div>

            <ProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </>
    );
}
