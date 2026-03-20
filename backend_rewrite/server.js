require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');

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

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/categories', categoryRoutes);

// Serve built React frontend (production)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all: let React Router handle client-side routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
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
        const defaults = ['Cold Drinks', 'Hot Drinks', 'Blended Drinks', 'Frappe Drinks', 'Pastries'];
        await Category.bulkCreate(defaults.map(name => ({ name })));
        console.log('✅ Default categories seeded.');
    }
}

sequelize.sync({ alter: true })
    .then(async () => {
        console.log('✅ Database synced successfully.');
        await seedDatabase();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT} (Network accessible)`);
        });
    })
    .catch((err) => {
        console.error('❌ Failed to sync database:', err.message);
    });
