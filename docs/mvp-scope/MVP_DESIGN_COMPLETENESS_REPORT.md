# MVP Design Completeness Report

> **Trạng thái**: `DRAFT — CHỜ PROJECT OWNER PHÊ DUYỆT` · Ngày: 2026-11-01
> **Bộ tài liệu**: `MVP_SCOPE_EVIDENCE_MATRIX.md` · `FEATURE_HIERARCHY_AND_BACKLOG_MAPPING.md` · `FIGMA_FRAME_SCOPE_REGISTER.md` · `AUTHENTICATION_SCOPE_ANALYSIS.md` · `OPEN_DECISIONS_MVP_IMPACT.md` · tài liệu này.
> **Không có thay đổi nào** đã được thực hiện trên Figma, backlog, code hay database.

---

## 1. Kết luận tổng quát

1. **Chưa thể lock giao diện ngay.** Có 2 quyết định chặn ở cấp nền tảng mà danh sách OPD chưa có: **D-01 baseline Page 1 hay Page 2** và **D-02 ngôn ngữ UI**. Sau đó còn 5 OPD chặn ở cấp màn hình (001, 005, 006, 011, 015).
2. **Phần lõi MVP đã có đủ thiết kế, nhưng ở Page 2.** Page 2 phủ đủ 15 routes và 15 task DES, kèm đủ trạng thái chung. Page 1 phủ lõi tốt nhưng **thiếu** Landing, 403/404/Loading/Empty/Error, DES-004 đủ 4 trạng thái và stepper DES-009 trên editor. Page 1 cũng **thừa** khoảng 20 frame thuộc HOLD/PHASE 2/NO BASIS.
3. **Có 3 nhóm chức năng Proposal yêu cầu nhưng backlog không có task**: Evaluation/Rubric, hiển thị Deadline, Admin. Thiết kế cho các nhóm này không thể Ready for Dev cho đến khi PO quyết định cách xử lý.

---

## 2. Kiểm tra theo 8 câu hỏi

### 2.1. Các màn MVP đã đủ chưa?
| Route (sitemap) | Page 2 | Page 1 |
|---|:-:|:-:|
| `/` | ✅ | ❌ thiếu |
| `/login`, `/register` | ✅ | ✅ (thừa Google) |
| `/lecturer/courses` | ✅ | ✅ |
| `/lecturer/courses/:courseId/materials` | ✅ | ⚠️ thiếu đủ 4 trạng thái |
| `/lecturer/courses/:courseId/cases` | ✅ | ✅ |
| `/lecturer/cases/:caseId/review` | ✅ (Branching + Review Study variant) | ⚠️ thiếu variant Review Study editor, thiếu stepper |
| `/lecturer/cases/:caseId/feedback` | ✅ | ✅ (2 màn: hàng đợi + chi tiết) |
| `/lecturer/statistics` | ✅ | ✅ |
| `/student/cases/:caseId/branching-play` | ✅ | ✅ |
| `…/attempt/:attemptId/review` | ✅ | ✅ |
| `…/attempt/:attemptId/reflect` | ✅ | ✅ |
| `/student/cases/:caseId/challenge/:sessionId` | ✅ | ⚠️ modal, không phải route |
| `/student/cases/:caseId/review-study` | ✅ | ✅ |
| `…/review-study/:submissionId/feedback` | ✅ | ✅ |
| 403 / 404 / Loading / Empty / Error | ✅ | ❌ thiếu |

### 2.2. Luồng người dùng đã xuyên suốt chưa?
| Luồng (SITE-ARCH §6) | Đánh giá | Chỗ đứt |
|---|---|---|
| W1 Material ingestion | Đủ (Page 2) | Page 1 thiếu trạng thái PENDING/PROCESSING có progress + Retry |
| W2 AI case generation | Đủ chức năng | Hình thức chưa chốt (OPD-006). Trạng thái lỗi sinh case (toast) chưa có frame riêng trên cả hai page. |
| W3 Human-in-the-loop review | Đủ (Page 2 03.6 có 4 variant) | Variant PUBLISHED phụ thuộc OPD-007. Trạng thái **lỗi validate đồ thị** (vòng lặp, node mồ côi, chặn xóa node) có trong P1 §4 nhưng **chưa có frame** trên cả hai page. |
| W4 Branching 3 phase | Đủ | Chuyển từ Terminal sang Review: P2 nói "automatically transitioned", nhưng frame cho thấy nút bấm, cần thống nhất. Cảnh báo bỏ trống lý lẽ phụ thuộc OPD-002. |
| W5 Review Study | Đủ | — |
| W6 Challenge Support | Đủ chức năng | Vùng chứa UI (OPD-005). Trạng thái **AI đang sinh câu hỏi** (loading trong panel, P2 §3) và **AI lỗi/timeout** chưa có frame. |
| Lecturer → Student (chia sẻ link) | Đủ (Copy Student Link) | — |
| Sinh viên mở link khi chưa đăng nhập → đăng nhập → quay lại case | **Chưa thể hiện** | Không frame nào cho deep-link redirect. P0 §2 nói login thành công chuyển về "student's case route". |

### 2.3. Trạng thái cần thiết đã thiết kế chưa?
**Thiếu trên cả hai page** (P0–P4 có yêu cầu):
- Lỗi validate DAG khi lưu (P1 §4 States), chặn xóa node còn được tham chiếu.
- Publish bị disable kèm tooltip lý do (P1 §4).
- Upload lỗi 413 / 415 (P1 §2). Cần kiểm tra trong 02.2.
- Case list khi khóa học chưa có tài liệu COMPLETED: nút Generate bị disable (P1 §3). 03.2 có cảnh báo, cần xác nhận.
- Challenge Support: loading và lỗi AI.
- Reflection đã nộp, chỉ đọc (Page 1 có 1:466; Page 2 cần kiểm tra).
- Review feedback: trạng thái "giảng viên chưa phản hồi" (P4 §2). Page 2 05.2 có "Awaiting Lecturer Review".
- Statistics: trạng thái rỗng "No attempts yet" (P3 §1).
- Phiên hết hạn kèm toast (P0 §1).

### 2.4. Có thành phần thể hiện chức năng chưa được yêu cầu không?
Có, đều ở **Page 1**:

| Thành phần | Frame | Căn cứ ngược |
|---|---|---|
| Nút Google | 1:2, 1:52, 1:122 | `01_MASTER-TASKS §4.6`, FEATURE-AUTH §13 |
| "AI gợi ý", "Tạo lại phần này bằng AI" | 1:3219 | P1 §4 Boundary |
| Câu "Sinh viên bắt buộc… 2 vòng phản biện AI" | 1:3219 | FR-BS-07; Challenge Support là tùy chọn (P2 §3) |
| Thẻ "Gợi ý phân tích từ AI" cho GV | 1:1702 | P3 §2 Boundary (OPD-010 open) |
| Checkbox "Gửi thông báo in-app và email" | 1:1444 | FEATURE-NOTIFICATIONS: dispatch là Phase 2 |
| "Cần nhắc nhở hạn nộp" | 1:1493 | idem |
| Mã mời lớp | 1:2431, 1:2258, 1:1465 | OPD-001; P0 §1 |
| "ĐIỂM QUYẾT ĐỊNH 1 / 3" (lộ tổng số bước) | 1:906 | P2 §1: chiều dài nhánh thay đổi và không biết trước |
| "Nhân bản" case | 1:2583 | Không có nguồn |
| Admin login riêng, Admin dashboard, Admin settings | 1:4477, 1:3715, 1:4345 | Không có nguồn |

### 2.5. Có chức năng được yêu cầu nhưng chưa có giao diện không?
| Chức năng | Nguồn | Tình trạng |
|---|---|---|
| Hiển thị hạn nộp cho sinh viên (nếu D-03 = có) | PROJECT_OVERVIEW, FEATURE-NOTIFICATIONS §3 | Page 1 có (1:972), Page 2 không |
| Export dữ liệu nghiên cứu ẩn danh | FR-EVAL-04/05, Deliverable 6 | Chỉ có nút CSV (Page 1), chưa có luồng. Phụ thuộc OPD-011. |
| Sinh viên xem phản hồi GV cho lượt Branching | Proposal §4; FEATURE-LECTURER-FEEDBACK | Page 2 04.4 có dòng trạng thái, chưa có khối nội dung phản hồi (OPD-009) |
| Thông báo "tài khoản bị khóa / chưa kích hoạt" khi đăng nhập | FR-AUTH §12 (403) | Không có frame |
| Đăng xuất / menu người dùng | P0 §1 | Có trong shell |
| Theo dõi chi phí AI cho pilot | Proposal Risk mitigation | Không có (UNKNOWN có cần UI không) |

### 2.6. Interaction nào chưa rõ?
1. Terminal → Journey Review: tự động hay bấm nút (P2 §1 và frame lệch nhau).
2. Lưu lý lẽ hồi cứu: auto-save từng node hay lưu khi "Complete Review". Debounce chưa định nghĩa (OPD doc §7.1).
3. Mở Challenge Support từ đâu và gắn với node nào (OPD-005).
4. Retry khi đang có lượt dở (OPD-003).
5. Sửa case đã PUBLISHED (OPD-007).
6. Re-link option khi xóa node trên canvas (kéo cạnh hay dropdown). P1 cho cả hai.
7. Giới hạn ký tự: reasoning 10–2000 (SITE-ARCH), reflection chưa định nghĩa (OPD doc §7.4), topic 10–500.
8. Số node tối đa trên canvas (OPD doc §7.3).

### 2.7. Trường dữ liệu trên Figma chưa có căn cứ trong domain model
| Trường | Frame | Domain model |
|---|---|---|
| MSSV | 1:52, 1:1852, 1:4025, 1:1305 | Không có cột. FR-EVAL-05 yêu cầu loại bỏ student ID khỏi dữ liệu export. |
| Khoa / Đơn vị công tác | 1:122, 1:4025, 1:4511 | Không có |
| Mã mời / class code | 1:2431, 1:2258, 1:1465, 1:1084 | Không có (`course_code` là mã học phần, không phải mã mời) |
| Hạn nộp (`due_date`) | 1:1444, 1:972, 1:2583 | FR-NOTIF-01 có nhắc, DB không có |
| Cờ pivotal | 1:3219, 1:619 | Không có |
| Điểm rubric (Realism/Difficulty/Alignment 1–5) | 1:2081, 1:4511 | FR-EVAL-01 có, DB không có |
| Độ khó, số node mục tiêu khi sinh case | 1:2939, 03.2 | `targetNodeCount` có trong spec input. "Độ khó" **không có**. |
| Trạng thái attempt "Đang làm dở / Abandoned" | 1:1305, 1:972 | Chỉ có `is_completed`. ABANDONED là đề xuất của OPD-003. |
| Nhật ký hệ thống (JSON payload) | 1:5302 | Không có bảng audit |

### 2.8. Màn nào chưa xác định được route hoặc nguồn dữ liệu?
- Không có route trong sitemap: 1:3490, 34:3183 (dashboard GV); 1:1305, 1:1202, 1:1084 (SV); 1:2081 (rubric); toàn bộ 10 màn Admin; 1:196–1:279 (reset password); 3 bước wizard 1:3088/1:2939/1:2818 (sitemap chỉ có modal trên route cases).
- Có route nhưng **chưa có endpoint** trong tài liệu: RAG chunk viewer, lịch sử lượt làm, resume attempt, retry ingestion. Xem `FEATURE_HIERARCHY_AND_BACKLOG_MAPPING.md §3`.

---

## 3. Khuyến nghị (cần PO phê duyệt; chưa thực hiện)

| # | Khuyến nghị | Lý do | Ai quyết |
|:-:|---|---|---|
| R-1 | Quyết định D-01 trước: dùng **Page 2 làm khung baseline**, bổ sung màn từ Page 1 khi chức năng đã CONFIRMED | Page 2 truy xuất 1-1 về backlog. Giảm rủi ro FE dựng màn không có API. | PO |
| R-2 | Quyết định D-02 ngôn ngữ UI. Nếu chọn tiếng Việt thì sửa rule `01-ui-design-standards §7` trước. | Tránh FE/QA theo hai chuẩn | PO |
| R-3 | Giữ Google Sign-In, quên/đặt lại/đổi mật khẩu, nhắc hạn ở **Phase 2** theo `01_MASTER-TASKS §4.6` | Có căn cứ rõ | PO xác nhận. **2026-11-12:** PO đưa Google + Microsoft Sign-In vào MVP; phần còn lại giữ Phase 2 |
| R-4 | Gỡ khỏi baseline các thành phần có câu loại trừ rõ: nút "AI gợi ý / Tạo lại bằng AI" (1:3219), câu "bắt buộc 2 vòng phản biện" (1:3219), "1 / 3" (1:906) | Trái spec hiện hành | PO xác nhận |
| R-5 | Quyết OPD-001, OPD-015 + OPD-008 (cùng lúc), OPD-006, OPD-005, OPD-011 theo thứ tự trong `OPEN_DECISIONS_MVP_IMPACT.md §5` | Chặn lock UI | PO / Mentor |
| R-6 | Cập nhật DES-009 cho khớp với kết quả OPD-007 | Spec và OPD đang đi hai hướng | PO |
| R-7 | Với Evaluation, Deadline, Admin: PO quyết định để ngoài 4 sprint, hay phân rã trong task cha hiện có. Tôi đã liệt kê task con đề xuất nhưng **không tạo**. | Mâu thuẫn Proposal ↔ backlog | PO / Scrum Master |
| R-8 | Merge (hoặc chuyển) `OPEN_PRODUCT_DECISIONS.md` vào `develop` sau khi PO review, để OPD có vị trí chính thức | Hiện chỉ có trên `feature/design-system` | PO |
| R-9 | Bổ sung các trạng thái còn thiếu ở mục 2.3 vào baseline đã chọn | Đủ điều kiện Ready for Dev | Design (sau R-1/R-2) |
| R-10 | Đổi nhãn `[Ngoài phạm vi]` trên 3 frame sinh viên thành `[HOLD · OPD-001]` | Nhãn hiện tại kết luận vượt bằng chứng | PO xác nhận |
| R-11 | Ghi nhận lệch code với spec: login chưa chặn `is_active=false`; xóa khóa học đang xóa cứng | Không sửa code trong phạm vi này | BE lead |

## 4. Điều kiện để một frame được gắn "Ready for Development"
1. Thuộc chức năng **CONFIRMED** hoặc **IMPLIED**, và không phụ thuộc OPD/D chưa duyệt.
2. Nằm trong baseline đã chọn (D-01), đúng ngôn ngữ (D-02).
3. Có route trong sitemap, và có endpoint trong tài liệu hoặc task BE cha có AC tương ứng.
4. Có đủ trạng thái: default, loading, empty, error, permission (nếu có), và các trạng thái riêng đã nêu ở P0–P4.
5. Mọi trường dữ liệu đều có trong domain model, hoặc được đánh dấu "chờ migration" kèm task cha.
6. Dùng component và variable của page "01 · Design System".
