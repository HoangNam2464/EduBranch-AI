# Requirements checklist: 003-reasoning-access

Claude đề xuất câu trả lời. Chỉ PO hoặc người review được chỉ định mới đánh `[x]`. Một mục đã đánh dấu không có nghĩa là đã làm xong.

- [ ] CHK001 Mỗi AC kiểm thử được bằng một mã HTTP hoặc giá trị trường cụ thể. Đề xuất: đạt (AC-R1..R5 có mã HTTP; AC-R4 có giá trị `null` hoặc văn bản).
- [ ] CHK002 Vai trò đầy đủ (STUDENT chủ attempt, STUDENT khác, LECTURER, ADMIN, không JWT). Đề xuất: đạt (spec §2, §5).
- [ ] CHK003 Ownership và INV-01 nằm ở mức truy vấn, đúng FND §4. Đề xuất: đạt (AC-R2, AC-R3).
- [ ] CHK004 Quy tắc hệ quả có nguồn (FND §6, FR-BS-06, P0-SEC-02). Đề xuất: đạt.
- [ ] CHK005 Ranh giới giữ nguyên được nêu rõ (route, trường, DB, FE). Đề xuất: đạt (spec §3).
- [ ] CHK006 Không có quyết định nghiệp vụ nào bị giả định. Đề xuất: đạt. Chỉ có một quyết định kỹ thuật (`null` thay vì bỏ trường), đã ghi lý do.
- [ ] CHK007 Không có UI, nên các mục UI và ngôn ngữ không áp dụng. Đề xuất: N/A.
