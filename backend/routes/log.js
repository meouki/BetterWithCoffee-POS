const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const LOG_FILE_PATH = path.join(__dirname, '../notification.txt');

// Helper function to ensure file exists
const ensureLogFile = () => {
    if (!fs.existsSync(LOG_FILE_PATH)) {
        fs.writeFileSync(LOG_FILE_PATH, '');
    }
};

// GET /api/logs (Read contents of notification text file)
router.get("/", (req, res) => {
    try {
        ensureLogFile();
        const content = fs.readFileSync(LOG_FILE_PATH, 'utf8');
        
        // Parse lines into JSON objects (ignoring empty lines)
        const logs = content
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => {
                try { 
                    return JSON.parse(line); 
                } catch (e) {
                    return { error: 'Invalid log format', raw: line };
                }
            });

        res.json(logs);
    } catch (error) {
        console.error("Error reading logs:", error);
        res.status(500).json({ error: "Failed to read logs" });
    }
});

// POST /api/logs (Append to notification text file)
router.post("/", (req, res) => {
    try {
        const logEntry = req.body;
        
        // Ensure log entry has required fields or populate defaults
        if (!logEntry.id) logEntry.id = Date.now().toString();
        if (!logEntry.timestamp) logEntry.timestamp = new Date().toISOString();
        
        const logLine = JSON.stringify(logEntry) + '\n';
        
        ensureLogFile();
        fs.appendFileSync(LOG_FILE_PATH, logLine);
        
        res.status(201).json({ message: "Log appended successfully", log: logEntry });
    } catch (error) {
        console.error("Error creating log:", error);
        res.status(500).json({ error: "Failed to create log" });
    }
});

// DELETE /api/logs (Wipe/Clear text file)
router.delete("/", (req, res) => {
    try {
        // Just overwrite with empty string
        fs.writeFileSync(LOG_FILE_PATH, '');
        res.json({ message: "Logs cleared successfully" });
    } catch (error) {
        console.error("Error clearing logs:", error);
        res.status(500).json({ error: "Failed to clear logs" });
    }
});

module.exports = router;
