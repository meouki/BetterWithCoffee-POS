import { useState, useEffect } from 'react';
import { useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, Menu, Monitor, Cloud } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotificationContext } from '../../context/NotificationContext';
import ProfilePanel from '../shared/ProfilePanel';
import CloudStatusPanel from './CloudStatusPanel';
import { attendanceApi } from '../../api/attendance';
import styles from './TopBar.module.css';

export default function TopBar({ onToggleSidebar }) {
    const location = useLocation();
    const path = location.pathname.split('/').pop();
    const { currentUser, isMaster, isAdmin } = useAuth();
    const { unreadCount } = useNotificationContext();
    const canSwitch = isMaster || isAdmin;

    const [time, setTime] = useState(new Date());
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isCloudOpen, setIsCloudOpen] = useState(false);
    const [attendanceStatus, setAttendanceStatus] = useState('none'); // 'none', 'in', 'out'

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchAttendance = useCallback(async () => {
        if (!currentUser) return;
        try {
            const records = await attendanceApi.getRecords(currentUser.id);
            const todayStr = new Date().toISOString().split('T')[0];
            const todayRecord = records.find(r => r.date === todayStr);

            if (!todayRecord || !todayRecord.clock_in) {
                setAttendanceStatus('none');
            } else if (todayRecord.clock_in && !todayRecord.clock_out) {
                setAttendanceStatus('in');
            } else if (todayRecord.clock_in && todayRecord.clock_out) {
                setAttendanceStatus('out');
            }
        } catch (error) {
            console.error('Failed to fetch attendance for topbar:', error);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    // Re-fetch when profile panel closes (user might have changed status)
    useEffect(() => {
        if (!isProfileOpen) {
            fetchAttendance();
        }
    }, [isProfileOpen, fetchAttendance]);

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

                        <button
                            className={`${styles.iconBtn} ${isCloudOpen ? styles.active : ''}`}
                            onClick={() => setIsCloudOpen(!isCloudOpen)}
                            title="Cloud Access Status"
                        >
                            <Cloud size={20} />
                        </button>

                        <div className={styles.divider} />
                        {/* Clickable user pill → opens profile panel */}
                        <button
                            className={styles.userPill}
                            onClick={() => setIsProfileOpen(true)}
                            title="View profile"
                            aria-label="Open profile"
                        >
                            <div className={styles.userAvatarWrapper}>
                                <div className={`${styles.statusRing} ${attendanceStatus === 'in' ? styles.statusClockedIn :
                                        attendanceStatus === 'out' ? styles.statusClockedOut :
                                            styles.statusNotClocked
                                    }`} />
                                <div className={styles.userAvatar}>{initial}</div>
                            </div>
                            <span className={styles.userName}>{displayName}</span>
                        </button>
                    </div>
                </div>
            </header>

            <ProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

            {isCloudOpen && (
                <div className={styles.cloudOverlay} onClick={() => setIsCloudOpen(false)}>
                    <div className={styles.cloudDropdown} onClick={e => e.stopPropagation()}>
                        <CloudStatusPanel />
                    </div>
                </div>
            )}
        </>
    );
}
