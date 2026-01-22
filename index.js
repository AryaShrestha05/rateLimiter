const express = require('express');
const app = express();

// ===========================================
// CONFIGURATION
// ===========================================
const LIMIT = 5;               // Max requests allowed
const WINDOW_SIZE_MS = 10000;  // Time window (10 seconds for easy testing)

// ===========================================
// STORAGE
// ===========================================
const users = {};

// ===========================================
// YOUR TASK: Implement this function
// ===========================================
//
// Goal: Return TRUE if request allowed, FALSE if blocked
//
// Available variables:
//   - LIMIT: max requests allowed (5)
//   - WINDOW_SIZE_MS: time window in milliseconds (10000 = 10 sec)
//   - users: object to store user data, e.g. users["192.168.1.1"] = { ... }
//
// Useful code:
//   - Date.now() gives current time in milliseconds
//   - Math.floor(x / y) divides and rounds down
//
function isAllowed(userId) {
    const currentTime = Date.now();
    const currentWindow = Math.floor(currentTime / WINDOW_SIZE_MS);

    // User doesn't exist? Create them
    if (!users[userId]) {
        users[userId] = { window: currentWindow, count: 1 };
        return true;
    }

    // User exists - check if they're in a new window
    if (users[userId].window !== currentWindow) {
        // New window - reset their count
        users[userId].window = currentWindow;
        users[userId].count = 1;
        return true;
    }

    // Same window - check if over limit
    if (users[userId].count >= LIMIT) {
        return false;  // BLOCKED
    }

    // Under limit - allow and increment
    users[userId].count++;
    return true;
}

// ===========================================
// ROUTES (don't modify yet)
// ===========================================

app.get('/api/hello', (req, res) => {
    const userId = req.ip || 'unknown';
    console.log('Request from:', userId);

    if (!isAllowed(userId)) {
        return res.status(429).json({
            error: 'Too many requests',
            message: 'Slow down! Try again in a few seconds.'
        });
    }

    res.json({ message: 'Success! Request allowed.' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// ===========================================
// START SERVER
// ===========================================
const PORT = 3000;
app.listen(PORT, () => {
    console.log('');
    console.log('='.repeat(50));
    console.log('  RATE LIMITER SERVER');
    console.log('='.repeat(50));
    console.log(`  URL: http://localhost:${PORT}`);
    console.log(`  Limit: ${LIMIT} requests per ${WINDOW_SIZE_MS / 1000} seconds`);
    console.log('');
    console.log('  Test it:');
    console.log(`    curl http://localhost:${PORT}/api/hello`);
    console.log('='.repeat(50));
    console.log('');
});
