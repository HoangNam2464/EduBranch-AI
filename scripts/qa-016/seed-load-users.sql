-- QA-016 local-only fixtures. Demo@123456 is bcrypt-hashed with 12 rounds.
-- The fixed QA namespace makes setup repeatable. Run cleanup-load-users.sql after evidence capture.
BEGIN;

INSERT INTO users (id, email, password_hash, full_name, role, is_active)
SELECT
  ('a0160000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid,
  'qa016.student.' || lpad(n::text, 2, '0') || '@load.edubranch.test',
  '$2b$12$38fkwcgXeFe/UPBa3VeFTOh0X3T0ccsfc3ucL/saNpUuZEm3OpuXi',
  'QA-016 Student ' || lpad(n::text, 2, '0'),
  'STUDENT',
  TRUE
FROM generate_series(1, 50) AS n
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, password_hash, full_name, role, is_active)
VALUES (
  'a0160000-0000-4000-8000-000000000051',
  'qa016.lecturer.foreign@load.edubranch.test',
  '$2b$12$38fkwcgXeFe/UPBa3VeFTOh0X3T0ccsfc3ucL/saNpUuZEm3OpuXi',
  'QA-016 Foreign Lecturer',
  'LECTURER',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO course_enrollments (id, course_id, student_id)
SELECT
  ('b0160000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid,
  '20000000-0000-4000-8000-000000000001',
  ('a0160000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid
FROM generate_series(1, 50) AS n
ON CONFLICT (course_id, student_id) DO NOTHING;

COMMIT;
