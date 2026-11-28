# Danh sách lỗi responsive & cross-cutting ngoài batch (`fix/fe-screen-quality`)

> **Trạng thái**: `OUT OF BATCH — CHƯA SỬA` (không thuộc phạm vi 9 task FE của nhánh `fix/fe-screen-quality`, giữ tách riêng để không mở rộng phạm vi sửa chữa).
> **Nguồn**: Visual QA Route Sweep Part B (Round 3, 1024px & 1440px, VI & EN).

## 1. Lỗi responsive ở độ rộng 1024px (ngoài batch)

| # | Route | Vai trò | Mức độ | Vấn đề ghi nhận | File liên quan (dự kiến) |
|---|---|---|---|---|---|
| 1 | `/student/cases/:id/branching-play` | Student | High | Tràn ngang (`h-scroll` ~95px VI / ~109px EN); dòng lịch sử lượt làm tràn ra ngoài card; khối `"Cách làm case này"` gãy từng từ | `frontend/src/pages/branching/BranchingCasePlayerPage.tsx` |
| 2 | `/student/cases/:id/history` | Student | High | Tràn ngang (`h-scroll` ~210px VI / ~248px EN); chú giải biểu đồ nằm ngoài card; bảng bị cắt | `frontend/src/pages/branching/StudentAttemptsHistoryPage.tsx` |
| 3 | `/student/cases/:id/attempt/:aid/review` | Student | High | Tiêu đề điểm quyết định bị cắt còn ~55px; thẻ AI Challenge Support gãy từng từ; chuỗi `"AI-assisted"` ở màn VI | `frontend/src/pages/branching/BranchingReviewPage.tsx`, `frontend/src/pages/branching/components/parts.tsx` |
| 4 | `/student/cases/:id/attempt/:aid/reflect` (lượt hoàn tất) | Student | Medium | Tràn ngang ~26px ở 1024px tại thẻ `"Không xếp hạng điểm số"` | `frontend/src/pages/branching/ReflectionPage.tsx` |
| 5 | `/lecturer/profile`, `/lecturer/settings` | Lecturer | High | Metadata ở header chồng lấp; thanh tiến trình vẽ tràn ra ngoài card (`x ≈ 170`); email cắt còn ~1px; `"Bài nộp gần đây"` báo chưa có danh sách dù API tồn tại | `frontend/src/pages/profile/ProfileEditPage.tsx` |
| 6 | `/student/profile`, `/student/settings` | Student | Medium | Tên khóa học cắt còn `"A..."` (~21px); `"Chưa có dữ liệu"` gãy từng từ; dùng icon điện thoại cho `"Vai trò"`; dùng cỡ chữ `13/15/24px` | `frontend/src/pages/profile/ProfileEditPage.tsx` |
| 7 | `/lecturer`, `/lecturer/dashboard` | Lecturer | Medium | Chip case trên lịch cắt còn ~19px; nhãn `"Hôm nay"` đè ngày 28; tiêu đề tháng xuống dòng; tab `"Branching"`/`"Review"` ở màn VI | `frontend/src/pages/dashboard/LecturerDashboardPage.tsx` |
| 8 | `/lecturer/courses/:id/materials/:mid/rag` | Lecturer | Medium / Low | Phụ đề KPI cắt còn ~44px ở 1024px; pill `"AI Draft"` còn tiếng Anh trên màn VI | `frontend/src/pages/materials/RagSourceInspectorPage.tsx` |

## 2. Lỗi cross-cutting & màn chưa kiểm chứng dữ liệu thật (ngoài batch)

| # | Phạm vi | Mức độ / Trạng thái | Vấn đề ghi nhận |
|---|---|---|---|
| 9 | `/` & Public Auth (`/login`, `/register`, `/forgot-password`, `/reset-password`, `/admin/login`) | Medium / Low | Landing: chữ `10.5px`/`11.5px` (< 12px), chuỗi `"RAG Grounding từ giáo trình"` trên màn VI, màu `text-sky-300/400`; trang Auth có cỡ chữ ngoài thang (`15/24/28px`) |
| 10 | `/admin/403` | Low | Nội dung nhắc admin `"liên hệ giảng viên phụ trách"` |
| 11 | `vi.json` (`"AI Draft"`, `"AI-assisted"`) | Low | Thuật ngữ tiếng Anh xuất hiện trên màn VI (`vi.json` các dòng 180, 956, 973, 1576, 2192) — chờ xác nhận giữ hay Việt hóa |
| 12 | Off-scale font sizes (`13/15/24/28px`) | Low | Rải rác trên inspector, statistics, desk, auth |
| 13 | `/student/cases/:id/challenge/:sid` | `NOT VERIFIED` | DB seed không có `challenge_support_sessions` nên mới kiểm chứng trạng thái 404 trung thực |
