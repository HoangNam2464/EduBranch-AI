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

| Task | Kết quả | Điều kiện còn lại (chủ sở hữu) |
|---|---|---|
| QA-007 | PASS WITH CONDITIONS | (a) Chống trùng chỉ có trong AI service; gateway và frontend chưa dùng `idempotencyKey`, nên gửi lại sẽ tạo thêm một case `DRAFT` (EBA-121, kỹ thuật). (b) Timeout lệch giữa frontend 30s, gateway 60s và AI khoảng 136s; timeout chỉ được kiểm chứng trong AI service (EBA-121). (c) Chưa chạy với Gemini thật (cần API key). |
| QA-008 | PASS WITH CONDITIONS | Gateway chưa tự kiểm tra cây do AI trả về (cycle, node không tới được); hiện chỉ AI service kiểm tra. Phần này phụ thuộc EBA-117: quy tắc cho cạnh `null` cần PO chốt. |
| QA-009 | PASS | — |
| QA-010 | PASS | — |

Mức kết luận theo policy §8; PO chấp nhận các điều kiện thì mới đạt Quality Gate.

**Lỗi tìm thấy và đã sửa trong nhánh này:**
- **BE-015 (EBA-120):** case do AI sinh có liên kết tới node phía sau không lưu được (500, lỗi FK). Chi tiết ở §4.
- **QA-007:** khi AI service lỗi, giảng viên nhận 500. Nay AI lỗi hoặc mất kết nối trả 502, hết thời gian chờ trả 504, và chi tiết lỗi từ AI không còn trong response (§4).

## 2. Lệnh đã chạy

| Lệnh | Exit | Kết quả |
|---|---|---|
| `backend: npm run build` | 0 | `dist/main.js` |
| `backend: npm test` | 0 | 414/414 (trước: 410; thêm 1 test thứ tự insert và 3 test map lỗi AI) |
| `backend: npm run test:e2e` (`POSTGRES_DB` = DB tạm) | 0 | 373 pass, 43 skip (suite live cần AI service và MinIO) |
| `backend: npm run test:matrix` / `test:regression` | 0 / 0 | 26/26, 44/44 |
| Suite mới `test/case-lifecycle-http.integration.e2e-spec.ts` | 0 | 36/36 |
| Cùng suite và unit spec, với `case.service.ts` của `develop` | 1 / 1 | Suite 35/36 (sinh case fail với 500 do FK); unit 39/40 (test thứ tự insert fail) |
| `ai-service: pytest` 5 file sinh case và đồ thị | 0 | 45/45 |
| `ai-service: pytest` toàn bộ | 0 | 165 pass, 1 xfail (giữ nguyên như trước) |

**Suite mới chạy theo đường HTTP thật**, gồm các tầng sau:
- supertest;
- `JwtAuthGuard` và `RolesGuard` toàn cục, với `JwtStrategy` và `AuthService` thật (token ký bằng `JwtService`; vai trò và trạng thái khóa tài khoản đọc từ DB);
- `ValidationPipe` với cùng tùy chọn như `main.ts`;
- controller và service thật, kể cả `AiClientService`;
- SQL thật trên DB riêng `edubranch_case_lifecycle_it`, tạo và xóa qua DB quản trị `postgres`.

Chỉ lời gọi HTTP từ gateway sang AI service (`fetch`) được giả lập, nên mã trạng thái giảng viên nhận được là mã thật.

## 3. Đối chiếu AC

### QA-007 — Output sinh case
| AC | Bằng chứng |
|---|---|
| JSON hợp lệ / không hợp lệ theo schema | `test_case_generation_schema.py`: `test_valid_case_schema`, `test_min_length_validation_failures`, `test_json_schema_structure`, `test_schema_aliases_compatibility` |
| Thiếu root, cycle, node không tới được, thiếu terminal, option sai liên kết | `test_out_of_bounds_root_node_index`, `test_cycle_detection`, `test_orphan_node_detection`, `test_missing_terminal_path`, `test_out_of_bounds_next_node_index`. Ở gateway, suite mới kiểm tra root sai và option trỏ ra ngoài → 502, không lưu gì |
| Timeout và lỗi tạm thời 429/503 | AI service: `test_generation_provider_timeout_exhaustion`, `test_generation_transient_error_retries_and_succeeds`, `test_classify_transient_errors`. Gateway (suite mới): AI trả 503 → 502; AI không trả lời → 504; không tới được AI → 502; trường hợp nào cũng không lưu case |
| Retry có giới hạn, hết lượt retry, tối đa 3 lần gọi provider | `call_count == 3` trong cả 3 test hết lượt: timeout, lỗi tạm thời, validation đồ thị. `call_count == 2` khi lần 2 thành công. Gateway gọi AI service đúng 1 lần mỗi request |
| Lỗi 4xx không retry | `test_generation_non_retryable_error_fails_immediately` (`call_count == 1`), `test_classify_non_retryable_errors` |
| Idempotency / chống trùng | Chỉ trong AI service: `test_idempotent_duplicate_request_returns_cached_response`, `test_idempotency_key_with_conflicting_parameters_raises_conflict`, `test_concurrent_requests_with_same_key_execute_only_once`. **Điều kiện (a):** gateway chưa chống trùng (EBA-121) |
| HTTP của AI service: map lỗi | `test_generation_api.py`: timeout, hết retry, lỗi validation, lỗi không retry, xung đột idempotency, thiếu key |
| Lỗi không tạo case `APPROVED`/`PUBLISHED`; case hợp lệ luôn là `DRAFT` | Suite mới: AI trả `status: "PUBLISHED"` nhưng case vẫn lưu `DRAFT` (201); hai option của root trỏ đúng node đã lưu |
| Dữ liệu sai không được lưu thành case | Suite mới: mọi trường hợp lỗi đều giữ nguyên số case và không có node nào được lưu |
| Quyền | Sinh viên → 403 (role guard); giảng viên không sở hữu khóa học → 404; không gọi AI |

### QA-008 — Bất biến đồ thị
| AC | Bằng chứng |
|---|---|
| Phát hiện cycle | `test_graph_invariants.py` (tự vòng, vòng 2/3 node, vòng sâu trong nhánh); `case-tree.validator.spec.ts`; suite mới qua API: `mid → root` → 400 |
| Thiếu root / root sai | `case-tree.validator.spec.ts` "rejects a missing root"; `test_out_of_bounds_root_node_index` (unit) |
| Node không tới được | `test_orphan_node_rejected`, `test_multiple_orphan_nodes_detected`; suite mới qua API: cắt đường duy nhất tới `mid` → 400 |
| Không có đường tới terminal | `test_missing_terminal_path_rejected`, `test_unreachable_terminal_node_rejected`; validator "rejects a tree without an ending node" (unit) |
| Option trỏ tới node không tồn tại | Suite mới qua API: UUID lạ và node của case khác → 400 |
| Số option | Suite mới: 1 option → 400 (kiểm tra topology); 5 option → 400 (DTO `ArrayMaxSize`) |
| Nhiều nhánh, nhiều terminal | `test_multiple_terminal_paths_accepted`, `test_valid_converging_dag_is_accepted`; suite mới: thêm nhánh thứ 3 → 200 và được lưu |
| Bị chặn trước khi lưu; đồ thị gốc không đổi | Suite mới so toàn bộ `case_options` trước và sau mỗi lần bị từ chối: giống hệt. Reviewer đã thử tắt `findTreeViolation`: 3 test topology chuyển sang fail, nên mã 400 đúng là do kiểm tra topology |

### QA-009 — Vòng đời case (suite mới, HTTP thật)
| AC | Bằng chứng |
|---|---|
| `DRAFT → REVIEWED → APPROVED → PUBLISHED` | 200 mỗi bước; body `{status:"SUCCESS", data:{id,status}}`; DB đúng; 3 dòng audit `CASE_STATUS_CHANGED` đúng thứ tự |
| Quay về hợp lệ | `REVIEWED → DRAFT`, `APPROVED → DRAFT` → 200, được lưu và có audit |
| Yêu cầu đúng trạng thái hiện tại | 4 trạng thái → 200, không đổi gì, không có dòng audit |
| Từ chối `DRAFT` → `APPROVED` / `PUBLISHED` | 400; thông báo nêu rõ chuyển trạng thái; trạng thái và audit không đổi |
| Từ chối chuyển sai khác | `REVIEWED → PUBLISHED`, `APPROVED → REVIEWED`, `PUBLISHED → REVIEWED`, `PUBLISHED → APPROVED` → 400; giá trị lạ (`ARCHIVED`, chữ thường, rỗng, `null`, số) → 400 |
| Giảng viên không sở hữu khóa học | 403, không lộ nội dung, trạng thái không đổi |
| Sinh viên / admin | 403; token sai → 401; trạng thái không đổi |
| AI chỉ tạo `DRAFT` | Xem QA-007 |
| Sửa node không đổi trạng thái | `DRAFT` và `REVIEWED` giữ nguyên sau khi lưu node; `APPROVED`/`PUBLISHED` không sửa được (403), dữ liệu không đổi |
| Case không tồn tại | 404 |

`PUBLISHED → DRAFT` không test ở đây. Quy tắc D5 thuộc PR #95 / EBA-113 (suite `attempt-publish-lock.integration`).

### QA-010 — Sinh viên chỉ xem được case `PUBLISHED` (suite mới, HTTP thật)
| AC | Bằng chứng |
|---|---|
| `DRAFT`, `REVIEWED`, `APPROVED` qua `GET /cases/:id` → 403 | Mỗi trạng thái một test. Body không chứa chuỗi đánh dấu nào của tiêu đề, mô tả, tình huống, option hay hệ quả |
| Bắt đầu attempt trên các case đó | 403, không tạo attempt; `GET /cases/:id/attempts` → 200 với danh sách rỗng, không lộ nội dung |
| `PUBLISHED` được xem | 200 với phần dữ liệu dành cho sinh viên (không có `nodes`, `all_options`, tình huống, option, hệ quả); bắt đầu attempt → 201 |
| Link trực tiếp khi chưa tham gia khóa học (FND) | Sinh viên chưa ghi danh: `PUBLISHED` → 200; `DRAFT` → 403, không lộ nội dung |
| Danh sách case của khóa học | Chỉ có case `PUBLISHED` |
| Đổi ID trên URL | UUID lạ → 404; ID sai định dạng → 400; không token → 401 |
| Quyền theo trạng thái backend | Case `APPROVED`: 403 → giảng viên publish qua HTTP → sinh viên 200 |
| Test có ý nghĩa | Reviewer đã thử bỏ bộ lọc `status = 'PUBLISHED'` của sinh viên: 4 test chuyển sang fail |

**Ghi nhận (thiết kế hiện có, FND §4):** case tồn tại nhưng chưa `PUBLISHED` trả 403, còn ID không tồn tại trả 404. Sinh viên biết được một ID có tồn tại hay không, nhưng không thấy nội dung.

## 4. Lỗi tìm thấy và đã sửa

### 4.1 BE-015 (EBA-120): case do AI sinh không lưu được
- **Hiện tượng:** `POST /cases/generate` trả 500 khi một option trỏ tới node đứng sau nó. Prompt AI bắt buộc root ở vị trí 0, nên gần như mọi cây thật đều gặp lỗi này. Transaction rollback, nên không case nào được lưu.
- **Nguyên nhân:** `generateCase` thêm từng node rồi thêm ngay option của node đó, trong khi `case_options.next_node_id` là FK kiểm tra ngay (V1). Unit test dùng DB giả không có FK, nên không bắt được.
- **Sửa:** thêm mọi node trước, rồi mới thêm option, trong cùng transaction. Không đổi schema hay contract.
- **Bằng chứng:** trên `develop` suite fail với `case_options_next_node_id_fkey`; sau khi sửa thì PASS. Thêm unit test kiểm tra thứ tự insert để chặn lỗi quay lại.
- **Đường ghi khác:** reviewer không thấy đường nào bị lỗi tương tự. `updateCaseNode` chỉ liên kết tới node đã có; không có seed nào thêm option.

### 4.2 AI service lỗi → giảng viên nhận 500
- **Hiện tượng:** `AiClientService.generateCase` ném `Error` thường, nên gateway trả 500. Nội dung lỗi từ AI nằm trong message.
- **Sửa:** AI trả lỗi hoặc không tới được → `BadGatewayException` (502); hết thời gian chờ → `GatewayTimeoutException` (504). Chi tiết chỉ ghi vào log.
- **Bằng chứng:** 3 unit test và 3 test HTTP thật.

## 5. Review độc lập (QG2)
Reviewer là Claude subagent chỉ đọc, review commit `16060a1`. Reviewer đã chạy phép thử đột biến:
- bỏ bản sửa BE-015;
- tắt `findTreeViolation`;
- bỏ bộ lọc `PUBLISHED`.

Mỗi lần đều có test chuyển sang fail.

| # | Mức | Phát hiện | Xử lý |
|---|---|---|---|
| 1 | High | Test "AI lỗi → 502" giả lập một lỗi mà client thật không bao giờ ném; thực tế trả 500 | **Đã sửa** (§4.2). Suite dùng `AiClientService` thật với `fetch` giả lập |
| 2 | High | Chống trùng chỉ có trong AI service | **Điều kiện (a)**, EBA-121 |
| 3 | Medium | Timeout lệch giữa 3 tầng | **Điều kiện (b)**, EBA-121 |
| 4 | Medium | Gateway không chạy kiểm tra cây trên output AI | **Phụ thuộc EBA-117** (quy tắc cạnh `null`); đã ghi vào task đó |
| 5 | Low | Không có unit test giữ thứ tự insert | **Đã sửa:** thêm test |
| 6 | Low | Test hết lượt timeout và lỗi tạm thời không đếm số lần gọi provider | **Đã sửa:** thêm `call_count == 3` |
| 7 | Low | `[403, 404]` chấp nhận cả hai mã | **Đã sửa:** sinh viên đúng 403, giảng viên khác đúng 404 |
| 8 | Low | Danh sách attempt không kiểm tra mã trạng thái | **Đã sửa:** 200 với danh sách rỗng |
| 9 | Low | Chưa test quay về hợp lệ và yêu cầu đúng trạng thái hiện tại | **Đã sửa:** thêm 3 test |
| 10 | Low | Chưa test giới hạn dưới của số option | **Đã sửa:** 1 option → 400 |
| 11 | Low | Chưa test link trực tiếp khi chưa ghi danh | **Đã sửa** |
| 12 | Low | `POST /cases/generate` không có DTO | EBA-121 (có từ trước, ngoài diff) |
| — | Low | `itDb` cho "pass" khi không có PostgreSQL | Quy ước chung của dự án, đã có EBA-119. Bằng chứng chạy thật ở §2 |

## 6. Chưa kiểm chứng
- Sinh case với Gemini thật (`test_live_flow2.py`, cần `GEMINI_API_KEY`): NOT VERIFIED.
- Các suite `*.live.spec.ts` (cần AI service và MinIO đang chạy): skip, không tính là pass.
