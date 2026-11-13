# Ghi chú UX theo màn hình — EduBranch AI

> **Cập nhật**: 2026-11-13 · **Nguồn thiết kế**: Figma file `6CtSgJPKo4jCIbB7WwCaWw`, page `08 · EduBranch – Bản hoàn chỉnh` (canonical).
> **Mục đích**: thay cho các lớp ghi chú `_note / …` đã xóa khỏi canvas. Người làm UX/FE đọc file này để biết mỗi màn dùng để làm gì, có những hành động và trạng thái nào, và các quy tắc chung phải giữ.
> **Quan hệ với tài liệu khác**: phạm vi MVP/HOLD theo `docs/mvp-scope/MVP_SCOPE_AND_FIGMA_FRAME_REGISTER.md`; token và component theo `docs/design/GLOBAL-DESIGN-SYSTEM.md`; trang công khai theo `docs/design/screens/P0-FOUNDATION.md §0`. Khi mâu thuẫn, register quyết định phạm vi, Figma page 08 quyết định giao diện.
> **Ghi chú hành vi trong Figma**: một số hành vi được gắn thẳng vào node dưới dạng *annotation* (xem ở Dev Mode). File này chép lại toàn bộ các annotation đó ở mục tương ứng.

---

## 1. Quy tắc chung (áp dụng cho mọi màn)

### 1.1 Khung ứng dụng
- Desktop 1440px. Sidebar trái dùng component `Navigation/Sidebar` (biến thể Lecturer / Admin × Collapsed False/True). Sinh viên dùng cùng sidebar với mục Bàn học, Khóa học của tôi, Tham gia lớp học.
- **Sidebar thu gọn**: nút "Thu gọn" nằm trên khu tài khoản. Bản thu gọn rộng 72px, chỉ hiện icon, ẩn nhãn; avatar và nút đăng xuất căn giữa. Mục đang chọn tô nền navy, không có vạch trắng bên cạnh. Mỗi sidebar luôn có đúng một mục đang chọn. Ví dụ: 03.4b, 05.2b, 10.2b.
- **Header dùng chung** `EB/Header Actions` cho cả 3 vai trò: ô tìm kiếm có phím tắt Ctrl K, chuyển ngôn ngữ VI | EN, nút sáng/tối, thông báo (chấm đỏ khi có tin chưa đọc), cài đặt, tài khoản. Không tạo bản riêng theo vai trò. Giao diện tối **chưa thiết kế**, nút chỉ là chỗ đặt.
- **Footer dùng chung** `EB/App Footer` luôn nằm ở đáy nội dung. Màn có ít nội dung (trạng thái trống, lỗi) dùng khung 900px để khối nội dung kéo dài và footer chạm đáy, không để khoảng trống lớn bên dưới.
- Ngôn ngữ giao diện tiếng Việt. Màu chính navy `#2A4E7F`, nhấn sky `#00A5F5`. Không dùng xanh lá làm màu thương hiệu; xanh lá chỉ dành cho trạng thái thành công.

### 1.2 Quy tắc chỉn chu (đã rút ra khi PO duyệt)
- Nút quay lại chỉ là mũi tên, không bọc ô vuông.
- Nhãn thông tin (số đếm, loại tệp, ngày, tag) dùng kiểu nhạt: nền `action/primary-subtle`, chữ navy. Nền đậm chỉ dùng cho số bước, trạng thái đang chọn, chip giá trị trong biểu đồ.
- Trong một bảng, các nút cùng cột rộng bằng nhau; các nhãn trạng thái cùng cột rộng bằng nhau và căn giữa chữ.
- Nút phân trang trước/sau có cùng kiểu và kích thước.
- Dòng danh sách cùng loại có chiều cao và khoảng cách đều. Cột phụ trong dòng (số tài liệu, số case, ghi chú) có độ rộng cố định để thẳng cột giữa các dòng; chữ dài cắt bằng "…".
- Thanh tiến độ là thanh liền, không dùng thanh vạch hay đồng hồ dạng vạch. Phần trăm đặt trong ô cố định để các thanh dài bằng nhau.
- Ô số liệu nhiều cột chia đều, nhãn và số căn giữa theo cột.
- Thanh nút cuối màn: nút phụ đứng cạnh nút chính ở bên phải; bên trái là thông tin (ví dụ "Bước 2 trên 3: …"). Không đặt hai nút ở hai mép xa nhau.
- Bộ đếm ký tự chỉ ghi "0 / 2000 ký tự", không thêm câu giải thích phía sau.
- Chữ gợi ý trong ô tìm kiếm phải nằm gọn trong ô (ví dụ "Tìm case", "Tìm trong nhật ký").
- Không để lớp ẩn, lớp chữ rỗng, menu "···" giả. Tên lớp phải khớp nội dung.
- Ảnh minh họa trong trang đăng nhập/đăng ký là **bản sao thu nhỏ** của màn thật. Mỗi khi sửa một màn có xuất hiện trong ảnh, phải sao lại ảnh đó (xem mục 3).

### 1.3 Trạng thái dữ liệu
- Đang tải: skeleton theo đúng bố cục màn (01.1).
- Trống: icon, một câu giải thích, một hành động chính (01.2).
- Lỗi tải: icon cảnh báo, câu nêu rõ cái gì không tải được, nút "Thử lại", mã lỗi kèm email hỗ trợ (01.3). Phần còn lại của trang vẫn dùng được; nút tạo mới bị vô hiệu.
- Không có kết quả tìm kiếm: nhắc lại từ khóa và nút "Xóa tìm kiếm" (01.8).
- Lỗi toàn trang 403/404/500: không có sidebar, header, footer, không có logo phía trên (01.4, 01.5, 01.7).
- Hết phiên 401: hộp thoại đè lên màn đang dùng, nút "Đăng nhập lại" (01.6).

---

## 2. Theo khu

### 00 · Tổng quan & Trang công khai

**00.2 Trang giới thiệu** — trang công khai duy nhất, dạng **một trang cuộn**. Không có trang "Cách hoạt động" hay "FAQ" riêng (00.6, 00.7 cũ đã gộp vào đây).
- Thứ tự khối: Hero → Cách hoạt động `#cach-hoat-dong` → Hai chế độ học `#hai-che-do` → vòng đời bản nháp (dải navy) → theo vai trò → Câu hỏi thường gặp `#cau-hoi` → kêu gọi → footer. Nền toàn trang `bg/canvas`, các thẻ nền trắng.
- *Annotation (thanh điều hướng)*: bấm "Cách hoạt động", "Hai chế độ học", "Câu hỏi thường gặp" thì cuộn mượt tới khối tương ứng (`scroll-margin-top` bằng chiều cao thanh điều hướng). Thanh điều hướng dính trên cùng khi cuộn; mục ứng với khối đang xem được tô đậm (scroll-spy). Từ trang Đăng nhập/Đăng ký, các mục này dẫn về `/#anchor`.
- *Annotation (nút "Xem cách hoạt động" ở hero)*: cuộn mượt tới `#cach-hoat-dong`.
- *Annotation (luồng 5 bước)*: tự chạy, mỗi bước 2.500 ms; hết bước 5 dừng 1.500 ms rồi lặp. Thẻ đang chạy nổi lên (y −4, viền accent, bóng); bước xong đổi số thành dấu ✓, đường nối chuyển nét liền; bước sau mờ 55%. Ô mô phỏng trong thẻ chạy theo thời gian của bước (tệp hiện lần lượt, thanh tiến độ 0→100%, trạng thái chuyển dần). Pill tiến độ và dòng trạng thái bên dưới đổi theo bước. Bấm thẻ hoặc pill để nhảy tới bước đó. `prefers-reduced-motion`: tắt tự chạy, hiện tất cả bước ở trạng thái hoàn thành. Tham chiếu mẫu: `HowItWorksSection.jsx` (framer-motion) trong source frontend cũ. Bước xong dùng màu navy, không dùng xanh lá.
- Dải vòng đời: Bản nháp → Đã rà soát → Đã phê duyệt → (ổ khóa "Mở cho lớp") → Đã xuất bản. Thẻ cuối nền trắng, nhãn "Sinh viên thấy từ đây".
- FAQ: tìm kiếm, chủ đề phổ biến, 4 nhóm câu hỏi dạng lưới 2 cột rộng bằng nhau (hai thẻ cùng hàng cao bằng nhau), khối liên hệ email hỗ trợ rộng bằng lưới.

**00.3 Đăng nhập** — bố cục 50/50: bên trái ảnh minh họa sản phẩm, bên phải form email + mật khẩu. Có "Tiếp tục với Google" và "Tiếp tục với Microsoft" (component `EB/Social Sign-in`, MVP theo PSD-09). "Quên mật khẩu?" là Phase 2 nên không hiện. Liên kết "Đăng ký ngay" được nhấn mạnh.

**00.4 Đăng ký · Sinh viên / 00.5 Đăng ký · Giảng viên** — một form, chọn vai trò bằng hai nút "Sinh viên" / "Giảng viên" (nhãn "Vai trò"). Sinh viên có ô Mã số sinh viên; giảng viên có ô "Khoa / Đơn vị công tác". Có đăng ký bằng Google/Microsoft. 00.5 có khối lưu ý kích hoạt tài khoản giảng viên — còn chờ **OPD-008**.

### 01 · Trạng thái dùng chung
Xem mục 1.3. Các màn 01.1–01.3 và 01.8 dựng trên màn Quản lý khóa học; 01.6 là hộp thoại đè lên màn đó.

### 02 · Giảng viên · Khóa học & Tài liệu

**02.1 Quản lý khóa học** — danh sách thẻ khóa học bên trái, chi tiết khóa học đang chọn bên phải.
- Mỗi thẻ: ảnh, nhãn "Đang dạy", tên, mã học phần, giảng viên, rồi 3 cột cố định: "x/y tài liệu sẵn sàng", "x case", ghi chú cần xử lý (đỏ/cam/xanh, cắt "…" nếu dài).
- Panel chi tiết: ô số liệu 3 cột (Lượt làm bài / Tài liệu / Case Study, căn giữa), "Cần xử lý" (tệp lỗi có nút Thử lại, tệp đang chờ, bản nháp AI chờ rà soát), "Về khóa học", "Đi tới" Tài liệu môn học / Case Study.
- Mã mời/mã tham gia lớp được giữ (OPD-001 → A).

**02.2 Khởi tạo khóa học / 02.3 Xác nhận xóa khóa học** — hộp thoại trên 02.1. Nội dung xóa khóa học còn chờ **OPD-014** (xóa cứng hay lưu trữ).

**02.4 Chi tiết khóa học — Tài liệu môn học**
- Khối tải lên có quy trình xử lý 4 bước (Tải tệp lên → Tách thành đoạn trích → Tạo vector & lập chỉ mục → Sẵn sàng cho AI trích dẫn) và vùng kéo thả (PDF, DOCX, tối đa 50 MB).
- Danh sách "Tài liệu đã tải lên" trải hết chiều ngang; góc phải tiêu đề là "2/5 đã lập chỉ mục" kèm thanh tiến độ nhỏ.
- *Annotation (danh sách tài liệu)*: dòng tài liệu gọn gồm tên tệp (1 dòng, cắt "…", tooltip tên đầy đủ) và 1 dòng phụ. Bên phải chỉ 1 chỉ báo: ✓ đã lập chỉ mục; "Đang chờ"; phần trăm + thanh tiến độ khi đang xử lý; "Thử lại" khi thất bại (dòng phụ màu đỏ nêu lý do). Bấm vào dòng đã xong để mở danh sách đoạn trích. Nút xóa chỉ hiện khi rê chuột hoặc focus vào dòng (dòng đầu vẽ ở trạng thái này).

**02.5 Tải tài liệu** — hộp thoại: vùng kéo thả, danh sách tệp chờ tải (sẵn sàng / đang tải % / lỗi định dạng / quá dung lượng), nút "Tải lên n tệp" chỉ đếm tệp hợp lệ.

**02.6 Xác nhận xóa tài liệu** — nêu đúng tên tệp và số đoạn trích sẽ mất; nút "Xóa vĩnh viễn".

**02.7 Đoạn trích của tài liệu (RAG Source Inspector, DES-005)**
- 3 ô số liệu cùng cấu trúc (icon + nhãn, số, chú thích): Đoạn trích 48 "Sẵn sàng để AI trích dẫn"; Số trang 24 "Trung bình 2 đoạn mỗi trang"; Dung lượng 2.4 MB "PDF · giới hạn 50 MB mỗi tệp". Dữ liệu lấy từ `chunk_count`, `page_number`, `size_bytes`.
- Danh sách đoạn trích chỉ ghi số trang (không ghi số ký tự).
- Cột phải: "Thông tin tài liệu" (tệp, khóa học, ngày tải lên, trạng thái) và "Cách AI dùng nguồn".

### 03 · Giảng viên · Sinh case & Kiểm duyệt

**03.1 Quản lý Case Study** — thống kê theo trạng thái và chế độ học, kho case (ô tìm "Tìm case", lọc theo trạng thái có số đếm, lọc khóa học), nút "Tạo Case mới bằng AI" mở AI Studio (07.6). Case do AI sinh có nhãn AI Draft.

**03.2 Đang sinh case nháp / 03.3 Sinh case thất bại** — hộp thoại tiến trình và thông báo lỗi trên nền 03.1.

**03.4 Trình chỉnh sửa Case Study (Branching)**
- Cột trái: thông tin tình huống (nhãn AI Draft), câu hỏi gợi ý, ô bật/tắt "Đánh dấu là quyết định then chốt" (ô viền cao 44px như ô nhập), nội dung tình huống, các phương án.
- Cột phải: cây quyết định, kiểm tra cây (topology, lỗi cấu trúc), đoạn nguồn được trích.
- Thanh duyệt cuối màn: xem 03.6.

**03.5 Trình chỉnh sửa Case Review Study** — bối cảnh & số liệu, vấn đề cần phân tích, thông tin case, phần sinh viên sẽ nộp, đoạn nguồn.

**03.6 Thanh duyệt (bảng đặc tả 4 trạng thái)** — không phải trang riêng; đây là thanh cuối trình chỉnh sửa vẽ ở 4 trạng thái. Thanh tiến độ luôn đứng yên ở giữa (khe trái và khe phải cố định 200px), chỉ nút hai bên đổi:
- Bản nháp: "Lưu & đánh dấu đã rà soát"; Phê duyệt và Xuất bản bị khóa.
- Đã rà soát: "Lưu thay đổi"; có thể Phê duyệt; Xuất bản vẫn khóa.
- Đã phê duyệt: "Trả về bản nháp" và "Xuất bản cho sinh viên".
- Đã xuất bản: chỉ còn "Sao chép đường dẫn".
- Sửa case sau khi xuất bản còn chờ **OPD-007**.

**03.7 Phê duyệt và xuất bản** — hộp thoại có danh sách kiểm tra trước khi xuất bản; nút "Xác nhận xuất bản".

### 04 · Giảng viên · Phản hồi & Thống kê

**04.1 Hàng đợi Review** — bảng bài nộp: sinh viên, thời gian, case & khóa học, lần làm, hành động, trạng thái. Nút "Đánh giá & nhận xét" / "Xem phản hồi" rộng bằng nhau; nhãn trạng thái (Chờ phản hồi / Đã phản hồi / Đã suy ngẫm) rộng bằng nhau.

**04.2 Chi tiết phản hồi lập luận (Branching)** — suy ngẫm của sinh viên, đường đi thực tế, lập luận tại quyết định then chốt, ô nhận xét (đếm ký tự), "Bài trước / Bài sau", "Lưu nháp", "Gửi phản hồi". Không chấm điểm.

**04.2b Chi tiết bài nộp Review Study** — phân tích (không bắt buộc), phương án, lập luận, bối cảnh case, nhận xét có đếm ký tự, chuyển bài trước/sau.

**04.3 Thống kê luồng học tập** — tỷ lệ hoàn thành, số lượt trung bình, phân bố lựa chọn, kết quả cuối, thời điểm làm bài, tiến độ sinh viên. Nút xuất CSV thuộc OPD-011 (đã chốt A: export ẩn danh trong nền tảng).

### 05 · Sinh viên · Branching Study

- **05.1 Giới thiệu tình huống** — thông tin học phần, lịch sử các lần làm, "Cách làm case này". Nút "Tiếp tục làm dở" còn chờ **OPD-003**.
- **05.2 Đã chọn phương án** — điểm quyết định, thông số, các phương án A/B/C, tín hiệu từ hiện trường. Có bước xác nhận sau khi chọn hay chuyển ngay còn chờ PO (PSD-08).
- **05.3 Kết thúc hành trình** — kết cục, chỉ số, tiến trình lượt làm, nút "Chuyển sang Journey Review".
- **05.4 Journey Review** — sơ đồ hành trình, các bước đã đi, chi tiết quyết định & hậu quả. Quy tắc bắt buộc lập luận còn chờ **OPD-002**.
- **05.5 / 05.6 AI Challenge Support** — hộp thoại Socratic tối đa 2 vòng; có "Bỏ qua". Dạng modal hay trang riêng còn chờ **OPD-005** (HOLD).
- **05.7 Biểu mẫu suy ngẫm / 05.8 Đã nộp suy ngẫm** — không chấm điểm; giảng viên phụ trách đọc được. 05.8 có "Xem lại Journey Review", "Bắt đầu lượt làm mới" và nút về Bàn học (OPD-001 → A).
- **05.9 Lịch sử lần làm bài / 05.10 Bắt đầu lượt làm mới** — các lượt cũ được giữ nguyên. Giới hạn số lượt còn chờ **OPD-004**.

### 06 · Sinh viên · Review Study

- **06.1 Biểu mẫu Review Study** — bối cảnh tình huống, khối số liệu (xem dưới), vấn đề cần giải quyết, ba ô nhập: Phân tích (không bắt buộc), Phương án *, Lập luận *. Thanh nút cuối: "Quay lại", ghi chú "Bài nộp là bản cuối…", "Lưu nháp", "Nộp bài".
- **Khối "Số liệu & dữ liệu thực tế đính kèm"** (06.1, 06.2): 3 ô số chính (Đã chi thử nghiệm, Ngân sách còn lại, Mục tiêu) + bảng theo kênh có dòng Tổng, số căn phải + dòng định nghĩa thuật ngữ dễ nhầm. Không thêm cột tính sẵn (tỷ lệ, chi phí/kích hoạt) vì đó là phần sinh viên phải tự phân tích. Ở thẻ hẹp (06.2), 3 ô xếp dọc, nhãn trái số phải.
- **06.2 Đã nộp, chờ phản hồi / 06.3 Đã phản hồi** — xem lại bài nộp; 06.3 có nhận xét giảng viên và ô phản tư.

### 07 · Màn bổ sung (đã chốt, không còn HOLD — PO 12/11/2026)

- **07.1 Bảng điều khiển giảng viên** (D-05 → có): lịch hạn nộp, bài nộp chờ phản hồi, việc cần làm. Chưa có task.
- **07.2 Bàn học / 07.3 Khóa học của tôi / 07.4 Tham gia lớp học** (OPD-001 → A): sinh viên tham gia lớp bằng mã mời; cần bảng `course_enrollments` và API ghi danh (chưa có).
- **07.5–07.7 AI Studio** (OPD-006 → wizard 3 bước): 07.6 Bước 1 Khóa học và chế độ → 07.5 Bước 2 Chủ đề và tài liệu → 07.7 Bước 3 Xác nhận cấu hình. Thanh nút cuối: trái "Bước x trên 3: …", phải nút phụ (Hủy / Quay lại) cạnh nút chính (Tiếp tục / Sinh bản nháp). Nút "Tạo thủ công từ đầu" còn chờ **D-07**.
- **07.8 Rubric nghiên cứu chất lượng tình huống** (OPD-011 → A):
  - Dải thông tin case trên cùng: icon, tên case, chế độ học, học phần, bên phải "Điểm trung bình x / 5" (từ 3 tiêu chí).
  - Bên trái phiếu chấm 3 tiêu chí thang 1–5 (Tính thực tế, Độ khó, Phù hợp môn) + ghi chú tùy chọn + "Lưu phiếu đánh giá". Đây là đánh giá chất lượng case phục vụ nghiên cứu, không phải điểm sinh viên.
  - Bên phải các phiếu đã lưu xếp dọc.
  - Không dùng đồng hồ dạng vạch hay thanh vạch.

### 08 · Phase 2 · Quên & đặt lại mật khẩu
Nhập email → Đã gửi hướng dẫn → Mật khẩu mới → Thành công. Phase 2 theo `01_MASTER-TASKS §4.6`; liên kết "Quên mật khẩu?" chưa hiện trên 00.3.

### 09 · Hồ sơ tài khoản (MVP, PO 12/11/2026)

- **09.1 Giảng viên**: thông tin tài khoản chỉ xem, khóa học phụ trách (mỗi dòng: thanh "x% tài liệu sẵn sàng", nhãn trạng thái, số case — các cột có độ rộng cố định nên thẳng hàng), tỷ lệ hoàn thành case, hoạt động, lịch, việc cần làm, bài nộp gần đây.
- **09.2 Sinh viên**: không có điểm số. Cột trái: hồ sơ, Tiến độ học tập (số 75%, 3/4 case đã hoàn thành, ba thanh liền: Case đã hoàn thành / Suy ngẫm đã nộp / Bài Review đã nộp), nhận xét gần nhất của giảng viên, Việc cần làm. Cột phải: Khóa học của tôi (thanh tiến độ cùng độ dài, phần trăm trong ô cố định), biểu đồ hoạt động và tiến độ theo khóa học.

### 10 · Admin · Quản trị hệ thống (MVP, OPD-015 → B)

- **10.1 Đăng nhập quản trị** — chỉ email + mật khẩu, không có Google/Microsoft, không có liên kết đăng ký. Ảnh minh họa là bản sao của 10.3 và 10.2.
- **10.2 Bảng điều khiển** (biến thể sidebar thu gọn 10.2b):
  - Banner "mục cần chú ý" trên cùng.
  - Dải 4 chỉ số: nhãn 15px, số chính 28px đứng riêng, bên dưới là nhãn thay đổi. Ba ô số đếm dùng nhãn nhạt navy + icon mũi tên lên ("+14 trong tháng 11"); ô Lượt sinh case AI dùng nhãn cam + icon cảnh báo ("2 lần sinh lỗi").
  - *Annotation (nhãn cảnh báo)*: bấm để mở Nhật ký hệ thống (10.9) lọc theo lỗi sinh case. Khi không có lỗi: hiện "Không có lỗi" ở kiểu trung tính.
  - Biểu đồ dành riêng cho admin (vùng theo tuần, donut người dùng theo vai trò, thanh xếp chồng case theo khóa học), tình trạng hệ thống, nhật ký gần đây. Không dùng lại biểu đồ của giảng viên/sinh viên.
- **10.3 Quản lý người dùng / 10.4 Khóa người dùng** — bảng người dùng; nút Khóa tài khoản / Mở khóa và nhãn trạng thái rộng bằng nhau. Khóa dựa trên `users.is_active`. Tab chờ duyệt giảng viên chưa có (**OPD-008**).
- **10.5 Khóa học toàn hệ thống / 10.6 Case Study toàn hệ thống** — chỉ xem; thêm xóa/lưu trữ sẽ phụ thuộc **OPD-014**.
- **10.7 Dịch vụ AI (chỉ xem)** — hai cột: trái 3 ô chỉ số, "Lần sinh case gần đây", "Trạng thái lập chỉ mục tài liệu" (hai danh sách cùng kiểu dòng 3 tầng + nhãn trạng thái); phải "Cấu hình hiện tại" và "Thay đổi cấu hình". Nhà cung cấp và mô hình AI cố định trong tệp môi trường (OPD-013), không có thao tác đổi.
- **10.8 Nghiên cứu & Rubric** — cùng bố cục với 07.8 (OPD-011 → A).
- **10.9 Nhật ký hệ thống** — bảng sự kiện, tìm "Tìm trong nhật ký", lọc loại sự kiện và thời gian, nhãn kết quả rộng bằng nhau.
- **10.10 Cài đặt hệ thống** — thông tin nền tảng, thông báo trang đăng nhập, email hỗ trợ, giới hạn & đăng ký, dịch vụ AI (chỉ tham chiếu), sao lưu dữ liệu.

---

## 3. Cách cập nhật ảnh minh họa đăng nhập/đăng ký

Các khung 00.3, 00.4, 00.5, 10.1 có khối `Product preview → Screen → "<mã màn> · … preview"`. Đây là bản sao tĩnh đã thu nhỏ, không tự cập nhật theo màn gốc.

| Trang | Màn được sao |
|---|---|
| 00.3 Đăng nhập | 05.1, 02.1 |
| 00.4 Đăng ký · Sinh viên | 05.9, 05.2 |
| 00.5 Đăng ký · Giảng viên | 03.1, 03.4 |
| 10.1 Đăng nhập quản trị | 10.3, 10.2 |

Khi sửa một màn trong bảng: sao màn gốc, chèn vào đúng vị trí bản cũ trong khung `Screen`, thu nhỏ theo tỉ lệ `rộng bản cũ / 1440`, đặt x = y = 0, rồi xóa bản cũ.

## 4. Quyết định còn mở ảnh hưởng giao diện

| Mã | Nội dung | Màn bị ảnh hưởng |
|---|---|---|
| OPD-002 | Lập luận ở quyết định then chốt có bắt buộc không | 05.4, 03.4 |
| OPD-003 | Tiếp tục hay hủy lượt làm dở | 05.1 |
| OPD-004 | Giới hạn số lượt làm | 05.9, 05.10 |
| OPD-005 | Challenge Support dạng modal hay trang riêng (HOLD) | 05.5, 05.6 |
| OPD-007 | Sửa case sau khi xuất bản | 03.6 (trạng thái Đã xuất bản) |
| OPD-008 | Xác minh tài khoản giảng viên (HOLD email kích hoạt) | 00.5, 10.3 |
| OPD-014 | Xóa cứng hay lưu trữ | 02.3, 10.5, 10.6 |
| D-07 | Tạo case thủ công | 07.6 |
| PSD-08 | Bước xác nhận sau khi chọn phương án | 05.2 |
