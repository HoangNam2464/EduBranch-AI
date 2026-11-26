# Data model — spec 007

Mọi thay đổi đều là migration chỉ thêm (B-7). Không sửa cột hay ràng buộc hiện có.

## V6__user_preferred_language.sql (BE-031)
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) NOT NULL DEFAULT 'vi'
  CHECK (preferred_language IN ('vi', 'en'));
```

## V7__audit_events_and_settings.sql (BE-032)
```sql
CREATE TABLE IF NOT EXISTS audit_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type  VARCHAR(50) NOT NULL CHECK (event_type IN (
                'LOGIN_SUCCEEDED','LOGIN_FAILED','USER_LOCKED','USER_UNLOCKED','USER_ROLE_CHANGED',
                'CASE_GENERATED','CASE_GENERATION_FAILED','CASE_STATUS_CHANGED',
                'MATERIAL_UPLOADED','SETTINGS_UPDATED')),
  outcome     VARCHAR(10) NOT NULL CHECK (outcome IN ('SUCCESS','WARNING','ERROR')),
  actor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  target_id   UUID,
  meta        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON audit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_type_created ON audit_events(event_type, created_at DESC);

CREATE TABLE IF NOT EXISTS system_settings (
  key         VARCHAR(50) PRIMARY KEY CHECK (key IN
                ('platformName','operatorUnit','loginNotice','supportEmail','aiPolicyNote')),
  value       TEXT NOT NULL,
  updated_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

- `meta` chỉ chứa dữ liệu không nhạy cảm: tên case, tên tệp, mã khóa, trạng thái cũ/mới, `durationMs`, mã lỗi. Không lưu mật khẩu, token, email đã nhập khi đăng nhập thất bại, hay văn bản của sinh viên.
- Khi chưa có dòng nào, `system_settings` dùng giá trị mặc định trong code: `platformName = "EduBranch AI"`, các trường khác rỗng.

## V8__case_rubric_evaluations.sql (BE-033)
```sql
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
```

## Bảng chỉ đọc
`users`, `courses`, `teaching_materials`, `cases`, `case_nodes`, `case_options`, `course_enrollments`, `branching_attempts`, `student_reasoning`, `review_study_submissions`, `challenge_support_sessions`, `lecturer_feedback`.
