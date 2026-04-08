import { useState, useEffect } from 'react';
import styles from './AmbientBackground.module.css';

export default function AmbientBackground() {
    const [enabled, setEnabled] = useState(() => {
        return localStorage.getItem('bwc_ambient_bg') !== 'false';
    });

    useEffect(() => {
        const handleStorageChange = () => {
            setEnabled(localStorage.getItem('bwc_ambient_bg') !== 'false');
        };

        window.addEventListener('ambient_bg_changed', handleStorageChange);
        return () => window.removeEventListener('ambient_bg_changed', handleStorageChange);
    }, []);

    if (!enabled) return null;

    return (
        <div className={styles.ambientContainer}>
            <div className={`${styles.blob} ${styles.blob1}`}></div>
            <div className={`${styles.blob} ${styles.blob2}`}></div>
            <div className={`${styles.blob} ${styles.blob3}`}></div>
        </div>
    );
}
