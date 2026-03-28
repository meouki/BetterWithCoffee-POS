const express = require('express');
const router = express.Router();
const { ProductSize } = require('../models');

// GET /api/product-sizes - Get all sizes, optionally filtered by product_id
router.get('/', async (req, res) => {
    try {
        const { product_id } = req.query;
        let whereClause = {};
        if (product_id) {
            whereClause.product_id = product_id;
        }

        const sizes = await ProductSize.findAll({
            where: whereClause,
            order: [['sort_order', 'ASC'], ['id', 'ASC']]
        });
        res.json(sizes);
    } catch (error) {
        console.error('Error fetching product sizes:', error);
        res.status(500).json({ error: 'Failed to fetch product sizes' });
    }
});

// POST /api/product-sizes - Create a new product size
router.post('/', async (req, res) => {
    try {
        const data = req.body;
        const newSize = await ProductSize.create({
            product_id: data.product_id,
            name: data.name,
            price_adjustment: parseFloat(data.price_adjustment || 0),
            sort_order: parseInt(data.sort_order || 0)
        });
        res.status(201).json(newSize);
    } catch (error) {
        console.error('Error creating product size:', error);
        res.status(500).json({ error: 'Failed to create product size', message: error.message });
    }
});

// PATCH /api/product-sizes/:id - Update a product size
router.patch('/:id', async (req, res) => {
    try {
        const size = await ProductSize.findByPk(req.params.id);
        if (!size) return res.status(404).json({ error: 'Product size not found' });

        const updates = req.body;
        if (updates.name !== undefined) size.name = updates.name;
        if (updates.price_adjustment !== undefined) size.price_adjustment = parseFloat(updates.price_adjustment);
        if (updates.sort_order !== undefined) size.sort_order = parseInt(updates.sort_order);

        await size.save();
        res.json(size);
    } catch (error) {
        console.error('Error updating product size:', error);
        res.status(500).json({ error: 'Failed to update product size' });
    }
});

// DELETE /api/product-sizes/:id - Delete a product size
router.delete('/:id', async (req, res) => {
    try {
        const size = await ProductSize.findByPk(req.params.id);
        if (!size) return res.status(404).json({ error: 'Product size not found' });

        await size.destroy();
        res.json({ message: 'Product size deleted', id: parseInt(req.params.id) });
    } catch (error) {
        console.error('Error deleting product size:', error);
        res.status(500).json({ error: 'Failed to delete product size' });
    }
});

module.exports = router;
