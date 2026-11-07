import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

export function BranchingReviewPage() {
  const navigate = useNavigate();
  const { caseId, attemptId } = useParams();

  // Accordion active node: 1, 2, or 3
  const [activeNode, setActiveNode] = useState<number>(1);

  // Student Reasoning State
  const [studentReasoning, setStudentReasoning] = useState(
    "Tôi chọn hàng đợi ảo vì 85k req/s đang vượt khả năng xử lý của cơ sở dữ liệu. Auto-scale ứng dụng lúc này có thể làm tăng số kết nối và khiến DB quá tải hơn. Tôi không dừng toàn bộ thanh toán vì vẫn cần phục vụ giao dịch hợp lệ."
  );

  // Socratic Challenge Dialog State (05.5 & 05.6)
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [challengeRound, setChallengeRound] = useState<number>(1);
  const [challengeInput, setChallengeInput] = useState("");
  const [isChallengeCompleted, setIsChallengeCompleted] = useState(false);

  // Challenge history for 05.6
  const [round1Answer, setRound1Answer] = useState(
    "Hàng đợi ảo kèm thông báo thời gian chờ rõ ràng giữ được giao dịch nhất quán. Nếu đối thủ chạy chiến dịch thanh toán tức thì, tôi sẽ ưu tiên khách đang ở bước thanh toán và tặng mã ưu đãi cho người chờ quá 3 phút."
  );
  const [round2Answer, setRound2Answer] = useState(
    "Mỗi thao tác đăng ký sử dụng Idempotency Key gắn với tài khoản và đơn hàng. Dựa vào chi phí chuyển đổi khách hàng (CAC) và giá trị vòng đời (LTV) từ dashboard kinh doanh để xác định trần ngân sách mã giảm giá."
  );

  const handleOpenChallenge = (round = 1) => {
    setChallengeRound(round);
    setIsChallengeModalOpen(true);
  };

  const handleSendChallengeAnswer = () => {
    if (challengeRound === 1) {
      setRound1Answer(challengeInput || round1Answer);
      setChallengeInput("");
      setChallengeRound(2);
    } else {
      setRound2Answer(challengeInput || round2Answer);
      setChallengeInput("");
      setIsChallengeCompleted(true);
    }
  };

  const handleNavigateToReflection = () => {
    navigate(`/student/cases/${caseId || "cs301"}/attempt/${attemptId || "attempt-1"}/reflect`);
  };

  return (
    <div className="space-y-6 relative">
      {/* Top Header & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/student/cases/${caseId || "cs301"}/branching-play`)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
          title="Quay lại kịch bản"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Journey Review — Xem lại hành trình quyết định
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Khủng hoảng sập hệ thống thanh toán Black Friday</span>
            <span>&gt;</span>
            <span className="text-slate-800 font-medium">Journey Review</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT COLUMN (Decision Summary & Step Trail) ──────────────── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Decision Tree Summary Box */}
          <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
            {/* Visual Navy Top */}
            <div className="bg-[#1E3A8A] p-6 text-white text-center relative">
              <span className="absolute top-4 left-4 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white backdrop-blur-xs">
                Lần làm #{attemptId === "attempt-2" ? "2" : "1"}
              </span>

              <div className="mx-auto flex h-14 w-14 items-center justify-center text-white/90">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6" y1="3" x2="6" y2="15" />
                  <circle cx="18" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <path d="M18 9a9 9 0 0 1-9 9" />
                </svg>
              </div>

              <h2 className="mt-2 text-base font-bold text-white">Sơ đồ hành trình quyết định</h2>
              <div className="text-xs text-blue-100 flex items-center justify-center gap-1.5 mt-1 font-medium">
                <span>TS. Nguyễn Văn An</span>
                <span>·</span>
                <span>Hệ thống phân tán</span>
                <span>·</span>
                <span>3 bước</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100 text-xs">
                <div>
                  <div className="text-slate-400 text-[11px]">Bước đã đi qua</div>
                  <div className="font-bold text-slate-800 text-base mt-0.5">3</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">Quyết định then chốt</div>
                  <div className="font-bold text-slate-800 text-base mt-0.5">1</div>
                </div>
              </div>

              <div className="text-xs">
                <span className="text-slate-400">Kết cục: </span>
                <span className="font-bold text-slate-900">Phục hồi có kiểm soát</span>
              </div>

              {/* Pedagogical Unlock Box */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-[#1E3A8A] block mb-1">Kết cục hành trình</span>
                Rào mật sư phạm đã mở khóa: hậu quả thực tế của từng quyết định được tiết lộ.
              </div>

              {/* Go to Reflection Button */}
              <button
                type="button"
                onClick={handleNavigateToReflection}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                <span>→</span>
                <span>Chuyển sang bước suy ngẫm</span>
              </button>
            </div>
          </div>

          {/* Card 2: List of Visited Steps */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Các bước đã đi qua
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="font-bold text-slate-800">
                  Bước 1 · Pivotal — Lưu lượng tăng đột biến
                </div>
                <div className="text-slate-500 text-[11px] mt-1">
                  Đã chọn: Bật hàng đợi ảo, giới hạn lưu lượng thanh toán
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="font-bold text-slate-800">
                  Bước 2 — Duy trì dịch vụ khi quá tải kéo dài
                </div>
                <div className="text-slate-500 text-[11px] mt-1">
                  Đã chọn: Kích hoạt Degraded Mode có kiểm soát
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="font-bold text-slate-800">
                  Bước 3 — Ổn định hệ thống, phục hồi có kiểm soát
                </div>
                <div className="text-slate-500 text-[11px] mt-1">
                  Kết cục hành trình
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (Decision Details & Consequence Cards) ────────── */}
        <div className="lg:col-span-8 space-y-4">
          <div className="text-sm font-bold text-slate-900 pb-1">
            Chi tiết các quyết định & hậu quả thực tế
          </div>

          {/* Node 1 (Expanded by Default) */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
            {/* Header Accordion Bar */}
            <div
              onClick={() => setActiveNode(activeNode === 1 ? 0 : 1)}
              className="p-4 sm:p-5 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  1 - Lưu lượng tăng đột biến
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-amber-800 border border-amber-300">
                  Quyết định then chốt
                </span>
              </div>
              <span className="text-slate-400 text-xs">{activeNode === 1 ? "▲" : "▼"}</span>
            </div>

            {/* Accordion Content */}
            {activeNode === 1 && (
              <div className="p-5 sm:p-6 space-y-5">
                {/* Chosen Option Box */}
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Phương án bạn đã chọn
                  </div>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                    Bật hàng đợi ảo, giới hạn lưu lượng thanh toán — điều tiết yêu cầu vào hệ thống, ưu tiên xử lý các giao dịch đang chờ.
                  </p>
                </div>

                {/* Real Consequence (Revealed here!) */}
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E3A8A]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                    <span>Hậu quả thực tế</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Hàng đợi ảo giảm lưu lượng vào DB còn khoảng 35k req/s. Số kết nối hạ xuống, các giao dịch đang chờ được xử lý ổn định hơn. Tuy nhiên, thời gian chờ tăng và CSKH bắt đầu nhận phản ánh từ khách hàng; nếu kéo dài, doanh thu và uy tín chiến dịch sẽ bị ảnh hưởng.
                  </p>
                </div>

                {/* Split Bottom: Reasoning & AI Challenge */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  {/* Left: Student Reasoning Textbox */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900">
                        Bản lập luận của bạn
                      </label>
                      <span className="text-[10px] text-slate-400">Hồi cứu</span>
                    </div>
                    <div className="text-[11px] text-slate-500 italic">
                      Lập luận hồi cứu (căn cứ số liệu & lý thuyết học phần)
                    </div>
                    <textarea
                      rows={6}
                      value={studentReasoning}
                      onChange={(e) => setStudentReasoning(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 leading-relaxed focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] transition-all resize-none shadow-2xs"
                    />
                  </div>

                  {/* Right: AI Challenge Support Socratic Box */}
                  <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-blue-100/80">
                        <span className="text-xs font-bold text-slate-900">
                          AI Challenge Support - {isChallengeCompleted ? "2/2 vòng (Đã hoàn tất)" : `${challengeRound}/2 vòng`}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1E3A8A]/10 text-[#1E3A8A]">
                          AI-assisted
                        </span>
                      </div>

                      {/* Question from AI */}
                      <div className="mt-2.5 p-3 rounded-lg bg-white border border-blue-100 text-xs text-slate-800 leading-relaxed">
                        <span className="font-bold text-[#1E3A8A] block mb-1">
                          {isChallengeCompleted ? "Tổng kết phản biện 2 vòng:" : `Vòng ${challengeRound}:`}
                        </span>
                        {isChallengeCompleted
                          ? "Bạn đã hoàn thành đủ 2 vòng thách thức tư duy Socratic. Luận điểm đã được ghi nhận vào bản đánh giá học tập."
                          : challengeRound === 1
                          ? "Trong bối cảnh áp lực sự cố, phương án này có thể giải quyết trước mắt nhưng nếu kéo dài quá 2 giờ sẽ gây ảnh hưởng gì tới các bộ phận liên quan?"
                          : "Một sinh viên gửi lại yêu cầu do chờ quá lâu. Làm thế nào để tránh ghi danh trùng mà vẫn bảo đảm tính công bằng?"}
                      </div>

                      {isChallengeCompleted && (
                        <div className="mt-2 text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200">
                          ✓ Hoàn tất phản biện 2/2 vòng · Không chấm điểm
                        </div>
                      )}
                    </div>

                    {/* Trigger Buttons */}
                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleOpenChallenge(isChallengeCompleted ? 2 : challengeRound)}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                        <span>
                          {isChallengeCompleted
                            ? "Xem lại phản biện AI (05.6)"
                            : `Mở đối thoại phản biện (Vòng ${challengeRound}/2)`}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Node 2 (Collapsed) */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
            <div
              onClick={() => setActiveNode(activeNode === 2 ? 0 : 2)}
              className="p-4 sm:p-5 bg-slate-50/60 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-xs sm:text-sm text-slate-800">
                  2 - Duy trì dịch vụ khi quá tải kéo dài
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-[#1E3A8A] border border-blue-200">
                  Degraded Mode
                </span>
              </div>
              <span className="text-slate-400 text-xs">{activeNode === 2 ? "▲" : "▼"}</span>
            </div>

            {activeNode === 2 && (
              <div className="p-5 sm:p-6 space-y-4 border-t border-slate-100">
                <div className="text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold block mb-1">Phương án đã chọn:</span>
                  Áp dụng Idempotency Key và tăng dần lưu lượng theo sức tải thực tế.
                </div>
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-slate-700">
                  <span className="font-bold text-[#1E3A8A] block mb-1">Hậu quả thực tế:</span>
                  Hạ tỷ lệ lỗi giao dịch từ 18.4% xuống 0.2%. Khách hàng không bị trừ tiền trùng lặp.
                </div>
              </div>
            )}
          </div>

          {/* Node 3 (Collapsed) */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
            <div
              onClick={() => setActiveNode(activeNode === 3 ? 0 : 3)}
              className="p-4 sm:p-5 bg-slate-50/60 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-xs sm:text-sm text-slate-800">
                  3 - Ổn định hệ thống, phục hồi có kiểm soát
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  Kết cục
                </span>
              </div>
              <span className="text-slate-400 text-xs">{activeNode === 3 ? "▲" : "▼"}</span>
            </div>

            {activeNode === 3 && (
              <div className="p-5 sm:p-6 space-y-4 border-t border-slate-100">
                <div className="text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold block mb-1">Kết quả chung cuộc:</span>
                  Hệ thống vượt qua cao điểm mua sắm Black Friday an toàn. Doanh thu giữ được 82.4% so với kỳ vọng, bảo toàn toàn vẹn dữ liệu giao dịch 100%.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 05.5 & 05.6 · MODAL SOCRATIC AI CHALLENGE SUPPORT                  */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {isChallengeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">AI Challenge Support</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1E3A8A]/10 text-[#1E3A8A]">
                    AI-assisted
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-snug">
                  {isChallengeCompleted
                    ? "Vòng 2/2 · Đã hoàn tất. Phiên phản biện đã kết thúc sau 2 vòng. Câu trả lời của bạn được lưu cùng lập luận ở bước 1. Không có điểm số."
                    : `Vòng ${challengeRound}/2 · Thách thức tư duy: Áp lực cạnh tranh & khách hàng. Trả lời câu hỏi phản biện để làm rõ lập luận của bạn. Tối đa 2 vòng, không chấm điểm.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsChallengeModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* If 05.6: Display Complete Dialogue Thread */}
            {isChallengeCompleted ? (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {/* Decision Anchor */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <span className="font-bold text-slate-500 text-[11px] block mb-0.5">
                    Quyết định của bạn tại bước 1:
                  </span>
                  Bật hàng đợi ảo, giới hạn lưu lượng thanh toán vào cơ sở dữ liệu.
                </div>

                {/* Round 1 AI Question */}
                <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 space-y-1">
                  <div className="text-[11px] font-bold text-[#1E3A8A]">
                    Vòng 1 - Câu hỏi phản biện từ AI
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed italic">
                    &ldquo;Giả định cốt lõi trong lập luận của bạn là khách hàng sẽ kiên nhẫn chờ trong hàng đợi ảo. Nếu đối thủ tung chiến dịch 'Thanh toán tức thì trong 3 giây', quyết định của bạn sẽ gây tổn thất thị phần như thế nào?&rdquo;
                  </p>
                </div>

                {/* Round 1 Student Answer */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[11px] font-bold text-slate-600">
                    Vòng 1 - Câu trả lời của bạn
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    {round1Answer}
                  </p>
                </div>

                {/* Round 2 AI Question */}
                <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 space-y-1">
                  <div className="text-[11px] font-bold text-[#1E3A8A]">
                    Vòng 2 - Câu hỏi phản biện từ AI
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed italic">
                    &ldquo;Mã ưu đãi giúp giữ chân khách, nhưng cũng làm tăng chi phí trong giờ cao điểm. Bạn dựa vào số liệu nào để biết khi nào lợi ích giữ khách lớn hơn chi phí đó?&rdquo;
                  </p>
                </div>

                {/* Round 2 Student Answer */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[11px] font-bold text-slate-600">
                    Vòng 2 - Câu trả lời của bạn
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    {round2Answer}
                  </p>
                </div>

                {/* Footer status & Close button */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">Vòng 2/2 · Đã hoàn tất · Không chấm điểm</span>
                  <button
                    type="button"
                    onClick={() => setIsChallengeModalOpen(false)}
                    className="px-5 py-2 text-xs font-bold text-white bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    Quay lại Journey Review
                  </button>
                </div>
              </div>
            ) : (
              /* 05.5: Interactive Dialog for Round 1 & Round 2 */
              <div className="space-y-4">
                {/* Context Anchor of Decision */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <span className="font-bold text-slate-500 text-[11px] block mb-0.5">
                    Quyết định của bạn tại bước 1:
                  </span>
                  Bật hàng đợi ảo, giới hạn lưu lượng thanh toán vào cơ sở dữ liệu.
                </div>

                {/* AI Socratic Challenge Question */}
                <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200/80 space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#1E3A8A] flex items-center gap-1.5">
                    <span>💬 Câu hỏi phản biện từ AI (Vòng {challengeRound})</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed italic">
                    {challengeRound === 1
                      ? "“Giả định cốt lõi trong lập luận của bạn là khách hàng sẽ kiên nhẫn chờ trong hàng đợi ảo. Tuy nhiên, nếu sàn thương mại điện tử đối thủ lập tức tung chiến dịch 'Thanh toán tức thì trong 3 giây', quyết định của bạn sẽ gây tổn thất thị phần như thế nào? Bạn có phương án dự phòng nào để bảo vệ trải nghiệm của khách hàng không?”"
                      : "“Mã ưu đãi giúp giữ chân khách, nhưng cũng làm tăng chi phí trong giờ cao điểm. Bạn dựa vào số liệu nào để biết khi nào lợi ích giữ khách lớn hơn chi phí đó?”"}
                  </p>
                </div>

                {/* Response Textarea */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-900">
                    Luận điểm phản hồi của bạn
                  </label>
                  <textarea
                    rows={4}
                    value={challengeInput}
                    onChange={(e) => setChallengeInput(e.target.value)}
                    placeholder="Trình bày luận điểm bảo vệ quyết định hoặc cơ chế dự phòng bổ sung..."
                    maxLength={1000}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 leading-relaxed placeholder:text-slate-400 focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] transition-all"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{challengeInput.length} / 1000 ký tự</span>
                    <span>Vòng {challengeRound}/2 · Tối đa 2 vòng phản biện</span>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChallengeCompleted(true);
                      setIsChallengeModalOpen(false);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Bỏ qua
                  </button>
                  <button
                    type="button"
                    onClick={handleSendChallengeAnswer}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    <span>Gửi phản hồi vòng {challengeRound}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
