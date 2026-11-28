# BE-015 Case Generation Validation, Idempotency & Live E2E Report (2026-11-28)

> - **Document Class**: `[HISTORICAL SNAPSHOT]` (Bằng chứng kiểm chứng trên nhánh cục bộ `fix/case-generate-validation`, chưa merge vào `develop`).
> - **Task**: `BE-015` (`EBA-41` / Master `EBA-311`).
> - **Branch**: `fix/case-generate-validation` (base `origin/develop` `59a9aa3`).
> - **Kho lưu log**: `D:\CAPSTONE_2026\EduBranch-AI-evidence\2026-11-28\ci-logs\`.

## 1. Tóm tắt thay đổi
- `backend/src/modules/case/dto/generate-case.dto.ts` & `case.controller.ts`: Bổ sung `GenerateCaseDto` khớp `CaseGenerationRequest` (`courseId` UUID, `materialIds` `>= 1` UUID, `numNodes` `2–10`, `topicHint?`, `idempotencyKey?`). Input sai trả `400` trước SQL và AI Service.
- `backend/src/modules/case/case.service.ts`: Bổ sung **Gateway in-process idempotency & singleflight deduplication** cho `generateCase` (scoped theo `${lecturerId}:${idempotencyKey}`, TTL cấu hình qua `CASE_GENERATION_IDEMPOTENCY_TTL_MS`, mặc định 10 phút):
  - Chặn lưu trùng `cases` khi client retry tuần tự hoặc gửi đồng thời với cùng `idempotencyKey` và tham số.
  - Trả `409 Conflict` nếu tái sử dụng `idempotencyKey` với tham số khác (`courseId`, `materialIds`, `topicHint`, `numNodes`).
  - Không cache khi sinh case lỗi để cho phép thử lại.
  - **Giới hạn kiến trúc giữ nguyên**: Do chưa được PO duyệt thêm SQL migration (`V9`), bảng `cases` chưa có cột `idempotency_key`; deduplication bền vững qua restart/đa instance vẫn ghi nhận là điều kiện mở.
- `backend/src/common/ai-client/ai-client.service.ts`: Bổ sung helper `resolveTimeoutMs` dùng chung cho `generateCase` (`AI_SERVICE_TIMEOUT_MS`, fallback `60000`ms) và `generateChallenge`. Giữ nguyên hợp đồng `1` HTTP call từ Gateway -> AI Service theo test `QA-007` (`expect(aiCalls()).toBe(1)` khi 503), trong khi retry LLM tối đa 3 lần (1 + 2 retry cho 429/503/timeout, không retry 4xx) thực hiện trong `ai-service/app/generation/case_generator.py`.
- Tests: `generate-case.dto.spec.ts`, `case.service.spec.ts` (+2 idempotency tests), `case-lifecycle-http.integration.e2e-spec.ts` (+DTO `400` test & +idempotency HTTP test), `auth-matrix.spec.ts`, `security-regression.spec.ts`.

## 2. Kết quả kiểm chứng (QG2 — cập nhật Workstream B)

| Kiểm tra | Trạng thái | Chi tiết |
|---|---|---|
| `npm run build` | **PASS** | Exit 0. |
| `npm test -- --runInBand` | **PASS** | **42 suites, 437/437 tests**. |
| `npm run test:e2e -- --runInBand` (non-live) | **PASS WITH CONDITIONS** | **14 suites pass (398 tests), 5 suites skip (43 tests)** / 441 total (`case-lifecycle-http`: **38/38 PASS**). |
| Live SQL: `reasoning-access.live.spec.ts` & `feedback-stats.live.spec.ts` (`QA_LIVE=1`) | **PASS** | **2 suites, 17/17 tests PASS** trên PostgreSQL Docker. |
| Live Stack: `material-storage-security.spec.ts` (`QA_LIVE=1`) | **PASS** | Chạy live với Postgres (`edubranch_qa004_it`) + MinIO + HTTP Backend `:18080`. |
| Live Stack: `material-upload.spec.ts` (`QA_LIVE=1`) | **PASS (non-Gemini)** | **8 passed, 1 skipped** (`QA_AI_DOWN=1` test chạy riêng với AI down). |
| Live Gemini (`ingestion-pipeline-integration.spec.ts` `QA_EMBEDDINGS=1`, `test_live_flow2`) | **NOT VERIFIED** | Giữ riêng không gọi Gemini key thật cho đến khi PO cho phép. |
| Sinh case không có tài liệu nguồn (Phương án A vs B) | **WAITING PO** | Đã đối chiếu FE (`AiStudioPage.tsx:274`), i18n, Spec và Figma `07.5–07.7`; chưa sửa UI/Figma khi chưa có lệnh PO. |
