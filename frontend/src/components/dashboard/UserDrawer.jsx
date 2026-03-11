import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './UserDrawer.module.css';

const ROLES = [
    {
        name: 'Master',
        desc: 'Full control: products, users, reports, settings',
    },
    {
        name: 'Admin',
        desc: 'Read-only overview & reports, no editing',
    },
    {
        name: 'Cashier',
        desc: 'POS terminal access only',
    },
];

const emptyForm = {
    username: '',
    password: '',
    confirmPassword: '',
    role: 'Cashier',
    is_active: true,
};

export default function UserDrawer({ isOpen, user, onClose, onSave }) {
    const isEditing = !!user;
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (user) {
                setForm({
                    username: user.username,
                    password: '',
                    confirmPassword: '',
                    role: user.role,
                    is_active: user.is_active,
                });
            } else {
                setForm(emptyForm);
            }
            setErrors({});
        }
    }, [isOpen, user]);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        // Clear error on change
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const validate = () => {
        const newErrors = {};

        if (!form.username.trim()) {
            newErrors.username = 'Username is required.';
        } else if (/\s/.test(form.username)) {
            newErrors.username = 'Username must not contain spaces.';
        }

        if (!isEditing && !form.password) {
            newErrors.password = 'Password is required.';
        } else if (form.password && form.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters.';
        }

        if (form.password && form.password !== form.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;

        onSave({
            ...(user || {}),
            id: user?.id ?? undefined, // Let backend assign ID if new
            name: form.username, // Name defaults to username
            username: form.username.toLowerCase().trim(),
            password: form.password, // IMPORTANT: Send the password
            role: form.role,
            is_active: form.is_active,
            // created/last_login are handled by database
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className={styles.drawerBackdrop} onClick={onClose} />
            <div className={styles.drawer} role="dialog" aria-modal="true">
                <div className={styles.drawerHeader}>
                    <h2 className={styles.drawerTitle}>{isEditing ? 'Edit User' : 'Add New User'}</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.drawerBody}>
                    {/* Username */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Username</label>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="e.g. jdelacruz"
                            value={form.username}
                            onChange={e => handleChange('username', e.target.value)}
                            autoCapitalize="none"
                            autoCorrect="off"
                        />
                        {errors.username
                            ? <p className={styles.errorMsg}>{errors.username}</p>
                            : <p className={styles.hint}>Display name will default to username.</p>
                        }
                    </div>

                    {/* Password */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>{isEditing ? 'New Password' : 'Password'}</label>
                        <input
                            className={styles.input}
                            type="password"
                            placeholder={isEditing ? 'Leave blank to keep current' : 'At least 6 characters'}
                            value={form.password}
                            onChange={e => handleChange('password', e.target.value)}
                        />
                        {errors.password && <p className={styles.errorMsg}>{errors.password}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Confirm Password</label>
                        <input
                            className={styles.input}
                            type="password"
                            placeholder="Re-enter password"
                            value={form.confirmPassword}
                            onChange={e => handleChange('confirmPassword', e.target.value)}
                        />
                        {errors.confirmPassword && <p className={styles.errorMsg}>{errors.confirmPassword}</p>}
                    </div>

                    {/* Role Selection */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Role</label>
                        <div className={styles.roleTiles}>
                            {ROLES.map(r => (
                                <button
                                    key={r.name}
                                    type="button"
                                    onClick={() => handleChange('role', r.name)}
                                    className={`${styles.roleTile} ${form.role === r.name ? styles.roleTileActive : ''}`}
                                >
                                    <div className={`${styles.roleTileName} ${form.role === r.name ? styles.accentText : ''}`}>
                                        {r.name}
                                    </div>
                                    <div className={styles.roleTileDesc}>{r.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Status */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Account Status</label>
                        <div className={styles.availRow}>
                            <span className={styles.availLabel}>
                                {form.is_active ? 'Active — can log in' : 'Inactive — login disabled'}
                            </span>
                            <button
                                className={`${styles.toggle} ${form.is_active ? styles.toggleOn : styles.toggleOff}`}
                                onClick={() => handleChange('is_active', !form.is_active)}
                                type="button"
                            >
                                <div className={`${styles.toggleNub} ${form.is_active ? styles.nubOn : styles.nubOff}`} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles.drawerFooter}>
                    <button className={styles.cancelBtn} onClick={onClose} type="button">Cancel</button>
                    <button className={styles.saveBtn} onClick={handleSave} type="button">
                        {isEditing ? 'Save Changes' : 'Create User'}
                    </button>
                </div>
            </div>
        </>
    );
}
