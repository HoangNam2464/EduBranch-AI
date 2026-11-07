import { useState } from "react";
import { Link } from "react-router-dom";
import { EduBranchLogo } from "../components/ui";

export function LandingPage() {
  // Interactive core feature tabs
  const [activeFeatureTab, setActiveFeatureTab] = useState<number>(1);

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Newsletter email state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Quick CTA email state
  const [ctaEmail, setCtaEmail] = useState("");

  const subjectListRow1 = [
    { name: "Vật Lý", icon: "⚛️", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { name: "Hóa Học", icon: "🧪", color: "bg-teal-50 text-teal-700 border-teal-200" },
    { name: "Sinh Học", icon: "🌿", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { name: "Lịch Sử", icon: "📜", color: "bg-amber-50 text-amber-700 border-amber-200" },
    { name: "Địa Lý", icon: "🌍", color: "bg-sky-50 text-sky-700 border-sky-200" },
    { name: "Toán", icon: "📐", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    { name: "Ngữ Văn", icon: "📖", color: "bg-rose-50 text-rose-700 border-rose-200" },
    { name: "Vật Lý", icon: "⚛️", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { name: "Hóa Học", icon: "🧪", color: "bg-teal-50 text-teal-700 border-teal-200" },
    { name: "Sinh Học", icon: "🌿", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ];

  const subjectListRow2 = [
    { name: "Âm Nhạc", icon: "🎵", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
    { name: "Thể Dục", icon: "🏃", color: "bg-red-50 text-red-700 border-red-200" },
    { name: "Tiếng Anh", icon: "🌐", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { name: "Tin Học", icon: "💻", color: "bg-orange-50 text-orange-700 border-orange-200" },
    { name: "Công Nghệ", icon: "⚙️", color: "bg-slate-50 text-slate-700 border-slate-200" },
    { name: "GDCD", icon: "⚖️", color: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" },
    { name: "Mỹ Thuật", icon: "🎨", color: "bg-purple-50 text-purple-700 border-purple-200" },
    { name: "Âm Nhạc", icon: "🎵", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
    { name: "Thể Dục", icon: "🏃", color: "bg-red-50 text-red-700 border-red-200" },
  ];

  const faqList = [
    {
      q: "EduBranch AI hoạt động như thế nào?",
      a: "Hệ thống sử dụng kỹ thuật RAG (Retrieval-Augmented Generation) kết hợp với các mô hình ngôn ngữ lớn tiên tiến (Gemini 1.5/2.0). Khi bạn tải lên giáo trình hoặc tài liệu môn học (PDF/DOCX), hệ thống sẽ phân tích, lập chỉ mục và trích xuất đúng ngữ cảnh để soạn giáo án, đề thi và câu hỏi bám sát chuẩn kiến thức.",
    },
    {
      q: "Tài liệu tải lên có được bảo mật không?",
      a: "Tuyệt đối bảo mật. Mỗi người dùng được cấp một Workspace độc lập và mã hóa. Dữ liệu tài liệu giảng dạy của bạn không bao giờ được chia sẻ với bên thứ ba hoặc dùng để huấn luyện mô hình công cộng.",
    },
    {
      q: "Hệ thống hỗ trợ những định dạng tài liệu nào?",
      a: "EduBranch AI hỗ trợ toàn diện các định dạng tài liệu phổ biến trong giáo dục bao gồm: PDF, DOCX (Word), TXT với dung lượng tối đa lên đến 25MB cho mỗi tệp.",
    },
    {
      q: "AI có thể tạo ra những loại nội dung giảng dạy nào?",
      a: "Hệ thống hỗ trợ: Giáo án cấu trúc chuẩn theo quy định, ngân hàng câu hỏi trắc nghiệm phân bổ theo 6 cấp độ Bloom Taxonomy, bài tập tự luận có đáp án và rubric biểu điểm đánh giá chi tiết.",
    },
    {
      q: "Đề thi và giáo án xuất ra có chỉnh sửa được không?",
      a: "Có. Bạn có thể xem trước, chỉnh sửa trực tiếp trên giao diện web hoặc xuất ra tệp Word (.docx) và PDF với đầy đủ định dạng chuẩn sẵn sàng in ấn hoặc nộp cho tổ chuyên môn.",
    },
    {
      q: "Tôi có thể dùng thử miễn phí không?",
      a: "Có! Bạn có thể bắt đầu sử dụng miễn phí ngay lập tức với đầy đủ tính năng cốt lõi mà không cần nhập thẻ tín dụng.",
    },
  ];

  const toggleFaq = (idx: number) => {
    setExpandedFaq(expandedFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER / NAVIGATION BAR
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <EduBranchLogo size={36} />
            <span className="text-base font-bold text-slate-900 tracking-tight">
              EduBranch AI
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <div className="relative group cursor-pointer flex items-center gap-1 hover:text-[#059669] transition">
              <span>Tính năng</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            <a href="#how-it-works" className="hover:text-[#059669] transition">
              Hướng dẫn
            </a>
            <a href="#faq" className="hover:text-[#059669] transition">
              FAQ
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#059669] px-3 py-2 rounded-xl hover:bg-slate-50 transition"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="7" r="4" />
                <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
              </svg>
              <span>Đăng nhập</span>
            </Link>

            <Link
              to="/register"
              className="flex items-center gap-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-xs shadow-emerald-600/20"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span>Bắt đầu miễn phí</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-20 bg-gradient-to-b from-emerald-50/40 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-6 space-y-6">
              {/* Green Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#059669] border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse"></span>
                <span>Trợ lý AI dành riêng cho Giáo Viên K-12</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.2]">
                Soạn Giáo Án &{" "}
                <span className="text-[#059669]">Tạo Đề</span>
                <br />
                <span className="text-[#059669]">Thi với AI</span>
              </h1>

              {/* Subheadline */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                Tải lên tài liệu giảng dạy, AI sẽ phân tích và tự động tạo ra giáo án cấu trúc chuẩn, đề trắc nghiệm theo Bloom Taxonomy, câu hỏi tự luận — tất cả đều có trích dẫn nguồn rõ ràng. Giải phóng 80% thời gian soạn bài.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to="/register"
                  className="bg-[#059669] hover:bg-[#047857] text-white font-semibold px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 shadow-xs transition"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  <span>Bắt đầu miễn phí</span>
                </Link>

                <Link
                  to="/login"
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold px-4 py-2.5 rounded-xl text-xs inline-flex items-center gap-1.5 transition"
                >
                  <span>Đăng nhập</span>
                  <span>→</span>
                </Link>
              </div>

              {/* 3 Stats Row */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100">
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-[#059669]">80%</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Tiết kiệm thời gian soạn bài</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-[#059669]">6 cấp độ</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Bloom Taxonomy được tích hợp</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-[#059669]">100%</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Trích dẫn nguồn chính xác</p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Interactive Preview Card */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
                {/* Window header */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span className="text-[11px] font-semibold text-slate-600 ml-2">EduBranch AI</span>
                  </div>
                  <button className="text-[10px] font-bold text-[#059669] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    + UPLOAD
                  </button>
                </div>

                {/* Window Body */}
                <div className="p-6 space-y-6 text-center">
                  {/* Step progress bar */}
                  <div className="flex items-center justify-between max-w-xs mx-auto text-xs font-bold text-slate-400 relative">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-[10px]">1</div>
                    <div className="h-0.5 flex-1 bg-blue-600"></div>
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px]">2</div>
                    <div className="h-0.5 flex-1 bg-emerald-500"></div>
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#059669] text-white text-[10px]">3</div>
                    <div className="h-0.5 flex-1 bg-slate-200"></div>
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-[10px]">4</div>
                  </div>

                  {/* Big Green Success Checkmark */}
                  <div className="py-4 space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Nội dung giảng dạy đã sẵn sàng!
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Tất cả nội dung được trích dẫn nguồn từ tài liệu của bạn
                      </p>
                    </div>

                    {/* 4 Quick Pills */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Giáo Án Cấu Trúc
                      </span>
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                        Đề Trắc Nghiệm
                      </span>
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                        Câu Hỏi Tự Luận
                      </span>
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        Rubric Chấm Điểm
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. SUBJECTS BADGE TICKER BAR
      ───────────────────────────────────────────────────────────── */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#059669] border border-emerald-200">
            <span>✨ PHÙ HỢP MỌI MÔN HỌC</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Dành cho giáo viên <span className="text-[#059669]">mọi bộ môn K-12</span>
          </h2>

          {/* Row 1 of badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3">
            {subjectListRow1.map((s, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs ${s.color}`}
              >
                <span>{s.icon}</span>
                <span>{s.name}</span>
              </span>
            ))}
          </div>

          {/* Row 2 of badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            {subjectListRow2.map((s, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs ${s.color}`}
              >
                <span>{s.icon}</span>
                <span>{s.name}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. CORE FEATURES SECTION (TÍNH NĂNG CỐT LÕI)
      ───────────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#059669] border border-emerald-200">
              ✨ Tính Năng Cốt Lõi
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Mọi công cụ giáo viên cần để <span className="text-[#059669]">giảng dạy hiệu quả</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Kết hợp sức mạnh của RAG (Retrieval-Augmented Generation) và mô hình Gemini AI, giúp bạn tạo ra tài liệu giảng dạy chuẩn xác nhất.
            </p>
          </div>

          {/* Interactive Feature Demo Box */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Tabs */}
            <div className="lg:col-span-4 space-y-3">
              <button
                type="button"
                onClick={() => setActiveFeatureTab(0)}
                className={`w-full text-left p-4 rounded-xl border transition cursor-pointer ${
                  activeFeatureTab === 0
                    ? "bg-white border-[#059669] shadow-xs"
                    : "bg-white/60 border-slate-200 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activeFeatureTab === 0 ? "bg-emerald-50 text-[#059669]" : "bg-slate-100 text-slate-500"}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Upload & Xây dựng Kiến thức</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Tải tệp PDF/DOCX tạo kho tài liệu</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveFeatureTab(1)}
                className={`w-full text-left p-4 rounded-xl border transition cursor-pointer ${
                  activeFeatureTab === 1
                    ? "bg-white border-[#059669] shadow-xs"
                    : "bg-white/60 border-slate-200 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activeFeatureTab === 1 ? "bg-emerald-50 text-[#059669]" : "bg-slate-100 text-slate-500"}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Soạn Giáo Án AI</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">AI truy xuất kiến thức và tạo giáo án cấu trúc chuẩn</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveFeatureTab(2)}
                className={`w-full text-left p-4 rounded-xl border transition cursor-pointer ${
                  activeFeatureTab === 2
                    ? "bg-white border-[#059669] shadow-xs"
                    : "bg-white/60 border-slate-200 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activeFeatureTab === 2 ? "bg-emerald-50 text-[#059669]" : "bg-slate-100 text-slate-500"}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Tạo Đề Trắc Nghiệm</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Sinh câu hỏi theo 6 cấp độ Bloom</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Middle Preview Card */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
                  <span className="text-xs font-bold text-slate-900">AI Lesson Planner</span>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                  ✓ Chuẩn Bộ GD&ĐT
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-800 block">1. Mục tiêu bài dạy</span>
                  <span className="text-slate-500 text-[11px] mt-0.5 block">Nêu rõ kiến thức, năng lực và phẩm chất cần hình thành.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-800 block">2. Hoạt động khởi động & Khám phá</span>
                  <span className="text-slate-500 text-[11px] mt-0.5 block">Tình huống thực tế dẫn nhập vào bài học.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-800 block">3. Luyện tập & Vận dụng</span>
                  <span className="text-slate-500 text-[11px] mt-0.5 block">Hệ thống bài tập kèm thang đo đánh giá.</span>
                </div>
              </div>
            </div>

            {/* Right Bullet List */}
            <div className="lg:col-span-3 space-y-4 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center font-bold text-[10px] mt-0.5">
                  ✓
                </div>
                <div>
                  <h5 className="font-bold text-slate-900">Bloom Taxonomy Tích Hợp</h5>
                  <p className="text-slate-500 text-[11px] mt-0.5">Tự động phân bổ đúng tỷ lệ nhận biết, thông hiểu, vận dụng.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center font-bold text-[10px] mt-0.5">
                  ✓
                </div>
                <div>
                  <h5 className="font-bold text-slate-900">Trích Dẫn Nguồn Chính Xác</h5>
                  <p className="text-slate-500 text-[11px] mt-0.5">Mọi dữ kiện đều dẫn chiếu số trang từ giáo trình tải lên.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center font-bold text-[10px] mt-0.5">
                  ✓
                </div>
                <div>
                  <h5 className="font-bold text-slate-900">Xem Lại, Sửa & Xuất Word/PDF</h5>
                  <p className="text-slate-500 text-[11px] mt-0.5">Xuất tệp chuẩn định dạng A4, sẵn sàng in và giảng dạy.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 pt-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#059669]">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Nội dung tài liệu được xử lý hoàn toàn riêng biệt theo từng Workspace — không có chia sẻ dữ liệu giữa các tài khoản.</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. 4-STEP PROCESS (TỪ TÀI LIỆU ĐẾN BÀI GIẢNG TRONG 4 BƯỚC)
      ───────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#059669] border border-emerald-200">
              ✨ Quy Trình
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Từ tài liệu đến bài giảng <span className="text-[#059669]">trong 4 bước đơn giản</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Quy trình khép kín giúp giáo viên tiết kiệm hàng giờ chuẩn bị bài mỗi tuần.
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center font-bold">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Upload Tài Liệu</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tải lên tài liệu giảng dạy (PDF, DOCX). Hệ thống tự động phân tích cấu trúc, phân đoạn và lập chỉ mục vector.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[10px]">
                <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-blue-50/60 text-blue-800">
                  <span>📄 Sách giáo khoa Toán 10.pdf</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-emerald-50/60 text-emerald-800">
                  <span>📄 Giáo án mẫu Chương 3.docx</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-purple-50/60 text-purple-800">
                  <span>📄 Đề cương ôn tập HK1.txt</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center font-bold">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">RAG Retrieval</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Khi yêu cầu AI tạo nội dung, hệ thống RAG tự động truy xuất đoạn văn bản liên quan nhất từ tài liệu của bạn.
                </p>
              </div>

              <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-100 text-[10px]">
                <span className="px-2 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">Khái niệm chính</span>
                <span className="px-2 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">Định nghĩa</span>
                <span className="px-2 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">Công thức</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center font-bold">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">AI Tạo Nội Dung</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Gemini AI sử dụng nội dung truy xuất để tạo giáo án, đề trắc nghiệm, câu hỏi tự luận — chính xác và có cơ sở.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[10px] space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Tiến độ</span>
                  <span className="font-bold text-[#059669]">100%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#059669] h-full w-full rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center font-bold">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                    04
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Chỉnh Sửa & Xuất</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Xem xét, chỉnh sửa nội dung AI tạo ra, sau đó xuất Word hoặc PDF chuyên nghiệp, sẵn sàng sử dụng.
                </p>
              </div>

              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-center text-[11px] text-[#059669] font-bold">
                ⭐⭐⭐ Sẵn sàng sử dụng
              </div>
            </div>
          </div>

          {/* Stepper Status Bar */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <span className="w-10 h-2 rounded-full bg-emerald-400"></span>
            <span className="w-10 h-2 rounded-full bg-emerald-400"></span>
            <span className="w-10 h-2 rounded-full bg-emerald-400"></span>
            <span className="w-14 h-3 rounded-full bg-[#059669]"></span>
            <span className="text-xs font-bold text-[#059669] ml-2">Sẵn sàng xuất bản!</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. TESTIMONIALS SECTION (ĐƯỢC GIÁO VIÊN TIN TƯỞNG)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#059669] border border-emerald-200">
              ✨ Đánh Giá
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Được giáo viên <span className="text-[#059669]">tin tưởng sử dụng</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Hàng trăm giảng viên và sinh viên đã tối ưu thời gian học tập và giảng dạy mỗi tuần nhờ EduBranch AI.
            </p>
          </div>

          {/* Testimonial Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-2xl text-emerald-400 font-serif">“</span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  "Bloom Taxonomy tích hợp sẵn giúp tôi phân bổ câu hỏi đúng cấp độ tư duy. Đề thi cân đối hơn nhiều so với trước."
                </p>
              </div>

              <div>
                <div className="text-amber-400 text-xs mb-3">★★★★★</div>
                <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs">
                    LH
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Lê Thị Hương</h5>
                    <p className="text-[10px] text-slate-400">Giáo viên Ngữ văn - THPT Nguyễn Trãi</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-2xl text-emerald-400 font-serif">“</span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  "Tôi đặc biệt thích chức năng xuất Word/PDF. Giáo án và đề thi được format chuyên nghiệp, sẵn sàng nộp cho tổ bộ môn."
                </p>
              </div>

              <div>
                <div className="text-amber-400 text-xs mb-3">★★★★★</div>
                <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                    PD
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Phạm Đức Huy</h5>
                    <p className="text-[10px] text-slate-400">Giáo viên Hóa học - THPT Quốc Học Huế</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-2xl text-emerald-400 font-serif">“</span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  "Upload tài liệu lên là có workspace riêng cho từng lớp rất tiện. Mỗi lớp có bộ kiến thức riêng, AI tạo nội dung đúng trọng tâm."
                </p>
              </div>

              <div>
                <div className="text-amber-400 text-xs mb-3">★★★★★</div>
                <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                    HT
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Hoàng Thị Mai</h5>
                    <p className="text-[10px] text-slate-400">Giáo viên Tiếng Anh - THCS Yên Hòa</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-200"></span>
            <span className="w-6 h-2 rounded-full bg-[#059669]"></span>
            <span className="w-2 h-2 rounded-full bg-slate-200"></span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. FAQ SECTION (NHỮNG CÂU HỎI THƯỜNG GẶP)
      ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-3">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#059669] border border-emerald-200">
              ✨ Hỏi Đáp
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Những câu hỏi <span className="text-[#059669]">thường gặp</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Mọi điều bạn cần biết về nền tảng EduBranch AI.
            </p>
          </div>

          {/* Accordion List */}
          <div className="space-y-3">
            {faqList.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-slate-800 hover:text-[#059669] cursor-pointer transition"
                  >
                    <span>{faq.q}</span>
                    <span className="text-slate-400 text-xs ml-4">
                      {isOpen ? "▲" : "▼"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. LARGE GREEN CTA BANNER
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#059669] via-[#10B981] to-[#047857] text-white p-8 sm:p-12 text-center space-y-6 shadow-xl shadow-emerald-700/20">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mx-auto text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Tiết kiệm 80% thời gian soạn bài ngay hôm nay
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                Tham gia cùng hàng nghìn giáo viên Việt Nam đang sử dụng AI để tạo ra giáo án chất lượng cao, đề thi sáng tạo và tài liệu giảng dạy chuyên nghiệp.
              </p>
            </div>

            {/* Quick Email Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Cảm ơn bạn đã quan tâm! Vui lòng bấm Đăng ký để bắt đầu trải nghiệm ngay.");
              }}
              className="flex items-center justify-center gap-2 max-w-md mx-auto"
            >
              <input
                type="email"
                value={ctaEmail}
                onChange={(e) => setCtaEmail(e.target.value)}
                placeholder="Nhập email của bạn..."
                className="w-full bg-white text-slate-800 text-xs px-4 py-2.5 rounded-xl outline-none placeholder-slate-400"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
              >
                →
              </button>
            </form>

            <p className="text-[11px] text-emerald-100/80">
              Không cần thẻ tín dụng · Cài đặt trong 5 phút · Bảo mật dữ liệu tuyệt đối
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. NEWSLETTER SUBSCRIPTION SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-slate-50/50 border-t border-slate-100 text-center">
        <div className="max-w-xl mx-auto px-4 space-y-4">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center mx-auto">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-slate-900">
            Nhận thông tin cập nhật sớm nhất
          </h3>
          <p className="text-xs text-slate-500">
            Đăng ký để nhận thông báo về tính năng mới, tips giảng dạy với AI và tài nguyên dành riêng cho giáo viên.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubscribed(true);
            }}
            className="flex items-center gap-2 max-w-md mx-auto pt-2"
          >
            <div className="relative w-full">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="email@truong.edu.vn"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
              />
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 absolute right-3 top-2.5">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <button
              type="submit"
              className="bg-[#059669] hover:bg-[#047857] text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
            >
              {subscribed ? "Đã đăng ký!" : "Gửi"}
            </button>
          </form>

          <p className="text-[10px] text-slate-400 pt-1">
            Chúng tôi tôn trọng quyền riêng tư của bạn. Hủy đăng ký bất cứ lúc nào.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10. FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-100 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <EduBranchLogo size={28} />
                <span className="text-sm font-bold text-slate-900">EduBranch AI</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                Nền tảng AI hỗ trợ học tập tình huống thực nghiệm, ra quyết định và phản biện thông minh dành cho giảng viên và sinh viên.
              </p>
              <div className="flex items-center gap-2 pt-2 text-slate-400">
                <span className="p-1.5 rounded-lg border border-slate-200 text-xs">✉</span>
                <span className="p-1.5 rounded-lg border border-slate-200 text-xs">🔗</span>
              </div>
            </div>

            {/* Links 1: Sản phẩm */}
            <div className="space-y-2 text-xs">
              <h5 className="font-bold text-slate-900">Sản phẩm</h5>
              <ul className="space-y-1.5 text-slate-500">
                <li><a href="#features" className="hover:text-[#059669]">Tính năng</a></li>
                <li><a href="#how-it-works" className="hover:text-[#059669]">Hướng dẫn</a></li>
                <li><a href="#faq" className="hover:text-[#059669]">FAQ</a></li>
              </ul>
            </div>

            {/* Links 2: Tính năng */}
            <div className="space-y-2 text-xs">
              <h5 className="font-bold text-slate-900">Tính năng</h5>
              <ul className="space-y-1.5 text-slate-500">
                <li><a href="#" className="hover:text-[#059669]">Không gian làm việc</a></li>
                <li><a href="#" className="hover:text-[#059669]">Soạn Giáo Án AI</a></li>
                <li><a href="#" className="hover:text-[#059669]">Tạo Đề Thi & Câu Hỏi AI</a></li>
                <li><a href="#" className="hover:text-[#059669]">Tài Liệu & Kho Tri Thức</a></li>
              </ul>
            </div>

            {/* Links 3: Pháp lý & Quản trị */}
            <div className="space-y-2 text-xs">
              <h5 className="font-bold text-slate-900">Hệ thống</h5>
              <ul className="space-y-1.5 text-slate-500">
                <li><a href="#" className="hover:text-[#059669]">Điều khoản dịch vụ</a></li>
                <li><a href="#" className="hover:text-[#059669]">Chính sách bảo mật</a></li>
                <li className="pt-1">
                  <Link
                    to="/admin/login"
                    className="hover:text-[#059669] text-slate-700 font-semibold inline-flex items-center gap-1 transition"
                  >
                    <span>🛡️ Cổng Quản trị viên</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-100 text-[11px] text-slate-400">
            <span>© 2026 EduBranch AI. Bảo lưu mọi quyền.</span>
            <span>Tạo ra với ❤️ dành cho giảng viên và sinh viên Việt Nam</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
