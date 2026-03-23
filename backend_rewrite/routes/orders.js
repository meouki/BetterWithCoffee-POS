const express = require('express');
const router = express.Router();
const { Order, OrderItem, sequelize } = require('../models');
const { Op } = require('sequelize');

// GET /api/orders - Fetch orders with optional date filtering and pagination
router.get('/', async (req, res) => {
    try {
        const { from, to } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;

        let whereClause = {};

        if (from || to) {
            whereClause.timestamp = {};
            if (from) {
                const startDate = from.includes('T') ? new Date(from) : new Date(`${from}T00:00:00`);
                whereClause.timestamp[Op.gte] = startDate;
            }
            if (to) {
                const endDate = to.includes('T') ? new Date(to) : new Date(`${to}T23:59:59`);
                whereClause.timestamp[Op.lte] = endDate;
            }
        }

        const { count, rows } = await Order.findAndCountAll({
            where: whereClause,
            include: [{
                model: OrderItem,
                as: 'items'
            }],
            order: [['timestamp', 'DESC']],
            limit: limit,
            offset: offset
        });

        res.json({
            orders: rows,
            meta: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                hasMore: offset + rows.length < count
            }
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// POST /api/orders - Create a new order with items (transactional)
router.post('/', async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const data = req.body;

        if (!data.id || !data.items || !data.items.length) {
            await t.rollback();
            return res.status(400).json({ error: 'Invalid order data: id and items are required' });
        }

        // Create the order
        const newOrder = await Order.create({
            id: data.id,
            timestamp: data.timestamp || new Date(),
            subtotal: parseFloat(data.subtotal),
            vat: parseFloat(data.vat),
            total: parseFloat(data.total),
            payment_method: data.payment_method,
            order_type: data.order_type,
            cashier: data.cashier,
            amount_tendered: data.amount_tendered ? parseFloat(data.amount_tendered) : null,
            change: data.change ? parseFloat(data.change) : null
        }, { transaction: t });

        // Create order items
        const orderItems = data.items.map(item => ({
            order_id: newOrder.id,
            product_id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: parseFloat(item.price),
            original_price: item.original_price ? parseFloat(item.original_price) : null,
            modifiers: item.modifiers
        }));

        await OrderItem.bulkCreate(orderItems, { transaction: t });

        await t.commit();

        // Fetch the complete order with items to return
        const createdOrder = await Order.findByPk(newOrder.id, {
            include: [{ model: OrderItem, as: 'items' }]
        });

        res.status(201).json(createdOrder);
    } catch (error) {
        await t.rollback();
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order', message: error.message });
    }
});

module.exports = router;
