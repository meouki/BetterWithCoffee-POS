const express = require('express');
const router = express.Router();
const { inventory_item } = require("../models");

// GET /api/inventory (Get current stock levels)
router.get("/", async (req, res) => {
    try {
        const inventory = await inventory_item.findAll();
        res.json(inventory);
    } catch (error) {
        console.error("Error fetching inventory:", error);
        res.status(500).json({ error: "Failed to fetch inventory" });
    }
});

// PATCH /api/inventory/:id (Adjust stock/threshold)
router.patch("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const updates = req.body;

        const item = await inventory_item.findByPk(id);
        if (!item) {
            return res.status(404).json({ error: "Inventory item not found" });
        }

        // Allow updating stock and threshold
        if (updates.stock !== undefined) {
            item.stock = parseFloat(updates.stock);
        }
        if (updates.threshold !== undefined) {
            item.threshold = parseFloat(updates.threshold);
        }

        // Always update last_updated when adjusting
        item.last_updated = new Date();

        await item.save();
        res.json(item);
    } catch (error) {
        console.error("Error updating inventory:", error);
        res.status(500).json({ error: "Failed to update inventory" });
    }
});

module.exports = router;
