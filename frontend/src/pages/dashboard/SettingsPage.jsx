import { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Monitor, Check, AlertTriangle, ShieldAlert, Download, Upload, FileJson, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/apiClient';
import styles from './SettingsPage.module.css';

const ACCENT_PRESETS = [
    { name: 'Caramel', color: '#D47C3A', hover: '#B8682E', muted: 'rgba(212, 124, 58, 0.15)' },
    { name: 'Sage', color: '#6A9E6F', hover: '#558259', muted: 'rgba(106, 158, 111, 0.15)' },
    { name: 'Dusty Rose', color: '#C47E85', hover: '#A6666D', muted: 'rgba(196, 126, 133, 0.15)' },
    { name: 'Slate Blue', color: '#4A7FA5', hover: '#396587', muted: 'rgba(74, 127, 165, 0.15)' },
    { name: 'Amber', color: '#F59E0B', hover: '#D97706', muted: 'rgba(245, 158, 11, 0.15)' }
];

export default function SettingsPage() {
    const { isMaster } = useAuth();
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('bwc_theme') || 'system';
    });

    const [accent, setAccent] = useState(() => {
        return localStorage.getItem('bwc_accent') || 'Amber';
    });

    const [activeTheme, setActiveTheme] = useState('light');
    
    // Wipe Database Config
    const [wipeStep, setWipeStep] = useState(0);
    const [masterPassword, setMasterPassword] = useState('');
    const [isWiping, setIsWiping] = useState(false);

    // Import / Export state
    const fileInputRef = useRef(null);
    const [importBundle, setImportBundle] = useState(null);
    const [importFileName, setImportFileName] = useState('');
    const [importMode, setImportMode] = useState('merge'); // 'merge' | 'wipe'
    const [importPassword, setImportPassword] = useState('');
    const [importStep, setImportStep] = useState(0); // 0=idle, 1=password, 2=final_confirm
    const [isImporting, setIsImporting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const [animationDuration, setAnimationDuration] = useState(() => {
        return localStorage.getItem('bwc_page_animation_duration') || '0.5';
    });

    const [animationType, setAnimationType] = useState(() => {
        return localStorage.getItem('bwc_page_animation_type') || 'slide-in-left';
    });

    const [ambientBg, setAmbientBg] = useState(() => {
        return localStorage.getItem('bwc_ambient_bg') !== 'false';
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

    // Handle Ambient Background Changes
    useEffect(() => {
        localStorage.setItem('bwc_ambient_bg', ambientBg);
        window.dispatchEvent(new Event('ambient_bg_changed'));
    }, [ambientBg]);

    const handleWipeDatabase = async () => {
        if (!masterPassword) {
            toast.error("Master password is required.");
            return;
        }

        setIsWiping(true);
        try {
            const res = await apiClient.post('/api/system/wipe', { password: masterPassword });
            
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to wipe database');
            }

            toast.success("System completely wiped. Restarting...");
            
            // Wait 2s then reload to login page
            setTimeout(() => {
                localStorage.clear();
                window.location.href = '/login';
            }, 2000);
            
        } catch (err) {
            console.error(err);
            toast.error(err.message);
            setIsWiping(false);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Append timestamp to bust aggressive browser cache of the old HTML fallback response
            const res = await apiClient.get(`/api/system/export?t=${Date.now()}`);
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                throw new Error(d.error || 'Export failed');
            }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pulsepoint-database-${new Date().toISOString().slice(0,10)}.sqlite`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Backup downloaded successfully!');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsExporting(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.name.endsWith('.sqlite')) {
            toast.error('Invalid backup file. Please select a .sqlite file.');
            e.target.value = '';
            return;
        }

        setImportFileName(file.name);
        setImportBundle(file); // Store the actual File object
        setImportStep(1);
        e.target.value = '';
    };

    const handleImport = async () => {
        if (!importBundle || !importPassword) return;
        setIsImporting(true);
        try {
            const formData = new FormData();
            formData.append('db', importBundle);
            formData.append('password', importPassword);

            // Cannot use apiClient.post here because apiClient sets Content-Type to application/json specifically for non-FormData objects, 
            // but let's double check apiClient... actually apiClient handles FormData correctly by not setting Content-Type!
            const res = await apiClient.post('/api/system/import', formData);
            const data = await res.json().catch(() => ({}));
            
            if (!res.ok) throw new Error(data.error || 'Import failed');
            
            toast.success(data.message || 'Import successful! Rebooting backend automatically...', { duration: 5000 });
            setImportStep(0);
            setImportBundle(null);
            setImportFileName('');
            setImportPassword('');
            
            // Wait 4 seconds for the master process to fork a new worker and boot it up
            setTimeout(() => {
                window.location.href = '/login';
            }, 4000);
            
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsImporting(false);
        }
    };

    const cancelImport = () => {
        setImportStep(0);
        setImportBundle(null);
        setImportFileName('');
        setImportPassword('');
    };

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
                        <div className={styles.settingTitle}>Ambient Background</div>
                        <div className={styles.settingDesc}>
                            Enable dynamic glowing orbs moving in the background.
                        </div>
                    </div>

                    <div className={styles.availRow} style={{ border: 'none', background: 'transparent', padding: 0 }}>
                        <button
                            className={`${styles.toggle} ${ambientBg ? styles.toggleOn : styles.toggleOff}`}
                            onClick={() => setAmbientBg(!ambientBg)}
                            type="button"
                        >
                            <div className={`${styles.toggleNub} ${ambientBg ? styles.nubOn : styles.nubOff}`} />
                        </button>
                    </div>
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

            {/* ── DATA MANAGEMENT ── */}
            <div className={styles.section}>
                <h3 className={styles.sectionHeader}>
                    <FileJson size={20} /> Data Management
                </h3>

                {/* Guide box */}
                <div className={styles.importGuide}>
                    <div className={styles.guideTitle}><Info size={14} /> How Import &amp; Export Works</div>
                    <ul className={styles.guideList}>
                        <li><strong>Export</strong> downloads your <code>pos_data.sqlite</code> database file which contains your latest data.</li>
                        <li><strong>Import</strong> uploads a previously saved <code>.sqlite</code> file and <em>replaces your current database</em>.</li>
                        <li><strong>Warning</strong>: Importing will permanently wipe your current data and overwrite it with the backup. Use carefully!</li>
                        <li>Both export and import operations require your <strong>Master password</strong> to execute correctly.</li>
                    </ul>
                </div>

                {/* Export */}
                <div className={styles.dataRow}>
                    <div className={styles.settingInfo}>
                        <div className={styles.settingTitle}>Export Backup</div>
                        <div className={styles.settingDesc}>Download a copy of the SQLite database right now.</div>
                    </div>
                    <button
                        className={styles.exportBtn}
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        <Download size={16} />
                        {isExporting ? 'Exporting…' : 'Download Backup'}
                    </button>
                </div>

                <div className={styles.divider} />

                {/* Import */}
                <div className={styles.dataRow}>
                    <div className={styles.settingInfo}>
                        <div className={styles.settingTitle}>Import from Backup</div>
                        <div className={styles.settingDesc}>Restore data from a previously exported PulsePoint <code>.sqlite</code> file.</div>
                    </div>
                    <button
                        className={styles.importBtn}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isImporting || importStep === 1}
                    >
                        <Upload size={16} />
                        Select File
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".sqlite"
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                    />
                </div>

                {importStep > 0 && importBundle && (
                    <div className={styles.importConfirmBox}>
                        <div className={styles.importFileInfo}>
                            <FileJson size={16} />
                            <span>{importFileName}</span>
                        </div>

                        {importStep === 1 && (
                            <>
                                <p className={styles.wipeWarningSmall}>
                                    <ShieldAlert size={14} /> This action requires your <strong>Master Password</strong> to proceed.
                                </p>
                                <div className={styles.importPasswordRow}>
                                    <input
                                        type="password"
                                        placeholder="Type Master Password"
                                        className={styles.dangerInput}
                                        value={importPassword}
                                        onChange={e => setImportPassword(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className={styles.wipeActions}>
                                    <button className={styles.cancelBtn} onClick={cancelImport}>Cancel</button>
                                    <button 
                                        className={styles.saveBtn} 
                                        disabled={!importPassword}
                                        onClick={() => setImportStep(2)}
                                    >
                                        Next Component
                                    </button>
                                </div>
                            </>
                        )}

                        {importStep === 2 && (
                            <>
                                <p className={styles.wipeWarningSmall} style={{ color: '#EF4444', background: 'rgba(239, 68, 68, 0.1)' }}>
                                    <AlertTriangle size={16} /> 
                                    <strong>FINAL CONFIRMATION:</strong> Every record currently in the system will be <strong>erased</strong> and replaced by this file. This cannot be undone!
                                </p>
                                <div className={styles.wipeActions}>
                                    <button className={styles.cancelBtn} onClick={() => setImportStep(1)} disabled={isImporting}>Back</button>
                                    <button
                                        className={styles.dangerBtnSolid}
                                        onClick={handleImport}
                                        disabled={isImporting}
                                    >
                                        {isImporting ? 'Restoring...' : 'YES, WIPE & RESTORE DB'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {isMaster && (
                <div className={`${styles.section} ${styles.dangerSection}`}>
                    <h3 className={`${styles.sectionHeader} ${styles.dangerText}`}>
                    <ShieldAlert size={20} /> Danger Zone
                </h3>

                <div className={styles.settingRow}>
                    <div className={styles.settingInfo}>
                        <div className={styles.settingTitle}>Total Factory Reset</div>
                        <div className={styles.settingDesc}>
                            Permanently wipe all products, categories, orders, logic, and configurations.
                        </div>
                    </div>

                    {wipeStep === 0 && (
                        <button 
                            className={styles.dangerBtn}
                            onClick={() => setWipeStep(1)}
                        >
                            Factory Reset System
                        </button>
                    )}

                    {wipeStep === 1 && (
                        <div className={styles.wipeConfirmStep}>
                            <p className={styles.warningText}>
                                <AlertTriangle size={16} /> 
                                <strong>WARNING:</strong> This will permanently delete all records, recipes, orders, and configurations. Are you absolutely sure?
                            </p>
                            <div className={styles.wipeActions}>
                                <button className={styles.cancelBtn} onClick={() => setWipeStep(0)}>Cancel</button>
                                <button className={styles.dangerBtn} onClick={() => setWipeStep(2)}>Yes, proceed</button>
                            </div>
                        </div>
                    )}

                    {wipeStep === 2 && (
                        <div className={styles.wipeConfirmStep}>
                            <p className={styles.warningText}>
                                <strong>FINAL WARNING:</strong> Please backup your <code>pos_data.sqlite</code> file located in the backend folder first. <br/><br/>
                                Enter Master Password to execute wipe:
                            </p>
                            <input 
                                type="password" 
                                className={styles.dangerInput}
                                placeholder="Master Password"
                                value={masterPassword}
                                onChange={e => setMasterPassword(e.target.value)}
                                disabled={isWiping}
                            />
                            <div className={styles.wipeActions}>
                                <button className={styles.cancelBtn} onClick={() => { setWipeStep(0); setMasterPassword(''); }} disabled={isWiping}>Abort</button>
                                <button className={styles.dangerBtnSolid} onClick={handleWipeDatabase} disabled={isWiping || !masterPassword}>
                                    {isWiping ? 'Wiping System...' : 'CONFIRM WIPE'}
                                </button>
                            </div>
                        </div>
                    )}
                    </div>
                </div>
            )}

            <div className={styles.section}>
                <h3 className={styles.sectionHeader}>System Information</h3>
                <div className={styles.infoGrid}>
                    <div className={styles.infoBox}>
                        <div className={styles.infoLabel}>App Version</div>
                        <div className={styles.infoValue}>1.0.0 (Production)</div>
                    </div>
                    <div className={styles.infoBox}>
                        <div className={styles.infoLabel}>Environment</div>
                        <div className={styles.infoValue}>{import.meta.env.MODE === 'production' ? 'Release Build' : 'Development'}</div>
                    </div>
                    <div className={styles.infoBox}>
                        <div className={styles.infoLabel}>Database Dialect</div>
                        <div className={styles.infoValue}>SQLite (Local)</div>
                    </div>
                    <div className={styles.infoBox}>
                        <div className={styles.infoLabel}>API URL</div>
                        <div className={styles.infoValue}>{import.meta.env.VITE_API_URL || window.location.origin}</div>
                    </div>
                    <div className={styles.infoBox} style={{ gridColumn: 'span 2' }}>
                        <div className={styles.infoLabel}>Browser & Client</div>
                        <div className={styles.infoValue} style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                            {navigator.userAgent}
                        </div>
                    </div>
                    <div className={styles.infoBox}>
                        <div className={styles.infoLabel}>Network Status</div>
                        <div className={`${styles.statusBadge} ${navigator.onLine ? styles.statusOnline : styles.statusOffline}`}>
                            {navigator.onLine ? 'Connected' : 'Offline Mode'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
