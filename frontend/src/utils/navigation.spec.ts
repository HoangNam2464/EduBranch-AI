import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveSafeReturnUrl, DEFAULT_ROLE_REDIRECT } from './navigation';

describe('resolveSafeReturnUrl (Role-Aware Return URL & Open Redirect Defense)', () => {
  // 1. Student + direct-link hợp lệ
  it('should preserve valid student direct-link for STUDENT role', () => {
    const raw = '/student/cases/c1/branching-play';
    const result = resolveSafeReturnUrl(raw, 'STUDENT');
    assert.equal(result, '/student/cases/c1/branching-play');
  });

  // 2. Lecturer + direct-link thuộc luồng student
  it('should reject student direct-link for LECTURER and fallback to lecturer dashboard', () => {
    const raw = '/student/cases/c1/branching-play';
    const result = resolveSafeReturnUrl(raw, 'LECTURER');
    assert.equal(result, DEFAULT_ROLE_REDIRECT.LECTURER);
    assert.equal(result, '/lecturer/courses');
  });

  // 3. Student + direct-link thuộc luồng lecturer
  it('should reject lecturer route for STUDENT and fallback to student portal', () => {
    const raw = '/lecturer/courses/c1/cases';
    const result = resolveSafeReturnUrl(raw, 'STUDENT');
    assert.equal(result, DEFAULT_ROLE_REDIRECT.STUDENT);
    assert.equal(result, '/student');
  });

  // 4. URL bắt đầu bằng //
  it('should reject protocol-relative URLs starting with //', () => {
    assert.equal(resolveSafeReturnUrl('//evil.example/malicious', 'STUDENT'), '/student');
    assert.equal(resolveSafeReturnUrl('//google.com', 'LECTURER'), '/lecturer/courses');
    assert.equal(resolveSafeReturnUrl('///evil.example', 'STUDENT'), '/student');
  });

  // 5. URL chứa backslash hoặc scheme ngoài
  it('should reject URLs containing backslashes or external schemes', () => {
    // Backslash anywhere in string
    assert.equal(resolveSafeReturnUrl('/\\evil.example', 'STUDENT'), '/student');
    assert.equal(resolveSafeReturnUrl('\\student\\cases', 'STUDENT'), '/student');
    assert.equal(resolveSafeReturnUrl('/student/cases\\evil', 'STUDENT'), '/student');

    // External schemes
    assert.equal(resolveSafeReturnUrl('https://evil.example/student/cases', 'STUDENT'), '/student');
    assert.equal(resolveSafeReturnUrl('http://localhost:3000/student', 'STUDENT'), '/student');
    assert.equal(resolveSafeReturnUrl('javascript:alert(1)', 'STUDENT'), '/student');
    assert.equal(resolveSafeReturnUrl('data:text/html,<script>alert(1)</script>', 'STUDENT'), '/student');
    assert.equal(resolveSafeReturnUrl('file:///etc/passwd', 'STUDENT'), '/student');
  });

  // 6. returnUrl không phải chuỗi hoặc bị thiếu
  it('should safely fallback when returnUrl is missing, null, undefined, or non-string', () => {
    assert.equal(resolveSafeReturnUrl(null, 'STUDENT'), '/student');
    assert.equal(resolveSafeReturnUrl(undefined, 'STUDENT'), '/student');
    assert.equal(resolveSafeReturnUrl('', 'STUDENT'), '/student');
    assert.equal(resolveSafeReturnUrl('   ', 'STUDENT'), '/student');
    assert.equal(resolveSafeReturnUrl(123 as any, 'STUDENT'), '/student');
    assert.equal(resolveSafeReturnUrl({ from: '/student' } as any, 'STUDENT'), '/student');

    assert.equal(resolveSafeReturnUrl(null, 'LECTURER'), '/lecturer/courses');
    assert.equal(resolveSafeReturnUrl(undefined, 'LECTURER'), '/lecturer/courses');
  });

  // 7. Pathname có query và hash
  it('should fully preserve valid pathname, search query parameters, and hash fragment', () => {
    const raw = '/student/cases/c-123/branching-play?step=2&theme=dark#decision-tree';
    const result = resolveSafeReturnUrl(raw, 'STUDENT');
    assert.equal(result, '/student/cases/c-123/branching-play?step=2&theme=dark#decision-tree');

    const lecturerRaw = '/lecturer/cases/c-123/review?view=flow#node-terminal-1';
    const lecturerResult = resolveSafeReturnUrl(lecturerRaw, 'LECTURER');
    assert.equal(lecturerResult, '/lecturer/cases/c-123/review?view=flow#node-terminal-1');
  });

  // 8. Đăng ký thành công và điều hướng trở lại đúng trang
  it('should correctly resolve destination for registration flow with valid direct-link state', () => {
    // Simulating post-registration redirect for new student with teacher-provided link
    const newStudentDirectLink = '/student/cases/ethics-case-01/branching-play?ref=invite';
    const destination = resolveSafeReturnUrl(newStudentDirectLink, 'STUDENT');
    assert.equal(destination, '/student/cases/ethics-case-01/branching-play?ref=invite');

    // Simulating post-registration redirect without direct-link
    const defaultStudentDestination = resolveSafeReturnUrl(null, 'STUDENT');
    assert.equal(defaultStudentDestination, '/student');

    // Simulating post-registration redirect for lecturer
    const defaultLecturerDestination = resolveSafeReturnUrl(null, 'LECTURER');
    assert.equal(defaultLecturerDestination, '/lecturer/courses');
  });

  // 9. Ngăn chặn truy cập vào route đã bị loại bỏ khỏi scope MVP (/student/cases)
  it('should reject deprecated /student/cases route and redirect to /student', () => {
    assert.equal(resolveSafeReturnUrl('/student/cases', 'STUDENT'), '/student');
    assert.equal(resolveSafeReturnUrl('/student/cases/', 'STUDENT'), '/student');
  });
});
