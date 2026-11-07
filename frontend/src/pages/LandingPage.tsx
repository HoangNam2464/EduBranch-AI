import { useState } from "react";
import { Link } from "react-router-dom";
import { EduBranchLogo, Button } from "../components/ui";

/**
 * EduBranch AI — Landing Page (00.2 · Chung · Trang giới thiệu)
 *
 * Implements Figma master template:
 * - Academic university-level focus (Business, Law, Medicine, CS, Finance)
 * - Zero K-12 elements, zero emojis, zero raw ASCII symbols
 * - 4-Pillar Pedagogical Architecture: RAG Grounding, Branching DAG, Journey Review, Socratic AI
 * - Dual Learning Modes: Branching Study (Teal) vs Review Study (Pink)
 */
export function LandingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const universityDisciplines = [
    {
      code: "BUS",
      name: "Quản trị kinh doanh & Chiến lược",
      desc: "Xử lý khủng hoảng truyền thông, mua bán sáp nhập và tái cấu trúc nguồn vốn.",
    },
    {
      code: "FIN",
      name: "Tài chính - Ngân hàng",
      desc: "Quản trị rủi ro thanh khoản, thẩm định tín dụng doanh nghiệp và danh mục đầu tư.",
    },
    {
      code: "CS",
      name: "Khoa học máy tính & An toàn thông tin",
      desc: "Phản ứng sự cố mã hóa tống tiền (Ransomware), điều tra dấu vết và khôi phục hệ thống.",
    },
    {
      code: "MED",
      name: "Y khoa & Điều dưỡng lâm sàng",
      desc: "Chẩn đoán phân biệt ca cấp cứu phức tạp và hội chẩn đa chuyên khoa theo phác đồ.",
    },
    {
      code: "LAW",
      name: "Luật học & Pháp lý doanh nghiệp",
      desc: "Tranh tụng sở hữu trí tuệ, đàm phán hợp đồng thương mại quốc tế và tuân thủ lao động.",
    },
    {
      code: "HOS",
      name: "Quản trị Du lịch & Khách sạn",
      desc: "Ứng phó sự cố an toàn dịch vụ, quản trị trải nghiệm khách hàng cao cấp và điều hành mùa cao điểm.",
    },
  ];

  const coreFeatures = [
    {
      id: "01",
      title: "RAG Grounding từ học liệu chính thống",
      desc: "Hệ thống trích xuất nội dung từ giáo trình, bài giảng và tài liệu case study (PDF/DOCX) của giảng viên. Mỗi kịch bản đều gắn liền với căn cứ học thuật cụ thể.",
      tag: "Bản quyền & Chuẩn mực",
    },
    {
      id: "02",
      title: "Cây quyết định phân nhánh (DAG)",
      desc: "Kịch bản được cấu trúc dạng đồ thị có hướng không chu trình. Mỗi lựa chọn dẫn dắt sinh viên tới các tình thế và hệ quả độc lập, phản ánh tính bất định thực tế.",
      tag: "Tư duy hệ thống",
    },
    {
      id: "03",
      title: "Hành trình hồi cứu & Lập luận sâu",
      desc: "Trong pha trải nghiệm, sinh viên đi thẳng qua các điểm quyết định. Hệ quả và phương án đối ứng chỉ bộc lộ ở pha Review để sinh viên suy ngẫm và tự lập luận.",
      tag: "Trải nghiệm 3 pha",
    },
    {
      id: "04",
      title: "Socratic AI Challenge Support",
      desc: "Trợ lý AI đặt câu hỏi phản biện gợi mở (tối đa 2 vòng) nhằm rèn luyện lập luận đa chiều. Tuyệt đối không chấm điểm hay thay thế đánh giá của giảng viên.",
      tag: "Zero AI Grading",
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      role: "Giảng viên",
      title: "Tải học liệu môn học",
      desc: "Tải lên giáo trình, tài liệu chuyên khảo hoặc tình huống nghiệp vụ thực tế dưới dạng PDF hoặc Word.",
    },
    {
      step: "02",
      role: "Giảng viên & AI",
      title: "Biên tập & Phê duyệt kịch bản",
      desc: "AI tạo bản nháp cây quyết định; giảng viên trực tiếp chỉnh sửa và duyệt qua 4 bước: DRAFT → REVIEWED → APPROVED → PUBLISHED.",
    },
    {
      step: "03",
      role: "Sinh viên",
      title: "Ra quyết định & Phản biện",
      desc: "Sinh viên tiếp cận case qua liên kết học phần, điều hướng qua các nút quyết định, xem lại hành trình và bảo vệ lập luận của mình.",
    },
    {
      step: "04",
      role: "Giảng viên",
      title: "Đánh giá & Quan sát phổ nhánh",
      desc: "Giảng viên đưa ra nhận xét định tính học thuật và theo dõi tỷ lệ phân bố lựa chọn của lớp qua biểu đồ thống kê trực quan.",
    },
  ];

  const faqList = [
    {
      q: "EduBranch AI khác gì so với các hệ thống trắc nghiệm hoặc chatbot thông thường?",
      a: "EduBranch AI không tạo câu hỏi trắc nghiệm đơn lẻ hay cho phép hội thoại tự do. Hệ thống xây dựng các kịch bản phân nhánh (Branching Scenarios) mô phỏng tình huống ra quyết định phức tạp trong môi trường chuyên nghiệp, kết hợp cơ chế hồi cứu hành trình và câu hỏi gợi mở Socratic không chấm điểm.",
    },
    {
      q: "Nguyên tắc 'Zero AI Grading' (AI không chấm điểm) hoạt động như thế nào?",
      a: "Theo chuẩn mực sư phạm bậc đại học, AI chỉ đóng vai trò người gợi mở tư duy thông qua tối đa 2 vòng câu hỏi phản biện. Toàn bộ điểm số, nhận xét học thuật và đánh giá năng lực tư duy phản biện thuộc thẩm quyền 100% của giảng viên phụ trách môn học.",
    },
    {
      q: "Hệ thống hỗ trợ những định dạng tài liệu học phần nào?",
      a: "Hệ thống hỗ trợ tài liệu học tập chuẩn học thuật định dạng PDF và DOCX (Word), bao gồm giáo trình, tài liệu bài giảng, nghị định pháp lý, hồ sơ bệnh án mẫu hoặc báo cáo tài chính doanh nghiệp.",
    },
    {
      q: "Tại sao sinh viên không thấy ngay kết quả sau mỗi lần chọn phương án?",
      a: "EduBranch AI áp dụng quy trình 3 pha sư phạm: (1) Trải nghiệm thực tế không bị ngắt quãng, (2) Hồi cứu toàn bộ hành trình và đối chiếu phương án thay thế, (3) Tự suy ngẫm và nhận xét từ giảng viên. Việc giấu kết quả tức thời giúp người học không bị tâm lý đối phó đáp án đúng/sai.",
    },
    {
      q: "Giảng viên có toàn quyền kiểm soát nội dung kịch bản không?",
      a: "Tuyệt đối có. Bất kỳ kịch bản nào do AI đề xuất đều bắt đầu ở trạng thái DRAFT. Chỉ khi giảng viên duyệt qua đầy đủ quy trình kiểm duyệt (DRAFT → REVIEWED → APPROVED → PUBLISHED) thì sinh viên mới có thể truy cập qua liên kết môn học.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans antialiased">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER / NAVIGATION BAR
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xs border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <EduBranchLogo size={28} />
            <span className="text-base font-semibold text-gray-900 tracking-tight">
              EduBranch AI
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm text-gray-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">
              Tính năng cốt lõi
            </a>
            <a href="#workflow" className="hover:text-blue-600 transition-colors">
              Quy trình sư phạm
            </a>
            <a href="#learning-modes" className="hover:text-blue-600 transition-colors">
              Chế độ học tập
            </a>
            <a href="#disciplines" className="hover:text-blue-600 transition-colors">
              Ngành đào tạo
            </a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">
              Hỏi đáp
            </a>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-1.5 transition-colors"
            >
              Đăng nhập
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Bắt đầu ngay
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="pt-16 pb-20 px-6 border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Học tập tình huống thực nghiệm bậc Đại học
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
            Biến tài liệu môn học thành{" "}
            <span className="text-blue-600">tình huống ra quyết định</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Giảng viên xây dựng kịch bản phân nhánh từ học liệu chính thống; sinh viên trực tiếp đối mặt tình thế nan giải, ra quyết định và tự đánh giá hành trình lập luận.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/register">
              <Button variant="primary" size="lg">
                Tạo tài khoản học tập
              </Button>
            </Link>
            <a href="#workflow">
              <Button variant="secondary" size="lg">
                Xem quy trình sư phạm
              </Button>
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-600 font-medium">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>100% Giảng viên duyệt kịch bản</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Zero AI Grading — Tôn trọng tư duy độc lập</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Tối đa 2 vòng phản biện Socratic</span>
            </div>
          </div>
        </div>

        {/* ─── PRODUCT INTERFACE PREVIEW MOCKUP ─── */}
        <div className="max-w-4xl mx-auto mt-12 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Mockup Window Bar */}
          <div className="h-10 bg-gray-50 border-b border-gray-200 px-4 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-gray-300 inline-block" />
              <span className="h-2.5 w-2.5 rounded-full bg-gray-300 inline-block" />
              <span className="h-2.5 w-2.5 rounded-full bg-gray-300 inline-block" />
              <span className="font-mono text-gray-700 ml-2">EduBranch AI · Branching Study Player</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-medium border border-teal-200">
              Điểm quyết định 01 / 03
            </span>
          </div>

          {/* Mockup Content Area */}
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wider text-blue-600 font-semibold">
                Quản trị rủi ro & khủng hoảng ngân hàng
              </div>
              <h2 className="text-base font-semibold text-gray-900">
                Sự cố thanh khoản tại chi nhánh khu vực miền Trung
              </h2>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-md border border-gray-200">
              Lúc 09:30 sáng, một tin đồn thất thiệt lan truyền trên mạng xã hội khiến lượng người rút tiền mặt tại quầy tăng đột biến vượt quá dự trữ tiền mặt tại quỹ (chỉ đáp ứng được 35% nhu cầu trước 12:00 trưa). Là Giám đốc rủi ro khu vực, quyết định điều hành tức thời của bạn là gì?
            </p>

            <div className="space-y-2 pt-1">
              <div className="p-3 rounded-md border border-blue-600 bg-blue-50/50 flex items-center justify-between">
                <span className="text-sm text-gray-900 font-medium">
                  A. Điều phối xe tiếp quỹ khẩn cấp từ chi nhánh lân cận & phát thông cáo báo chí chính thức
                </span>
                <span className="text-xs text-blue-700 font-semibold px-2 py-0.5 rounded bg-blue-100">
                  Lựa chọn
                </span>
              </div>
              <div className="p-3 rounded-md border border-gray-200 hover:border-gray-300 text-sm text-gray-600">
                B. Tạm dừng giao dịch tiền mặt tại quầy và chuyển hướng người dân sang kênh số
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. UNIVERSITY DISCIPLINES
      ───────────────────────────────────────────────────────────── */}
      <section id="disciplines" className="py-16 px-6 border-b border-gray-200">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Phù hợp cho các chương trình đào tạo đại học
            </h2>
            <p className="text-sm text-gray-600">
              Mô hình hóa các tình thế ra quyết định thực tế cho đa dạng các khối ngành chuyên nghiệp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {universityDisciplines.map((item) => (
              <div
                key={item.code}
                className="bg-white p-5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    {item.code}
                  </span>
                  <span className="text-xs text-gray-400">Bậc Đại học</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {item.name}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. 4 CORE PEDAGOGICAL PILLARS
      ───────────────────────────────────────────────────────────── */}
      <section id="features" className="py-16 px-6 border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              4 Trụ cột Sư phạm Thực nghiệm
            </h2>
            <p className="text-sm text-gray-600">
              Thiết kế bám sát phương pháp Case Method và nguyên tắc tư duy phản biện đại học.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coreFeatures.map((f) => (
              <div
                key={f.id}
                className="p-6 rounded-lg border border-gray-200 bg-white space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-600">
                    {f.id}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. 4-STEP ACADEMIC WORKFLOW
      ───────────────────────────────────────────────────────────── */}
      <section id="workflow" className="py-16 px-6 border-b border-gray-200">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Quy trình học tập khép kín
            </h2>
            <p className="text-sm text-gray-600">
              Quy trình chuẩn mực từ khâu nạp học liệu của giảng viên đến trải nghiệm giải quyết của sinh viên.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflowSteps.map((w) => (
              <div
                key={w.step}
                className="bg-white p-5 rounded-lg border border-gray-200 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-gray-400">
                    BƯỚC {w.step}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                    {w.role}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {w.title}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {w.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. DUAL LEARNING MODES
      ───────────────────────────────────────────────────────────── */}
      <section id="learning-modes" className="py-16 px-6 border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Hai chế độ học tập chuyên biệt
            </h2>
            <p className="text-sm text-gray-600">
              Lựa chọn hình thức phù hợp với mục tiêu sư phạm của từng chủ đề học phần.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mode 1: Branching Study */}
            <div className="p-6 rounded-lg border border-teal-200 bg-teal-50/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
                  BRANCHING STUDY
                </span>
                <span className="text-xs text-gray-500 font-mono">Đa ngã rẽ (DAG)</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Học qua cây quyết định phân nhánh
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Người học trực tiếp đưa ra các lựa chọn quyết định liên tiếp. Mỗi quyết định mở ra các nhánh rẽ và dẫn đến kết cục (Outcome) khác nhau. Sau khi hoàn thành, sinh viên hồi cứu toàn bộ hành trình và lập luận cho quyết định của mình.
              </p>
              <div className="pt-2 border-t border-teal-100 text-xs text-teal-900 space-y-1 font-medium">
                <div>• Trải nghiệm liên tục không ngắt quãng</div>
                <div>• Hồi cứu hành trình & thấy rõ nhánh đối ứng</div>
                <div>• Lập luận hồi cứu cho các điểm then chốt</div>
              </div>
            </div>

            {/* Mode 2: Review Study */}
            <div className="p-6 rounded-lg border border-pink-200 bg-pink-50/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-100 text-pink-800">
                  REVIEW STUDY
                </span>
                <span className="text-xs text-gray-500 font-mono">Tình huống mở</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Phân tích tình huống học thuật mở
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Người học tiếp cận một bài toán nghiệp vụ phức tạp không định sẵn nhánh rẽ. Sinh viên độc lập viết đề xuất giải pháp chi tiết, đối thoại phản biện với AI và nhận phản hồi định tính từ giảng viên.
              </p>
              <div className="pt-2 border-t border-pink-100 text-xs text-pink-900 space-y-1 font-medium">
                <div>• Không giới hạn bởi cấu trúc cây</div>
                <div>• Đề xuất giải pháp toàn diện theo văn phong học thuật</div>
                <div>• Phản biện Socratic đa chiều</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. FAQ ACCORDION
      ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-16 px-6 border-b border-gray-200">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Câu hỏi thường gặp
            </h2>
            <p className="text-sm text-gray-600">
              Giải đáp về phương pháp sư phạm, cơ chế vận hành và tính bảo mật của EduBranch AI.
            </p>
          </div>

          <div className="divide-y divide-gray-200 border-y border-gray-200">
            {faqList.map((faq, idx) => (
              <div key={idx} className="py-4">
                <button
                  type="button"
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-semibold text-sm text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <svg
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      expandedFaq === idx ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFaq === idx && (
                  <p className="mt-2.5 text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 bg-white text-xs text-gray-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <EduBranchLogo size={20} />
            <span className="font-semibold text-gray-900 text-sm">
              EduBranch AI
            </span>
            <span className="text-gray-400">·</span>
            <span>Nền tảng học tập tình huống thực nghiệm bậc Đại học</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-gray-900 transition-colors">
              Đăng nhập
            </Link>
            <Link to="/register" className="hover:text-gray-900 transition-colors">
              Đăng ký
            </Link>
            <span>Đại học Duy Tân · Capstone 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
