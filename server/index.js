const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('public/uploads'));

// Test Route
app.get('/api/health', (req, res) => {
    res.json({ status: 'API is running', timestamp: new Date() });
});

// --- File Logging Service ---
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

app.post('/api/logs', (req, res) => {
    const { type, message, details, cashier } = req.body;
    const date = new Date();
    const fileName = `notifications_${date.toISOString().split('T')[0]}.txt`;
    const filePath = path.join(logsDir, fileName);

    // Create a JSON object string for easy parsing on frontend, but keep it in a txt file
    const logEntry = JSON.stringify({
        id: Date.now().toString(),
        timestamp: date.toISOString(),
        type,
        message,
        details,
        cashier: cashier || 'System'
    }) + '\n';

    fs.appendFile(filePath, logEntry, (err) => {
        if (err) {
            console.error('Failed to write log', err);
            return res.status(500).json({ error: 'Failed to write log' });
        }
        res.status(201).json({ success: true });
    });
});

app.get('/api/logs', (req, res) => {
    // Read all txt files in logs dir, merge them and return as JSON array
    fs.readdir(logsDir, (err, files) => {
        if (err) return res.status(500).json({ error: 'Failed to read logs directory' });

        const txtFiles = files.filter(f => f.endsWith('.txt')).sort().reverse(); // Newest first
        let allLogs = [];

        // Read up to last 7 days of logs to prevent massive payloads
        const filesToRead = txtFiles.slice(0, 7);

        if (filesToRead.length === 0) {
            return res.json([]);
        }

        let readCount = 0;
        filesToRead.forEach(file => {
            fs.readFile(path.join(logsDir, file), 'utf8', (err, data) => {
                if (!err && data) {
                    const lines = data.split('\n').filter(line => line.trim() !== '');
                    const parsedLines = lines.map(line => {
                        try { return JSON.parse(line); } catch (e) { return null; }
                    }).filter(Boolean);
                    allLogs = [...allLogs, ...parsedLines];
                }
                readCount++;
                if (readCount === filesToRead.length) {
                    // Sort descending by timestamp
                    allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    res.json(allLogs);
                }
            });
        });
    });
});

app.delete('/api/logs', (req, res) => {
    // Delete all text files in logs dir
    fs.readdir(logsDir, (err, files) => {
        if (err) return res.status(500).json({ error: 'Failed to read logs directory' });
        const txtFiles = files.filter(f => f.endsWith('.txt'));
        txtFiles.forEach(file => {
            fs.unlink(path.join(logsDir, file), (err) => {
                if (err) console.error("Failed to delete", file);
            });
        });
        res.json({ success: true, message: 'Logs cleared' });
    });
});

// --- TODO for Backend Developer ---
// 1. Setup Database Connection (MongoDB/PostgreSQL)
// 2. Create Product Routes & Controllers
// 3. Create Order Routes & Controllers
// 4. Implement Image Upload with Sharp (see BACKEND_GUIDE.md)

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
