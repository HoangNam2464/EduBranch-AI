-- Removes only QA-016 disposable identities and their attempts/enrollments.
BEGIN;
DELETE FROM branching_attempts
WHERE student_id IN (
  SELECT id FROM users WHERE email LIKE 'qa016.student.%@load.edubranch.test'
);
DELETE FROM course_enrollments
WHERE student_id IN (
  SELECT id FROM users WHERE email LIKE 'qa016.student.%@load.edubranch.test'
);
DELETE FROM users
WHERE email LIKE 'qa016.student.%@load.edubranch.test'
   OR email = 'qa016.lecturer.foreign@load.edubranch.test';
COMMIT;
