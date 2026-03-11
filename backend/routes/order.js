const express = require('express');
const router = express.Router();
const { order, order_item, sequelize } = require("../models");
const { Op } = require('sequelize');

// GET /api/orders (Fetch history with ?from=YYYY-MM-DD&to=YYYY-MM-DD)
router.get("/", async (req, res) => {
    try {
        const { from, to } = req.query;
        let whereClause = {};

        if (from || to) {
            whereClause.timestamp = {};
            if (from) {
                // Ensure starting from beginning of the day
                whereClause.timestamp[Op.gte] = new Date(`${from}T00:00:00Z`);
            }
            if (to) {
                // Ensure up to end of the day
                whereClause.timestamp[Op.lte] = new Date(`${to}T23:59:59Z`);
            }
        }

        const orders = await order.findAll({
            where: whereClause,
            include: [{
                model: order_item,
                as: 'items'
            }],
            order: [['timestamp', 'DESC']]
        });

        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

// POST /api/orders (Submit transaction)
router.post("/", async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
        const data = req.body;
        
        // Ensure required fields are present
        if (!data.id || !data.items || !data.items.length) {
            return res.status(400).json({ error: "Invalid order data" });
        }

        // Create the order
        const newOrder = await order.create({
            id: data.id,
            timestamp: data.timestamp || new Date(),
            subtotal: parseFloat(data.subtotal),
            vat: parseFloat(data.vat),
            total: parseFloat(data.total),
            payment_method: data.payment_method,
            order_type: data.order_type,
            cashier: data.cashier
        }, { transaction: t });

        // Create the order items
        const orderItemsPayload = data.items.map(item => ({
            order_id: newOrder.id,
            product_id: item.id, // Frontend uses id for product_id
            name: item.name,
            quantity: item.quantity,
            snapshot_price: parseFloat(item.snapshot_price)
        }));

        await order_item.bulkCreate(orderItemsPayload, { transaction: t });

        await t.commit();

        const createdOrder = await order.findByPk(newOrder.id, {
            include: [{ model: order_item, as: 'items' }]
        });

        res.status(201).json(createdOrder);
    } catch (error) {
        await t.rollback();
        console.error("Error creating order:", error);
        res.status(500).json({ 
            error: "Failed to create order",
            message: error.message 
        });
    }
});

module.exports = router;
