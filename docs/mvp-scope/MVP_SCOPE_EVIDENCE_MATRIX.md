# MVP Scope Evidence Matrix — EduBranch AI

> **Trạng thái**: `DRAFT — CHỜ PROJECT OWNER PHÊ DUYỆT`. Đây là tài liệu phân tích, không phải quyết định scope.
> **Ngày rà soát**: 2026-11-01 · **Người rà soát**: Claude (vai trò Product/Business Analyst)
> **Phạm vi bằng chứng**: Proposal V1.2, backlog 84 task, feature specs, `00-project-foundation.md`, OPD/CPD, P0–P4, `05_FIGMA.md`, Figma Page 1 và Page 2, source code, migrations.
> **Không làm**: không sửa Figma, không xóa frame, không sửa backlog/Proposal/code/database.

---

## 0. Thứ bậc nguồn bằng chứng dùng trong tài liệu này

| Cấp | Nguồn | Vị trí | Ghi chú độ tin cậy |
|:-:|---|---|---|
| 1 | **Proposal V1.2** (đã có chữ ký mentor) | `docs/C1SE_65-EduBranch-AI-Proposal_V1.2.docx` (bản text: `scratch/proposal_v1_2_dump.txt`; Context Diagram: `scratch/proposal_v1_2_media/word/media/image2.png`) | Nguồn gốc cao nhất. Viết ở mức chức năng, không có danh sách màn hình. |
| 2 | **Backlog chính thức** | `docs/5.Sprint_Backlog/SPRINT-BACKLOG.md`, `docs/01_MASTER-TASKS.md`, `docs/03_TASK-DETAILS.md` (AC), `docs/05_FIGMA.md` (spec DES), `docs/06_QA.md` | Bất biến (4 sprint / 84 task / 336 SP). `01_MASTER-TASKS.md §4` là **danh sách Post-MVP chính thức duy nhất** tìm thấy. |
| 3 | **Feature specs + rules** | `docs/features/FEATURE-*.md`, `.agents/rules/00-project-foundation.md`, `.agents/rules/feature-*.md`, `.agents/rules/01-ui-design-standards.md` | Mỗi spec có mục `§13 Out of Scope`, đây là bằng chứng loại trừ rõ ràng. |
| 4 | **Design specs** | `docs/design/SITE-ARCHITECTURE.md` (15 routes), `docs/design/screens/P0`–`P4`, `docs/design/GLOBAL-DESIGN-SYSTEM.md` | Sitemap 15 routes là danh sách màn hình được mô tả chính thức. |
| 5 | **OPD/CPD** | `docs/OPEN_PRODUCT_DECISIONS.md` — **chỉ tồn tại trên nhánh `feature/design-system`, CHƯA merge vào `develop`** | Tự ghi là `DRAFT — PENDING STAKEHOLDER REVIEW`. Mọi OPD đang `OPEN / PENDING`. CPD là tổng hợp lại từ cấp 1–3, không phải nguồn mới. |
| 6 | **Figma** | File `6CtSgJPKo4jCIbB7WwCaWw`: Page 1 (52 node, tiếng Việt) và Page 2 (34 frame, tiếng Anh, theo đúng cấu trúc `05_FIGMA`) | OPD §0: *"Visual presence in Figma does not automatically establish or approve a business requirement."* |
| 7 | **Code / DB** | `backend/src/modules/*`, `backend/migrations/V1–V4`, `frontend/src/app/router.tsx` | Chỉ chứng minh **khả năng triển khai hiện tại**, không chứng minh hay bác bỏ requirement. |

**Quy tắc kết luận áp dụng:**
- Thiếu task riêng **không** đủ để xếp PHASE 2 / OUT OF SCOPE.
- Chưa có code **không** đủ để xếp ngoài MVP. Có frame Figma **không** đủ để xếp trong MVP.
- Chỉ xếp **OUT OF SCOPE / PHASE 2** khi có câu chữ loại trừ hoặc hoãn **rõ ràng** trong nguồn cấp 1–4.
- Chỉ xếp **CONFIRMED MVP** khi có ít nhất một nguồn cấp 1 hoặc 2 nêu chức năng đó.

---

## 1. Phát hiện cấp hệ thống (ảnh hưởng toàn bộ kết luận)

| # | Phát hiện | Bằng chứng | Tác động |
|:-:|---|---|---|
| F-1 | **Figma có hai bộ thiết kế song song.** Page 2 có 34 frame tiếng Anh, chia đúng 6 section `00_IA & Sitemap` → `05_Review, Feedback & Socratic`, khớp 1-1 với frame list trong `05_FIGMA.md` (Frame 00.1 → 05.7) và sitemap 15 routes. Page 1 có ~49 frame tiếng Việt do PO vẽ, có thêm nhiều chức năng ngoài sitemap. | Inventory Figma (xem `FIGMA_FRAME_SCOPE_REGISTER.md`) | **Cần PO chọn baseline** (D-01). Các đề xuất trước đây của tôi chỉ xét Page 1 và bỏ qua Page 2. Đó là thiếu sót, đã sửa ở mục 4. |
| F-2 | **Quy tắc ngôn ngữ UI là Academic English.** | `.agents/rules/01-ui-design-standards.md §7.1`: *"Standardize UI labels to clean, concise Academic English across all product components and screens"*; `GLOBAL-DESIGN-SYSTEM.md §3.3` cấm trộn ngôn ngữ | Page 1 (tiếng Việt) mâu thuẫn với rule hiện hành; Page 2 tuân thủ. Ghi chú trong memory làm việc của tôi ("screens use Vietnamese copy") không có căn cứ tài liệu. Cần PO quyết định (D-02). |
| F-3 | **Tài liệu OPD chưa có trên `develop`.** | `git merge-base --is-ancestor feature/design-system develop` → NOT_MERGED | Mọi OPD là phân tích nháp. Không được dùng phương án "Proposed" trong OPD làm căn cứ scope. |
| F-4 | **Mâu thuẫn nội bộ về Admin.** `00-project-foundation.md §1` và migration V3 có role `ADMIN`. `feature-authentication.md` ghi *"Admin/system operator role — not in MVP"*. `SITE-ARCHITECTURE.md §2` ghi *"strictly serves two distinct academic user roles"*. `FEATURE-AUTH-AND-ROLES.md` FR-AUTH-01 chỉ có `LECTURER`/`STUDENT`. | Các file đã dẫn | Chưa đủ căn cứ để kết luận về giao diện Admin → **HOLD** theo OPD-015. |
| F-5 | **BE không trống.** Đã có `auth` (register/login/me, BCrypt, JWT, throttler), `course` CRUD, guards, migrations V1–V4, khung 13 module. QA-001/QA-002 DONE. | `backend/src/modules/*`, `docs/qa/*` | Thông tin "chưa làm BE" chưa chính xác. Auth đã chốt theo email/password. |

---

## 2. Ma trận bằng chứng theo chức năng

Chú thích cột: **P** = Proposal V1.2 · **BL** = backlog task cha · **Spec** = feature spec / design spec · **Fig1/Fig2** = Figma Page 1/2 · **BE/FE/DB/QA** = triển khai hiện tại.

### 2.1. Account, Authentication & Roles

| Chức năng | P | BL | Spec / AC | Fig1 | Fig2 | BE | FE | DB | QA | OPD | **Phân loại** |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Đăng nhập email/password | §4 *"Account and role management (Lecturer / Student)"* | BE-001 (DONE), FE-002 | FR-AUTH-02; P0 §2 | 1:2 | 00.3 (1:6113) | ✅ `POST /auth/login` | ✅ LoginPage | ✅ `users` | ✅ QA-001/002 | — | **CONFIRMED MVP** |
| Đăng ký kèm chọn vai trò | §4 | BE-001, FE-002 AC-1 | FR-AUTH-01; P0 §3 (1 form + segmented role) | 1:52, 1:122 (2 form tách) | 00.4 (1:6144) | ✅ `@IsEnum(LECTURER,STUDENT)` | ✅ | ✅ | ✅ | OPD-008 | **CONFIRMED MVP** (dạng 1 form). Bố cục 2 form tách của Page 1 là biến thể UI chưa có căn cứ. |
| Trường MSSV / Khoa khi đăng ký | — | — | Không có trong FR-AUTH-01 §6 Inputs; FR-EVAL-05 yêu cầu loại bỏ student ID khỏi dữ liệu export | 1:52, 1:122, 1:1852, 1:4025 | — | ❌ | ❌ | ❌ không có cột | — | — | **UNKNOWN**: trường dữ liệu không có trong domain model |
| JWT, phiên hết hạn, route guard theo vai trò | §4 | FE-001 (DONE), BE-002 | FR-AUTH-03/04; P0 §1 | — | 01.5 (403) | ✅ | ✅ PrivateRoute | — | ✅ QA-002 | — | **CONFIRMED MVP** |
| Đăng xuất | — | FE-001 | P0 §1 Actions | trong sidebar | trong shell | — | ✅ | — | — | — | **IMPLIED UNDER MVP FEATURE** (Auth) |
| **Google Sign-In / OAuth** | Không đề cập; Context Diagram không có Identity Provider | Không có; **`01_MASTER-TASKS.md §4.6` liệt kê "xác thực mạng xã hội/Google OAuth" là Post-MVP (Phase 2)** | `FEATURE-AUTH-AND-ROLES.md §13`: *"Social OAuth / OpenID login (Google…) — strictly excluded"*; `feature-authentication.md` Excluded; P0 §2 Boundary | 1:2, 1:52, 1:122 có nút Google | Không có | ❌ | ❌ | ❌ | ❌ | — | ~~PHASE 2~~ → **MVP (quyết định PO 2026-11-12)**: Google + Microsoft trên 00.3/00.4/00.5. Backlog §4.6 chưa đổi. Xem PSD-09. |
| Quên mật khẩu / đặt lại mật khẩu | Không đề cập | **`01_MASTER-TASKS.md §4.6`: "Password Reset, Change Password… quy trình khôi phục mật khẩu qua email SMTP" là Post-MVP (Phase 2)** | Không có FR | 1:196, 1:223, 1:250, 1:279, 26:78 | — | ❌ | ❌ | ❌ | ❌ | — | **PHASE 2** |
| Email kích hoạt tài khoản | Không đề cập | Không có | Không có FR. FR-AUTH chỉ ghi `is_active` dùng để chặn đăng nhập | 26:148 | — | ❌ | ❌ | — | — | liên quan OPD-008 | **PROPOSED**: chưa thuộc yêu cầu được phê duyệt |
| Duyệt tài khoản Giảng viên | Context Diagram: Admin *"Manage accounts & roles"* | Không có | FR-AUTH §12: `is_active=false` → 403 (**code hiện không kiểm tra**, `auth.service.ts` dòng 55–67) | 1:122 (thông báo), 1:4025 (tab chờ duyệt) | — | ❌ | ❌ | ✅ `is_active` | — | **OPD-008** | **HOLD** |
| Trang giới thiệu `/` | — | DES-001 (gom trang ngoài task) | `05_FIGMA §1.5` + Frame 00.2; SITE-ARCH §5.1; P0 §0 | Không có | 00.2 (1:5988) | — | ⚠️ router đang map `/` → LoginPage | — | — | — | **IMPLIED UNDER MVP FEATURE** (DES-001) |
| 403 / 404 / Error / Loading / Empty | — | DES-002, FE-002 AC-4/5 | P0 §1; `05_FIGMA` DES-002 | Rải rác | 01.2–01.5 | — | ✅ catch-all, error boundary | — | ✅ | — | **CONFIRMED MVP** |

### 2.2. Course & Student entry

| Chức năng | P | BL | Spec | Fig1 | Fig2 | BE | DB | OPD | **Phân loại** |
|---|---|---|---|---|---|---|---|---|---|
| Giảng viên tạo/xem/sửa khóa học | §4 *"bound to a specific course"* | BE-003 (DONE), FE-002 AC-3 | FR-MAT-01/02; P1 §1 | 1:2431, 1:1465 | 00.5, 00.6 | ✅ CRUD | ✅ | — | **CONFIRMED MVP** |
| Xóa khóa học | — | BE-003 (CRUD) | BR-MAT-03 "cascades deletion **or** archiving" | menu | 00.6 (Delete confirm) | ⚠️ hard `DELETE FROM courses` | — | **OPD-014** | **IMPLIED** (thao tác); **HOLD** (ngữ nghĩa xóa) |
| Sinh viên vào case qua link trực tiếp | Context Diagram *"Deliver case situations"* | DES-009 AC-3 (Copy Student Link) | PROJECT_OVERVIEW: *"Student access is always via a direct link"*; P2 §1 | 1:1444 | 03.6, 00.7 | — | — | — | **CONFIRMED MVP** |
| **Mã mời tham gia lớp** | Không đề cập | Không có | Không có FR; FEATURE-COURSE §3 không có enrollment | 1:2431, 1:2258, 1:1465, 1:1084 | — | ❌ | ❌ không có `course_enrollments` | **OPD-001** | **HOLD**. Tài liệu hiện hành không hỗ trợ; chỉ có thể vào MVP nếu PO duyệt OPD-001 Option A. |
| **Dashboard sinh viên ("Bàn học")** | Không đề cập | Không có | **P0 §1: *"No dashboard/list screen exists in the approved sitemap — do not invent one."*** | 1:1305 | — | ❌ | ❌ | OPD-001 | **HOLD**. Spec hiện hành loại trừ rõ; chỉ mở lại nếu duyệt OPD-001. |
| **"Khóa học của tôi" (sinh viên)** | Không đề cập | Không có | PROJECT_OVERVIEW: *"Students do not browse case lists"*; P2: *"There is no student browse page"* | 1:1202 | — | ❌ | ❌ | OPD-001 | **HOLD** (như trên) |
| Dashboard giảng viên "Tổng quan" | Không đề cập | Không có | P1 §1: Course Catalog là *"First screen after login"*; không có route trong 15 routes | 1:3490, 34:3183 (trùng) | — | — | — | — | **PROPOSED**: không có route hay nguồn yêu cầu |

### 2.3. Materials, RAG, Case generation, Review & Publishing

| Chức năng | P | BL | Spec | Fig1 | Fig2 | OPD | **Phân loại** |
|---|---|---|---|---|---|---|---|
| Upload PDF/DOCX theo khóa học | §4 | DES-003, FE-003, BE-005, OPS-002 | FR-MAT-03..06 | 1:2258 | 02.1, 02.2 | — | **CONFIRMED MVP** |
| 4 trạng thái xử lý và nút Retry | §4 (RAG) | DES-004 AC-1/2, FE-004, FE-005 *"Delete & Failure Retry"* | P1 §2 | 1:2258 (chưa đủ 4 trạng thái) | 02.3 (đủ) | OPD-012 (chỉ về sinh case khi có tài liệu FAILED) | **CONFIRMED MVP** |
| Xác nhận xóa tài liệu | — | FE-005, DES-004 Frame 02.4 | P1 §2 | 29:1106 | 02.3 | OPD-014 (copy về cascade) | **CONFIRMED MVP** |
| RAG Source Inspector | Deliverable 2 | DES-005, FE-006 | `05_FIGMA` Frame 02.5 | 16:6 | 02.4 | — | **CONFIRMED MVP** |
| Sinh case bằng AI (chức năng) | Goal 1, Obj 2 | DES-006, FE-007, BE-014/015 | FR-GEN-01..06 | 1:3088, 1:2939, 1:2818 | 03.2, 03.3 | — | **CONFIRMED MVP** |
| Sinh case dạng **wizard 3 bước** (thay modal) | — | DES-006 tên task là *"Case Generation **Modal**"* | P1 §3 và `05_FIGMA` Frame 03.2 mô tả modal | 3 frame wizard | modal | **OPD-006** | **HOLD** (hình thức UI) |
| Tạo case thủ công | Goal 1 *"by entering a situation"* | Có nút trong DES-006 Frame 03.1; không có task BE riêng | — | — | 03.1 có nút "Create Manual" | — | **HOLD**: Proposal có ý, nhưng thiếu phân rã BE/FE |
| ReactFlow editor + node/option form | Goal 2 | DES-007/008, FE-008..010, BE-016/017 | FR-REV-01/02 | 1:3219 | 03.4, 03.5 | — | **CONFIRMED MVP** |
| Stepper vòng đời + nút chuyển trạng thái | Goal 2 | DES-009, FE-011, BE-018/019 | FR-REV-03..06 | 1:3219 (chưa gắn stepper) | 03.6 (đủ 4 trạng thái) | — | **CONFIRMED MVP** |
| Hộp thoại xuất bản + Copy Student Link | Goal 2 | DES-009 AC-3 | — | 1:1444 | 03.6 | — | **CONFIRMED MVP** |
| "Unpublish (Create v2 Draft)", Version pill | — | Có trong spec DES-009 | Mâu thuẫn: OPD-007 đề xuất khóa cấu trúc, DES-009 mô tả tạo phiên bản | 1:3219 (v1) | 03.6 | **OPD-007** | **HOLD** |
| Gán cờ "Quyết định then chốt" (pivotal) | Goal 3/4 *"pivotal decisions … revealed"* | Không có | P2 §1b: *"Key moments are surfaced by the system"*; không có cột `is_pivotal` | 1:3219 (checkbox) | — | OPD-002 | **UNKNOWN**: khái niệm có trong Proposal, nhưng chưa rõ ai xác định pivotal và chưa có trường dữ liệu |
| Nút "AI gợi ý / Tạo lại phần này bằng AI" trong editor | — | Không có | **P1 §4 Boundary: *"The AI never re-generates or auto-fills content on this screen after the initial draft"*** | 1:3219 | — | — | **OUT OF SCOPE** (có câu loại trừ rõ) |
| Nhân bản / Lưu trữ case | — | Không có | — | 1:2583 | — | OPD-007, OPD-014 | **HOLD** |
| Hạn nộp (deadline) trên case | Context Diagram *"Receive deadline reminder"* | Không có task | PROJECT_OVERVIEW: *"In MVP, deadlines are presented with published cases"*; FEATURE-NOTIFICATIONS §3 MVP Boundary | 1:1444, 1:972, 1:2583 | — | — | **HOLD**: tài liệu nói hiển thị deadline thuộc MVP, nhưng không có task và không có cột `due_date`. Thiếu phân rã. |
| Gửi nhắc hạn (email/in-app) | §4 *"Notification"* | Không có | FEATURE-NOTIFICATIONS: dispatch là **Phase 2**; `01_MASTER-TASKS §4.6` | 1:1444 (checkbox gửi email), 1:1493 | — | — | **PHASE 2** |

### 2.4. Student learning

| Chức năng | P | BL | Fig1 | Fig2 | OPD | **Phân loại** |
|---|---|---|---|---|---|---|
| Branching Player Phase 1 | Goal 3, Obj 3 | DES-010, FE-012, BE-020/021 | 1:906 | 04.1 | — | **CONFIRMED MVP** |
| Màn giới thiệu case trước khi chơi | — | DES-001 Frame 00.6 "Direct Case Entry View" | 1:972 | 00.7 | OPD-003 (nút "Tiếp tục làm dở") | **IMPLIED UNDER MVP FEATURE** |
| Tiếp tục lượt đang làm dở | — | BE-020 *"Initialization & **Resumption** APIs"* | 1:972 | — | **OPD-003** | **IMPLIED** (resume); **HOLD** (quy tắc hủy lượt cũ) |
| Terminal outcome | Goal 3 | DES-010, FE-013, BE-022 | 1:880 | 04.2 | — | **CONFIRMED MVP** |
| Journey Review + lý lẽ hồi cứu | Goal 4/6 | DES-011, FE-014/015, BE-023/024 | 1:619 | 04.3 | OPD-002 (bắt buộc hay không) | **CONFIRMED MVP** |
| Reflection + Retry + lịch sử lượt làm | Goal 4 | DES-012 (*"immutable attempt history viewer"*), FE-016/017 | 1:545, 1:466, 1:790 | 04.4, 04.5 | OPD-004 | **CONFIRMED MVP** |
| AI Challenge Support (chức năng) | Goal 7, Del 3 | DES-015, FE-021, BE-027 | 27:321 + khối trong 1:619 | 05.6, 05.7 (trang riêng) | — | **CONFIRMED MVP** |
| Hình thức Challenge Support (modal, inline hay trang riêng) | — | DES-015 | 2 phương án trên Page 1 | trang riêng (khớp SITE-ARCH route `/challenge/:sessionId`) | **OPD-005** | **HOLD** (vùng chứa UI) |
| Review Study: form, đã nộp, xem phản hồi + phản tư | Goal 5, Obj 4 | DES-013, FE-018/020, BE-025 | 1:384, 1:297 | 05.1, 05.2, 05.4 | — | **CONFIRMED MVP** |
| Sinh viên xem phản hồi GV cho lượt Branching | §4 *"Lecturer Review / Feedback… attempts"* | DES-014 (phía GV) | 1:790 (cột) | 04.4 ("Lecturer feedback: Not yet provided") | **OPD-009** | **IMPLIED** (chức năng); **HOLD** (vị trí hiển thị) |

### 2.5. Lecturer feedback, Statistics, Research

| Chức năng | P | BL | Spec | Fig1 | Fig2 | OPD | **Phân loại** |
|---|---|---|---|---|---|---|---|
| Hàng đợi bài làm + soạn phản hồi định tính | §4, Obj 6 | DES-014, FE-019, BE-026 | P3 §2 | 1:1852, 1:1702 | 05.3 | — | **CONFIRMED MVP** |
| Thẻ "Gợi ý phân tích từ AI" cho GV | — | Không có | **P3 §2 Boundary: *"No AI-generated feedback suggestions"***; DES-014 AC-2 | 1:1702 | — | **OPD-010** | **HOLD**. Spec hiện hành loại trừ; chỉ vào MVP nếu duyệt OPD-010 Option A. |
| Thống kê luồng học (5 chỉ số) | Goal 8, Obj 6 | DES-014 Frame 05.5, FE-022, BE-028 | FEATURE-BASIC-STATISTICS | 1:1493 | 05.5 | — | **CONFIRMED MVP** |
| Xuất CSV dữ liệu nghiên cứu | Del 6 | Không có | FR-EVAL-04; BR-EVAL-03 *"Open / To Be Decided"* | 1:1493, 1:4511, 1:5302 | — | OPD-011 | **HOLD** |
| **Rubric nghiên cứu (chấm chất lượng case)** | **§4 *"Quantitative Evaluation module… rubric-based scoring of case quality"*; bảng Team: *"Quantitative Evaluation UI"*** | **Không có task** | FEATURE-EVALUATION: *"Implementation Method Status: Open / To Be Decided"* | 1:2081, 1:4511 | — | **OPD-011** | **HOLD**. Proposal có yêu cầu chức năng; cách triển khai chưa chốt; backlog thiếu phân rã. |
| Khảo sát sinh viên trong nền tảng | Context Diagram *"Complete evaluation survey"* | Không có | FEATURE-EVALUATION §3: dùng công cụ bên ngoài trong MVP; *"in-platform survey forms is a post-MVP roadmap item"* | — | — | — | **PHASE 2** (form trong nền tảng) |

### 2.6. Admin

| Chức năng | P | BL | Spec | Fig1 | OPD | **Phân loại** |
|---|---|---|---|---|---|---|
| Quản lý tài khoản và vai trò | Context Diagram *"Manage accounts & roles"* | Không có | Mâu thuẫn F-4 | 1:4025, 30:1864 | OPD-015, OPD-008 | **HOLD**: Proposal có năng lực này, chưa chốt hình thức (UI hay script) |
| Quản lý khóa học (toàn hệ thống) | Context Diagram *"Manage courses"* | Không có | — | 1:4795 | OPD-015 | **HOLD** |
| Admin Logs | Context Diagram *"Monitor API & system logs"* | Không có | `01_MASTER-TASKS §4.1`: pilot dùng `/health` và structured console logging | 1:5302 | OPD-015 | **HOLD** (OPD-015 Option A đề xuất hoãn) |
| Cấu hình dịch vụ AI | — | Không có | Code đọc `.env` (`providers/factory.py`) | 1:5543 | OPD-013, OPD-015 | **HOLD** |
| Theo dõi chi phí AI | Risk mitigation: *"monitor API cost per session during the pilot"* (hoạt động vận hành) | Không có | — | Chưa có frame riêng | — | **UNKNOWN**: Proposal yêu cầu theo dõi, không nói phải có UI |
| Dashboard Admin | — | Không có | — | 1:3715 | OPD-015 | **PROPOSED** |
| Đăng nhập Admin riêng | — | Không có | `/login` dùng chung, role do server xác định (P0 §2) | 1:4477 | OPD-015 | **PROPOSED** |
| Quản lý Case Study toàn hệ thống | Không có trong Context Diagram | Không có | — | 1:5043 | OPD-015 | **PROPOSED** |
| Cài đặt hệ thống (đổi mật khẩu, backup) | — | Không có | `01_MASTER-TASKS §4.2`: backup là runbook `pg_dump` thủ công; §4.6: đổi mật khẩu là Phase 2 | 1:4345 | — | **PHASE 2** (đổi mật khẩu); **PROPOSED** (phần còn lại) |
| Rubric oversight cho Admin | §4 Quantitative Evaluation | Không có | — | 1:4511 | OPD-011 + OPD-015 | **HOLD** |

---

## 3. Tổng hợp theo phân loại

| Phân loại | Số dòng trong ma trận (xấp xỉ, một dòng có thể tách 2 phân loại) | Ví dụ |
|---|:-:|---|
| CONFIRMED MVP | 24 | Login, Register, Course CRUD, Materials 4 trạng thái, RAG inspector, ReactFlow editor, Lifecycle, Player, Journey Review, Reflection/Retry, Review Study, Challenge Support, Feedback, Statistics |
| IMPLIED UNDER MVP FEATURE | 6 | Logout, Landing `/`, Case intro, Resume attempt, Course delete action, Student view of Branching feedback |
| PROPOSED | 6 | Email kích hoạt, Dashboard GV, Admin dashboard, Admin login riêng, Admin case mgmt, Admin settings |
| HOLD | 20 | Mã mời, Dashboard SV, Khóa học của tôi, Rubric, CSV, Admin user/course/log/AI config, Wizard, Versioning, AI hint, Deadline, Pivotal-required, Challenge container… |
| PHASE 2 | 4 | Quên/đặt lại mật khẩu, Đổi mật khẩu, Gửi nhắc hạn, Survey in-platform (Google Sign-In chuyển sang MVP theo quyết định PO 2026-11-12, kèm Microsoft) |
| OUT OF SCOPE | 1 | Nút "AI gợi ý / Tạo lại bằng AI" trong Case Editor |
| UNKNOWN | 3 | Trường MSSV/Khoa, cờ pivotal, UI theo dõi chi phí AI |

---

## 4. Sửa lại các nhận định trước đây của tôi

| Nhận định trước | Căn cứ khi đó | Đánh giá lại | Kết luận đã sửa |
|---|---|---|---|
| "Bỏ Google SSO vì không có task và BE đã làm email/password" | Suy luận từ việc thiếu task và từ code | **Lập luận sai phương pháp**, dù kết luận gần đúng | Google Sign-In là **PHASE 2**, căn cứ vào `01_MASTER-TASKS §4.6` và `FEATURE-AUTH §13`, không phải vì thiếu task |
| "Bỏ mã mời, bỏ 3 màn sinh viên" | Đọc PROJECT_OVERVIEW | Đúng hướng nhưng **vượt quyền**: OPD-001 đang OPEN | **HOLD** chờ OPD-001. Giữ frame làm tham khảo, không gắn Ready for Dev. |
| "Giữ dashboard 1:3490, xóa 34:3183" | Cảm nhận thiết kế | **Không có căn cứ**: dashboard GV không có route | Cả hai frame là **PROPOSED**. Chưa nên giữ bản nào làm baseline. |
| "Admin phụ gắn Phase 2, giữ User Management tối thiểu" | Lấy theo OPD-015 Option A | **Chọn thay PO**: OPD-015 chưa duyệt | Toàn bộ Admin là **HOLD** chờ OPD-015 |
| "Giữ và chuẩn hóa ~51 màn Page 1 làm nguồn cho FE" | PO chọn | **Thiếu dữ kiện**: chưa xét Page 2 là bộ bám spec 1-1 và đúng quy tắc ngôn ngữ | Cần PO quyết định baseline (D-01) và ngôn ngữ (D-02) trước khi chốt |
| "Quên mật khẩu → Phase 2" | Phỏng đoán | Nay đã có căn cứ: `01_MASTER-TASKS §4.6` | Giữ kết luận **PHASE 2**, nay có dẫn chứng |
