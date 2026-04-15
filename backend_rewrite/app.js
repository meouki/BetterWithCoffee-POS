const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const sessionAuth = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'PulsePoint Backend is running!', timestamp: new Date().toISOString() });
});

// API Routes
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const inventoryRoutes = require('./routes/inventory');
const notificationRoutes = require('./routes/notifications');
const userRoutes = require('./routes/users');
const attendanceRoutes = require('./routes/attendance');
const categoryRoutes = require('./routes/categories');
const recipeRoutes = require('./routes/recipes');
const productSizeRoutes = require('./routes/product-sizes');
const systemRoutes = require('./routes/system');

app.use('/api/products', sessionAuth, productRoutes);
app.use('/api/orders', sessionAuth, orderRoutes);
app.use('/api/inventory', sessionAuth, inventoryRoutes);
app.use('/api/notifications', notificationRoutes); // Allow public health/cloud checks
app.use('/api/users', userRoutes); // Auth applied INSIDE users.js for specific routes
app.use('/api/attendance', sessionAuth, attendanceRoutes);
app.use('/api/categories', sessionAuth, categoryRoutes);
app.use('/api/recipes', sessionAuth, recipeRoutes);
app.use('/api/product-sizes', sessionAuth, productSizeRoutes);
app.use('/api/system', sessionAuth, systemRoutes);

// --- Robust Frontend Static Serving ---
const distPath = path.resolve(__dirname, '..', 'frontend', 'dist');
const indexPath = path.join(distPath, 'index.html');

app.use(express.static(distPath));

// Catch-all: let React Router handle client-side routes
app.get('*', (req, res) => {
    if (require('fs').existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send(`
            <div style="font-family: sans-serif; padding: 40px; text-align: center; background: #0f172a; color: white; height: 100vh;">
                <h1 style="color: #ef4444;">PulsePoint Frontend Error</h1>
                <p>Could not find <code>index.html</code> at your installation path.</p>
                <div style="background: #1e293b; padding: 20px; border-radius: 8px; display: inline-block; text-align: left; margin: 20px 0;">
                    <strong>Expected location:</strong><br/>
                    <code>${indexPath}</code>
                </div>
                <p>Please ensure you have run <code>npm run build</code> and that your installer includes the <code>dist</code> folder.</p>
            </div>
        `);
    }
});

module.exports = app;
