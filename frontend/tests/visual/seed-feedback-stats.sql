-- Visual QA fixtures for Lecturer Feedback (04.1/04.2/04.2b), Learning-Flow Statistics (04.3)
-- and Student Review Feedback (PR #68, #69, #70). LOCAL DOCKER POSTGRES ONLY.
-- PO approval 2026-11-21 (conditional): local Docker DB only; fixture or anonymised data only;
-- idempotent; explicit target DB; never delete data outside the seed scope.
--
-- Run through seed-feedback-stats.mjs (it checks the target, supplies :'fixture_hash' and runs this file
-- in one transaction). Every row has a fixed id in the 5eed0003-… range and is inserted with
-- ON CONFLICT DO NOTHING, so a re-run changes nothing. Nothing is deleted or updated outside that range.
-- Fixture students use the reserved .test domain and a bcrypt hash of a random secret that is discarded,
-- so nobody can sign in as them. Existing accounts used: the lecturer an.nguyen@duytan.edu.vn (owner of
-- CS402) and the student minhkhoi@student.duytan.edu.vn, both created by seed-local.mjs.

\set lecturer_email 'an.nguyen@duytan.edu.vn'
\set student_email 'minhkhoi@student.duytan.edu.vn'

-- Guard: CS402 of the fixture lecturer and the fixture student must exist (created by seed-local.mjs).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM courses c JOIN users u ON u.id = c.lecturer_id
                 WHERE u.email = 'an.nguyen@duytan.edu.vn' AND c.course_code = 'CS402') THEN
    RAISE EXCEPTION 'CS402 of an.nguyen@duytan.edu.vn not found: run seed-local.mjs first';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'minhkhoi@student.duytan.edu.vn' AND role = 'STUDENT') THEN
    RAISE EXCEPTION 'student minhkhoi@student.duytan.edu.vn not found: run seed-local.mjs first';
  END IF;
  IF EXISTS (SELECT 1 FROM users WHERE email LIKE '%@student.edubranch.test'
             AND id::text NOT LIKE '5eed0003-%') THEN
    RAISE EXCEPTION 'a fixture e-mail is already used by a non-fixture account';
  END IF;
END $$;

CREATE TEMP TABLE seed_ref ON COMMIT DROP AS
SELECT (SELECT id FROM users WHERE email = :'lecturer_email') AS lecturer_id,
       (SELECT id FROM users WHERE email = :'student_email') AS student_id,
       (SELECT c.id FROM courses c JOIN users u ON u.id = c.lecturer_id
         WHERE u.email = :'lecturer_email' AND c.course_code = 'CS402') AS course_id;

-- 1. Fixture students (names from Figma 04.1; no real person; sign-in impossible).
INSERT INTO users (id, email, password_hash, full_name, role, is_active, created_at, updated_at) VALUES
  ('5eed0003-0000-4000-8000-000000000101', 'minhanh@student.edubranch.test', :'fixture_hash', 'Nguyễn Minh Anh', 'STUDENT', TRUE, '2026-09-26T08:00:00+07', '2026-09-26T08:00:00+07'),
  ('5eed0003-0000-4000-8000-000000000102', 'quocbao@student.edubranch.test', :'fixture_hash', 'Trần Quốc Bảo', 'STUDENT', TRUE, '2026-09-26T08:00:00+07', '2026-09-26T08:00:00+07'),
  ('5eed0003-0000-4000-8000-000000000103', 'thuha@student.edubranch.test', :'fixture_hash', 'Lê Thu Hà', 'STUDENT', TRUE, '2026-09-26T08:00:00+07', '2026-09-26T08:00:00+07'),
  ('5eed0003-0000-4000-8000-000000000104', 'giahuy@student.edubranch.test', :'fixture_hash', 'Phạm Gia Huy', 'STUDENT', TRUE, '2026-09-26T08:00:00+07', '2026-09-26T08:00:00+07'),
  ('5eed0003-0000-4000-8000-000000000105', 'ngoclinh@student.edubranch.test', :'fixture_hash', 'Võ Ngọc Linh', 'STUDENT', TRUE, '2026-09-26T08:00:00+07', '2026-09-26T08:00:00+07'),
  ('5eed0003-0000-4000-8000-000000000106', 'ducminh@student.edubranch.test', :'fixture_hash', 'Đặng Đức Minh', 'STUDENT', TRUE, '2026-09-26T08:00:00+07', '2026-09-26T08:00:00+07'),
  ('5eed0003-0000-4000-8000-000000000107', 'thanhtam@student.edubranch.test', :'fixture_hash', 'Bùi Thanh Tâm', 'STUDENT', TRUE, '2026-09-26T08:00:00+07', '2026-09-26T08:00:00+07'),
  ('5eed0003-0000-4000-8000-000000000108', 'maiphuong@student.edubranch.test', :'fixture_hash', 'Hoàng Mai Phương', 'STUDENT', TRUE, '2026-09-26T08:00:00+07', '2026-09-26T08:00:00+07')
ON CONFLICT DO NOTHING;

-- 2. Enrolment in CS402 (the fixture student included).
INSERT INTO course_enrollments (id, course_id, student_id, enrolled_at)
SELECT v.id::uuid, r.course_id, COALESCE(v.student::uuid, r.student_id), '2026-09-30T08:00:00+07'
FROM seed_ref r, (VALUES
  ('5eed0003-0000-4000-8000-000000000901', '5eed0003-0000-4000-8000-000000000101'),
  ('5eed0003-0000-4000-8000-000000000902', '5eed0003-0000-4000-8000-000000000102'),
  ('5eed0003-0000-4000-8000-000000000903', '5eed0003-0000-4000-8000-000000000103'),
  ('5eed0003-0000-4000-8000-000000000904', '5eed0003-0000-4000-8000-000000000104'),
  ('5eed0003-0000-4000-8000-000000000905', '5eed0003-0000-4000-8000-000000000105'),
  ('5eed0003-0000-4000-8000-000000000906', '5eed0003-0000-4000-8000-000000000106'),
  ('5eed0003-0000-4000-8000-000000000907', '5eed0003-0000-4000-8000-000000000107'),
  ('5eed0003-0000-4000-8000-000000000908', '5eed0003-0000-4000-8000-000000000108'),
  ('5eed0003-0000-4000-8000-000000000909', NULL)
) AS v(id, student)
ON CONFLICT DO NOTHING;

-- 3. Branching Study case (PUBLISHED): ransomware incident at a digital bank.
INSERT INTO cases (id, title, description, course_id, created_by, status, version, learning_mode, created_at, updated_at)
SELECT '5eed0003-0000-4000-8000-000000000201', 'Ransomware tấn công ngân hàng số',
       'Ứng cứu sự cố mã độc tống tiền trên hệ thống core banking của một ngân hàng số.',
       r.course_id, r.lecturer_id, 'PUBLISHED', 1, 'BRANCHING_STUDY', '2026-10-28T09:00:00+07', '2026-11-20T09:00:00+07'
FROM seed_ref r
ON CONFLICT DO NOTHING;

INSERT INTO case_nodes (id, case_id, situation, is_terminal, node_index) VALUES
  ('5eed0003-0000-4000-8000-000000000301', '5eed0003-0000-4000-8000-000000000201', 'Lúc 02:00, hệ thống core banking báo lỗi mã hóa hàng loạt và màn hình hiển thị yêu cầu tiền chuộc. Bạn là trưởng nhóm ứng cứu sự cố. Việc đầu tiên bạn làm là gì?', FALSE, 0),
  ('5eed0003-0000-4000-8000-000000000302', '5eed0003-0000-4000-8000-000000000201', 'Các phân đoạn mạng bị nhiễm đã được cô lập. Ban điều hành hỏi khi nào khách hàng giao dịch lại được.', FALSE, 1),
  ('5eed0003-0000-4000-8000-000000000303', '5eed0003-0000-4000-8000-000000000201', 'Nhóm tấn công đòi thêm tiền và đe dọa công bố dữ liệu khách hàng.', FALSE, 2),
  ('5eed0003-0000-4000-8000-000000000304', '5eed0003-0000-4000-8000-000000000201', 'Sau khi khởi động lại, mã độc lan sang hệ thống thanh toán thẻ.', FALSE, 3),
  ('5eed0003-0000-4000-8000-000000000305', '5eed0003-0000-4000-8000-000000000201', 'Phục hồi có kiểm soát: dữ liệu được khôi phục từ bản sao lưu bất biến và ngân hàng thông báo minh bạch cho khách hàng.', TRUE, 4),
  ('5eed0003-0000-4000-8000-000000000306', '5eed0003-0000-4000-8000-000000000201', 'Tổn thất vừa: dịch vụ gián đoạn kéo dài, một phần giao dịch phải đối soát lại.', TRUE, 5),
  ('5eed0003-0000-4000-8000-000000000307', '5eed0003-0000-4000-8000-000000000201', 'Sập toàn bộ: dữ liệu khách hàng bị công bố và hệ thống ngừng hoạt động nhiều ngày.', TRUE, 6)
ON CONFLICT DO NOTHING;

INSERT INTO case_options (id, node_id, option_text, consequence, next_node_id) VALUES
  ('5eed0003-0000-4000-8000-000000000401', '5eed0003-0000-4000-8000-000000000301', 'Cô lập ngay các phân đoạn mạng bị nhiễm', 'Mã độc dừng lan sang hệ thống thanh toán, nhưng một số dịch vụ nội bộ tạm ngừng.', '5eed0003-0000-4000-8000-000000000302'),
  ('5eed0003-0000-4000-8000-000000000402', '5eed0003-0000-4000-8000-000000000301', 'Liên hệ nhóm tấn công để thương lượng', 'Nhóm tấn công nâng giá chuộc và tiếp tục mã hóa trong lúc chờ phản hồi.', '5eed0003-0000-4000-8000-000000000303'),
  ('5eed0003-0000-4000-8000-000000000403', '5eed0003-0000-4000-8000-000000000301', 'Khởi động lại toàn bộ máy chủ', 'Một phần nhật ký điều tra bị mất và mã độc tái kích hoạt sau khởi động.', '5eed0003-0000-4000-8000-000000000304'),
  ('5eed0003-0000-4000-8000-000000000404', '5eed0003-0000-4000-8000-000000000302', 'Khôi phục từ bản sao lưu bất biến sau khi xác minh sạch', 'Mất 6 giờ để khôi phục nhưng dữ liệu toàn vẹn.', '5eed0003-0000-4000-8000-000000000305'),
  ('5eed0003-0000-4000-8000-000000000405', '5eed0003-0000-4000-8000-000000000302', 'Mở lại kênh giao dịch ngay trên hệ thống chưa kiểm tra', 'Khách hàng giao dịch lại sớm nhưng phát hiện thêm máy chủ bị nhiễm.', '5eed0003-0000-4000-8000-000000000306'),
  ('5eed0003-0000-4000-8000-000000000406', '5eed0003-0000-4000-8000-000000000303', 'Dừng thương lượng, báo cơ quan chức năng và cô lập mạng', 'Việc cô lập đến muộn nên một phần dữ liệu đã bị mã hóa.', '5eed0003-0000-4000-8000-000000000306'),
  ('5eed0003-0000-4000-8000-000000000407', '5eed0003-0000-4000-8000-000000000303', 'Chuyển tiền chuộc để lấy khóa giải mã', 'Khóa giải mã chỉ mở được một phần dữ liệu và dữ liệu vẫn bị công bố.', '5eed0003-0000-4000-8000-000000000307'),
  ('5eed0003-0000-4000-8000-000000000408', '5eed0003-0000-4000-8000-000000000304', 'Ngắt kết nối toàn bộ trung tâm dữ liệu', 'Thanh toán thẻ dừng nửa ngày, mã độc không lan thêm.', '5eed0003-0000-4000-8000-000000000306'),
  ('5eed0003-0000-4000-8000-000000000409', '5eed0003-0000-4000-8000-000000000304', 'Tiếp tục vận hành để tránh gián đoạn', 'Mã độc mã hóa cả hệ thống sao lưu trực tuyến.', '5eed0003-0000-4000-8000-000000000307')
ON CONFLICT DO NOTHING;

UPDATE cases SET root_node_id = '5eed0003-0000-4000-8000-000000000301'
WHERE id = '5eed0003-0000-4000-8000-000000000201' AND root_node_id IS NULL;

-- 4. Review Study case (PUBLISHED): Zero Trust for a digital bank.
INSERT INTO cases (id, title, description, course_id, created_by, status, version, learning_mode, context_text, problem_text, created_at, updated_at)
SELECT '5eed0003-0000-4000-8000-000000000202', 'Triển khai Zero Trust cho ngân hàng số',
       'Phân tích tình huống chuyển đổi mô hình bảo mật sang Zero Trust.',
       r.course_id, r.lecturer_id, 'PUBLISHED', 1, 'REVIEW_STUDY',
       'Một ngân hàng số vừa phát hiện tài khoản quản trị bị đánh cắp được dùng để truy cập hệ thống nội bộ từ mạng VPN. Mô hình bảo mật hiện tại tin cậy mọi thiết bị trong mạng nội bộ.',
       'Đề xuất lộ trình triển khai Zero Trust trong 6 tháng: xác thực liên tục, phân đoạn mạng và nguyên tắc đặc quyền tối thiểu, có tính đến việc giao dịch của khách hàng không bị gián đoạn.',
       '2026-10-29T09:00:00+07', '2026-11-20T09:00:00+07'
FROM seed_ref r
ON CONFLICT DO NOTHING;

-- 5. Branching attempts. Completed attempts follow a valid root-to-terminal path; two are in progress.
--    (id, student, attempt_number, current/outcome node, completed?, reflection, started, completed)
INSERT INTO branching_attempts (id, student_id, case_id, attempt_number, current_node_id, outcome_node_id, is_completed,
                                reflection_text, reflection_status, reflection_submitted_at, started_at, updated_at, completed_at) VALUES
  ('5eed0003-0000-4000-8000-000000000501', '5eed0003-0000-4000-8000-000000000101', '5eed0003-0000-4000-8000-000000000201', 1, '5eed0003-0000-4000-8000-000000000306', '5eed0003-0000-4000-8000-000000000306', TRUE, NULL, 'NOT_STARTED', NULL, '2026-11-13T09:20:00+07', '2026-11-13T09:42:00+07', '2026-11-13T09:42:00+07'),
  ('5eed0003-0000-4000-8000-000000000502', '5eed0003-0000-4000-8000-000000000101', '5eed0003-0000-4000-8000-000000000201', 2, '5eed0003-0000-4000-8000-000000000305', '5eed0003-0000-4000-8000-000000000305', TRUE, 'Lần đầu tôi mở lại giao dịch quá sớm. Lần này tôi ưu tiên xác minh bản sao lưu trước khi khôi phục, dù mất thêm thời gian.', 'SUBMITTED', '2026-11-18T10:05:00+07', '2026-11-18T09:30:00+07', '2026-11-18T10:05:00+07', '2026-11-18T09:42:00+07'),
  ('5eed0003-0000-4000-8000-000000000503', '5eed0003-0000-4000-8000-000000000102', '5eed0003-0000-4000-8000-000000000201', 1, '5eed0003-0000-4000-8000-000000000306', '5eed0003-0000-4000-8000-000000000306', TRUE, NULL, 'NOT_STARTED', NULL, '2026-11-18T08:50:00+07', '2026-11-18T09:15:00+07', '2026-11-18T09:15:00+07'),
  ('5eed0003-0000-4000-8000-000000000504', '5eed0003-0000-4000-8000-000000000104', '5eed0003-0000-4000-8000-000000000201', 1, '5eed0003-0000-4000-8000-000000000307', '5eed0003-0000-4000-8000-000000000307', TRUE, NULL, 'NOT_STARTED', NULL, '2026-11-17T17:40:00+07', '2026-11-17T18:05:00+07', '2026-11-17T18:05:00+07'),
  ('5eed0003-0000-4000-8000-000000000505', '5eed0003-0000-4000-8000-000000000105', '5eed0003-0000-4000-8000-000000000201', 1, '5eed0003-0000-4000-8000-000000000305', '5eed0003-0000-4000-8000-000000000305', TRUE, 'Cô lập sớm giúp giới hạn thiệt hại. Tôi cần nắm rõ hơn quy trình kiểm tra bản sao lưu bất biến.', 'SUBMITTED', '2026-11-15T15:30:00+07', '2026-11-15T14:40:00+07', '2026-11-15T15:30:00+07', '2026-11-15T15:10:00+07'),
  ('5eed0003-0000-4000-8000-000000000506', '5eed0003-0000-4000-8000-000000000105', '5eed0003-0000-4000-8000-000000000201', 2, '5eed0003-0000-4000-8000-000000000307', '5eed0003-0000-4000-8000-000000000307', TRUE, NULL, 'NOT_STARTED', NULL, '2026-11-17T15:00:00+07', '2026-11-17T15:10:00+07', '2026-11-17T15:10:00+07'),
  ('5eed0003-0000-4000-8000-000000000507', '5eed0003-0000-4000-8000-000000000106', '5eed0003-0000-4000-8000-000000000201', 1, '5eed0003-0000-4000-8000-000000000305', '5eed0003-0000-4000-8000-000000000305', TRUE, 'Tôi đã cân nhắc giữa thời gian gián đoạn và tính toàn vẹn dữ liệu; chọn toàn vẹn là hợp lý với ngân hàng.', 'SUBMITTED', '2026-11-16T17:00:00+07', '2026-11-16T16:20:00+07', '2026-11-16T17:00:00+07', '2026-11-16T16:45:00+07'),
  ('5eed0003-0000-4000-8000-000000000508', '5eed0003-0000-4000-8000-000000000107', '5eed0003-0000-4000-8000-000000000201', 1, '5eed0003-0000-4000-8000-000000000302', NULL, FALSE, NULL, 'NOT_STARTED', NULL, '2026-11-19T19:10:00+07', '2026-11-19T19:15:00+07', NULL),
  ('5eed0003-0000-4000-8000-000000000509', '5eed0003-0000-4000-8000-000000000108', '5eed0003-0000-4000-8000-000000000201', 1, '5eed0003-0000-4000-8000-000000000301', NULL, FALSE, NULL, 'NOT_STARTED', NULL, '2026-11-20T08:30:00+07', '2026-11-20T08:30:00+07', NULL)
ON CONFLICT DO NOTHING;

-- 6. One student_reasoning row per decision taken (retrospective reasoning on some; NULL on others).
INSERT INTO student_reasoning (id, attempt_id, node_id, selected_option_id, reasoning_text, submitted_at) VALUES
  ('5eed0003-0000-4000-8000-000000000601', '5eed0003-0000-4000-8000-000000000501', '5eed0003-0000-4000-8000-000000000301', '5eed0003-0000-4000-8000-000000000401', 'Cô lập trước để chặn mã độc lan sang hệ thống thanh toán.', '2026-11-13T09:25:00+07'),
  ('5eed0003-0000-4000-8000-000000000602', '5eed0003-0000-4000-8000-000000000501', '5eed0003-0000-4000-8000-000000000302', '5eed0003-0000-4000-8000-000000000405', NULL, '2026-11-13T09:40:00+07'),
  ('5eed0003-0000-4000-8000-000000000603', '5eed0003-0000-4000-8000-000000000502', '5eed0003-0000-4000-8000-000000000301', '5eed0003-0000-4000-8000-000000000401', 'Giữ nguyên quyết định cô lập vì nó đã hiệu quả ở lần trước.', '2026-11-18T09:32:00+07'),
  ('5eed0003-0000-4000-8000-000000000604', '5eed0003-0000-4000-8000-000000000502', '5eed0003-0000-4000-8000-000000000302', '5eed0003-0000-4000-8000-000000000404', 'Bản sao lưu bất biến là nguồn dữ liệu duy nhất chắc chắn sạch.', '2026-11-18T09:40:00+07'),
  ('5eed0003-0000-4000-8000-000000000605', '5eed0003-0000-4000-8000-000000000503', '5eed0003-0000-4000-8000-000000000301', '5eed0003-0000-4000-8000-000000000402', 'Tôi muốn có thêm thời gian để đánh giá mức độ thiệt hại.', '2026-11-18T08:55:00+07'),
  ('5eed0003-0000-4000-8000-000000000606', '5eed0003-0000-4000-8000-000000000503', '5eed0003-0000-4000-8000-000000000303', '5eed0003-0000-4000-8000-000000000406', NULL, '2026-11-18T09:10:00+07'),
  ('5eed0003-0000-4000-8000-000000000607', '5eed0003-0000-4000-8000-000000000504', '5eed0003-0000-4000-8000-000000000301', '5eed0003-0000-4000-8000-000000000403', NULL, '2026-11-17T17:45:00+07'),
  ('5eed0003-0000-4000-8000-000000000608', '5eed0003-0000-4000-8000-000000000504', '5eed0003-0000-4000-8000-000000000304', '5eed0003-0000-4000-8000-000000000409', 'Tôi lo ngại thiệt hại kinh doanh nếu dừng thanh toán thẻ.', '2026-11-17T18:00:00+07'),
  ('5eed0003-0000-4000-8000-000000000609', '5eed0003-0000-4000-8000-000000000505', '5eed0003-0000-4000-8000-000000000301', '5eed0003-0000-4000-8000-000000000401', 'Ưu tiên ngăn chặn lây lan theo runbook ứng cứu sự cố.', '2026-11-15T14:45:00+07'),
  ('5eed0003-0000-4000-8000-000000000610', '5eed0003-0000-4000-8000-000000000505', '5eed0003-0000-4000-8000-000000000302', '5eed0003-0000-4000-8000-000000000404', 'Khôi phục chậm nhưng an toàn hơn cho dữ liệu khách hàng.', '2026-11-15T15:05:00+07'),
  ('5eed0003-0000-4000-8000-000000000611', '5eed0003-0000-4000-8000-000000000506', '5eed0003-0000-4000-8000-000000000301', '5eed0003-0000-4000-8000-000000000402', NULL, '2026-11-17T15:02:00+07'),
  ('5eed0003-0000-4000-8000-000000000612', '5eed0003-0000-4000-8000-000000000506', '5eed0003-0000-4000-8000-000000000303', '5eed0003-0000-4000-8000-000000000407', NULL, '2026-11-17T15:08:00+07'),
  ('5eed0003-0000-4000-8000-000000000613', '5eed0003-0000-4000-8000-000000000507', '5eed0003-0000-4000-8000-000000000301', '5eed0003-0000-4000-8000-000000000401', 'Cô lập là bước đầu tiên trong mọi quy trình ứng cứu ransomware.', '2026-11-16T16:25:00+07'),
  ('5eed0003-0000-4000-8000-000000000614', '5eed0003-0000-4000-8000-000000000507', '5eed0003-0000-4000-8000-000000000302', '5eed0003-0000-4000-8000-000000000404', 'Cần xác minh bản sao lưu sạch trước khi mở lại dịch vụ.', '2026-11-16T16:40:00+07'),
  ('5eed0003-0000-4000-8000-000000000615', '5eed0003-0000-4000-8000-000000000508', '5eed0003-0000-4000-8000-000000000301', '5eed0003-0000-4000-8000-000000000401', NULL, '2026-11-19T19:15:00+07')
ON CONFLICT DO NOTHING;

-- 7. Review Study submissions: pending, reviewed (fixture student, for the reflection flow of PR #69), reflected.
INSERT INTO review_study_submissions (id, student_id, case_id, student_analysis, proposed_solution, reasoning_text,
                                      submission_status, reflection_text, reflection_status, reflection_submitted_at, submitted_at, updated_at)
SELECT v.id::uuid, COALESCE(v.student::uuid, r.student_id), '5eed0003-0000-4000-8000-000000000202', v.analysis, v.solution, v.reasoning,
       v.status, v.reflection, v.reflection_status, v.reflected_at::timestamptz, v.submitted_at::timestamptz, COALESCE(v.reflected_at, v.submitted_at)::timestamptz
FROM seed_ref r, (VALUES
  ('5eed0003-0000-4000-8000-000000000701', '5eed0003-0000-4000-8000-000000000103',
   'Mô hình hiện tại tin cậy mọi thiết bị trong mạng nội bộ, nên một tài khoản VPN bị lộ đủ để đi sâu vào hệ thống.',
   'Tháng 1–2: bật xác thực đa yếu tố và kiểm tra thiết bị cho mọi truy cập quản trị. Tháng 3–4: phân đoạn mạng theo nhóm dịch vụ. Tháng 5–6: áp dụng đặc quyền tối thiểu và giám sát liên tục.',
   'Bắt đầu từ tài khoản quản trị vì đây là điểm bị khai thác; phân đoạn mạng giới hạn phạm vi ảnh hưởng nếu một tài khoản khác bị lộ.',
   'SUBMITTED', NULL, 'NOT_STARTED', NULL, '2026-11-17T20:30:00+07'),
  ('5eed0003-0000-4000-8000-000000000702', NULL,
   'Sự cố cho thấy ranh giới mạng không còn là lớp bảo vệ đủ tin cậy.',
   'Triển khai theo ba giai đoạn: định danh và MFA, phân đoạn vi mô cho core banking, rồi chính sách truy cập theo ngữ cảnh.',
   'Ba giai đoạn giúp ngân hàng kiểm soát rủi ro gián đoạn giao dịch và đo được hiệu quả sau mỗi bước.',
   'REVIEWED', NULL, 'NOT_STARTED', NULL, '2026-11-16T10:15:00+07'),
  ('5eed0003-0000-4000-8000-000000000703', '5eed0003-0000-4000-8000-000000000102',
   'Tài khoản quản trị được dùng chung và không có giám sát hành vi.',
   'Tách tài khoản quản trị riêng, cấp quyền theo phiên, ghi nhật ký và cảnh báo khi truy cập bất thường.',
   'Giảm thời gian tồn tại của đặc quyền làm giảm giá trị của một tài khoản bị đánh cắp.',
   'REFLECTED', 'Nhận xét giúp tôi thấy lộ trình cần tính đến đào tạo nhân viên vận hành, không chỉ công nghệ.', 'SUBMITTED', '2026-11-19T21:00:00+07', '2026-11-14T16:00:00+07'),
  ('5eed0003-0000-4000-8000-000000000704', '5eed0003-0000-4000-8000-000000000106',
   NULL,
   'Ưu tiên giám sát liên tục và đánh giá rủi ro thiết bị trước khi cấp quyền vào hệ thống thanh toán.',
   'Giám sát liên tục phát hiện sớm hành vi bất thường mà xác thực một lần không thấy được.',
   'SUBMITTED', NULL, 'NOT_STARTED', NULL, '2026-11-19T11:20:00+07')
) AS v(id, student, analysis, solution, reasoning, status, reflection, reflection_status, reflected_at, submitted_at)
ON CONFLICT DO NOTHING;

-- 8. Qualitative lecturer feedback (one per target; no score, grade or ranking: FND §6.1.2).
INSERT INTO lecturer_feedback (id, lecturer_id, branching_attempt_id, review_submission_id, feedback_text, created_at, updated_at)
SELECT v.id::uuid, r.lecturer_id, v.attempt::uuid, v.submission::uuid, v.text, v.at::timestamptz, v.at::timestamptz
FROM seed_ref r, (VALUES
  ('5eed0003-0000-4000-8000-000000000801', '5eed0003-0000-4000-8000-000000000505', NULL,
   'Em xác định đúng ưu tiên ngăn chặn lây lan. Hãy nói rõ hơn em sẽ kiểm tra bản sao lưu sạch bằng cách nào trước khi khôi phục.', '2026-11-15T18:00:00+07'),
  ('5eed0003-0000-4000-8000-000000000802', '5eed0003-0000-4000-8000-000000000507', NULL,
   'Lập luận cân nhắc giữa thời gian gián đoạn và toàn vẹn dữ liệu rất rõ. Em thử nghĩ thêm cách thông báo cho khách hàng trong giai đoạn khôi phục.', '2026-11-16T19:00:00+07'),
  ('5eed0003-0000-4000-8000-000000000803', NULL, '5eed0003-0000-4000-8000-000000000702',
   'Lộ trình ba giai đoạn hợp lý. Em nên nêu tiêu chí để biết khi nào chuyển sang giai đoạn tiếp theo và ai chịu trách nhiệm từng bước.', '2026-11-17T09:00:00+07'),
  ('5eed0003-0000-4000-8000-000000000804', NULL, '5eed0003-0000-4000-8000-000000000703',
   'Ý tưởng cấp quyền theo phiên đi đúng hướng Zero Trust. Em cân nhắc thêm tác động lên đội vận hành và kế hoạch đào tạo.', '2026-11-15T08:30:00+07')
) AS v(id, attempt, submission, text, at)
ON CONFLICT DO NOTHING;
