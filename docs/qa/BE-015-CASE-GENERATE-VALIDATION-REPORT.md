# BE-015 Case Generation Input Validation Report (2026-11-28)

> - **Document Class**: `[HISTORICAL SNAPSHOT]` (Bằng chứng kiểm chứng trên nhánh cục bộ `fix/case-generate-validation`, chưa merge vào `develop`).
> - **Task**: `BE-015` (`EBA-41` / Master `EBA-311`).
> - **Branch & SHA**: `fix/case-generate-validation` (`2e38554`, base `origin/develop` `59a9aa3`).
> - **Kho lưu log**: `D:\CAPSTONE_2026\EduBranch-AI-evidence\2026-11-28\ci-logs\be015-2e38554-build-unit-e2e-lifecycle.log`.

## 1. Tóm tắt thay đổi
- `backend/src/modules/case/dto/generate-case.dto.ts`: Thêm `GenerateCaseDto` khớp hợp đồng `CaseGenerationRequest` (`courseId` UUID, `materialIds` ≥ 1 UUID, `numNodes` int `2–10`, optional `topicHint`, `idempotencyKey`); input sai trả `400` qua global `ValidationPipe` trước khi chạm SQL hoặc gọi AI Service.
- `backend/src/modules/case/case.controller.ts`: Gắn `GenerateCaseDto` cho `POST /api/v1/cases/generate`.
- `backend/src/modules/case/dto/generate-case.dto.spec.ts` & `backend/test/case-lifecycle-http.integration.e2e-spec.ts`: Kiểm chứng unit và HTTP thật trên DB tạm `edubranch_case_lifecycle_it` (input sai trả `400`, AI calls = 0, không ghi DB).
- `backend/test/auth-matrix.spec.ts`, `backend/test/security-regression.spec.ts`: Dùng UUID hợp lệ thay cho `"c1"`/`"m1"` để vẫn đi qua bước DTO tới kiểm tra role/ownership.

## 2. Kết quả kiểm chứng độc lập (QG2 trên SHA `2e38554`)

| Kiểm tra | Trạng thái | Chi tiết |
|---|---|---|
| `npm run build` | **PASS** | Exit 0. |
| `npm test -- --runInBand` | **PASS** | **42 suites, 435/435 tests** (gồm `generate-case.dto.spec.ts`). |
| `case-lifecycle-http.integration.e2e-spec.ts` (DB tạm `edubranch_case_lifecycle_it`) | **PASS** | **37/37 tests**. |
| `npm run test:e2e -- --runInBand` | **PASS WITH CONDITIONS** | **14 suites pass (397 tests), 5 suites skip (43 tests)** trên 440 total — 5 suite cần hạ tầng live MinIO/AI (gồm `material-storage-security`) bị skip. |
| Live Gemini call & gateway idempotency dedupe | **NOT VERIFIED** | `CaseService.generateCase` stub `fetch` ở gateway integration test; gateway dedupe vẫn là điều kiện mở đã biết. |
| Sinh case không có tài liệu nguồn | **WAITING PO** | Xung đột Figma AI Studio copy vs `min_length=1` chờ PO quyết định (`PO-OPEN-DECISIONS-2026-11-28.md`). |
