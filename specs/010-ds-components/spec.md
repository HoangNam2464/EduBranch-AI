# Feature Specification: Component dùng chung — trạng thái nhấn, số thẳng hàng, chữ đọc được, ô nhập không nhảy, "—" có lý do

**Feature Branch**: `fix/ds-components` (từ `origin/develop` `7f98534`)
**Feature directory**: `specs/010-ds-components`
**Created**: 2026-11-23 · **Status**: Draft, chờ PO duyệt G1–G7
**Parent**: FE-025 (Shared App Shell & shared states, Jira `EBA-88`); bước 2 của `docs/design/DESIGN-DIRECTION.md`
**G0**: PO, chat 2026-11-23: "… rồi tới bước 2 là các component dùng chung"

## 1. Bối cảnh (đo trên `develop` `7f98534`)

- [DỮ-KIỆN] **Trạng thái nhấn**: `frontend/src/components/ds/buttonStyles.ts:17-21` chỉ biến thể `primary` có `active:`; `secondary`, `ghost`, `danger` không có. R01 §5.2 yêu cầu mọi phần tử tương tác có hover, focus-visible, pressed, disabled.
- [DỮ-KIỆN] **Số thẳng hàng**: `tabular-nums` không xuất hiện lần nào trong `frontend/src`. Giá trị của `MetricCard` (`MetricCard.tsx:74`, `:100`) và các con số đếm đổi độ rộng theo chữ số. R01 §3.3: số liệu dùng `tabular-nums`.
- [DỮ-KIỆN] **Chữ thông tin dùng `ink-muted`** (R01 §3.3: `ink-muted` chỉ cho placeholder/disabled/trang trí) trong component dùng chung: nhãn `MetricCard` dạng compact (`MetricCard.tsx:99`), nhãn và link của `Breadcrumb` (`Breadcrumb.tsx:44`, `:48`), nhãn bước của `CaseLifecycleStepper` (`:45`, `:72`). Ngoài `ds/` còn 91 chỗ dùng `ink-muted` trong page; xử lý theo từng nhóm màn ở bước 4, không ở spec này.
- [DỮ-KIỆN] **Ô nhập nhảy bố cục**: `Field.tsx` chỉ render dòng gợi ý/lỗi khi có nội dung (`below && …`); khi lỗi xuất hiện, cả form bị đẩy xuống. R01 §4: dòng lỗi có chỗ cố định.
- [DỮ-KIỆN] **"—" không có lý do**: `MetricCard` hiện giá trị trang nhận được; khi API không có số, trang truyền "—" mà người dùng không biết vì sao. R01 §4: "—" chỉ khi API không có giá trị, kèm tooltip nói lý do.

## 2. Phạm vi

**Trong phạm vi** (chỉ `frontend/src/components/ds/` và test của chúng)
- `buttonStyles.ts`: trạng thái nhấn cho `secondary`, `ghost`, `danger` (cả biến thể nút công khai nếu có cùng thiếu sót).
- `MetricCard.tsx`: `tabular-nums` cho giá trị; nhãn compact đổi sang `ink-secondary`; thêm prop tùy chọn `emptyReason` — khi có, giá trị hiển thị "—" kèm lý do (tooltip `title` và `aria-describedby`/chữ ẩn cho trình đọc màn hình).
- `Breadcrumb.tsx`, `CaseLifecycleStepper.tsx`: chữ thông tin đổi từ `ink-muted` sang `ink-secondary`.
- `Field.tsx`: dòng gợi ý/lỗi luôn giữ chỗ cao 16px (kể cả khi trống), không làm form nhảy.

**Ngoài phạm vi, giữ nguyên**
- Page nào truyền `emptyReason` cho `MetricCard` (làm ở từng nhóm màn, bước 3–4); 91 chỗ `ink-muted` trong page; bảng (chưa có component bảng dùng chung); trạng thái rỗng cấp trang (Statistics, bước 3).
- Màu, kích thước, bo góc hiện tại của các component.

## 3. Acceptance Criteria (tất cả là [ĐỀ-XUẤT] cho tới khi PO duyệt)

- **AC-B1**: mọi biến thể `Button` (primary, secondary, ghost, danger) có trạng thái nhấn nhìn thấy được, dùng token có sẵn; hover, focus-visible, disabled không đổi.
- **AC-M1**: giá trị `MetricCard` (mọi biến thể) dùng `tabular-nums`; nhãn compact đọc được (`ink-secondary`).
- **AC-M2**: `MetricCard` có `emptyReason` thì hiện "—" và lý do qua tooltip và cho trình đọc màn hình; không có `emptyReason` thì hiển thị như cũ.
- **AC-C1**: `Breadcrumb` và `CaseLifecycleStepper` không còn dùng `ink-muted` cho chữ thông tin; độ tương phản đạt AA.
- **AC-F1**: `Field` giữ chỗ dòng gợi ý/lỗi; khi lỗi xuất hiện hay biến mất, các ô bên dưới không dịch chuyển (đo bằng vị trí ô kế tiếp trước/sau).
- **AC-Q**: `npm run lint`, `npm test`, `npm run build` exit 0; test đơn vị cho `buttonClassName` (có class nhấn cho 4 biến thể) và `MetricCard` (`emptyReason`); 3 vòng duyệt trên trình duyệt: (V1) các màn dùng component này — dashboard giảng viên, Khóa học, Case Study, Thống kê, Hồ sơ, Admin dashboard — ở 1024/1280/1440/1920, VI/EN, ảnh trước/sau; (V2) nhấn giữ từng loại nút, nhập sai trong form đăng ký/hồ sơ để thấy lỗi mà form không nhảy; (V3) kiểm bàn phím (Tab, focus) và độ tương phản chữ đã đổi.
