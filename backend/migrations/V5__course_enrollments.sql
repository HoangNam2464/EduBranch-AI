-- ==============================================================================
-- V5__course_enrollments.sql
-- EduBranch-AI Course Enrollment & Invite Code Schema
-- ==============================================================================

ALTER TABLE courses ADD COLUMN IF NOT EXISTS invite_code VARCHAR(32) UNIQUE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS invite_code_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS course_enrollments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(course_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_student ON course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course ON course_enrollments(course_id);
