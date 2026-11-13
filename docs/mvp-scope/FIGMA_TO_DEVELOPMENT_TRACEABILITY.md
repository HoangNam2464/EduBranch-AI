# Figma-to-Development Traceability

> **Status**: Draft — chờ Project Owner duyệt · **Ngày**: 2026-11-03 · Đi kèm `MVP_SCOPE_AND_FIGMA_FRAME_REGISTER.md`.
> **Figma**: file `6CtSgJPKo4jCIbB7WwCaWw`, page `Page 1` (`0:1`). Mọi node ID dưới đây đã đọc lại bằng `get_metadata` ngày 2026-11-03.
> **Story Points**: lấy nguyên văn từ `docs/01_MASTER-TASKS.md §2`. Không tự tạo task hay SP.
> **API**: chỉ ghi route **thật sự có trong code** (`backend/src/**/*.controller.ts` tại `02028b2`, prefix `/api/v1`). Route có trong code **không chứng minh** tính năng chạy đúng (nguyên tắc tam phân, `01_MASTER-TASKS §5`). Chỗ chưa có route ghi `CHƯA CÓ ROUTE — hợp đồng API chưa chốt`, không tự đặt tên route.
> **DB**: chỉ ghi bảng/cột có trong `backend/migrations/V1..V4`.

## 1. Bảng theo module (FE / BE / DB / QA)

| Mã | Module | Vai trò | Yêu cầu (Proposal V1.2) | Task & SP | FE | BE / API (route trong code) | DB | QA |
|---|---|---|---|---|---|---|---|---|
| M1 | Xác thực & vai trò | Giảng viên, Sinh viên | ¶129 Account and role management (Lecturer / Student) | DES-001 (3), DES-002 (5), FE-001 (5), FE-002 (3), BE-001 (5), BE-002 (5), QA-001 (3), QA-002 (5) | Form đăng nhập/đăng ký, chọn vai trò, validation; route guard; trang 403/404; hết phiên quay về `/login` | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `GET /users/me` | `users` (`role`, `is_active`) | QA-001, QA-002 |
| M2 | Khóa học | Giảng viên | ¶130 | BE-003 (5); FE-002 (3, dùng chung) | Danh sách thẻ, tạo, xóa; trạng thái trống/lỗi/đang tải | `POST/GET /courses`, `GET/PUT/DELETE /courses/:courseId` | `courses` | QA-001 |
| M3 | Tài liệu & xử lý | Giảng viên | ¶130, ¶131 | DES-003 (3), DES-004 (3), FE-003 (3), FE-004 (5), FE-005 (3), BE-005 (3), OPS-002 (3), BE-013 (2), QA-003 (3), QA-004 (5) | Modal tải lên (PDF/DOCX, ≤50 MB), bảng có 4 trạng thái, xóa, thử lại; lọc phía client (`01_MASTER-TASKS §4.5`) | `POST /courses/:courseId/materials`, `GET /courses/:courseId/materials`, `GET /materials/:id`. **Xóa tài liệu và thử lại: CHƯA CÓ ROUTE** | `teaching_materials` | QA-003, QA-004 |
| M4 | RAG & nguồn trích dẫn | Giảng viên | ¶131 | DES-005 (3), FE-006 (3), BE-007 (5), BE-008 (3), BE-009 (3), BE-010 (5), OPS-003 (5), BE-012 (5), QA-005 (5), QA-006 (5) | Drawer xem đoạn trích (không lộ vector, prompt) | **Đọc đoạn trích: CHƯA CÓ ROUTE** | `document_chunks` | QA-005, QA-006 |
| M5 | Sinh case bằng AI | Giảng viên | ¶107, ¶131 | DES-006 (3), FE-007 (3), BE-014 (5), BE-015 (5), QA-007 (3) | Cấu hình sinh case (**wizard 3 bước**, OPD-006 chốt 2026-11-12), hộp thoại tiến trình, toast lỗi | `POST /cases/generate`, `GET /courses/:courseId/cases` | `cases`, `case_nodes`, `case_options` | QA-007 |
| M6 | Kiểm duyệt & xuất bản | Giảng viên | ¶108, ¶132 | DES-007 (5), DES-008 (3), DES-009 (3), FE-008 (5), FE-009 (5), FE-010 (5), FE-011 (3), BE-016 (5), BE-017 (5), BE-018 (5), BE-019 (3), QA-008 (5), QA-009 (5), QA-010 (5) | Trình chỉnh sửa Branching/Review Study, kiểm tra cây, thanh vòng đời 4 trạng thái, hộp thoại xuất bản + sao chép đường dẫn | `GET/PUT /cases/:id`, `PATCH /cases/:id/status`. **CRUD node/option riêng (BE-017): CHƯA CÓ ROUTE** | `cases` (`status`, `version`), `case_nodes`, `case_options` | QA-008, QA-009, QA-010 |
| M7 | Branching Case Player | Sinh viên | ¶109, ¶133 | DES-010 (3), FE-012 (5), FE-013 (3), BE-020 (5), BE-021 (5), BE-022 (3), QA-011 (5), QA-012 (3) | Giới thiệu case, điểm quyết định, kết thúc; không có hệ quả/lập luận giữa các bước | `POST /cases/:caseId/branching-attempts`, `GET /branching-attempts/:id`, `POST /branching-attempts/:id/step` | `branching_attempts`, `student_reasoning` | QA-011, QA-012 |
| M8 | Journey Review & lập luận | Sinh viên | ¶110, ¶112, ¶136 | DES-011 (5), FE-014 (5), FE-015 (3), BE-023 (5), BE-024 (3) | Dòng thời gian, mở hệ quả, ô lập luận cho quyết định then chốt (PO-26) | `PUT /branching-attempts/:id/reasoning`, `GET /branching-attempts/:attemptId/reasonings`, `GET /reasoning/:id`. **API dựng dữ liệu Journey Review (BE-023): CHƯA CÓ ROUTE riêng** | `student_reasoning` | QA-011 |
| M9 | Suy ngẫm, làm lại, lịch sử lượt | Sinh viên | ¶110, ¶134 | DES-012 (2), FE-016 (3), FE-017 (3), QA-013 (3); BE-024 (dùng chung) | Biểu mẫu suy ngẫm, xác nhận lượt mới, danh sách lượt | `POST /branching-attempts/:id/reflection`, `GET /cases/:caseId/attempts` | `branching_attempts` (`attempt_number`, các cột reflection) | QA-013 |
| M10 | Review Study | Sinh viên | ¶111, ¶135 | DES-013 (3), FE-018 (5), FE-020 (3), BE-025 (5) | Biểu mẫu, chỉ đọc sau khi nộp, xem nhận xét, phản tư | **CHƯA CÓ ROUTE** (controller `review-study` là stub) | `review_study_submissions` | QA-014 |
| M11 | Phản hồi của giảng viên | Giảng viên | ¶138 | DES-014 (3), FE-019 (5), BE-026 (5), QA-014 (5) | Hàng đợi, chi tiết, gửi nhận xét định tính, không có ô điểm | **CHƯA CÓ ROUTE** (controller `lecturer-feedback` là stub) | `lecturer_feedback` | QA-014 |
| M12 | AI Challenge Support | Sinh viên | ¶113, ¶137 | DES-015 (3), FE-021 (5), BE-027 (5), QA-015 (3) | Tối đa 2 vòng, không chấm điểm (**hình thức chờ OPD-005**) | **CHƯA CÓ ROUTE** (controller `challenge-support` là stub) | `challenge_support_sessions`, `challenge_messages` | QA-015 |
| M13 | Thống kê luồng học tập | Giảng viên | ¶114, ¶139 | FE-022 (3), BE-028 (5). **Không có task DES riêng** — `05_FIGMA.md §1.5` gom vào DES-001 (tài liệu chưa duyệt) | 5 chỉ số, không xếp hạng | **CHƯA CÓ ROUTE** (controller `statistics` là stub) | Tổng hợp từ `branching_attempts`, `student_reasoning`, `review_study_submissions` | Không có task QA riêng; QA-016 kiểm xuyên vai trò |
| X | Phát hành | — | — | QA-016 (5), QA-017 (5), QA-018 (3), QA-019 (3) | — | — | — | E2E, UAT, WCAG 2.1 AA, release |

**Tương tác chỉ ở phía client, không cần API mới**: lọc danh sách tài liệu và bài nộp (`01_MASTER-TASKS §4.5`), kiểm tra loại và kích thước tệp trước khi tải lên, đóng/mở drawer và modal, chuyển tab, sao chép đường dẫn case vào clipboard, đếm ký tự trong ô lập luận. Dữ liệu hiển thị đều lấy từ các route ở bảng trên.

## 2. Bảng theo frame MVP (38 frame)

Page: `Page 1` cho tất cả. Trạng thái: MVP cho tất cả (chưa Ready for Dev). FE/BE/DB/QA: xem module tương ứng ở §1.

| Node | Frame | Module | Vai trò | Task (SP) chính | Phần tử chặn bàn giao |
|---|---|---|---|---|---|
| `91:2601` | 00.1 · Sơ đồ ứng dụng | M1 (IA) | Tất cả | DES-001 (3) | Câu "vào case qua đường dẫn trực tiếp" cần sửa theo OPD-001 → A (2026-11-12) |
| `90:2572` | 00.2 · Trang giới thiệu | M1 | Công khai | DES-001 (3) | — |
| `1:2` | 00.3 · Đăng nhập | M1 | Công khai | FE-002 (3), BE-001 (5) | Google/Microsoft: MVP (PO 2026-11-12, chưa có task); Quên mật khẩu (Phase 2) |
| `1:52` | 00.4 · Đăng ký · Sinh viên | M1 | Công khai | FE-002 (3), BE-001 (5) | Google/Microsoft: MVP (PO 2026-11-12, chưa có task) |
| `1:122` | 00.5 · Đăng ký · Giảng viên | M1 | Công khai | FE-002 (3), BE-001 (5) | Google/Microsoft: MVP (PO 2026-11-12, chưa có task); thông báo kích hoạt (OPD-008) |
| `86:2446` | 01.1 · Đang tải | M1/M2 | Giảng viên | DES-002 (5) | Mã tham gia (giữ, OPD-001 chốt A 2026-11-12) |
| `86:2107` | 01.2 · Trống | M1/M2 | Giảng viên | DES-002 (5) | idem |
| `86:2277` | 01.3 · Lỗi | M1/M2 | Giảng viên | DES-002 (5) | idem |
| `86:2630` | 01.4 · 403 | M1 | Tất cả | DES-002 (5), QA-002 (5) | — |
| `86:2656` | 01.5 · 404 | M1 | Tất cả | DES-002 (5), FE-002 (3) | — |
| `1:2431` | 02.1 · Quản lý khóa học | M2 | Giảng viên | BE-003 (5) | Mã tham gia (giữ, OPD-001 chốt A 2026-11-12) |
| `1:1465` | 02.2 · Tạo khóa học | M2 | Giảng viên | BE-003 (5) | Cần xác minh trường mã lớp |
| `86:2682` | 02.3 · Xóa khóa học | M2 | Giảng viên | BE-003 (5) | Nội dung xóa (OPD-014) |
| `1:2258` | 02.4 · Tài liệu môn học | M3 | Giảng viên | DES-003 (3), DES-004 (3), FE-004 (5) | Nút Mã mời (giữ, OPD-001 chốt A 2026-11-12) |
| `87:2306` | 02.5 · Tải tài liệu | M3 | Giảng viên | FE-003 (3) | — |
| `29:1106` | 02.6 · Xóa tài liệu | M3 | Giảng viên | FE-005 (3) | Route xóa chưa có |
| `16:6` | 02.7 · RAG Source Inspector | M4 | Giảng viên | DES-005 (3), FE-006 (3) | Route đọc đoạn trích chưa có |
| `1:2583` | 03.1 · Quản lý Case Study | M5 | Giảng viên | DES-006 (3), FE-007 (3) | Danh sách xuyên khóa học khác route theo khóa |
| `87:2379` | 03.2 · Đang sinh case | M5 | Giảng viên | FE-007 (3), BE-015 (5) | — |
| `87:2432` | 03.3 · Sinh case thất bại | M5 | Giảng viên | FE-007 (3) | — |
| `1:3219` | 03.4 · Chỉnh sửa Case Study | M6 | Giảng viên | DES-007 (5), DES-008 (3), FE-008 (5), FE-009 (5), FE-010 (5) | CRUD node chưa có route riêng |
| `88:2540` | 03.5 · Chỉnh sửa Review Study | M6 | Giảng viên | FE-009 (5), BE-017 (5) | — |
| `88:2343` | 03.6 · Thanh duyệt 4 trạng thái | M6 | Giảng viên | DES-009 (3), FE-011 (3), BE-018 (5) | Sửa sau xuất bản (OPD-007) |
| `1:1444` | 03.7 · Xuất bản | M6 | Giảng viên | DES-009 (3), FE-011 (3) | — |
| `1:1852` | 04.1 · Hàng đợi Review | M11 | Giảng viên | DES-014 (3), FE-019 (5) | Cột MSSV (D-04) |
| `1:1702` | 04.2 · Chi tiết phản hồi | M11 | Giảng viên | FE-019 (5), BE-026 (5) | Gợi ý AI (OPD-010) |
| `1:1493` | 04.3 · Thống kê | M13 | Giảng viên | FE-022 (3), BE-028 (5) | Xuất CSV (không có nguồn) |
| `1:972` | 05.1 · Giới thiệu tình huống | M7 | Sinh viên | DES-010 (3), FE-012 (5), BE-020 (5) | Tiếp tục làm dở (OPD-003) |
| `1:906` | 05.2 · Điểm quyết định | M7 | Sinh viên | FE-012 (5), BE-021 (5) | Nút xác nhận (chưa có mã); bố cục một/hai cột (PSD-07) |
| `1:880` | 05.3 · Kết thúc hành trình | M7 | Sinh viên | FE-013 (3), BE-022 (3) | — |
| `1:619` | 05.4 · Journey Review | M8 | Sinh viên | DES-011 (5), FE-014 (5), FE-015 (3), BE-023 (5) | OPD-002 (cách xác định quyết định then chốt); OPD-005 (Challenge trong trang) |
| `1:545` | 05.7 · Suy ngẫm | M9 | Sinh viên | FE-017 (3), BE-024 (3) | — |
| `1:466` | 05.8 · Đã nộp suy ngẫm | M9 | Sinh viên | FE-017 (3) | Nút "Về Bàn học" (giữ, OPD-001 chốt A 2026-11-12) |
| `1:790` | 05.9 · Lịch sử lượt | M9 | Sinh viên | DES-012 (2), FE-016 (3), QA-013 (3) | — |
| `86:2712` | 05.10 · Bắt đầu lượt mới | M9 | Sinh viên | FE-016 (3) | Giới hạn lượt (OPD-004) |
| `1:384` | 06.1 · Review Study | M10 | Sinh viên | DES-013 (3), FE-018 (5), BE-025 (5) | `student_analysis` (D4-13); chưa có route |
| `88:2877` | 06.2 · Đã nộp, chờ phản hồi | M10 | Sinh viên | FE-018 (5) | Kiểm lại nhãn badge |
| `1:297` | 06.3 · Đã phản hồi | M10/M11 | Sinh viên | FE-020 (3) | Chưa có route |

## 3. Frame không có yêu cầu hoặc task

| Node | Frame | Tình trạng |
|---|---|---|
| `34:3183`, `1:3490` | Dashboard giảng viên | Không có yêu cầu trong Proposal hay task. Bản gốc lưu trữ. Revision 01 → **MVP** (D-05 chốt 2026-11-12; page 08 `07.1`) — **thiếu task** |
| `1:1305`, `1:1202`, `1:1084` | Màn sinh viên: Bàn học, Khóa học, Tham gia lớp | **MVP** (OPD-001 chốt A 2026-11-12; page 08 `07.2`–`07.4`) — **thiếu task**, chưa có route và bảng `course_enrollments`; P0 §1, P2 §1 cần sửa |
| `1:3088`, `1:2939`, `1:2818` | AI Studio (wizard 3 bước) | **MVP** (OPD-006 chốt wizard 2026-11-12; page 08 `07.5`–`07.7`) — gắn DES-006, FE-007; cần đổi tên/AC DES-006 |
| `26:148` | Email kích hoạt | Không có task. HOLD (OPD-008) |
| 10 frame Admin | — | **MVP** (OPD-015 → B, 2026-11-12; page 08 `10.1`–`10.10`) — không có spec feature, **thiếu task** |
| `1:2081`, `1:4511` | Rubric giảng viên, Admin Nghiên cứu & Rubric | **MVP** (OPD-011 chốt A 2026-11-12; page 08 `07.8`, `10.8`) — Proposal có (¶140), **thiếu task** |
| page 08 `09.1`, `09.2` | Hồ sơ tài khoản giảng viên / sinh viên | **MVP** (PO 2026-11-12) — **thiếu task** |
