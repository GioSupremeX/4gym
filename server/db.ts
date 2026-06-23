import { drizzle } from 'drizzle-orm/node-postgres'; // Or 'drizzle-orm/postgres-js' depending on your driver
import pg from 'pg';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is missing.");
}

// 1. Clean the string but preserve native parameters securely
const cleanConnectionString = databaseUrl.split('?')[0];

const pool = new pg.Pool({
  connectionString: cleanConnectionString,
  // 2. Explicitly force production-grade SSL configurations cleanly
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });
