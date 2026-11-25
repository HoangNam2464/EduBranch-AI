# Feature Record: 006-app-fluid-layout [FE-025]

> Theo `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md` §4. **Created**: 2026-11-21.

## 1. Discover
- Workspace: worktree `D:\CAPSTONE_2026\EduBranch-AI-fluid`, nhánh `fix/app-fluid-layout`, tạo từ `origin/develop` `6f903f2`.
- Nguồn đã đọc:
  - Code: `AppShell.tsx:81-83`, `Toast.tsx:69-75`, `ReviewStudyPage.tsx:401,413`, `AdminDashboardPage.tsx:323,544`
  - Tài liệu: GDS §5.9
  - Memory: quyết định PO 2026-11-17 (Centered Container) và 2026-11-20
- Vòng 0 (bản nháp đã hoàn tác): 13 màn × 3 độ rộng, tràn ngang 0 ở mọi màn. Lỗi phát hiện ghi trong `spec.md` §1.

## 2. Gate log
| Gate | Ngày | Nguyên văn |
|---|---|---|
| G0 | 2026-11-21 | PO trả lời "Anh/chị muốn đổi thành thế nào?": "Tràn theo màn hình"; và "Áp dụng độ rộng mới cho những phần nào?": "Chỉ trong app". Kèm yêu cầu: "quy trình spec của github đâu… ít nhất phải test lại 3-4 vòng về giao diện" |
| G1–G6 | 2026-11-21 | PO (gộp): "Duyệt, bắt đầu", trả lời câu hỏi "Duyệt spec 006 (G1–G6 gộp + G7) để bắt đầu?". Duyệt luôn các đề xuất AC-F3 (80 ký tự) và AC-T1 (toast dưới phải, đổi GDS §5.9) |
| G7 | 2026-11-21 | Cùng câu trả lời. Phạm vi: T001–T008 |

## 3. Analyze (Claude)
- Mỗi AC đều có task; không có task nào ngoài phạm vi.
- Không xung đột với AGENTS.md hay FND.
- AC-F1 thay thế quyết định PO 2026-11-17 cho app shell, có G0 làm căn cứ.
- AC-T1 đổi GDS §5.9, cần PO duyệt ở G1.

## 4. Implement và các vòng duyệt giao diện (Claude, 2026-11-21)

Sửa T001–T003 theo `plan.md`. Mỗi vòng dùng script Playwright (scratchpad, không commit) đăng nhập 3 vai trò, mở 15 màn, đo tràn ngang, dòng chữ dài (>95 ký tự), key i18n thô và độ tương phản, rồi chụp ảnh. Claude xem từng ảnh bằng mắt.

### V1: VI, giao diện sáng, 1366/1920/2560 (15 màn × 3)
- Tràn ngang: 0. Key thô: không còn (`oneSubmissionNote` đã hiện chữ).
- Lỗi phát hiện và cách sửa:
  - Đoạn văn dài trong Review Study (bối cảnh, vấn đề): 1050–1690px. Sửa: `max-w-[80ch]`.
  - Câu hướng dẫn quyết định then chốt ở Case review: 1050–1690px. Sửa: `max-w-[80ch]`.
  - Mô tả khóa học trên dashboard và trang Khóa học của sinh viên ở 2560px. Sửa: `max-w-[80ch]`.
- Giữ nguyên: banner một dòng "Case đã phê duyệt…". Khối rộng nhưng chữ chỉ khoảng 610px.

### V2: EN, dark mode và light, 1440 (15 màn × 2)
- Lỗi: nút "Open course" trong panel Chi tiết khóa học không đọc được ở dark mode (chữ `#111827` trên nền tối). Sửa: dùng token `text-ink` / `border-line`.
- Ngoài phạm vi, báo PO:
  - Token chữ phụ (`ink-muted`, footer) có độ tương phản 2,9 trên nền canvas (WCAG cần 4,5). Đây là token design system và ảnh hưởng Figma.
  - Admin Dashboard có nhãn "Tuần 40…" viết cứng bằng tiếng Việt, số 186 bịa và nhật ký viết cứng (FE-031).
- Tiếng Việt còn lại khi xem ở EN đều là dữ liệu người dùng (tên người, tên khóa, nội dung case).

### V3: thao tác thật, 1440/1280/1024 (và 390 để tham khảo)
- Thu gọn/mở sidebar: đúng ở 1440 và 1024.
- Hộp thoại lưu trữ: đúng.
- Toast (lưu trữ khóa fixture `QA901`, sau đó khôi phục bằng SQL local): x=1056, cách phải 24, cách đáy 24, không đè header. Ở 1024: cách phải 24, cách đáy 24.
- Lỗi ở 1024: header tràn 34px vì tên người dùng lòi ra ngoài. Sửa: phần tên/vai trò `hidden xl:flex`; ô tìm kiếm `w-56`, từ 1440 trở lên `w-80` như Figma.
- Lỗi ở 1024: thanh lọc màn Case Study tràn. Sửa: cho phép `flex-wrap`.
- Lỗi ở 1280 và 1366 (đã có sẵn trên develop) trên màn Quản lý khóa học:
  - Tiêu đề "Tất cả khóa học" bị ép 3–4 dòng; nút "Tạo khóa học mới" bị che; chữ "5 tệp lỗi lập chỉ mục" tràn khỏi thẻ.
  - Sửa toolbar: `flex-wrap`, tiêu đề `whitespace-nowrap`, ô tìm kiếm `max-w-[180px]` dưới 1536.
  - Sửa CourseCard: hàng số liệu được `flex-wrap`; các `min-w` chỉ áp dụng từ 1440.
  - Sửa panel chi tiết: 360px dưới 1440, 424px từ 1440 như Figma.
- 390px: app chưa hỗ trợ mobile (tràn 414px). Đây là phạm vi desktop, không thuộc spec.

### V4: hồi quy, 1280/1366/1440/1920/2560 (15 màn × 5)
- Tràn ngang: 0, trừ `/lecturer/feedback` ở 1280 (43px). Trang đó trên develop là bản cũ và được viết lại toàn bộ ở PR #68, nên kiểm lại ở QA của #68.
- `npm run build`: 0. `npm test`: 169/169. `npm run lint`: 0, chỉ còn 3 cảnh báo có sẵn ở dòng không sửa (`CasesPage.tsx:96,122`, `CoursesPage.tsx:133`).
- l10n dev: 1424 lỗi (bằng develop), số key đã đăng ký từ 191 lên 192.
- Visual QA ở 1440 (28 frame, develop `6f903f2` so với nhánh này):
  - 25 frame không đổi.
  - 02.1: 8,33 → 9,57%. 02.2: 21,60 → 22,80%. Lý do: hàng số liệu của thẻ khóa học xuống dòng thay vì cắt tên giảng viên thành "TS. Nguy…".
  - 10.2b: 10,57 → 10,77%.
  - Nguyên nhân gốc: lề app 32px (từ 17/11), còn Figma là 20px, nên danh sách hẹp hơn Figma 68px. Câu hỏi cho PO: có đổi lề sang 20px như Figma không.

## 5. Converge
| AC | Code | Bằng chứng | V |
|---|---|---|---|
| F1 | `AppShell.tsx` | V1/V4: nội dung rộng 1684px ở 1920, 2324px ở 2560 | PASS |
| F2 | `CourseCard.tsx`, `CoursesPage.tsx`, `CasesPage.tsx`, `HeaderActions.tsx` | V4: tràn ngang 0 ở 1280–2560 (trừ trang feedback cũ, chuyển sang #68) | PASS WITH CONDITIONS (người chịu trách nhiệm: PR #68) |
| F3 | 4 file, `max-w-[80ch]` | V1b: không còn đoạn văn dài, trừ banner một dòng | PASS |
| T1 | `Toast.tsx`, GDS §5.9 | V3: số đo vị trí toast ở trên | PASS |
| I1 | vi/en + registry | V1: không còn key thô | PASS |
| Q | — | 4 vòng V1–V4 ở trên | PASS |

## 6. QG2: kiểm tra độc lập (agent `visual-qa-verifier`, không phải người sửa) và vòng sửa V5

**Lần 1** (diff md5 `d694c43e…`): kết luận chưa đạt.
- F1, T1, trang landing/auth: PASS.
- F3, dark mode + EN: PASS WITH CONDITIONS.
- **F2 failed**, với các lỗi:
  - **D1:** số trên biểu đồ "Case theo khóa học" của Admin nằm xa thanh (648px ở 1920).
  - **D2:** CourseCard cao 130px đúng ở 1440 (stats rớt xuống dòng 3).
  - **D3:** chữ bị ép ở 1280 (Review Study: cột viết bài 448px, hẹp hơn cột thông tin 476px).
- Lỗi phụ: comment trong `Toast.tsx` lỗi thời; test 02.3 tìm nút "Xóa khóa học" đã đổi tên.
- 5 frame landing/auth (00.2–00.5, 10.1) vượt budget từ trước do khung auth 1280px căn giữa. Không do diff này.

**Sửa (V5):**
- **D1:** số đứng ngay sau thanh (cách 12px), track tối đa 480px. Trường hợp không có case cũng giữ cột số thẳng hàng.
- **D2:** panel Chi tiết khóa học 360px dưới 1536, 424px từ 1536.
- **F3:** `max-w-[68ch]`.
- **D3:** cột thông tin Review Study 420px dưới 1440, 478px từ 1440; dòng yêu cầu dùng `text-balance`.
- Sửa comment toast.
- `tests/visual/screens.ts` 02.3: bước test tìm nút "Lưu trữ khóa học An ninh mạng".

**Lần 2** (diff md5 `50913…`):
- D1: PASS.
- D2: PASS WITH CONDITIONS. Cao 114px ở mọi độ rộng. Điều kiện: ở 1440 panel 360px, Figma vẽ 424px.
- F3: PASS (80 và 83 ký tự ở dòng đầy đủ đầu tiên).
- D3: PASS WITH CONDITIONS.
- Lỗi mới N1, N2 đã sửa và Claude đo lại:
  - N1: không còn chữ lẻ ở dòng yêu cầu (`text-balance`).
  - N2: cột số thẳng hàng, x=792 ở 1280 và x=996 ở 1920, gồm cả khóa không có case.

**Hồi quy sau V5** (Claude):
- Tràn ngang: 0 ở 15 màn × 1280/1440/1920/2560. Ngoại lệ: trang feedback cũ, đã chuyển sang PR #68; #68 đo 0 ở 1280/1440/1920.
- Card 114px ở 1366/1440/1536/1920.
- build 0; test 169/169; oxlint các file sửa: 0.
- Visual QA 1440:

| Frame | develop | sau sửa |
|---|---|---|
| 02.1 | 8,33 | 8,25 |
| 02.2 | 21,60 | 21,67 |
| 02.3 | không chạy (timeout) | 16,13 |
| 10.2 | 10,71 | 10,99 |
| 10.2b | 10,57 | 11,12 |
| Các frame khác | — | không đổi |

- 10.2 và 10.2b tăng vì số được đặt sát thanh thay vì ở mép phải như Figma.

**Điều kiện cần PO chấp nhận:**
1. Panel Chi tiết khóa học 360px ở 1440 (Figma 424px).
2. Số trên biểu đồ Admin đặt sát thanh (Figma đặt ở mép phải).
3. Lề app vẫn 32px (Figma 20px). Nếu PO chọn 20px theo Figma thì panel có thể trở lại 424px ở 1440.

**Ngoài phạm vi, báo PO:**
- Token chữ phụ có độ tương phản 2,9–3,75.
- Admin Dashboard có dữ liệu bịa (FE-031).
- Tiêu đề trang Review Study bị cắt trong header ở 1280/1440 (shell dùng chung).
- App chưa hỗ trợ mobile.
- Test 02.6: nút xóa tài liệu chỉ hiện khi hover nên bước test không bấm được.
