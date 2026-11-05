/**
 * EduBranch AI — Lecturer API (courses, materials, cases).
 * Shapes mirror the backend responses exactly (snake_case rows from `pg`), verified against
 * course.service.ts, material.service.ts and case.service.ts on feature/midterm-core-flow.
 */
import apiClient from "./apiClient";

type Envelope<T> = { status: string; data: T };

export interface CourseRow {
  id: string;
  name: string;
  description: string | null;
  course_code: string | null;
  lecturer_id: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export type ProcessingStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface MaterialRow {
  id: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  course_id: string;
  processing_status: ProcessingStatus;
  chunk_count: number | null;
  processing_error: string | null;
  uploaded_at: string;
  updated_at: string;
}

export interface ChunkRow {
  id: string;
  chunk_index: number;
  chunk_text: string;
  created_at: string;
}

export type CaseStatusValue = "DRAFT" | "REVIEWED" | "APPROVED" | "PUBLISHED";

export interface CaseRow {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  status: CaseStatusValue;
  learning_mode: "BRANCHING_STUDY" | "REVIEW_STUDY" | string;
  version?: number;
  root_node_id?: string | null;
  node_count?: number;
  created_at: string;
  updated_at: string;
}

export interface OptionRow {
  id: string;
  node_id: string;
  option_text: string;
  consequence: string;
  next_node_id: string | null;
}

export interface NodeRow {
  id: string;
  case_id: string;
  situation: string;
  is_terminal: boolean;
  node_index: number;
  options: OptionRow[];
}

export interface CaseDetail extends CaseRow {
  lecturer_id: string;
  nodes: NodeRow[];
}

const data = <T,>(p: Promise<{ data: Envelope<T> }>) => p.then((r) => r.data.data);

export const lecturerApi = {
  // Courses
  listCourses: () => data<CourseRow[]>(apiClient.get("/courses")),
  getCourse: (id: string) => data<CourseRow>(apiClient.get(`/courses/${id}`)),
  createCourse: (body: { name: string; description?: string; courseCode?: string }) =>
    data<CourseRow>(apiClient.post("/courses", body)),
  deleteCourse: (id: string) => apiClient.delete(`/courses/${id}`),

  // Materials
  listMaterials: (courseId: string) => data<MaterialRow[]>(apiClient.get(`/courses/${courseId}/materials`)),
  uploadMaterial: (courseId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return data<MaterialRow>(
      apiClient.post(`/courses/${courseId}/materials`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 180000,
      }),
    );
  },
  deleteMaterial: (id: string) => apiClient.delete(`/materials/${id}`),
  reprocessMaterial: (id: string) => data<MaterialRow>(apiClient.post(`/materials/${id}/reprocess`, undefined, { timeout: 180000 })),
  getMaterialChunks: (id: string) =>
    data<{ material: Pick<MaterialRow, "id" | "original_filename" | "processing_status" | "chunk_count">; chunks: ChunkRow[] }>(
      apiClient.get(`/materials/${id}/chunks`),
    ),

  // Cases
  listCases: (courseId: string) => data<CaseRow[]>(apiClient.get(`/courses/${courseId}/cases`)),
  getCase: (id: string) => data<CaseDetail>(apiClient.get(`/cases/${id}`)),
  generateCase: (body: { courseId: string; materialIds: string[]; topicHint?: string; numNodes?: number }) =>
    data<CaseDetail>(apiClient.post("/cases/generate", body, { timeout: 180000 })),
  updateCase: (id: string, body: { title?: string; description?: string; nodes?: Array<{ id: string; situation: string; options: Array<{ id: string; text: string; consequence: string }> }> }) =>
    data<CaseDetail>(apiClient.put(`/cases/${id}`, body)),
  setCaseStatus: (id: string, status: CaseStatusValue) => data<unknown>(apiClient.patch(`/cases/${id}/status`, { status })),
};

/** Maps an Axios error to a Vietnamese message for the shared error UI. */
export function apiErrorMessage(err: any, fallback = "Đã có lỗi xảy ra. Vui lòng thử lại."): string {
  const status = err?.response?.status;
  if (!err?.response) return "Không kết nối được máy chủ. Vui lòng kiểm tra kết nối và thử lại.";
  if (status === 403) return "Bạn không có quyền thực hiện thao tác này.";
  if (status === 404) return "Không tìm thấy dữ liệu yêu cầu.";
  if (status === 409) return "Dữ liệu đang được sử dụng hoặc đã tồn tại.";
  if (status === 413) return "Tệp vượt quá dung lượng cho phép (50 MB).";
  return fallback;
}
