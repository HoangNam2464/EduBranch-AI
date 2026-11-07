import { useState } from "react";

export function AdminAiConfigPage() {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash");
  const [embeddingModel] = useState("text-embedding-004");
  const [challengeRounds] = useState(2);
  const [temperature, setTemperature] = useState(0.3);
  const [savedSuccess, setSavedSuccess] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  }

  return (
    <div className="space-y-6">
      {savedSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Đã lưu cấu hình dịch vụ AI thành công. Cổng AI Gateway đã được cập nhật.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Configuration & Call Logs */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Card 1: Tham số mô hình AI toàn hệ thống */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A]">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Tham số mô hình AI toàn hệ thống</h3>
                    <p className="text-[11px] text-slate-400">
                      Điều phối mô hình LLM, embedding và tham số tạo kịch bản
                    </p>
                  </div>
                </div>

                {/* Service toggle */}
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    aiEnabled ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                  }`}>
                    {aiEnabled ? "Đang BẬT · Hoạt động" : "Đã TẮT"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAiEnabled(!aiEnabled)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      aiEnabled ? "bg-[#1E3A8A]" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        aiEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Field 1: Model */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mô hình AI tạo sinh (LLM) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
                  >
                    <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Khuyến nghị)</option>
                    <option value="gemini-2.0-flash">Google Gemini 2.0 Flash</option>
                    <option value="gpt-4o-mini">OpenAI GPT-4o-mini</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Trừu tượng hóa qua Provider Factory (fastapi-service)
                  </p>
                </div>

                {/* Field 2: Embedding */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mô hình Embedding (Vector)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={embeddingModel}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 outline-none cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    pgvector 768 chiều · Cố định đồng bộ DB
                  </p>
                </div>

                {/* Field 3: Max rounds */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số vòng câu hỏi thách thức (Rule 6)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled
                      value={`${challengeRounds} vòng · Cố định theo chuẩn`}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 outline-none cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Tối đa 2 vòng câu hỏi phản biện Socratic theo quy định đồ án
                  </p>
                </div>

                {/* Field 4: Temperature */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Nhiệt độ (Temperature)
                    </label>
                    <span className="text-xs font-bold text-[#1E3A8A]">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-[#1E3A8A] cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                    <span>0.0 (Chính xác cao)</span>
                    <span>1.0 (Sáng tạo)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedModel("gemini-1.5-flash");
                    setTemperature(0.3);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Khôi phục mặc định
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1E3A8A] text-white text-xs font-semibold hover:bg-[#1E3A8A]/90 shadow-xs transition cursor-pointer"
                >
                  Lưu cấu hình
                </button>
              </div>
            </div>
          </form>

          {/* Card 2: Chi phí & lưu lượng */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 block">Lượt gọi AI tháng 10</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">6</p>
              <p className="text-[10px] text-slate-400 mt-1">
                Sinh Case Draft: 2 · Thách thức SV: 4
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 block">Tổng tokens đã dùng</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">14,790</p>
              <p className="text-[10px] text-slate-400 mt-1">
                Prompt: 11,240 · Completion: 3,550
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 block">Chi phí ước tính</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">$0.0022</p>
              <p className="text-[10px] text-slate-400 mt-1">
                Trên ngân sách $150.00/tháng
              </p>
            </div>
          </div>

          {/* Card 3: Nhật ký các lượt gọi AI gần đây */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900">Nhật ký các lượt gọi AI gần đây</h3>
              <span className="text-[11px] text-slate-400">6 bản ghi mới nhất</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-wider">
                    <th className="pb-2 font-semibold">Thời gian</th>
                    <th className="pb-2 font-semibold">Người dùng</th>
                    <th className="pb-2 font-semibold">Tác vụ</th>
                    <th className="pb-2 font-semibold">Mô hình</th>
                    <th className="pb-2 font-semibold text-right">Tokens</th>
                    <th className="pb-2 font-semibold text-right">Chi phí</th>
                    <th className="pb-2 font-semibold text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {/* Row 1 */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 text-slate-500 text-[11px]">23/10 · 09:42</td>
                    <td className="py-2.5 font-medium">Nguyễn Minh Anh</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1E3A8A] text-[10px] font-semibold">
                        Thách thức SV (Vòng 1)
                      </span>
                    </td>
                    <td className="py-2.5 text-[11px] font-mono text-slate-500">gemini-1.5-flash</td>
                    <td className="py-2.5 text-right font-medium">1,840</td>
                    <td className="py-2.5 text-right text-emerald-600 font-medium">$0.0003</td>
                    <td className="py-2.5 text-center">
                      <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-bold">
                        Thành công
                      </span>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 text-slate-500 text-[11px]">23/10 · 09:15</td>
                    <td className="py-2.5 font-medium">Trần Quốc Bảo</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1E3A8A] text-[10px] font-semibold">
                        Thách thức SV (Vòng 1)
                      </span>
                    </td>
                    <td className="py-2.5 text-[11px] font-mono text-slate-500">gemini-1.5-flash</td>
                    <td className="py-2.5 text-right font-medium">1,920</td>
                    <td className="py-2.5 text-right text-emerald-600 font-medium">$0.0003</td>
                    <td className="py-2.5 text-center">
                      <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-bold">
                        Thành công
                      </span>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 text-slate-500 text-[11px]">22/10 · 20:30</td>
                    <td className="py-2.5 font-medium">Lê Thu Hà</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-semibold">
                        Thách thức SV (Vòng 2)
                      </span>
                    </td>
                    <td className="py-2.5 text-[11px] font-mono text-slate-500">gemini-1.5-flash</td>
                    <td className="py-2.5 text-right font-medium">2,150</td>
                    <td className="py-2.5 text-right text-emerald-600 font-medium">$0.0003</td>
                    <td className="py-2.5 text-center">
                      <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-bold">
                        Thành công
                      </span>
                    </td>
                  </tr>

                  {/* Row 4 */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 text-slate-500 text-[11px]">22/10 · 18:05</td>
                    <td className="py-2.5 font-medium">Phạm Gia Huy</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1E3A8A] text-[10px] font-semibold">
                        Thách thức SV (Vòng 1)
                      </span>
                    </td>
                    <td className="py-2.5 text-[11px] font-mono text-slate-500">gemini-1.5-flash</td>
                    <td className="py-2.5 text-right font-medium">1,780</td>
                    <td className="py-2.5 text-right text-emerald-600 font-medium">$0.0003</td>
                    <td className="py-2.5 text-center">
                      <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-bold">
                        Thành công
                      </span>
                    </td>
                  </tr>

                  {/* Row 5 */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 text-slate-500 text-[11px]">21/10 · 15:10</td>
                    <td className="py-2.5 font-medium">TS. Nguyễn Văn An</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold">
                        Sinh Case Draft
                      </span>
                    </td>
                    <td className="py-2.5 text-[11px] font-mono text-slate-500">gemini-1.5-flash</td>
                    <td className="py-2.5 text-right font-medium">3,850</td>
                    <td className="py-2.5 text-right text-emerald-600 font-medium">$0.0006</td>
                    <td className="py-2.5 text-center">
                      <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-bold">
                        Thành công
                      </span>
                    </td>
                  </tr>

                  {/* Row 6 */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 text-slate-500 text-[11px]">20/10 · 11:20</td>
                    <td className="py-2.5 font-medium">TS. Nguyễn Văn An</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold">
                        Sinh Case Draft
                      </span>
                    </td>
                    <td className="py-2.5 text-[11px] font-mono text-slate-500">gemini-1.5-flash</td>
                    <td className="py-2.5 text-right font-medium">3,250</td>
                    <td className="py-2.5 text-right text-emerald-600 font-medium">$0.0005</td>
                    <td className="py-2.5 text-center">
                      <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-bold">
                        Thành công
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Budget & Governance */}
        <div className="space-y-6">
          {/* Card: Ngân sách tháng */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900">Ngân sách & Hạn mức tháng</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                An toàn (0.001%)
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Đã sử dụng</span>
                <span className="font-bold text-slate-800">$0.0022 / $150.00</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#1E3A8A] h-full rounded-full" style={{ width: "2%" }}></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                Hạn mức $150/tháng được cấp bởi Khoa CNTT & QTKD - Đại học Duy Tân. Cảnh báo tự động gửi email tới ban quản trị khi đạt 80% hạn mức ($120.00).
              </p>
            </div>
          </div>

          {/* Card: AI Governance Rules */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Quy tắc AI Governance (Rule 6)</h3>
                <p className="text-[11px] text-slate-400">Ràng buộc hệ thống bắt buộc</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <span className="text-[#1E3A8A]">1.</span> Dữ liệu RAG là UNTRUSTED
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Mọi chunk tài liệu từ pgvector luôn được bọc trong thẻ <code className="text-[#1E3A8A] font-mono">&lt;sources&gt;</code> để chống prompt injection.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <span className="text-[#1E3A8A]">2.</span> AI tuyệt đối KHÔNG chấm điểm
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Challenge Support chỉ phản biện khơi gợi tư duy Socratic. Quyền đánh giá học tập 100% thuộc về Giảng viên.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <span className="text-[#1E3A8A]">3.</span> Tối đa 2 vòng phản biện
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Sau vòng 2, phiên phản biện tự động kết thúc và chuyển sinh viên sang bước Viết suy ngẫm (Reflection).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <span className="text-[#1E3A8A]">4.</span> Không can thiệp Case đã duyệt
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Cây quyết định và kịch bản đã chuyển trạng thái APPROVED là bất biến, AI không được tự ý sửa đổi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

