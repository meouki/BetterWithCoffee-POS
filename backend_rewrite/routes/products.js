const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { Product } = require('../models');

// Configure multer to store files in memory for sharp processing
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// GET /api/products - Fetch all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.findAll({ 
            where: { is_archived: false },
            order: [['id', 'ASC']] 
        });
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// GET /api/products/:id - Fetch single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// POST /api/products - Create a new product (with optional image upload)
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const data = req.body;
        let imageUrl = null;

        if (req.file) {
            const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
            const uploadPath = path.join(uploadsDir, filename);

            await sharp(req.file.buffer)
                .resize({ width: 400, withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(uploadPath);

            // Store as relative path so it survives IP changes
            imageUrl = `/uploads/${filename}`;
        }

        const newProduct = await Product.create({
            name: data.name,
            category_name: data.category_name,
            base_price: parseFloat(data.base_price),
            is_available: data.is_available === 'true' || data.is_available === true,
            modifiers: data.modifiers === 'true' || data.modifiers === true,
            has_sugar_selector: data.has_sugar_selector === 'true' || data.has_sugar_selector === true,
            has_sizes: data.has_sizes === 'true' || data.has_sizes === true,
            addons: data.addons, // Handled by model setter
            image_url: imageUrl
        });

        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product', message: error.message });
    }
});

// PATCH /api/products/:id - Update product fields
router.patch('/:id', upload.single('image'), async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        const updates = req.body;
        
        // Handle image upload if provided
        if (req.file) {
            const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
            const uploadPath = path.join(uploadsDir, filename);

            await sharp(req.file.buffer)
                .resize({ width: 400, withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(uploadPath);

            // Store as relative path so it survives IP changes
            updates.image_url = `/uploads/${filename}`;
        }

        // Update allowed fields
        if (updates.name !== undefined) product.name = updates.name;
        if (updates.category_name !== undefined) product.category_name = updates.category_name;
        if (updates.base_price !== undefined) product.base_price = parseFloat(updates.base_price);
        if (updates.is_available !== undefined) {
            product.is_available = updates.is_available === 'true' || updates.is_available === true;
        }
        if (updates.modifiers !== undefined) {
            product.modifiers = updates.modifiers === 'true' || updates.modifiers === true;
        }
        if (updates.has_sugar_selector !== undefined) {
            product.has_sugar_selector = updates.has_sugar_selector === 'true' || updates.has_sugar_selector === true;
        }
        if (updates.has_sizes !== undefined) {
            product.has_sizes = updates.has_sizes === 'true' || updates.has_sizes === true;
        }
        if (updates.addons !== undefined) {
            product.addons = updates.addons;
        }
        if (updates.image_url !== undefined) product.image_url = updates.image_url;

        await product.save();
        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// DELETE /api/products/:id - Delete a product
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        // Check if the product has ever been sold
        const { OrderItem } = require('../models');
        const salesCount = await OrderItem.count({ where: { product_id: product.id } });

        if (salesCount > 0) {
            // Smart Delete: Product exists in history, archive it instead
            product.is_archived = true;
            await product.save();
            res.json({ message: 'Product archived successfully due to existing sales history', id: parseInt(req.params.id), action: 'archived' });
        } else {
            // Standard Delete: Never sold, safe to completely remove
            await product.destroy();
            res.json({ message: 'Product permanently deleted', id: parseInt(req.params.id), action: 'deleted' });
        }
    } catch (error) {
        console.error('Error archiving/deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product', detail: error.message });
    }
});

module.exports = router;
