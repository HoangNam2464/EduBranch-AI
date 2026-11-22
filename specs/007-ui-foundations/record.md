# Feature Record: 007-ui-foundations [FE-025]

> Theo `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md` §4. **Created**: 2026-11-22.

## 1. Discover
- Workspace: worktree `D:\CAPSTONE_2026\EduBranch-AI-ui`, nhánh `fix/ui-foundations`, tạo từ `origin/develop` `7725b85`.
- Nguồn đã đọc: R01 §0, §2, §5; `docs/design/DESIGN-DIRECTION.md` §3 bước 1; `docs/design/audit/UI-AUDIT.md` X7.
- Code: kết quả `git grep -i "theme|dark"` trong `frontend/src` và `frontend/tests` (liệt kê trong `spec.md` §1); kiểm tra class `.btn-primary`/`.btn-secondary`/`.card`: 0 file dùng.

## 2. Gate log
| Gate | Ngày | Nguyên văn |
|---|---|---|
| G0 | 2026-11-22 | PO: "theo đề xuất đi, vì dự án tôi k còn nhiều thời gian, cần sản phẩm chất lượng và tiếp cận được người dùng" và, cho các bước tiếp theo, "bạn làm luôn giúp tôi" |
| G1–G6 | — | chờ PO |
| G7 | — | chờ PO |

## 3. Analyze (Claude)
- Mỗi AC có task (T001–T007); không task nào ngoài phạm vi.
- Không xung đột với AGENTS.md, FND hay R01; AC-D1 thực hiện đúng R01 §0.
- Phụ thuộc: PR #79 sửa cùng `HeaderActions.tsx`; code chỉ bắt đầu sau khi #79 merge.
