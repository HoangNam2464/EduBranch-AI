# Hai vấn đề mở chờ Product Owner quyết định (2026-11-28)

> **Quy tắc**: Theo `AGENTS.md` Rule 5 & `.agents/rules/02-agent-operating-policy.md` §5, chỉ ghi nhận nguồn, xung đột và phương án; không tự ý chọn phương án tạm thời.

## 1. Sinh Case Study khi không chọn tài liệu nguồn
- **Phạm vi**: `FE-007` (`EBA-35` / `EBA-305`), `BE-015` (`EBA-41` / `EBA-311`), `AiStudioPage.tsx`, `POST /api/v1/cases/generate`, `POST /internal/v1/generation/generate-case`.
- **Xung đột**:
  - Copy Figma AI Studio (`"AI truy xuất đoạn trích liên quan (nếu có tài liệu nguồn)"`) và hiển thị `"Chưa chọn tài liệu"` ở bước 3 hàm ý tài liệu nguồn có thể tùy chọn.
  - `CaseGenerationRequest.material_ids` (`ai-service/app/generation/schemas/requests.py:13-17`) và `GenerateCaseDto.materialIds` (`backend/src/modules/case/dto/generate-case.dto.ts:13-16`) bắt buộc tối thiểu 1 UUID (`min_length=1` / `@ArrayMinSize(1)`).
- **Phương án cho PO**:
  - **(A)** Bắt buộc chọn ≥ 1 tài liệu nguồn (giữ hợp đồng AI/BE, khóa nút Tạo ở AI Studio bước 3 khi chưa chọn tài liệu và cập nhật copy Figma).
  - **(B)** Cho phép sinh case không cần tài liệu nguồn (nới `min_length=0` ở AI/BE và chuẩn hóa fallback prompt khi `<sources>` rỗng).

## 2. `BE-009` (`EBA-22` / `EBA-212`) — Kích thước chunk & đơn vị đếm
- **Phạm vi**: `ai-service/app/ingestion/chunker.py`, `ai-service/requirements.txt`, `docs/03_TASK-DETAILS.md`, `docs/ai/RAG-PIPELINE.md`, `.agents/rules/feature-rag.md`.
- **Xung đột**:
  - `docs/03_TASK-DETAILS.md` (`BE-009` AC-1): `500–1000 tokens`, overlap `100 tokens`.
  - `docs/ai/RAG-PIPELINE.md` & `.agents/rules/feature-rag.md`: `512 tokens`, overlap `64`.
  - `ai-service/app/ingestion/chunker.py:34-41`: `800` **ký tự**, overlap `100` ký tự (`use_tokens=False`), và `tiktoken` chưa có trong `requirements.txt` (thêm dependency mới cần ADR + PO duyệt theo `FEATURE-DELIVERY-WORKFLOW.md §4.3`).
- **Phương án cho PO**:
  - **(A)** Giữ tách theo ký tự `800 / 100` và cập nhật lại AC/tài liệu.
  - **(B)** Chuyển sang đếm token `512 / 64` + lập ADR thêm `tiktoken`.
  - **(C)** Chuyển sang đếm token `500–1000 / 100` + lập ADR thêm `tiktoken`.
