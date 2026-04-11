import { Router } from 'express';
import Redis from 'ioredis';
import pool from '../src/db.js';

const router = Router();

const redis = new Redis({
  host: 'localhost',
  port: 6379,
});

// isAllowed now accepts the key's own config instead of hardcoded constants
async function isAllowed(keyId, capacity, refillRate, refillIntervalMs) {
    const now = Date.now();

    // Redis keys are namespaced by the api key's id (a UUID from the DB)
    const tokensKey = `ratelimit:${keyId}:tokens`;
    const lastRefillKey = `ratelimit:${keyId}:lastRefill`;

    // Get current state from Redis
    const [tokensStr, lastRefillStr] = await Promise.all([
        redis.get(tokensKey),
        redis.get(lastRefillKey)
    ]);

    // If this key has never been used, start it at full capacity
    let tokens = tokensStr ? parseFloat(tokensStr) : capacity;
    let lastRefill = lastRefillStr ? parseInt(lastRefillStr) : now;

    // Calculate tokens to add based on time elapsed
    const elapsed = now - lastRefill;
    const tokensToAdd = Math.floor(elapsed / refillIntervalMs) * refillRate;

    if (tokensToAdd > 0) {
        // Cap at the key's own capacity, not a hardcoded number
        tokens = Math.min(capacity, tokens + tokensToAdd);
        lastRefill = now;
    }

    // Try to consume a token
    if (tokens < 1) {
        await Promise.all([
            redis.set(tokensKey, tokens),
            redis.set(lastRefillKey, lastRefill)
        ]);
        return { allowed: false, tokens: tokens };
    }

    tokens -= 1;

    await Promise.all([
        redis.set(tokensKey, tokens),
        redis.set(lastRefillKey, lastRefill)
    ]);

    return { allowed: true, tokens: tokens };
}

router.get('/api/hello', async (req, res) => {
  // Read the api key the caller sent in the request header
  const apiKey = req.headers['x-api-key'];

  // If they didn't send one at all, reject immediately
  if (!apiKey) {
    return res.status(401).json({ error: 'Missing API key. Send x-api-key header.' });
  }

  // Look up the key in the database to make sure it exists and is active
  const { rows } = await pool.query(
    'SELECT * FROM api_keys WHERE key = $1 AND is_active = true',
    [apiKey]
  );

  // rows is an array of matching DB rows. If empty, the key is wrong or disabled
  if (rows.length === 0) {
    return res.status(401).json({ error: 'Invalid or inactive API key.' });
  }

  // rows[0] is the first (and only) matching row - the key's full record from DB
  const keyRow = rows[0];

  // Now run the rate limiter using this key's own settings from the DB
  const result = await isAllowed(
    keyRow.id,                  // unique bucket identity per key
    keyRow.bucket_capacity,     // how many tokens max (set when key was created)
    keyRow.refill_rate,         // how many tokens to add per interval
    keyRow.refill_interval_ms   // how often to refill
  );

  if (!result.allowed) {
    return res.status(429).json({
      error: 'Too many requests',
      message: 'No tokens available. Wait for refill.',
      tokens: Math.floor(result.tokens)
    });
  }

  res.json({
    message: 'Request allowed.',
    tokens: Math.floor(result.tokens)
  });
});

// Get current tokens without consuming (for UI polling)
router.get('/api/tokens', async (req, res) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'Missing API key. Send x-api-key header.' });
  }

  const { rows } = await pool.query(
    'SELECT * FROM api_keys WHERE key = $1 AND is_active = true',
    [apiKey]
  );

  if (rows.length === 0) {
    return res.status(401).json({ error: 'Invalid or inactive API key.' });
  }

  const keyRow = rows[0];
  const now = Date.now();
  const tokensKey = `ratelimit:${keyRow.id}:tokens`;
  const lastRefillKey = `ratelimit:${keyRow.id}:lastRefill`;

  const [tokensStr, lastRefillStr] = await Promise.all([
    redis.get(tokensKey),
    redis.get(lastRefillKey)
  ]);

  let tokens = tokensStr ? parseFloat(tokensStr) : keyRow.bucket_capacity;
  let lastRefill = lastRefillStr ? parseInt(lastRefillStr) : now;

  const elapsed = now - lastRefill;
  const tokensToAdd = Math.floor(elapsed / keyRow.refill_interval_ms) * keyRow.refill_rate;
  tokens = Math.min(keyRow.bucket_capacity, tokens + tokensToAdd);

  res.json({ tokens: Math.floor(tokens) });
});

export default router;
