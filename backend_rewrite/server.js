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
    const os = require('os');
    const { sequelize } = require('./models');
    const tunnelManager = require('./utils/tunnelManager');
    const app = require('./app');

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

