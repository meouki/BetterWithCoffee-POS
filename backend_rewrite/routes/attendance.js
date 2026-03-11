const express = require('express');
const router = express.Router();
const { Attendance, Order, sequelize } = require('../models');
const { Op } = require('sequelize');

// GET /api/attendance/:userId - Fetch attendance for a specific user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const records = await Attendance.findAll({
            where: { user_id: userId },
            order: [['date', 'ASC']]
        });
        res.json(records);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
});

// POST /api/attendance/clock-in - Record clock in for today
router.post('/clock-in', async (req, res) => {
    try {
        const { userId } = req.body;
        const today = new Date().toISOString().split('T')[0];

        // Find or create record for today
        const [record, created] = await Attendance.findOrCreate({
            where: { user_id: userId, date: today },
            defaults: { 
                user_id: userId, 
                date: today,
                clock_in: new Date(),
                type: 'Work'
            }
        });

        if (!created && record.clock_in) {
            return res.status(400).json({ error: 'Already clocked in for today' });
        }

        if (!created) {
            record.clock_in = new Date();
            record.type = 'Work';
            await record.save();
        }

        res.json(record);
    } catch (error) {
        console.error('Clock in error:', error);
        res.status(500).json({ error: 'Failed to clock in' });
    }
});

// POST /api/attendance/clock-out - Record clock out for today
router.post('/clock-out', async (req, res) => {
    try {
        const { userId } = req.body;
        const today = new Date().toISOString().split('T')[0];

        const record = await Attendance.findOne({
            where: { user_id: userId, date: today }
        });

        if (!record || !record.clock_in) {
            return res.status(400).json({ error: 'You must clock in first' });
        }

        record.clock_out = new Date();
        await record.save();

        res.json(record);
    } catch (error) {
        console.error('Clock out error:', error);
        res.status(500).json({ error: 'Failed to clock out' });
    }
});

// POST /api/attendance/day-off - Mark today or a specific date as Day Off
router.post('/day-off', async (req, res) => {
    try {
        const { userId, date } = req.body;
        const targetDate = date || new Date().toISOString().split('T')[0];

        const [record, created] = await Attendance.findOrCreate({
            where: { user_id: userId, date: targetDate },
            defaults: { 
                user_id: userId, 
                date: targetDate,
                type: 'DayOff'
            }
        });

        if (!created) {
            record.type = 'DayOff';
            record.clock_in = null;
            record.clock_out = null;
            await record.save();
        }

        res.json(record);
    } catch (error) {
        console.error('Day off error:', error);
        res.status(500).json({ error: 'Failed to set day off' });
    }
});

// GET /api/attendance/stats/:username - Aggregate revenue and orders for a user
router.get('/stats/:username', async (req, res) => {
    try {
        const { username } = req.params;
        
        // Sum total revenue and count orders for this cashier
        const stats = await Order.findOne({
            where: { cashier: username },
            attributes: [
                [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders']
            ],
            raw: true
        });

        res.json({
            revenue: parseFloat(stats.totalRevenue || 0),
            orders: parseInt(stats.totalOrders || 0)
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
});

module.exports = router;
