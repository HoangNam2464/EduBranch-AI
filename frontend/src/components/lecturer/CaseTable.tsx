import { Link } from "react-router-dom";
import { CaseStatusBadge, ModeBadge, IconEdit, formatDate } from "../ui";
import type { CaseRow } from "../../services/lecturerApi";

/**
 * Case list table — Figma 03.1 (`135:3852`).
 * Columns "Hạn nộp", "Nhân bản" and "Lưu trữ" from the frame are not rendered: the backend has no
 * deadline field and no duplicate/archive API (MVP-REVIEW-MAPPING deviations).
 */
export function CaseTable({ cases, courseNames }: { cases: Array<CaseRow>; courseNames?: Record<string, string> }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-600">
          <tr>
            <th scope="col" className="px-5 py-3">Tiêu đề tình huống</th>
            <th scope="col" className="px-3 py-3">Chế độ</th>
            <th scope="col" className="px-3 py-3">Trạng thái</th>
            <th scope="col" className="px-3 py-3">Cấu trúc</th>
            <th scope="col" className="px-3 py-3">Cập nhật</th>
            <th scope="col" className="px-5 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {cases.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="max-w-md px-5 py-4">
                <Link to={`/lecturer/cases/${c.id}/review`} className="font-medium text-gray-900 hover:text-blue-700">
                  {c.title}
                </Link>
                {courseNames?.[c.course_id] && <p className="mt-1 text-xs text-gray-500">Khóa: {courseNames[c.course_id]}</p>}
              </td>
              <td className="px-3 py-4"><ModeBadge mode={c.learning_mode} /></td>
              <td className="px-3 py-4"><CaseStatusBadge status={c.status} /></td>
              <td className="px-3 py-4 text-gray-900">
                {c.learning_mode === "REVIEW_STUDY" ? <span className="text-gray-500">Không dùng cây</span> : `${c.node_count ?? "—"} Nodes`}
              </td>
              <td className="px-3 py-4 text-gray-600">{formatDate(c.updated_at)}</td>
              <td className="px-5 py-4 text-right">
                <Link
                  to={`/lecturer/cases/${c.id}/review`}
                  className="inline-flex rounded-md p-1.5 text-blue-600 hover:bg-blue-50"
                  aria-label={`Chỉnh sửa ${c.title}`}
                  title="Chỉnh sửa"
                >
                  <IconEdit size={16} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
