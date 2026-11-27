-- ==============================================================================
-- V7: user interface language preference (BE-031, spec 007)
-- Additive only: one column with a default, existing rows get 'vi'.
-- ==============================================================================
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) NOT NULL DEFAULT 'vi';

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_preferred_language_check;
ALTER TABLE users
    ADD CONSTRAINT users_preferred_language_check CHECK (preferred_language IN ('vi', 'en'));
