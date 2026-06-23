import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is missing.");
}

// Strip query parameters to prevent connection string pollution
const cleanConnectionString = databaseUrl.split('?')[0];

const pool = new pg.Pool({
  connectionString: cleanConnectionString,
  // Enforce native SSL handshakes for production environments (like Neon)
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool);
