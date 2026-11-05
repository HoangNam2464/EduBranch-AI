import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Field, Input, Modal, Select, Spinner, IconAlert } from "../ui";
import { lecturerApi, apiErrorMessage, CourseRow, MaterialRow } from "../../services/lecturerApi";

/**
 * Sinh Case nháp bằng AI — form (FE-007), loading dialog Figma 03.2 (`135:4017`),
 * failure notice Figma 03.3 (`135:4053`). Generation is synchronous on the backend
 * (POST /cases/generate); on success the lecturer lands in the editor with the new DRAFT.
 * Only COMPLETED materials can ground a case (RAG context).
 */
export function GenerateCaseDialog({
  isOpen,
  onClose,
  courseId,
}: {
  isOpen: boolean;
  onClose: () => void;
  courseId?: string;
}) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [selectedCourse, setSelectedCourse] = useState(courseId ?? "");
  const [materials, setMaterials] = useState<MaterialRow[] | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [topic, setTopic] = useState("");
  const [numNodes, setNumNodes] = useState(5);
  const [phase, setPhase] = useState<"form" | "generating" | "failed">("form");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setPhase("form");
    setError(null);
    setTopic("");
    setSelectedCourse(courseId ?? "");
    if (!courseId) lecturerApi.listCourses().then(setCourses).catch(() => setCourses([]));
  }, [isOpen, courseId]);

  useEffect(() => {
    if (!isOpen || !selectedCourse) {
      setMaterials(null);
      return;
    }
    setMaterials(null);
    lecturerApi
      .listMaterials(selectedCourse)
      .then((m) => {
        const done = m.filter((x) => x.processing_status === "COMPLETED");
        setMaterials(done);
        setPicked(done.map((x) => x.id));
      })
      .catch(() => setMaterials([]));
  }, [isOpen, selectedCourse]);

  const generate = async () => {
    if (!selectedCourse) return setError("Vui lòng chọn khóa học.");
    if (picked.length === 0) return setError("Cần ít nhất một tài liệu đã lập chỉ mục để AI trích dẫn bối cảnh.");
    if (!topic.trim()) return setError("Vui lòng nhập chủ đề tình huống.");
    setError(null);
    setPhase("generating");
    try {
      const created = await lecturerApi.generateCase({ courseId: selectedCourse, materialIds: picked, topicHint: topic.trim(), numNodes });
      onClose();
      navigate(`/lecturer/cases/${created.id}/review`);
    } catch (err) {
      setError(apiErrorMessage(err, "AI chưa sinh được Case nháp. Vui lòng thử lại."));
      setPhase("failed");
    }
  };

  if (phase === "generating") {
    return (
      <Modal isOpen={isOpen} onClose={() => {}} title="Đang sinh Case nháp" description="AI đang đọc các đoạn trích tài liệu và dựng cây quyết định. Quá trình có thể mất đến một phút.">
        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
          <span className="text-blue-600"><Spinner size="sm" /></span>
          Truy xuất ngữ cảnh → dựng tình huống và phương án → kiểm tra cấu trúc cây
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo Case mới bằng AI"
      description="Case được sinh ở trạng thái Bản nháp. Bạn rà soát và chỉnh sửa trước khi phê duyệt và xuất bản."
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button onClick={generate} id="btn-generate-case">{phase === "failed" ? "Thử lại" : "Sinh Case nháp"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        {phase === "failed" && error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-gray-800" role="alert">
            <IconAlert size={18} className="mt-0.5 shrink-0 text-red-600" />
            <div>
              <p className="font-medium text-gray-900">Sinh Case thất bại</p>
              <p>{error}</p>
            </div>
          </div>
        )}
        {phase === "form" && error && <Alert variant="error">{error}</Alert>}
        {!courseId && (
          <Field label="Khóa học" htmlFor="gen-course" required>
            <Select id="gen-course" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
              <option value="">Chọn khóa học…</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.course_code ? `${c.course_code} · ` : ""}{c.name}</option>
              ))}
            </Select>
          </Field>
        )}
        <Field label="Chủ đề tình huống" htmlFor="gen-topic" required hint="Mô tả ngắn bối cảnh bạn muốn sinh viên ra quyết định.">
          <Input id="gen-topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="VD: Xử lý xung đột trong nhóm dự án phần mềm" />
        </Field>
        <Field label="Số tình huống dự kiến" htmlFor="gen-nodes" hint="Từ 3 đến 10 nút quyết định.">
          <Input id="gen-nodes" type="number" min={3} max={10} value={numNodes} onChange={(e) => setNumNodes(Math.min(10, Math.max(3, Number(e.target.value) || 5)))} className="w-28" />
        </Field>
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-gray-900">Tài liệu làm căn cứ <span className="text-red-600">*</span></legend>
          {selectedCourse && materials === null && <p className="text-sm text-gray-500">Đang tải tài liệu…</p>}
          {materials && materials.length === 0 && (
            <p className="text-sm text-gray-600">Khóa học chưa có tài liệu nào được lập chỉ mục. Hãy tải tài liệu lên trước.</p>
          )}
          {materials && materials.length > 0 && (
            <ul className="max-h-48 space-y-1 overflow-auto rounded-lg border border-gray-200 p-2">
              {materials.map((m) => (
                <li key={m.id}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-800 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-blue-600"
                      checked={picked.includes(m.id)}
                      onChange={(e) => setPicked(e.target.checked ? [...picked, m.id] : picked.filter((x) => x !== m.id))}
                    />
                    <span className="truncate">{m.original_filename}</span>
                    <span className="ml-auto shrink-0 text-xs text-gray-500">{m.chunk_count ?? 0} đoạn trích</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </fieldset>
      </div>
    </Modal>
  );
}
