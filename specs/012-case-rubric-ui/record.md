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
| QG3 | PASS WITH CONDITIONS | Xem §5. Điều kiện: các lỗi có sẵn ngoài phạm vi (§6), và breadcrumb của Figma chưa làm được. |
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
