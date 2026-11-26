-- ==============================================================================
-- V8: case quality rubric (BE-033, spec 007; FR-EVAL-01, OPD-011 -> A)
-- Rates the case artefact (realism, difficulty, course alignment, 1-5).
-- It is never a student grade (BR-EVAL-02).
-- ==============================================================================
CREATE TABLE IF NOT EXISTS case_rubric_evaluations (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id          UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    evaluator_id     UUID NOT NULL REFERENCES users(id),
    realism_score    SMALLINT NOT NULL CHECK (realism_score BETWEEN 1 AND 5),
    difficulty_score SMALLINT NOT NULL CHECK (difficulty_score BETWEEN 1 AND 5),
    alignment_score  SMALLINT NOT NULL CHECK (alignment_score BETWEEN 1 AND 5),
    notes            TEXT CHECK (notes IS NULL OR char_length(notes) <= 2000),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_rubric_per_evaluator_case UNIQUE (case_id, evaluator_id)
);

CREATE INDEX IF NOT EXISTS idx_rubric_case_id ON case_rubric_evaluations(case_id);
