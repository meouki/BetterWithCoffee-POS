import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    // Read the animation type from CSS variable or localStorage to apply correct class
    const [animationClass, setAnimationClass] = useState('page-transition-slide-in-left');

    useEffect(() => {
        const storedType = localStorage.getItem('bwc_page_animation_type') || 'slide-in-left';
        setAnimationClass(`page-transition-${storedType}`);
    }, [location.pathname]);

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className={styles.mainWrapper}>
                <TopBar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <div
                    key={location.pathname}
                    className={`${styles.content} page-transition ${animationClass}`}
                >
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
