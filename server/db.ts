import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is missing.");
}

// Ensure no query parameters conflict with the pooler
const connectionString = databaseUrl.split('?')[0];

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 1, // Start small to prevent resource exhaustion on free tier
  connectionTimeoutMillis: 10000, // Wait 10s before failing
  keepAlive: true,
});

// A quick health check to verify connection before starting the app
pool.on('error', (err) => console.error('Unexpected pool error', err));

export const db = drizzle(pool);
