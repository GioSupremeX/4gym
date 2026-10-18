import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const isProduction = process.env.NODE_ENV === "production";
const isLocal =
  process.env.DATABASE_URL.includes("localhost") ||
  process.env.DATABASE_URL.includes("127.0.0.1");

const ssl =
  process.env.DATABASE_URL.includes("sslmode=require") ||
  process.env.DATABASE_URL.includes("ssl=true") ||
  (isProduction && !isLocal)
    ? { rejectUnauthorized: false }
    : undefined;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl,
});

export const db = drizzle(pool, { schema });
