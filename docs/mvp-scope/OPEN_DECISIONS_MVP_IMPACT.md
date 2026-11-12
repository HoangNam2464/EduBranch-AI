# Open Decisions — MVP Impact Assessment

> **Trạng thái**: `DRAFT — CHỜ PROJECT OWNER PHÊ DUYỆT` · Ngày: 2026-11-01
> **Nguồn OPD**: `docs/OPEN_PRODUCT_DECISIONS.md` v1.1.2, **chỉ có trên nhánh `feature/design-system`, chưa merge vào `develop`**. Mọi OPD đang `Status: OPEN`, `Approval: PENDING`. Tài liệu này **giữ nguyên trạng thái đó** và không chọn phương án thay PO.
> **Quy tắc**: Frame phụ thuộc vào OPD chưa duyệt có thể giữ làm phương án tham khảo, nhưng **không được gắn nhãn Ready for Development**.

---

## 1. Phân loại theo mức chặn

| Mức | Định nghĩa | OPD |
|---|---|---|
| **A. Chặn chốt giao diện** | Mỗi phương án dẫn đến một tập màn hình/route khác nhau. Không thể lock UI khi chưa chọn. | OPD-001, OPD-005, OPD-006, OPD-011, OPD-015 |
| **B. Chặn một trạng thái hoặc thành phần UI** | Màn chính đã lock được, nhưng một dialog, banner, nút hay copy phụ thuộc phương án. | OPD-002, OPD-003, OPD-004, OPD-007, OPD-008, OPD-009, OPD-010, OPD-014 |
| **C. Chỉ ảnh hưởng implementation** | Giao diện gần như không đổi giữa các phương án. | OPD-012, OPD-013 |

Ngoài ra có **các quyết định mới chưa có trong danh sách OPD** (mục 4). Hai quyết định D-01 và D-02 thuộc mức A và quan trọng hơn mọi OPD.

---

## 2. Phân tích chi tiết các OPD được yêu cầu

### OPD-001 — Cách sinh viên vào khóa học: Link trực tiếp hay Mã mời + Dashboard
- **Mức**: A (chặn chốt Student shell)
- **Bằng chứng hiện hành nghiêng về Option B (chỉ dùng link)**: PROJECT_OVERVIEW §Primary Actors; P0 §1 *"No dashboard/list screen exists in the approved sitemap — do not invent one"*; P2 §1 *"There is no student browse page"*; SITE-ARCHITECTURE §5.3 không có route danh sách; DES-009 AC-3 "Copy Student Link"; không có bảng `course_enrollments`; không có task.
- **Bằng chứng cho Option A**: chỉ có Figma Page 1 (1:1305, 1:1202, 1:1084, mã mời trên 1:2431, 1:2258, 1:1465).

| Tác động | Option A: Hybrid (mã mời + dashboard) | Option B: Chỉ link trực tiếp |
|---|---|---|
| Màn hình | +3 màn SV, thêm mã mời trên 3 màn GV, Student shell cần nav | Giữ đúng 15 routes. Bỏ hiển thị mã mời. |
| Backlog | Không có task nào. Cần phân rã mới (BE enrollment, FE dashboard, QA isolation) mà không có SP dành sẵn. | Không phát sinh. |
| DB/API | `course_enrollments`, `POST /courses/enroll`, `GET /student/courses`, `GET /student/dashboard` | Không có |
| Rủi ro | Phạm vi tăng ở Sprint 4 (đang 138 SP). Kéo theo quy tắc thống kê "học viên của lớp". | Sinh viên phải giữ link. Không có "nhà" cho nhiều lượt làm. |
| Phụ thuộc | Cần làm rõ: thống kê/nhắc hạn tính trên "sinh viên đã ghi danh" hay "sinh viên đã mở link" | — |

- **Frame bị ảnh hưởng**: 1:1305, 1:1202, 1:1084, 1:2431 (dòng mã mời), 1:2258 (mã mời), 1:1465 (câu tự cấp mã lớp).
- **Trạng thái frame cho đến khi có quyết định**: giữ làm tham khảo, **không Ready for Dev**.

### OPD-007 — Chỉnh sửa case sau khi xuất bản (khóa cấu trúc hay tạo phiên bản)
- **Mức**: B (chặn variant `PUBLISHED` của action bar và copy hộp thoại xuất bản)
- **Mâu thuẫn tài liệu cần lưu ý**: OPD-007 đề xuất Option A (khóa cấu trúc). Nhưng spec chính thức `05_FIGMA.md` DES-009 đã mô tả **Option B**: nút *"Unpublish (Create v2 Draft)"*, `Version Pill (v1)`, copy *"Structural edits will require creating a new version"*. P1 §4 thì chỉ yêu cầu cảnh báo, không chọn cơ chế. DB đã có `cases.version INTEGER DEFAULT 1`, nhưng chưa có `parent_case_id`.

| Tác động | Option A: Khóa cấu trúc, chỉ sửa chữ | Option B: Tạo phiên bản v2 |
|---|---|---|
| UI | Banner "cấu trúc đã khóa"; không có Unpublish | Nút "Unpublish (Create v2 Draft)", version pill, danh sách phiên bản |
| DB/API | Kiểm tra `attempts_count > 0` trên CRUD node/option | `parent_case_id`, clone cây, link sinh viên trỏ phiên bản nào |
| QA | Test chặn sửa cấu trúc | Test toàn vẹn attempt giữa các phiên bản (QA-013) |

- **Frame bị ảnh hưởng**: 1:3219 (version pill), 1:1444 (copy), Page 2 03.6 (1:8484, variant Published), 1:2583 ("Nhân bản").
- **Đề xuất**: PO cần chọn và **cập nhật DES-009** cho khớp. Hiện spec DES-009 và đề xuất OPD-007 đi hai hướng.

### OPD-008 — Xác minh tài khoản Giảng viên
- **Mức**: B (thông báo trên form đăng ký GV; tab "chờ duyệt" của Admin)
- **Bằng chứng**: FR-AUTH-01 cho tự đăng ký với vai trò bất kỳ. `users.is_active DEFAULT TRUE`. FR-AUTH §12 yêu cầu chặn đăng nhập khi `is_active=false` (code chưa làm). Context Diagram: Admin *"Manage accounts & roles"*.

| Tác động | A: Admin duyệt | B: Whitelist domain | C: Tự kích hoạt |
|---|---|---|---|
| UI | Thông báo chờ duyệt, màn đăng nhập báo "đang chờ", Admin queue | Thông báo theo domain | Bỏ thông báo |
| Phụ thuộc | **Cần OPD-015 có UI Admin**, hoặc duyệt bằng script | Không cần Admin UI | Không |
| BE | `is_active=false` cho LECTURER, `PUT /admin/users/:id/approve` | Regex domain | Không đổi |

- **Liên kết**: OPD-008 Option A gần như kéo theo OPD-015 Option A/B. Nên quyết định hai OPD này cùng lúc.
- **Frame**: 1:122 (đoạn thông báo), 1:4025 (tab chờ duyệt), 26:148 (email kích hoạt, chưa có nguồn).

### OPD-011 — Rubric đánh giá chất lượng case: trong nền tảng hay công cụ ngoài
- **Mức**: A (có hay không 2 màn: 1:2081 Lecturer, 1:4511 Admin)
- **Bằng chứng mạnh hơn OPD gốc ghi nhận**: Proposal §4 liệt kê *"Quantitative Evaluation module… with rubric-based scoring of case quality and survey collection"*. Bảng Project Team giao cho một thành viên *"Frontend – Quantitative Evaluation UI"*. Research Question đã *confirmed*. **Nhưng** backlog 84 task không có task nào cho evaluation, và FEATURE-EVALUATION ghi phương thức là *"Open / To Be Decided"*. Survey trong nền tảng ghi rõ là post-MVP.

| Tác động | A: Rubric trong nền tảng + CSV | B: Công cụ ngoài (Google Forms, CSV offline) |
|---|---|---|
| UI | 1:2081 (+ 1:4511 nếu duyệt OPD-015) | Bỏ 2 màn; giữ nút export hoặc làm bằng script |
| Backlog | **Thiếu phân rã**: cần BE `evaluation/`, FE form, QA. Không có SP dành sẵn. | Chỉ cần export telemetry (cũng chưa có task) |
| Rủi ro | Deliverable 6 phụ thuộc dữ liệu thu được trong Week 12–13 | Thao tác thủ công, dữ liệu rời rạc |

- **Nhận xét**: Đây là chỗ **Proposal và backlog lệch nhau**. Proposal có chức năng và vai trò FE riêng, backlog không có task. Dù chọn phương án nào, PO cũng cần xác nhận cách sinh **dữ liệu cho Deliverable 6**.

### OPD-014 — Phạm vi xóa và lưu giữ dữ liệu
- **Mức**: B (copy của hộp thoại xóa; có hay không thao tác "Lưu trữ")
- **Bằng chứng**: BR-MAT-03 *"cascades deletion **or** archiving"* (để mở). Code hiện tại `course.service.ts deleteCourse` chạy **`DELETE FROM courses` (xóa cứng)**. `courses.is_active` đã có nhưng chưa dùng. Page 2 00.6 copy: *"This action cannot be undone."*

| Tác động | A: Lưu trữ mềm khóa học/case | B: Xóa cứng dây chuyền |
|---|---|---|
| UI | "Lưu trữ" thay "Xóa", có thể thêm bộ lọc "Đã lưu trữ" | Hộp thoại xóa nêu rõ mất bài làm của sinh viên |
| DB | Bỏ CASCADE trên FK attempt; lọc `is_active` | Giữ CASCADE |
| Rủi ro | — | Mất dữ liệu nghiên cứu Deliverable 6 nếu xóa nhầm trong thời gian trial |

- **Frame**: 29:1106 (xóa tài liệu, ít bị ảnh hưởng vì xóa tài liệu luôn là xóa thật theo FR), Page 2 00.6 (xóa khóa học), 1:2583 ("Lưu trữ"), 1:4795/1:5043 (menu Admin).
- **Lưu ý**: Code đã đi trước quyết định (xóa cứng). Cần PO xác nhận trước khi QA viết test hành vi xóa.

### OPD-015 — Phạm vi Admin trong MVP
- **Mức**: A (0, 2 hay 10 màn)
- **Bằng chứng**: Context Diagram có Admin với 3 luồng (accounts & roles, courses, API & system logs). Deliverable 1 chỉ liệt kê *lecturer interface* và *student interface*. Backlog không có task Admin. Rule `feature-authentication.md` ghi *"Admin… not in MVP"*, trái với `00-project-foundation.md` và migration V3. SITE-ARCHITECTURE: hai vai trò.

| Tác động | A: Admin tối thiểu (login + user mgmt) | B: Đủ 10 màn | C: Không có UI, quản trị bằng script |
|---|---|---|---|
| Màn hình | 1:4025, 30:1864 (+ 1:4511 nếu OPD-011=A) | 10 màn | 0 |
| Backlog | Thiếu phân rã: BE `admin/`, FE, QA. Không có SP. | Thiếu phân rã lớn | Không phát sinh (cần runbook) |
| Tính phù hợp với Proposal | Đáp ứng "Manage accounts & roles" | Đáp ứng đủ 3 luồng | Đáp ứng bằng vận hành, nhưng không có UI |

- **Nhận xét**: Proposal yêu cầu **năng lực** Admin nhưng không yêu cầu **giao diện**. Cả 3 phương án đều có thể diễn giải là đáp ứng Proposal. Đây thực sự là quyết định của PO/Scrum Master về năng lực sprint.
- **ĐÃ QUYẾT ĐỊNH 2026-11-12 (PO):** chọn **B — đủ 10 màn**, Admin thuộc MVP, không chờ duyệt thêm. Màn "Dịch vụ AI" chỉ để xem (provider cố định trong `.env`, giữ OPD-013). Màn "Nghiên cứu & Rubric" của Admin vẫn HOLD theo OPD-011. Thiết kế: page 08, section `10 · Admin` (10.1–10.10). Việc còn lại: bổ sung task BE/FE/QA cho Admin vào `01_MASTER-TASKS.md`; sửa rule `feature-authentication.md` (đang ghi *"Admin… not in MVP"*).

---

## 3. Tóm tắt các OPD còn lại

| OPD | Chủ đề | Mức | Frame bị ảnh hưởng | Nhận xét về bằng chứng |
|---|---|:-:|---|---|
| OPD-002 | Lý lẽ trên quyết định then chốt có bắt buộc không | B | 1:619, 04.3, 1:3219 | FR-BS-07 nói *"encouraged but not required"*, tức đã nghiêng về không bắt buộc. **Page 1 1:3219 có câu "Sinh viên bắt buộc phải viết lập luận và trải qua 2 vòng phản biện AI"**, mâu thuẫn FR-BS-07 và tính tùy chọn của Challenge Support (P2 §3). |
| OPD-003 | Lượt làm dở: tiếp tục hay hủy | B | 1:972 | BE-020 có "Resumption" nên resume là IMPLIED. Chỉ hộp thoại "hủy lượt đang làm dở" phụ thuộc OPD. |
| OPD-004 | Giới hạn số lượt làm | B | 1:972, 1:790 | Không có nguồn yêu cầu giới hạn. Proposal: retry *"not automatically compared, ranked or scored"*. Chỉ ảnh hưởng trạng thái disabled của nút Retry. |
| OPD-005 | Challenge Support: modal, inline hay trang riêng | **A** | 27:321, 1:619, 05.6, 05.7 | SITE-ARCHITECTURE §5.3 đã định nghĩa **route riêng** `/student/cases/:caseId/challenge/:sessionId` (*"Dedicated full-page"*). Page 2 theo route này. OPD đề xuất modal, trái với sitemap. |
| OPD-006 | Sinh case: wizard 3 bước hay modal | **A** | 1:3088, 1:2939, 1:2818, 03.2, 03.3 | Tên task DES-006 là *"Case Generation **Modal**"*. P1 §3 và `05_FIGMA` Frame 03.2 đều là modal. Wizard không có route trong sitemap. |
| OPD-009 | SV xem phản hồi GV cho lượt Branching ở đâu | B | 1:790, 04.4 | Page 2 04.4 đã hiển thị "Lecturer feedback: Not yet provided" ngay trên màn Reflection. |
| OPD-010 | AI gợi ý phản hồi cho GV | B | 1:1702 | **P3 §2 Boundary: *"No AI-generated feedback suggestions"*** loại trừ rõ trong spec hiện hành. |
| OPD-012 | Sinh case khi một số tài liệu FAILED | C | 1:2939, 03.2 | Spec `05_FIGMA` 03.2 đã nêu chỉ chọn tài liệu `COMPLETED`. Nút Retry đã thuộc FE-005. |
| OPD-013 | Đổi AI provider khi đang chạy | C | 1:5543 → page 08 `10.7` | OPD-015 đã chọn B (2026-11-12): màn Dịch vụ AI chỉ để xem, không đổi provider trên giao diện. |

---

## 4. Quyết định mới cần PO (chưa có trong danh sách OPD)

| ID đề xuất | Câu hỏi | Mức | Vì sao chặn |
|---|---|:-:|---|
| **D-01** | **Baseline Figma cho FE/BE/QA là Page 1 (tiếng Việt, hand-drawn, mở rộng scope) hay Page 2 (tiếng Anh, bám `05_FIGMA` 1-1, 34 frame)?** Hay ghép: Page 2 làm khung, lấy một số màn Page 1 đã được duyệt? | A | Hai bộ có cấu trúc, route và scope khác nhau. FE không thể bám cả hai. |
| **D-02** | **Ngôn ngữ UI**: tiếng Anh học thuật (theo rule `01-ui-design-standards §7`) hay tiếng Việt? | A | Ảnh hưởng mọi frame, i18n FE và copy lỗi BE. Nếu chọn tiếng Việt thì phải sửa rule. |
| D-03 | Hiển thị hạn nộp trên case trong MVP? Tài liệu nói có, nhưng thiếu task và cột `due_date`. | B | Field trên dialog xuất bản và trên màn case intro |
| D-04 | Có thu thập MSSV / Khoa không? | B | Field đăng ký, hàng đợi feedback, quyền riêng tư (FR-EVAL-05) |
| D-05 | Có màn Tổng quan (dashboard) cho Giảng viên không? Màn đầu tiên hiện được spec là Courses. | B | 2 frame Page 1 (1:3490, 34:3183) |
| D-06 | "Quyết định then chốt" do giảng viên gắn cờ hay hệ thống tự xác định? | B | Checkbox trong editor, badge trong Journey Review, cần trường DB |
| D-07 | Có tạo case thủ công trong MVP không? Có nút trong DES-006, không có task BE. | B | Nút "Create Manual" trên 03.1 |

---

## 5. Thứ tự quyết định đề xuất

```
Vòng 1 — trước khi lock bất kỳ màn nào:   D-01 (baseline) → D-02 (ngôn ngữ)
Vòng 2 — lock khung điều hướng:          OPD-001 (student entry) → OPD-008 (duyệt GV; OPD-015 đã quyết 2026-11-12: Admin MVP, đủ 10 màn)
Vòng 3 — lock các luồng chính:           OPD-006 (modal/wizard) → OPD-005 (Challenge container) → OPD-011 (rubric)
Vòng 4 — lock trạng thái phụ:            OPD-007 (+ sửa DES-009) → OPD-014 → OPD-002 → OPD-009 → OPD-010 → D-03..D-07
Không chặn UI:                           OPD-003, OPD-004, OPD-012, OPD-013
```
