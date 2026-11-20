# Feature Record: 003-reasoning-access — Chặn truy cập trái phép API reasoning [BE-024]

> Theo `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md` §3–§6. Nội dung tiếng Việt.
> **Created**: 2026-11-21 · **Last Updated**: 2026-11-21 (G1–G7 đã duyệt; Implement + Converge xong, QG1–QG4 PASS)

## 1. Discover (Stage 0)

### 1.1 Workspace & Git
- Workspace: git worktree `D:\CAPSTONE_2026\EduBranch-AI-reasoning-fix`. Đây không phải checkout chính của PO.
- Nhánh: `fix/reasoning-access`, tạo từ `origin/develop` `55eb9ef` (fetch 2026-11-21). Chưa có commit code.

### 1.2 Parent task
| Group | Master | Jira | Trạng thái nguồn | Jira |
|---|---|---|---|---|
| BE-024 | EBA-422 | EBA-71 | IN PROGRESS | In Progress (Sprint 4) |

### 1.3 Nguồn đã đọc
- FND §4, §6 dòng 144–154
- `docs/features/FEATURE-AUTH-AND-ROLES.md` §9
- `docs/features/FEATURE-BRANCHING-STUDY.md` (FR-BS-03, FR-BS-06, INV-02)
- `docs/03_TASK-DETAILS.md` [70], [71]
- `docs/mvp-scope/FIGMA_TO_DEVELOPMENT_TRACEABILITY.md` M8
- `docs/qa/QA-002-REGRESSION-REPORT.md`
- Code: `backend/src/modules/reasoning/*`, `branching-attempt/*` (`getAttempt` P0-SEC-02, `chooseOption`), `auth/guards/roles.guard.ts`, `case.controller.ts` (`ParseUUIDPipe`)
- PR #59 `reasoning.service.ts` (head `2382226`)

### 1.4 Phát hiện
Trong lúc review PR #59 ngày 2026-11-21, Claude phát hiện lỗi có sẵn trên develop. Chi tiết ở `spec.md` §1.
- Mức độ: **High** (lộ dữ liệu của sinh viên khác; lộ hệ quả, vi phạm FND §6; vi phạm INV-01).

### 1.5 T/I/V trước khi làm
| AC | T | I | V |
|---|---|---|---|
| AC-R1..R5 | spec này | không | không |

## 2. Gate log

| Gate | Ngày | Nguyên văn / ghi chú |
|---|---|---|
| G0 | 2026-11-21 | PO: "Sửa reasoning" (trả lời câu hỏi "Cho em sửa lỗi bảo mật API reasoning trên develop không?") |
| G1–G6 | 2026-11-21 | PO (gộp G1–G6): "Duyệt, bắt đầu" — trả lời câu hỏi "Duyệt spec 003 (G1–G6 gộp + G7) để bắt đầu sửa?" |
| G7 | 2026-11-21 | Cùng câu trả lời "Duyệt, bắt đầu". Phạm vi: tasks T001–T008, file trong `tasks.md`, AC-R1..R6 |

## 3. Analyze (Stage 6, Claude)

- Mọi AC-R1..R6 đều có task và test (tasks T001–T007).
- Không có task nào nằm ngoài yêu cầu.
- Không xung đột với AGENTS.md, FND hay quyết định PO đã duyệt.
- Không có Critical/High finding mở về tài liệu.
- Thuật ngữ thống nhất (`consequence`, `PUBLISHED`, attempt).
- File ngoài plan: không có.

## 4. Implement (Antigravity) và review (Claude)

- Antigravity, conversation `ada1559c-a391-4949-a1ce-86ed6e36a9cd`, 2026-11-21 01:45–02:24. Kết quả và chi tiết review nằm trong gói việc `.agent-handoff/BE-024-REASONING-ACCESS.md`.
- Claude đọc diff:
  - `@Roles("STUDENT")`, `ParseUUIDPipe` và `@CurrentUser` có ở cả 2 route.
  - Điều kiện `a.student_id = $2`, `c.status = 'PUBLISHED'` và `CASE WHEN a.is_completed THEN o.consequence ELSE NULL END` nằm trong chính câu SQL trả dữ liệu.
  - Truy vấn phân loại 404/403 không trả nội dung reasoning.
- Claude sửa 1 lỗi trong test live do Antigravity viết: seed dùng `reflection_status = 'COMPLETED'`, giá trị mà CHECK của DB không cho phép, nên đổi thành `'SUBMITTED'`.

## 5. Quality Gates (Claude, worktree `fix/reasoning-access` trên develop `55eb9ef` + diff)

| Lệnh (từ `backend/`) | Exit | Kết quả |
|---|---|---|
| `npm run build` | 0 | — |
| `npm test` | 0 | 314/314 (32 suite, gồm 14 test mới của reasoning) |
| `npm run test:matrix` | 0 | 26/26 (RBAC-13, RBAC-14 mới) |
| `npm run test:regression` | 0 | 44/44 (SEC-OWN-13..24 mới) |
| `POSTGRES_PORT=1 npx jest --config test/jest-e2e.json` (như CI) | 0 | 162 passed, 43 skipped |
| `QA_LIVE=1 npx jest --config test/jest-e2e.json test/reasoning-access.live.spec.ts` | 0 | 10/10 trên DB tạm `zz_reasoning_live_*`; sau khi chạy còn 0 DB tạm |

## 6. Converge (T008): AC → code → test

| AC | I (file) | Test | V |
|---|---|---|---|
| AC-R1 | `reasoning.controller.ts` `@Roles("STUDENT")` | RBAC-13/14, SEC-OWN-15..18, SEC-OWN-20 | PASS |
| AC-R2 | `reasoning.service.ts` (SQL `a.student_id`, phân loại 404/403) | SEC-OWN-13/14, 21/22, live kịch bản 4 và 5, unit | PASS |
| AC-R3 | `reasoning.service.ts` (SQL `c.status = 'PUBLISHED'`) | live kịch bản 3, unit | PASS |
| AC-R4 | `reasoning.service.ts` (`CASE WHEN a.is_completed`) | live kịch bản 1 và 2, unit | PASS |
| AC-R5 | `reasoning.controller.ts` `ParseUUIDPipe` | SEC-OWN-19 | PASS |
| AC-R6 | — | toàn bộ bảng §5 | PASS |

- Người viết code là Antigravity; người chạy lại test và review là Claude.
- Còn lại: GitHub CI chưa chạy (QG5). Retest trên develop sau merge thuộc QG7.
