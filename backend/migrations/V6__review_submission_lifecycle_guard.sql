-- Enforce the Review Study submission state machine at the database boundary.
-- The per-student/per-case uniqueness gate is created in V2.

CREATE OR REPLACE FUNCTION enforce_review_submission_lifecycle()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.submission_status <> 'SUBMITTED'
           OR NEW.reflection_status <> 'NOT_STARTED'
           OR NEW.reflection_text IS NOT NULL
           OR NEW.reflection_submitted_at IS NOT NULL THEN
            RAISE EXCEPTION 'Review Study submissions must start in the SUBMITTED state without reflection data'
                USING ERRCODE = '23514';
        END IF;
        RETURN NEW;
    END IF;

    IF NEW.submission_status = 'REFLECTED'
       AND (NEW.reflection_status <> 'SUBMITTED'
            OR NEW.reflection_text IS NULL
            OR NEW.reflection_submitted_at IS NULL) THEN
        RAISE EXCEPTION 'REFLECTED submissions require a submitted reflection and timestamp'
            USING ERRCODE = '23514';
    END IF;

    IF NEW.reflection_status = 'SUBMITTED'
       AND (NEW.submission_status <> 'REFLECTED'
            OR NEW.reflection_text IS NULL
            OR NEW.reflection_submitted_at IS NULL) THEN
        RAISE EXCEPTION 'Reflection submission requires the REFLECTED lifecycle state'
            USING ERRCODE = '23514';
    END IF;

    IF NEW.submission_status IS DISTINCT FROM OLD.submission_status
       AND NOT (
           (OLD.submission_status = 'SUBMITTED' AND NEW.submission_status = 'REVIEWED')
           OR (OLD.submission_status = 'REVIEWED' AND NEW.submission_status = 'REFLECTED')
       ) THEN
        RAISE EXCEPTION 'Invalid Review Study submission transition: % -> %',
            OLD.submission_status, NEW.submission_status
            USING ERRCODE = '23514';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_review_submission_lifecycle ON review_study_submissions;
CREATE TRIGGER trg_review_submission_lifecycle
    BEFORE INSERT OR UPDATE OF submission_status, reflection_status, reflection_text, reflection_submitted_at
    ON review_study_submissions
    FOR EACH ROW
    EXECUTE FUNCTION enforce_review_submission_lifecycle();
