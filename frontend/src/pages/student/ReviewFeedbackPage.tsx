import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

export function ReviewFeedbackPage() {
  const navigate = useNavigate();
  const { caseId } = useParams();

  // Toggle view between 06.2 (Chờ phản hồi) and 06.3 (Đã phản hồi)
  const [isReviewed, setIsReviewed] = useState(true);

  // Student reflection text after feedback in 06.3
  const [reflectionText, setReflectionText] = useState(
    "Em sẽ bổ sung giả thuyết tỷ lệ hoàn tất KYC dựa trên số liệu drop-off ở bước liên kết tài khoản ngân hàng và thiết kế thử nghiệm A/B tại 2 trường đại học trước khi mở rộng Campus."
  );
  const [isReflectionSent, setIsReflectionSent] = useState(false);

  const handleSendReflection = () => {
    setIsReflectionSent(true);
    setTimeout(() => setIsReflectionSent(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/student/cases/${caseId || "cs301"}/review-study`)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
            title="Quay lại bài làm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isReviewed
                ? "Tối ưu chiến dịch ra mắt ví điện tử NovaPay"
                : "Review Study · Marketing số"}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <Link to="/student" className="hover:text-[#1E3A8A] transition-colors">
                Khóa học của tôi
              </Link>
              <span>&gt;</span>
              <span className="text-slate-800 font-medium">
                {isReviewed ? "Đã phản hồi" : "Đã nộp Review Study"}
              </span>
            </div>
          </div>
        </div>

        {/* State Toggle for Review Study demo (06.2 vs 06.3) */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Chế độ xem:</span>
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-2xs text-xs">
            <button
              onClick={() => setIsReviewed(false)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                !isReviewed
                  ? "bg-[#1E3A8A] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              06.2 Chờ phản hồi
            </button>
            <button
              onClick={() => setIsReviewed(true)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                isReviewed
                  ? "bg-[#1E3A8A] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              06.3 Đã phản hồi
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 06.2 · SINH VIÊN · REVIEW STUDY ĐÃ NỘP, CHỜ PHẢN HỒI               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {!isReviewed ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Banner Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
              <div className="bg-[#0284C7] p-6 text-white text-center relative">
                <span className="absolute top-4 left-4 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white backdrop-blur-xs">
                  Review Study
                </span>
                <div className="mx-auto flex h-14 w-14 items-center justify-center text-white/95">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                </div>
              </div>

              <div className="p-5 space-y-3.5 text-xs text-slate-600">
                <h2 className="text-sm font-bold text-slate-900 leading-snug">
                  Kích hoạt người dùng ví điện tử cho sinh viên
                </h2>
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[#1E3A8A] font-bold text-[10px]">NA</span>
                  <span className="font-medium text-slate-700">TS. Nguyễn Văn An</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ● Đã nộp
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#1E3A8A] text-white">
                    Marketing số
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                  <div>
                    <div className="text-[11px] text-slate-400">Trạng thái</div>
                    <div className="font-bold text-slate-800 mt-0.5">Đã nộp</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Thời gian nộp</div>
                    <div className="font-semibold text-slate-800 mt-0.5">10:24, 23/10/2026</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[11px] text-slate-400">Chế độ</div>
                  <div className="font-semibold text-slate-800 mt-0.5">Review Study</div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                    Bối cảnh tình huống
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    NovaPay chuẩn bị ra mắt ví điện tử cho sinh viên tại các thành phố lớn. Sau 4 tuần thử nghiệm truyền thông, lượt tiếp cận tăng nhưng tỷ lệ kích hoạt tài khoản vẫn thấp. Nhóm marketing cần phân bổ lại ngân sách cho 2 tuần tiếp theo để tăng số người dùng thực sự hoàn tất giao dịch đầu tiên.
                  </p>
                </div>
              </div>
            </div>

            {/* Dữ liệu đính kèm */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-2 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
                Số liệu & dữ liệu thực tế đính kèm
              </h3>
              <div className="space-y-1.5 text-[11px] text-slate-700">
                <div className="font-semibold text-slate-900">• Ngân sách thử nghiệm: 300 triệu VNĐ / 4 tuần</div>
                <div className="pl-3 text-slate-600">TikTok Ads: 150 triệu - 3.000 đăng ký - 450 kích hoạt</div>
                <div className="pl-3 text-slate-600">Meta Ads: 90 triệu - 1.800 đăng ký - 540 kích hoạt</div>
                <div className="pl-3 text-slate-600">Campus: 60 triệu - 1.200 đăng ký - 600 kích hoạt</div>
                <div className="font-semibold text-slate-900 pt-1">• Ngân sách còn lại: 120 triệu VNĐ / 2 tuần</div>
                <div className="font-semibold text-[#1E3A8A]">• Mục tiêu: thêm 1.500 người dùng có giao dịch đầu tiên</div>
              </div>
            </div>
          </div>

          {/* Right Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Bài nộp giải pháp của bạn */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Bài nộp giải pháp của bạn</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-900 text-white shadow-2xs">
                  Đã nộp · Bản cuối
                </span>
              </div>

              {/* Box Vấn đề */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#1E3A8A]">
                  Vấn đề cần giải quyết
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Đề xuất kế hoạch phân bổ 120 triệu VNĐ trong 2 tuần để cải thiện tỷ lệ kích hoạt, hướng tới 1.500 người dùng có giao dịch đầu tiên. Cần nêu rõ hành động theo kênh, cách đo lường và rủi ro khi mở rộng chiến dịch.
                </p>
              </div>

              {/* Phương án giải pháp */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900">Phương án giải pháp</div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Tôi đề xuất dành 60 triệu cho hoạt động Campus, 36 triệu cho Meta Ads và 24 triệu cho TikTok retargeting. Tuần đầu triển khai tại các trường đã có cộng đồng người dùng, đồng thời đơn giản hóa hướng dẫn KYC và giao dịch đầu tiên. Nội dung quảng cáo tập trung vào tình huống thanh toán thật thay vì chỉ khuyến khích đăng ký.
                </p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Cuối tuần đầu, theo dõi chi phí trên mỗi người dùng có giao dịch đầu tiên theo từng kênh, tỷ lệ hoàn tất KYC và tỷ lệ kích hoạt. Tuần hai chỉ mở rộng nhóm có hiệu quả tốt, kiểm tra trùng lặp người dùng và điều chỉnh thông điệp ở các bước rơi rụng.
                </p>
              </div>

              {/* Lập luận căn cứ */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-900">Lập luận căn cứ</div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Chi phí cho một lượt kích hoạt hiện tại là 100.000 VNĐ ở Campus, khoảng 166.667 VNĐ ở Meta và 333.333 VNĐ ở TikTok. Campus có tỷ lệ kích hoạt 50%, cao hơn Meta 30% và TikTok 15%, nên tôi ưu tiên kênh này nhưng không giả định hiệu quả sẽ giữ nguyên khi mở rộng. Với ngân sách 120 triệu, mục tiêu 1.500 người dùng đòi hỏi chi phí bình quân 80.000 VNĐ; vì vậy chỉ chuyển ngân sách là chưa đủ.
                </p>
              </div>
            </div>

            {/* Phản hồi của giảng viên (Chờ phản hồi) */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Phản hồi của giảng viên</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#1E3A8A] text-white">
                  Chờ phản hồi
                </span>
              </div>

              <div className="p-6 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-500 text-lg">
                  ⏱
                </div>
                <p className="text-xs text-slate-700 max-w-md mx-auto leading-relaxed">
                  Giảng viên chưa phản hồi bài làm này. Bạn đã nộp bài lúc 10:24, 23/10/2026. Bài nộp là bản cuối, không chỉnh sửa được. Khi giảng viên gửi nhận xét, phần phản tư sẽ mở tại đây.
                </p>
                <div className="text-[11px] font-semibold text-slate-500 mt-1">
                  Giảng viên phụ trách: TS. Nguyễn Văn An
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────────── */
        /* 06.3 · SINH VIÊN · REVIEW STUDY ĐÃ PHẢN HỒI (CÓ NHẬN XÉT CỦA GV)   */
        /* ─────────────────────────────────────────────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Lecturer Card Banner */}
            <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
              <div className="bg-[#1E3A8A] p-6 text-white text-center relative">
                <span className="absolute top-4 left-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F4EA] text-emerald-800 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Đã phản hồi
                </span>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#1E3A8A] text-xl font-bold shadow-md mt-1 ring-4 ring-white/20">
                  TH
                </div>
                <h2 className="mt-2 text-base font-bold text-white">ThS. Trần Thu Hà</h2>
                <p className="text-xs text-blue-100 font-medium">
                  Giảng viên phụ trách · Marketing số
                </p>
              </div>

              <div className="p-5 space-y-3 text-xs text-slate-600 border-t border-slate-100">
                <div className="flex items-start gap-2.5">
                  <span className="text-slate-400">📖</span>
                  <div>
                    <div className="text-[11px] text-slate-400">Học phần</div>
                    <div className="font-semibold text-slate-800">Marketing số</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-[#1E3A8A]">📝</span>
                  <div>
                    <div className="text-[11px] text-slate-400">Chế độ</div>
                    <div className="font-semibold text-slate-800">Review Study - Bài nộp tự luận</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-emerald-600">⚖</span>
                  <div>
                    <div className="text-[11px] text-slate-400">Phản hồi</div>
                    <div className="font-semibold text-slate-800">Nhận xét định tính, không chấm điểm</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nhận xét từ giảng viên Card */}
            <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#1E3A8A] flex items-center gap-2 pb-2 border-b border-blue-100">
                <span>💬</span>
                <span>Nhận xét từ giảng viên</span>
              </h3>
              <p className="text-xs text-slate-800 leading-relaxed italic bg-blue-50/50 p-3.5 rounded-xl border border-blue-100">
                &ldquo;Em đã phân biệt được lượt đăng ký với người dùng thực sự kích hoạt và sử dụng số liệu theo kênh để bảo vệ phương án. Điểm đáng chú ý là em nhận ra mục tiêu 1.500 người dùng chưa thể đạt chỉ bằng việc dịch chuyển ngân sách. Hãy làm rõ giả thuyết cải thiện KYC, thiết kế nhóm thử nghiệm và ngưỡng dừng trước khi mở rộng Campus. Cũng cần tính chi phí hỗ trợ tại trường và kiểm soát người dùng trùng lặp để đánh giá hiệu quả thực chất.&rdquo;
              </p>
            </div>
          </div>

          {/* Right Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Bài nộp giải pháp của bạn */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                Bài nộp giải pháp của bạn
              </h3>

              {/* Bối cảnh tình huống */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <span className="text-slate-500">📖</span>
                  <span>Bối cảnh tình huống</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-5">
                  NovaPay chuẩn bị ra mắt ví điện tử cho sinh viên tại các thành phố lớn. Sau 4 tuần thử nghiệm truyền thông, lượt tiếp cận tăng nhưng tỷ lệ kích hoạt tài khoản vẫn thấp. Nhóm marketing cần phân bổ lại ngân sách cho 2 tuần tiếp theo để tăng số người dùng thực sự hoàn tất giao dịch đầu tiên.
                </p>
              </div>

              {/* Phương án giải pháp */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <span className="text-[#1E3A8A]">📝</span>
                  <span>Phương án giải pháp</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed pl-5">
                  Tôi đề xuất dành 60 triệu cho hoạt động Campus, 36 triệu cho Meta Ads và 24 triệu cho TikTok retargeting. Tuần đầu triển khai tại các trường đã có cộng đồng người dùng, đồng thời đơn giản hóa hướng dẫn KYC và giao dịch đầu tiên. Nội dung quảng cáo tập trung vào tình huống thanh toán thật thay vì chỉ khuyến khích đăng ký.
                </p>
                <p className="text-xs text-slate-700 leading-relaxed pl-5 mt-1">
                  Cuối tuần đầu, theo dõi chi phí trên mỗi người dùng có giao dịch đầu tiên theo từng kênh, tỷ lệ hoàn tất KYC và tỷ lệ kích hoạt. Tuần hai chỉ mở rộng nhóm có hiệu quả tốt, kiểm tra trùng lặp người dùng và điều chỉnh thông điệp ở các bước rơi rụng.
                </p>
              </div>

              {/* Lập luận căn cứ */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <span className="text-emerald-700">📊</span>
                  <span>Lập luận căn cứ</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed pl-5">
                  Chi phí cho một lượt kích hoạt hiện tại là 100.000 VNĐ ở Campus, khoảng 166.667 VNĐ ở Meta và 333.333 VNĐ ở TikTok. Campus có tỷ lệ kích hoạt 50%, cao hơn Meta 30% và TikTok 15%, nên tôi ưu tiên kênh này nhưng không giả định hiệu quả sẽ giữ nguyên khi mở rộng. Với ngân sách 120 triệu, mục tiêu 1.500 người dùng đòi hỏi chi phí bình quân 80.000 VNĐ; vì vậy chỉ chuyển ngân sách là chưa đủ. Cần cải thiện phễu KYC, hỗ trợ giao dịch đầu tiên và thử nghiệm theo từng nhóm trước khi tăng chi tiêu.
                </p>
              </div>
            </div>

            {/* Bottom Split: Phản tư sau nhận xét vs Số liệu đính kèm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Phản tư sau nhận xét */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900">Phản tư sau nhận xét</h4>
                <div className="text-[11px] text-slate-500">
                  Sau khi đọc nhận xét, bạn rút ra điều gì?
                </div>
                <textarea
                  rows={5}
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder="Viết phản tư của bạn..."
                  maxLength={1000}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 leading-relaxed placeholder:text-slate-400 focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] transition-all resize-y shadow-2xs"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{reflectionText.length} / 1000 ký tự</span>
                  <span>Không chấm điểm</span>
                </div>
                <div className="pt-1 flex items-center justify-between">
                  {isReflectionSent ? (
                    <span className="text-xs font-bold text-emerald-600">
                      ✓ Đã gửi phản tư thành công
                    </span>
                  ) : <span></span>}
                  <button
                    type="button"
                    onClick={handleSendReflection}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer ml-auto"
                  >
                    <span>✈</span>
                    <span>Gửi phản tư</span>
                  </button>
                </div>
              </div>

              {/* Số liệu đính kèm */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
                  Số liệu đính kèm
                </h4>
                <div className="space-y-1.5 text-[11px] text-slate-700">
                  <div className="font-semibold text-slate-900">• Ngân sách & kết quả 4 tuần:</div>
                  <div className="pl-3 text-slate-600">Ngân sách thử nghiệm: 300 triệu VNĐ / 4 tuần</div>
                  <div className="pl-3 text-slate-600">TikTok Ads: 150 triệu - 3.000 đăng ký - 450 kích hoạt</div>
                  <div className="pl-3 text-slate-600">Meta Ads: 90 triệu - 1.800 đăng ký - 540 kích hoạt</div>
                  <div className="pl-3 text-slate-600">Campus: 60 triệu - 1.200 đăng ký - 600 kích hoạt</div>
                  <div className="font-semibold text-slate-900 pt-1">• Ngân sách còn lại: 120 triệu VNĐ / 2 tuần</div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 space-y-1 text-xs">
                  <div className="font-bold text-[#1E3A8A] text-[11px]">Vấn đề cần giải quyết:</div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    Đề xuất kế hoạch phân bổ 120 triệu VNĐ trong 2 tuần để cải thiện tỷ lệ kích hoạt, hướng tới 1.500 người dùng có giao dịch đầu tiên. Cần nêu rõ hành động theo kênh, cách đo lường và rủi ro khi mở rộng chiến dịch.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
