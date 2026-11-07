import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export function AiStudioPage() {
  const navigate = useNavigate();

  // Wizard Step: 1, 2, or 3
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [course, setCourse] = useState("An ninh mạng & Ứng cứu sự cố");
  const [learningMode, setLearningMode] = useState<"BRANCHING" | "REVIEW" | "MANUAL">("BRANCHING");

  const [topic, setTopic] = useState(
    "Khủng hoảng sập mạng lưới trung tâm dữ liệu và tấn công DDoS nhằm vào cổng xác thực sinh trắc học ngân hàng"
  );

  // Selected Documents
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  const AVAILABLE_DOCS = [
    { id: "doc-1", name: "Runbook_ung_cuu_su_co_DDoS.pdf" },
    { id: "doc-2", name: "Slide_Tuan_7_An_ninh_mang.pdf" },
    { id: "doc-3", name: "Bao_cao_su_co_ngan_hang.docx" },
  ];

  const toggleDoc = (id: string) => {
    if (selectedDocs.includes(id)) {
      setSelectedDocs(selectedDocs.filter((d) => d !== id));
    } else {
      setSelectedDocs([...selectedDocs, id]);
    }
  };

  const handleNextStep = () => {
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    else {
      // Step 3 -> generate and go to review editor
      navigate("/lecturer/cases/case-02/review");
    }
  };

  const handlePrevStep = () => {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
    else navigate("/lecturer/cases");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={handlePrevStep}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
          title="Quay lại"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">AI Studio</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              HOLD · OPD-006
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Case Study</span>
            <span>&gt;</span>
            <span className="text-slate-800 font-medium">
              {step === 1
                ? "Bước 1/3 · Khóa học & chế độ học"
                : step === 2
                ? "Bước 2/3 · Chủ đề & tài liệu nguồn"
                : "Bước 3/3 · Xem lại & sinh bản nháp"}
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT COLUMN: WIZARD STEPS CONTENT (8 cols) ───────────────── */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: KHÓA HỌC & CHẾ ĐỘ HỌC */}
          {step === 1 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">Khóa học & chế độ học</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Khởi tạo kịch bản tình huống học thuật đa nhánh từ tài liệu môn học chỉ qua 3 bước.
                </p>
              </div>

              {/* Course Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-900">
                  Khóa học <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 font-medium focus:border-[#1E3A8A] focus:outline-none shadow-2xs cursor-pointer"
                  >
                    <option value="An ninh mạng & Ứng cứu sự cố">
                      📖 An ninh mạng & Ứng cứu sự cố
                    </option>
                    <option value="Kỹ thuật phần mềm & Kiến trúc hệ thống">
                      📖 Kỹ thuật phần mềm & Kiến trúc hệ thống
                    </option>
                    <option value="Quản trị hệ thống thông tin">
                      📖 Quản trị hệ thống thông tin
                    </option>
                  </select>
                </div>
              </div>

              {/* Mode Selection */}
              <div className="space-y-2.5 pt-2">
                <label className="block text-xs font-bold text-slate-900">
                  Chọn chế độ học tập <span className="text-rose-500">*</span>
                </label>

                {/* Option A: Branching Study */}
                <div
                  onClick={() => setLearningMode("BRANCHING")}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3.5 ${
                    learningMode === "BRANCHING"
                      ? "border-[#1E3A8A] bg-blue-50/50 shadow-2xs"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    learningMode === "BRANCHING" ? "bg-[#1E3A8A] text-white" : "bg-slate-100 text-slate-700"
                  }`}>
                    A
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-snug">
                      Branching Study · Cây phân nhánh — Sinh viên đưa ra lựa chọn liên tục, hậu quả được giấu kín cho tới kết cục. Khuyến nghị cho kịch bản sự cố.
                    </h3>
                  </div>
                </div>

                {/* Option B: Review Study */}
                <div
                  onClick={() => setLearningMode("REVIEW")}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3.5 ${
                    learningMode === "REVIEW"
                      ? "border-[#1E3A8A] bg-blue-50/50 shadow-2xs"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    learningMode === "REVIEW" ? "bg-[#1E3A8A] text-white" : "bg-slate-100 text-slate-700"
                  }`}>
                    B
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-snug">
                      Review Study · Phân tích chuyên sâu — Bản đơn giản: bối cảnh, số liệu và vấn đề cần phân tích. Không cần cây phân nhánh.
                    </h3>
                  </div>
                </div>

                {/* Option C: Manual */}
                <div
                  onClick={() => setLearningMode("MANUAL")}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3.5 ${
                    learningMode === "MANUAL"
                      ? "border-[#1E3A8A] bg-blue-50/50 shadow-2xs"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    learningMode === "MANUAL" ? "bg-[#1E3A8A] text-white" : "bg-slate-100 text-slate-700"
                  }`}>
                    C
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-snug">
                      Tạo thủ công từ đầu — Không dùng AI; giảng viên tự soạn toàn bộ tình huống.
                    </h3>
                  </div>
                </div>
              </div>

              {/* Bottom Step 1 Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate("/lecturer/cases")}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2 text-xs font-bold text-white bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  Tiếp tục
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CHỦ ĐỀ & TÀI LIỆU NGUỒN */}
          {step === 2 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">Chủ đề & tài liệu nguồn</h2>
              </div>

              {/* Topic Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-900">
                  Chủ đề tình huống <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Nhập chủ đề hoặc bối cảnh tình huống muốn AI sinh..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-800 leading-relaxed placeholder:text-slate-400 focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] transition-all resize-y shadow-2xs"
                />
              </div>

              {/* Documents Selection */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900">
                    Chọn tài liệu nguồn để AI trích xuất bối cảnh
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {selectedDocs.length} tài liệu đã chọn
                  </span>
                </div>

                <div className="space-y-2">
                  {AVAILABLE_DOCS.map((doc) => {
                    const isChecked = selectedDocs.includes(doc.id);
                    return (
                      <div
                        key={doc.id}
                        onClick={() => toggleDoc(doc.id)}
                        className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                          isChecked
                            ? "border-[#1E3A8A] bg-blue-50/50 text-[#1E3A8A] font-semibold"
                            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-[#1E3A8A] cursor-pointer"
                          />
                          <span className="text-slate-400">📄</span>
                          <span className="truncate">{doc.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pedagogical Note (Rule 6b) */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-relaxed mt-2">
                  <span>ℹ</span>
                  <span>Lưu ý: Không cố định số điểm quyết định; AI sẽ phác thảo tự nhiên theo diễn biến tình huống.</span>
                </div>
              </div>

              {/* Bottom Step 2 Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2 text-xs font-bold text-white bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  Tiếp tục
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: XEM LẠI & SINH BẢN NHÁP */}
          {step === 3 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
              {/* Parameters Summary Card */}
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                  Xác nhận thông số khởi tạo kịch bản
                </h2>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Khóa học:</span>
                    <span className="font-semibold text-slate-800">{course}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Chế độ học:</span>
                    <span className="font-semibold text-slate-800">
                      {learningMode === "BRANCHING" ? "Branching Study" : learningMode === "REVIEW" ? "Review Study" : "Thủ công"}
                    </span>
                  </div>
                  <div className="py-1 border-b border-slate-50 space-y-1">
                    <span className="text-slate-400 block">Chủ đề:</span>
                    <p className="font-semibold text-slate-800 leading-relaxed">{topic}</p>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Tài liệu RAG đính kèm:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedDocs.length > 0 ? `${selectedDocs.length} tài liệu đã chọn` : "Không chọn (sử dụng tri thức tổng quát)"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">Độ khó:</span>
                    <span className="font-bold text-[#1E3A8A]">Nâng cao</span>
                  </div>
                </div>
              </div>

              {/* What happens after clicking generate */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-500">
                  Sau khi bấm tạo
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1E3A8A] flex items-center justify-center font-bold text-[10px]">1</span>
                    <span className="text-slate-700">AI truy xuất đoạn trích liên quan (nếu có tài liệu nguồn)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1E3A8A] flex items-center justify-center font-bold text-[10px]">2</span>
                    <span className="text-slate-700">Tổng hợp tình huống và các điểm quyết định</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1E3A8A] flex items-center justify-center font-bold text-[10px]">3</span>
                    <span className="text-slate-700 font-semibold">Kiểm tra cấu trúc cây: không vòng lặp, không tình huống mồ côi</span>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-[10px]">4</span>
                    <span className="text-[#1E3A8A] font-bold">Mở trình chỉnh sửa ở trạng thái Bản nháp để rà soát</span>
                  </div>
                </div>
              </div>

              {/* Bottom Step 3 Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  Sinh bản nháp
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: WIZARD STEPS PROGRESS & CONFIG PREVIEW (4 cols) ─ */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Các bước khởi tạo */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
              Các bước khởi tạo
            </h3>
            <div className="space-y-2 text-xs">
              {/* Step 1 */}
              <div className={`p-3 rounded-xl flex items-center gap-3 ${
                step > 1 ? "bg-slate-50 text-slate-700" : "bg-blue-50 text-[#1E3A8A] font-bold border border-blue-100"
              }`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step > 1 ? "bg-emerald-500 text-white" : "bg-[#1E3A8A] text-white"
                }`}>
                  {step > 1 ? "✓" : "1"}
                </span>
                <span>Khóa học & chế độ học</span>
              </div>

              {/* Step 2 */}
              <div className={`p-3 rounded-xl flex items-center gap-3 ${
                step === 2
                  ? "bg-blue-50 text-[#1E3A8A] font-bold border border-blue-100"
                  : step > 2
                  ? "bg-slate-50 text-slate-700"
                  : "bg-slate-50/50 text-slate-400"
              }`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step > 2 ? "bg-emerald-500 text-white" : step === 2 ? "bg-[#1E3A8A] text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  {step > 2 ? "✓" : "2"}
                </span>
                <span>Chủ đề & tài liệu nguồn</span>
              </div>

              {/* Step 3 */}
              <div className={`p-3 rounded-xl flex items-center gap-3 ${
                step === 3
                  ? "bg-blue-50 text-[#1E3A8A] font-bold border border-blue-100"
                  : "bg-slate-50/50 text-slate-400"
              }`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 3 ? "bg-[#1E3A8A] text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  3
                </span>
                <span>Xem lại & sinh bản nháp</span>
              </div>
            </div>
          </div>

          {/* Card 2: Cấu hình sinh case */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
              Cấu hình sinh case
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block">Khóa học</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{course}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Chế độ học</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {learningMode === "BRANCHING" ? "Branching Study" : learningMode === "REVIEW" ? "Review Study" : "Thủ công"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Chủ đề</span>
                <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                  {step >= 2 ? topic : "Chưa nhập"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Tài liệu nguồn</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {selectedDocs.length > 0 ? `${selectedDocs.length} tài liệu đã chọn` : "Chưa chọn"}
                </span>
              </div>

              {/* AI Draft Governance Notice */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-slate-700 leading-relaxed pt-2">
                <span className="font-bold text-[#1E3A8A] block mb-0.5">● AI Draft</span>
                Bản nháp AI luôn ở trạng thái Bản nháp và cần giảng viên rà soát, phê duyệt trước khi xuất bản.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

