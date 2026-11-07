import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

export function ReviewStudyPage() {
  const navigate = useNavigate();
  const { caseId } = useParams();

  // Form Fields
  const [solution, setSolution] = useState(
    "Tôi đề xuất dành 60 triệu cho hoạt động Campus, 36 triệu cho Meta Ads và 24 triệu cho TikTok retargeting. Tuần đầu triển khai tại các trường đã có cộng đồng người dùng, đồng thời đơn giản hóa hướng dẫn KYC và giao dịch đầu tiên. Nội dung quảng cáo tập trung vào tình huống thanh toán thật thay vì chỉ khuyến khích đăng ký.\n\nCuối tuần đầu, theo dõi chi phí trên mỗi người dùng có giao dịch đầu tiên theo từng kênh, tỷ lệ hoàn tất KYC và tỷ lệ kích hoạt. Tuần hai chỉ mở rộng nhóm có hiệu quả tốt, kiểm tra trùng lặp người dùng và điều chỉnh thông điệp ở các bước rơi rụng."
  );
  const [reasoning, setReasoning] = useState(
    "Chi phí cho một lượt kích hoạt hiện tại là 100.000 VNĐ ở Campus, khoảng 166.667 VNĐ ở Meta và 333.333 VNĐ ở TikTok. Campus có tỷ lệ kích hoạt 50%, cao hơn Meta 30% và TikTok 15%, nên tôi ưu tiên kênh này nhưng không giả định hiệu quả sẽ giữ nguyên khi mở rộng. Với ngân sách 120 triệu, mục tiêu 1.500 người dùng đòi hỏi chi phí bình quân 80.000 VNĐ; vì vậy chỉ chuyển ngân sách là chưa đủ."
  );

  const [isSaved, setIsSaved] = useState(false);

  const handleSaveDraft = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!solution.trim() || !reasoning.trim()) return;
    navigate(`/student/cases/${caseId || "cs301"}/review-study/sub-novapay/feedback`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/student")}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
          title="Quay lại khóa học"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Tối ưu chiến dịch ra mắt ví điện tử NovaPay
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <Link to="/student" className="hover:text-[#1E3A8A] transition-colors">
              CS301
            </Link>
            <span>&gt;</span>
            <span className="text-slate-800 font-medium">Review Study</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Context, Problem & Form Fields (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Bối cảnh tình huống & Dữ liệu đính kèm */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Bối cảnh tình huống
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed">
              NovaPay chuẩn bị ra mắt ví điện tử cho sinh viên tại các thành phố lớn. Sau 4 tuần thử nghiệm truyền thông, lượt tiếp cận tăng nhưng tỷ lệ kích hoạt tài khoản vẫn thấp. Nhóm marketing cần phân bổ lại ngân sách cho 2 tuần tiếp theo để tăng số người dùng thực sự hoàn tất giao dịch đầu tiên.
            </p>

            {/* Dữ liệu thực tế đính kèm */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-700 font-mono">
              <div className="font-bold text-slate-900 font-sans text-xs">
                Số liệu & dữ liệu thực tế đính kèm:
              </div>
              <div className="space-y-1 text-[11px] leading-relaxed">
                <div>• Ngân sách thử nghiệm: 300 triệu VNĐ / 4 tuần</div>
                <div className="pl-3 text-slate-600">TikTok Ads: 150 triệu - 3.000 đăng ký - 450 kích hoạt</div>
                <div className="pl-3 text-slate-600">Meta Ads: 90 triệu - 1.800 đăng ký - 540 kích hoạt</div>
                <div className="pl-3 text-slate-600">Campus: 60 triệu - 1.200 đăng ký - 600 kích hoạt</div>
                <div className="font-semibold text-slate-900 pt-1">• Ngân sách còn lại: 120 triệu VNĐ / 2 tuần</div>
                <div className="font-semibold text-[#1E3A8A]">• Mục tiêu: thêm 1.500 người dùng có giao dịch đầu tiên</div>
              </div>
            </div>

            {/* Vấn đề cần giải quyết */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 space-y-1.5">
              <div className="text-xs font-bold text-[#1E3A8A]">
                Vấn đề cần giải quyết
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Đề xuất kế hoạch phân bổ 120 triệu VNĐ trong 2 tuần để cải thiện tỷ lệ kích hoạt, hướng tới 1.500 người dùng có giao dịch đầu tiên. Cần nêu rõ hành động theo kênh, cách đo lường và rủi ro khi mở rộng chiến dịch.
              </p>
            </div>
          </div>

          {/* Card 2: Phương án giải pháp */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-slate-900">
              Phương án giải pháp <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={6}
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="Trình bày kế hoạch phân bổ ngân sách theo kênh, cách đo lường và rủi ro..."
              maxLength={3000}
              className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-800 leading-relaxed placeholder:text-slate-400 focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] transition-all resize-y shadow-2xs"
            />
            <div className="text-[11px] text-slate-400 text-right">
              {solution.length} / 3000 ký tự
            </div>
          </div>

          {/* Card 3: Lập luận căn cứ dựa trên số liệu */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-slate-900">
              Lập luận căn cứ dựa trên số liệu <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={6}
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              placeholder="Giải thích bằng số liệu đính kèm và kiến thức học phần..."
              maxLength={3000}
              className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-800 leading-relaxed placeholder:text-slate-400 focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] transition-all resize-y shadow-2xs"
            />
            <div className="text-[11px] text-slate-400 text-right">
              {reasoning.length} / 3000 ký tự
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate("/student")}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Quay lại
            </button>

            <div className="text-[11px] text-slate-500 italic text-center sm:text-left">
              Bài nộp là bản cuối, không chỉnh sửa sau khi nộp.
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {isSaved ? "Đã lưu nháp ✓" : "Lưu nháp"}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2 text-xs font-bold text-white bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Nộp bài
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Case Meta & Submission Requirements (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Thông tin tình huống */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
              Thông tin tình huống
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-400">Chế độ:</span>
                <span className="font-semibold text-slate-800">Review Study</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-400">Học phần:</span>
                <span className="font-semibold text-slate-800">Marketing số</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-400">Hình thức:</span>
                <span className="font-semibold text-slate-800">Bài nộp tự luận</span>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                <span className="text-slate-500">Chấm điểm:</span>
                <span className="font-bold text-[#1E3A8A]">Không chấm điểm</span>
              </div>
            </div>
          </div>

          {/* Card 2: Yêu cầu bài nộp */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
              Yêu cầu bài nộp
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 leading-snug">
                <span className="font-bold text-slate-900 block mb-0.5">1. Đề xuất phương án / kế hoạch giải quyết</span>
                Phân bổ cụ thể ngân sách theo từng kênh và trình tự triển khai theo tuần.
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 leading-snug">
                <span className="font-bold text-slate-900 block mb-0.5">2. Lập luận căn cứ dựa trên số liệu</span>
                Giải thích căn cứ tính toán chi phí trên mỗi lượt kích hoạt và rủi ro bão hòa.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
