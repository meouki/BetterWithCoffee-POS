import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    UtensilsCrossed,
    Package,
    BarChart2,
    Users,
    Settings,
    LogOut,
    X,
    Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ProfilePanel from '../shared/ProfilePanel';
import styles from './Sidebar.module.css';

export default function Sidebar({ isOpen, onClose }) {
    const { currentUser, isMaster, isAdmin } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleProfileClick = () => {
        setIsProfileOpen(true);
        onClose(); // Close sidebar after opening profile
    };

    const allNavItems = [
        { name: 'Overview', path: '/dashboard/overview', icon: LayoutDashboard, roles: ['Master', 'Admin'] },
        { name: 'Orders', path: '/dashboard/orders', icon: ShoppingBag, roles: ['Master'] },
        { name: 'Menu', path: '/dashboard/menu', icon: UtensilsCrossed, roles: ['Master'] },
        { name: 'Inventory', path: '/dashboard/inventory', icon: Package, roles: ['Master'] },
        { name: 'Reports', path: '/dashboard/reports', icon: BarChart2, roles: ['Master', 'Admin'] },
        { name: 'Users', path: '/dashboard/users', icon: Users, roles: ['Master'] },
        { name: 'Notifications', path: '/dashboard/notifications', icon: Bell, roles: ['Master', 'Admin'] },
        { name: 'Settings', path: '/dashboard/settings', icon: Settings, roles: ['Master', 'Admin'] },
    ];

    // Filter nav items to only those allowed for the current role
    const navItems = allNavItems.filter(item =>
        item.roles.includes(currentUser?.role)
    );

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
                onClick={onClose}
            />

            {/* Sidebar Container */}
            <div className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.header}>
                    <span className={styles.brand}>Better with Coffee</span>
                    <button className={styles.mobileCloseBtn} onClick={onClose} aria-label="Close sidebar">
                        <X size={20} />
                    </button>
                </div>

                <nav className={styles.nav}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `${styles.navLink} ${isActive ? styles.activeLink : ''}`
                                }
                            >
                                <Icon size={20} />
                                {item.name}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className={styles.footer}>
                    <button
                        className={styles.userProfile}
                        onClick={handleProfileClick}
                        title="View Profile"
                    >
                        <div className={styles.avatar}>{currentUser?.name?.charAt(0).toUpperCase() ?? 'U'}</div>
                        <div className={styles.userInfo}>
                            <div className={styles.userName}>{currentUser?.name ?? 'Unknown'}</div>
                            <div className={styles.roleBadge}>{currentUser?.role}</div>
                        </div>
                    </button>
                    <button className={styles.logoutBtn}>
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </div>

            <ProfilePanel
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />
        </>
    );
}
