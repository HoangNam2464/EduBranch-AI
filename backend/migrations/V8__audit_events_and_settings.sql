-- ==============================================================================
-- V8: system activity log and platform settings (BE-032, spec 007)
-- Additive only. audit_events.meta holds non-sensitive context only
-- (case title, file name, status change, duration); never passwords, tokens,
-- the e-mail typed on a failed login, or student-written text.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS audit_events (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type  VARCHAR(50) NOT NULL CHECK (event_type IN (
                    'LOGIN_SUCCEEDED', 'LOGIN_FAILED',
                    'USER_LOCKED', 'USER_UNLOCKED', 'USER_ROLE_CHANGED',
                    'CASE_GENERATED', 'CASE_GENERATION_FAILED', 'CASE_STATUS_CHANGED',
                    'MATERIAL_UPLOADED', 'SETTINGS_UPDATED')),
    outcome     VARCHAR(10) NOT NULL CHECK (outcome IN ('SUCCESS', 'WARNING', 'ERROR')),
    actor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    target_id   UUID,
    meta        JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_created_at   ON audit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_type_created ON audit_events(event_type, created_at DESC);

CREATE TABLE IF NOT EXISTS system_settings (
    key         VARCHAR(50) PRIMARY KEY CHECK (key IN (
                    'platformName', 'operatorUnit', 'loginNotice', 'supportEmail', 'aiPolicyNote')),
    value       TEXT NOT NULL,
    updated_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
