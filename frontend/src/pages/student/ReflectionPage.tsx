import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

export function ReflectionPage() {
  const navigate = useNavigate();
  const { caseId, attemptId } = useParams();

  // Mode: form (05.7) or submitted view (05.8)
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSavedDraft, setIsSavedDraft] = useState(false);

  // Modal 05.10: Start new attempt dialog
  const [isNewAttemptModalOpen, setIsNewAttemptModalOpen] = useState(false);

  // Form Fields
  const [keyStep, setKeyStep] = useState(
    "Bước 1: Bật hàng đợi ảo khi lưu lượng đạt 85k req/s. Đây là quyết định then chốt để giảm áp lực lên DB, thay vì chỉ auto-scale và tạo thêm kết nối."
  );
  const [changeIfRedo, setChangeIfRedo] = useState(
    "Tôi sẽ chuẩn bị trước kịch bản Degraded Mode, ngưỡng kích hoạt hàng đợi và thông báo cho khách hàng; phối hợp sớm với CSKH để vỗ về người dùng ví điện tử."
  );
  const [lessonsLearned, setLessonsLearned] = useState(
    "Tính sẵn sàng và tính nhất quán luôn cần được cân nhắc trong hệ thống phân tán. CAP theorem giúp tôi lý giải sự đánh đổi; khi thanh toán quá tải, cần bảo vệ giao dịch trước rồi phục hồi dịch vụ theo từng giai đoạn."
  );

  const handleSaveDraft = () => {
    setIsSavedDraft(true);
    setTimeout(() => setIsSavedDraft(false), 2000);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const handleStartNewAttempt = () => {
    setIsNewAttemptModalOpen(false);
    navigate(`/student/cases/${caseId || "cs301"}/branching-play`);
  };

  return (
    <div className="space-y-6 relative">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 05.7 · BIỂU MẪU SUY NGẪM (KHI CHƯA NỘP)                            */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {!isSubmitted ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/student/cases/${caseId || "cs301"}/attempt/${attemptId || "attempt-1"}/review`)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
              title="Quay lại Journey Review"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Suy ngẫm & đúc kết bài học</h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>CS301 · Journey Review</span>
                <span>&gt;</span>
                <span className="text-slate-800 font-medium">Suy ngẫm</span>
              </div>
            </div>
          </div>

          {/* 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: 3 Reflection Inputs (8 cols) */}
            <div className="lg:col-span-8 space-y-5">
              {/* Field 1: Bước then chốt nhất */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-2">
                <label className="block text-xs font-bold text-slate-900">
                  Bước then chốt nhất <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={keyStep}
                  onChange={(e) => setKeyStep(e.target.value)}
                  placeholder="Nêu bước quyết định bạn cho là then chốt nhất và lý do..."
                  maxLength={1000}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-800 leading-relaxed placeholder:text-slate-400 focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] transition-all resize-none shadow-2xs"
                />
                <div className="text-[11px] text-slate-400 text-right">
                  {keyStep.length} / 1000 ký tự
                </div>
              </div>

              {/* Field 2: Điều bạn sẽ đổi nếu làm lại */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-2">
                <label className="block text-xs font-bold text-slate-900">
                  Điều bạn sẽ đổi nếu làm lại <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={changeIfRedo}
                  onChange={(e) => setChangeIfRedo(e.target.value)}
                  placeholder="Nếu được làm lại, bạn sẽ thay đổi quyết định hoặc cách chuẩn bị nào?"
                  maxLength={1000}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-800 leading-relaxed placeholder:text-slate-400 focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] transition-all resize-none shadow-2xs"
                />
                <div className="text-[11px] text-slate-400 text-right">
                  {changeIfRedo.length} / 1000 ký tự
                </div>
              </div>

              {/* Field 3: Bài học rút ra */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-2">
                <label className="block text-xs font-bold text-slate-900">
                  Bài học rút ra <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={lessonsLearned}
                  onChange={(e) => setLessonsLearned(e.target.value)}
                  placeholder="Liên hệ với kiến thức học phần (ví dụ: CAP theorem, tính sẵn sàng, tính nhất quán)..."
                  maxLength={1000}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-800 leading-relaxed placeholder:text-slate-400 focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] transition-all resize-none shadow-2xs"
                />
                <div className="text-[11px] text-slate-400 text-right">
                  {lessonsLearned.length} / 1000 ký tự
                </div>
              </div>

              {/* Actions Footer */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/student/cases/${caseId || "cs301"}/attempt/${attemptId || "attempt-1"}/review`)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Quay lại Journey Review
                </button>

                <div className="text-[11px] text-slate-500 italic text-center sm:text-left">
                  Phần suy ngẫm không chấm điểm. Sau khi nộp, giảng viên sẽ xem xét và phản hồi.
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    {isSavedDraft ? "Đã lưu nháp ✓" : "Lưu nháp"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-5 py-2 text-xs font-bold text-white bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    Nộp suy ngẫm
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Meta & Progress (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Lượt làm bài Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
                  Lượt làm bài
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-400">Học phần:</span>
                    <span className="font-semibold text-slate-800">Hệ thống phân tán</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-400">Lần làm:</span>
                    <span className="font-bold text-slate-800">#1</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-400">Bước quyết định:</span>
                    <span className="font-semibold text-slate-800">3 bước</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                    <span className="text-slate-500">Trạng thái:</span>
                    <span className="font-bold text-[#1E3A8A]">Chờ suy ngẫm</span>
                  </div>
                </div>
              </div>

              {/* Tiến trình Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
                  Tiến trình
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span className="text-slate-700">Trải nghiệm kịch bản - Hoàn thành</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span className="text-slate-700">Xem lại & giải trình lập luận - Hoàn thành</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#1E3A8A] animate-pulse"></span>
                    <span className="font-bold text-[#1E3A8A]">Phản tư tổng kết - Đang thực hiện</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────────── */
        /* 05.8 · ĐÃ NỘP SUY NGẪM (READ-ONLY DISPLAY)                         */
        /* ─────────────────────────────────────────────────────────────────── */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSubmitted(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
              title="Xem lại form chỉnh sửa"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Suy ngẫm & đúc kết bài học</h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>CS301 · Journey Review</span>
                <span>&gt;</span>
                <span className="text-slate-800 font-medium">Đã nộp</span>
              </div>
            </div>
          </div>

          {/* 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Profile & Status (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Profile Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
                <div className="bg-[#1E3A8A] p-6 text-white text-center relative">
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F4EA] text-emerald-800 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Đã nộp
                  </span>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#1E3A8A] text-xl font-bold shadow-md mt-1 ring-4 ring-white/20">
                    LK
                  </div>
                  <h2 className="mt-2 text-base font-bold text-white">Lê Minh Khôi</h2>
                  <p className="text-xs text-blue-100 font-medium">
                    Hệ thống phân tán · Lần làm #1
                  </p>
                </div>

                <div className="p-5 space-y-3 text-xs text-slate-600 border-t border-slate-100">
                  <div className="flex items-start gap-2.5">
                    <span className="text-slate-400">📖</span>
                    <div>
                      <div className="text-[11px] text-slate-400">Học phần</div>
                      <div className="font-semibold text-slate-800">Hệ thống phân tán</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#1E3A8A]">🌿</span>
                    <div>
                      <div className="text-[11px] text-slate-400">Lần làm</div>
                      <div className="font-semibold text-slate-800">
                        #1 - Khủng hoảng sập hệ thống thanh toán Black Friday
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-amber-500">⏱</span>
                    <div>
                      <div className="text-[11px] text-slate-400">Phản hồi</div>
                      <div className="font-semibold text-slate-800">Đang chờ giảng viên</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Box */}
              <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-xs space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-lg">
                    ✓
                  </div>
                  <h3 className="text-xs font-bold text-emerald-900 leading-snug">
                    Bạn đã hoàn thành trọn vẹn lần làm bài #1!
                  </h3>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Toàn bộ đường đi, bản lập luận và phần suy ngẫm của bạn đã được ghi nhận. Giảng viên phụ trách sẽ xem xét và phản hồi sớm.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => navigate(`/student/cases/${caseId || "cs301"}/attempt/${attemptId || "attempt-1"}/review`)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
                  >
                    <span>👁</span>
                    <span>Xem lại Journey Review</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNewAttemptModalOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    <span>↺</span>
                    <span>Bắt đầu lượt làm mới</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Submitted Reflections & Feedback note (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Submitted Content List */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                  Phần suy ngẫm đã nộp
                </h3>

                {/* Card 1 */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-[#1E3A8A]">
                      ⚑
                    </span>
                    <span>Bước then chốt nhất</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed pl-8">
                    {keyStep}
                  </p>
                </div>

                {/* Card 2 */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                      ↺
                    </span>
                    <span>Điều bạn sẽ đổi nếu làm lại</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed pl-8">
                    {changeIfRedo}
                  </p>
                </div>

                {/* Card 3 */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                      📖
                    </span>
                    <span>Bài học rút ra</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed pl-8">
                    {lessonsLearned}
                  </p>
                </div>
              </div>

              {/* Bottom Split Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left: Phản hồi giảng viên */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-900">Phản hồi của giảng viên</h4>
                  <div className="p-6 rounded-xl bg-slate-50/80 border border-slate-100 text-center space-y-2">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-200/70 text-slate-500">
                      ⏱
                    </div>
                    <div className="text-xs font-bold text-slate-800">Đang chờ giảng viên</div>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                      Khi giảng viên gửi nhận xét, bạn sẽ nhận được thông báo.
                    </p>
                  </div>
                </div>

                {/* Right: Không xếp hạng điểm số */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-900">Không xếp hạng điểm số</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Mỗi lần thử nghiệm là một cơ hội khám phá. Phần suy ngẫm không chấm điểm; giảng viên phản hồi bằng nhận xét định tính.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 05.10 · MODAL BẮT ĐẦU LƯỢT LÀM MỚI                                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {isNewAttemptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-scale-up">
            <h3 className="text-base font-bold text-slate-900">Bắt đầu lượt làm mới?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Lượt làm mới bắt đầu lại từ tình huống đầu tiên để bạn thử một hướng đi khác. Lượt trước được giữ nguyên trong lịch sử, kèm lập luận và phần suy ngẫm của bạn.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
              <span className="font-bold text-slate-800 block mb-0.5">Lượt 1:</span>
              Đã hoàn thành · 3 bước quyết định · Đã nộp suy ngẫm
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNewAttemptModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleStartNewAttempt}
                className="px-5 py-2 text-xs font-bold text-white bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Bắt đầu lượt 2
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
