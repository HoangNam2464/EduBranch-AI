import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Badge,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Modal,
  PageHeader,
  Skeleton,
  Textarea,
  Alert,
  IconPlus,
  IconFile,
  IconBranch,
  IconArrowRight,
  IconTrash,
  IconBook,
} from "../../components/ui";
import { lecturerApi, apiErrorMessage, CourseRow } from "../../services/lecturerApi";

/**
 * Quản lý Khóa học — Figma 02.1 (`135:3360`), hộp thoại 02.2 (`135:3478`), xác nhận xóa 02.3 (`135:3504`).
 * Counts come from the course's own material and case lists (owner-scoped endpoints).
 */
type CourseWithCounts = CourseRow & { materialCount?: number; caseCount?: number };

export function CoursesPage() {
  const [courses, setCourses] = useState<CourseWithCounts[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [toDelete, setToDelete] = useState<CourseRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setCourses(null);
    try {
      const list = await lecturerApi.listCourses();
      const withCounts = await Promise.all(
        list.map(async (c) => {
          const [m, k] = await Promise.allSettled([lecturerApi.listMaterials(c.id), lecturerApi.listCases(c.id)]);
          return {
            ...c,
            materialCount: m.status === "fulfilled" ? m.value.length : undefined,
            caseCount: k.status === "fulfilled" ? k.value.length : undefined,
          };
        }),
      );
      setCourses(withCounts);
    } catch (err) {
      setError(apiErrorMessage(err, "Không tải được danh sách khóa học."));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await lecturerApi.deleteCourse(toDelete.id);
      setToDelete(null);
      load();
    } catch (err) {
      setError(apiErrorMessage(err, "Không xóa được khóa học."));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Quản lý Khóa học"
        description="Danh sách các lớp học phần bạn phụ trách giảng dạy và tổ chức học tập tình huống"
        actions={
          <Button leftIcon={<IconPlus size={16} />} onClick={() => setCreateOpen(true)} id="btn-create-course">
            Tạo khóa học mới
          </Button>
        }
      />

      {error && courses !== null && <Alert variant="error" className="mb-4">{error}</Alert>}

      {courses === null && !error && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <Skeleton className="mb-4 h-5 w-16" />
              <Skeleton className="mb-3 h-6 w-3/4" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </Card>
          ))}
        </div>
      )}

      {courses === null && error && (
        <Card padding={false}>
          <ErrorState description={error} onRetry={load} />
        </Card>
      )}

      {courses && courses.length === 0 && (
        <Card padding={false}>
          <EmptyState
            icon={<IconBook size={22} />}
            title="Chưa có khóa học nào"
            description="Tạo khóa học đầu tiên để tải tài liệu môn học và sinh Case Study cho sinh viên."
            action={
              <Button leftIcon={<IconPlus size={16} />} onClick={() => setCreateOpen(true)}>
                Tạo khóa học mới
              </Button>
            }
          />
        </Card>
      )}

      {courses && courses.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((c) => (
            <Card key={c.id} className="flex flex-col">
              <div className="mb-4 flex items-start justify-between gap-2">
                {c.course_code ? <Badge variant="info">{c.course_code}</Badge> : <span />}
                <button
                  type="button"
                  onClick={() => setToDelete(c)}
                  className="cursor-pointer rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                  aria-label={`Xóa khóa học ${c.name}`}
                >
                  <IconTrash size={16} />
                </button>
              </div>
              <h2 className="text-lg font-semibold leading-7 text-gray-900">{c.name}</h2>
              <p className="mt-2 line-clamp-3 flex-1 text-sm text-gray-600">{c.description || "Chưa có mô tả."}</p>
              <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-4 text-xs text-gray-600">
                <span className="flex items-center gap-1.5">
                  <IconFile size={14} /> {c.materialCount ?? "—"} tài liệu
                </span>
                <span className="flex items-center gap-1.5">
                  <IconBranch size={14} /> {c.caseCount ?? "—"} Case Study
                </span>
              </div>
              <div className="mt-4 flex gap-5 text-sm font-medium">
                <Link to={`/lecturer/courses/${c.id}`} className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                  Tài liệu môn học <IconArrowRight size={14} />
                </Link>
                <Link to={`/lecturer/courses/${c.id}/cases`} className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                  Case Study <IconArrowRight size={14} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateCourseDialog isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => { setCreateOpen(false); load(); }} />

      <ConfirmDialog
        isOpen={!!toDelete}
        title="Xóa khóa học?"
        description={
          <>
            Khóa học <strong className="text-gray-900">{toDelete?.name}</strong> cùng toàn bộ tài liệu và Case Study bên trong sẽ bị xóa vĩnh viễn. Thao tác này không thể hoàn tác.
          </>
        }
        confirmLabel="Xóa khóa học"
        isLoading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}

function CreateCourseDialog({ isOpen, onClose, onCreated }: { isOpen: boolean; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setCode("");
      setDescription("");
      setError(null);
    }
  }, [isOpen]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return setError("Vui lòng nhập tên khóa học.");
    setSaving(true);
    setError(null);
    try {
      await lecturerApi.createCourse({ name: name.trim(), courseCode: code.trim() || undefined, description: description.trim() || undefined });
      onCreated();
    } catch (err) {
      setError(apiErrorMessage(err, "Không tạo được khóa học."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo khóa học mới"
      description="Khóa học là nơi bạn tải tài liệu môn học và quản lý các Case Study."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button onClick={() => submit()} isLoading={saving} id="btn-submit-course">
            Tạo khóa học
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}
        <Field label="Tên khóa học" htmlFor="course-name" required>
          <Input id="course-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Quản lý dự án phần mềm" autoFocus />
        </Field>
        <Field label="Mã học phần" htmlFor="course-code" hint="Không bắt buộc. VD: CS402">
          <Input id="course-code" value={code} onChange={(e) => setCode(e.target.value)} />
        </Field>
        <Field label="Mô tả" htmlFor="course-desc">
          <Textarea id="course-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
      </form>
    </Modal>
  );
}
