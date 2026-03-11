const express = require('express');
const router = express.Router();
const { Notification } = require('../models');

// GET /api/notifications - Fetch all notifications
router.get('/', async (req, res) => {
    try {
        const logs = await Notification.findAll({
            order: [['timestamp', 'DESC']]
        });
        res.json(logs);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// POST /api/notifications - Add a new notification
router.post('/', async (req, res) => {
    try {
        const data = req.body;
        const newLog = await Notification.create({
            type: data.type,
            message: data.message,
            details: data.details || null,
            cashier: data.cashier || null,
            timestamp: data.timestamp || new Date()
        });
        res.status(201).json(newLog);
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ error: 'Failed to create notification', message: error.message });
    }
});

// DELETE /api/notifications - Clear all notifications
router.delete('/', async (req, res) => {
    try {
        await Notification.destroy({ where: {}, truncate: true });
        res.json({ message: 'All notifications cleared' });
    } catch (error) {
        console.error('Error clearing notifications:', error);
        res.status(500).json({ error: 'Failed to clear notifications' });
    }
});

module.exports = router;
