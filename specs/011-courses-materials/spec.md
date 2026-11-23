# Feature Specification: Nhóm màn Khóa học & Tài liệu — không vỡ ở 1024px, vùng kéo thả dùng được, báo lỗi đúng và dễ hiểu

**Feature Branch**: `fix/courses-materials` (từ `origin/develop` `0e78075`)
**Feature directory**: `specs/011-courses-materials`
**Created**: 2026-11-23 · **Status**: G1–G7 do PO duyệt 2026-11-23 (xem `record.md` §2)
**Parent**: FE-026 (Courses & Materials, Jira `EBA-89`); bước 4 của `docs/design/DESIGN-DIRECTION.md`, nhóm màn đầu tiên
**G0**: PO, chat 2026-11-23: "làm đi" (cho thứ tự: kiểm nhóm màn Khóa học & Tài liệu trên `develop` với dữ liệu thật → spec 011 với lỗi thật)

## 1. Kiểm tra trên `develop` `0e78075` (2026-11-23, Chrome qua Playwright, backend Docker, dữ liệu seed + một khóa học thử đã gỡ)

Màn: `/lecturer/courses`, `/lecturer/courses/:id/materials`, `/lecturer/courses/:id/materials/:materialId/rag`, hộp thoại Tạo khóa học và Tải tài liệu; 4 độ rộng × VI/EN; trạng thái rỗng, đang tải, lỗi 500, 403; tải file PDF thật (xử lý xong `COMPLETED` sau ~1,4 giây) và file sai định dạng.

| ID | Phát hiện | Bằng chứng | Mức |
|---|---|---|---|
| F1 | Trang Tài liệu vỡ ở 1024px: cuộn ngang 58–59px; khối "Tải lên tài liệu để AI lập chỉ mục" bị ép, tiêu đề xuống 4 dòng, vùng kéo thả mỗi dòng một chữ, nút "Chọn tài liệu" bị đẩy ra ngoài màn hình | đo `scrollWidth`, ảnh 1024 VI/EN | Cao |
| F2 | Vùng nét đứt ghi "Kéo thả tài liệu vào đây hoặc nhấn để chọn tệp" nhưng không nhận kéo thả cũng không nhận nhấn (`MaterialsPage.tsx:472` không có `onDrop`/`onClick`); chỉ nút bên trong mở một hộp thoại thứ hai có vùng kéo thả thật | code + thao tác | Cao |
| F3 | Danh sách tài liệu hiện nguyên lỗi kỹ thuật cho người dùng: `AI Service error (500): {"detail":"Internal ingestion error"}` (`MaterialsPage.tsx:64` ưu tiên `processingError` của backend) — R01 §5.6 | ảnh CS402 | Cao |
| F4 | Báo sai loại lỗi: 403 (không có quyền) hiện "Không tải được thông tin khóa học — Kiểm tra kết nối mạng rồi thử lại" kèm Thử lại; 500 cũng nói "kiểm tra kết nối mạng" | chặn request 403/500 | Trung bình |
| F5 | Danh sách khóa học ở 1024px: khung "Chi tiết khóa học" chiếm khoảng nửa màn, thẻ khóa học chỉ còn cột chữ hẹp, tên khóa xuống dòng từng chữ ("[QA] / Kiểm / tra / …"), tên giảng viên bị cắt | ảnh 1024 VI/EN | Cao |
| F6 | Trang Đoạn trích ở 1024px: ba thẻ số bị bóp, nhãn bị cắt ("Đoạn trích", "Số trang", "Dung lượng"), giá trị "1004 B" xuống dòng, chú thích "Sẵn sà…"; ở 1440 bản EN vẫn cắt "The system does not record a page count" — R01 §5.4 | đo phần tử bị cắt, ảnh | Trung bình |
| F7 | Tiêu đề trang bị cắt: trang Tài liệu ở 1024 và 1280px với tên khóa ~32 ký tự; trang Đoạn trích ở 1024px; tiêu đề bị cắt không có tooltip | đo `h1` | Trung bình |
| F8 | Chữ nhỏ và mờ: gợi ý trong "Quy trình xử lý" cỡ 10px màu `ink-muted` (`MaterialsPage.tsx:464`) — R01 §3.3 (tối thiểu 12px, `ink-muted` không cho thông tin) | code | Thấp |
| F9 | Nút chỉ có icon trong hộp thoại Tải tài liệu: nút đóng 20px, nút xóa file 16px (R01 §4: tối thiểu 32px) | code | Thấp |
| F10 | Tải xong, hộp thoại vẫn mở với nút chính "Tải lên 0 tệp" bị vô hiệu; người dùng phải bấm Hủy để đóng | thao tác | Thấp |

Đạt, giữ nguyên: trạng thái đang tải (khung chờ đúng hình dạng), trạng thái rỗng, lỗi tải danh sách có Thử lại trong vùng nội dung, kiểm tra định dạng file (file `.txt` báo "Chỉ hỗ trợ tệp PDF và DOCX"), danh sách tự cập nhật sau khi tải (kể cả khi đóng hộp thoại giữa chừng), không màn nào tràn ngang từ 1280px trở lên.

## 2. Phạm vi

**Trong phạm vi**: F1–F10, chỉ ở frontend: `pages/courses/CoursesPage.tsx`, `pages/materials/MaterialsPage.tsx`, `pages/materials/RagSourceInspectorPage.tsx`, khóa dịch VI/EN mới của các màn này, và test.

**Ngoài phạm vi, báo riêng**
- [Backend, bảo mật] API `GET /courses/:id/materials` trả nguyên dòng dữ liệu, gồm `stored_object_key` (đường dẫn file nội bộ trên MinIO) và `processing_error` thô — trái quy tắc "không trả cột nội bộ cho client". Cần sửa ở backend bằng mapper/DTO; đề xuất một spec backend riêng.
- [Backend, thiếu API] Trang Đoạn trích báo "Chưa có API xem đoạn trích của tài liệu": chức năng chính của trang chưa có dữ liệu.
- Màn khóa học của sinh viên, Case Study của khóa học: nhóm màn sau.

## 3. Acceptance Criteria (tất cả là [ĐỀ-XUẤT] cho tới khi PO duyệt)

- **AC-1 (1024px)**: ba màn không cuộn ngang ở 1024/1280/1440/1920px, VI và EN; mọi nút bấm nằm trong màn hình và bấm được; không chữ nào trong thẻ, nhãn, nút bị xuống dòng từng chữ hoặc bị cắt khi còn chỗ. Dưới `xl` (1280px) bố cục được phép xếp chồng (ví dụ khối tải lên xuống dưới, khung chi tiết khóa học thu hẹp hoặc nằm dưới danh sách); từ 1440px trở lên giữ bố cục hiện tại.
- **AC-2 (kéo thả)**: vùng kéo thả trên trang nhận cả kéo thả và nhấn/Enter: thả file vào hoặc chọn file đều mở cùng luồng tải lên với file đã được thêm sẵn; không còn vùng "kéo thả" chỉ để trang trí.
- **AC-3 (lỗi dễ hiểu)**: danh sách tài liệu không bao giờ hiện chuỗi lỗi thô của backend; lỗi xử lý hiện một câu dễ hiểu (VI/EN) theo loại lỗi; chi tiết kỹ thuật không hiện cho người dùng.
- **AC-4 (đúng loại lỗi)**: 403 hiện trạng thái "không có quyền" (không có Thử lại vô ích, có đường quay về danh sách khóa học); 404 hiện "không tìm thấy"; 500 hiện lỗi máy chủ; chỉ lỗi mạng mới nói "kiểm tra kết nối".
- **AC-5 (tiêu đề)**: tiêu đề trang không bị cắt ở 1440px với tên khóa đến 60 ký tự; khi buộc phải cắt (màn hẹp, tên rất dài) thì có tooltip hiện đủ tên.
- **AC-6 (thẻ số trang Đoạn trích)**: nhãn và chú thích không bị cắt ở mọi độ rộng đã nêu; giá trị không xuống dòng.
- **AC-7 (chữ và vùng bấm)**: không còn chữ thông tin dưới 12px hay màu `ink-muted` ở các màn này; nút chỉ có icon có vùng bấm tối thiểu 32px.
- **AC-8 (sau khi tải)**: khi mọi file trong hộp thoại đã tải xong, hộp thoại báo xong và nút chính là "Xong" (đóng hộp thoại); nếu còn file lỗi thì giữ hộp thoại với lựa chọn thử lại.
- **AC-Q (kiểm tra)**: `npm run lint`, `npm test`, `npm run build` exit 0; test đơn vị cho ánh xạ mã lỗi → thông điệp và cho câu lỗi xử lý tài liệu; 3 vòng duyệt trên trình duyệt với dữ liệu thật (V1 3 màn × 4 độ rộng × VI/EN, so ảnh trước/sau; V2 tải file thật bằng kéo thả và bằng nhấn, file sai định dạng, đóng/mở hộp thoại; V3 lỗi 403/404/500/mạng bằng chặn request, bàn phím và focus). Dữ liệu thử chỉ trong database Docker local, gỡ sau khi kiểm (điều kiện PO 2026-11-23).
