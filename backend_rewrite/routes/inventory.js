const express = require('express');
const router = express.Router();
const { Inventory } = require('../models');

// GET /api/inventory - Get all inventory items
router.get('/', async (req, res) => {
    try {
        const items = await Inventory.findAll({ order: [['id', 'ASC']] });
        res.json(items);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

// POST /api/inventory - Create a new inventory item
router.post('/', async (req, res) => {
    try {
        const data = req.body;
        const newItem = await Inventory.create({
            name: data.name,
            category: data.category,
            stock: parseFloat(data.stock || 0),
            unit: data.unit,
            threshold: parseFloat(data.threshold || 0),
            last_updated: new Date()
        });
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error creating inventory item:', error);
        res.status(500).json({ error: 'Failed to create inventory item', message: error.message });
    }
});

// PATCH /api/inventory/:id - Update stock/threshold
router.patch('/:id', async (req, res) => {
    try {
        const item = await Inventory.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: 'Inventory item not found' });

        const updates = req.body;

        if (updates.stock !== undefined) item.stock = parseFloat(updates.stock);
        if (updates.threshold !== undefined) item.threshold = parseFloat(updates.threshold);
        if (updates.name !== undefined) item.name = updates.name;
        if (updates.category !== undefined) item.category = updates.category;
        if (updates.unit !== undefined) item.unit = updates.unit;

        item.last_updated = new Date();
        await item.save();
        res.json(item);
    } catch (error) {
        console.error('Error updating inventory:', error);
        res.status(500).json({ error: 'Failed to update inventory item' });
    }
});

// DELETE /api/inventory/:id - Delete an inventory item
router.delete('/:id', async (req, res) => {
    try {
        const item = await Inventory.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: 'Inventory item not found' });

        await item.destroy();
        res.json({ message: 'Inventory item deleted', id: parseInt(req.params.id) });
    } catch (error) {
        console.error('Error deleting inventory item:', error);
        res.status(500).json({ error: 'Failed to delete inventory item' });
    }
});

module.exports = router;
