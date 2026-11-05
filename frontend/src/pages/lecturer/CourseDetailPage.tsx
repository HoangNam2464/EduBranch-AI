import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  ForbiddenState,
  PageHeader,
  Skeleton,
  Spinner,
  Tabs,
  formatBytes,
  formatDate,
  IconPlus,
  IconUpload,
  IconFile,
  IconTrash,
  IconRetry,
  IconFileSearch,
  IconX,
  IconCases,
} from "../../components/ui";
import { CaseTable } from "../../components/lecturer/CaseTable";
import { GenerateCaseDialog } from "../../components/lecturer/GenerateCaseDialog";
import { lecturerApi, apiErrorMessage, CourseRow, MaterialRow, CaseRow, ChunkRow } from "../../services/lecturerApi";

/**
 * Chi tiết khóa học — Figma 02.4 (`135:3524`) with dialogs 02.5 upload (`135:3634`), 02.6 delete
 * (`135:3678`) and the RAG Source Inspector 02.7 (`135:3698`, rendered here as a side panel).
 * Not rendered (HOLD OPD-001 enrolment): "Mã mời" button, "Tổng quan" and "Sinh viên" tabs.
 */
type Tab = "materials" | "cases";
const ACCEPT = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const MAX_BYTES = 50 * 1024 * 1024;

export function CourseDetailPage({ initialTab = "materials" }: { initialTab?: Tab }) {
  const { courseId = "" } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [course, setCourse] = useState<CourseRow | null>(null);
  const [materials, setMaterials] = useState<MaterialRow[] | null>(null);
  const [cases, setCases] = useState<CaseRow[] | null>(null);
  const [loadError, setLoadError] = useState<{ status?: number; message: string } | null>(null);
  const [genOpen, setGenOpen] = useState(false);

  useEffect(() => setTab(initialTab), [initialTab]);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const [c, m, k] = await Promise.all([
        lecturerApi.getCourse(courseId),
        lecturerApi.listMaterials(courseId),
        lecturerApi.listCases(courseId),
      ]);
      setCourse(c);
      setMaterials(m);
      setCases(k);
    } catch (err: any) {
      setLoadError({ status: err?.response?.status, message: apiErrorMessage(err, "Không tải được khóa học.") });
    }
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loadError?.status === 403) return <Card padding={false}><ForbiddenState /></Card>;
  if (loadError) return <Card padding={false}><ErrorState description={loadError.message} onRetry={load} /></Card>;
  if (!course || !materials || !cases) {
    return (
      <div aria-busy="true">
        <Skeleton className="mb-3 h-4 w-40" />
        <Skeleton className="mb-2 h-8 w-96" />
        <Skeleton className="mb-8 h-4 w-60" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: "Khóa học", onClick: () => navigate("/lecturer/courses") }, { label: course.course_code || course.name }]} />}
        title={course.name}
        description={course.course_code ? `Mã học phần: ${course.course_code}` : course.description || undefined}
        actions={
          <Button leftIcon={<IconPlus size={16} />} onClick={() => setGenOpen(true)} id="btn-new-case">
            Tạo Case mới
          </Button>
        }
      />
      <Tabs<Tab>
        tabs={[
          { id: "materials", label: `Tài liệu môn học (${materials.length})` },
          { id: "cases", label: `Case Study (${cases.length})` },
        ]}
        active={tab}
        onChange={(t) => navigate(t === "materials" ? `/lecturer/courses/${courseId}` : `/lecturer/courses/${courseId}/cases`)}
      />
      {tab === "materials" ? (
        <MaterialsTab courseId={courseId} materials={materials} onChanged={load} />
      ) : cases.length === 0 ? (
        <Card padding={false}>
          <EmptyState
            icon={<IconCases size={22} />}
            title="Chưa có Case Study"
            description="Sinh Case nháp bằng AI từ các tài liệu đã lập chỉ mục của khóa học."
            action={<Button leftIcon={<IconPlus size={16} />} onClick={() => setGenOpen(true)}>Tạo Case mới bằng AI</Button>}
          />
        </Card>
      ) : (
        <CaseTable cases={cases} />
      )}
      <GenerateCaseDialog isOpen={genOpen} onClose={() => setGenOpen(false)} courseId={courseId} />
    </div>
  );
}

function StatusPill({ m }: { m: MaterialRow }) {
  switch (m.processing_status) {
    case "COMPLETED":
      return <Badge variant="success" dot>Đã lập chỉ mục</Badge>;
    case "FAILED":
      return <Badge variant="error" dot>Xử lý thất bại</Badge>;
    case "PROCESSING":
      return <Badge variant="warning" dot>Đang xử lý</Badge>;
    default:
      return <Badge variant="neutral" dot>Chờ xử lý</Badge>;
  }
}

function MaterialsTab({ courseId, materials, onChanged }: { courseId: string; materials: MaterialRow[]; onChanged: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [notice, setNotice] = useState<{ variant: "error" | "success"; text: string } | null>(null);
  const [toDelete, setToDelete] = useState<MaterialRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [inspect, setInspect] = useState<MaterialRow | null>(null);

  const upload = async (file?: File | null) => {
    if (!file) return;
    const okType = /\.(pdf|docx)$/i.test(file.name);
    if (!okType) return setNotice({ variant: "error", text: "Chỉ hỗ trợ tệp PDF hoặc DOCX." });
    if (file.size > MAX_BYTES) return setNotice({ variant: "error", text: "Tệp vượt quá 50 MB." });
    setNotice(null);
    setUploading(file.name);
    try {
      const m = await lecturerApi.uploadMaterial(courseId, file);
      setNotice(
        m.processing_status === "COMPLETED"
          ? { variant: "success", text: `Đã tải lên và lập chỉ mục “${m.original_filename}” (${m.chunk_count ?? 0} đoạn trích).` }
          : { variant: "error", text: `Tải lên thành công nhưng xử lý thất bại: ${m.processing_error ?? "không rõ nguyên nhân"}. Bạn có thể bấm “Thử lại”.` },
      );
      onChanged();
    } catch (err) {
      setNotice({ variant: "error", text: apiErrorMessage(err, "Không tải lên được tài liệu.") });
    } finally {
      setUploading(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const retry = async (m: MaterialRow) => {
    setBusyId(m.id);
    try {
      await lecturerApi.reprocessMaterial(m.id);
      onChanged();
    } catch (err) {
      setNotice({ variant: "error", text: apiErrorMessage(err, "Không xử lý lại được tài liệu.") });
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setBusyId(toDelete.id);
    try {
      await lecturerApi.deleteMaterial(toDelete.id);
      setToDelete(null);
      onChanged();
    } catch (err) {
      setNotice({ variant: "error", text: apiErrorMessage(err, "Không xóa được tài liệu.") });
      setToDelete(null);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-base font-semibold text-gray-900">Tải lên tài liệu để AI lập chỉ mục</h2>
        <p className="mt-1 text-sm text-gray-600">
          Tài liệu PDF/DOCX (slide bài giảng, giáo trình, sổ tay) được tách thành các đoạn văn bản và lập chỉ mục để AI trích dẫn đúng bối cảnh khi sinh Case Study.
        </p>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files?.[0]); }}
          className={`mt-5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${dragOver ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-gray-50"}`}
        >
          {uploading ? (
            <>
              <span className="text-blue-600"><Spinner /></span>
              <p className="mt-3 text-sm font-medium text-gray-900">Đang tải lên và lập chỉ mục “{uploading}”…</p>
              <p className="mt-1 text-xs text-gray-500">Đang tách đoạn và tạo vector, vui lòng chờ.</p>
            </>
          ) : (
            <>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><IconUpload size={20} /></span>
              <p className="mt-3 text-sm font-medium text-gray-900">Kéo thả tài liệu vào đây hoặc nhấn để chọn tệp</p>
              <p className="mt-1 text-xs text-gray-500">Hỗ trợ PDF, DOCX • Tối đa 50 MB mỗi tệp</p>
              <Button className="mt-4" size="sm" leftIcon={<IconPlus size={14} />} onClick={() => inputRef.current?.click()} id="btn-pick-material">
                Chọn tài liệu
              </Button>
            </>
          )}
          <input ref={inputRef} type="file" accept={ACCEPT} className="sr-only" aria-label="Chọn tài liệu" onChange={(e) => upload(e.target.files?.[0])} />
        </div>
        {notice && <Alert variant={notice.variant} className="mt-4">{notice.text}</Alert>}
      </Card>

      <Card padding={false}>
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Tài liệu đã tải lên ({materials.length})</h2>
          <span className="text-xs text-gray-500">Tự động lập chỉ mục sau khi tải lên</span>
        </div>
        {materials.length === 0 ? (
          <EmptyState icon={<IconFile size={22} />} title="Chưa có tài liệu" description="Tải tài liệu môn học lên để AI có căn cứ khi sinh Case Study." />
        ) : (
          <ul className="divide-y divide-gray-200">
            {materials.map((m) => (
              <li key={m.id} className="flex items-center gap-4 px-6 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600"><IconFile size={18} /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{m.original_filename}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {formatBytes(m.size_bytes)} • {formatDate(m.uploaded_at)}
                    {m.processing_status === "COMPLETED" && ` • ${m.chunk_count ?? 0} đoạn trích`}
                    {m.processing_status === "PENDING" && " • Đang chờ trong hàng đợi xử lý"}
                  </p>
                  {m.processing_status === "FAILED" && m.processing_error && (
                    <p className="mt-0.5 text-xs text-red-700">Không trích xuất được nội dung: {m.processing_error}</p>
                  )}
                </div>
                <StatusPill m={m} />
                {m.processing_status === "COMPLETED" && (
                  <Button variant="ghost" size="sm" leftIcon={<IconFileSearch size={15} />} onClick={() => setInspect(m)}>
                    Xem đoạn trích
                  </Button>
                )}
                {m.processing_status !== "COMPLETED" && (
                  <Button variant="secondary" size="sm" leftIcon={<IconRetry size={14} />} isLoading={busyId === m.id} onClick={() => retry(m)}>
                    Thử lại
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => setToDelete(m)}
                  className="cursor-pointer rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                  aria-label={`Xóa ${m.original_filename}`}
                >
                  <IconTrash size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ConfirmDialog
        isOpen={!!toDelete}
        title="Xóa tài liệu?"
        description={<>Tài liệu <strong className="text-gray-900">{toDelete?.original_filename}</strong> và các đoạn trích đã lập chỉ mục sẽ bị xóa. Case Study đã sinh trước đó không bị ảnh hưởng.</>}
        confirmLabel="Xóa tài liệu"
        isLoading={!!toDelete && busyId === toDelete.id}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
      {inspect && <SourceInspector material={inspect} onClose={() => setInspect(null)} />}
    </div>
  );
}

/** RAG Source Inspector (Figma 02.7) — read-only list of indexed chunks of one material. */
function SourceInspector({ material, onClose }: { material: MaterialRow; onClose: () => void }) {
  const [chunks, setChunks] = useState<ChunkRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    lecturerApi.getMaterialChunks(material.id).then((r) => setChunks(r.chunks)).catch((e) => setError(apiErrorMessage(e)));
  }, [material.id]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-gray-900/30" onClick={onClose} aria-hidden="true" />
      <aside role="dialog" aria-modal="true" aria-label="Nguồn trích dẫn" className="relative z-10 flex h-full w-full max-w-xl flex-col bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Nguồn trích dẫn (RAG)</p>
            <h2 className="mt-1 truncate text-base font-semibold text-gray-900">{material.original_filename}</h2>
            <p className="text-xs text-gray-500">{material.chunk_count ?? 0} đoạn trích đã lập chỉ mục</p>
          </div>
          <button type="button" onClick={onClose} className="cursor-pointer rounded-md p-1 text-gray-500 hover:bg-gray-100" aria-label="Đóng">
            <IconX size={18} />
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-auto px-6 py-4">
          {error && <Alert variant="error">{error}</Alert>}
          {!chunks && !error && [0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
          {chunks?.map((c) => (
            <div key={c.id} className="rounded-lg border border-gray-200 p-3">
              <p className="mb-1.5 font-mono text-xs text-gray-500">Đoạn #{c.chunk_index + 1}</p>
              <p className="whitespace-pre-wrap text-sm leading-6 text-gray-800">{c.chunk_text}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
