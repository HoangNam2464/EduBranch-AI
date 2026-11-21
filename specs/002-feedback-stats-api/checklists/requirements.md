# Requirements Quality Checklist — 002-feedback-stats-api

> Kiểm chất lượng **yêu cầu**, không phải code. Claude đề xuất câu trả lời; chỉ PO (hoặc reviewer được PO chỉ định) đánh `[x]`. Một ô đã đánh không có nghĩa đã hiện thực.

## Đầy đủ
- [ ] CHK001 Mỗi AC của BE-025/026/028 có ít nhất một FR — *Đề xuất: Có (spec §5: AC-1..3 mỗi task → FR-01..03, FR-09..11, FR-14..17).*
- [ ] CHK002 Mỗi API có đủ mã 200/201, 400, 401, 403, 404, 409 khi áp dụng — *Đề xuất: Có (contract E1–E8).*
- [ ] CHK003 Trạng thái rỗng được định nghĩa và phân biệt với lỗi — *Đề xuất: Có (E2 `SUBMISSION_NOT_FOUND`, E5 `feedback: null`, E7 `items: []`, E8 số đếm 0).*

## Rõ ràng / đo được
- [ ] CHK004 Định nghĩa completion rate, single/retry, phân bổ, phần trăm, làm tròn, chia 0 — *Đề xuất: Có (contract §C).*
- [ ] CHK005 Giới hạn độ dài có nguồn — *Đề xuất: min 10 có nguồn; max 3000 là `[ĐỀ-XUẤT]` (FR-05) cần PO duyệt.*

## Truy vết nguồn
- [ ] CHK006 Mọi route có nguồn hoặc nhãn `[ĐỀ-XUẤT]` — *Đề xuất: Có; route Review Study theo C1-A; E7 là `[ĐỀ-XUẤT]` (G0).*
- [ ] CHK007 Mọi trường DTO ánh xạ cột DB hoặc giá trị tính từ cột — *Đề xuất: Có; không có `nodeTitle` (R4).*

## Nhất quán FND / quy tắc
- [ ] CHK008 INV-01 ở mức truy vấn cho mọi API sinh viên — *Đề xuất: Có (R-INV01).*
- [ ] CHK009 Không trường điểm/xếp hạng/AI — *Đề xuất: Có.*
- [ ] CHK010 Thống kê không lộ dữ liệu định danh — *Đề xuất: Có (B-6, FR-18, T032).*
- [ ] CHK011 Chỉ chủ khóa (giảng viên) — *Đề xuất: Có (R-OWN-L).*

## Vai trò và quyền
- [ ] CHK012 Ma trận 6 vai cho mọi route được yêu cầu kiểm — *Đề xuất: Có (SC-02, T040).*
- [ ] CHK013 Hành vi ADMIN được nêu — *Đề xuất: Có (403, spec §2).*

## Câu hỏi mở (không đánh dấu được tới khi PO trả lời)
- [ ] CHK014 C1 họ route Review Study — PO trả lời "C1-A" (2026-11-20); chờ PO đánh dấu.
- [ ] CHK015 C2 nhận xét lần 2 — PO trả lời "C2-A: Từ chối 409" (2026-11-20); chờ PO đánh dấu.
- [ ] CHK016 C3 lộ trình Branching cho giảng viên — PO trả lời "C3-A: Có" (2026-11-20); chờ PO đánh dấu.

## Không áp dụng cho phần BE
Focus/label, responsive, ngôn ngữ UI (AGENTS.md rule 12), trạng thái UI: áp dụng ở Phase 6 (FE) — kiểm ở QG3 theo Figma.
