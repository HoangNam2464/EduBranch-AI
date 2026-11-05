import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, EmptyState, ErrorState, Input, PageHeader, Skeleton, IconPlus, IconSearch, IconCases } from "../../components/ui";
import { CaseTable } from "../../components/lecturer/CaseTable";
import { GenerateCaseDialog } from "../../components/lecturer/GenerateCaseDialog";
import { lecturerApi, apiErrorMessage, CaseRow } from "../../services/lecturerApi";

/**
 * Quản lý Case Study — Figma 03.1 (`135:3852`): every case across the lecturer's own courses.
 * Built from the owner-scoped per-course endpoint (GET /courses/:id/cases); no cross-course API is added.
 */
export function CasesPage() {
  const [rows, setRows] = useState<CaseRow[] | null>(null);
  const [courseNames, setCourseNames] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [genOpen, setGenOpen] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setRows(null);
    try {
      const courses = await lecturerApi.listCourses();
      setCourseNames(Object.fromEntries(courses.map((c) => [c.id, c.name])));
      const lists = await Promise.all(courses.map((c) => lecturerApi.listCases(c.id)));
      setRows(lists.flat().sort((a, b) => b.updated_at.localeCompare(a.updated_at)));
    } catch (err) {
      setError(apiErrorMessage(err, "Không tải được danh sách Case Study."));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!rows || !term) return rows;
    return rows.filter((r) => r.title.toLowerCase().includes(term) || (courseNames[r.course_id] ?? "").toLowerCase().includes(term));
  }, [rows, q, courseNames]);

  return (
    <div>
      <PageHeader
        title="Quản lý Case Study"
        description="Kho tình huống học tập phân nhánh và các bài tập giải quyết vấn đề"
        actions={<Button leftIcon={<IconPlus size={16} />} onClick={() => setGenOpen(true)} id="btn-generate-open">Tạo Case mới bằng AI</Button>}
      />
      <div className="relative mb-4">
        <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm kiếm case theo tiêu đề hoặc môn học…" className="pl-9" aria-label="Tìm kiếm case" />
      </div>

      {error && <Card padding={false}><ErrorState description={error} onRetry={load} /></Card>}
      {!error && filtered === null && (
        <div className="space-y-2 rounded-xl border border-gray-200 bg-white p-5" aria-busy="true">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      )}
      {!error && filtered && filtered.length === 0 && (
        <Card padding={false}>
          <EmptyState
            icon={<IconCases size={22} />}
            title={q ? "Không có case phù hợp" : "Chưa có Case Study"}
            description={q ? "Thử từ khóa khác." : "Sinh Case nháp bằng AI từ tài liệu của một khóa học."}
          />
        </Card>
      )}
      {!error && filtered && filtered.length > 0 && (
        <>
          <CaseTable cases={filtered} courseNames={courseNames} />
          <p className="mt-3 text-xs text-gray-500">Hiển thị {filtered.length} / {rows?.length ?? 0} Case Study</p>
        </>
      )}
      <GenerateCaseDialog isOpen={genOpen} onClose={() => setGenOpen(false)} />
    </div>
  );
}
