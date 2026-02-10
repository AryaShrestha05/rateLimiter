import { Router } from 'express';
import Redis from 'ioredis';

const router = Router();

const redis = new Redis({
  host: 'localhost',
  port: 6379,
});

// Token bucket configuration
const BUCKET_CAPACITY = 5;      // Max tokens a user can have
const REFILL_RATE = 1;          // Tokens added per interval
const REFILL_INTERVAL_MS = 2000; // Add 1 token every 2 seconds

async function isAllowed(userId) {
    const now = Date.now();
    const tokensKey = `ratelimit:${userId}:tokens`;
    const lastRefillKey = `ratelimit:${userId}:lastRefill`;

    // Get current state from Redis
    const [tokensStr, lastRefillStr] = await Promise.all([
        redis.get(tokensKey),
        redis.get(lastRefillKey)
    ]);

    let tokens = tokensStr ? parseFloat(tokensStr) : BUCKET_CAPACITY;
    let lastRefill = lastRefillStr ? parseInt(lastRefillStr) : now;

    // Calculate tokens to add based on time elapsed
    const elapsed = now - lastRefill;
    const tokensToAdd = Math.floor(elapsed / REFILL_INTERVAL_MS) * REFILL_RATE;

    if (tokensToAdd > 0) {
        tokens = Math.min(BUCKET_CAPACITY, tokens + tokensToAdd);
        lastRefill = now;
    }

    // Try to consume a token
    if (tokens < 1) {
        // No tokens available - blocked
        await Promise.all([
            redis.set(tokensKey, tokens),
            redis.set(lastRefillKey, lastRefill)
        ]);
        return { allowed: false, tokens: tokens };
    }

    // Consume 1 token
    tokens -= 1;

    // Save state to Redis
    await Promise.all([
        redis.set(tokensKey, tokens),
        redis.set(lastRefillKey, lastRefill)
    ]);

    return { allowed: true, tokens: tokens };
}

router.get('/api/hello', async (req, res) => {
  const userId = req.ip || 'unknown';
  console.log('Request from:', userId);

  const result = await isAllowed(userId);

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
  const userId = req.ip || 'unknown';
  const now = Date.now();
  const tokensKey = `ratelimit:${userId}:tokens`;
  const lastRefillKey = `ratelimit:${userId}:lastRefill`;

  const [tokensStr, lastRefillStr] = await Promise.all([
    redis.get(tokensKey),
    redis.get(lastRefillKey)
  ]);

  let tokens = tokensStr ? parseFloat(tokensStr) : BUCKET_CAPACITY;
  let lastRefill = lastRefillStr ? parseInt(lastRefillStr) : now;

  // Calculate refilled tokens
  const elapsed = now - lastRefill;
  const tokensToAdd = Math.floor(elapsed / REFILL_INTERVAL_MS) * REFILL_RATE;
  tokens = Math.min(BUCKET_CAPACITY, tokens + tokensToAdd);

  res.json({ tokens: Math.floor(tokens) });
});

export default router;
