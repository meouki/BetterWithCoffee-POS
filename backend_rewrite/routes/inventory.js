const express = require('express');
const router = express.Router();
const { Inventory, StockLog } = require('../models');

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

// GET /api/inventory/logs - Get all stock logs
router.get('/logs', async (req, res) => {
    try {
        const logs = await StockLog.findAll({
            include: [{ model: Inventory, as: 'inventory' }], // Note: Make sure alias is correct
            order: [['timestamp', 'DESC']],
            limit: 200
        });
        res.json(logs);
    } catch (error) {
        console.error('Error fetching stock logs:', error);
        res.status(500).json({ error: 'Failed to fetch stock logs' });
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
        
        await StockLog.create({
            inventory_id: newItem.id,
            change_qty: newItem.stock,
            reason: 'manual',
            reference_id: 'Initial setup',
            stock_after: newItem.stock,
            timestamp: new Date()
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
        let oldStock = item.stock;

        if (updates.stock !== undefined) item.stock = parseFloat(updates.stock);
        if (updates.threshold !== undefined) item.threshold = parseFloat(updates.threshold);
        if (updates.name !== undefined) item.name = updates.name;
        if (updates.category !== undefined) item.category = updates.category;
        if (updates.unit !== undefined) item.unit = updates.unit;

        item.last_updated = new Date();
        await item.save();
        
        // Log manual stock update if stock changed
        if (updates.stock !== undefined && updates.stock !== oldStock) {
             await StockLog.create({
                inventory_id: item.id,
                change_qty: item.stock - oldStock,
                reason: updates.reason || 'manual',
                reference_id: updates.reference_id || 'Manual Update',
                stock_after: item.stock,
                timestamp: new Date()
            });
        }

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

// POST /api/inventory/check-stock - Validate inventory against a list of items
router.post('/check-stock', async (req, res) => {
    try {
        const { items } = req.body; // Array of { id, quantity, modifiers }
        if (!items || !items.length) return res.json({ shortages: [] });

        const { Recipe, ProductSize, Inventory } = require('../models');
        const shortages = [];
        const requiredMap = {}; // { ingredientId: { name, required, current, unit } }

        for (const item of items) {
            let sizeName = null;
            let modifications = [];
            try {
                modifications = typeof item.modifiers === 'string' ? JSON.parse(item.modifiers) : (item.modifiers || []);
            } catch (e) {}

            if (Array.isArray(modifications)) {
                for (const mod of modifications) {
                    if (mod.name && mod.name.startsWith('Size: ')) {
                        sizeName = mod.name.replace('Size: ', '').trim();
                        break;
                    }
                }
            }

            let sizeId = null;
            if (sizeName) {
                const productSize = await ProductSize.findOne({ where: { product_id: item.id, name: sizeName } });
                if (productSize) sizeId = productSize.id;
            }

            const recipes = await Recipe.findAll({
                where: {
                    product_id: item.id,
                    size_id: [null, sizeId].filter(id => id !== undefined)
                }
            });

            for (const recipe of recipes) {
                const qtyNeeded = recipe.quantity * (item.quantity || 1);
                if (!requiredMap[recipe.inventory_id]) {
                    const ing = await Inventory.findByPk(recipe.inventory_id);
                    requiredMap[recipe.inventory_id] = {
                        name: ing.name,
                        required: 0,
                        current: ing.stock,
                        unit: ing.unit
                    };
                }
                requiredMap[recipe.inventory_id].required += qtyNeeded;
            }
        }

        for (const [id, data] of Object.entries(requiredMap)) {
            if (data.current < data.required) {
                shortages.push({
                    ingredient_id: parseInt(id),
                    name: data.name,
                    needed: data.required,
                    current: data.current,
                    unit: data.unit,
                    shortfall: data.required - data.current
                });
            }
        }

        res.json({ shortages });
    } catch (error) {
        console.error('Error checking stock:', error);
        res.status(500).json({ error: 'Failed to check stock' });
    }
});

module.exports = router;
