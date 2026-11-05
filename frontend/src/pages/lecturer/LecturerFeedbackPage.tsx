import { Card, EmptyState, PageHeader, IconMessage } from "../../components/ui";

/**
 * Phản hồi sinh viên (FE-019 / BE-026, Sprint 4) — outside the midterm review scope
 * (PROJECT-EXECUTION-PLAN-v2 §2). The lecturer-feedback backend module has no routes yet.
 * Figma 04.1/04.2 (`1:1852`, `1:1702`) stay on Page 1.
 */
export function LecturerFeedbackPage() {
  return (
    <div>
      <PageHeader title="Phản hồi sinh viên" description="Xem lượt làm bài, lập luận và phản hồi cho sinh viên" />
      <Card padding={false}>
        <EmptyState
          icon={<IconMessage size={22} />}
          title="Chức năng đang được phát triển"
          description="Hàng đợi phản hồi lập luận thuộc Sprint 4 và chưa có trong bản đánh giá giữa kỳ."
        />
      </Card>
    </div>
  );
}
