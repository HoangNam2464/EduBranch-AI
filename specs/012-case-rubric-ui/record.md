# Record — spec 012 (FE-029 màn Rubric chất lượng case)

> Theo `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md`. Nội dung tiếng Việt.
> **Created**: 2026-11-26. Nhánh `feature/case-rubric`, tạo từ `develop` `aa5e408`.
> **Người triển khai**: Antigravity, theo gói bàn giao `.agent-handoff/FE-029-CASE-RUBRIC.md` (lưu cục bộ, không commit). Phần service, types và test được port có chọn lọc từ PR #74 (tác giả Nguyen Duc Huong).
> **Người review**: Claude. Claude chỉ tự sửa 4 cỡ chữ cho đúng thang R01; chi tiết ở §4.

## 1. Trạng thái gate

| Gate | Trạng thái | Ghi chú |
|---|---|---|
| Ủy quyền + D3 | PASS | PO trong chat ngày 2026-11-26: "Frontend: Tạo branch mới từ develop, tách FE-029 từ PR #74, tích hợp BE-033 và sửa các lỗi đã phát hiện." PO chốt D3a–D3d cùng ngày (`spec.md` §1). |
| QG1 | PASS | Xem §3. |
| QG2 | PASS | Xem §4. |
| QG3 | PASS WITH CONDITIONS | Xem §5, §7, §8. Breadcrumb và nút quay lại đã làm ở §7. Lỗi tiêu đề bị cắt và cuộn ngang ở §6 đã sửa ở §8. Điều kiện còn lại: các lỗi có sẵn ngoài phạm vi ghi ở cuối §8. |
| QG4 | PASS WITH CONDITIONS | Mọi key `rubric.*` và `caseReview.openRubric` đã đăng ký `PROPOSED`, không có lỗi. Script vẫn exit 1 vì nợ đăng ký key có sẵn từ trước (§3). |
| QG5–QG7 | Chờ | Chờ CI, PO duyệt, rồi kiểm tra lại trên `develop`. |

## 2. Phạm vi đã làm

- **Service:** `services/rubricService.ts` gọi `/evaluation/rubrics` (list/get/create/put/delete).
- **Mapper + test:** `services/mappers/rubric.ts` (đổi tên từ `rubricLogic.ts` của PR #74 theo Rule N1) và `services/mappers/rubric.spec.ts`.
- **Types:** các kiểu rubric trong `types/index.ts`.
- **Màn dùng chung:** `pages/rubric/RubricWorkspace.tsx`. `CaseRubricPage` và `AdminRubricPage` chỉ là wrapper mỏng bọc màn này.
- **Route:** thêm `PATHS.ADMIN.CASE_RUBRIC = "/admin/rubric/:caseId"`, khai báo route và tiêu đề shell.
- **Lối vào (D3c):**
  - Admin: nút "Xem" ở 10.6 dẫn tới rubric của case đó.
  - Giảng viên: trang review case có nút "Rubric nghiên cứu".
- **Ngôn ngữ:** chuỗi VI/EN đầy đủ, đăng ký `PROPOSED`. Đã xóa các key "chưa có API" và `g6.rubric.*` không còn dùng.

## 3. QG1 — các lệnh Claude tự chạy (2026-11-26)

| Lệnh | Exit | Kết quả |
|---|---|---|
| `frontend/`: `npm run lint` | 0 | 0 lỗi. Các cảnh báo nằm trong file khác, có từ trước. |
| `frontend/`: `npm test` | 0 | 88 suite, 309/309 |
| `frontend/`: `npm run build` | 0 | — |
| `node scripts/l10n-approval-check.mjs` | 1 | Nhánh: 1348 lỗi. Baseline `develop` `aa5e408`: 1380 lỗi. Nhánh không thêm lỗi mới. 0 lỗi cho key `rubric.*` và `caseReview.openRubric`. 28 lỗi `UNREGISTERED g3.rubric.*` có sẵn trên `develop`, không thuộc FE-029. |

## 4. QG2 — review độc lập (Claude)

Đã đọc toàn bộ diff của 18 file. Kết quả đối chiếu với gói bàn giao và hợp đồng BE-033:

- Request/response khớp `evaluation.controller.ts`, `rubric.dto.ts` và `toRubric`.
- 409 → thông báo lỗi, rồi chuyển sang chế độ sửa phiếu của chính người dùng.
- 403 hoặc 404 của case → hiện trạng thái tương ứng, không hiện form chấm.
- Chỉ người tạo phiếu thấy nút sửa/xóa.
- Xóa phải xác nhận qua `Dialog` của DS; báo thành công bằng `Toast`.
- Chỉ dùng token màu có trong `@theme`; không có dark mode, không có chuỗi hard-code.

**Claude đã tự sửa:** 4 cỡ chữ `13px`/`15px` → `14px`/`12px`/`16px`, theo thang R01 (22/20/16/14/12).

**Giới hạn ghi chú:**
- UI giới hạn 1000 ký tự theo Figma 10.8; backend chấp nhận tới 2000.
- Ghi chú dài hơn 1000 ký tự chỉ có thể được tạo qua gọi API trực tiếp. Khi mở lại ở UI, bộ đếm hiện vượt giới hạn và người dùng chỉ xóa bớt được. Đánh giá: Low.

## 5. QG3 — kiểm tra trên trình duyệt với dữ liệu thật

**Môi trường:**
- Frontend của nhánh (Vite, cổng 5173).
- Backend của PR #88 (cổng 8080), dùng DB tạm `edubranch_live_tmp`.
- Seed: 2 giảng viên, 1 admin, 2 sinh viên, 3 khóa học, 5 case.
- Phiếu đánh giá được tạo qua API và qua UI.
- Chrome qua Playwright.

**Vòng 1 — 9 màn × 4 độ rộng (1024/1280/1440/1920) × VI/EN = 72 ảnh:**
- Không cuộn ngang trên các màn rubric.
- Ở 1440, không màn rubric nào bị cắt tiêu đề.
- Không có lỗi API ngoài các ca 403/404 cố ý.

**Vòng 2 — thao tác thật: 19/19 PASS.** Các ca đã kiểm:
- Trạng thái ban đầu (D3d): nút Lưu bị khóa khi chưa chấm, và vẫn khóa khi mới chấm 2/3 tiêu chí.
- Chấm điểm:
  - Mũi tên trên bàn phím chọn được điểm.
  - Điểm trung bình tính đúng (4.0).
- Lưu và sửa:
  - Lưu xong có `Toast`, form chuyển sang chế độ sửa, danh sách tăng lên 3.
  - Tải lại trang: form mở ở chế độ sửa với giá trị đã lưu, ghi chú UTF-8 đúng.
- Xóa:
  - Xóa qua `Dialog`: danh sách về 2, form trở về trống, nút Lưu khóa lại.
- Admin:
  - 5 nút "Xem" ở 10.6 dẫn tới `/admin/rubric/:caseId`, không còn link nào sang route giảng viên.
  - Mục sidebar đang chọn là "Nghiên cứu & Rubric".

**Ảnh đã xem và đối chiếu với Figma 10.8:**
- Case header: tên case, badge chế độ học, `course_code · name`, điểm trung bình.
- Form chấm 3 tiêu chí.
- Cột phiếu đã lưu, mỗi phiếu ghi tên case.
- Trạng thái chưa chọn case (D3a) và trạng thái 403.

**Còn lệch Figma:** header shell chưa có breadcrumb "Case Study › Rubric nghiên cứu" và nút quay lại, vì shell hiện chưa có chỗ cho các thành phần này. Không tự thêm cơ chế shell mới.

## 6. Phát hiện ngoài phạm vi (có sẵn, không sửa trong spec này)

1. **Cuộn ngang ở 1024px trên trang review case.** Nguyên nhân là nút "Sao chép đường dẫn" trong `CaseGovernanceBar` (mép phải ở 1173px). File này không nằm trong diff.
2. **Cuộn ngang ở 1024px trên trang 10.6 Admin.** `scrollWidth` là 1080; diff chỉ đổi link của nút "Xem".
3. **Tiêu đề shell bị cắt ở 1024 và 1280** khi tiêu đề dài (ví dụ "Rubric nghiên cứu chất lượng tình huống", hoặc tên case trên trang review). Ở 1440 vẫn đạt yêu cầu của R01.

## 7. Vòng 2 — breadcrumb và nút quay lại theo Figma 10.8 (PO 2026-11-26)

- **Shell:**
  - `useShellHeader({ back, crumbs })` là tùy chọn, chỉ được dùng ở màn Rubric khi đã mở case. Khi chưa chọn case (D3a) không có nút quay lại và breadcrumb.
  - Nút quay lại cỡ 40×40, không có nền, chevron màu `ink`, đúng Figma 10.8.
  - Breadcrumb cỡ 12/16: bước "Case Study" màu `ink-muted`, bước hiện tại màu navy và có `aria-current`.
  - Header đổi sang grid: tiêu đề được ưu tiên chiều rộng; ô tìm kiếm có cơ sở 160px và chỉ giãn tới 224/320px khi còn chỗ (Rule F3).
- **Đích của nút quay lại:**
  - Admin: về `/admin/cases`.
  - Giảng viên: về trang review của case.
  - Khi case trả 403 hoặc 404: về danh sách Case Study, tránh ngõ cụt.
- **Review độc lập** (agent `visual-qa-verifier`, 176 ảnh chụp, so sánh bố cục cũ và mới): phát hiện F1–F4 (Medium) và F5 (Low). Đã sửa F1–F4. F5 là 2 cảnh báo lint `only-export-components`, giống pattern các hook đã có trong file; giữ nguyên.
- **Đo lại sau khi sửa** (1024/1280/1440/1920, VI/EN):
  - Breadcrumb không bị cắt, không đè lên cụm action.
  - Không có cuộn ngang.
  - Từ 1440 trở lên, tiêu đề không bị cắt.
  - Không có hồi quy header trên 19 route của 3 role.
- **Lệnh:**
  - `npm run lint`: exit 0.
  - `npm test`: 314/314.
  - `npm run build`: exit 0.
  - `l10n-approval-check`: exit 1. Nhánh 1348 lỗi, `develop` `c94c954` 1380 lỗi; không có lỗi mới, các key mới đều `PROPOSED`.
  - Vòng thao tác 19/19.
- **Điều kiện còn lại:** tiêu đề vẫn bị cắt ở 1024 khi đã mở case, và ở 1280 với tiêu đề tiếng Việt của giảng viên ("Rubric nghiên cứu chất lượng tình huống"). Ô tìm kiếm khi đó đã co hết cỡ (160px), không còn chỗ. Trước thay đổi này, tiêu đề của các màn khác cũng đã bị cắt ở 1024.

## 8. Vòng 3 — tiêu đề, cuộn ngang ở 1024–1280 và thuật ngữ (PO 2026-11-26)

Yêu cầu PO: sửa tiêu đề bị cắt ở 1024/1280, sửa cuộn ngang ở trang Review Case và trang 10.6 trong một phạm vi UI nhỏ, chuẩn hóa `Case Studies` thành `Case Study` theo R01 §6. Figma 10.8 giữ nguyên (đối chiếu chỉ đọc: tiêu đề admin "Nghiên cứu & Rubric" vẫn khớp).

- **Tiêu đề shell** (`AppShell.tsx`): tiêu đề được xuống tối đa 2 dòng thay vì bị cắt (R01 §5 cho phép tiêu đề xuống dòng; R01 §8 cấm cắt tiêu đề ở 1024). Có `title` để xem đủ nếu tên case quá dài.
- **Ô tìm kiếm** (`HeaderActions.tsx`): dưới 1280px thu thành nút 40×40. Bấm nút hoặc Ctrl K mở ô nhập dạng panel dưới cụm action. Enter tìm theo `?q=` như cũ rồi đóng; Esc đóng và trả focus về nút; bấm ra ngoài thì đóng. Từ 1280px trở lên giữ nguyên hành vi vòng 2 (160 → 224, 320 ở ≥1440).
- **Thanh điều phối Review Case** (`CaseGovernanceBar.tsx`): ở 1024 cả 4 trạng thái đều tràn (tới 374px); ở 1280 thì DRAFT/REVIEWED/APPROVED tràn (tới 118px). Nguyên nhân: stepper cố định 720px cộng hai cụm nút. Dưới 1440: cụm nút ở hàng trên, stepper chiếm trọn hàng dưới. Từ 1440: một hàng cao 84px như Figma 03.4/03.5, stepper rộng tối đa 720px.
- **Trang 10.6** (`AdminCasesPage.tsx`): hai thẻ biểu đồ chỉ đặt cạnh nhau từ 1280 (trước là 1024, khi thẻ "Chế độ học theo case" bị ép vào cột 194px).
- **Cùng nguyên nhân, màn giảng viên** (`CasesPage.tsx`): hai thẻ biểu đồ chỉ đặt cạnh nhau từ 1440. Trước đó ở 1024/1280 chú thích trạng thái bị cắt ("Đã phê d…") và danh sách "Case cập nhật gần đây" bị bóp.
- **Thuật ngữ:** 22 chuỗi trong `en.json` đổi "Case Studies" → "Case Study". Các câu bị sai ngữ pháp khi thay được viết lại theo câu tiếng Việt gốc. Registry cập nhật 12 dòng, vẫn `PROPOSED`.

**Kiểm tra** (DB tạm `edubranch_ui_tmp`, Chrome qua Playwright):
- `npm run lint`: exit 0.
- `npm test`: 314/314.
- `npm run build`: exit 0.
- `l10n-approval-check`: exit 1, 1348 lỗi, bằng đúng vòng 2. Không có lỗi mới.
- Header, 21 route × 4 độ rộng × VI/EN = 168 lần chụp: không tiêu đề nào bị cắt, không cuộn ngang, header luôn cao 84px, breadcrumb không bị cắt hoặc đè.
- Thanh điều phối, 4 trạng thái × 4 độ rộng × VI/EN = 32 lần đo: không tràn.
- Panel tìm kiếm: 22/22 thao tác đạt.
- `/admin/cases` và `/lecturer/cases`: không cuộn ngang ở cả 4 độ rộng.

**Còn lại, có sẵn, ngoài phạm vi:**
- Thẻ case trong "Kho Case Study" ở 1024 cắt nhãn đếm "1 nút" và meta "Không dùng cây" (`CaseLibraryCard`).
- Backend sập khi Postgres ngắt kết nối pool đang rảnh: pool `pg` không có listener `error` (`database.service.ts`). Gặp khi Docker Desktop tự dừng trong lúc QA.

**Review độc lập vòng 3** (Antigravity, chỉ đọc, HEAD `d0a2a79`):
- Header: 168 lần đo, không tiêu đề nào bị cắt, không cuộn ngang. PASS.
- Panel tìm kiếm: PASS.
- Thanh điều phối: 32 lần đo, không tràn. PASS.
- Trang 10.6 và `/lecturer/cases`: không cuộn ngang, không chú thích nào bị cắt. PASS.
- Chức năng đã kiểm trước đó vẫn đúng: nút quay lại, "Xem" ở 10.6.
- Thuật ngữ: failed, với 2 phát hiện. Đã sửa cả hai:
  - (Medium) Còn 9 chuỗi "case studies" viết thường, một chuỗi hiện ở `/register`. Đã viết lại theo câu tiếng Việt gốc, giữ "Case Study".
  - (Low) Câu đếm số đọc sai ("Showing 5 of 5 Case Study"). Câu đếm nay dùng "cases" ("Showing 5 of 5 cases", "4 cases"); các tiêu đề trạng thái dùng "Case Study list".
- Đã đăng ký `PROPOSED` mọi key EN sửa ở vòng 3 mà trước đó chưa có trong registry: 21 key.
- Kết quả sau khi sửa:
  - `l10n-approval-check`: 1327 lỗi, giảm từ 1348. 0 lỗi ở 32 key đã sửa.
  - lint exit 0; test 314/314; build exit 0.
  - Không còn "case studies" trên `/lecturer/cases`, `/admin/cases` và `/register` (EN).
