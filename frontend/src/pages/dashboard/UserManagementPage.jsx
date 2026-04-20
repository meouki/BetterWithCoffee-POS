import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Edit2, Trash2, Calendar } from 'lucide-react';
import UserDrawer from '../../components/dashboard/UserDrawer';
import UserDTRModal from '../../components/dashboard/UserDTRModal';
import { usersApi } from '../../api/users';
import { useNotificationContext } from '../../context/NotificationContext';
import toast from 'react-hot-toast';
import styles from './UserManagementPage.module.css';

// mockUsers removed, now using API

const ROLE_STYLES = {
    Master: styles.roleMaster,
    Admin: styles.roleAdmin,
    Cashier: styles.roleCashier,
};

export default function UserManagementPage() {
    const { addNotification } = useNotificationContext();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isDTRModalOpen, setIsDTRModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [viewingUser, setViewingUser] = useState(null);

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await usersApi.getAll();
            setUsers(data);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

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

    const handleOpenDTR = (user) => {
        setViewingUser(user);
        setIsDTRModalOpen(true);
    };

    const handleCloseDTR = () => {
        setIsDTRModalOpen(false);
        setViewingUser(null);
    };

    const handleSave = async (userData) => {
        try {
            if (editingUser) {
                const updated = await usersApi.update(editingUser.id, userData);
                setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
                addNotification('ALERT', 'Staff Updated', `User @${updated.username} (${updated.role}) was modified.`);
                toast.success('User updated');
            } else {
                const newUser = await usersApi.create(userData);
                setUsers(prev => [newUser, ...prev]);
                addNotification('ALERT', 'Staff Created', `New user @${newUser.username} added as ${newUser.role}.`);
                toast.success('User created');
            }
            handleCloseDrawer();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const toggleStatus = async (user) => {
        if (user.id === PROTECTED_ID) return;
        try {
            const updated = await usersApi.update(user.id, { is_active: !user.is_active });
            setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
            
            const statusLabel = updated.is_active ? 'Enabled' : 'Disabled';
            addNotification('ALERT', `Staff ${statusLabel}`, `Account @${updated.username} was ${statusLabel.toLowerCase()}.`);
            
            toast.success(`User ${updated.is_active ? 'enabled' : 'disabled'}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const deleteUser = async (id) => {
        if (id === PROTECTED_ID) {
            toast.error('Cannot delete the primary master account.');
            return;
        }
        if (window.confirm('Delete this user? This action cannot be undone.')) {
            try {
                const targetUser = users.find(u => u.id === id);
                await usersApi.delete(id);
                setUsers(prev => prev.filter(u => u.id !== id));
                
                if (targetUser) {
                    addNotification('ALERT', 'Staff Deleted', `User @${targetUser.username} was permanently removed.`);
                }
                
                toast.success('User deleted');
            } catch (error) {
                toast.error('Failed to delete user');
            }
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
                                <th className={styles.th}>Actions</th>
                                <th className={styles.th}>User</th>
                                <th className={styles.th}>Role</th>
                                <th className={styles.th}>Status</th>
                                <th className={styles.th}>Created</th>
                                <th className={styles.th}>Last Login</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className={styles.tableRow}>
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
                                    <td className={styles.td}>
                                        <div className={styles.userCell} onClick={() => handleOpenDTR(user)} style={{ cursor: 'pointer' }}>
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
                                            onClick={() => toggleStatus(user)}
                                            disabled={user.id === PROTECTED_ID}
                                            title={user.id === PROTECTED_ID ? 'Cannot disable master account' : 'Toggle Status'}
                                        >
                                            <div className={`${styles.statusNub} ${user.is_active ? styles.statusNubActive : styles.statusNubInactive}`} />
                                        </button>
                                    </td>
                                    <td className={`${styles.td} ${styles.dateData}`}>
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                                    </td>
                                    <td className={`${styles.td} ${styles.dateData}`} style={{ color: 'var(--color-muted)' }}>
                                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
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

            <UserDTRModal
                isOpen={isDTRModalOpen}
                user={viewingUser}
                onClose={handleCloseDTR}
            />
        </div>
    );
}
