# Product Owner — Quyết định phạm vi MVP & Sổ theo dõi quyết định mở

> - **Document Class**: `[PO SCOPE / DECISION]` — Living Decision Ledger (khởi tạo 2026-11-03, cập nhật theo các quyết định PO ngày **2026-11-12**, **2026-11-16**, **2026-11-22**, **2026-11-25**, **2026-11-26**, **2026-11-27**).
> - **Quy tắc**: Mọi mục `OPEN PO DECISION` / `UNRESOLVED` không được tự ý chọn phương án thay mặt PO (`.agents/rules/02-agent-operating-policy.md §5`). Nội dung lịch sử bên dưới mỗi mục (đề xuất ngày 2026-11-03) được giữ nguyên để truy nguyên, **không phải hướng dẫn hiệu lực nếu đã có dòng `ĐÃ QUYẾT ĐỊNH`**.

## 0. Bảng tổng hợp trạng thái Quyết định PO (Tra cứu nhanh)

### A. Đã chốt bởi Project Owner (`[DECIDED]`)
| Mã | Quyết định đã duyệt | Ngày chốt | Ghi chú phạm vi còn mở (nếu có) |
|---|---|---|---|
| **OPD-001 → A** | Mã mời, Tham gia lớp, Khóa học của tôi, Bàn học thuộc **MVP** (`07.2–07.4`, `09.2`) | 2026-11-12 | Link trực tiếp tới case `PUBLISHED` vẫn giữ |
| **OPD-006** | Sinh case AI dùng **wizard 3 bước AI Studio** (`07.5–07.7`) trong MVP | 2026-11-12 | Nút "Tạo thủ công từ đầu" chờ `D-07` |
| **OPD-011 → A** | **Rubric đánh giá chất lượng case trong nền tảng** (`07.8`, `10.8`) + CSV ẩn danh thuộc MVP | 2026-11-12 | Survey/thống kê so sánh thực nghiệm theo `EVALUATION-DESIGN.md` |
| **OPD-013** | Màn Admin Dịch vụ AI (`10.7`) chỉ xem (provider cố định qua `.env`) | 2026-11-12 | — |
| **OPD-014** | Khóa học dùng **lưu trữ mềm** (`PATCH /courses/:courseId/archive`), bỏ `DELETE` | 2026-11-16 | Không có luồng khôi phục khóa học; thao tác lưu trữ của Admin (`10.5`/`10.6`) chưa có task |
| **OPD-015 → B** | Cổng **Admin** (đủ 10 màn `10.1–10.10`) thuộc MVP | 2026-11-12 | Xác minh tài khoản giảng viên chờ `OPD-008` |
| **D-05** | **Có Dashboard giảng viên** (`07.1`) thuộc MVP | 2026-11-12 | Màn mặc định sau đăng nhập (`ROLE_HOME.LECTURER`: `/lecturer/dashboard` vs `/lecturer/courses` ở `paths.ts`) giữ ở mục B chờ PO chốt chính thức |
| **PSD-09 (cốt lõi)** | Đăng nhập/đăng ký **Google & Microsoft** (`00.3–00.5`, trừ Admin) thuộc MVP | 2026-11-12 | Chi tiết liên kết email, gán role & domain trường vẫn `OPEN` |
| **UX/UI & UI Auth** | Light theme Navy/Sky (`R01` + Figma làm chuẩn màn hình), font `Plus Jakarta Sans` + `Inter`, cấu trúc SPA module hóa (Target Frontend Architecture), VI mặc định + VI/EN, Quên/Đặt lại mật khẩu (MVP UI) + `rememberMe`; không thiết kế giao diện mới trong khi làm dự án (chỉ cân nhắc update giao diện mở rộng **sau khi hoàn thành dự án, nếu còn thời gian**) | 2026-11-16 / 22 / 25 | BE reset mật khẩu & `rememberMe` TTL chờ triển khai; `ROLE_HOME.LECTURER` & routing Feedback giữ ở mục B |
| **Gỡ `(LATER)` P3/P4** | Xác nhận **Statistics, Lecturer Feedback (`P3`) và Review Study (`P4`) thuộc phạm vi MVP hiện tại**; gỡ nhãn `(LATER)` khỏi `P3`/`P4` | 2026-11-25 | **Phân biệt phạm vi MVP vs triển khai thực tế** (chưa coi là hoàn thành 100%); **`D-04`**, **`OPD-010`**, **`D4-13`** và route Feedback giữ **`OPEN`** ở mục B |
| **D3a–D3d** (Rubric FE-029) | **D3a**: vào Rubric từ sidebar khi chưa chọn case thì hiện danh sách phiếu người dùng được xem (không có form chấm) kèm hướng dẫn chọn case. **D3b**: danh sách gồm mọi phiếu người dùng được xem (giảng viên: khóa của mình; admin: tất cả), mỗi thẻ có tên case. **D3c**: "Xem" ở `10.6` mở rubric của case đó; màn review case của giảng viên có nút "Rubric nghiên cứu" (`/lecturer/cases/:caseId/rubric`). **D3d**: ba tiêu chí ban đầu để trống; nút Lưu khóa đến khi chấm đủ 3 tiêu chí | 2026-11-26 | Triển khai trong `specs/012-case-rubric-ui/` (PR #89) |
| **D6** | Không thêm giới hạn độ dài mới (ví dụ 10–2000 ký tự) khi không có nguồn; dùng ràng buộc đã chốt và giới hạn sẵn có của DB | 2026-11-26 | Áp dụng trong spec 011 (AC-J) |
| **D7** | Không mở lại hay đánh dấu lại BE-016…BE-023; ghi nhận công việc bổ sung bằng task corrective liên kết với task cũ | 2026-11-26 | Task corrective EBA-107…EBA-112 (2026-11-27) |
| **D8** | "PR3 API Integration" không phải deliverable riêng; phần tích hợp nằm trong PR của feature (ví dụ FE-029 tự tích hợp BE-033) | 2026-11-26 | — |
| **Bộ lọc `10.9`** | "Đăng nhập" lọc cả `LOGIN_SUCCEEDED` và `LOGIN_FAILED`; không hiện lựa chọn "Nộp bài" khi backend chưa có sự kiện tương ứng; phân trang và tổng số kết quả phải chính xác; nhãn sự kiện VI/EN | 2026-11-27 | Triển khai trong PR #91 (EBA-110) |
| **Cột "Mã" `10.9`** | Chấp nhận ẩn cột "Mã" dưới 1280px (mã vẫn hiện trong tiêu đề hộp thoại chi tiết) | 2026-11-27 | — |
| **KPI "Lượt đăng nhập" `10.9`** | KPI chỉ đếm `LOGIN_SUCCEEDED`; bộ lọc "Đăng nhập" gồm cả thành công và thất bại | 2026-11-27 | — |
| **N1** | Chấp nhận ô thời gian trên `10.9` xuống 2 dòng ở 1024px; ghi nhận lỗi Low, không chặn MVP | 2026-11-27 | Backlog EBA-114 |
| **D5 + OPD-003** | Case đã có ít nhất một attempt không được chuyển `PUBLISHED` → `DRAFT`; case chưa có attempt vẫn chỉnh sửa như hiện tại. Attempt đang làm dở được tiếp tục đến terminal; attempt đã hoàn thành và reflection vẫn xem lại được | 2026-11-27 | Triển khai `specs/013-attempt-publish-lock/` (EBA-113); chi tiết PSD-11 |
| **OPD-007** | Chức năng versioning case sau khi xuất bản để **Post-MVP**. Trong MVP, case đã có attempt bị khóa theo D5 (không về `DRAFT`, nên không sửa được) | 2026-11-27 | — |

### B. Đang chờ PO quyết định (`[OPEN PO DECISION]` / `[UNRESOLVED]`)
| Mã | Vấn đề còn mở | Màn / Module chịu ảnh hưởng |
|---|---|---|
| **OPD-002 / D-06** | Quy tắc bắt buộc lập luận ở quyết định then chốt & cách xác định điểm then chốt | `05.4`, `03.4`, `FEATURE-BRANCHING-STUDY` |
| **OPD-004** | Giới hạn số lượt làm lại tối đa (nếu có) | `05.9`, `05.10` |
| **OPD-005** | AI Challenge Support mở dạng Modal hay trang riêng (**HOLD** frame `05.5`, `05.6`) | `05.4`, `05.5`, `05.6`, `SITE-ARCHITECTURE` |
| **OPD-008** | Cơ chế xác minh/kích hoạt tài khoản giảng viên (**HOLD** email kích hoạt `26:148`) | `00.5`, `10.3`, `auth/` |
| **OPD-010** | Có nút gợi ý phản hồi bằng AI trên màn `04.2` hay không | `04.2`, `FEATURE-LECTURER-FEEDBACK` |
| **D-04** | Lưu hay không trường Mã số sinh viên trên bảng `users` | `00.4`, `04.1`, `V1__init_schema.sql` |
| **D-07** | Nút "Tạo thủ công từ đầu" trong AI Studio | `07.6` |
| **D4-13** | Trường `student_analysis` trong Review Study bắt buộc hay tùy chọn (lưu ý: Schema `V2` / `FEATURE-REVIEW-STUDY` hiện là nullable theo R2 Option A; trạng thái chốt đồng bộ UI chờ xác nhận nếu khác) | `06.1`, `review-study/` |
| **PSD-03** | Thông báo nhắc hạn (`FR-NOTIF-01`): để Phase 2 hay bổ sung task hiển thị hạn nộp trong MVP | `notification/` |
| **PSD-07** | Bố cục màn quyết định sinh viên `05.2` (hai cột vs một cột `768px`) | `05.2`, `P2-STUDENT-CORE` |
| **PSD-08** | Có bước xác nhận phương án (`05.2`) hay chọn xong chuyển ngay (`FND §6.2`) | `05.2`, `BranchingCasePlayerPage` |
| **PSD-09 (chi tiết)** | Quy tắc chọn role khi login Google/MS lần đầu, liên kết trùng email, giới hạn domain trường | `00.3–00.5`, `BE-034` |
| **ROLE_HOME.LECTURER** | Màn mặc định sau đăng nhập của Giảng viên: `/lecturer/dashboard` (frame `07.1` thuộc MVP theo `D-05` 2026-11-12; API `BE-030` còn ở PR #80) vs `/lecturer/courses` (`frontend/src/routes/paths.ts:78` hiện hành trên `develop`). *(`OPD-006` chỉ quyết định wizard AI Studio `07.5–07.7`, không phải căn cứ cho route dashboard)* | `07.1`, `00.3`, `SITE-ARCHITECTURE`, `P0`, `P1`, `paths.ts` |
| **Lecturer Feedback Routes** | Giữ song song overview (`/lecturer/feedback`, `/lecturer/feedback/:submissionId`) và theo Case (`/lecturer/cases/:caseId/feedback`) hay chọn một tuyến chuẩn duy nhất | `04.1`, `04.2`, `SITE-ARCHITECTURE`, `P3-SUPPORT-AND-STATISTICS` |

---

## 1. Điều kiện dừng ban đầu (Hồ sơ lịch sử 2026-11-03)

| Điều kiện (yêu cầu §11) | Gặp? | Mục |
|---|---|---|
| Proposal V1.2 mâu thuẫn backlog | **Có** | PSD-02, PSD-03, PSD-04 |
| Frame không khớp yêu cầu nào | **Có** | PSD-05 (dashboard giảng viên) |
| Task bắt buộc không có màn tương ứng | **Có** | PSD-06 (DES-006, DES-015) |
| Không xác minh được Story Points | Không — SP lấy nguyên văn từ `01_MASTER-TASKS.md` | — |
| OPD đang OPEN chặn quyết định thiết kế | **Có** | PSD-01, PSD-06 |
| Thay đổi có thể sửa frame gốc / component dùng chung | Chưa phát sinh (chưa sửa gì) | PSD-07, PSD-08 sẽ phát sinh khi sửa thiết kế |

Vì vậy tài liệu dừng ở bước phân loại và chờ PO.

## 2. Các quyết định

### PSD-01 — Loại mã mời, Tham gia lớp, Khóa học của tôi, Bàn học sinh viên khỏi MVP
- **Hướng PO**: loại khỏi MVP, giữ frame trong khu lưu trữ; không loại truy cập case qua đường dẫn giảng viên gửi. Đồng thời PO xếp "Student enrollment: OPD-001" vào HOLD.
- **Bằng chứng ủng hộ việc loại**: không có task; P0 §1 và P2 §1 ghi không có trang danh sách cho sinh viên; DB không có bảng ghi danh.
- **Xung đột**: hai phương án của OPD-001 chính là (A) mã mời + dashboard và (B) chỉ đường dẫn trực tiếp. Loại (A) khỏi MVP tương đương chọn (B). PO-25 lại ghi truy cập bằng đường dẫn trực tiếp **chưa được xác nhận**.
- **Đề xuất**: PO quyết định đóng OPD-001 theo phương án B cho MVP. Sau khi có quyết định: 3 frame (`1:1305`, `1:1202`, `1:1084`) chuyển OUT OF SCOPE; gỡ phần tử mã mời/mã tham gia trên `1:2431`, `86:2446`, `86:2107`, `86:2277`, `1:2258`, `16:6`, `1:1465`; đổi nút "Về Bàn học của tôi" trên `1:466`. Cho đến lúc đó, các frame giữ HOLD.
- **ĐÃ QUYẾT ĐỊNH 2026-11-12 (PO):** hướng trên được thay thế. OPD-001 chốt **phương án A**: mã mời, Tham gia lớp, Khóa học của tôi, Bàn học sinh viên thuộc **MVP** (page 08: 07.2–07.4, hồ sơ 09.2). 3 frame `1:1305`, `1:1202`, `1:1084` chuyển MVP; mã mời trên màn giảng viên và nút "Về Bàn học của tôi" giữ nguyên. Việc còn lại: bảng `course_enrollments` + API ghi danh, task BE/FE/QA, sửa P0 §1, P2 §1, SITE-ARCHITECTURE §5.3.

### PSD-02 — Evaluation / Rubric (Proposal có, backlog không có)
- **Bằng chứng**: Proposal ¶140 (Quantitative Evaluation module), Deliverable 6, ¶343 (vai trò "Quantitative Evaluation UI"); 84 task không có task nào.
- **Đề xuất**: giữ HOLD (OPD-011) theo hướng PO. PO cần xác định cách thu dữ liệu cho Deliverable 6, kể cả khi làm ngoài nền tảng.
- **ĐÃ QUYẾT ĐỊNH 2026-11-12 (PO):** OPD-011 chốt **A — rubric trong nền tảng**, thuộc **MVP**: Rubric giảng viên (`1:2081` → page 08 `07.8`) và Admin "Nghiên cứu & Rubric" (`1:4511` → `10.8`). Backlog cần thêm task BE `evaluation/`, FE form rubric, export CSV ẩn danh, QA loại bỏ PII.

### PSD-03 — Notification nhắc hạn (Proposal có, backlog không có)
- **Bằng chứng**: Proposal ¶141; không có task; DB không có cột hạn nộp; không có frame.
- **Đề xuất**: PO chọn Phase 2 hoặc bổ sung task. Hướng PO hiện chưa nhắc mục này.

### PSD-04 — Phạm vi Admin
- **Hướng PO**: HOLD quản lý người dùng và xác minh giảng viên (OPD-015, OPD-008); Phase 2 cho nhật ký, cấu hình AI nâng cao, giám sát chi phí AI và cải tiến quản trị khác.
- **Bằng chứng**: Proposal ¶129 chỉ nêu Lecturer / Student; Deliverable 1 chỉ có giao diện giảng viên và sinh viên; không có task Admin. CPD-07 (Draft) ghi phạm vi module Admin còn mở.
- **Xung đột**: xếp 6 frame Admin vào PHASE 2 đã loại trước phương án B (đủ 10 màn) của OPD-015.
- **Đề xuất**: PO xác nhận cách xếp này. Các frame HOLD: `1:4477`, `1:4025`, `30:1864`, `1:4511`; PHASE 2: `1:3715`, `1:4795`, `1:5043`, `1:5543`, `1:5302`, `1:4345`.
- **ĐÃ QUYẾT ĐỊNH 2026-11-12 (PO):** hướng trên được thay thế. Admin thuộc **MVP**, không chờ duyệt thêm (OPD-015 → B, đủ 10 màn). 9 frame chuyển sang MVP: `1:4477`, `1:3715`, `1:4025`, `30:1864`, `1:4795`, `1:5043`, `1:5543` (chỉ xem, OPD-013), `1:5302`, `1:4345`. `1:4511` (Nghiên cứu & Rubric) chuyển MVP khi OPD-011 chốt A (xem PSD-02). Xác minh giảng viên (OPD-008) vẫn mở. Thiết kế mới: page 08, section `10 · Admin` (10.1–10.10).

### PSD-05 — Dashboard giảng viên (D-05)
- **Hướng PO**: giữ Revision 01 (`34:3183`) làm ứng viên; lưu bản gốc (`1:3490`); không duyệt Revision 01.
- **Bằng chứng**: không có yêu cầu trong Proposal hay task; P1 §1 ghi Courses là màn đầu tiên sau đăng nhập.
- **Phát hiện**: Revision 01 làm nút chính tách khỏi component, và dùng chữ "Bài nộp chờ bạn chấm" (trái nguyên tắc không chấm điểm).
- **Đề xuất**: PO quyết D-05 (có dashboard trong MVP hay không). Nếu có, cần chỉ định task chịu trách nhiệm vì hiện không có SP nào cho màn này.
- **ĐÃ QUYẾT ĐỊNH 2026-11-12 (PO):** D-05 chốt **có dashboard giảng viên**, thuộc **MVP** (`34:3183` → page 08 `07.1 · Bảng điều khiển`). `1:3490` vẫn là bản tham chiếu. Việc còn lại: task FE/BE cho dashboard; sửa P1 §1 (đang ghi Courses là màn đầu tiên sau đăng nhập).

### PSD-06 — Cấu hình sinh case và Challenge Support chỉ có frame HOLD
- **Hướng PO**: giữ AI Case Studio trong MVP và khôi phục dấu chọn ở thẻ chế độ học của AI Studio.
- **Xung đột**: AI Studio là wizard 3 bước (OPD-006), trong khi task là "Case Generation **Modal**" (DES-006). Hướng PO ngầm chọn wizard. Challenge Support có dạng modal (OPD-005), còn SITE-ARCHITECTURE §5.3 là trang riêng.
- **Đề xuất**: PO đóng OPD-006 và OPD-005. Nếu chọn wizard, cần cập nhật DES-006 cho khớp.
- **ĐÃ QUYẾT ĐỊNH 2026-11-12 (PO):** OPD-006 chốt **wizard 3 bước** — AI Studio (`1:3088`, `1:2939`, `1:2818` → page 08 `07.5`–`07.7`) thuộc **MVP**. Cần cập nhật tên/AC của DES-006 và thêm route wizard vào sitemap. OPD-005 (Challenge Support) vẫn mở.

### PSD-07 — Bố cục màn quyết định của sinh viên
- **Hướng PO**: giữ bố cục hai cột (trái: tình huống; phải: phương án).
- **Bằng chứng**: frame `1:906` hiện là **một cột 768px**, hai khối "Cột trái" và "Cột phải" xếp chồng theo chiều dọc. Quy ước student hiện hành là Top Bar + cột 768px (P2 §1 "capped-width column").
- **Đề xuất**: PO xác nhận chuyển sang hai cột (cần quy ước độ rộng mới cho màn này) hay giữ một cột. Đây là thay đổi thiết kế, làm ở giai đoạn sau khi được duyệt.

### PSD-08 — Nút xác nhận sau khi chọn phương án
- **Bằng chứng**: `1:906` có nút "Xác nhận Phương án A & Xem Diễn biến Tiếp theo"; P2 §1 ghi chọn là chuyển ngay, không có bước chặn.
- **Đề xuất**: PO quyết định và cấp mã quyết định. Mục này chưa có mã OPD.

### PSD-09 — Google Sign-In
- **Hướng PO**: loại khỏi MVP.
- **Bằng chứng**: `01_MASTER-TASKS §4.6` xếp OAuth/SSO vào Post-MVP (Phase 2).
- **Đề xuất**: xếp **PHASE 2** (không phải OUT OF SCOPE) theo backlog. Nút Google trên `1:2`, `1:52`, `1:122` sẽ được gỡ khỏi bản MVP khi PO duyệt sửa thiết kế.
- **ĐÃ QUYẾT ĐỊNH 2026-11-12 (PO):** hướng trên được thay thế. Đăng nhập/đăng ký bằng **Google và Microsoft** thuộc **MVP**, trên 00.3, 00.4, 00.5 của page 08 (component `EB/Social Sign-in`); đăng nhập quản trị không có. SSO LDAP/SAML của trường vẫn ngoài phạm vi. Việc còn mở: quy tắc gán vai trò khi đăng nhập lần đầu, liên kết khi trùng email với tài khoản mật khẩu, có giới hạn domain email trường hay không (liên quan OPD-008), và bổ sung task BE/FE/QA vì `01_MASTER-TASKS §4.6` vẫn ghi Post-MVP.

### PSD-10 — Các phần tử MVP còn chờ quyết định
| Phần tử | Frame | Quyết định |
|---|---|---|
| Thông báo kích hoạt giảng viên | `1:122` | OPD-008 |
| Nội dung xóa khóa học | `86:2682` | OPD-014 — **ĐÃ QUYẾT ĐỊNH 2026-11-16: lưu trữ mềm** (hộp thoại lưu trữ) |
| Sửa case sau xuất bản | `88:2343` | OPD-007 — **ĐÃ QUYẾT ĐỊNH 2026-11-27: versioning để Post-MVP**; case có attempt bị khóa (D5) |
| Tiếp tục lượt làm dở | `1:972` | OPD-003 — **ĐÃ QUYẾT ĐỊNH 2026-11-27: tiếp tục đến terminal** |
| Giới hạn số lượt | `86:2712` | OPD-004 |
| Cách xác định quyết định then chốt | `1:619` | OPD-002, D-06 |
| Gợi ý phản hồi bằng AI | `1:1702` | OPD-010 |
| Cột mã số sinh viên | `1:1852` | D-04 |
| Trường `student_analysis` | `1:384` | D4-13 |
| Nút xuất CSV | `1:1493` | Thuộc OPD-011 (đã chốt A 2026-11-12: export CSV ẩn danh trong nền tảng) |
| Sửa khóa học (có route, không có frame) | — | PO xác nhận có trong MVP |
| Phạm vi responsive | Tất cả | PO quyết |

### PSD-11 — D5: attempt khi case rời `PUBLISHED` (ĐÃ QUYẾT ĐỊNH 2026-11-27)
**ĐÃ QUYẾT ĐỊNH 2026-11-27 (PO):** Case đã có ít nhất một attempt không được chuyển `PUBLISHED` → `DRAFT`; case chưa có attempt vẫn chỉnh sửa như hiện tại. Attempt đang làm dở được tiếp tục đến terminal; attempt đã hoàn thành và reflection vẫn xem lại được. OPD-007 (versioning) để Post-MVP. Triển khai: `specs/013-attempt-publish-lock/`, Jira EBA-113. Phần dưới là bản tóm tắt trình PO ngày 2026-11-27, giữ lại để truy nguyên.
Mục này chỉ tóm tắt dữ kiện và các lựa chọn để PO quyết. **Không có lựa chọn tạm thời nào được triển khai** (AGENTS rule 5; policy 02 §5).

**Hiện trạng trên `develop` `cf3a6a5`:**
- **Chuyển trạng thái:** backend cho phép `PUBLISHED → DRAFT` (`backend/src/modules/case/case.service.ts`, `ALLOWED_TRANSITIONS`). Giao diện `03.6` không có nút này, nhưng API cho phép giảng viên sở hữu case làm.
- **Sau khi về `DRAFT`:** giảng viên sửa được cấu trúc cây. Sửa case `APPROVED`/`PUBLISHED` vẫn phải về `DRAFT` trước.
- **Attempt mới:** chỉ bắt đầu được khi case `PUBLISHED` (`startAttempt`).
- **Attempt đã tồn tại:** trong `backend/src/modules/branching-attempt/branching-attempt.service.ts`, các đường `getAttempt`, `chooseOption`, `saveRetrospectiveReasoning`, `submitReflection` và `getAttemptsByCase` **không** kiểm tra trạng thái case (`specs/011-case-access-hardening/spec.md` §4, `BLOCKED-ON-D5`). Sinh viên có lượt dở vẫn đi tiếp được trên một case đã về `DRAFT`, kể cả khi cây đang bị sửa. Ngược lại, phần đọc reasoning (`reasoning.service.ts`, `GET reasoning/:id` và `GET branching-attempts/:attemptId/reasonings`) đã lọc case `PUBLISHED`.
- **Quy tắc liên quan:**
  - INV-01: sinh viên không bao giờ thấy case không `PUBLISHED` (`.agents/rules/feature-case-review.md`, FND §4–§6);
  - attempt là bất biến, retry tạo lượt mới;
  - OPD-007 yêu cầu giữ lịch sử attempt khi sửa cấu trúc case đã xuất bản (`version = version + 1`), nhưng chính sách khóa, gỡ xuất bản hay phiên bản mới vẫn mở.

**Ba trường hợp và các lựa chọn PO cần chọn:**

| Trường hợp | Lựa chọn | Phụ thuộc |
|---|---|---|
| 1. Lượt đang làm dở khi case rời `PUBLISHED` | (a) chặn đi tiếp cho tới khi case xuất bản lại; (b) cho làm nốt trên phiên bản cây lúc bắt đầu; (c) đóng hoặc hủy lượt đó | (b) cần lưu phiên bản cây hoặc chặn sửa cấu trúc (OPD-007). Hành vi "tiếp tục làm dở" là OPD-003 |
| 2. Lượt đã hoàn thành trước khi case rời `PUBLISHED` | (a) vẫn xem Journey Review và kết quả, chỉ đọc; (b) ẩn cho tới khi case xuất bản lại | (a) cần xác định nội dung hiển thị nếu cây đã bị sửa (OPD-007) |
| 3. Mở lại lịch sử, kết quả, reflection | (a) xem chỉ đọc, không gửi mới; (b) xem và vẫn gửi reflection / reasoning; (c) ẩn | Liên quan tới việc nhận xét của giảng viên trên lượt cũ |

**Câu hỏi phụ cần PO xác nhận:** có giữ khả năng `PUBLISHED → DRAFT` ở API hay không. Đây là phạm vi OPD-007. Trên `develop`, đây là đường duy nhất trong `ALLOWED_TRANSITIONS` làm case rời `PUBLISHED`.

**Phụ thuộc (lịch sử):** EBA-113 chờ D5; D5 đã chốt ngày 2026-11-27, EBA-113 được triển khai trong spec 013.

## 3. Thứ tự đề xuất
1. PSD-01 (OPD-001), PSD-04 (OPD-015 + OPD-008) — khung điều hướng.
2. PSD-06 (OPD-006, OPD-005), PSD-07, PSD-08 — các luồng chính.
3. PSD-02, PSD-03 — mâu thuẫn Proposal ↔ backlog.
4. PSD-05, PSD-09, PSD-10.

Sau khi PO duyệt, bước tiếp theo mới là sửa thiết kế trên Figma (cần phê duyệt riêng, kèm kiểm tra không ảnh hưởng frame gốc và component dùng chung).
