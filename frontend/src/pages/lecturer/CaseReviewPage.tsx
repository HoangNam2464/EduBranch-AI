/**
 * CaseReviewPage — Giảng viên · Trình chỉnh sửa Case Study
 * Figma Specs:
 * - 03.4: Trình chỉnh sửa Branching Study (Form Editor + Danh sách tình huống + Kiểm tra cây)
 * - 03.5: Trình chỉnh sửa Review Study (Bối cảnh & số liệu + Vấn đề phân tích + Sinh viên sẽ trả lời)
 * - 03.6: Thanh duyệt Case Study (4 trạng thái: Bản nháp -> Đã rà soát -> Đã phê duyệt -> Đã xuất bản)
 * - 03.7: Hộp thoại phê duyệt và xuất bản
 * Route: /lecturer/cases/:caseId/review
 */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";
import { CaseGovernanceBar, GovernanceStatus } from "../../components/lecturer/CaseGovernanceBar";

interface OptionItem {
  id: string;
  label: string;
  description: string;
  nextNodeId: string;
  nextNodeTitle: string;
  consequence: string;
}

export function CaseReviewPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  // Mode: BRANCHING_STUDY (03.4) vs REVIEW_STUDY (03.5)
  const [learningMode, setLearningMode] = useState<"BRANCHING_STUDY" | "REVIEW_STUDY">(
    caseId?.includes("review") || caseId === "c3" || caseId === "c5"
      ? "REVIEW_STUDY"
      : "BRANCHING_STUDY"
  );

  // Governance Status state (03.6)
  const [governanceStatus, setGovernanceStatus] = useState<GovernanceStatus>("REVIEWED");
  const [saving, setSaving] = useState(false);

  // ── BRANCHING STUDY STATE (Figma 03.4) ──
  const [branchingTitle, setBranchingTitle] = useState(
    "Khủng hoảng sập mạng lưới trung tâm dữ liệu và tấn công DDoS"
  );
  const [situationTitle, setSituationTitle] = useState(
    "Tình huống 1: Phát hiện bất thường lưu lượng và cảnh báo xâm nhập mức nghiêm trọng (Level 5)"
  );
  const [promptQuestion, setPromptQuestion] = useState(
    "Với tư cách là Trưởng nhóm Ứng cứu khẩn cấp (Incident Response Lead), bước xử lý đầu tiên của bạn là gì?"
  );
  const [isKeyDecision, setIsKeyDecision] = useState(true);
  const [situationContent, setSituationContent] = useState(
    "Hệ thống SOC (Security Operations Center) phát hiện 2.5 triệu request/phút nhắm vào API đăng nhập sinh trắc học. 15 máy chủ backend ghi nhận CPU chạm mốc 99%. Đội ngũ an ninh nghi ngờ đây là đòn tấn công kép (DDoS kết hợp khai thác lỗ hổng Zero-day)."
  );
  const [options, setOptions] = useState<OptionItem[]>([
    {
      id: "opt1",
      label: "Phương án A: Chuyển toàn bộ lưu lượng qua dịch vụ chống DDoS Cloudflare/AWS Shield và bật chế độ xác thực CAPTCHA khắt khe",
      description: "Chặn đứng lưu lượng độc hại ở tầng mạng biên (Edge).",
      nextNodeId: "n2",
      nextNodeTitle: "Tình huống 2: Phân tích nguồn tấn công & Tối ưu hóa xác thực khách hàng thật",
      consequence: "Lọc được 95% lưu lượng rác, giải phóng tài nguyên CPU cho các máy chủ chính. Một số ít người dùng phản ánh CAPTCHA gây khó chịu nhưng dịch vụ tiếp tục hoạt động.",
    },
    {
      id: "opt2",
      label: "Phương án B: Tạm thời cô lập hoàn toàn cụm máy chủ xác thực sinh trắc học để rà soát mã độc bên trong",
      description: "Ưu tiên phòng chống rò rỉ dữ liệu nhạy cảm của khách hàng.",
      nextNodeId: "n3",
      nextNodeTitle: "Tình huống 3: Khôi phục dịch vụ sau cô lập & Khủng hoảng truyền thông",
      consequence: "Ngăn chặn nguy cơ rò rỉ dữ liệu, nhưng khiến toàn bộ dịch vụ ngân hàng số bị gián đoạn hoàn toàn trong 45 phút đầu.",
    },
  ]);

  const otherNodes = [
    { id: "n2", title: "Tình huống 2: Phân tích nguồn tấn công & Tối ưu hóa xá..." },
    { id: "n3", title: "Tình huống 3: Khôi phục dịch vụ sau cô lập & Khủng hoả..." },
    { id: "term1", title: "Kết quả 1: Hệ thống đứng vững, bảo toàn dữ liệu tài khoản" },
    { id: "term2", title: "Kết quả 2: Thiệt hại dịch vụ ngắn hạn, rò rỉ 1.200 bản ghi" },
    { id: "term3", title: "Kết quả 3: Gián đoạn diện rộng, chịu phạt vi phạm SLA" },
  ];

  // ── REVIEW STUDY STATE (Figma 03.5) ──
  const [reviewTitle, setReviewTitle] = useState("Tối ưu chiến dịch ra mắt ví điện tử NovaPay");
  const [reviewShortDesc, setReviewShortDesc] = useState(
    "Phân tích số liệu 4 tuần thử nghiệm và đề xuất cách phân bổ ngân sách kênh."
  );
  const [reviewContext, setReviewContext] = useState(
    "NovaPay chuẩn bị ra mắt ví điện tử cho sinh viên tại các thành phố lớn. Sau 4 tuần thử nghiệm truyền thông, lượt tiếp cận tăng nhưng tỷ lệ kích hoạt tài khoản vẫn thấp. Nhóm marketing cần phân bổ lại ngân sách cho 2 tuần tiếp theo để tăng số người dùng thực sự hoàn tất giao dịch đầu tiên."
  );
  const [reviewProblem, setReviewProblem] = useState(
    "Đề xuất kế hoạch phân bổ 120 triệu VNĐ trong 2 tuần để cải thiện tỷ lệ kích hoạt, hướng tới 1.500 người dùng có giao dịch đầu tiên. Cần nêu rõ hành động theo kênh, cách đo lường và rủi ro khi mở rộng chiến dịch."
  );
  const [reviewCourseName, setReviewCourseName] = useState("Marketing số");
  const [studentQuestions, setStudentQuestions] = useState([
    "1. Đề xuất phương án / kế hoạch giải quyết",
    "2. Lập luận căn cứ (dựa trên số liệu và kiến thức học phần)",
  ]);

  useEffect(() => {
    fetchCaseData();
  }, [caseId]);

  async function fetchCaseData() {
    if (!caseId) return;
    try {
      const res = await apiClient.get(`/cases/${caseId}`);
      if (res.data?.data) {
        const c = res.data.data;
        if (c.learning_mode) setLearningMode(c.learning_mode);
        if (c.status) setGovernanceStatus(c.status);
        if (c.title) {
          if (c.learning_mode === "REVIEW_STUDY") setReviewTitle(c.title);
          else setBranchingTitle(c.title);
        }
      }
    } catch {}
  }

  // ── Governance Actions (Figma 03.6 & 03.7) ──
  async function handleSaveReviewed() {
    try {
      setSaving(true);
      if (caseId) {
        await apiClient.patch(`/cases/${caseId}/status`, { status: "REVIEWED" });
      }
      setGovernanceStatus("REVIEWED");
    } catch {
      setGovernanceStatus("REVIEWED");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveDraft() {
    try {
      setSaving(true);
      if (caseId) {
        await apiClient.put(`/cases/${caseId}`, {
          title: learningMode === "REVIEW_STUDY" ? reviewTitle : branchingTitle,
        });
      }
    } catch {
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove() {
    try {
      if (caseId) {
        await apiClient.patch(`/cases/${caseId}/status`, { status: "APPROVED" });
      }
      setGovernanceStatus("APPROVED");
    } catch {
      setGovernanceStatus("APPROVED");
    }
  }

  async function handleConfirmPublish(deadline?: string) {
    try {
      if (caseId) {
        await apiClient.patch(`/cases/${caseId}/status`, { status: "PUBLISHED" });
      }
      setGovernanceStatus("PUBLISHED");
    } catch {
      setGovernanceStatus("PUBLISHED");
    }
  }

  async function handleRevertToDraft() {
    try {
      if (caseId) {
        await apiClient.patch(`/cases/${caseId}/status`, { status: "DRAFT" });
      }
      setGovernanceStatus("DRAFT");
    } catch {
      setGovernanceStatus("DRAFT");
    }
  }

  const directStudentLink =
    learningMode === "REVIEW_STUDY"
      ? `edubranch.duytan.edu.vn/student/cases/${caseId || "novapay"}/review-study`
      : `edubranch.duytan.edu.vn/student/cases/${caseId || "c8f9a2"}/branching-play`;

  return (
    <div className="flex flex-col gap-5 relative pb-28">
      {/* ── Top Header Context & Mode Switcher ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/lecturer/cases")}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 cursor-pointer transition"
          >
            ←
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              {learningMode === "REVIEW_STUDY" ? reviewTitle : branchingTitle}
            </h2>
            <p className="text-xs text-slate-400">
              Case Study &gt; {learningMode === "REVIEW_STUDY" ? "Trình chỉnh sửa Review Study" : "Trình chỉnh sửa"}
            </p>
          </div>
        </div>

        {/* Mode Toggle Pill */}
        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setLearningMode("BRANCHING_STUDY")}
            className={`rounded-lg px-3 py-1 font-semibold transition ${
              learningMode === "BRANCHING_STUDY"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Branching Study (03.4)
          </button>
          <button
            type="button"
            onClick={() => setLearningMode("REVIEW_STUDY")}
            className={`rounded-lg px-3 py-1 font-semibold transition ${
              learningMode === "REVIEW_STUDY"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Review Study (03.5)
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODE 1: BRANCHING STUDY EDITOR (Figma 03.4)                           */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {learningMode === "BRANCHING_STUDY" ? (
        <div className="flex items-start gap-6">
          {/* Left Column: Form Editor (~65%) */}
          <div className="flex-1 space-y-5 min-w-0">
            {/* Card 1: Tình huống & Tiêu đề */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">Tình huống</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  ✨ AI Draft
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề tình huống <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={situationTitle}
                  onChange={(e) => setSituationTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#1E3A8A] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Câu hỏi gợi ý lựa chọn
                </label>
                <input
                  type="text"
                  value={promptQuestion}
                  onChange={(e) => setPromptQuestion(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#1E3A8A]"
                />
              </div>

              {/* Toggle: Quyết định then chốt */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Đánh dấu là quyết định then chốt
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsKeyDecision(!isKeyDecision)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      isKeyDecision ? "bg-[#1E3A8A]" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        isKeyDecision ? "translate-x-4.5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                  Quyết định này được làm nổi bật trong Journey Review. Sinh viên được khuyến khích viết lập luận cho bước này; phản biện cùng AI là tùy chọn.
                </p>
              </div>
            </div>

            {/* Card 2: Nội dung tình huống chi tiết */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
              <label className="block text-xs font-bold text-slate-900">
                Nội dung tình huống chi tiết <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={situationContent}
                onChange={(e) => setSituationContent(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 outline-none focus:border-[#1E3A8A] leading-relaxed resize-none"
              />
            </div>

            {/* Card 3: Các phương án lựa chọn */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900">Các phương án lựa chọn ({options.length})</h3>
                <p className="text-[11px] text-slate-400">
                  Mỗi phương án dẫn tới một tình huống tiếp theo và chứa hậu quả tương ứng
                </p>
              </div>

              <div className="space-y-4">
                {options.map((opt, idx) => (
                  <div
                    key={opt.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-900">
                        Phương án {idx + 1}
                      </span>
                      <button
                        onClick={() => setOptions(options.filter((o) => o.id !== opt.id))}
                        className="text-slate-300 hover:text-red-500 text-xs cursor-pointer p-1"
                        title="Xóa phương án"
                      >
                        🗑️
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Tiêu đề nhãn lựa chọn <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={opt.label}
                        onChange={(e) => {
                          const updated = [...options];
                          updated[idx].label = e.target.value;
                          setOptions(updated);
                        }}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#1E3A8A]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Mô tả hành động của phương án
                      </label>
                      <input
                        type="text"
                        value={opt.description}
                        onChange={(e) => {
                          const updated = [...options];
                          updated[idx].description = e.target.value;
                          setOptions(updated);
                        }}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#1E3A8A]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Tình huống tiếp theo khi chọn phương án này <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={opt.nextNodeId}
                        onChange={(e) => {
                          const updated = [...options];
                          updated[idx].nextNodeId = e.target.value;
                          setOptions(updated);
                        }}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#1E3A8A] bg-white cursor-pointer"
                      >
                        <option value="n2">Tình huống 2: Phân tích nguồn tấn công &amp; Tối ưu hóa xác thực khách hàng thật</option>
                        <option value="n3">Tình huống 3: Khôi phục dịch vụ sau cô lập &amp; Khủng hoảng truyền thông</option>
                        <option value="term1">Kết quả 1: Hệ thống đứng vững, bảo toàn dữ liệu</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Hậu quả (do giảng viên xác định) <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        value={opt.consequence}
                        onChange={(e) => {
                          const updated = [...options];
                          updated[idx].consequence = e.target.value;
                          setOptions(updated);
                        }}
                        className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 outline-none focus:border-[#1E3A8A] resize-none"
                      />
                      <p className="mt-1 text-[10px] text-slate-400">
                        Chỉ hiển thị cho sinh viên trong Journey Review, không hiển thị khi đang làm bài
                      </p>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setOptions([
                      ...options,
                      {
                        id: `opt-${Date.now()}`,
                        label: "Phương án mới...",
                        description: "Mô tả phương án mới",
                        nextNodeId: "n2",
                        nextNodeTitle: "Tình huống tiếp theo",
                        consequence: "Hậu quả của quyết định này...",
                      },
                    ])
                  }
                  className="w-full rounded-xl border-2 border-dashed border-slate-200 py-3 text-xs font-bold text-slate-600 hover:border-[#1E3A8A] hover:text-[#1E3A8A] hover:bg-blue-50/20 transition cursor-pointer"
                >
                  + Thêm phương án
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Node List + Topology (~35%) */}
          <div className="w-[360px] flex-shrink-0 space-y-4">
            {/* Box 1: Danh sách tình huống */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900">Danh sách tình huống (6)</h4>

              <div className="rounded-xl border border-blue-300 bg-blue-50/40 p-3.5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E3A8A]">
                  Tình huống đang chỉnh sửa · Step 1 · Then chốt
                </span>
                <p className="text-xs font-bold text-slate-900 leading-snug">
                  {situationTitle}
                </p>
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-slate-400 block font-semibold">Nhánh đi tiếp:</span>
                  <div className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[11px] text-slate-700 font-medium">
                    Chống DDoS tại Edge &rarr; Tình huống 2
                  </div>
                  <div className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[11px] text-slate-700 font-medium">
                    Cô lập máy chủ &rarr; Tình huống 3
                  </div>
                  <button className="text-[11px] text-blue-600 hover:underline pt-1 block cursor-pointer">
                    + Thêm phương án
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                {otherNodes.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 text-xs hover:bg-slate-100 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-slate-300 font-bold select-none">≡</span>
                      <span className="font-semibold text-slate-700 truncate">{n.title}</span>
                    </div>
                    <button className="text-slate-300 hover:text-red-500 p-0.5">
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              <button className="w-full rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer">
                + Thêm tình huống
              </button>
            </div>

            {/* Box 2: Kiểm tra cây quyết định */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-2 text-xs">
              <h4 className="text-xs font-bold text-slate-900">Kiểm tra cây quyết định</h4>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span>🌱</span>
                  <span>Topology: 6 nút · 3 tình huống · 3 kết quả</span>
                </span>
                <span className="text-slate-300">✓</span>
              </div>
              <div className="flex items-center justify-between text-emerald-700 bg-[#E6F4EA] border border-[#DEF7EC] rounded-lg p-2 font-medium">
                <span className="flex items-center gap-1.5">
                  <span>✓</span>
                  <span>Kiểm tra cây: 0 lỗi cấu trúc</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════════════ */
        /* MODE 2: REVIEW STUDY EDITOR (Figma 03.5)                              */
        /* ══════════════════════════════════════════════════════════════════════ */
        <div className="flex items-start gap-6">
          {/* Left Column: Form Editor (~65%) */}
          <div className="flex-1 space-y-5 min-w-0">
            {/* Card 1: Nội dung Review Study */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900">Nội dung Review Study</h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề case <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#1E3A8A] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mô tả ngắn
                </label>
                <input
                  type="text"
                  value={reviewShortDesc}
                  onChange={(e) => setReviewShortDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#1E3A8A]"
                />
              </div>
            </div>

            {/* Card 2: Bối cảnh & số liệu */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
              <label className="block text-xs font-bold text-slate-900">
                Bối cảnh &amp; số liệu <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={reviewContext}
                onChange={(e) => setReviewContext(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 outline-none focus:border-[#1E3A8A] leading-relaxed resize-none"
              />
            </div>

            {/* Card 3: Vấn đề cần phân tích */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
              <label className="block text-xs font-bold text-slate-900">
                Vấn đề cần phân tích <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={reviewProblem}
                onChange={(e) => setReviewProblem(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 outline-none focus:border-[#1E3A8A] leading-relaxed resize-none"
              />
            </div>
          </div>

          {/* Right Column: Case info & Sinh viên sẽ trả lời (~35%) */}
          <div className="w-[360px] flex-shrink-0 space-y-4">
            {/* Card 1: Thông tin case */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900">Thông tin case</h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Chế độ:</span>
                  <span className="font-semibold text-slate-900">Review Study</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Khóa học:</span>
                  <span className="font-semibold text-slate-900">{reviewCourseName}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Trạng thái:</span>
                  <span className="font-semibold text-[#1E3A8A]">
                    {governanceStatus === "DRAFT"
                      ? "Bản nháp"
                      : governanceStatus === "REVIEWED"
                      ? "Đã rà soát"
                      : governanceStatus === "APPROVED"
                      ? "Đã phê duyệt"
                      : "Đã xuất bản"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Phiên bản:</span>
                  <span className="font-mono text-slate-700">v1</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Cấu trúc:</span>
                  <span className="text-slate-600">Không dùng cây quyết định</span>
                </div>
              </div>
            </div>

            {/* Card 2: Sinh viên sẽ trả lời */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900">Sinh viên sẽ trả lời</h4>
              <div className="space-y-2">
                {studentQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-700 font-medium"
                  >
                    {q}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 03.6 THANH KIỂM DUYỆT 4 BƯỚC & 03.7 MODAL XUẤT BẢN                  */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <CaseGovernanceBar
        status={governanceStatus}
        mode={learningMode}
        version="v1"
        directLink={directStudentLink}
        saving={saving}
        onSaveReviewed={handleSaveReviewed}
        onSaveDraft={handleSaveDraft}
        onApprove={handleApprove}
        onConfirmPublish={handleConfirmPublish}
        onRevertToDraft={handleRevertToDraft}
      />
    </div>
  );
}
