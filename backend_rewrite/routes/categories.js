const express = require('express');
const router = express.Router();
const { Category, Product } = require('../models');

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.findAll({
            where: { is_active: true },
            order: [['name', 'ASC']]
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create category
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });
        
        const category = await Category.create({ name });
        res.status(201).json(category);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'A category with this name already exists.' });
        }
        res.status(400).json({ error: error.message });
    }
});

// Update category (rename)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, is_active } = req.body;
        
        const category = await Category.findByPk(id);
        if (!category) return res.status(404).json({ error: 'Category not found' });
        
        // If name changes, we might need to update products. 
        // Using relationship via name makes this a bit tricky if we don't use IDs.
        // For now, let's keep it simple.
        
        await category.update({ name, is_active });
        res.json(category);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete category
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);
        if (!category) return res.status(404).json({ error: 'Category not found' });
        
        // Check if category has products
        const productCount = await Product.count({ where: { category_name: category.name } });
        if (productCount > 0) {
            return res.status(400).json({ error: 'Cannot delete category that has products. Move products first.' });
        }
        
        await category.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
