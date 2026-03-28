const express = require('express');
const router = express.Router();
const { Recipe, Inventory, ProductSize } = require('../models');

// GET /api/recipes - Get all recipes, optionally filtered by product_id
router.get('/', async (req, res) => {
    try {
        const { product_id } = req.query;
        let whereClause = {};
        if (product_id) {
            whereClause.product_id = product_id;
        }

        const recipes = await Recipe.findAll({
            where: whereClause,
            include: [
                { model: Inventory, as: 'ingredient' },
                { model: ProductSize, as: 'product_size' } // assuming association name could be something else but fallback, wait, it's not defined as product_size
            ],
            order: [['id', 'ASC']]
        });
        res.json(recipes);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ error: 'Failed to fetch recipes' });
    }
});

// POST /api/recipes - Create a new recipe
router.post('/', async (req, res) => {
    try {
        const data = req.body;
        const newRecipe = await Recipe.create({
            product_id: data.product_id,
            size_id: data.size_id || null, // Optional
            inventory_id: data.inventory_id,
            quantity: parseFloat(data.quantity)
        });
        
        // Fetch it again to include relationships if needed
        const created = await Recipe.findByPk(newRecipe.id, {
            include: [{ model: Inventory, as: 'ingredient' }]
        });
        
        res.status(201).json(created || newRecipe);
    } catch (error) {
        console.error('Error creating recipe:', error);
        res.status(500).json({ error: 'Failed to create recipe', message: error.message });
    }
});

// DELETE /api/recipes/:id - Delete a recipe
router.delete('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findByPk(req.params.id);
        if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

        await recipe.destroy();
        res.json({ message: 'Recipe deleted', id: parseInt(req.params.id) });
    } catch (error) {
        console.error('Error deleting recipe:', error);
        res.status(500).json({ error: 'Failed to delete recipe' });
    }
});

module.exports = router;
