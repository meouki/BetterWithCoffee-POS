const cluster = require('cluster');

if (cluster.isPrimary) {
    console.log(`\n[Process Manager] Primary Manager started (PID: ${process.pid})`);
    console.log(`[Process Manager] The system will automatically restart on crash or database import.`);
    
    cluster.fork();

    cluster.on('exit', (worker, code, signal) => {
        console.log(`\n[Process Manager] Worker (PID: ${worker.process.pid}) has shut down.`);
        console.log(`[Process Manager] Rebooting a fresh instance in 1 second...\n`);
        
        // Wait 1 second before booting back up to avoid spamming crashes
        setTimeout(() => {
            cluster.fork();
        }, 1000);
    });

} else {
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const os = require('os');
const { sequelize } = require('./models');
const tunnelManager = require('./utils/tunnelManager');

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
const sessionAuth = require('./middleware/auth');

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

console.log(`📂 Booting: Resolving frontend path at ${distPath}`);

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

// Start Server
const PORT = process.env.PORT || 5000;

async function seedDatabase() {
    const { User } = require('./models');
    const master = await User.findOne({ where: { role: 'Master' } });
    if (!master) {
        console.log('🌱 Seeding default Master account...');
        await User.create({
            name: 'Master User',
            username: 'master',
            password: 'master123', // Will be hashed by the model hook
            role: 'Master'
        });
        console.log('✅ Default Master account created.');
    }

    const { Category } = require('./models');
    const categoryCount = await Category.count();
    if (categoryCount === 0) {
        console.log('🌱 Seeding default categories...');
        const defaults = ['Cold Drinks', 'Hot Drinks', 'Blended Drinks', 'Snacks'];
        await Category.bulkCreate(defaults.map(name => ({ name })));
        console.log('✅ Default categories seeded.');
    }
}

sequelize.sync()
    .then(async () => {
        console.log('✅ Database synced successfully.');
        await seedDatabase();

        // Start Cloudflare Tunnel if enabled in .env
        const enableCloud = (process.env.ENABLE_CLOUD || '').trim().toLowerCase() === 'true';
        if (enableCloud) {
            tunnelManager.start(PORT);
        }

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`\n🚀 Server is running!`);
            console.log(`\n================================`);
            console.log(`  ACCESS THE POS FROM ANY DEVICE  `);
            console.log(`================================`);
            const nets = os.networkInterfaces();
            for (const name of Object.keys(nets)) {
                for (const net of nets[name]) {
                    if (net.family === 'IPv4' && !net.internal) {
                        console.log(`  👉 http://${net.address}:${PORT}`);
                    }
                }
            }
            console.log(`================================\n`);
        });
    })
    .catch((err) => {
        console.error('❌ Failed to sync database:', err.message);
    });
}
