import { useState, useEffect, useCallback } from 'react';
import { 
    X, ChevronLeft, ChevronRight, Download, 
    User as UserIcon, Coffee, Gamepad2, Camera, 
    Music, Heart, Star, Smile, Shield, Zap
} from 'lucide-react';
import { attendanceApi } from '../../api/attendance';
import styles from './UserDTRModal.module.css';

const AVATAR_ICONS = {
    User: UserIcon, Coffee, Gamepad2, Camera, Music, Heart, Star, Smile, Shield, Zap
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function UserDTRModal({ isOpen, user, onClose }) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [stats, setStats] = useState({ revenue: 0, orders: 0 });

    const loadData = useCallback(async () => {
        if (!user) return;
        try {
            const [records, userStats] = await Promise.all([
                attendanceApi.getRecords(user.id),
                attendanceApi.getStats(user.username)
            ]);
            setAttendanceRecords(records);
            setStats(userStats);
        } catch (error) {
            console.error('Failed to load user DTR data:', error);
        }
    }, [user]);

    useEffect(() => {
        if (isOpen && user) {
            loadData();
        }
    }, [isOpen, user, loadData]);

    if (!isOpen || !user) return null;

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
        a.download = `DTR_${user.username}_${MONTHS[viewMonth]}_${viewYear}.csv`;
        a.click();
    };

    const AvatarIcon = AVATAR_ICONS[user.avatar_icon] || UserIcon;

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.userInfo}>
                        <div className={styles.modalAvatar}>
                            <AvatarIcon size={24} />
                        </div>
                        <div>
                            <h3 className={styles.modalTitle}>{user.name}'s Attendance</h3>
                            <p className={styles.modalSubtitle}>@{user.username} • {user.role}</p>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.statsRow}>
                        <div className={styles.statCard}>
                            <div className={styles.statLabel}>Total Sales</div>
                            <div className={styles.statValue}>₱{stats.revenue.toLocaleString()}</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statLabel}>Orders Placed</div>
                            <div className={styles.statValue}>{stats.orders.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className={styles.calendarHeader}>
                        <button className={styles.navBtn} onClick={prevMonth}><ChevronLeft size={18} /></button>
                        <span className={styles.calMonth}>{MONTHS[viewMonth]} {viewYear}</span>
                        <button className={styles.navBtn} onClick={nextMonth} disabled={isCurrentMonth}><ChevronRight size={18} /></button>
                    </div>

                    <div className={styles.calendarGrid}>
                        {WEEKDAYS.map(d => <div key={d} className={styles.weekday}>{d}</div>)}
                        {gridCells.map((day, i) => (
                            day === null 
                                ? <div key={`pad-${i}`} className={styles.calDayEmpty} />
                                : <div key={day} className={getDayClass(day)} title={`${MONTHS[viewMonth]} ${day}`}>{day}</div>
                        ))}
                    </div>

                    <div className={styles.legend}>
                        <div className={styles.legendItem}><div className={`${styles.dot} ${styles.present}`} /> Work</div>
                        <div className={styles.legendItem}><div className={`${styles.dot} ${styles.absent}`} /> Absent</div>
                        <div className={styles.legendItem}><div className={`${styles.dot} ${styles.dayOff}`} /> Day Off</div>
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.exportBtn} onClick={exportDTR}>
                        <Download size={16} /> Export CSV
                    </button>
                    <button className={styles.closeActionBtn} onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}
