import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ProfilePanel from '../shared/ProfilePanel';
import styles from './HeaderBar.module.css';

export default function HeaderBar({ orderType, onOrderTypeClick }) {
    const { currentUser } = useAuth();
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
                    <div className={styles.brandContainer}>
                        <span className={styles.brandFull}>Better with Coffee</span>
                        <span className={styles.brandShort} aria-hidden="true">BC</span>
                    </div>
                    {orderType && (
                        <button
                            onClick={onOrderTypeClick}
                            className={`${styles.orderBadge} ${orderType === 'Dine-In' ? styles.dineIn : styles.takeOut}`}
                        >
                            {orderType}
                        </button>
                    )}
                </div>

                <div className={styles.clock}>{formatTime(time)}</div>

                <div className={styles.rightSection}>
                    <button
                        className={styles.userPill}
                        onClick={() => setIsProfileOpen(true)}
                        title="View profile"
                        aria-label="Open profile"
                    >
                        <div className={styles.userAvatar}>{initial}</div>
                        <span className={styles.cashierName}>{displayName}</span>
                    </button>
                    <button className={styles.logoutBtn} title="Logout">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            <ProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </>
    );
}
