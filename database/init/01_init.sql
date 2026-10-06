-- Initial database setup for MoukawilOS local development container
-- Enables required PostgreSQL extensions and stub schemas

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Local development compatibility stub for Supabase Auth schema
CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed a default test user for local offline testing if empty
INSERT INTO auth.users (id, email)
VALUES ('9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', 'dev@moukawilos.dz')
ON CONFLICT (id) DO NOTHING;
