import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

try {
  const parsed = new URL(process.env.DATABASE_URL);
  console.log(`Postgres host: ${parsed.hostname}, port: ${parsed.port || 5432}, ssl: ${parsed.search}`);
} catch (e) {
  console.log("Postgres: unable to parse DATABASE_URL for debug output");
}

const connectionString = process.env.DATABASE_URL as string;

// If the connection string contains a libpq-style sslmode=require, enable
// TLS for node-postgres. Many hosted Postgres (Neon) require SSL.
const poolOptions: any = { connectionString };
try {
  const url = new URL(connectionString);
  const sslmode = url.searchParams.get("sslmode");
  if (sslmode === "require") {
    poolOptions.ssl = { rejectUnauthorized: false };
  }
} catch (e) {
  // ignore parse errors; pool will still attempt to use the connectionString
}

export const pool = new Pool(poolOptions);
export const db = drizzle(pool, { schema });
