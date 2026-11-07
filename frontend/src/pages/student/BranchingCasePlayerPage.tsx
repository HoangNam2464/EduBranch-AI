import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

type PlayerViewStage = "OVERVIEW" | "DECISION" | "OUTCOME";

interface OptionDetail {
  id: "A" | "B" | "C";
  label: string;
  title: string;
  description: string;
  commitmentNote: string;
}

const OPTIONS: OptionDetail[] = [
  {
    id: "A",
    label: "A - Bật Degraded Mode",
    title: "Bật cơ chế Degraded Mode (Hạ cấp & Rate Limiter)",
    description:
      "Tạm ngắt gợi ý giỏ hàng và đồng bộ ví điểm thưởng; áp dụng thuật toán Token Bucket chặn 35% kết nối không thiết yếu tại Gateway.",
    commitmentNote:
      "Quyết định này mang tính cam kết và sẽ chuyển hệ thống sang diễn biến tiếp theo ngay lập tức.",
  },
  {
    id: "B",
    label: "B - Tăng Read Replicas & Server",
    title: "Mở rộng máy chủ ứng dụng & Read Replicas",
    description:
      "Tự động scale thêm 10 node máy chủ ứng dụng và chuyển hướng truy vấn đọc sang cụm replica để giải tỏa tải cho master DB.",
    commitmentNote:
      "Quyết định này tốn khoảng 3-5 phút khởi động node và có thể làm tăng số lượng connection tới DB master.",
  },
  {
    id: "C",
    label: "C - Tạm dừng nhận đơn 10 phút",
    title: "Kích hoạt trang bảo trì tạm thời (Queue Freeze)",
    description:
      "Ngắt nhận đơn thanh toán mới trong 10 phút để hệ thống xử lý dứt điểm các giao dịch đang tồn đọng trong hàng đợi.",
    commitmentNote:
      "Quyết định này bảo vệ an toàn dữ liệu tuyệt đối nhưng sẽ gây gián đoạn doanh thu và khiếu nại khách hàng diện rộng.",
  },
];

export function BranchingCasePlayerPage() {
  const navigate = useNavigate();
  const { caseId } = useParams();

  // Mode: "OVERVIEW" (05.1), "DECISION" (05.2), "OUTCOME" (05.3)
  const [stage, setStage] = useState<PlayerViewStage>("OVERVIEW");
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C">("A");

  // Accordion state in 05.1
  const [openAttemptId, setOpenAttemptId] = useState<string>("attempt-2");

  // Handle continuing attempt #2
  const handleStartOrContinue = () => {
    setStage("DECISION");
  };

  // Confirm decision and navigate to terminal outcome (05.3)
  const handleConfirmDecision = () => {
    setStage("OUTCOME");
  };

  // Navigate to Journey Review (05.4)
  const handleGoToReview = () => {
    navigate(`/student/cases/${caseId || "cs301"}/attempt/attempt-2/review`);
  };

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 05.1 · SINH VIÊN · GIỚI THIỆU TÌNH HUỐNG                            */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {stage === "OVERVIEW" && (
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
                Khủng hoảng sập hệ thống thanh toán Black Friday
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <Link to="/student" className="hover:text-[#1E3A8A] transition-colors">
                  Khóa học của tôi
                </Link>
                <span>&gt;</span>
                <span className="text-slate-800 font-medium">CS301 · Tình huống học tập</span>
              </div>
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (Meta & Background) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Case Card with Navy Diagram */}
              <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
                {/* Visual Banner */}
                <div className="bg-[#1E3A8A] p-6 text-white relative flex flex-col items-center justify-center h-44">
                  <span className="absolute top-4 left-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/15 text-white backdrop-blur-xs border border-white/20">
                    Branching Study
                  </span>
                  <div className="text-white/80 scale-125">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="6" y1="3" x2="6" y2="15" />
                      <circle cx="18" cy="6" r="3" />
                      <circle cx="6" cy="18" r="3" />
                      <path d="M18 9a9 9 0 0 1-9 9" />
                    </svg>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <h2 className="text-base font-bold text-slate-900 leading-snug">
                    Khủng hoảng sập hệ thống thanh toán Black Friday
                  </h2>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[#1E3A8A] font-bold text-[10px]">
                      NA
                    </span>
                    <span className="font-medium">TS. Nguyễn Văn An</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ● Đang mở
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      CS301
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <div className="text-slate-400 text-[11px]">Hạn nộp</div>
                      <div className="font-bold text-slate-800 mt-0.5">20/11/2026</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">Đã thực hiện</div>
                      <div className="font-bold text-slate-800 mt-0.5">2 lần</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-xs">
                    <div className="text-slate-400 text-[11px]">Xếp hạng</div>
                    <div className="font-semibold text-slate-700 mt-0.5">Không chấm điểm</div>
                  </div>
                </div>
              </div>

              {/* Case Context Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Mô tả bối cảnh tình huống
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Vào 20:00 đêm Black Friday, nền tảng thương mại điện tử ghi nhận 85k req/s, gấp nhiều lần tải thông thường. Cơ sở dữ liệu thanh toán chạm ngưỡng kết nối, giao dịch bị treo và khách hàng liên tục thử lại. Trong vai trò trưởng nhóm vận hành, bạn cần giữ hệ thống hoạt động, bảo vệ tính nhất quán của giao dịch và phối hợp với các bộ phận kinh doanh dưới áp lực thời gian.
                </p>
              </div>

              {/* Course Info Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Thông tin học phần
                </h3>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400">Học phần: </span>
                    <span className="font-semibold text-slate-800">Hệ thống phân tán (CS301)</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Giảng viên: </span>
                    <span className="font-semibold text-slate-800">TS. Nguyễn Văn An</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 block mb-1">Chế độ học:</span>
                    <span className="text-slate-700 font-medium leading-relaxed block">
                      Branching Study — đi liên tục qua các điểm quyết định; hệ quả được mở ở bước Journey Review.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Attempt History & Action) */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Lịch sử các lần làm bài của bạn (2)
              </h3>

              {/* Attempt #2 (In Progress - Active) */}
              <div className="rounded-2xl border border-blue-200 bg-white overflow-hidden shadow-xs">
                {/* Accordion Header */}
                <div
                  onClick={() => setOpenAttemptId(openAttemptId === "attempt-2" ? "" : "attempt-2")}
                  className="p-4 sm:p-5 bg-blue-50/40 border-b border-blue-100 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-slate-900">Lần làm #2 · Đang thực hiện</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-900 text-white shadow-2xs">
                      Bắt đầu: 18/11/2026, 09:15
                    </span>
                    <span className="text-slate-400 text-xs">
                      {openAttemptId === "attempt-2" ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {/* Accordion Body */}
                {openAttemptId === "attempt-2" && (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Progress Steps */}
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-slate-800 mb-2">Tiến độ lượt làm</div>
                      <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="font-medium text-slate-700">Điểm quyết định 1</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">Đã đi qua</span>
                      </div>

                      <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/50 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#1E3A8A] animate-pulse"></span>
                          <span className="font-bold text-[#1E3A8A]">Điểm quyết định tiếp theo</span>
                        </div>
                        <span className="text-[11px] text-[#1E3A8A] font-semibold">Đang chờ</span>
                      </div>
                    </div>

                    {/* Right: Continue Action Box */}
                    <div className="p-5 rounded-xl border border-slate-100 bg-slate-50/80 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-[#1E3A8A]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="6" y1="3" x2="6" y2="15" />
                          <circle cx="18" cy="6" r="3" />
                          <circle cx="6" cy="18" r="3" />
                          <path d="M18 9a9 9 0 0 1-9 9" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Bạn đang ở giữa lượt làm #2</h4>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                          Mỗi lần thử là một cơ hội khám phá. Lượt cũ được giữ nguyên.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-2 w-full justify-center">
                        <button
                          onClick={handleStartOrContinue}
                          className="px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs inline-flex items-center gap-1.5"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" /></svg>
                          <span>Làm lại</span>
                        </button>
                        <button
                          onClick={handleStartOrContinue}
                          className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5"
                        >
                          <span>Tiếp tục làm dở</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Attempt #1 (Submitted) */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-slate-800">Lần làm #1 · Đã nộp</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Hoàn tất: 17/11/2026, 20:35
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/student/cases/${caseId || "cs301"}/attempt/attempt-1/review`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-colors"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polygon points="12 8 8 12 12 16 12 8" /></svg>
                  <span>Xem Journey Review</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 05.2 · TÌNH HUỐNG · ĐÃ CHỌN PHƯƠNG ÁN                              */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {stage === "DECISION" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStage("OVERVIEW")}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
              title="Quay lại giới thiệu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Điểm quyết định 1</h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>Khủng hoảng sập hệ thống thanh toán Black Friday</span>
                <span>&gt;</span>
                <span className="text-slate-800 font-medium">Điểm quyết định 1</span>
              </div>
            </div>
          </div>

          {/* 2-Column Main Flow */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Situation Brief & Live Metrics */}
            <div className="lg:col-span-5 space-y-6">
              {/* Situation Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
                {/* Visual Alert Banner */}
                <div className="bg-[#1E3A8A] p-6 text-white relative flex flex-col items-center justify-center h-44">
                  <span className="absolute top-4 left-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/80 text-white backdrop-blur-xs border border-white/20">
                    Sự cố khẩn cấp - P1
                  </span>
                  <div className="text-white/80">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <h2 className="text-base font-bold text-slate-900 leading-snug">
                    Lưu lượng tăng đột biến: Bảo vệ hệ thống thanh toán
                  </h2>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[#1E3A8A] font-bold text-[10px]">
                      NA
                    </span>
                    <span className="font-medium">TS. Nguyễn Văn An</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Điểm quyết định 1
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      Branching Study
                    </span>
                  </div>

                  {/* 3 Metrics Box */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <div className="text-slate-400 text-[11px]">Lưu lượng Gateway</div>
                      <div className="font-bold text-slate-900 mt-0.5">85,000 req/s</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">Kết nối CSDL</div>
                      <div className="font-bold text-slate-900 mt-0.5 text-rose-600">98% Pooled</div>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-slate-200/60">
                      <div className="text-slate-400 text-[11px]">Độ trễ thanh toán p95</div>
                      <div className="font-bold text-rose-600 mt-0.5">12.8 giây - vượt SLA &lt; 2.0s</div>
                    </div>
                  </div>

                  {/* Dilemma Body */}
                  <div className="space-y-2 text-xs text-slate-700 leading-relaxed border-t border-slate-100 pt-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Bối cảnh
                    </div>
                    <p>
                      Vào 20:00 đêm Black Friday, nền tảng thương mại điện tử ghi nhận 85,000 req/s, gấp 5 lần tải thiết kế thông thường. Cơ sở dữ liệu thanh toán chạm ngưỡng 98% số kết nối, giao dịch bắt đầu bị treo và khách hàng liên tục bấm thử lại.
                    </p>
                    <p>
                      Trong vai trò Trưởng nhóm Vận hành Hệ thống, bạn cần đưa ra quyết định can thiệp ngay để giữ hệ thống không sụp đổ hoàn toàn mà vẫn bảo toàn tính nhất quán của dữ liệu thanh toán.
                    </p>
                  </div>
                </div>
              </div>

              {/* Monitoring Metric Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Thông số giám sát - 20:00:15
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-slate-400 text-[11px]">Lưu lượng Gateway</div>
                    <div className="font-bold text-slate-800 mt-0.5">Tăng 420% so với dự báo</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-slate-400 text-[11px]">Kết nối cơ sở dữ liệu</div>
                    <div className="font-bold text-rose-600 mt-0.5">Chạm ngưỡng bão hòa connection</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-slate-400 text-[11px]">Tỷ lệ lỗi giao dịch</div>
                    <div className="font-bold text-amber-600 mt-0.5">18.4% - Khách hàng thử lại liên tục</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Option Picker & Field Alert */}
            <div className="lg:col-span-7 space-y-6">
              {/* Option Selection Container */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Chọn phương án hành động</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Lựa chọn của bạn sẽ kích hoạt chuỗi phản ứng tiếp theo
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#1E3A8A] border border-blue-100">
                    3 phương án
                  </span>
                </div>

                {/* Split Option Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  {/* Left Column: Radio Options List (5 cols) */}
                  <div className="md:col-span-5 space-y-2.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Phương án
                    </div>
                    {OPTIONS.map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => setSelectedOption(opt.id)}
                        className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                          selectedOption === opt.id
                            ? "border-[#1E3A8A] bg-blue-50/60 text-[#1E3A8A] font-bold shadow-2xs"
                            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              selectedOption === opt.id
                                ? "border-[#1E3A8A] bg-[#1E3A8A]"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {selectedOption === opt.id && (
                              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                            )}
                          </span>
                          <span className="text-xs">{opt.label}</span>
                        </div>
                        {selectedOption === opt.id && (
                          <span className="text-[10px] text-[#1E3A8A] font-semibold">Đã chọn</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Right Column: Active Option Preview & Confirm Button (7 cols) */}
                  <div className="md:col-span-7 p-5 rounded-2xl border border-blue-100 bg-slate-50/70 space-y-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#1E3A8A]">
                      Phương án {selectedOption}
                    </div>

                    {/* Title & Description of Chosen Option */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {OPTIONS.find((o) => o.id === selectedOption)?.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {OPTIONS.find((o) => o.id === selectedOption)?.description}
                      </p>
                    </div>

                    {/* Commitment Note */}
                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed italic">
                      {OPTIONS.find((o) => o.id === selectedOption)?.commitmentNote}
                    </div>

                    {/* Action Confirmation Button */}
                    <button
                      type="button"
                      onClick={handleConfirmDecision}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                    >
                      <span>→</span>
                      <span>Xác nhận phương án {selectedOption}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Field Alert Box */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900">Tín hiệu từ hiện trường</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    Báo cáo CSKH
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100 text-xs text-slate-800 leading-relaxed">
                  <p className="italic">
                    &ldquo;Ghi nhận 1,200 khiếu nại tài khoản đã bị trừ tiền trên ví điện tử nhưng đơn hàng chưa chuyển sang trạng thái Đã thanh toán. Khách hàng bắt đầu hoang mang trên mạng xã hội.&rdquo;
                  </p>
                  <div className="mt-2 text-[11px] font-semibold text-amber-900 text-right">
                    -- Báo cáo CSKH (Mới)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 05.3 · TÌNH HUỐNG · KẾT THÚC HÀNH TRÌNH                              */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {stage === "OUTCOME" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStage("DECISION")}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
              title="Quay lại quyết định"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Kết thúc hành trình</h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>Khủng hoảng sập hệ thống thanh toán Black Friday</span>
                <span>&gt;</span>
                <span className="text-slate-800 font-medium">Kết thúc</span>
              </div>
            </div>
          </div>

          {/* Outcome Banner & Summary Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Big Outcome Banner (8 cols) */}
            <div className="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col md:flex-row items-center gap-6">
              {/* Flag Icon Block */}
              <div className="flex flex-col items-center justify-center w-28 h-28 rounded-2xl bg-[#1E3A8A] text-white shrink-0 shadow-md">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
                <span className="text-xs font-bold mt-1 text-blue-100">Lượt làm #2</span>
              </div>

              {/* Outcome Narrative */}
              <div className="space-y-3 flex-1 min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#1E3A8A]">
                  Kết cục hành trình
                </div>
                <h2 className="text-base font-bold text-slate-900 leading-snug">
                  Ổn định hệ thống, phục hồi dịch vụ có kiểm soát
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Chuỗi quyết định của bạn (Bật Degraded Mode và kích hoạt hàng đợi bảo trì) đã chặn đứng nguy cơ sập toàn diện cụm cơ sở dữ liệu thanh toán. Mặc dù một lượng khách hàng gặp độ trễ trong giờ cao điểm, tính toàn vẹn dữ liệu được bảo toàn tuyệt đối 100%.
                </p>

                {/* 2 Outcome Badges */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-slate-400 text-[11px]">Mức hài lòng CSAT: </span>
                    <span className="font-bold text-slate-800">3.8 / 5.0 - Bị ảnh hưởng trễ</span>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-slate-400 text-[11px]">Lượt làm bài: </span>
                    <span className="font-bold text-slate-800">#2</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Mini Context Card (4 cols) */}
            <div className="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Tình huống
              </div>
              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-[#1E3A8A]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" /></svg>
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    Khủng hoảng sập hệ thống thanh toán Black Friday
                  </h4>
                  <div className="text-[10px] text-slate-500 mt-0.5">Hệ thống phân tán · CS301</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-[#1E3A8A]">
                  Branching Study
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                  Không chấm điểm
                </span>
              </div>
            </div>
          </div>

          {/* 3 Outcome Metric Rows & Pedagogical Note */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 3 Metric Rows (8 cols) */}
            <div className="lg:col-span-8 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Chỉ số kết cục</h3>

              {/* Metric 1 */}
              <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Toàn vẹn giao dịch</div>
                    <div className="text-[11px] text-slate-400">0 giao dịch trùng</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-emerald-600">100%</div>
              </div>

              {/* Metric 2 */}
              <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#1E3A8A]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Doanh thu giữ được</div>
                    <div className="text-[11px] text-slate-400">So với kế hoạch</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-[#1E3A8A]">82.4%</div>
              </div>

              {/* Metric 3 */}
              <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Thời gian xử lý</div>
                    <div className="text-[11px] text-slate-400">Dưới ngưỡng SLA</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-slate-800">24 phút</div>
              </div>
            </div>

            {/* Note Box (4 cols) */}
            <div className="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Ghi chú
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hệ quả chi tiết của từng lựa chọn chỉ được mở ở bước Journey Review. Lượt làm cũ được giữ nguyên.
              </p>
            </div>
          </div>

          {/* Bottom Split: Attempt Stages & Next Action */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Progress list (6 cols) */}
            <div className="lg:col-span-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
                Tiến trình lượt làm
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                    <span className="font-semibold text-slate-800">Trải nghiệm kịch bản</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">Hoàn thành</span>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-[10px] font-bold">2</span>
                    <span className="font-bold text-[#1E3A8A]">Xem lại & giải trình lập luận</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-[#1E3A8A]">Đang chờ</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50/50 border border-slate-100 flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">3</span>
                    <span>Phản tư tổng kết</span>
                  </div>
                  <span className="text-[10px]">Chưa mở</span>
                </div>
              </div>
            </div>

            {/* Next Step Action Box (6 cols) */}
            <div className="lg:col-span-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
                Bước tiếp theo
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nhiệm vụ bắt buộc trước khi chuyển sang bước phản tư và tổng kết lượt làm bài #2: xem lại hệ quả của từng quyết định và giải trình lập luận.
              </p>
              <button
                type="button"
                onClick={handleGoToReview}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                <span>→</span>
                <span>Chuyển sang Journey Review</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
