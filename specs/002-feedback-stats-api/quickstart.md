# Quickstart — kiểm chứng 002-feedback-stats-api

```bash
# 1. Hạ tầng (không xóa volume)
docker compose up -d postgres redis minio

# 2. Backend — CI local (QG1/QG2)
cd backend
npm ci
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand

# 3. SQL thật trên schema V1–V5 (opt-in)
QA_LIVE=1 npx jest test/feedback-stats.live.spec.ts --runInBand
```

Kịch bản tay (QG5, sau khi chạy `npm run start:dev` với seed):
1. STUDENT: nộp bài Review Study (E1) → 201; nộp lại → 409; lấy bài của mình (E2) → 200.
2. STUDENT: nộp phản tư khi `SUBMITTED` (E4) → 409.
3. LECTURER chủ khóa: hàng đợi (E7) có bài vừa nộp, `feedbackStatus = PENDING`; gửi nhận xét (E6) → 201; E3 cho thấy `REVIEWED`.
4. STUDENT: E5 → 1 nhận xét; E4 → 200, `REFLECTED`; E4 lần 2 → 409.
5. LECTURER khác: E6/E7/E8 trên khóa không sở hữu → 403.
6. LECTURER chủ khóa: E8 trên case Branching có attempt → số đếm khớp truy vấn kiểm tay trong `psql`.
