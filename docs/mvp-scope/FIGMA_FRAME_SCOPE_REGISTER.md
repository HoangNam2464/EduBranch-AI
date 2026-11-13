# Figma Frame Scope Register

> **Trạng thái**: `DRAFT — CHỜ PROJECT OWNER PHÊ DUYỆT` · Ngày: 2026-11-01
> **File**: `6CtSgJPKo4jCIbB7WwCaWw`. Inventory đọc trực tiếp bằng Plugin API (chỉ đọc, không chỉnh sửa).
> **Không có frame nào được đánh dấu Ready for Development trong tài liệu này.** Cột "Đề xuất trạng thái" chỉ là khuyến nghị.

**Chú giải "Đề xuất trạng thái":**
- `CANDIDATE` — thuộc chức năng CONFIRMED/IMPLIED. Có thể Ready for Dev **sau khi** chốt D-01/D-02 và hoàn thiện các trạng thái còn thiếu.
- `REFERENCE (OPD-xxx)` — giữ làm phương án tham khảo. Không Ready cho đến khi OPD được duyệt.
- `PHASE 2 AREA` — đề xuất chuyển sang khu vực Phase 2 **khi PO đồng ý** (chưa di chuyển).
- `NO BASIS` — không tìm thấy nguồn yêu cầu. Cần PO xác nhận giữ hay bỏ.
- `CLEANUP` — node rác hoặc đã bị thay thế, không phải màn hình.

Mapping đầy đủ Frame → Feature → Task → FE/BE/DB/QA nằm ở `FEATURE_HIERARCHY_AND_BACKLOG_MAPPING.md §3`.

---

## 1. Page 2 — bộ bám `05_FIGMA.md` (34 frame, tiếng Anh, 100% fill gắn variable, 0 component instance)

| Section | Frame ID | Tên | `05_FIGMA` | Route | Phân loại scope | Đề xuất trạng thái |
|---|---|---|---|---|---|---|
| 00 | 1:5873 | 00.1 Application Sitemap & Flow | DES-001 Frame 00.1 | — (15 routes) | CONFIRMED | CANDIDATE |
| 00 | 1:5988 | 00.2 Product Landing | DES-001 Frame 00.2 | `/` | IMPLIED (DES-001) | CANDIDATE |
| 00 | 1:6113 | 00.3 Sign In (có biến thể lỗi) | DES-001 Frame 00.3 | `/login` | CONFIRMED | CANDIDATE |
| 00 | 1:6144 | 00.4 Register (1 form + role) | DES-001 Frame 00.3/00.4 | `/register` | CONFIRMED | CANDIDATE (chờ OPD-008 cho phần thông báo GV) |
| 00 | 1:6187 | 00.5 Courses & Lecturer Shell | DES-001 Frame 00.5 | `/lecturer/courses` | CONFIRMED | CANDIDATE |
| 00 | 1:6291 | 00.6 Course Create / Delete Modal | DES-001 Frame 00.5 | modal | CONFIRMED (create); HOLD copy xóa (OPD-014) | CANDIDATE + REFERENCE (OPD-014) |
| 00 | 1:6341 | 00.7 Student Shell & Direct Entry | DES-001 Frame 00.6 | `/student/cases/:id/...` | IMPLIED | CANDIDATE |
| 01 | 1:6387 | 01.1 Tokens, Components & States | DES-002 Set 01.1 | — | CONFIRMED | CANDIDATE |
| 01 | 1:6701 | 01.2 Loading Skeleton | DES-002 Frame 01.2 | — | CONFIRMED | CANDIDATE |
| 01 | 1:6793 | 01.3 Empty Courses | DES-002 Frame 01.3 | — | CONFIRMED | CANDIDATE |
| 01 | 1:6852 | 01.4 Error & Retry | DES-002 Frame 01.4 | — | CONFIRMED | CANDIDATE |
| 01 | 1:6911 | 01.5 403 / 404 | DES-002 Frame 01.4 | `*` | CONFIRMED | CANDIDATE |
| 02 | 1:6942 | 02.1 Teaching Materials | DES-003 | `/lecturer/courses/:courseId/materials` | CONFIRMED | CANDIDATE |
| 02 | 1:7090 | 02.2 Upload Modal | DES-003 | modal | CONFIRMED | CANDIDATE |
| 02 | 1:7263 | 02.3 Ingestion Statuses & Recovery | DES-004 Set 02.3/Frame 02.4 | idem | CONFIRMED | CANDIDATE |
| 02 | 1:7386 | 02.4 RAG Source Inspector | DES-005 Frame 02.5 | drawer | CONFIRMED | CANDIDATE |
| 03 | 1:7568 | 03.1 Cases | DES-006 Frame 03.1 | `/lecturer/courses/:courseId/cases` | CONFIRMED; nút "Create Manual" là HOLD (D-07) | CANDIDATE |
| 03 | 1:7745 | 03.2 AI Generation Configuration (modal) | DES-006 Frame 03.2 | modal | CONFIRMED (chức năng); hình thức theo OPD-006 | REFERENCE (OPD-006) |
| 03 | 1:7974 | 03.3 Generation Progress | DES-006 Frame 03.3 | modal | CONFIRMED | REFERENCE (OPD-006) |
| 03 | 1:8190 | 03.4 Branching Case Review | DES-007/008 | `/lecturer/cases/:caseId/review` | CONFIRMED | CANDIDATE |
| 03 | 1:8399 | 03.5 Review Study Case Editor | DES-008 (P1 §4 variant) | idem | CONFIRMED | CANDIDATE |
| 03 | 1:8484 | 03.6 Governance & Publish | DES-009 | action bar + modal | CONFIRMED; variant Published/Unpublish là HOLD | CANDIDATE + REFERENCE (OPD-007) |
| 04 | 1:8652 | 04.1 Active Decision Point | DES-010 | `/student/cases/:caseId/branching-play` | CONFIRMED | CANDIDATE |
| 04 | 1:8703 | 04.2 Terminal Outcome | DES-010 | idem | CONFIRMED | CANDIDATE |
| 04 | 1:8745 | 04.3 Journey Review | DES-011 Frame 04.3 | `/student/cases/:caseId/attempt/:attemptId/review` | CONFIRMED | CANDIDATE (chờ OPD-002 cho cảnh báo) |
| 04 | 1:8832 | 04.4 Reflection & Retry | DES-012 | `…/reflect` | CONFIRMED | CANDIDATE (dòng feedback: OPD-009) |
| 04 | 1:8884 | 04.5 New Attempt Confirmation | DES-012 AC-1 | modal | CONFIRMED | CANDIDATE (OPD-003/004) |
| 05 | 1:8950 | 05.1 Review Study Workspace | DES-013 | `/student/cases/:caseId/review-study` | CONFIRMED | CANDIDATE |
| 05 | 1:8995 | 05.2 Review Submitted | DES-013 (P4 already-submitted) | idem | CONFIRMED | CANDIDATE |
| 05 | 1:9043 | 05.3 Lecturer Feedback | DES-014 Frame 05.3 | `/lecturer/cases/:caseId/feedback` | CONFIRMED | CANDIDATE |
| 05 | 1:9162 | 05.4 Student Feedback & Reflection | DES-014 Frame 05.4 | `…/review-study/:submissionId/feedback` | CONFIRMED | CANDIDATE |
| 05 | 1:9213 | 05.5 Lecturer Statistics | DES-014 Frame 05.5 | `/lecturer/statistics` | CONFIRMED | CANDIDATE |
| 05 | 1:9357 | 05.6 Challenge Round 1 | DES-015 | `/student/cases/:caseId/challenge/:sessionId` | CONFIRMED (chức năng) | REFERENCE (OPD-005) |
| 05 | 1:9408 | 05.7 Challenge Completed | DES-015 | idem | CONFIRMED | REFERENCE (OPD-005) |

**Nhận xét Page 2**: phủ đủ 15 routes và 15 task DES. Không chứa chức năng ngoài phạm vi. Fill đã gắn variable, nhưng **chưa dùng component instance** (0 instance). Nếu chọn Page 2 làm baseline thì cần thay các khối vẽ tay bằng component trên page "01 · Design System".

---

## 2. Page 1 — bộ do PO vẽ (tiếng Việt), đã chuẩn hóa token/component ngày 2026-11-01

### 2.1. Auth & Email
| Frame ID | Tên | Phân loại | Vấn đề cụ thể | Đề xuất trạng thái |
|---|---|---|---|---|
| 1:2 | Đăng nhập · Mặc định | CONFIRMED | Nút Google/Microsoft: MVP từ 2026-11-12 (PSD-09) | CANDIDATE |
| 1:52 | Đăng ký · Sinh viên | CONFIRMED (đăng ký) | Nút Google/Microsoft (MVP từ 2026-11-12); trường MSSV (UNKNOWN); tách 2 form trái P0 §3 | CANDIDATE có điều kiện (D-04) |
| 1:122 | Đăng ký · Giảng viên | CONFIRMED (đăng ký) | Nút Google/Microsoft (MVP từ 2026-11-12); trường Khoa (UNKNOWN); thông báo xác minh (OPD-008) | REFERENCE (OPD-008) |
| 1:196, 1:223 | Quên mật khẩu · Nhập email / Đã gửi | PHASE 2 | `01_MASTER-TASKS §4.6` | PHASE 2 AREA |
| 1:250, 1:279 | Mật khẩu mới · Biểu mẫu / Thành công | PHASE 2 | idem | PHASE 2 AREA |
| 26:78 | Email · Hướng dẫn đặt lại mật khẩu | PHASE 2 | idem | PHASE 2 AREA |
| 26:148 | Email · Kích hoạt tài khoản | PROPOSED | Không có nguồn yêu cầu | NO BASIS |
| — | (không có) Landing `/` | IMPLIED | Page 1 **thiếu** | — |
| — | (không có) 403/404/Loading/Empty/Error | CONFIRMED | Page 1 **thiếu frame riêng** | — |

### 2.2. Student
| Frame ID | Tên | Phân loại | Vấn đề cụ thể | Đề xuất trạng thái |
|---|---|---|---|---|
| 1:972 | Giới thiệu tình huống | IMPLIED | "Hạn nộp" (D-03); "Tiếp tục làm dở" (OPD-003) | CANDIDATE có điều kiện |
| 1:906 | Tình huống · Đã chọn phương án | CONFIRMED | Hiển thị **"ĐIỂM QUYẾT ĐỊNH 1 / 3"**, trái P2 §1 (*"Decision 2 of ?" — not a percentage bar, since branch length is variable and unknown*); bố cục 2 cột, chưa dùng Option Card | CANDIDATE sau khi sửa |
| 1:880 | Kết thúc hành trình | CONFIRMED | — | CANDIDATE |
| 1:619 | Journey Review | CONFIRMED | Khối Challenge inline (OPD-005) | CANDIDATE + REFERENCE (OPD-005) |
| 27:321 | AI Challenge Support (Modal) | CONFIRMED (chức năng) | Dạng modal, trái route trang riêng của SITE-ARCH | REFERENCE (OPD-005) |
| 1:545, 1:466 | Biểu mẫu suy ngẫm / Đã nộp | CONFIRMED | — | CANDIDATE |
| 1:790 | Lịch sử lần làm bài | CONFIRMED (DES-012) | Cột "Phản hồi giảng viên" (OPD-009) | CANDIDATE |
| 1:384, 1:297 | Review Study form / đã phản hồi | CONFIRMED | — | CANDIDATE |
| 1:1305 | Bàn học (page 08 `07.2`) | **MVP** (OPD-001 → A, 2026-11-12) | Thiếu task; P0 §1 cần sửa | CANDIDATE |
| 1:1202 | Khóa học của tôi (page 08 `07.3`) | **MVP** (OPD-001 → A, 2026-11-12) | idem | CANDIDATE |
| 1:1084 | Tham gia lớp học (page 08 `07.4`) | **MVP** (OPD-001 → A, 2026-11-12) | Thiếu task và bảng `course_enrollments` | CANDIDATE |

> Lưu ý: tiền tố `[Ngoài phạm vi]` được thêm trong phiên làm việc trước theo nhận định chưa đủ căn cứ. Theo phân tích này, nhãn đúng phải là **"[HOLD · OPD-001]"**. Chưa sửa tên frame.

### 2.3. Lecturer
| Frame ID | Tên | Phân loại | Vấn đề cụ thể | Đề xuất trạng thái |
|---|---|---|---|---|
| 1:3490 | Tổng quan | PROPOSED | Bản tham chiếu. D-05 chốt có dashboard 2026-11-12 → bản dùng là `34:3183` (page 08 `07.1`) | REFERENCE |
| 34:3183 | Lecturer Dashboard — Revision 01 (page 08 `07.1`) | **MVP** (D-05 → có, 2026-11-12) | Thiếu task | CANDIDATE |
| 1:2431 | Quản lý khóa học | CONFIRMED | Dòng "Mã mời tham gia lớp" (OPD-001) | CANDIDATE sau khi tách phần mã mời |
| 1:1465 | Hộp thoại khởi tạo khóa học | CONFIRMED | Câu "tự động cấp mã lớp" (OPD-001) | idem |
| 1:2258 | Chi tiết khóa học — Tài liệu | CONFIRMED | "Mã mời: SEC7A2" (OPD-001); **chưa đủ 4 trạng thái + Retry** (DES-004 AC-1/2) | CANDIDATE sau khi hoàn thiện |
| 29:1106 | Xác nhận xóa tài liệu | CONFIRMED | — | CANDIDATE |
| 16:6 | RAG Source Inspector | CONFIRMED | — | CANDIDATE |
| 1:2583 | Quản lý Case Study | CONFIRMED | "Nhân bản · Lưu trữ" (OPD-007/014); "Hạn nộp" (D-03) | CANDIDATE có điều kiện |
| 1:3088, 1:2939, 1:2818 | AI Studio 3 bước | CONFIRMED (chức năng) | Wizard thay modal — **OPD-006 chốt wizard 2026-11-12** (page 08 `07.5`–`07.7`); cần đổi tên/AC DES-006 | CANDIDATE |
| 1:3219 | Trình chỉnh sửa Case Study | CONFIRMED | Chưa gắn Stepper (DES-009); **"AI gợi ý / Tạo lại phần này bằng AI" trái P1 §4 Boundary**; câu "Sinh viên bắt buộc… 2 vòng phản biện AI" trái FR-BS-07; checkbox pivotal (D-06); version pill (OPD-007) | CANDIDATE sau khi sửa |
| 1:1444 | Hộp thoại phê duyệt và xuất bản | CONFIRMED | Trường deadline (D-03); checkbox "Gửi thông báo in-app và email" (PHASE 2) | CANDIDATE sau khi bỏ checkbox thông báo |
| 1:1852 | Hàng đợi Review và phản hồi | CONFIRMED | MSSV (D-04) | CANDIDATE |
| 1:1702 | Chi tiết phản hồi lập luận | CONFIRMED | Thẻ "Gợi ý phân tích từ AI" trái P3 §2 Boundary (OPD-010) | CANDIDATE sau khi tách thẻ AI |
| 1:1493 | Thống kê luồng học tập | CONFIRMED | "Xuất dữ liệu CSV" (OPD-011); "Cần nhắc nhở hạn nộp" (PHASE 2) | CANDIDATE có điều kiện |
| 1:2081 | Rubric nghiên cứu (page 08 `07.8`) | **MVP** (OPD-011 → A, 2026-11-12) | Thiếu task | CANDIDATE |

### 2.4. Admin (toàn bộ phụ thuộc OPD-015)

> **Cập nhật 2026-11-12 (PO):** OPD-015 đã quyết phương án B. Admin thuộc MVP với đủ 10 màn; thiết kế mới ở page 08, section `10 · Admin`. Màn Cấu hình dịch vụ AI (`1:5543`) chỉ để xem (OPD-013). `1:4511` chuyển MVP khi OPD-011 chốt A (2026-11-12). Bảng dưới là trạng thái trước quyết định, giữ để đối chiếu; trạng thái hiện hành xem `MVP_SCOPE_AND_FIGMA_FRAME_REGISTER.md`.
| Frame ID | Tên | Phân loại | Đề xuất trạng thái |
|---|---|---|---|
| 1:4477 | Admin · Đăng nhập | PROPOSED (`/login` dùng chung) | NO BASIS |
| 1:3715 | Admin · Bảng điều khiển | PROPOSED | REFERENCE (OPD-015) |
| 1:4025 | Admin · Quản lý người dùng | HOLD | REFERENCE (OPD-015, OPD-008) |
| 30:1864 | Admin · Xác nhận khóa người dùng | HOLD | REFERENCE (OPD-015) |
| 1:4795 | Admin · Quản lý khóa học | HOLD | REFERENCE (OPD-015, OPD-014) |
| 1:5043 | Admin · Quản lý Case Study | PROPOSED | REFERENCE (OPD-015) |
| 1:5543 | Admin · Cấu hình dịch vụ AI | HOLD | REFERENCE (OPD-013, OPD-015) |
| 1:4511 | Admin · Nghiên cứu và Rubric (page 08 `10.8`) | **MVP** (OPD-011 → A, OPD-015 → B, 2026-11-12) | CANDIDATE |
| 1:5302 | Admin · Nhật ký hệ thống | HOLD | REFERENCE (OPD-015) |
| 1:4345 | Admin · Cài đặt hệ thống | PHASE 2 / PROPOSED | NO BASIS |

### 2.5. Node không phải màn hình
| Node ID | Tên | Đề xuất |
|---|---|---|
| 29:18 | [Đã thay bằng component App Sidebar] Thanh điều hướng GV | CLEANUP |
| 30:1127 | Vector (rời) | CLEANUP |
| 81:2036 | Badge · Đã có phản hồi (instance rời) | CLEANUP |

---

## 3. So sánh hai baseline ứng viên (đầu vào cho D-01)

| Tiêu chí | Page 1 | Page 2 |
|---|---|---|
| Bám `05_FIGMA` / sitemap 15 routes | Một phần. Có 20+ frame ngoài sitemap. | 1-1 |
| Ngôn ngữ (rule `01-ui-design-standards §7`) | Tiếng Việt, trái rule hiện hành | Tiếng Anh, đúng rule |
| Chứa chức năng HOLD / PHASE 2 / NO BASIS | Nhiều (Google, mã mời, Admin, AI hint, rubric, reset password…) | Không |
| Trạng thái chung (403/404/Loading/Empty/Error) | Thiếu | Đủ |
| Landing `/` | Thiếu | Có |
| DES-004 đủ 4 trạng thái + Retry | Thiếu | Đủ (02.3) |
| DES-009 stepper 4 variant | Thiếu trên editor | Đủ (03.6) |
| Dùng component từ Design System | Có (đã chuẩn hóa) | Chưa (0 instance) |
| Mức đầu tư của PO | Cao (PO tự vẽ, đã chọn "Giữ và chuẩn hóa") | Thấp |

**Khuyến nghị (cần PO xác nhận):** dùng **Page 2 làm khung baseline**, vì nó truy xuất 1-1 về backlog và sitemap. Lấy từ Page 1 các màn PO muốn giữ **chỉ khi** chức năng tương ứng đã CONFIRMED, rồi đổi sang ngôn ngữ đã chọn ở D-02. Mọi frame HOLD trên cả hai page giữ làm REFERENCE.
