/**
 * PulsePoint First-Run Setup Script
 * ----------------------------------
 * Run this ONCE on a new machine before starting the app for the first time.
 * Safe to re-run — all steps are idempotent (won't duplicate or destroy data).
 *
 * Usage: node installer/setup-db.js
 */

const path = require('path');
const fs = require('fs');

// Auto-detect whether we are in dev (installer/setup-db.js) or production ({app}/setup-db.js)
let backendDir = path.join(__dirname, 'backend_rewrite');
if (!fs.existsSync(backendDir)) {
    backendDir = path.join(__dirname, '../backend_rewrite');
}
require(path.join(backendDir, 'node_modules', 'dotenv')).config({ path: path.join(backendDir, '.env') });
const { Sequelize } = require(path.join(backendDir, 'node_modules', 'sequelize'));

const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || 'root';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_NAME = process.env.DB_NAME || 'pos_db';

async function setup() {
    console.log('');
    console.log('╔══════════════════════════════════╗');
    console.log('║   PulsePoint POS — First Setup   ║');
    console.log('╚══════════════════════════════════╝');
    console.log('');

    // ── Step 1: Create the database ─────────────────────────────────────────
    console.log(`[1/3] Using SQLite... File will be created automatically upon sync.`);

    // ── Step 2: Sync all Sequelize models (create tables) ───────────────────
    console.log('[2/3] Creating tables from models...');

    let models;
    try {
        models = require('./backend_rewrite/models');
        await models.sequelize.sync({ force: false, alter: true });
        console.log('      ✅ All tables created.\n');
    } catch (err) {
        console.error(`      ❌ Failed to sync tables: ${err.message}`);
        process.exit(1);
    }

    // ── Step 3: Seed default data ────────────────────────────────────────────
    console.log('[3/3] Seeding default data...');

    const { User, Category } = models;

    // Master user
    const master = await User.findOne({ where: { role: 'Master' } });
    if (!master) {
        await User.create({
            name: 'Master User',
            username: 'master',
            password: 'master123', // hashed by model hook
            role: 'Master',
        });
        console.log('      ✅ Master account created  →  username: master  |  password: master123');
    } else {
        console.log('      ℹ️  Master account already exists, skipping.');
    }

    // Default categories
    const categoryCount = await Category.count();
    if (categoryCount === 0) {
        const defaults = ['Cold Drinks', 'Hot Drinks', 'Blended Drinks', 'Frappe Drinks', 'Pastries'];
        await Category.bulkCreate(defaults.map(name => ({ name })));
        console.log('      ✅ Default categories seeded.');
    } else {
        console.log('      ℹ️  Categories already exist, skipping.');
    }

    await models.sequelize.close();

    console.log('');
    console.log('══════════════════════════════════════');
    console.log('  🎉 Setup complete!');
    console.log('');
    console.log('  Start the app anytime with:');
    console.log('    node backend_rewrite/server.js');
    console.log('  Or double-click: Start PulsePoint.bat');
    console.log('══════════════════════════════════════');
    console.log('');

    process.exit(0);
}

setup().catch(err => {
    console.error('Unexpected error during setup:', err);
    process.exit(1);
});
