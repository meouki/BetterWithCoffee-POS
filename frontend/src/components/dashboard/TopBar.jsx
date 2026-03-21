import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, Menu, Monitor } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotificationContext } from '../../context/NotificationContext';
import ProfilePanel from '../shared/ProfilePanel';
import styles from './TopBar.module.css';

export default function TopBar({ onToggleSidebar }) {
    const location = useLocation();
    const path = location.pathname.split('/').pop();
    const { currentUser, isMaster, isAdmin } = useAuth();
    const { unreadCount } = useNotificationContext();
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
            date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

    const initial = currentUser?.name?.charAt(0).toUpperCase() ?? '?';
    const displayName = currentUser?.username ?? currentUser?.name ?? 'User';

    return (
        <>
            <header className={styles.topBar}>
                <div className={styles.leftSection}>
                    <button className={styles.menuBtn} onClick={onToggleSidebar} aria-label="Toggle sidebar">
                        <Menu size={20} />
                    </button>
                    <h1 className={styles.pageTitle}>{path.replace('-', ' ')}</h1>
                </div>

                <div className={styles.rightSection}>
                    {canSwitch && (
                        <Link to="/pos" className={styles.switchBtn} title="Switch to POS">
                            <Monitor size={18} />
                            <span className={styles.switchText}>Go to POS</span>
                        </Link>
                    )}

                    <div className={styles.clock}>{formatTime(time)}</div>

                    <div className={styles.divider} />

                    <div className={styles.userContainer}>
                        <Link to="/dashboard/notifications" className={styles.notificationBtn} aria-label="Notifications">
                            <Bell size={20} />
                            {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
                        </Link>

                        {/* Clickable user pill → opens profile panel */}
                        <button
                            className={styles.userPill}
                            onClick={() => setIsProfileOpen(true)}
                            title="View profile"
                            aria-label="Open profile"
                        >
                            <div className={styles.userAvatar}>{initial}</div>
                            <span className={styles.userName}>{displayName}</span>
                        </button>
                    </div>
                </div>
            </header>

            <ProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </>
    );
}
