import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ProfilePanel from '../shared/ProfilePanel';
import styles from './TopBar.module.css';

export default function TopBar({ onToggleSidebar }) {
    const location = useLocation();
    const path = location.pathname.split('/').pop();
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
                    <div className={styles.clock}>{formatTime(time)}</div>

                    <div className={styles.divider} />

                    <div className={styles.userContainer}>
                        <button className={styles.notificationBtn}>
                            <Bell size={20} />
                            <span className={styles.badge} />
                        </button>

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
