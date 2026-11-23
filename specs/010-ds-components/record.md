# Feature Record: 010-ds-components [FE-025]

> Theo `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md` §4. **Created**: 2026-11-23.

## 1. Discover
- Nhánh `fix/ds-components` từ `origin/develop` `7f98534`.
- Nguồn: R01 §3.3, §4, §5; `docs/design/DESIGN-DIRECTION.md` §3 bước 2; `docs/design/audit/UI-AUDIT.md` §3.
- Đo bằng `grep` trên `frontend/src` (kết quả trong `spec.md` §1). Không có PR mở nào sửa `frontend/src/components/ds/` ngoài PR #84 (`PublicFooter.tsx`, không thuộc phạm vi này).

## 2. Gate log
| Gate | Ngày | Nguyên văn |
|---|---|---|
| G0 | 2026-11-23 | PO: "… rồi tới bước 2 là các component dùng chung" |
| G1–G6 | 2026-11-23 | PO (gộp) chọn "Duyệt spec 010" cho câu hỏi "Duyệt spec 010 (bước 2, component dùng chung) để bắt đầu code?" (phạm vi nêu trong câu hỏi = `spec.md` §2) |
| G7 | 2026-11-23 | Cùng câu trả lời. Phạm vi: T001–T006 |

Nhánh đã merge `develop` `8123fbc` (PR #84 đã merge) thành `eb5252c` trước khi code.

## 3. Analyze (Claude)
- Mỗi AC có task; không task nào ngoài phạm vi; không thêm thư viện, không đổi API.
- Không xung đột AGENTS.md, FND, R01 (spec thực hiện R01 §3.3, §4, §5.2).

## 4. Implement (Antigravity) và review (Claude), 2026-11-23

**Implement T001–T005**: Antigravity, headless (`agy --print`, quyền mặc định), conversation `384856ef-dd24-433a-b81c-6930ebdf8090`, 16:58–17:12 (+07:00), `status: SUCCESS`, không có thao tác bị từ chối. Kết quả chi tiết và danh sách `ink-muted` còn lại (đều là placeholder, disabled, chấm trạng thái, icon trang trí) trong handoff `FE-025-DS-COMPONENTS.md` §2 (ngoài repo).

**Review của Claude (QG2)**: đọc toàn bộ diff (5 component, 3 file test mới, dòng `test` của `package.json`). Hai phát hiện:
- R1 (đạt, không cần sửa): `Field` luôn giữ dòng mô tả; `aria-describedby` chỉ trỏ vào dòng đó khi có chữ.
- R2 (Medium, đã sửa): nút công khai `tonal` và `danger` có `active:` trùng màu với `hover:`, nên khi nhấn trông như khi rê chuột (không đạt AC-B1). Không có token đậm hơn; Claude dùng `active:brightness-95` (không thêm mã màu) và thêm test "trạng thái nhấn khác trạng thái hover" cho mọi biến thể; test này báo lỗi khi bỏ phần sửa (3 ca hỏng), đạt khi có phần sửa.

**Kiểm tra chạy lại bởi Claude** (worktree, sau R2):
| Lệnh | Exit | Kết quả |
|---|---|---|
| `npm run lint` | 0 | — |
| `npm test` | 0 | 298/298 (thêm `buttonStyles.spec.ts`, `MetricCard.spec.ts`, `Field.spec.ts`) |
| `npm run build` | 0 | — |
| `node scripts/l10n-approval-check.mjs` (dev) | 1 | 1380 lỗi, có sẵn trên `develop`, không lỗi mới |
| `git diff --check` | 0 | — |

**Vòng duyệt trên trình duyệt** (Chrome qua Playwright, dev server của nhánh ở cổng 5173, backend Docker, dữ liệu seed; "trước" = container build từ `develop` `8123fbc`):
- **V1** 8 màn (dashboard, Khóa học, Case Study, Thống kê, Hồ sơ của giảng viên; Bàn học, Hồ sơ của sinh viên; Admin dashboard) × 1024/1280/1440/1920 × VI/EN = 64 ảnh: không màn nào cuộn ngang; lỗi console chỉ có 404 đã biết ở Admin dashboard (EBA-95); so pixel trước/sau 0,00 % (Admin 0,01 %) — bố cục không đổi. `tabular-nums`: dashboard giảng viên 4 số, Admin 3 số (trước: 0).
- **V2** form: hộp thoại "Tạo khóa học" bấm tạo khi trống — vị trí 3 ô trước −24/0/+24 px, sau 0/0/0 px; lỗi hiện đúng ("Tên khóa học cần ít nhất 2 ký tự.", "Nhập mã môn học."); không có request ghi dữ liệu. Nút: nhấn khác hover ở nút primary của app (`rgb(34,63,104)` → `rgb(27,50,83)`), primary và secondary công khai.
- **V3** màu chữ: `ink-secondary` #696A70 đạt 5,4:1 trên nền trắng và 5,0:1 trên canvas (AA ≥ 4,5:1); `ink-muted` cũ #909198 chỉ 3,1:1 (tính theo WCAG từ giá trị token).
- **NOT VERIFIED trên trình duyệt** (đã kiểm bằng diff và tính tương phản): nhãn `MetricCard` dạng compact (chỉ có ở Thống kê, không hiện vì chưa có dữ liệu bài nộp), bước "sắp tới" của thanh duyệt case (dữ liệu seed chỉ có 2 case đã xuất bản; không tạo case mới để tránh đổi dữ liệu) và breadcrumb ở Cài đặt admin (màn đang báo lỗi vì API admin chưa có, BE-032, PR #80).

**Phát hiện ngoài phạm vi (không sửa ở spec này)**:
- Trang đăng ký không dùng dòng lỗi của `Field`: một khung lỗi chung chèn trên form đẩy mọi ô xuống 60 px và chỉ báo một lỗi mỗi lần. Đề xuất sửa ở nhóm màn đăng nhập/đăng ký.
- Cài đặt admin: trạng thái lỗi vì thiếu API admin (BE-032).
