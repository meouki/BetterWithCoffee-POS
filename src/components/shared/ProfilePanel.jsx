import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './ProfilePanel.module.css';

// ─── Mock DTR data (dates cashier/admin was present) ──────────────────────────
// In production, this comes from GET /api/attendance/:userId
const generateMockAttendance = (userId) => {
    // Simulate ~18 present days in current month for demo
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const present = new Set();
    // Seed based on userId so each user has consistent (but different) attendance
    for (let d = 1; d <= today.getDate(); d++) {
        // Skip future; ~80% chance of being present on past weekdays
        const date = new Date(year, month, d);
        const dow = date.getDay();
        if (dow === 0 || dow === 6) continue; // skip weekends
        if ((d * userId) % 5 !== 0) present.add(d); // pseudo-random but stable
    }
    return present;
};

const ROLE_CLASS = {
    Master: styles.roleMaster,
    Admin: styles.roleAdmin,
    Cashier: styles.roleCashier,
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Mock sales stats per role
const MOCK_STATS = {
    Master: { revenue: '₱184,320', orders: 1240 },
    Admin: { revenue: '₱92,560', orders: 617 },
    Cashier: { revenue: '₱38,200', orders: 254 },
};

export default function ProfilePanel({ isOpen, onClose }) {
    const { currentUser } = useAuth();
    const today = new Date();

    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    if (!isOpen) return null;

    const attendance = generateMockAttendance(currentUser?.id ?? 1);
    const stats = MOCK_STATS[currentUser?.role] ?? MOCK_STATS.Cashier;

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

    const getDayClass = (day) => {
        const isFuture = isCurrentMonth && day > today.getDate();
        if (isFuture) return `${styles.calDay} ${styles.calDayFuture}`;

        const isPresent = isCurrentMonth
            ? attendance.has(day)
            : (day * 7) % 9 !== 0; // pseudo for past months

        const isToday = isCurrentMonth && day === today.getDate();
        const base = isPresent ? styles.calDayPresent : styles.calDayAbsent;
        return `${styles.calDay} ${base} ${isToday ? styles.calDayToday : ''}`;
    };

    // Build grid cells: empty pads + days
    const gridCells = [
        ...Array(firstWeekday).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    const initial = currentUser?.name?.charAt(0).toUpperCase() ?? '?';
    const displayName = currentUser?.name ?? 'User';
    const username = currentUser?.username ?? '';
    const role = currentUser?.role ?? 'Cashier';

    return (
        <>
            <div className={styles.backdrop} onClick={onClose} />
            <aside className={styles.panel} role="dialog" aria-label="Profile">

                {/* Header */}
                <div className={styles.panelHeader}>
                    <span className={styles.panelTitle}>My Profile</span>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                        <X size={18} />
                    </button>
                </div>

                {/* Identity */}
                <div className={styles.identity}>
                    <div className={styles.bigAvatar}>{initial}</div>
                    <div>
                        <div className={styles.profileName}>{displayName}</div>
                        <div className={styles.profileAt}>@{username}</div>
                    </div>
                    <span className={`${styles.rolePill} ${ROLE_CLASS[role] ?? styles.roleCashier}`}>
                        {role}
                    </span>
                </div>

                {/* Stats */}
                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{stats.revenue}</div>
                        <div className={styles.statLabel}>Total Revenue</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{stats.orders.toLocaleString()}</div>
                        <div className={styles.statLabel}>Orders Processed</div>
                    </div>
                </div>

                {/* DTR Calendar */}
                <div className={styles.dtrSection}>
                    <div className={styles.sectionTitle}>Daily Time Record</div>
                    <div className={styles.sectionSub}>Attendance for this account</div>

                    {/* Month Nav */}
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

                    {/* Weekday Headers */}
                    <div className={styles.weekRow}>
                        {WEEKDAYS.map(d => (
                            <div key={d} className={styles.weekday}>{d}</div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
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

                    {/* Legend */}
                    <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--color-muted)', fontFamily: 'var(--font-ui)' }}>
                            <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: 'var(--color-accent)' }} /> Present
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--color-muted)', fontFamily: 'var(--font-ui)' }}>
                            <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: 'var(--color-surface)', border: '1.5px solid var(--color-border)' }} /> Absent
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.panelFooter}>
                    <button className={styles.logoutBtn} onClick={onClose}>
                        <LogOut size={16} />
                        Log out
                    </button>
                </div>

            </aside>
        </>
    );
}
