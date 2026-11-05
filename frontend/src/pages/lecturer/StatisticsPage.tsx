import { Card, EmptyState, PageHeader, IconChart } from "../../components/ui";

/**
 * Thống kê học tập (FE-022 / BE-028, Sprint 4) — outside the midterm review scope
 * (PROJECT-EXECUTION-PLAN-v2 §2). The backend statistics module has no routes yet, so the page
 * states that honestly instead of showing zeros. Figma 04.3 (`1:1493`) stays on Page 1.
 */
export function StatisticsPage() {
  return (
    <div>
      <PageHeader title="Thống kê học tập" description="Tổng hợp tiến độ học tập theo khóa học và Case Study" />
      <Card padding={false}>
        <EmptyState
          icon={<IconChart size={22} />}
          title="Chức năng đang được phát triển"
          description="Thống kê luồng học tập thuộc Sprint 4 và chưa có trong bản đánh giá giữa kỳ."
        />
      </Card>
    </div>
  );
}
