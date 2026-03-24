import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'ratelimiter',
  user: 'postgres',
  password: 'postgres',
  max: 10,
});

export default pool;
