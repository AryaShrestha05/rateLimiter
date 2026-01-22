const express = require('express');
const app = express();

const LIMIT = 5;
const WINDOW_SIZE_MS = 10000;
const users = {};

function isAllowed(userId) {
    console.log('isAllowed called with:', userId);
    const currentTime = Date.now();
    const currentWindow = Math.floor(currentTime / WINDOW_SIZE_MS);

    if (!users[userId]) {
        users[userId] = { window: currentWindow, count: 1 };
        return true;
    }

    if (users[userId].window !== currentWindow) {
        users[userId].window = currentWindow;
        users[userId].count = 1;
        return true;
    }

    if (users[userId].count >= LIMIT) {
        return false;
    }

    users[userId].count++;
    return true;
}

app.get('/api/hello', (req, res) => {
    try {
        const userId = req.ip || 'unknown';
        console.log('Request from:', userId);

        if (!isAllowed(userId)) {
            return res.status(429).json({ error: 'Too many requests' });
        }

        res.json({ message: 'Success!' });
    } catch (err) {
        console.error('ERROR:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log('Server ready on http://localhost:3000'));
