const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { User, Category, sequelize } = require('../models');
const sessionAuth = require('../middleware/auth');

// Configure multer to store file in memory before saving it
const upload = multer({ storage: multer.memoryStorage() });

// Apply session auth to all system routes
router.use(sessionAuth);

// POST /api/system/wipe - Factory reset database
router.post('/wipe', async (req, res) => {
    try {
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({ error: 'Master password is required' });
        }

        // Must be verified by Master
        const master = await User.findOne({ where: { role: 'Master' } });
        if (!master) {
             return res.status(500).json({ error: 'System corrupted: No master account found.' });
        }

        const isValid = await master.validatePassword(password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid Master password. Wipe aborted.' });
        }

        console.warn('⚠️ TRIGGERING TOTAL FACTORY RESET ⚠️');
        
        // Drop and recreate all tables
        await sequelize.sync({ force: true });
        
        // Reseed defaults
        console.log('🌱 Reseeding default Master account...');
        await User.create({
            name: 'Master User',
            username: 'master',
            password: 'master123',
            role: 'Master'
        });

        console.log('🌱 Reseeding default categories...');
        const defaults = ['Cold Drinks', 'Hot Drinks', 'Blended Drinks', 'Snacks'];
        await Category.bulkCreate(defaults.map(name => ({ name })));

        console.log('✅ Factory Reset Complete.');
        
        res.json({ message: 'System wiped and reset to factory defaults.' });
    } catch (error) {
        console.error('Error wiping database:', error);
        res.status(500).json({ error: 'Failed to wipe database', detail: error.message });
    }
});

// GET /api/system/export - Export raw sqlite database
router.get('/export', async (req, res) => {
    try {
        const dbPath = path.join(__dirname, '../../pos_data.sqlite');
        
        if (!fs.existsSync(dbPath)) {
            return res.status(404).json({ error: 'Database file not found.' });
        }

        const filename = `pulsepoint-database-${new Date().toISOString().slice(0,10)}.sqlite`;
        
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.download(dbPath, filename, (err) => {
            if (err) {
                console.error("Error sending file:", err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Failed to download database' });
                }
            }
        });
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Failed to export data', detail: error.message });
    }
});

// POST /api/system/import - Import a raw sqlite database
router.post('/import', upload.single('db'), async (req, res) => {
    const { password } = req.body;

    if (!req.file) {
        return res.status(400).json({ error: 'No database file provided.' });
    }

    if (!password) {
        return res.status(400).json({ error: 'Master password is required to import.' });
    }

    try {
        const master = await User.findOne({ where: { role: 'Master' } });
        if (!master) return res.status(500).json({ error: 'No master account found.' });

        const isValid = await master.validatePassword(password);
        if (!isValid) return res.status(401).json({ error: 'Invalid Master password. Import aborted.' });

        const dbPath = path.join(__dirname, '../../pos_data.sqlite');
        
        // Ensure Sequelize connections are closed before replacing the file
        await sequelize.close();

        // Write the uploaded buffer directly to the sqlite file
        fs.writeFileSync(dbPath, req.file.buffer);

        console.log('✅ Database replaced successfully via import.');

        // 2-second delay gives the frontend time to process the 200 OK before shutdown
        setTimeout(() => {
            console.warn('🔄 System is shutting down worker to apply database. Master process will auto-reboot...');
            process.exit(0);
        }, 2000);

        res.json({ 
            message: 'Import successful! The backend is applying the database and auto-restarting. Please wait a few seconds and refresh.',
            action: 'auto-restart'
        });
    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ error: 'Import failed. Database may be corrupted.', detail: error.message });
    }
});

module.exports = router;
