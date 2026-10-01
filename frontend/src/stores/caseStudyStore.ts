/**
 * EduBranch AI — Case Study State Store
 *
 * Implements strict Product Direction:
 * Mode A: Branching Study (Experience continuously -> Complete Journey -> Review -> Reflection -> Retry creates new attempt)
 * Mode B: Review Study (Context/Data -> Problem -> Analysis -> Solution -> Reasoning -> Lecturer Review -> Reflection)
 */

import { create } from "zustand";

export interface JourneyStep {
  nodeId: string;
  situation: string;
  selectedOptionId: string;
  selectedOptionText: string;
  consequence: string;
  otherOptions: Array<{ id: string; text: string }>;
  reasoningText?: string; // Captured retrospectively in REVIEW
}

export interface CaseNodeDef {
  id: string;
  situation: string;
  contextData?: string;
  outcomeText?: string;
  isTerminal: boolean;
  options: Array<{
    id: string;
    text: string;
    consequence: string;
    nextNodeId: string | null;
  }>;
}

export interface BranchingAttemptRecord {
  id: string;
  caseId: string;
  attemptNumber: number;
  currentNodeId?: string;
  steps: JourneyStep[];
  outcomeNodeId: string | null;
  outcomeText: string | null;
  isCompleted: boolean;
  reflectionText?: string;
  reflectionStatus: "NOT_STARTED" | "SUBMITTED";
  startedAt: string;
  completedAt?: string;
}

export interface ReviewStudySubmissionRecord {
  id: string;
  caseId: string;
  studentAnalysis: string;
  proposedSolution: string;
  reasoningText: string;
  status: "SUBMITTED" | "REVIEWED" | "REFLECTED";
  lecturerFeedback?: string;
  reflectionText?: string;
  submittedAt: string;
}

export interface ChallengeSessionRecord {
  sessionId: string;
  caseId: string;
  targetType: "BRANCHING" | "REVIEW";
  currentRound: number; // 1 or 2
  messages: Array<{ role: "CHALLENGE_SUPPORT" | "STUDENT"; content: string; round: number }>;
  isCompleted: boolean;
}

interface CaseStudyState {
  // Mode A - Branching Study
  currentAttempt: BranchingAttemptRecord | null;
  attemptHistory: BranchingAttemptRecord[];
  currentNodeId: string;

  // Mode B - Review Study
  reviewSubmission: ReviewStudySubmissionRecord | null;

  // Challenge Support
  challengeSession: ChallengeSessionRecord | null;

  // Actions Mode A
  initBranchingAttempt: (caseId: string) => void;
  selectBranchingOption: (
    nodeId: string,
    situation: string,
    selectedOptionId: string,
    selectedOptionText: string,
    consequence: string,
    otherOptions: Array<{ id: string; text: string }>,
    nextNodeId: string | null,
    nextNodeIsTerminal: boolean,
    terminalOutcomeText?: string
  ) => void;
  saveRetrospectiveReasoning: (nodeId: string, reasoningText: string) => void;
  submitBranchingReflection: (reflectionText: string) => void;
  retryBranchingAttempt: (caseId: string) => void;

  // Actions Mode B
  submitReviewStudy: (
    caseId: string,
    data: { studentAnalysis: string; proposedSolution: string; reasoningText: string }
  ) => void;
  submitReviewReflection: (reflectionText: string) => void;

  // Actions Challenge Support
  initChallengeSession: (caseId: string, targetType: "BRANCHING" | "REVIEW", initialReasoning: string) => string;
  submitStudentChallengeReply: (replyText: string) => void;
}

// Sample Case Node Data for Vinatech Pharma Case
export const SAMPLE_BRANCHING_CASE: {
  id: string;
  title: string;
  description: string;
  courseName: string;
  nodes: Record<string, CaseNodeDef>;
} = {
  id: "case-business-crisis-1",
  title: "Khủng hoảng Chất lượng và Truyền thông tại Vinatech Pharma",
  description: "Xử lý sự cố chất lượng lô thuốc kháng sinh tại thị trường Miền Trung.",
  courseName: "Quản trị Khủng hoảng Doanh nghiệp (MGT402)",
  nodes: {
    N1: {
      id: "N1",
      situation:
        "8:00 AM, bạn nhận được báo cáo từ Chi nhánh Miền Trung: 3 bệnh viện tỉnh phản ánh 12 bệnh nhân bị phản ứng dị ứng nặng sau khi sử dụng lô thuốc kháng sinh Cefo-Vina 500mg sản xuất tháng trước. Cơ quan thanh tra y tế địa phương đã bắt đầu vào cuộc kiểm tra.",
      contextData: "Doanh số dòng thuốc này chiếm 30% doanh thu quý. Hàng tồn kho hiện có 50.000 hộp trên thị trường.",
      isTerminal: false,
      options: [
        {
          id: "O1",
          text: "Chủ động thu hồi khẩn cấp toàn bộ lô thuốc trên toàn quốc và thông cáo báo chí minh bạch trong 4 giờ tới.",
          consequence:
            "Hành động thu hồi minh bạch nhận được sự đánh giá cao từ Bộ Y tế, tuy nhiên truyền thông bùng nổ, giá cổ phiếu giảm tức thì 8% và cổ đông yêu cầu họp khẩn.",
          nextNodeId: "N2",
        },
        {
          id: "O2",
          text: "Thành lập đoàn thanh tra nội bộ khẩn cấp về nhà máy để rà soát mẫu lưu trước khi phát ngôn ra công chúng.",
          consequence:
            "Trong lúc đoàn nội bộ làm việc, biên bản làm việc của thanh tra y tế địa phương bị rò rỉ lên mạng xã hội kèm suy đoán doanh nghiệp cố tình che giấu thông tin.",
          nextNodeId: "N3",
        },
      ],
    },
    N2: {
      id: "N2",
      situation:
        "Buổi họp báo đã diễn ra. Dù minh bạch, các chuỗi nhà thuốc lớn bắt đầu tạm ngưng nhập các sản phẩm khác của công ty do tâm lý lo ngại. Cổ đông lớn đòi cắt giảm ngân sách để bù đắp thiệt hại tức thời.",
      contextData: "Áp lực tiền mặt gia tăng. Khách hàng bắt đầu gửi đơn yêu cầu bồi thường sức khỏe.",
      isTerminal: false,
      options: [
        {
          id: "O3",
          text: "Thiết lập Quỹ hỗ trợ y tế độc lập cho bệnh nhân bị ảnh hưởng và gửi mẫu cho Viện Kiểm nghiệm độc lập quốc tế thẩm định.",
          consequence:
            "Kết quả kiểm nghiệm độc lập chứng minh lô thuốc bị nhiễm tạp chất từ nhà cung cấp nguyên liệu thô, giải oan cho quy trình sản xuất của công ty. Sự chân thành và quỹ bồi thường cứu vãn niềm tin thương hiệu.",
          nextNodeId: "N4",
        },
        {
          id: "O4",
          text: "Tuyên bố công khai rằng nguyên nhân có thể do đơn vị vận chuyển vi phạm tiêu chuẩn nhiệt độ bảo quản lạnh.",
          consequence:
            "Công ty vận tải kiện ngược lại vì bôi nhọ danh dự doanh nghiệp. Cơ quan công an mở rộng điều tra toàn diện chuỗi cung ứng, đình chỉ giấy phép lưu hành.",
          nextNodeId: "N5",
        },
      ],
    },
    N3: {
      id: "N3",
      situation:
        "Thông tin bị rò rỉ tạo nên làn sóng phẫn nộ trên mạng xã hội với hashtag tẩy chay Vinatech Pharma. Bộ Y tế ra công văn hỏa tốc yêu cầu giải trình trong 24 giờ.",
      contextData: "Khủng hoảng leo thang nhanh hơn dự tính. Mẫu lưu nội bộ cho thấy có dấu hiệu tạp chất lạ.",
      isTerminal: false,
      options: [
        {
          id: "O5",
          text: "Thừa nhận sự chậm trễ trong công bố, chấp hành lệnh đình chỉ tạm thời và hợp tác tuyệt đối với cơ quan điều tra.",
          consequence:
            "Doanh nghiệp bị phạt hành chính nặng và tổn thất doanh thu năm, nhưng ban lãnh đạo giữ được tư cách pháp nhân và được phép tái thẩm định nhà máy sau 6 tháng.",
          nextNodeId: "N6",
        },
        {
          id: "O6",
          text: "Bác bỏ tin đồn, dọa khởi kiện các tài khoản mạng xã hội chia sẻ thông tin rò rỉ.",
          consequence:
            "Hành vi đe dọa pháp lý khiến công chúng tẩy chay diện rộng. Các cơ quan chức năng công bố kết luận vi phạm nghiêm trọng, thu hồi vĩnh viễn giấy phép sản xuất.",
          nextNodeId: "N7",
        },
      ],
    },
    N4: {
      id: "N4",
      situation: "KẾT QUẢ CUỐI CÙNG: PHỤC HỒI UY TÍN & BẢO TOÀN GIÁ TRỊ CỐT LÕI",
      outcomeText:
        "Bạn đã dẫn dắt công ty vượt qua khủng hoảng thành công. Nhờ sự minh bạch, trách nhiệm với bệnh nhân và kiểm chứng độc lập, Vinatech Pharma lấy lại thị phần sau 9 tháng và được Bộ Y tế biểu dương về chuẩn mực quản trị rủi ro.",
      isTerminal: true,
      options: [],
    },
    N5: {
      id: "N5",
      situation: "KẾT QUẢ CUỐI CÙNG: KHỦNG HOẢNG PHÁP LÝ KÉP & ĐÌNH CHỈ HOẠT ĐỘNG",
      outcomeText:
        "Việc đổ lỗi vội vã đã biến khủng hoảng chất lượng thành cuộc chiến pháp lý tốn kém. Cơ quan quản lý đình chỉ sản xuất, chi phí kiện tụng vượt quá lợi nhuận cả năm.",
      isTerminal: true,
      options: [],
    },
    N6: {
      id: "N6",
      situation: "KẾT QUẢ CUỐI CÙNG: TỔN THẤT NẶNG NỀ NHƯNG BẢO TOÀN ĐƯỢC GIẤY PHÉP",
      outcomeText:
        "Công ty phải chịu mức phạt lớn và mất 40% thị phần do sự ngập ngừng ban đầu, nhưng sự hợp tác muộn màng giúp giữ lại được nhà máy để tái cấu trúc dài hạn.",
      isTerminal: true,
      options: [],
    },
    N7: {
      id: "N7",
      situation: "KẾT QUẢ CUỐI CÙNG: SỤP ĐỔ HOÀN TOÀN DO BẤT TÍN TRUYỀN THÔNG",
      outcomeText:
        "Chiến lược đối đầu với công chúng và che giấu sự thật đã dẫn đến việc thu hồi giấy phép toàn diện. Toàn bộ ban giám đốc bị bãi nhiệm, thương hiệu chấm dứt hoạt động trên thị trường.",
      isTerminal: true,
      options: [],
    },
  },
};

// Sample Case Data for Mode B (Review Study)
export const SAMPLE_REVIEW_STUDY_CASE = {
  id: "case-review-study-1",
  title: "Tái cấu trúc Chuỗi Bán lẻ F&B GreenDine sau Biến động Thị trường",
  courseName: "Chiến lược Kinh doanh Bán lẻ Đại học (STRAT301)",
  contextText: `GreenDine là chuỗi F&B với 45 cửa hàng tại Hà Nội và TP.HCM, định vị phân khúc thực phẩm sạch cao cấp.
Số liệu tài chính năm qua:
- Doanh thu toàn chuỗi giảm 18% do chi phí mặt bằng trung bình tăng 22%.
- 15/45 cửa hàng đang chịu lỗ ròng kéo dài trên 6 tháng.
- Doanh thu từ kênh giao hàng trực tuyến (Delivery) tăng 65%, chiếm 38% tổng doanh thu.
- Tỷ lệ giữ chân khách hàng tại điểm bán trực tiếp giảm từ 72% xuống 54%.`,
  problemText: `Hãy đóng vai trò Giám đốc Chiến lược của GreenDine:
1. Phân tích nguyên nhân cốt lõi gây sụt giảm hiệu quả kinh doanh.
2. Đề xuất phương án tối ưu hóa mạng lưới 45 cửa hàng trong 12 tháng tới (đóng cửa, chuyển đổi mô hình, tái đàm phán mặt bằng, v.v.).
3. Trình bày lập luận và số liệu bảo vệ phương án đề xuất của bạn.`,
};

export const useCaseStudyStore = create<CaseStudyState>((set, get) => ({
  currentAttempt: null,
  attemptHistory: [],
  currentNodeId: "N1",
  reviewSubmission: null,
  challengeSession: null,

  initBranchingAttempt: (caseId: string) => {
    const existingAttempt = get().currentAttempt;
    if (existingAttempt && existingAttempt.caseId === caseId && !existingAttempt.isCompleted) {
      // Resume current ongoing attempt
      return;
    }
    const attemptNumber = (get().attemptHistory.filter((a) => a.caseId === caseId).length || 0) + 1;
    const newAttempt: BranchingAttemptRecord = {
      id: `attempt-${Date.now()}`,
      caseId,
      attemptNumber,
      steps: [],
      outcomeNodeId: null,
      outcomeText: null,
      isCompleted: false,
      reflectionStatus: "NOT_STARTED",
      startedAt: new Date().toISOString(),
    };
    set({
      currentAttempt: newAttempt,
      currentNodeId: "N1",
    });
  },

  selectBranchingOption: (
    nodeId,
    situation,
    selectedOptionId,
    selectedOptionText,
    consequence,
    otherOptions,
    nextNodeId,
    nextNodeIsTerminal,
    terminalOutcomeText
  ) => {
    const attempt = get().currentAttempt;
    if (!attempt) return;

    const newStep: JourneyStep = {
      nodeId,
      situation,
      selectedOptionId,
      selectedOptionText,
      consequence,
      otherOptions,
    };

    // Terminal state is determined by the case graph, not by a fixed list of
    // sample node IDs. Case authors may use any number of terminal nodes.
    const isNextTerminal = nextNodeId === null || nextNodeIsTerminal;

    const updatedAttempt: BranchingAttemptRecord = {
      ...attempt,
      steps: [...attempt.steps, newStep],
      currentNodeId: nextNodeId || attempt.currentNodeId,
      outcomeNodeId: isNextTerminal ? nextNodeId : null,
      outcomeText: isNextTerminal ? terminalOutcomeText || null : null,
      isCompleted: isNextTerminal,
      completedAt: isNextTerminal ? new Date().toISOString() : undefined,
    };

    set({
      currentAttempt: updatedAttempt,
      currentNodeId: nextNodeId || attempt.currentNodeId,
    });
  },

  saveRetrospectiveReasoning: (nodeId: string, reasoningText: string) => {
    const attempt = get().currentAttempt;
    if (!attempt || !attempt.isCompleted) return;

    const updatedSteps = attempt.steps.map((step) =>
      step.nodeId === nodeId ? { ...step, reasoningText } : step
    );

    set({
      currentAttempt: {
        ...attempt,
        steps: updatedSteps,
      },
    });
  },

  submitBranchingReflection: (reflectionText: string) => {
    const attempt = get().currentAttempt;
    if (!attempt || !attempt.isCompleted) return;

    const updatedAttempt: BranchingAttemptRecord = {
      ...attempt,
      reflectionText,
      reflectionStatus: "SUBMITTED",
    };

    set({
      currentAttempt: updatedAttempt,
    });
  },

  retryBranchingAttempt: (caseId: string) => {
    const current = get().currentAttempt;
    if (current && !current.isCompleted) return;
    const history = current ? [...get().attemptHistory, current] : get().attemptHistory;
    const nextAttemptNumber = history.filter((a) => a.caseId === caseId).length + 1;

    const newAttempt: BranchingAttemptRecord = {
      id: `attempt-${Date.now()}`,
      caseId,
      attemptNumber: nextAttemptNumber,
      steps: [],
      outcomeNodeId: null,
      outcomeText: null,
      isCompleted: false,
      reflectionStatus: "NOT_STARTED",
      startedAt: new Date().toISOString(),
    };

    set({
      attemptHistory: history,
      currentAttempt: newAttempt,
      currentNodeId: "N1",
    });
  },

  submitReviewStudy: (caseId, data) => {
    const submission: ReviewStudySubmissionRecord = {
      id: `sub-${Date.now()}`,
      caseId,
      studentAnalysis: data.studentAnalysis,
      proposedSolution: data.proposedSolution,
      reasoningText: data.reasoningText,
      status: "SUBMITTED",
      submittedAt: new Date().toISOString(),
    };
    set({ reviewSubmission: submission });
  },

  submitReviewReflection: (reflectionText: string) => {
    const sub = get().reviewSubmission;
    if (!sub) return;
    set({
      reviewSubmission: {
        ...sub,
        reflectionText,
        status: "REFLECTED",
      },
    });
  },

  initChallengeSession: (caseId, targetType, initialReasoning) => {
    const sessionId = `challenge-${Date.now()}`;
    const initialQuestion =
      targetType === "BRANCHING"
        ? "Nếu giả định rằng đối thủ cạnh tranh sẽ lợi dụng việc công bố thông tin thu hồi để tung tin giả về toàn bộ danh mục sản phẩm của công ty, bạn có điều chỉnh thời điểm họp báo không, và đâu là rủi ro lớn nhất của lựa chọn đó?"
        : "Trong đề xuất đóng cửa 15 chi nhánh của bạn, nếu các đối tác mặt bằng kiên quyết không hoàn trả cọc và khởi kiện vi phạm hợp đồng thuê, phương án tài chính dự phòng của bạn là gì?";

    const session: ChallengeSessionRecord = {
      sessionId,
      caseId,
      targetType,
      currentRound: 1,
      messages: [
        {
          role: "STUDENT",
          content: initialReasoning,
          round: 1,
        },
        {
          role: "CHALLENGE_SUPPORT",
          content: initialQuestion,
          round: 1,
        },
      ],
      isCompleted: false,
    };

    set({ challengeSession: session });
    return sessionId;
  },

  submitStudentChallengeReply: (replyText: string) => {
    const session = get().challengeSession;
    if (!session || session.isCompleted) return;

    if (session.currentRound === 1) {
      const followUp =
        "Lập luận của bạn đã làm rõ khía cạnh pháp lý. Nhưng về mặt tâm lý thị trường, liệu sự kiên quyết này có khiến các nhà bán lẻ khác đẩy nhanh việc thanh lý hợp đồng hợp tác không? Hãy suy ngẫm thêm về góc nhìn đó.";
      const updatedMessages = [
        ...session.messages,
        { role: "STUDENT" as const, content: replyText, round: 2 },
        { role: "CHALLENGE_SUPPORT" as const, content: followUp, round: 2 },
      ];
      set({
        challengeSession: {
          ...session,
          currentRound: 2,
          messages: updatedMessages,
          isCompleted: true, // Capped at 2 rounds maximum
        },
      });
    }
  },
}));
