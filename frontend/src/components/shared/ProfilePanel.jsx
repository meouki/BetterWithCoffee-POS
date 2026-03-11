import { useState, useEffect, useCallback } from 'react';
import { 
    X, ChevronLeft, ChevronRight, LogOut, 
    Download, Coffee, User, Gamepad2, Camera, 
    Music, Heart, Star, Smile, Shield, Zap,
    Clock, Calendar, Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { attendanceApi } from '../../api/attendance';
import { usersApi } from '../../api/users';
import toast from 'react-hot-toast';
import styles from './ProfilePanel.module.css';

const AVATAR_ICONS = {
    User, Coffee, Gamepad2, Camera, Music, Heart, Star, Smile, Shield, Zap
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const ROLE_CLASS = {
    Master: styles.roleMaster,
    Admin: styles.roleAdmin,
    Cashier: styles.roleCashier,
};

export default function ProfilePanel({ isOpen, onClose }) {
    const { currentUser, setCurrentUser, logout } = useAuth();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [stats, setStats] = useState({ revenue: 0, orders: 0 });
    const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const loadData = useCallback(async () => {
        if (!currentUser) return;
        try {
            const [records, userStats] = await Promise.all([
                attendanceApi.getRecords(currentUser.id),
                attendanceApi.getStats(currentUser.username)
            ]);
            setAttendanceRecords(records);
            setStats(userStats);
        } catch (error) {
            console.error('Failed to load profile data:', error);
        }
    }, [currentUser]);

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen, loadData]);

    const handleClockIn = async () => {
        setIsLoading(true);
        try {
            await attendanceApi.clockIn(currentUser.id);
            toast.success('Clocked in successfully');
            loadData();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClockOut = async () => {
        setIsLoading(true);
        try {
            await attendanceApi.clockOut(currentUser.id);
            toast.success('Clocked out successfully');
            loadData();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetDayOff = async () => {
        setIsLoading(true);
        try {
            await attendanceApi.setDayOff(currentUser.id);
            toast.success('Today marked as Day Off');
            loadData();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const changeAvatar = async (iconName) => {
        try {
            const updated = await usersApi.update(currentUser.id, { avatar_icon: iconName });
            setCurrentUser(updated);
            localStorage.setItem('bwc_user', JSON.stringify(updated));
            setIsAvatarPickerOpen(false);
            toast.success('Avatar updated');
        } catch (error) {
            toast.error('Failed to update avatar');
        }
    };

    const exportDTR = () => {
        const header = 'Date,Clock In,Clock Out,Type\n';
        const rows = attendanceRecords.map(r => {
            const cin = r.clock_in ? new Date(r.clock_in).toLocaleTimeString() : '-';
            const cout = r.clock_out ? new Date(r.clock_out).toLocaleTimeString() : '-';
            return `${r.date},${cin},${cout},${r.type}`;
        }).join('\n');

        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `DTR_${currentUser.username}_${MONTHS[viewMonth]}_${viewYear}.csv`;
        a.click();
    };

    if (!isOpen) return null;

    // Calendar helpers
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        const now = today.getMonth();
        const nowY = today.getFullYear();
        if (viewYear > nowY || (viewYear === nowY && viewMonth >= now)) return;
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const getDayStatus = (day) => {
        const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const record = attendanceRecords.find(r => r.date === dateStr);
        
        if (record) return record;
        
        // If past date and no record, it's Absent
        const checkDate = new Date(viewYear, viewMonth, day);
        if (checkDate < today && checkDate.setHours(0,0,0,0) !== today.setHours(0,0,0,0)) {
            return { type: 'Absent' };
        }
        
        return null;
    };

    const getDayClass = (day) => {
        const status = getDayStatus(day);
        const isToday = isCurrentMonth && day === today.getDate();
        const baseClass = isToday ? styles.calDayToday : '';

        if (!status) return `${styles.calDay} ${baseClass} ${styles.calDayPending}`;
        if (status.type === 'Work') return `${styles.calDay} ${baseClass} ${styles.calDayPresent}`;
        if (status.type === 'DayOff') return `${styles.calDay} ${baseClass} ${styles.calDayDayOff}`;
        if (status.type === 'Absent') return `${styles.calDay} ${baseClass} ${styles.calDayAbsent}`;
        
        return styles.calDay;
    };

    const gridCells = [
        ...Array(firstWeekday).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    const AvatarIcon = AVATAR_ICONS[currentUser?.avatar_icon] || User;
    const todayRecord = attendanceRecords.find(r => r.date === todayStr);

    const handleLogout = () => {
        logout();
        onClose();
    };

    return (
        <>
            <div className={styles.backdrop} onClick={onClose} />
            <aside className={styles.panel} role="dialog" aria-label="Profile">
                <div className={styles.panelHeader}>
                    <span className={styles.panelTitle}>Profile & DTR</span>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                        <X size={18} />
                    </button>
                </div>

                <div className={styles.identity}>
                    <div className={styles.bigAvatar} onClick={() => setIsAvatarPickerOpen(!isAvatarPickerOpen)}>
                        <AvatarIcon size={40} />
                    </div>
                    
                    {isAvatarPickerOpen && (
                        <div className={styles.avatarPicker}>
                            {Object.entries(AVATAR_ICONS).map(([name, Icon]) => (
                                <div 
                                    key={name}
                                    className={`${styles.iconOption} ${currentUser?.avatar_icon === name ? styles.iconOptionActive : ''}`}
                                    onClick={() => changeAvatar(name)}
                                >
                                    <Icon size={20} />
                                </div>
                            ))}
                        </div>
                    )}

                    <div>
                        <div className={styles.profileName}>{currentUser?.name}</div>
                        <div className={styles.profileAt}>@{currentUser?.username}</div>
                    </div>
                    <span className={`${styles.rolePill} ${ROLE_CLASS[currentUser?.role] ?? styles.roleCashier}`}>
                        {currentUser?.role}
                    </span>
                </div>

                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>₱{stats.revenue.toLocaleString()}</div>
                        <div className={styles.statLabel}>Total Sales</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{stats.orders.toLocaleString()}</div>
                        <div className={styles.statLabel}>Orders Placed</div>
                    </div>
                </div>

                <div className={styles.dtrSection}>
                    <div className={styles.sectionTitle}>Recording Control</div>
                    <div className={styles.sectionSub}>Clock in for today's shift</div>
                    
                    <div className={styles.dtrActions}>
                        <button 
                            className={`${styles.dtrBtn} ${todayRecord?.clock_in ? styles.clockInActive : ''}`}
                            onClick={handleClockIn}
                            disabled={isLoading || !!todayRecord?.clock_in || todayRecord?.type === 'DayOff'}
                        >
                            {todayRecord?.clock_in ? <Check size={18} /> : <Clock size={18} />}
                            <span>Clock In</span>
                        </button>
                        <button 
                            className={`${styles.dtrBtn} ${todayRecord?.clock_out ? styles.clockOutActive : ''}`}
                            onClick={handleClockOut}
                            disabled={isLoading || !todayRecord?.clock_in || !!todayRecord?.clock_out}
                        >
                            <LogOut size={18} />
                            <span>Clock Out</span>
                        </button>
                        <button 
                            className={`${styles.dtrBtn} ${todayRecord?.type === 'DayOff' ? styles.dayOffActive : ''}`}
                            onClick={handleSetDayOff}
                            disabled={isLoading || !!todayRecord?.clock_in}
                        >
                            <Calendar size={18} />
                            <span>Day Off</span>
                        </button>
                    </div>

                    <div className={styles.calendarNav}>
                        <button className={styles.navBtn} onClick={prevMonth} aria-label="Previous month">
                            <ChevronLeft size={16} />
                        </button>
                        <span className={styles.calMonth}>{MONTHS[viewMonth]} {viewYear}</span>
                        <button
                            className={styles.navBtn}
                            onClick={nextMonth}
                            aria-label="Next month"
                            disabled={isCurrentMonth}
                            style={{ opacity: isCurrentMonth ? 0.3 : 1 }}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className={styles.weekRow}>
                        {WEEKDAYS.map(d => (
                            <div key={d} className={styles.weekday}>{d}</div>
                        ))}
                    </div>

                    <div className={styles.calGrid}>
                        {gridCells.map((day, i) =>
                            day === null
                                ? <div key={`pad-${i}`} className={`${styles.calDay} ${styles.calDayEmpty}`} />
                                : (
                                    <div key={day} className={getDayClass(day)} title={`${MONTHS[viewMonth]} ${day}`}>
                                        {day}
                                    </div>
                                )
                        )}
                    </div>

                    <div className={styles.exportRow}>
                        <button className={styles.exportBtn} onClick={exportDTR}>
                            <Download size={14} /> Export DTR (.csv)
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.65rem', color: 'var(--color-muted)' }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: 'var(--color-accent)' }} /> Present
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.65rem', color: 'var(--color-muted)' }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: 'var(--color-error)' }} /> Absent
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.65rem', color: 'var(--color-muted)' }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }} /> Day Off
                        </div>
                    </div>
                </div>

                <div className={styles.panelFooter}>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        <LogOut size={16} />
                        Log out
                    </button>
                </div>
            </aside>
        </>
    );
}
