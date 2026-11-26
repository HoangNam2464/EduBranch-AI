# Feature Record: 003-reasoning-access — Chặn truy cập trái phép API reasoning [BE-024]

> Theo `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md` §3–§6. Nội dung tiếng Việt.
> **Created**: 2026-11-21 · **Last Updated**: 2026-11-26 (PR #77 đã merge tại `bbf4156`; QG1–QG7 PASS trên `develop` `dec96f0`)

## 1. Discover (Stage 0)

### 1.1 Workspace & Git
- Workspace: git worktree `D:\CAPSTONE_2026\EduBranch-AI-reasoning-fix`. Đây không phải checkout chính của PO.
- Nhánh: `fix/reasoning-access`, tạo từ `origin/develop` `55eb9ef` (fetch 2026-11-21). Chưa có commit code.
- Đồng bộ 2026-11-21: merge `develop` `6f903f2` (PR #78: font hệ thống, sidebar — 4 file frontend/docs, không trùng file nào của PR) vào nhánh bằng merge commit `3499b08`, không rebase và không force-push. Sau merge, diff của PR so với `develop` vẫn đúng 12 file như trước.

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
- Toàn bộ AC-R1..R6 có trạng thái **[PO-ĐÃ-XÁC-NHẬN]** (G1–G7, §2) và V = PASS (bảng trên).

## 7. Quality Gates sau Converge

| Gate | Trạng thái | Bằng chứng |
|---|---|---|
| QG1 Developer tests | PASS | §5. Chạy lại sau khi merge `develop` (`3499b08` cộng bản đồng bộ tài liệu này), ngày 2026-11-21, DB sạch: `npm run build` 0; `npm test` 314/314; `npm run test:e2e` cách CI (`POSTGRES_PORT=1`) 162 pass, 43 skip; `npm run test:e2e` có DB 162 pass, 43 skip; `test:matrix` 26/26; `test:regression` 44/44; live `reasoning-access` 10/10. |
| QG2 Independent review | PASS | §4, §6; review lặp lại trong phiên khác ngày 2026-11-21 trên worktree sạch tại `5b20fd6`: build 0; `npm test` 314/314; `npm run test:e2e` 162 pass, 43 skip; `test:matrix` 26/26; `test:regression` 44/44; live `reasoning-access` 10/10. Không có finding Critical/High/Medium; Low R1: 404/403 cho phép dò sự tồn tại của UUID — đã được AC-R2 chấp nhận, không sửa. Info R2: header `spec.md` còn ghi Draft — đã sửa ở bản này. |
| QG3 Browser check | N/A | Không có thay đổi frontend; frontend không gọi 2 route này. |
| QG4 No open failure | PASS | Không còn mục failed/BLOCKED trong phạm vi. Không có chuỗi giao diện mới nên không cần chạy l10n check. |
| QG5 PR checks | PASS | Trên head `aa13f89b3e141527481b0228a60d50208a973321` (sau merge `develop` `0e78075`, không thêm đổi backend so với `5b20fd6`): GitHub Actions 2/2 `success` — `NestJS Build & Test` (https://github.com/HoangNam2464/EduBranch-AI/actions/runs/45165715320/job/137662021880) và `React Build (Node 20)` (https://github.com/HoangNam2464/EduBranch-AI/actions/runs/45165706477/job/137661990413). Bằng chứng đã ghi tại [comment PR #77](https://github.com/HoangNam2464/EduBranch-AI/pull/77#issuecomment-7178239938). Lần chạy trước trên `5b20fd6`: run #175/#176 `success` (2026-11-20). |
| QG6 Merge | PASS | `admin-merge PR #77` theo lệnh trực tiếp của PO ngày 2026-11-26 (policy §7, tác giả `@HoangNam2464` đồng thời là Code Owner duy nhất). Merge commit trên `develop`: `bbf415621a97ec55042f5932a42cfc639e75ca32` (`2026-11-25T23:57:25Z`). |
| Rủi ro còn lại | Đã chấp nhận | Trả 404 cho id không tồn tại và 403 cho id của sinh viên khác, nên người gọi có thể biết một UUID có tồn tại hay không. Hành vi này đúng AC-R2 đã duyệt và theo tiền lệ `getAttempt`; UUID ngẫu nhiên khiến việc dò thực tế không khả thi. Không mở rộng phạm vi sửa. |
| QG7 Post-merge | PASS | Sau merge PR #77 (`bbf4156`): `npm run build` 0, unit `314/314`, `QA_LIVE=1 reasoning-access` `10/10`, `test:matrix` `26/26`, `test:regression` `44/44`; riêng `migration.integration.e2e-spec.ts` tạm bị chặn do DB `edubranch_ai` cục bộ có sẵn `V6–V8` của PR #80. Sau khi PR #80 hợp nhất `V6–V8` vào `develop` (`dec96f07068bebf991e9c7f6169643bbc1fa67ef`, không xóa volume hay dữ liệu DB), chạy lại toàn bộ trên `develop` với Postgres 16: `npm run build` (0), unit `39 suite / 353/353` (0), `jest-e2e.json` `9 suite / 305/305` pass (gồm `migration.integration.e2e-spec.ts` V1–V8 và `mvp-completion.integration.e2e-spec.ts`, 5 suite live/AI/MinIO skip `43`), `QA_LIVE=1 reasoning-access.live.spec.ts` `10/10` (0), `test:matrix` `26/26` (0), `test:regression` `44/44` (0). Đủ điều kiện chuyển Jira `EBA-71` (`BE-024`) sang `Done`. |
