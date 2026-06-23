import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// 1. Clean the string just in case query params leak in
const cleanConnectionString = process.env.DATABASE_URL.split('?')[0];

try {
  const parsed = new URL(cleanConnectionString);
  console.log(`Postgres host: ${parsed.hostname}, port: ${parsed.port || 5432}, ssl: ${process.env.NODE_ENV === 'production' ? 'forced' : 'disabled'}`);
} catch (e) {
  console.log("Postgres: unable to parse DATABASE_URL for debug output");
}

// 2. Configure the pool options safely
const poolOptions: any = { 
  connectionString: cleanConnectionString 
};

// Explicitly enforce production SSL for Neon
if (process.env.NODE_ENV === "production") {
  poolOptions.ssl = { rejectUnauthorized: false };
}

export const pool = new Pool(poolOptions);
export const db = drizzle(pool, { schema });
