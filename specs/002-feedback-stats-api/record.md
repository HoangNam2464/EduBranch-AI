# Feature Record: 002-feedback-stats-api — Backend Review Study / Lecturer Feedback / Statistics [BE-025, BE-026, BE-028]

> Theo `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md` §3–§6. Nội dung tiếng Việt (D5).
> **Created**: 2026-11-20 · **Last Updated**: 2026-11-20 (G1–G6 đã trình, chờ PO; G7 chưa)

## 1. Discover (Stage 0)

### 1.1 Workspace & Git
- Workspace: git worktree `.claude/worktrees/kind-mayer-7f0fd0` (không phải checkout chính của PO).
- Nhánh: `feature/feedback-stats-backend`, tạo từ `origin/develop` `15ce43490c8475d0f377db38314eb9497c883a95` (fetch 2026-11-20). Chưa có commit.
- MD5 lúc Discover: `AGENTS.md` `151f8a65664ec6d18ff2086d19e2f182`; `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md` `d1aef151c77618b540e07c8f67fdaf5b`; `.specify/memory/constitution.md` `115e2073ee5c8a8233e83aab277ab643`.

### 1.2 Parent tasks
| Group | Master | Jira | Trạng thái nguồn | Jira | Người được gán (Jira) |
|---|---|---|---|---|---|
| BE-025 | EBA-423 | EBA-72 | IN PROGRESS | In Progress | Đức Anh |
| BE-026 | EBA-424 | EBA-73 | IN PROGRESS | In Progress | Đức Anh |
| BE-028 | EBA-426 | EBA-75 | IN PROGRESS | To Do | Đức Anh |
FE phục vụ: FE-018 EBA-413 (PR #63 đã merge), FE-019 EBA-414 (PR #68), FE-020 EBA-415 (PR #69), FE-022 EBA-417 (PR #70).

### 1.3 Nguồn đã đọc
`docs/03_TASK-DETAILS.md` [62]–[66], [69]–[75]; `.agents/rules/feature-review-study.md`, `feature-lecturer-feedback.md`, `feature-statistics.md`, `feature-reflection.md`; FND §3–§8; `docs/architecture/DATA-FLOW.md` Flow 5, 7; `docs/features/FEATURE-{REVIEW-STUDY,LECTURER-FEEDBACK,BASIC-STATISTICS,REFLECTION,AUTH-AND-ROLES}.md`; `docs/05_FIGMA.md` Frame 05.3–05.5; `docs/design/screens/P3-SUPPORT-AND-STATISTICS.md`; `docs/mvp-scope/FEATURE_HIERARCHY_AND_BACKLOG_MAPPING.md:71–74`; OPD-001 (`git show origin/feature/design-system:docs/OPEN_PRODUCT_DECISIONS.md`); migrations V1–V5; code `backend/src/modules/{review-study,lecturer-feedback,statistics,branching-attempt,case}`; `frontend/src/services/reviewStudyService.ts`, `mappers/reviewStudy.ts`, `routes/paths.ts`; service của PR #68/#69/#70 (head `5b65714`, `f3ea433`, `c75e31c`).

### 1.4 T/I/V hiện tại (trước khi làm)
| AC | T | I | V |
|---|---|---|---|
| BE-025 AC-1..3 | có (03_TASK-DETAILS) | không (controller rỗng) | không |
| BE-026 AC-1..3 | có | không | không |
| BE-028 AC-1..3 | có | không | không |
| [ĐỀ-XUẤT] E2/E3/E5/E7 | spec này | không | không |

### 1.5 Phát hiện chính
- [DỮ-KIỆN] Mâu thuẫn route Review Study giữa 03_TASK-DETAILS, DATA-FLOW và code FE-018 → câu C1.
- [DỮ-KIỆN] Route thống kê thống nhất ở 3 nguồn: `GET /cases/{caseId}/statistics`; route PR #70 (`/statistics/overview`, `/statistics/cases/:id/flow`) không có nguồn; "overview" nhiều khóa bị P3 §1 Boundary loại trừ.
- [DỮ-KIỆN] `develop` đã ghi `is_completed/outcome_node_id/completed_at` (`branching-attempt.service.ts:292`) → BE-028 không bị chặn ở mức dữ liệu bởi EBA-420.
- [DỮ-KIỆN] `case_nodes` không có cột tiêu đề; PR #70 dùng `nodeTitle` không có nguồn.
- [DỮ-KIỆN] `frontend/src/services/mappers/reviewStudy.ts` bịa `submittedAt = new Date()` khi thiếu — finding FE (develop, FE-018) đưa vào T050.
- Figma: chưa đọc frame ID từ Figma trong lần chạy này (phần BE không có UI). T054 phải đọc trước Visual QA; tên frame trong các nguồn lệch nhau (05_FIGMA: 05.3/05.4/05.5; SITE-ARCHITECTURE: 04.3, 06.1–06.3; brief: 04.1/04.2, 05.4/06.3, 05.5).

## 2. Approval

### G0 — PO, chat 2026-11-20 (nguyên văn)
- "Frontend + làm luôn backend"
- "Mình nhận luôn cả 3 task"
- "Có, thêm vào phạm vi"
- "Commit thêm vào nhánh của Hương"

Ý nghĩa đã ghi trong memory `pr68-70-fix-decision-2026-11-20`: Claude nhận BE-025 (EBA-72), BE-026 (EBA-73), BE-028 (EBA-75); thêm 3 API không có task BE vào phạm vi BE-025/026 với nhãn [ĐỀ-XUẤT] (hàng đợi bài nộp cho giảng viên — FE-019 AC-1; sinh viên GET nhận xét của bài Review Study — FE-020 AC-1; GET bài Review Study theo id và bài của chính sinh viên); bản sửa FE là commit bổ sung trên `feature/lecturer-feedback` (#68), `feature/review-feedback` (#69), `feature/statistics` (#70); nhắc PO báo Hương pull trước.

### G1–G6 (gộp) và G7 — PO, chat 2026-11-20, nguyên văn: "Duyệt, bắt đầu"
Trả lời câu hỏi "Anh/chị duyệt G1–G6 và G7 để em bắt đầu code backend?". Phạm vi được duyệt: `tasks.md` T001–T060 (BE Phase 1–5, test Phase 6 T040–T042, sửa FE T050–T054, Converge T060), contract `contracts/api.md` E1–E8 sau C1-A/C2-A/C3-A. FR-05 (max 3000) và các mục `[ĐỀ-XUẤT]` (E2, E3, E5, E7, `steps`) được duyệt cùng spec.

## 3. Gate log
| Gate | Ngày | Trạng thái | Ghi chú |
|---|---|---|---|
| G0 | 2026-11-20 | PASS (PO) | nguyên văn §2 |
| G1 Specify | 2026-11-20 | PASS (PO "Duyệt, bắt đầu", gộp) | `spec.md` |
| G2 Clarify | 2026-11-20 | PASS — PO đã trả lời C1-A, C2-A, C3-A (nguyên văn trong `spec.md` Clarifications); đã áp vào contract/spec/tasks | PO duyệt gộp "Duyệt, bắt đầu" |
| G3 Plan | 2026-11-20 | PASS (PO "Duyệt, bắt đầu", gộp) | `plan.md`, `research.md`, `data-model.md`, `contracts/api.md`, `quickstart.md` |
| G4 Checklist | 2026-11-20 | PASS (PO "Duyệt, bắt đầu", gộp) | `checklists/requirements.md` |
| G5 Tasks | 2026-11-20 | PASS (PO "Duyệt, bắt đầu", gộp) | `tasks.md` |
| G6 Analyze | 2026-11-20 | PASS (PO "Duyệt, bắt đầu", gộp) | §4 |
| G7 | 2026-11-20 | PASS (PO "Duyệt, bắt đầu") | phạm vi T001–T060 |

## 4. Analyze (Stage 6, read-only, Claude, 2026-11-20)
| ID | Mức | Phát hiện | Xử lý |
|---|---|---|---|
| AN-1 | Medium | FR-05 (max 3000) không có nguồn tài liệu, chỉ có hằng số FE | Giữ `[ĐỀ-XUẤT]`; PO duyệt ở G3 hoặc chọn giá trị khác |
| AN-2 | Medium | Phần FE (Phase 6) chưa có frame ID đọc từ Figma; tên frame lệch giữa các tài liệu | T054 đọc từ Figma trước khi so; không chặn BE |
| AN-3 | Medium | Jira BE-025/026/028 còn gán Đức Anh (RISK-4) | Blocker ngoài: PO báo và chuyển người trước khi dispatch Antigravity |
| AN-4 | Low | `tasks.md` tham chiếu FR theo dải (FR-09..12, FR-14..17) — grep không bắt FR-11/12/15/16 | Đã kiểm tay: T020 bao FR-09..12, T030 bao FR-14..17 |
| AN-5 | Low | Nhánh `feature/feedback-stats-backend` gom 3 domain; FND §7.2 ví dụ theo 1 domain | Không vi phạm (không mã task, có hậu tố `-backend`); PO có thể yêu cầu tên khác |
| AN-6 | Info | C1–C3 đã được PO trả lời 2026-11-20 (C1-A, C2-A, C3-A); không còn task BLOCKED-ON-Cn | Đã áp |
Không có xung đột với AGENTS.md, FND hoặc quyết định PO đã duyệt.

## 5. Quality Gates
Chưa bắt đầu (sau G7).

## 6. Nhật ký sau G2 (2026-11-20)
- PR #68 (FE-019): PO "Chấp nhận, commit" (chấp nhận 2 điều kiện: Visual QA chờ backend; chuỗi tiếng Anh PROPOSED). Commit `6f5a85e` đã được push lên `feature/lecturer-feedback` (do phiên Claude cha thực hiện, nội dung trùng bản Claude đã review: 10 file, +791/−135); CI React Build SUCCESS. FE-019 giữ In Progress (Sprint 4 chưa mở).
- Còn chờ PO: duyệt G1–G6 (gộp) và G7 cho phạm vi T001–T060; báo Đức Anh và chuyển người phụ trách BE-025/026/028.
