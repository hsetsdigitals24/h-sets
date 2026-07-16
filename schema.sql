-- H-SETS database schema (reference).
--
-- The app creates this automatically at runtime via ensureSchema() in
-- src/lib/db.ts, so you do NOT have to run this by hand. It is kept here as
-- documentation and for provisioning a fresh database manually if preferred.
--
-- One-time setup for a local Postgres:
--   sudo -u postgres psql
--   CREATE ROLE hsets WITH LOGIN PASSWORD 'your-password';
--   CREATE DATABASE hsets OWNER hsets;
--   \c hsets
--   \i schema.sql

CREATE TABLE IF NOT EXISTS leads (
  id          BIGSERIAL PRIMARY KEY,
  type        TEXT        NOT NULL,   -- contact | consultation | newsletter | resource
  name        TEXT,
  email       TEXT,
  phone       TEXT,
  company     TEXT,
  source      TEXT,                   -- page/context the lead came from
  data        JSONB       NOT NULL DEFAULT '{}'::jsonb,  -- full form payload
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_type_idx       ON leads (type);
CREATE INDEX IF NOT EXISTS leads_email_idx      ON leads (email);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);
