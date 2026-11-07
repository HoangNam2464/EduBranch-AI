import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

export function StudentSubmissionFeedbackPage() {
  const navigate = useNavigate();
  const { submissionId } = useParams();

  // Feedback form state
  const [feedbackText, setFeedbackText] = useState(
    "Lập luận của bạn rất tốt khi phân tích sâu vào nút thắt cơ sở dữ liệu và bảo toàn tính toàn vẹn dữ liệu thay vì vội vàng mở rộng máy chủ. Ở vòng phản biện 2, giải pháp áp dụng Idempotency Key rất chính xác trong thực tế. Đề xuất bạn tìm hiểu thêm về kiến trúc Event-Driven để xử lý bất đồng bộ khi tải đạt ngưỡng kỷ lục."
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSaveDraft = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleSubmitFeedback = () => {
    setIsSubmitted(true);
    setTimeout(() => {
      navigate("/lecturer/feedback");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header / Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/lecturer/feedback")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
            title="Quay lại hàng đợi phản hồi"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Chi tiết phản hồi lập luận sinh viên</h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <Link to="/lecturer/feedback" className="hover:text-[#1E3A8A] transition-colors">
                Phản hồi sinh viên
              </Link>
              <span>&gt;</span>
              <span className="text-slate-800 font-medium">Chi tiết bài làm</span>
            </div>
          </div>
        </div>

        {/* Status notification toast when saved/submitted */}
        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 animate-fade-in">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              Đã lưu nháp phản hồi
            </span>
          )}
          {isSubmitted && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#1E3A8A]/10 text-[#1E3A8A] border border-[#1E3A8A]/30">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              Đã gửi phản hồi thành công! Đang chuyển hướng...
            </span>
          )}
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT COLUMN (Profile & Reflection) ───────────────────────── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Student Profile Banner */}
          <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
            {/* Navy Card Header */}
            <div className="bg-[#1E3A8A] p-6 text-white text-center relative">
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-amber-800 border border-amber-300 shadow-xs">
                  Chờ phản hồi
                </span>
              </div>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#1E3A8A] text-2xl font-bold shadow-md mt-2 ring-4 ring-white/20">
                NA
              </div>
              <h2 className="mt-3 text-lg font-bold text-white">Nguyễn Minh Anh</h2>
              <p className="text-xs text-blue-100 font-medium">MSSV: 22110001 · Lần làm #2</p>
            </div>

            {/* Student Meta Details */}
            <div className="p-5 space-y-3.5 text-xs text-slate-600 border-t border-slate-100">
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Môn học</div>
                  <div className="font-semibold text-slate-800 mt-0.5 leading-snug">
                    Kỹ thuật phần mềm & Kiến trúc hệ thống
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="6" y1="3" x2="6" y2="15" />
                    <circle cx="18" cy="6" r="3" />
                    <circle cx="6" cy="18" r="3" />
                    <path d="M18 9a9 9 0 0 1-9 9" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Case Study</div>
                  <div className="font-semibold text-slate-800 mt-0.5 leading-snug">
                    Khủng hoảng quá tải hệ thống đăng ký học phần
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Thời gian nộp</div>
                  <div className="font-semibold text-slate-800 mt-0.5">23/10/2026 - 09:42</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Student Reflection */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Suy ngẫm của sinh viên</span>
              <span className="text-[11px] font-normal text-slate-400">Giai đoạn Review</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#1E3A8A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A8A]"></span>
                  Bước then chốt
                </div>
                <p className="text-slate-700 leading-relaxed italic">
                  &ldquo;Nhận diện nút thắt cơ sở dữ liệu và chọn điều tiết lưu lượng thay vì tăng tài nguyên một cách vội vàng.&rdquo;
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-amber-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                  Điều muốn đổi nếu làm lại
                </div>
                <p className="text-slate-700 leading-relaxed italic">
                  &ldquo;Em sẽ chuẩn bị cơ chế dự phòng hàng đợi sớm hơn và thông báo thời gian chờ rõ ràng ngay khi phát hiện quá tải.&rdquo;
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Bài học rút ra
                </div>
                <p className="text-slate-700 leading-relaxed italic">
                  &ldquo;Cần quan sát chỉ số trước khi quyết định; bảo vệ tính nhất quán dữ liệu và trải nghiệm người dùng phải đi cùng nhau. Mỗi phương án đều có sự đánh đổi.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (Decision Journey, Reasoning & Lecturer Feedback) ── */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top Section: Student Real Decision Journey */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Đường đi thực tế của sinh viên trong lần làm này
              </h3>
              <span className="text-xs text-slate-400 font-medium">3 bước hoàn tất</span>
            </div>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1E3A8A] text-white font-bold text-sm shadow-xs">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900">
                      Hệ thống đăng ký học phần quá tải
                    </h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF3C7] text-amber-800 border border-amber-200 shadow-2xs">
                      Quyết định then chốt
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 font-medium">
                    Phương án A — Triển khai hàng đợi ảo để điều tiết lưu lượng
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-[#1E3A8A] font-bold text-sm">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900">
                      Kiểm soát giao dịch và khôi phục từng phần
                    </h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E1EFFE] text-[#1E3A8A] border border-blue-200 shadow-2xs">
                      AI 2/2 vòng
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 font-medium">
                    Áp dụng Idempotency Key và tăng dần lưu lượng theo sức tải thực tế
                  </p>
                </div>
              </div>

              {/* Step 3 (Outcome) */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-700 font-bold text-sm">
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900">
                      Kết quả — Hệ thống phục hồi, đăng ký nhất quán
                    </h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      Kết cục
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    Kết cục: Hệ thống tiếp tục phục vụ theo hàng đợi, không phát sinh giao dịch đăng ký trùng.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Split Section: Reasoning/AI Challenge vs Lecturer Feedback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Card: Student Reasoning & AI Challenge History */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  Bản lập luận & AI Challenge (2/2 vòng)
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Đã hoàn tất 2 vòng
                </span>
              </div>

              {/* Original Reasoning */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Bản lập luận của sinh viên
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                  Em chọn hàng đợi ảo vì nút thắt nằm ở các giao dịch ghi của cơ sở dữ liệu, không phải số lượng máy chủ ứng dụng. Auto-scale DB ngay lúc này có thể làm tăng số kết nối và gây thêm tranh chấp dữ liệu.
                </div>
              </div>

              {/* Round 1 */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1E3A8A]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    Vòng 1 - Hỏi (AI Socratic)
                  </div>
                  <p className="text-xs text-slate-700 leading-snug">
                    Nếu hệ thống hàng đợi ảo gặp sự cố, bạn sẽ làm gì để sinh viên không mất lượt đăng ký và hệ thống không bị quá tải trở lại?
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-600">
                    Vòng 1 - Đáp (Sinh viên)
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Em lưu trạng thái lượt chờ bằng token có thời hạn và sao chép dữ liệu hàng đợi. Khi hàng đợi gặp lỗi, hệ thống giới hạn tốc độ truy cập, hiển thị thông báo minh bạch.
                  </p>
                </div>
              </div>

              {/* Round 2 */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1E3A8A]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /></svg>
                    Vòng 2 - Hỏi (AI Socratic)
                  </div>
                  <p className="text-xs text-slate-700 leading-snug">
                    Một sinh viên gửi lại yêu cầu do chờ quá lâu. Làm thế nào để tránh ghi danh trùng mà vẫn bảo đảm tính công bằng?
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-600">
                    Vòng 2 - Đáp (Sinh viên)
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Mỗi thao tác đăng ký sử dụng Idempotency Key gắn với sinh viên và học phần. Yêu cầu gửi lại sẽ trả về kết quả trước đó, không tạo giao dịch mới.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Card: Lecturer Feedback & AI Hint Box */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                Nhận xét & phản hồi chuyên môn
              </h3>

              {/* AI Analysis Suggestion Box (Exclusive for Lecturer) */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1E3A8A]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#1E3A8A] text-white text-[11px]">
                    ✨
                  </span>
                  <span>Gợi ý phân tích từ AI — Dành riêng cho giảng viên tham khảo</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Lập luận bám sát số liệu tải và chỉ ra đúng nút thắt ghi dữ liệu. Có thể hỏi thêm về ngưỡng kích hoạt hàng đợi và cách đo tỷ lệ rời hàng đợi.
                </p>
              </div>

              {/* Lecturer Qualitative Feedback Textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Nhận xét của giảng viên <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={8}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Nhập nhận xét chuyên môn, định hướng tư duy và gợi ý mở rộng cho sinh viên..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-800 leading-relaxed placeholder:text-slate-400 focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] transition-all resize-y"
                />
              </div>

              {/* Academic Governance Note (Rule 6) */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>Nhận xét định tính, không chấm điểm học thuật</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  Lưu nháp
                </button>
                <button
                  type="button"
                  onClick={handleSubmitFeedback}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 rounded-xl transition-colors shadow-sm"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  Gửi phản hồi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

