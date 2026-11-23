# Plan: 006-app-fluid-layout

**Tầng**: chỉ FE. Không đổi API, DB hay AI. Không thêm dependency hay công nghệ mới, nên không cần ADR.

| File | Thay đổi | AC |
|---|---|---|
| `frontend/src/layouts/shell/AppShell.tsx` | Bỏ `mx-auto max-w-7xl` trên khung nội dung, giữ `px-3 sm:px-6 lg:px-8`; cập nhật comment ghi quyết định PO 2026-11-21 | F1 |
| `frontend/src/components/ds/Toast.tsx` | `ToastRegion`: `fixed bottom-6 right-6`, xếp `flex-col-reverse`; dưới 640px `inset-x-3 bottom-3` | T1 |
| Các màn có đoạn văn dài: `ReviewStudyPage.tsx`, `CoursesPage.tsx` (mô tả khóa học), `LecturerFeedbackPage.tsx` / `StudentReviewFeedbackView.tsx` nếu có trên develop | Thêm `max-w-[80ch]` cho thẻ `<p>` của đoạn văn dài; danh sách cụ thể chốt sau vòng V1 | F3 |
| `frontend/src/locales/vi.json`, `en.json`, `docs/l10n/shared-copy-review.md` | Thêm key `g5.reviewStudy.oneSubmissionNote` (VI lấy theo ý nghĩa câu đang dùng; EN để PROPOSED) | I1 |
| `docs/design/GLOBAL-DESIGN-SYSTEM.md` §5.9 | Đổi "Top-right" thành "Bottom-right" và ghi quyết định | T1 |
| Màn nào vỡ ở vòng V1–V3 | Sửa tối thiểu, chỉ CSS bố cục; mỗi file ghi vào `tasks.md` trước khi sửa | F2 |

**Kiểm tra**
- Script tour Playwright (đặt trong scratchpad, không commit): 13 màn × các độ rộng ở mỗi vòng. Đo tràn ngang và chụp ảnh. Claude xem từng ảnh.
- Cuối cùng chạy `npm run build`, `npm test`, `npm run lint`, l10n, và `npm run test:visual` cho các frame có baseline.

**Rủi ro**
- Màn có chiều rộng cố định theo pixel lấy từ Figma (ví dụ cột phải 379px) vẫn đứng yên; chấp nhận vì cột chính giãn.
- PR #68/#69/#70/#72/#73/#75 đang mở sẽ kế thừa bố cục mới sau khi merge develop, nên cần đưa chúng vào vòng QA của từng PR.
