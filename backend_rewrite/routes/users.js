const express = require('express');
const router = express.Router();
const { User } = require('../models');

// GET /api/users - Fetch all users
router.get('/', async (req, res) => {
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
        const user = await User.findOne({ where: { username } });

        if (!user || !(await user.validatePassword(password))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        if (!user.is_active) {
            return res.status(403).json({ error: 'Your account is disabled' });
        }

        // Update last login
        user.last_login = new Date();
        await user.save();

        const { password: _, ...safeUser } = user.toJSON();
        res.json(safeUser);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// POST /api/users - Create new user
router.post('/', async (req, res) => {
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
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        if (parseInt(id) === 1 && updates.is_active === false) {
            return res.status(403).json({ error: 'Cannot disable the root Master account' });
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
router.delete('/:id', async (req, res) => {
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
