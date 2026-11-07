/**
 * RagSourceInspectorPage — Giảng viên · RAG Source Inspector
 * Figma Specs: 02.7 (DES-005)
 * Exact Figma Color System: Deep Navy #1E3A8A, Soft Mint #E6F4EA, Dark Slate #1E293B
 * Route: /lecturer/courses/:courseId/materials/:materialId/rag
 */
import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

interface EvidenceChunk {
  id: string;
  chunkNumber: number;
  page: number;
  charCount: number;
  content: string;
}

const MOCK_CHUNKS: EvidenceChunk[] = [
  {
    id: "c12",
    chunkNumber: 12,
    page: 14,
    charCount: 680,
    content:
      "Khi lưu lượng tới cổng thanh toán vượt 5 lần ngưỡng thiết kế, nhóm vận hành kích hoạt chế độ hạ cấp: tạm ngắt các dịch vụ không thiết yếu và áp dụng giới hạn tốc độ theo thuật toán Token Bucket tại Gateway.",
  },
  {
    id: "c13",
    chunkNumber: 13,
    page: 14,
    charCount: 612,
    content:
      "Quyết định hạ cấp cần được thông báo cho bộ phận chăm sóc khách hàng trong vòng 10 phút, kèm thông điệp chuẩn giải thích các tính năng tạm thời không khả dụng.",
  },
  {
    id: "c27",
    chunkNumber: 27,
    page: 18,
    charCount: 540,
    content:
      "Việc mở rộng nóng cụm cơ sở dữ liệu trong lúc tải cao có thể gây độ trễ đồng bộ bản sao, làm sai lệch số dư ví nếu không khóa ghi tạm thời.",
  },
  {
    id: "c31",
    chunkNumber: 31,
    page: 19,
    charCount: 590,
    content:
      "Sau sự cố, báo cáo hậu kiểm phải ghi lại mốc thời gian từng quyết định, người phê duyệt và chỉ số SLA trước - trong - sau can thiệp.",
  },
];

const OTHER_DOCUMENTS = [
  { name: "Slide_Tuan_7_An_ninh_mang.pdf", status: "COMPLETED", statusLabel: "Hoàn tất" },
  { name: "Bao_cao_su_co_ngan_hang.docx", status: "PENDING", statusLabel: "Đang chờ" },
  { name: "Giao_trinh_Zero_Trust_Security.pdf", status: "PROCESSING", statusLabel: "Đang xử lý" },
  { name: "Phu_luc_Nhat_ky_he_thong.docx", status: "FAILED", statusLabel: "Thất bại" },
];

export function RagSourceInspectorPage() {
  const { courseId } = useParams<{ courseId: string; materialId: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredChunks = MOCK_CHUNKS.filter((c) =>
    c.content.toLowerCase().includes(search.toLowerCase()) ||
    c.chunkNumber.toString().includes(search)
  );

  return (
    <div className="flex flex-col gap-6">
      {/* ── Top Header Context & Search ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/lecturer/courses/${courseId || "default"}/materials`)}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 cursor-pointer transition"
          >
            ←
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              RAG Source Inspector
            </h1>
            <p className="text-xs text-slate-400">
              Kiểm tra các đoạn trích (evidence chunks) được lập chỉ mục vector cho RAG
            </p>
          </div>
        </div>

        {/* Search within chunks */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 w-56">
          <input
            type="text"
            placeholder="Tìm kiếm đoạn trích..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none placeholder-slate-400"
          />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      {/* ── Top Metric Cards Row (Figma 02.7) ── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Card 1: Đoạn trích */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A] text-xs">
                📄
              </span>
              <span className="text-xs font-bold text-slate-500">Đoạn trích</span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-bold text-slate-900">48</span>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-mono text-[#1E3A8A] border border-blue-100 truncate max-w-[150px]">
                Runbook_ung_cuu_su_co_DDoS.pdf
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Số trang */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#E6F4EA] text-[#03543F] text-xs">
                📖
              </span>
              <span className="text-xs font-bold text-slate-500">Số trang</span>
            </div>
            <div className="pt-1">
              <span className="text-2xl font-bold text-slate-900">24</span>
            </div>
          </div>
        </div>

        {/* Card 3: Dung lượng */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FDE8E8] text-[#9B1C1C] text-xs">
                ☁️
              </span>
              <span className="text-xs font-bold text-slate-500">Dung lượng</span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-bold text-slate-900">2.40 MB</span>
              <span className="text-[11px] text-slate-400">Tải lên 20/10/2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Two-Column Layout ── */}
      <div className="flex items-start gap-6">
        {/* Left Column (Chunks List + Other Docs) */}
        <div className="flex-1 space-y-6 min-w-0">
          {/* Section 1: Đoạn trích đã lập chỉ mục */}
          <div className="space-y-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Đoạn trích đã lập chỉ mục</h2>
              <p className="text-xs text-slate-400">Nguồn AI dùng để trích dẫn khi sinh case</p>
            </div>

            <div className="space-y-3">
              {filteredChunks.map((chunk) => (
                <div
                  key={chunk.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-2 hover:border-[#1E3A8A] transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A] text-xs">
                      📄
                    </span>
                    <span className="text-xs font-bold text-slate-900">Đoạn #{chunk.chunkNumber}</span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs text-slate-400">Trang {chunk.page} · {chunk.charCount} ký tự</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed pl-8">
                    {chunk.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Tài liệu khác trong khóa (4) */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-900">Tài liệu khác trong khóa (4)</h3>
            <div className="space-y-2">
              {OTHER_DOCUMENTS.map((doc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs hover:bg-slate-50/50 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm">📄</span>
                    <span className="text-xs font-semibold text-slate-800">{doc.name}</span>
                  </div>
                  {doc.status === "COMPLETED" && (
                    <span className="rounded-full bg-[#E6F4EA] px-2 py-0.5 text-[10px] font-semibold text-[#03543F] border border-[#DEF7EC]">
                      {doc.statusLabel}
                    </span>
                  )}
                  {doc.status === "PENDING" && (
                    <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-semibold text-[#92400E] border border-[#FDE68A]">
                      {doc.statusLabel}
                    </span>
                  )}
                  {doc.status === "PROCESSING" && (
                    <span className="rounded-full bg-[#E1EFFE] px-2 py-0.5 text-[10px] font-semibold text-[#1E429F] border border-[#BFDBFE]">
                      {doc.statusLabel}
                    </span>
                  )}
                  {doc.status === "FAILED" && (
                    <span className="rounded-full bg-[#FDE8E8] px-2 py-0.5 text-[10px] font-semibold text-[#9B1C1C] border border-[#F8B4B4]">
                      {doc.statusLabel}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (~320px) */}
        <div className="w-[320px] flex-shrink-0 space-y-4">
          {/* Card 1: Thông tin tài liệu */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Thông tin tài liệu</h4>

            <div className="space-y-2 text-xs">
              <div>
                <p className="text-slate-400 text-[11px]">Tệp</p>
                <p className="font-bold text-slate-900 truncate">Runbook_ung_cuu_su_co_DDoS.pdf</p>
              </div>

              <div>
                <p className="text-slate-400 text-[11px]">Khóa học</p>
                <p className="font-bold text-slate-900">CS402 - An ninh mạng &amp; Ứng cứu sự cố</p>
              </div>

              <div>
                <p className="text-slate-400 text-[11px]">Mã mời</p>
                <p className="font-mono font-bold text-slate-900">SEC7A2</p>
              </div>

              <div>
                <p className="text-slate-400 text-[11px]">Tải lên</p>
                <p className="font-medium text-slate-700">20/10/2026</p>
              </div>

              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F4EA] px-2.5 py-1 text-[11px] font-semibold text-[#03543F] border border-[#DEF7EC]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Hoàn tất
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Cách AI dùng nguồn */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Cách AI dùng nguồn</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mỗi tình huống AI sinh ra phải trích dẫn đoạn nguồn tương ứng. Giảng viên kiểm tra trích dẫn trước khi phê duyệt case.
            </p>
            <button
              onClick={() => navigate(`/lecturer/courses/${courseId || "default"}/cases`)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:border-[#1E3A8A] hover:bg-blue-50/20 hover:text-[#1E3A8A] transition cursor-pointer"
            >
              <span>✨</span>
              <span>+ AI Draft</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
