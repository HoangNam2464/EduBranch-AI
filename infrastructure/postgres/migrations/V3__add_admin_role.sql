-- ==============================================================================
-- EduBranch-AI — V3 Migration: Add ADMIN to User Role Check Constraint
-- Source of Truth: Proposal V1.2 Figure 1 (System Context Diagram)
-- ==============================================================================
-- Ensures that existing database volumes/instances that ran V1/V2 can accept
-- the ADMIN role without requiring a destructive database rebuild.
-- ==============================================================================

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('LECTURER', 'STUDENT', 'ADMIN'));
