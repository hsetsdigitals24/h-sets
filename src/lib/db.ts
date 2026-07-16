import "server-only";
import { Pool } from "pg";

/**
 * Single shared Postgres connection pool.
 *
 * Cached on globalThis so Next.js hot-reload in development doesn't open a new
 * pool on every change. Configure the connection with the DATABASE_URL env var,
 * e.g. postgresql://user:password@localhost:5432/hsets
 */
const globalForDb = globalThis as unknown as {
  _hsetsPool?: Pool;
  _hsetsSchemaReady?: Promise<void>;
};

export function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and set your Postgres connection string."
    );
  }
  if (!globalForDb._hsetsPool) {
    globalForDb._hsetsPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30_000,
      // Enable SSL for hosted databases (Supabase, Neon, etc.)
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });
  }
  return globalForDb._hsetsPool;
}

/**
 * Create the leads table if it doesn't exist. Runs at most once per process
 * (the promise is cached), so every API route can safely await it cheaply.
 */
export function ensureSchema(): Promise<void> {
  if (!globalForDb._hsetsSchemaReady) {
    globalForDb._hsetsSchemaReady = (async () => {
      const pool = getPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS leads (
          id          BIGSERIAL PRIMARY KEY,
          type        TEXT        NOT NULL,
          name        TEXT,
          email       TEXT,
          phone       TEXT,
          company     TEXT,
          source      TEXT,
          data        JSONB       NOT NULL DEFAULT '{}'::jsonb,
          created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS leads_type_idx       ON leads (type);
        CREATE INDEX IF NOT EXISTS leads_email_idx      ON leads (email);
        CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);
      `);
    })().catch((err) => {
      // Reset so a later request can retry after a transient failure.
      globalForDb._hsetsSchemaReady = undefined;
      throw err;
    });
  }
  return globalForDb._hsetsSchemaReady;
}

export type LeadType = "contact" | "consultation" | "newsletter" | "resource";

export type LeadRecord = {
  type: LeadType;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  source?: string | null;
  data?: Record<string, unknown>;
};

/** Insert a lead/submission and return its new id + timestamp. */
export async function insertLead(
  lead: LeadRecord
): Promise<{ id: number; created_at: string }> {
  await ensureSchema();
  const pool = getPool();
  const { rows } = await pool.query<{ id: number; created_at: string }>(
    `INSERT INTO leads (type, name, email, phone, company, source, data)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, created_at`,
    [
      lead.type,
      lead.name ?? null,
      lead.email ?? null,
      lead.phone ?? null,
      lead.company ?? null,
      lead.source ?? null,
      JSON.stringify(lead.data ?? {}),
    ]
  );
  return rows[0];
}
