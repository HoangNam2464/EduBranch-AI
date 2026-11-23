# Feature Record: 011-courses-materials [FE-026]

> Theo `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md` §4. **Created**: 2026-11-23.

## 1. Discover
- Nhánh `fix/courses-materials` từ `origin/develop` `0e78075`.
- Nguồn: R01 §3–§5, §8; `docs/design/DESIGN-DIRECTION.md` §3 bước 4; `docs/design/UX-SCREEN-NOTES.md` (02.x).
- Kiểm tra (Claude, 2026-11-23): script Playwright trong scratchpad (không commit), Chrome, container frontend build từ `0e78075`, backend Docker, dữ liệu seed. 3 màn × 1024/1280/1440/1920 × VI/EN; trạng thái 500/403/đang tải bằng chặn request; hộp thoại Tạo khóa học; tải tài liệu qua hộp thoại.
- Dữ liệu thử (PO duyệt 2026-11-23: chỉ database Docker local, dữ liệu mẫu, gỡ sau khi kiểm): khóa học `[QA] Kiểm tra giao diện khóa học` (`QA-UI-01`, id `34618937-f227-481b-930d-aef3d6b92251`) và 3 file PDF mẫu (nội dung tiếng Anh giả định, 1004 byte). Sau khi kiểm: 3 tài liệu đã xóa qua API (HTTP 200), khóa học đã lưu trữ qua API (`is_active=false`; ứng dụng không có xóa hẳn khóa học). 9 khóa học khác không bị đụng.
- Kết quả xử lý thật: file PDF mẫu → `COMPLETED`, 1 đoạn trích, ~1,4 giây/lượt. Nghi ngờ ban đầu "danh sách không cập nhật sau khi tải" đã kiểm lại và **không đúng** (danh sách tăng 1→2→3, kể cả khi đóng hộp thoại giữa chừng); không đưa vào spec.

## 2. Gate log
| Gate | Ngày | Nguyên văn |
|---|---|---|
| G0 | 2026-11-23 | PO: "làm đi" (thứ tự: kiểm nhóm màn Khóa học & Tài liệu → spec 011 với lỗi thật; cho phép tải PDF mẫu vào database Docker local và gỡ sau) |
| G1–G6 | — | chờ PO |
| G7 | — | chờ PO |

## 3. Analyze (Claude)
- Mỗi phát hiện F1–F10 có AC và task; không task nào ngoài phạm vi; không thêm thư viện, không đổi API.
- Hai phát hiện backend (lộ `stored_object_key`/lỗi thô qua API; thiếu API xem đoạn trích) để ngoài phạm vi và báo PO.
- Không PR mở nào sửa `CoursesPage.tsx`, `MaterialsPage.tsx`, `RagSourceInspectorPage.tsx` (kiểm lúc soạn).
