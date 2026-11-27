# QA-007 … QA-010 — Sinh case, đồ thị, vòng đời và quyền xem của sinh viên

> **Loại tài liệu**: báo cáo evidence tại một thời điểm (2026-11-27). Trạng thái task sống nằm trên Jira `EBA`.
> **Task**:
> - QA-007 / Jira EBA-46 / Master EBA-316
> - QA-008 / Jira EBA-47 / Master EBA-317
> - QA-009 / Jira EBA-48 / Master EBA-318
> - QA-010 / Jira EBA-49 / Master EBA-319
>
> **Nhánh**: `feature/case-lifecycle-qa`, tạo từ `develop` `a538afe`.
> **Môi trường**: Windows 11, Node 20, PostgreSQL 16 (Docker), Python 3.12. Chỉ dùng DB tạm; không đụng DB dev `edubranch_ai`.

## 1. Kết luận

| Task | Kết quả | Ghi chú |
|---|---|---|
| QA-007 | PASS WITH CONDITIONS | Mọi AC có test chạy thật. Suite mới phát hiện lỗi BE-015: case do AI sinh có liên kết tới node phía sau không lưu được (500). Đã sửa trong nhánh này (§4, Jira EBA-120). Điều kiện: chưa chạy với Gemini thật (cần API key). |
| QA-008 | PASS WITH CONDITIONS | Điều kiện: EBA-117 vẫn mở. `findTreeViolation` từ chối option không có node đích; quy tắc này cần PO xác nhận cho phần sửa cây. |
| QA-009 | PASS | Mọi AC có test HTTP thật, dữ liệu lưu được kiểm tra lại trong DB. |
| QA-010 | PASS | Đã test 403 qua HTTP thật cho cả `DRAFT`, `REVIEWED` và `APPROVED`; response không lộ nội dung case. |

Mức kết luận theo policy §8; PO chấp nhận các điều kiện thì mới đạt Quality Gate.

## 2. Lệnh đã chạy

| Lệnh | Exit | Kết quả |
|---|---|---|
| `backend: npm run build` | 0 | `dist/main.js` |
| `backend: npm test` | 0 | 410/410 |
| `backend: npm run test:e2e` (`POSTGRES_DB` = DB tạm) | 0 | 366 pass, 43 skip (suite live cần AI service và MinIO) |
| `backend: npm run test:matrix` / `test:regression` | 0 / 0 | 26/26, 44/44 |
| Suite mới `test/case-lifecycle-http.integration.e2e-spec.ts` | 0 | 29/29 |
| Cùng suite, `case.service.ts` của `develop` (chưa sửa) | 1 | 28/29: test "AI tree stored as DRAFT" fail với 500 (lỗi FK, §4) |
| `ai-service: pytest` 5 file sinh case và đồ thị (liệt kê ở §3) | 0 | 45/45 |

**Suite mới chạy theo đường HTTP thật**, gồm các tầng sau:
- supertest;
- `JwtAuthGuard` và `RolesGuard` toàn cục, với `JwtStrategy` và `AuthService` thật (token ký bằng `JwtService`, user đọc từ DB);
- `ValidationPipe`;
- controller và service thật;
- SQL thật trên DB riêng `edubranch_case_lifecycle_it`, tạo và xóa qua DB quản trị `postgres`.

Chỉ AI service được thay bằng mock, vì gateway không được phụ thuộc vào nó khi test.

## 3. Đối chiếu AC

### QA-007 — Output sinh case (AI service và gateway)
| AC | Bằng chứng |
|---|---|
| JSON hợp lệ / không hợp lệ theo schema | `test_case_generation_schema.py`: `test_valid_case_schema`, `test_min_length_validation_failures`, `test_json_schema_structure`, `test_schema_aliases_compatibility` |
| Thiếu root, cycle, node không tới được, thiếu terminal, option sai liên kết | `test_out_of_bounds_root_node_index`, `test_cycle_detection`, `test_orphan_node_detection`, `test_missing_terminal_path`, `test_out_of_bounds_next_node_index` (`test_generation/test_decision_tree.py`, `test_case_generation_schema.py`) |
| Timeout và lỗi tạm thời 429/503 | `test_case_generator.py`: `test_generation_provider_timeout_exhaustion`, `test_generation_transient_error_retries_and_succeeds`, `test_classify_transient_errors` |
| Retry có giới hạn, hết lượt retry, tối đa 3 lần gọi provider | `test_generation_graph_validation_exhaustion_raises_error` (`call_count == 3`); `test_generation_transient_error_exhaustion_raises_structured_error` và `test_generation_provider_timeout_exhaustion` (lỗi "after 3 attempts", `max_attempts=3`); `test_generation_retries_on_graph_cycle_and_succeeds` (`call_count == 2`) |
| Lỗi 4xx không retry | `test_generation_non_retryable_error_fails_immediately`, `test_classify_non_retryable_errors` |
| Idempotency / chống trùng | `test_idempotent_duplicate_request_returns_cached_response`, `test_idempotency_key_with_conflicting_parameters_raises_conflict`, `test_concurrent_requests_with_same_key_execute_only_once` |
| HTTP của AI service: map lỗi | `test_generation_api.py`: timeout, hết retry, lỗi validation, lỗi không retry, xung đột idempotency, thiếu key |
| Lỗi không tạo case `APPROVED`/`PUBLISHED`; case hợp lệ luôn là `DRAFT` | Suite mới: AI trả `status: "PUBLISHED"` nhưng case vẫn lưu `DRAFT` (201) |
| Dữ liệu sai không được lưu thành case | Suite mới: AI lỗi → 502, số case không đổi; root sai hoặc option trỏ ra ngoài → 502, không có case và không có node nào được lưu |
| Ghi nhận response và số lần gọi | Gateway gọi AI service đúng 1 lần mỗi request (retry nằm trong AI service); sinh viên và giảng viên không sở hữu khóa học: 403/404, không gọi AI |

### QA-008 — Bất biến đồ thị
| AC | Bằng chứng |
|---|---|
| Phát hiện cycle | `test_graph_invariants.py`: tự vòng, vòng 2 node, vòng 3 node, vòng sâu trong một nhánh; `case-tree.validator.spec.ts` "rejects a loop", "rejects a self loop" |
| Thiếu root / root sai | `case-tree.validator.spec.ts` "rejects a missing root"; `test_out_of_bounds_root_node_index` |
| Node không tới được | `test_orphan_node_rejected`, `test_multiple_orphan_nodes_detected`; validator "cannot be reached from the root" |
| Không có đường tới terminal | `test_missing_terminal_path_rejected`, `test_unreachable_terminal_node_rejected`; validator "rejects a tree without an ending node" |
| Option trỏ tới node không tồn tại | Suite mới qua API: UUID lạ và node của case khác → 400 |
| Nhiều nhánh, nhiều terminal | `test_multiple_terminal_paths_accepted`, `test_valid_converging_dag_is_accepted`; suite mới: thêm nhánh thứ 3 → 200 và được lưu |
| Cập nhật qua API bị chặn trước khi lưu | Suite mới `PUT /cases/:id/nodes/:nodeId`: cycle, đích lạ, cắt đường tới node, quá 4 option → 400 |
| Đồ thị gốc không đổi khi bị từ chối | Suite mới so toàn bộ `case_options` của case trước và sau mỗi lần bị từ chối: giống hệt |

### QA-009 — Vòng đời case
| AC | Bằng chứng (suite mới, HTTP thật) |
|---|---|
| `DRAFT → REVIEWED → APPROVED → PUBLISHED` | 200 mỗi bước; body `{status:"SUCCESS", data:{id,status}}`; DB đúng; 3 dòng audit `CASE_STATUS_CHANGED` đúng thứ tự |
| Từ chối `DRAFT` → `APPROVED` / `PUBLISHED` | 400; thông báo nêu rõ chuyển trạng thái; trạng thái và audit không đổi |
| Từ chối chuyển sai khác | `REVIEWED → PUBLISHED`, `APPROVED → REVIEWED`, `PUBLISHED → REVIEWED`, `PUBLISHED → APPROVED` → 400, không đổi; giá trị lạ (`ARCHIVED`, chữ thường, rỗng, `null`, số) → 400 |
| Giảng viên không sở hữu khóa học | 403, không lộ nội dung, trạng thái không đổi |
| Sinh viên / admin | 403 (`@Roles("LECTURER")`); token sai → 401; trạng thái không đổi |
| AI chỉ tạo `DRAFT` | Xem QA-007 |
| Sửa node không đổi trạng thái | `DRAFT` vẫn `DRAFT`, `REVIEWED` vẫn `REVIEWED` sau khi lưu node; `APPROVED`/`PUBLISHED` không sửa được (403), dữ liệu không đổi |
| Case không tồn tại | 404 |

`PUBLISHED → DRAFT` không test ở đây. Quy tắc D5 (case đã có attempt thì không về `DRAFT` được) nằm ở PR #95 / EBA-113, với suite riêng `attempt-publish-lock.integration`.

### QA-010 — Sinh viên chỉ xem được case `PUBLISHED`
| AC | Bằng chứng (suite mới, HTTP thật) |
|---|---|
| `DRAFT`, `REVIEWED`, `APPROVED` qua `GET /cases/:id` → 403 | Mỗi trạng thái một test. Body không chứa chuỗi đánh dấu nào của tiêu đề, mô tả, tình huống, option hay hệ quả |
| Bắt đầu attempt trên các case đó | `POST /cases/:id/branching-attempts` → 403, không tạo attempt; `GET /cases/:id/attempts` không lộ nội dung |
| `PUBLISHED` được xem | 200 với phần dữ liệu dành cho sinh viên: không có `nodes`, `all_options`, tình huống, option hay hệ quả; bắt đầu attempt → 201 |
| Danh sách case của khóa học | Chỉ có case `PUBLISHED`; case `APPROVED` cùng khóa không xuất hiện |
| Đổi ID trên URL | UUID lạ → 404; ID sai định dạng → 400; không token → 401 |
| Quyền theo trạng thái backend | Case `APPROVED`: 403 → giảng viên publish qua HTTP → sinh viên 200 |

**Ghi nhận (không phải lỗi):** case có tồn tại nhưng chưa `PUBLISHED` trả 403, còn ID không tồn tại trả 404. Từ đó sinh viên biết được một ID có tồn tại hay không, nhưng không thấy nội dung. Đây là thiết kế hiện có (FND §4, `case.service.ts` `getCaseById`).

## 4. Lỗi phát hiện: case do AI sinh không lưu được

- **Hiện tượng:** `POST /cases/generate` trả 500 khi một option trỏ tới node đứng sau nó trong mảng. Prompt AI bắt buộc root ở vị trí 0, nên gần như mọi cây thật đều gặp lỗi này. Không case nào được lưu (transaction rollback), và giảng viên chỉ thấy lỗi hệ thống.
- **Nguyên nhân:**
  - `generateCase` thêm từng node rồi thêm ngay option của node đó;
  - `case_options.next_node_id` là FK kiểm tra ngay (V1, không `DEFERRABLE`);
  - vì vậy option trỏ tới node chưa được thêm sẽ vi phạm FK.

  Unit test `case.service.spec.ts` dùng DB giả không có FK, nên không bắt được lỗi.
- **Sửa:** thêm tất cả node trước, rồi mới thêm option, trong cùng transaction (`case.service.ts`). Không đổi schema, không đổi contract.
- **Bằng chứng:**
  - trên `develop`: 28/29, test sinh case fail với `violates foreign key constraint "case_options_next_node_id_fkey"`;
  - sau khi sửa: 29/29, và test kiểm tra cả hai option của root đều trỏ đúng tới node kết thúc đã lưu.

## 5. Chưa kiểm chứng
- Sinh case với Gemini thật (`test_live_flow2.py`, cần `GEMINI_API_KEY`): NOT VERIFIED.
- Các suite `*.live.spec.ts` (cần AI service và MinIO đang chạy): skip, không tính là pass.
