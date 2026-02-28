import { useState } from 'react';
import { UserPlus, Edit2, Trash2 } from 'lucide-react';
import UserDrawer from '../../components/dashboard/UserDrawer';
import styles from './UserManagementPage.module.css';

const mockUsers = [
    { id: 1, name: 'master', username: 'master', role: 'Master', is_active: true, created: '2026-01-01', last_login: 'Today 08:30 AM' },
    { id: 2, name: 'admin', username: 'admin', role: 'Admin', is_active: true, created: '2026-01-10', last_login: 'Today 09:15 AM' },
    { id: 3, name: 'arivera', username: 'arivera', role: 'Cashier', is_active: true, created: '2026-02-15', last_login: 'Today 07:15 AM' },
    { id: 4, name: 'schen', username: 'schen', role: 'Cashier', is_active: true, created: '2026-03-20', last_login: 'Yesterday' },
    { id: 5, name: 'jlee', username: 'jlee', role: 'Cashier', is_active: false, created: '2026-05-05', last_login: '2 mos ago' },
];

const ROLE_STYLES = {
    Master: styles.roleMaster,
    Admin: styles.roleAdmin,
    Cashier: styles.roleCashier,
};

export default function UserManagementPage() {
    const [users, setUsers] = useState(mockUsers);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const PROTECTED_ID = 1; // Master account — cannot be deleted/disabled

    const handleOpenAdd = () => {
        setEditingUser(null);
        setIsDrawerOpen(true);
    };

    const handleOpenEdit = (user) => {
        setEditingUser(user);
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setEditingUser(null);
    };

    const handleSave = (savedUser) => {
        if (editingUser) {
            setUsers(prev => prev.map(u => u.id === savedUser.id ? savedUser : u));
        } else {
            setUsers(prev => [...prev, savedUser]);
        }
    };

    const toggleStatus = (id) => {
        if (id === PROTECTED_ID) return;
        setUsers(prev => prev.map(u =>
            u.id === id ? { ...u, is_active: !u.is_active } : u
        ));
    };

    const deleteUser = (id) => {
        if (id === PROTECTED_ID) {
            alert('Cannot delete the primary master account.');
            return;
        }
        if (window.confirm('Delete this user? This action cannot be undone.')) {
            setUsers(prev => prev.filter(u => u.id !== id));
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>User Management</h2>
                <button className={styles.actionBtn} onClick={handleOpenAdd}>
                    <UserPlus size={18} /> Add User
                </button>
            </div>

            <div className={styles.tablePanel}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>User</th>
                                <th className={styles.th}>Role</th>
                                <th className={styles.th}>Status</th>
                                <th className={styles.th}>Created</th>
                                <th className={styles.th}>Last Login</th>
                                <th className={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className={styles.tableRow}>
                                    <td className={styles.td}>
                                        <div className={styles.userCell}>
                                            <div className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
                                            <div>
                                                <div className={styles.userName}>{user.name}</div>
                                                <div className={styles.userUsername}>@{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        <span className={`${styles.roleBadge} ${ROLE_STYLES[user.role] || styles.roleCashier}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className={styles.td}>
                                        <button
                                            className={`${styles.statusToggle} ${user.is_active ? styles.statusActive : styles.statusInactive}`}
                                            onClick={() => toggleStatus(user.id)}
                                            disabled={user.id === PROTECTED_ID}
                                            title={user.id === PROTECTED_ID ? 'Cannot disable master account' : 'Toggle Status'}
                                        >
                                            <div className={`${styles.statusNub} ${user.is_active ? styles.statusNubActive : styles.statusNubInactive}`} />
                                        </button>
                                    </td>
                                    <td className={`${styles.td} ${styles.dateData}`}>{user.created}</td>
                                    <td className={`${styles.td} ${styles.dateData}`} style={{ color: 'var(--color-muted)' }}>
                                        {user.last_login}
                                    </td>
                                    <td className={styles.td}>
                                        <div className={styles.actionCell}>
                                            <button
                                                className={`${styles.iconBtn} ${styles.edit}`}
                                                title="Edit user"
                                                onClick={() => handleOpenEdit(user)}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className={`${styles.iconBtn} ${styles.delete}`}
                                                title="Delete user"
                                                onClick={() => deleteUser(user.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <UserDrawer
                isOpen={isDrawerOpen}
                user={editingUser}
                onClose={handleCloseDrawer}
                onSave={handleSave}
            />
        </div>
    );
}
