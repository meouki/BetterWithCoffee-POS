const { User } = require('../models');

/**
 * Middleware to restrict concurrent sessions.
 * Checks the 'x-session-id' and 'x-user-id' headers against the database.
 */
const sessionAuth = async (req, res, next) => {
    const userId = req.headers['x-user-id'];
    const sessionId = req.headers['x-session-id'];

    // For public endpoints or login, skip (already handled by route structure usually)
    // But we'll apply this selectively in server.js
    if (!userId || !sessionId) {
        return res.status(401).json({ error: 'Authentication required. missing ID or Session.' });
    }

    try {
        const user = await User.findByPk(userId);

        if (!user) {
            console.warn(`[sessionAuth] 401: User ${userId} not found for ${req.originalUrl}`);
            return res.status(401).json({ error: 'User not found.' });
        }

        if (user.session_id !== sessionId) {
            console.warn(`[sessionAuth] 401: Session mismatch for ${user.username}. Received ${sessionId}, DB has ${user.session_id}`);
            return res.status(401).json({ 
                error: 'Session invalidated.', 
                message: 'You have been logged in on another device. Please log in again.' 
            });
        }

        // Attach user to request for convenience in routes
        req.user = user;
        next();
    } catch (error) {
        console.error('Session Auth Error:', error);
        res.status(500).json({ error: 'Internal server error during authentication.' });
    }
};

module.exports = sessionAuth;
