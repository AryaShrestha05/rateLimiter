const Redis = require('ioredis');
const redis = new Redis();

const express = require('express');
const app = express();

// Trust proxy - required for X-Forwarded-For header to work with nginx
// This makes req.ip return the real client IP instead of nginx's IP
app.set('trust proxy', true);

const LIMIT = 5;               // Max requests allowed
const WINDOW_SIZE_MS = 10000;  // Time window (10 seconds for easy testing)


async function isAllowed(userId) {
    const currentTime = Date.now();
    const currentWindow = Math.floor(currentTime / WINDOW_SIZE_MS);

    // Create key names for this user
    const windowKey = `ratelimit:${userId}:window`;   // e.g. "ratelimit:::1:window"
    const countKey = `ratelimit:${userId}:count`;     // e.g. "ratelimit:::1:count"

    // Get user's stored window from Redis
    const storedWindow = await redis.get(windowKey);

    // User doesn't exist OR is in a new window? Reset them
    if (!storedWindow || parseInt(storedWindow) !== currentWindow) {
        await redis.set(windowKey, currentWindow);   // Store current window
        await redis.set(countKey, 1);                // Reset count to 1
        return true;
    }

    // Same window - check if over limit
    const count = parseInt(await redis.get(countKey));
    if (count >= LIMIT) {
        return false;  // BLOCKED
    }

    // Under limit - increment and allow
    await redis.incr(countKey);
    return true;
}


app.get('/api/hello', async(req, res) => {
    const userId = req.ip || 'unknown';
    console.log('Request from:', userId);

    if (!await isAllowed(userId)) {
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

const PORT = process.env.PORT || 3000;
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
