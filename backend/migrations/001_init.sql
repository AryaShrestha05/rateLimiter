 -- Users: people who sign up for your SaaS
  CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255),
      passwords_hash VARCHAR(255),
      plan VARCHAR(50) DEFAULT 'free',
      created_at TIMESTAMP DEFAULT NOW()
  );

  -- API Keys: each user can have multiple keys
  CREATE TABLE IF NOT EXISTS api_keys (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      key VARCHAR(255) UNIQUE NOT NULL,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) DEFAULT 'Default',

      -- Rate limit config (per key!)
      bucket_capacity INT DEFAULT 10,
      refill_rate INT DEFAULT 1,
      refill_interval_ms INT DEFAULT 1000,
      requests_per_day INT DEFAULT 10000,

      is_active BOOLEAN DEFAULT true,
      last_used_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
  );

  -- Index for fast API key lookups
  CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);