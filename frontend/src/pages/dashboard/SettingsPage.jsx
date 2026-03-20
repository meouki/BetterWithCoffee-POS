import { useState, useEffect } from 'react';
import { Moon, Sun, Monitor, Check } from 'lucide-react';
import styles from './SettingsPage.module.css';

const ACCENT_PRESETS = [
    { name: 'Caramel', color: '#D47C3A', hover: '#B8682E', muted: 'rgba(212, 124, 58, 0.15)' },
    { name: 'Sage', color: '#6A9E6F', hover: '#558259', muted: 'rgba(106, 158, 111, 0.15)' },
    { name: 'Dusty Rose', color: '#C47E85', hover: '#A6666D', muted: 'rgba(196, 126, 133, 0.15)' },
    { name: 'Slate Blue', color: '#4A7FA5', hover: '#396587', muted: 'rgba(74, 127, 165, 0.15)' },
    { name: 'Amber', color: '#F59E0B', hover: '#D97706', muted: 'rgba(245, 158, 11, 0.15)' }
];

export default function SettingsPage() {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('bwc_theme') || 'system';
    });

    const [accent, setAccent] = useState(() => {
        return localStorage.getItem('bwc_accent') || 'Amber';
    });

    const [activeTheme, setActiveTheme] = useState('light');

    const [animationDuration, setAnimationDuration] = useState(() => {
        return localStorage.getItem('bwc_page_animation_duration') || '0.5';
    });

    const [animationType, setAnimationType] = useState(() => {
        return localStorage.getItem('bwc_page_animation_type') || 'slide-in-left';
    });

    useEffect(() => {
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        setActiveTheme(isDark ? 'dark' : 'light');

        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        if (theme !== 'system') {
            localStorage.setItem('bwc_theme', theme);
        } else {
            localStorage.removeItem('bwc_theme');
        }
    }, [theme]);

    // Handle Accent Color Change
    useEffect(() => {
        const selected = ACCENT_PRESETS.find(a => a.name === accent);
        if (selected) {
            document.documentElement.style.setProperty('--color-accent', selected.color);
            document.documentElement.style.setProperty('--color-accent-hover', selected.hover);
            document.documentElement.style.setProperty('--color-accent-muted', selected.muted);
            localStorage.setItem('bwc_accent', accent);
        }
    }, [accent]);

    // Handle Animation Changes
    useEffect(() => {
        document.documentElement.style.setProperty('--transition-page-duration', `${animationDuration}s`);
        localStorage.setItem('bwc_page_animation_duration', animationDuration);
    }, [animationDuration]);

    useEffect(() => {
        localStorage.setItem('bwc_page_animation_type', animationType);
    }, [animationType]);

    return (
        <div className={styles.pageContainer}>
            <h2 className={styles.title}>System Settings</h2>

            <div className={styles.section}>
                <h3 className={styles.sectionHeader}>
                    <Monitor size={20} /> Appearance
                </h3>

                <div className={styles.settingRow}>
                    <div className={styles.settingInfo}>
                        <div className={styles.settingTitle}>Dark Mode</div>
                        <div className={styles.settingDesc}>
                            Toggle between light and dark typography themes manually.
                        </div>
                    </div>

                    <button
                        className={styles.themeToggle}
                        onClick={() => setTheme(activeTheme === 'dark' ? 'light' : 'dark')}
                        title={`Switch to ${activeTheme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        <div className={`${styles.themeNub} ${activeTheme === 'dark' ? styles.themeNubDark : styles.themeNubLight}`}>
                            <span className={styles.nubIcon}>
                                {activeTheme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
                            </span>
                        </div>
                    </button>
                </div>

                <div className={styles.divider} />

                <div className={styles.settingRow}>
                    <div className={styles.settingInfo}>
                        <div className={styles.settingTitle}>Accent Color</div>
                        <div className={styles.settingDesc}>
                            Select the primary interactive color for buttons and active states.
                        </div>
                    </div>

                    <div className={styles.colorPickerGrid}>
                        {ACCENT_PRESETS.map(preset => (
                            <button
                                key={preset.name}
                                onClick={() => setAccent(preset.name)}
                                className={`${styles.colorSwatch} ${accent === preset.name ? styles.active : ''}`}
                                style={{ backgroundColor: preset.color }}
                                title={preset.name}
                            >
                                {accent === preset.name && <Check size={16} />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.divider} />

                <div className={styles.settingRow}>
                    <div className={styles.settingInfo}>
                        <div className={styles.settingTitle}>Page Transitions</div>
                        <div className={styles.settingDesc}>
                            Configure how pages behave when navigating between views.
                        </div>
                    </div>

                    <div className={styles.animationControls}>
                        <div className={styles.controlGroup}>
                            <label className={styles.controlLabel}>Style</label>
                            <div className={styles.typeSelector}>
                                {['slide-in-left', 'slide-in-up', 'fade-in'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setAnimationType(type)}
                                        className={`${styles.typeBtn} ${animationType === type ? styles.active : ''}`}
                                    >
                                        {type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.controlGroup}>
                            <label className={styles.controlLabel}>
                                Duration <span className={styles.valueLabel}>{animationDuration}s</span>
                            </label>
                            <input
                                type="range"
                                min="0.1"
                                max="1.0"
                                step="0.1"
                                value={animationDuration}
                                onChange={(e) => setAnimationDuration(e.target.value)}
                                className={styles.rangeInput}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionHeader}>System Information</h3>
                <div className={styles.infoGrid}>
                    <div>
                        <div className={styles.infoLabel}>App Version</div>
                        <div className={styles.infoValue}>1.0.0-beta.c</div>
                    </div>
                    <div>
                        <div className={styles.infoLabel}>Build Hash</div>
                        <div className={styles.infoValue}>fc8b29a</div>
                    </div>
                    <div>
                        <div className={styles.infoLabel}>API Base URL</div>
                        <div className={styles.infoValue}>http://localhost:3000/api</div>
                    </div>
                    <div>
                        <div className={styles.infoLabel}>Printer Target</div>
                        <div className={styles.infoValue}>bwc_kitchen_thermal_1</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
