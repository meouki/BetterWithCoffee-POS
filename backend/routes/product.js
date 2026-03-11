const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { product } = require("../models"); 

// Configure multer to store files in memory temporarily for processing
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// GET /api/products
router.get("/", async (req, res) => {
    try {
        const products = await product.findAll();
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

// POST /api/products (Add new item with image)
router.post("/", upload.single('image'), async (req, res) => {
    try {
        const data = req.body;
        
        let imageUrl = null;

        if (req.file) {
            // Process the image with sharp
            const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
            const uploadPath = path.join(__dirname, '../public/uploads', filename);
            
            await sharp(req.file.buffer)
                .resize({ width: 400, withoutEnlargement: true })
                .webp()
                .toFile(uploadPath);

            const baseUrl = req.protocol + '://' + req.get('host');
            imageUrl = `${baseUrl}/uploads/${filename}`;
        }

        const newProduct = await product.create({
            name: data.name,
            category: data.category,
            base_price: parseFloat(data.base_price),
            is_available: data.is_available === 'true' || data.is_available === true,
            modifiers: data.modifiers === 'true' || data.modifiers === true,
            image_url: imageUrl
        });
        
        res.status(201).json(newProduct); 
    } catch (error) {
        console.error(error); 
        res.status(500).json({ 
            error: "Failed to create product",
            message: error.message, 
            details: error.errors ? error.errors.map(e => e.message) : null 
        });
    }
});

// PATCH /api/products/:id
router.patch("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const updates = req.body;

        const prod = await product.findByPk(id);
        if (!prod) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Only allow updating base_price and is_available
        if (updates.base_price !== undefined) {
            prod.base_price = updates.base_price;
        }
        if (updates.is_available !== undefined) {
            prod.is_available = updates.is_available;
        }

        await prod.save();
        res.json(prod);
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Failed to update product" });
    }
});

module.exports = router;