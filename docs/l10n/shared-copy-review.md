# Shared Localization Copy Review [Shared Namespaces]

> **Governance Notice**:
> - **Purpose**: Central copy review registry for shared localization namespaces (base `en.json`, `states.*`, `shell.*`, and any UI string not owned by a single feature directory).
> - **Registry Schema**: Schema A (`| key | vi | en | status | approved_by | approved_on | source |`). Status values: `PROPOSED`, `APPROVED`, `CHANGES_REQUESTED`. A row with status `APPROVED` strictly requires a non-empty, non-placeholder `approved_by` and a valid calendar date `approved_on` in `YYYY-MM-DD` format (rejected otherwise with `APPROVAL_INCOMPLETE`).
> - **Array Key Notation**: For array values (e.g. i18next `returnObjects`), keys descend into arrays using numeric index segments (e.g. `g1.landing.how.steps.0`, `g1.landing.how.steps.0.title`); leaf nodes must be strings (numbers, booleans and null are flagged as errors).
> - **Status Authority**: ONLY the Product Owner (PO) sets status to `APPROVED` and fills `approved_by` and `approved_on`. Implementers and agents draft copy only (status `PROPOSED`, approval cells `—`) and MUST NEVER mark copy APPROVED.
> - **Release Scope Rule**: Every English key across all `frontend/src/locales/*.en.json` (including base `en.json`) at release time is in release scope. Any English key in a locale file without a corresponding registry entry is flagged as `UNREGISTERED` by `scripts/l10n-approval-check.mjs`. Quality Gate QG4 fails while any English key in scope is not `APPROVED`, or if no English locale files are found (`NO_EN_LOCALES`). Regression test suite: `node --test scripts/l10n-approval-check.test.mjs`.
> - **Preflight Registration Note**: Task T028 registers the shared keys (base `en.json`, `states.*`, `shell.*`, …) from the merged FE-023 source as `PROPOSED` into this registry prior to feature implementation.

---

## Shared Copy Review Table

| key | vi | en | status | approved_by | approved_on | source |
|---|---|---|:---:|:---:|:---:|---|
| `common.appName` | EduBranch AI | EduBranch AI | PROPOSED | — | — | PR-54-FIX |
| `common.backHome` | Về trang chủ | Back to home | PROPOSED | — | — | PR-54-FIX |
| `g1.landing.hero.category` | Nền tảng Tình huống Thực nghiệm & Tư duy Bậc Đại học | Experiential Case Learning & Critical Thinking Platform | PROPOSED | — | — | PR-54-FIX |
| `g1.landing.hero.badges.grounded` | RAG Grounding từ giáo trình | Course-grounded RAG | PROPOSED | — | — | PR-54-FIX |
| `g1.landing.hero.badges.pedagogical` | Cây quyết định đa nhánh thực tế | Pedagogical branching tree | PROPOSED | — | — | PR-54-FIX |
| `g1.landing.hero.badges.approved` | Giảng viên kiểm soát 100% | 100% faculty controlled | PROPOSED | — | — | PR-54-FIX |
| `g1.landing.hero.diagram.simulationBadge` | Mô phỏng tự động | Continuous Simulation | PROPOSED | — | — | PR-54-FIX |
| `g1.landing.hero.diagram.decisionPoint1` | Điểm quyết định 1 | Decision point 1 | PROPOSED | — | — | PR-54-FIX |
| `g1.landing.hero.diagram.journeyReview` | Hồi cứu hành trình | Journey review | PROPOSED | — | — | PR-54-FIX |
| `g1.landing.hero.diagram.attempt2Title` | Lượt làm 2 · Hành động tiếp theo & Kết cục | Attempt 2 · Next action & Outcome | PROPOSED | — | — | PR-54-FIX |
| `g1.landing.hero.diagram.retrospective` | Rút kinh nghiệm | Retrospective | PROPOSED | — | — | PR-54-FIX |
| `g1.landing.hero.diagram.attempt2Text` | Tự động gửi voucher xin lỗi cho khách hàng phải chờ ➔ Giữ chân khách hàng và biến sự cố thành cơ hội củng cố sự hài lòng. | Automatically send an apology voucher to waiting customers ➔ Retain customers and turn an incident into an opportunity to build satisfaction. | PROPOSED | — | — | PR-54-FIX |
| `g1.landing.hero.diagram.statusPaused` | Đang tạm dừng — Bỏ chuột để tiếp tục | Simulation paused — Move mouse away to resume | PROPOSED | — | — | PR-54-FIX |
| `g1.landing.hero.diagram.statusPlaying` | Tự động trình diễn mô phỏng (Rê chuột để tạm dừng) | Auto-playing simulation (Hover to pause) | PROPOSED | — | — | PR-54-FIX |
| `g1.landing.hero.diagram.phaseProgress` | Pha {{current}} trên {{total}} | Phase {{current}} of {{total}} | PROPOSED | — | — | PR-54-FIX |
| `g1.landing.how.demo.draftGenerated` | Đã sinh bản nháp | Draft generated | PROPOSED | — | — | PR-54-FIX |
| `g1.landing.how.demo.done` | Đã xong | Done | PROPOSED | — | — | PR-54-FIX |
| `g1.landing.how.demo.publishedForClass` | Đã xuất bản cho lớp | Published for class | PROPOSED | — | — | PR-54-FIX |
| `g1.landing.modes.branching.diagram.init` | Khởi tạo | Initialize | PROPOSED | — | — | PR-54-FIX |
| `g1.landing.modes.branching.diagram.option1` | Lựa chọn 1 | Choice 1 | PROPOSED | — | — | PR-54-FIX |
| `g1.landing.modes.branching.diagram.option2` | Lựa chọn 2 | Choice 2 | PROPOSED | — | — | PR-54-FIX |
| `g1.landing.modes.branching.diagram.outcome` | Hậu quả (Outcome) | Outcome | PROPOSED | — | — | PR-54-FIX |
| `g1.landing.modes.review.completed` | Hoàn tất | Completed | PROPOSED | — | — | PR-54-FIX |
| `g1.landing.modes.review.receiveFeedback` | Nhận phản hồi Giảng viên → | Receive lecturer feedback → | PROPOSED | — | — | PR-54-FIX |
| `g4.calendar.today` | Hôm nay | Today | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.moreCases` | +{{count}} case khác | +{{count}} other cases | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.trackSubmissions` | Theo dõi bài nộp | Track submissions | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.openSubmissionsQueue` | Mở hàng đợi bài nộp | Open submissions queue | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.access` | Truy cập | Access | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.courseSectionFallback` | HỌC PHẦN | COURSE | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.statusActive` | Đang giảng dạy | Active | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.statusInactive` | Tạm dừng | Paused | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.casesCount` | {{total}} case ({{published}} xuất bản) | {{total}} cases ({{published}} published) | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.materialsCount` | {{ready}}/{{total}} tài liệu | {{ready}}/{{total}} materials | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.materialsLink` | Tài liệu → | Materials → | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.enterCourse` | Vào lớp học | Enter course | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.quickActions.title` | Hành động nhanh | Quick actions | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.quickActions.subtitle` | Các lối tắt quản trị và truy cập nhanh vào tác vụ giảng dạy thường dùng. | Quick shortcuts to common teaching and management tasks. | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.quickActions.aiStudioBadge` | AI Studio | AI Studio | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.quickActions.aiStudio.title` | Khởi tạo Case với AI | Generate Case with AI | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.quickActions.aiStudio.desc` | Tạo kịch bản rẽ nhánh hoặc bài phân tích tình huống từ giáo trình. | Generate a branching scenario or review study from course materials. | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.quickActions.materials.title` | Quản lý Tài liệu | Manage Materials | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.quickActions.materials.desc` | Tải lên giáo trình, tài liệu tham khảo và theo dõi trạng thái lập chỉ mục. | Upload syllabi, references, and monitor indexing status. | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.quickActions.cases.title` | Quản lý Case Study | Manage Case Studies | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.quickActions.cases.desc` | Rà soát cây quyết định, phê duyệt kịch bản và xuất bản cho lớp học. | Review decision trees, approve scenarios, and publish to class. | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.quickActions.stats.title` | Thống kê Luồng học | Learning Analytics | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.quickActions.stats.desc` | Theo dõi lựa chọn rẽ nhánh và phân bố hành vi của người học. | Track branching decisions and student cohort behavior distribution. | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.coursesSection.title` | Khóa học đang phụ trách | Active Courses | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.coursesSection.subtitle` | Tổng quan các lớp học, tài liệu đã xử lý và case study sẵn sàng giảng dạy. | Overview of classes, processed materials, and ready-to-teach cases. | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.coursesSection.viewAll` | Xem tất cả khóa học → | View all courses → | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.coursesSection.noCoursesTitle` | Chưa có khóa học nào | No courses yet | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.coursesSection.noCoursesDesc` | Tạo khóa học đầu tiên để tải lên tài liệu và khởi tạo kịch bản tình huống. | Create your first course to upload materials and generate case scenarios. | PROPOSED | — | — | PR-54-FIX |
| `g4.dashboard.coursesSection.createCourse` | Tạo khóa học mới | Create course | PROPOSED | — | — | PR-54-FIX |
| `caseReview.branching.selectNextNode` | Chọn tình huống tiếp theo | Choose the next situation | PROPOSED | — | — | FE-009/FE-010 node editor |
| `caseReview.branching.maxOptions` | Mỗi tình huống có tối đa {{max}} phương án | A situation has at most {{max}} options | PROPOSED | — | — | FE-009/FE-010 node editor |
| `caseReview.validation.nextRequired` | Mỗi phương án của {{node}} cần chọn tình huống tiếp theo. | Each option of {{node}} needs a next situation. | PROPOSED | — | — | FE-009/FE-010 node editor |
| `caseReview.branching.treeTitle` | Cây quyết định | Decision tree | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.branching.nodeCount` | {{count}} nút | {{count}} nodes | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.branching.treeValid` | Hợp lệ · mọi nhánh dẫn tới kết cục | Valid · every branch reaches an outcome | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.branching.treeInvalid` | {{count}} lỗi cấu trúc cần sửa | {{count}} structure issues to fix | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.branching.badgeStart` | Bắt đầu | Start | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.branching.badgeOutcome` | Kết cục | Outcome | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.branching.badgePoint` | Điểm {{n}} | Point {{n}} | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.branching.treeHint` | Chọn một nút để sửa nội dung ở cột trái. | Select a node to edit its content in the left column. | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.branching.topologyLabel` | Topology: | Topology: | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.branching.topology` | {{nodes}} nút · {{situations}} tình huống · {{outcomes}} kết quả | {{nodes}} nodes · {{situations}} situations · {{outcomes}} outcomes | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.branching.checkLabel` | Kiểm tra cây: | Tree check: | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.branching.issueCount` | {{count}} lỗi cấu trúc | {{count}} structure issues | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.branching.optionSummary` | Phương án {{n}} · {{text}} → {{target}} | Option {{n}} · {{text}} → {{target}} | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.branching.expandOption` | Mở phương án {{n}} | Open option {{n}} | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.review.answersHint` | Mỗi sinh viên nộp một lần. Bạn phản hồi bằng nhận xét, không chấm điểm. | Each student submits once. You respond with comments, not grades. | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.errors.detail` | Chi tiết: {{detail}} | Details: {{detail}} | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.sources.title` | Đoạn nguồn được trích | Cited source passages | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.sources.unavailable` | Hệ thống chưa trả về đoạn nguồn được trích cho case này. | The system does not return cited source passages for this case yet. | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.bar.label` | Thanh duyệt case | Case review bar | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.bar.stepper` | Tiến độ duyệt case | Case review progress | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.bar.locked.DRAFT` | Phê duyệt và Xuất bản bị khóa cho đến khi case được đánh dấu đã rà soát. | Approve and Publish stay locked until the case is marked as reviewed. | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.bar.locked.REVIEWED` | Có thể phê duyệt; Xuất bản vẫn khóa. | You can approve now; Publish stays locked. | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.bar.locked.APPROVED` | Nội dung đã chốt. Có thể xuất bản cho sinh viên hoặc trả về bản nháp để sửa tiếp. | The content is final. Publish it for students or return it to draft to keep editing. | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.bar.locked.PUBLISHED` | Sinh viên trong khóa đã thấy case. Chỉ còn sao chép đường dẫn gửi lớp. | Students in the course can see the case. Only copying the class link remains. | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.publishModal.description` | Sau khi xuất bản, sinh viên trong khóa {{course}} có thể mở và làm case này. | Once published, students in {{course}} can open and work on this case. | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.publishModal.descriptionNoCourse` | Sau khi xuất bản, sinh viên trong khóa có thể mở và làm case này. | Once published, students in the course can open and work on this case. | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.publishModal.points` | {{count}} điểm quyết định | {{count}} decision points | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.publishModal.outcomes` | {{count}} kết cục | {{count}} outcomes | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.publishModal.checkTree` | Cây quyết định hợp lệ, mọi nhánh đều dẫn tới kết cục | The decision tree is valid and every branch reaches an outcome | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.publishModal.checkConsequences` | Mọi phương án đều có hậu quả | Every option has a consequence | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.publishModal.checkApproved` | Đã rà soát và phê duyệt | Reviewed and approved | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.publishModal.checkContext` | Đã có bối cảnh & số liệu | Context and data are filled in | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.publishModal.checkProblem` | Đã có vấn đề cần phân tích | The problem to analyse is filled in | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.publishModal.checkOk` | Đạt | Passed | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.publishModal.checkFailed` | Chưa đạt | Not passed | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.publishModal.warning` | Sau khi xuất bản, nội dung case không chỉnh sửa được. | After publishing, the case content can no longer be edited. | PROPOSED | — | — | Figma 03.4–03.7 (missing keys on develop) |
| `caseReview.errors.invalid` | Dữ liệu chưa hợp lệ. Hãy kiểm tra lại các trường đã sửa. | Some data is not valid. Check the fields you changed. | PROPOSED | — | — | FE-009/FE-010 node editor (missing keys on develop) |
| `caseReview.errors.forbidden` | Bạn không có quyền thực hiện thao tác này. | You do not have permission for this action. | PROPOSED | — | — | FE-009/FE-010 node editor (missing keys on develop) |
| `caseReview.errors.notFound` | Không tìm thấy case hoặc nội dung cần lưu. | The case or the content to save was not found. | PROPOSED | — | — | FE-009/FE-010 node editor (missing keys on develop) |
| `caseReview.errors.conflict` | Thao tác xung đột với dữ liệu hiện tại. | This action conflicts with the current data. | PROPOSED | — | — | FE-009/FE-010 node editor (missing keys on develop) |
| `caseReview.errors.network` | Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại. | Cannot reach the server. Check your connection and try again. | PROPOSED | — | — | FE-009/FE-010 node editor (missing keys on develop) |
| `caseReview.errors.generic` | Đã có lỗi xảy ra. Vui lòng thử lại. | Something went wrong. Please try again. | PROPOSED | — | — | FE-009/FE-010 node editor (missing keys on develop) |
| `g2.courses.details.inviteCode` | Mã mời sinh viên | Student invite code | PROPOSED | — | — | FE-028/BE-029 |
| `g2.courses.details.inviteCodeHelp` | Sinh viên dùng mã này để tham gia lớp học trên Bàn học của mình. | Students use this code to join the class on their Student Desk. | PROPOSED | — | — | FE-028/BE-029 |
| `g2.courses.details.copyCode` | Sao chép mã | Copy code | PROPOSED | — | — | FE-028/BE-029 |
| `g2.courses.details.codeCopied` | Đã sao chép mã mời vào bộ nhớ tạm | Invite code copied to clipboard | PROPOSED | — | — | FE-028/BE-029 |
| `g2.courses.details.rotateCode` | Đổi mã mới | Rotate code | PROPOSED | — | — | FE-028/BE-029 |
| `g2.courses.details.createCode` | Tạo mã mời | Create invite code | PROPOSED | — | — | FE-028/BE-029 |
| `g2.courses.details.noCodeYet` | Chưa tạo mã mời | No invite code yet | PROPOSED | — | — | FE-028/BE-029 |
| `g2.courses.details.disableCode` | Vô hiệu hóa | Disable code | PROPOSED | — | — | FE-028/BE-029 |
| `g2.courses.details.enableCode` | Cấp lại mã | Re-enable code | PROPOSED | — | — | FE-028/BE-029 |
| `g2.courses.details.codeDisabled` | Mã mời đã bị vô hiệu hóa | Invite code is disabled | PROPOSED | — | — | FE-028/BE-029 |
| `g2.courses.details.copyError` | Không thể sao chép mã mời vào bộ nhớ tạm | Unable to copy invite code to clipboard | PROPOSED | — | — | FE-028/BE-029 |
| `g2.courses.details.createError` | Không thể tạo mã mời sinh viên | Unable to create student invite code | PROPOSED | — | — | FE-028/BE-029 |
| `g2.courses.details.rotateError` | Không thể đổi mã mời mới | Unable to rotate invite code | PROPOSED | — | — | FE-028/BE-029 |
| `g2.courses.details.disableError` | Không thể vô hiệu hóa mã mời | Unable to disable invite code | PROPOSED | — | — | FE-028/BE-029 |
| `g2.courses.details.loadError` | Không thể tải thông tin mã mời | Unable to load invite code information | PROPOSED | — | — | FE-028/BE-029 |
| `g5.desk.title` | Bàn học | Student Desk | PROPOSED | — | — | FE-028/BE-029 |
| `g5.desk.stats.enrolledCourses` | Lớp học đã tham gia | Enrolled classes | PROPOSED | — | — | FE-028/BE-029 |
| `g5.desk.stats.activeCases` | Bài làm đang dở | In-progress attempts | PROPOSED | — | — | FE-028/BE-029 |
| `g5.desk.stats.publishedCases` | Case study khả dụng | Available cases | PROPOSED | — | — | FE-028/BE-029 |
| `g5.desk.activeCasesTitle` | Tiếp tục bài làm dở | Continue in-progress cases | PROPOSED | — | — | FE-028/BE-029 |
| `g5.desk.continueCase` | Làm tiếp | Resume | PROPOSED | — | — | FE-028/BE-029 |
| `g5.desk.myCoursesTitle` | Học phần của tôi | My Courses | PROPOSED | — | — | FE-028/BE-029 |
| `g5.desk.noActiveCases` | Không có case nào đang làm dở. | No cases in progress. | PROPOSED | — | — | FE-028/BE-029 |
| `g5.desk.noEnrolledCourses` | Chưa tham gia khóa học nào. | You have not enrolled in any course yet. | PROPOSED | — | — | FE-028/BE-029 |
| `g5.courses.joinSuccess` | Tham gia lớp học thành công! | Successfully joined class! | PROPOSED | — | — | FE-028/BE-029 |
| `g5.courses.enrolledAt` | Đã tham gia: {{date}} | Enrolled on: {{date}} | PROPOSED | — | — | FE-028/BE-029 |
| `g5.courses.viewCases` | Vào học | View cases | PROPOSED | — | — | FE-028/BE-029 |
| `g5.courses.error.invalidCode` | Mã lớp không hợp lệ hoặc để trống. | Invalid or empty class code. | PROPOSED | — | — | FE-028/BE-029 |
| `g5.courses.error.notFound` | Mã lớp không tồn tại. Vui lòng kiểm tra lại. | Class code does not exist. Please check again. | PROPOSED | — | — | FE-028/BE-029 |
| `g5.courses.error.archived` | Khóa học này đã được lưu trữ, không thể tham gia. | This course has been archived and cannot be joined. | PROPOSED | — | — | FE-028/BE-029 |
| `g5.courses.error.alreadyEnrolled` | Bạn đã tham gia lớp học phần này rồi. | You have already joined this class. | PROPOSED | — | — | FE-028/BE-029 |
| `g5.courses.error.disabled` | Mã lớp này đã hết hạn hoặc bị giảng viên vô hiệu hóa. | This class code has expired or was disabled by the lecturer. | PROPOSED | — | — | FE-028/BE-029 |
| `g5.courses.error.generic` | Không thể tham gia lớp học. Vui lòng thử lại sau. | Could not join class. Please try again later. | PROPOSED | — | — | FE-028/BE-029 |
| `g5.challenge.counterQuestionLabel` | Câu hỏi phản biện từ AI | AI counter-question | PROPOSED | — | — | FE-021/BE-027 |
| `g5.challenge.completedSubtitle` | Vòng 2/2 · Đã hoàn tất. Phiên phản biện đã kết thúc sau 2 vòng. Câu trả lời của bạn được lưu cùng lập luận ở bước {{n}}. Không có điểm số. | Round 2/2 · Completed. The challenge session concluded after 2 rounds. Your answer is saved alongside your reasoning at step {{n}}. No score is assigned. | PROPOSED | — | — | FE-021/BE-027 |
| `g5.challenge.r1Question` | Vòng 1 · Câu hỏi phản biện từ AI | Round 1 · AI counter-question | PROPOSED | — | — | FE-021/BE-027 |
| `g5.challenge.r1Answer` | Vòng 1 · Câu trả lời của bạn | Round 1 · Your response | PROPOSED | — | — | FE-021/BE-027 |
| `g5.challenge.r2Question` | Vòng 2 · Câu hỏi phản biện từ AI | Round 2 · AI counter-question | PROPOSED | — | — | FE-021/BE-027 |
| `g5.challenge.completedFooter` | Vòng 2 / 2 · Đã hoàn tất · Không chấm điểm | Round 2 / 2 · Completed · Not graded | PROPOSED | — | — | FE-021/BE-027 |
| `g5.challenge.backToReview` | Quay lại Journey Review | Back to Journey Review | PROPOSED | — | — | FE-021/BE-027 |
| `g5.challenge.loading` | Đang tải phiên phản biện AI... | Loading AI challenge session... | PROPOSED | — | — | FE-021/BE-027 |
| `g5.challenge.generating` | AI đang chuẩn bị câu hỏi phản biện... | AI is generating counter-question... | PROPOSED | — | — | FE-021/BE-027 |
| `g5.challenge.sending` | Đang gửi phản hồi... | Sending response... | PROPOSED | — | — | FE-021/BE-027 |
| `g5.challenge.errorTitle` | Không thể tải phản biện AI | Unable to load AI challenge | PROPOSED | — | — | FE-021/BE-027 |
| `g5.challenge.retry` | Thử lại | Retry | PROPOSED | — | — | FE-021/BE-027 |
| `g5.challenge.roundLabel` | Vòng {{round}} | Round {{round}} | PROPOSED | — | — | FE-021/BE-027 |
| `g5.challenge.unavailableBody` | Lưu lập luận trước khi mở phản biện AI. Bạn vẫn có thể tiếp tục Journey Review. | Save your reasoning before opening the AI challenge. You can still continue Journey Review. | PROPOSED | — | — | FE-021/BE-027 |
| `g5.challenge.errors.maxRoundsReached` | Phiên phản biện đã hoàn tất 2 vòng tối đa. Không thể gửi thêm câu trả lời. | Challenge support session has reached the maximum of 2 rounds. No further replies can be submitted. | PROPOSED | — | — | FE-021/BE-027 |
| `g5.challenge.errors.aiUnavailable` | Dịch vụ AI tạm thời không phản hồi. Vui lòng thử lại sau ít phút. | AI Challenge Support service is temporarily unavailable. Please retry shortly. | PROPOSED | — | — | FE-021/BE-027 |
| `g5.challenge.errors.forbidden` | Bạn không có quyền truy cập phiên phản biện này. | You do not have permission to access this challenge session. | PROPOSED | — | — | FE-021/BE-027 |
| `g5.challenge.errors.notFound` | Không tìm thấy dữ liệu phiên phản biện. | Challenge support session not found. | PROPOSED | — | — | FE-021/BE-027 |
| `g5.challenge.errors.generic` | Đã xảy ra lỗi trong quá trình phản biện. Vui lòng thử lại. | An error occurred during challenge support. Please retry. | PROPOSED | — | — | FE-021/BE-027 |
| `g5.feedback.errors.validation` | Nội dung phản tư không hợp lệ (tối thiểu 10 ký tự, tối đa 3000 ký tự). | Invalid reflection content (must be between 10 and 3000 characters). | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.errors.forbidden` | Bạn không có quyền thực hiện thao tác này. | You do not have permission to perform this action. | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.errors.notFound` | Không tìm thấy bài nộp hoặc tình huống học tập. | The submission or learning case could not be found. | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.errors.conflict` | Bài nộp chưa có nhận xét của giảng viên hoặc đã được phản tư trước đó. | The submission is either not yet reviewed or reflection has already been submitted. | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.errors.network` | Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại. | Unable to connect to the server. Please check your connection and try again. | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.errors.generic` | Đã xảy ra lỗi không xác định. Vui lòng thử lại sau. | An unexpected error occurred. Please try again later. | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.errors.loadFeedback` | Không thể tải nhận xét của giảng viên. | Unable to load lecturer feedback. | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.analysisTitle` | 1. Phân tích tình huống (Situation Analysis) | 1. Situation Analysis | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.backToCase` | Quay lại tình huống | Back to Case | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.backToDesk` | Về Bàn học | Back to Desk | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.caseAndCourse` | Tình huống: {{case}} · Học phần: {{course}} | Case: {{case}} · Course: {{course}} | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.emptyAnalysis` | Sinh viên không điền phân tích tình huống | No situation analysis provided | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.feedbackSentAt` | Gửi ngày {{time}} | Sent on {{time}} | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.lecturerFeedbackNotice` | Nhận xét 100% mang tính định tính sư phạm từ giảng viên. Tuyệt đối không có điểm số hay AI chấm điểm. | 100% human qualitative academic feedback. Strictly no grading, points, or AI scoring. | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.lecturerFeedbackTitle` | Nhận xét định tính của giảng viên | Lecturer Qualitative Feedback | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.noFeedbackYet` | Chưa có nhận xét nào từ giảng viên | No feedback provided yet | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.notFoundBody` | Bài nộp không tồn tại hoặc đã bị xóa. | The submission does not exist or has been removed. | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.notFoundTitle` | Không tìm thấy bài làm | Submission Not Found | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.pendingBody` | Giảng viên của bạn chưa gửi nhận xét định tính cho bài làm này. Ô phản tư sẽ được mở sau khi có nhận xét từ giảng viên. | Your lecturer has not provided qualitative feedback for this submission yet. The reflection composer will unlock once feedback is available. | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.pendingTitle` | Bài làm đang chờ Giảng viên nhận xét | Awaiting Lecturer Feedback | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.reasoningTitle` | 3. Lập luận căn cứ & Đánh đổi (Supporting Reasoning) | 3. Supporting Reasoning & Trade-offs | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.reflectedBadge` | Đã phản tư (REFLECTED) | Reflected (REFLECTED) | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.reflectionDescription` | Sau khi đọc nhận xét định tính của giảng viên, hãy viết bài phản tư so sánh, đánh giá lại lập luận hoặc giải pháp ban đầu của bạn. | After reading the lecturer's qualitative feedback, write a reflective commentary comparing your initial reasoning and proposed solution. | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.reflectionFailed` | Không thể nộp bài phản tư: {{error}} | Failed to submit reflection: {{error}} | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.reflectionHelper` | {{current}} / {{max}} ký tự | {{current}} / {{max}} characters | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.reflectionLockedNotice` | Bài phản tư chỉ được mở sau khi giảng viên đã gửi nhận xét định tính (trạng thái REVIEWED). | Reflection unlocks only after the lecturer has submitted qualitative feedback (REVIEWED status). | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.reflectionLockedTitle` | Ô nhập bài phản tư đang bị khóa | Reflection Composer is Locked | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.reflectionMin` | Bài phản tư phải có ít nhất 10 ký tự. | Reflection commentary must contain at least 10 characters. | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.reflectionPlaceholder` | Viết bài phản tư của bạn tại đây (tối thiểu 10 ký tự)... | Write your post-feedback reflection here (minimum 10 characters)... | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.reflectionSubmittedAt` | Đã nộp phản tư lúc {{time}} | Reflection submitted at {{time}} | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.reflectionSubmittedNotice` | Bạn đã hoàn tất nộp bài phản tư cho tình huống này. Bài làm đã hoàn tất chu trình học tập. | You have completed your post-feedback reflection. Your learning cycle for this case is complete. | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.reflectionSuccess` | Đã nộp bài phản tư thành công. Trạng thái bài làm đã chuyển sang REFLECTED. | Reflection submitted successfully. Submission status transitioned to REFLECTED. | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.reflectionTitle` | Bài phản tư tổng kết của sinh viên | Student Post-Feedback Reflection | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.reviewedBadge` | Đã nhận xét (REVIEWED) | Reviewed (REVIEWED) | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.solutionTitle` | 2. Phương án giải pháp (Proposed Solution) | 2. Proposed Solution | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.submissionDetailsTitle` | Nội dung bài làm của bạn | Your Submitted Work | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.submitReflection` | Nộp bài phản tư | Submit Reflection | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.submittedAt` | Nộp lúc {{time}} | Submitted at {{time}} | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.submittedBadge` | Đã nộp bài (SUBMITTED) | Submitted (SUBMITTED) | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.submittingReflection` | Đang nộp bài phản tư... | Submitting reflection... | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.title` | Nhận xét của Giảng viên & Bài phản tư | Lecturer Feedback & Student Reflection | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.unauthorizedBody` | Bạn không có quyền xem bài làm hoặc nhận xét này. Chỉ sinh viên sở hữu bài nộp mới có thể truy cập. | You do not have permission to view this submission or its feedback. Only the author student can access this view. | PROPOSED | — | — | FE-020 PR #69 |
| `g5.feedback.unauthorizedTitle` | Không có quyền truy cập | Access Denied | PROPOSED | — | — | FE-020 PR #69 |
| `g1.select.placeholder` | -- Chọn một mục -- | -- Select an item -- | PROPOSED | — | — | PR-71-FIX |
| `g1.select.searchPlaceholder` | Tìm nhanh khoa hoặc đơn vị... | Search faculty or department... | PROPOSED | — | — | PR-71-FIX |
| `g1.select.noResults` | Không tìm thấy khoa phù hợp. Bạn có thể chọn mục "Đơn vị / Khoa khác..." ở dưới cùng. | No matching faculty found. You can select "Other Faculty / Department..." at the bottom. | PROPOSED | — | — | PR-71-FIX |
| `g1.select.otherCategory` | Khác | Other | PROPOSED | — | — | PR-71-FIX |
| `g1.register.departmentSelectPlaceholder` | -- Chọn Khoa / Đơn vị công tác -- | -- Select Faculty / Department -- | PROPOSED | — | — | PR-71-FIX |
| `g1.register.customDepartmentLabel` | Tên Khoa / Đơn vị công tác cụ thể | Specific Faculty / Department name | PROPOSED | — | — | PR-71-FIX |
| `g1.register.customDepartmentPlaceholder` | Ví dụ: Viện Nghiên cứu & Phát triển Công nghệ cao | e.g. Institute of Advanced Technology Research | PROPOSED | — | — | PR-71-FIX |
| `g1.register.departmentOther` | Đơn vị / Khoa khác... | Other Faculty / Department... | PROPOSED | — | — | PR-71-FIX |
| `g5.reviewStudy.oneSubmissionNote` | Chế độ Review Study cho phép nộp một lần duy nhất. | Review Study permits exactly one submission per case. | PROPOSED | — | — | FE-025 spec 006 |
| `g2.common.error` | Lỗi | Error | PROPOSED | — | — | FE-026 PR #72 |
| `g2.courses.details.retry` | Thử lại | Retry | PROPOSED | — | — | FE-026 PR #72 |
| `g2.courses.details.statAttempts` | Lượt làm bài | Attempts | PROPOSED | — | — | FE-026 PR #72 |
| `g2.materials.retry` | Thử lại | Retry | PROPOSED | — | — | FE-026 PR #72 |
| `g2.materials.statusFailedReason` | Không đọc được nội dung tệp | Could not read file content | PROPOSED | — | — | FE-026 PR #72 |
| `g4.stats.noData` | Chưa có dữ liệu thống kê | No statistics yet | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.kpi.completion` | Tỷ lệ hoàn thành | Completion rate | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.kpi.avgAttempts` | Số lần làm trung bình | Average attempts | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.kpi.inProgress` | Đang trong hành trình | Currently in a journey | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.kpi.totalAttempts` | Tổng lượt làm | Total attempts | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.kpi.singleVsRetry` | Lần đầu / Làm lại | Single / Retry | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.kpi.reflectionsSubmitted` | Bài phản tư đã nộp | Reflections submitted | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.filters.course` | Lọc theo khóa học | Filter by course | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.filters.allCourses` | Mọi khóa học | All courses | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.filters.case` | Lọc theo tình huống | Filter by case | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.filters.allCases` | Tất cả tình huống | All cases | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.filters.selectCase` | — Chọn tình huống — | — Select a case study — | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.filters.branchingOnly` | Tình huống rẽ nhánh (Branching Study) | Branching Study Cases | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.panels.choices` | Phân bổ nhánh quyết định sinh viên lựa chọn | Branch selection distribution | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.panels.attempts` | Thống kê số lượt thử (Single vs. Retry) | Attempts statistics (Single vs. Retry) | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.panels.outcomes` | Kết cục cuối cùng của hành trình | Terminal outcomes distribution | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.panels.timing` | Thời điểm làm bài | When students work | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.panels.progress` | Tiến độ của sinh viên đã mở case | Progress of students who opened a case | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.panels.popular` | Lựa chọn phổ biến theo điểm | Popular choices per decision point | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.branchChart.title` | Biểu đồ phân bổ nhánh quyết định sinh viên lựa chọn | Branch selection distribution chart | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.branchChart.subtitle` | Tần suất và tỷ lệ sinh viên lựa chọn từng phương án rẽ nhánh tại các điểm quyết định | Frequency and percentage of students choosing options at each decision point | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.branchChart.nodeTitle` | Điểm quyết định: {{title}} | Decision Point: {{title}} | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.branchChart.selections` | {{count}} lượt chọn | {{count}} selections | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.branchChart.percent` | {{percent}}% | {{percent}}% | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.branchChart.noBranches` | Tình huống này chưa có dữ liệu rẽ nhánh hoặc thuộc chế độ Review Study. | This case has no branch data or is in Review Study mode. | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.branchChart.emptyCase` | Chưa có sinh viên nào tham gia rẽ nhánh cho tình huống này. | No students have traversed branches in this case yet. | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.outcomes.title` | Kết cục cuối cùng của hành trình | Terminal outcomes distribution | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.outcomes.subtitle` | Tỷ lệ sinh viên kết thúc tại các nút kết cục (terminal nodes) | Percentage of students reaching each terminal conclusion node | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.outcomes.terminalNode` | Kết cục: {{title}} | Outcome: {{title}} | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.outcomes.reachCount` | {{count}} lượt kết thúc ({{percent}}%) | {{count}} completions ({{percent}}%) | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.outcomes.emptyOutcomes` | Chưa có sinh viên nào đi đến kết cục cuối cùng. | No students have reached a terminal outcome yet. | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.attempts.title` | Thống kê số lượt thử (Attempts) | Attempts statistics | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.attempts.subtitle` | Tỷ lệ lượt làm một lần duy nhất so với các lượt thử lại để khám phá các nhánh khác | Ratio of single-attempt completions versus retry attempts to explore alternative paths | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.attempts.singleLabel` | Lượt làm lần đầu (Single Attempt) | Single Attempt | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.attempts.retryLabel` | Lượt làm lại (Retry Attempt) | Retry Attempt | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.attempts.singleVsRetry` | Tỷ lệ Lần đầu / Làm lại: {{single}} / {{retry}} | Single / Retry Ratio: {{single}} / {{retry}} | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.attempts.totalLabel` | Tổng lượt thực hiện: {{total}} | Total attempts: {{total}} | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.attempts.emptyAttempts` | Chưa có dữ liệu lượt làm. | No attempts data available yet. | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.openCases` | Case đang mở | Open cases | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.openCasesEmpty` | Chưa có case nào được xuất bản. | No case has been published yet. | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.openCasesError` | Không tải được danh sách case | Could not load cases | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.published` | Xuất bản | Published | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.updatedOn` | Cập nhật ngày {{date}} | Updated on {{date}} | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.recent` | Bài nộp gần đây | Recent submissions | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.recentUnavailable` | Chưa có dữ liệu bài nộp: hệ thống chưa cung cấp danh sách bài làm cho giảng viên. | No submission data: the system does not provide student work to lecturers yet. | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.prompt.title` | Chọn tình huống để xem thống kê luồng học tập | Select a case study to view learning analytics | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.prompt.description` | Chọn một khóa học và tình huống từ thanh bộ lọc phía trên để theo dõi dữ liệu rẽ nhánh và hành vi của người học. | Select a course and a case study from the filters above to track branching data and student cohort behavior. | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.emptyCase.title` | Chưa có lượt làm nào | No attempts yet | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.emptyCase.description` | Tình huống này chưa có sinh viên nào tham gia làm bài hoặc gửi kết quả. | No students have participated in or submitted work for this case yet. | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.reviewStudy.title` | Tiến độ bài phân tích tình huống (Review Study) | Review Study analytical progress | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.reviewStudy.subtitle` | Thống kê bài nộp theo các giai đoạn: Đã nộp bài, Giảng viên đã nhận xét và Sinh viên đã hoàn tất phản tư | Submission statistics across stages: Submitted, Lecturer reviewed, and Student reflected | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.reviewStudy.submitted` | Đã nộp bài (chờ nhận xét) | Submitted (awaiting review) | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.reviewStudy.reviewed` | Giảng viên đã nhận xét | Lecturer reviewed | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.reviewStudy.reflected` | Sinh viên đã phản tư | Student reflected | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.reviewStudy.totalSubmissions` | Tổng số bài nộp | Total submissions | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.flow.title` | Trạng thái luồng học tập | Learning flow status | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.flow.subtitle` | Phân bổ sinh viên qua các giai đoạn của hành trình học tập | Student distribution across learning journey stages | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.flow.inProgress` | Đang trong hành trình | In progress | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.flow.completed` | Đã hoàn thành hành trình | Journey completed | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.flow.reflected` | Đã hoàn tất phản tư | Reflection completed | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.flow.participants` | Sinh viên tham gia | Participating students | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.errors.notFound` | Không tìm thấy dữ liệu thống kê cho tình huống này. | Statistics data for this case was not found. | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.errors.forbidden` | Bạn không có quyền xem thống kê của tình huống này. | You do not have permission to view statistics for this case. | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.errors.serverError` | Lỗi máy chủ khi tải thống kê. Vui lòng thử lại sau. | Server error loading statistics. Please try again later. | PROPOSED | — | — | FE-022 PR #70 |
| `g4.stats.errors.network` | Không thể kết nối đến máy chủ. Kiểm tra mạng rồi thử lại. | Cannot connect to server. Check your connection and try again. | PROPOSED | — | — | FE-022 PR #70 |
| `g6.noData.apiUnavailable` | Dịch vụ quản trị chưa sẵn sàng trên máy chủ. | The administration service is not available on the server yet. | PROPOSED | — | — | FE-032 PR #75 |
| `g6.noData.forbidden` | Bạn không có quyền quản trị để thực hiện thao tác này. | You do not have administrator permissions for this action. | PROPOSED | — | — | FE-032 PR #75 |
| `g6.noData.serverError` | Máy chủ gặp sự cố khi xử lý dữ liệu quản trị. Vui lòng thử lại sau. | The server encountered an error processing admin data. Please try again later. | PROPOSED | — | — | FE-032 PR #75 |
| `g6.noData.networkError` | Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại. | Cannot connect to server. Please check your network and try again. | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.loadErrorTitle` | Lỗi tải dữ liệu người dùng | Failed to load user data | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.emptyFilteredTitle` | Không tìm thấy người dùng | No users found | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.emptyFilteredDescription` | Không có tài khoản người dùng nào khớp với bộ lọc hiện tại. | No user accounts match the current filters. | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.loading` | Đang tải danh sách người dùng... | Loading users... | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.kpi.totalUsers` | Tổng người dùng | Total users | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.kpi.lecturers` | Giảng viên | Lecturers | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.kpi.students` | Sinh viên | Students | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.kpi.lockedUsers` | Tài khoản bị khóa | Locked accounts | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.searchPlaceholder` | Tìm hoặc email người dùng... | Search by name or email... | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.filterRoleAria` | Lọc theo vai trò | Filter by role | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.filterRole.all` | Mọi vai trò | All roles | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.filterRole.lecturer` | Giảng viên | Lecturers | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.filterRole.student` | Sinh viên | Students | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.filterRole.admin` | Quản trị viên | Administrators | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.filterStatusAria` | Lọc theo trạng thái | Filter by status | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.filterStatus.all` | Tất cả trạng thái | All statuses | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.filterStatus.active` | Hoạt động | Active | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.filterStatus.locked` | Đã khóa | Locked | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.sortAria` | Sắp xếp | Sort | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.sort.newest` | Sắp xếp: Mới tạo | Sort: Newest | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.sort.name` | Sắp xếp: Tên A-Z | Sort: Name A-Z | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.columns.user` | Người dùng | User | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.columns.createdAt` | Ngày tạo | Created date | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.columns.role` | Vai trò & Khóa học | Role & Courses | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.columns.attempts` | Lượt làm | Attempts | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.columns.action` | Hành động | Action | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.columns.status` | Trạng thái | Status | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.role.lecturer` | Giảng viên | Lecturer | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.role.student` | Sinh viên | Student | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.role.admin` | Quản trị viên | Administrator | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.action.lock` | Khóa tài khoản | Lock account | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.action.unlock` | Mở khóa | Unlock account | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.status.active` | Hoạt động | Active | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.status.locked` | Đã khóa | Locked | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.pagination.showing` | Hiển thị {{shown}} trên {{total}} người dùng | Showing {{shown}} of {{total}} users | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.pagination.prev` | Trang trước | Previous page | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.pagination.next` | Trang sau | Next page | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.dialog.lockTitle` | Khóa tài khoản {{name}}? | Lock account {{name}}? | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.dialog.unlockTitle` | Mở khóa tài khoản {{name}}? | Unlock account {{name}}? | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.dialog.lockDescription` | Người dùng sẽ không đăng nhập được cho tới khi được mở khóa. Lượt làm, bài nộp và suy ngẫm vẫn được giữ nguyên. | The user will not be able to sign in until unlocked. Attempts, submissions, and reflections are preserved. | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.dialog.unlockDescription` | Người dùng sẽ có thể đăng nhập lại và tiếp tục truy cập các học phần bình thường. | The user will be able to sign in again and access courses normally. | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.dialog.lockConfirm` | Khóa tài khoản | Lock account | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.dialog.unlockConfirm` | Mở khóa | Unlock | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.dialog.cancel` | Hủy bỏ | Cancel | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.toast.lockSuccess` | Đã khóa tài khoản {{name}} | Locked account {{name}} | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.toast.unlockSuccess` | Đã mở khóa tài khoản {{name}} | Unlocked account {{name}} | PROPOSED | — | — | FE-032 PR #75 |
| `g6.users.toast.actionError` | Có lỗi xảy ra khi thay đổi trạng thái tài khoản. | An error occurred while changing user account status. | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.header` | Khóa học toàn hệ thống | System-wide courses | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.loadErrorTitle` | Lỗi tải danh sách khóa học | Failed to load courses | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.emptyFilteredTitle` | Không có khóa học nào | No courses found | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.emptyFilteredDescription` | Không tìm thấy khóa học nào phù hợp với điều kiện tìm kiếm. | No courses matched the search criteria. | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.loading` | Đang tải danh sách khóa học... | Loading courses... | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.searchPlaceholder` | Tìm khóa học... | Search courses... | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.filterStatusAria` | Lọc theo trạng thái | Filter by status | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.filterStatus.all` | Tất cả trạng thái | All statuses | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.filterStatus.active` | Đang mở | Open | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.filterStatus.archived` | Đã lưu trữ | Archived | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.status.teaching` | Đang dạy | Active | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.status.archived` | Đã lưu trữ | Archived | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.stats.materials` | {{ready}}/{{total}} tài liệu sẵn sàng | {{ready}}/{{total}} materials ready | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.stats.cases` | {{count}} case | {{count}} cases | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.stats.indexingError` | {{count}} tệp lỗi lập chỉ mục | {{count}} indexing errors | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.pagination.showing` | Hiển thị {{shown}} trên {{total}} khóa học | Showing {{shown}} of {{total}} courses | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.pagination.prev` | Trang trước | Previous page | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.pagination.next` | Trang sau | Next page | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.detail.title` | Chi tiết khóa học | Course details | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.detail.viewDetail` | Xem chi tiết | View details | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.detail.close` | Đóng chi tiết | Close details | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.detail.attempts` | Lượt làm bài | Study attempts | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.detail.materials` | Tài liệu | Materials | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.detail.cases` | Case Study | Case Studies | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.detail.about` | Về khóa học | About this course | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.detail.infoTitle` | Thông tin khóa học | Course information | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.detail.courseCode` | Mã học phần: | Course code: | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.detail.statusLabel` | Trạng thái: | Status: | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.detail.statusOpen` | Đang mở cho sinh viên | Open for students | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.detail.statusArchived` | Đã lưu trữ | Archived | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.detail.lecturerLabel` | Giảng viên phụ trách: | Lead lecturer: | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.detail.navTitle` | Đi tới | Go to | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.detail.navMaterials` | Tài liệu môn học | Course materials | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.detail.navMaterialsSub` | {{count}} tệp - {{ready}} sẵn sàng{{errorPart}} | {{count}} files - {{ready}} ready{{errorPart}} | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.detail.navMaterialsError` | , {{count}} lỗi | , {{count}} errors | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.detail.navCases` | Case Study | Case Studies | PROPOSED | — | — | FE-032 PR #75 |
| `g6.courses.detail.navCasesSub` | {{count}} case | {{count}} cases | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.header` | Case Study toàn hệ thống | System-wide Case Studies | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.loadErrorTitle` | Lỗi tải Case Study | Failed to load Case Studies | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.emptyFilteredTitle` | Không tìm thấy Case Study | No Case Studies found | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.emptyFilteredDescription` | Không có tình huống nào khớp với bộ lọc hiện tại. | No cases matched the current filters. | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.loading` | Đang tải danh sách Case... | Loading Case Studies... | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.totalSuffix` | Case Study | Case Studies | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.status.draft` | Bản nháp | Draft | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.status.reviewed` | Đã rà soát | Reviewed | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.status.approved` | Đã phê duyệt | Approved | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.status.published` | Đã xuất bản | Published | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.analytics.modeBranching` | Branching | Branching | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.analytics.modeReview` | Review | Review | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.analytics.recentTitle` | Case cập nhật gần đây | Recently updated cases | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.searchPlaceholder` | Tìm case... | Search cases... | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.tabs.all` | Tất cả {{total}} | All {{total}} | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.tabs.draft` | Bản nháp {{count}} | Draft {{count}} | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.tabs.reviewed` | Đã rà soát {{count}} | Reviewed {{count}} | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.tabs.published` | Đã xuất bản {{count}} | Published {{count}} | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.card.aiDraft` | AI Draft | AI Draft | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.card.branchingMode` | Branching Study | Branching Study | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.card.reviewMode` | Review Study | Review Study | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.card.nodesCount` | {{count}} nút | {{count}} nodes | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.card.noTree` | Không dùng cây | No decision tree | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.card.updatedAt` | Cập nhật {{date}} | Updated {{date}} | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.card.viewAction` | Xem | View | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.pagination.showing` | Hiển thị {{shown}} trên {{total}} Case Study | Showing {{shown}} of {{total}} Case Studies | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.pagination.prev` | Previous page | Previous page | PROPOSED | — | — | FE-032 PR #75 |
| `g6.cases.pagination.next` | Next page | Next page | PROPOSED | — | — | FE-032 PR #75 |
| `g6.aiService.config.lastUpdatedLabel` | Cập nhật lần cuối | Last updated | PROPOSED | — | — | FE-032 PR #75 |
| `g6.aiService.loadErrorTitle` | Lỗi dịch vụ AI | AI service error | PROPOSED | — | — | FE-032 PR #75 |
| `g6.aiService.loading` | Đang tải thông tin dịch vụ AI... | Loading AI service information... | PROPOSED | — | — | FE-032 PR #75 |
| `g6.aiService.kpi.totalGenerated` | Lượt sinh case | Case generations | PROPOSED | — | — | FE-032 PR #75 |
| `g6.aiService.kpi.totalGeneratedDesc` | Tổng số bản nháp AI đã sinh | Total AI drafts generated | PROPOSED | — | — | FE-032 PR #75 |
| `g6.aiService.kpi.avgDuration` | Thời gian sinh TB | Avg duration | PROPOSED | — | — | FE-032 PR #75 |
| `g6.aiService.kpi.avgDurationValue` | {{seconds}} giây | {{seconds}} seconds | PROPOSED | — | — | FE-032 PR #75 |
| `g6.aiService.kpi.avgDurationDesc` | Từ lúc gửi yêu cầu đến khi có bản nháp | From request to draft generation | PROPOSED | — | — | FE-032 PR #75 |
| `g6.aiService.kpi.readyMaterials` | Tài liệu sẵn sàng | Ready materials | PROPOSED | — | — | FE-032 PR #75 |
| `g6.aiService.kpi.readyMaterialsDesc` | Đã lập chỉ mục, AI có thể trích dẫn | Indexed and ready for AI citations | PROPOSED | — | — | FE-032 PR #75 |
| `g6.aiService.gen.duration` | Hoàn tất sau {{seconds}} giây | Completed in {{seconds}} seconds | PROPOSED | — | — | FE-032 PR #75 |
| `g6.aiService.gen.decisions` |  · {{count}} điểm quyết định |  · {{count}} decision points | PROPOSED | — | — | FE-032 PR #75 |
| `g6.aiService.gen.materialsCited` |  · trích từ {{count}} tài liệu |  · cited from {{count}} materials | PROPOSED | — | — | FE-032 PR #75 |
| `g6.aiService.status.completed` | Hoàn tất | Completed | PROPOSED | — | — | FE-032 PR #75 |
| `g6.aiService.status.pending` | Đang chờ | Pending | PROPOSED | — | — | FE-032 PR #75 |
| `g6.aiService.status.processing` | Đang xử lý | Processing | PROPOSED | — | — | FE-032 PR #75 |
| `g6.aiService.status.failed` | Thất bại | Failed | PROPOSED | — | — | FE-032 PR #75 |
| `g6.aiService.status.active` | Hoạt động | Active | PROPOSED | — | — | FE-032 PR #75 |
| `g6.aiService.idx.completed` | {{count}} đoạn trích, sẵn sàng cho AI trích dẫn | {{count}} excerpts, ready for AI citations | PROPOSED | — | — | FE-032 PR #75 |
| `g6.aiService.idx.pending` | Đang chờ trong hàng đợi xử lý | Queued for processing | PROPOSED | — | — | FE-032 PR #75 |
| `g6.aiService.idx.processing` | Đang tách đoạn và tạo vector ({{percent}}%) | Chunking and embedding ({{percent}}%) | PROPOSED | — | — | FE-032 PR #75 |
| `g6.aiService.idx.failedFallback` | Không đọc được nội dung tệp | Unable to read file content | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.loadErrorTitle` | Lỗi tải nhật ký hệ thống | Failed to load system logs | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.emptyFilteredTitle` | Không tìm thấy sự kiện nhật ký | No log events found | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.emptyFilteredDescription` | Không có bản ghi nhật ký nào khớp với điều kiện lọc. | No log records match the filter criteria. | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.loading` | Đang tải nhật ký... | Loading logs... | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.kpi.eventsToday` | Sự kiện hôm nay | Events today | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.kpi.loginCount` | Lượt đăng nhập | Sign-ins | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.kpi.aiGenerationsCount` | Lượt sinh case AI | AI case generations | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.kpi.errorsCount` | Lỗi cần xem | Errors to review | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.searchPlaceholder` | Tìm trong nhật ký... | Search logs... | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.filterEventAria` | Lọc theo loại sự kiện | Filter by event type | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.filterEvent.all` | Mọi loại sự kiện | All event types | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.filterEvent.login` | Đăng nhập | Sign-in | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.filterEvent.aiGen` | Sinh case | AI case generation | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.filterEvent.submission` | Nộp bài | Submission | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.filterEvent.material` | Tài liệu | Materials | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.filterTimeAria` | Lọc theo thời gian | Filter by time | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.filterTime.today` | Hôm nay | Today | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.filterTime.sevenDays` | 7 ngày qua | Past 7 days | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.filterTime.thirtyDays` | 30 ngày qua | Past 30 days | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.filterTime.all` | Tất cả thời gian | All time | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.sortAria` | Sắp xếp | Sort | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.sort.newest` | Sắp xếp: Mới nhất | Sort: Newest | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.sort.oldest` | Sắp xếp: Cũ nhất | Sort: Oldest | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.columns.actor` | Người thực hiện | Actor | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.columns.time` | Thời gian | Time | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.columns.event` | Sự kiện | Event | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.columns.code` | Mã | Code | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.columns.detail` | Chi tiết | Details | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.columns.result` | Kết quả | Result | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.action.viewDetail` | Xem chi tiết | View details | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.status.success` | Thành công | Success | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.status.warning` | Cảnh báo | Warning | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.status.error` | Lỗi | Error | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.pagination.showing` | Hiển thị {{shown}} trên {{total}} sự kiện | Showing {{shown}} of {{total}} events | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.pagination.prev` | Trang trước | Previous page | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.pagination.next` | Trang sau | Next page | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.dialog.title` | Chi tiết sự kiện {{code}} | Event details {{code}} | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.dialog.close` | Đóng | Close | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.dialog.actor` | Người thực hiện: | Actor: | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.dialog.time` | Thời gian: | Time: | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.dialog.action` | Hành động: | Action: | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.dialog.target` | Đối tượng liên quan: | Related target: | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.dialog.technicalDetails` | Chi tiết kỹ thuật: | Technical details: | PROPOSED | — | — | FE-032 PR #75 |
| `g6.logs.dialog.noDetails` | Không có chi tiết bổ sung. | No additional details. | PROPOSED | — | — | FE-032 PR #75 |
| `g6.settings.breadcrumb` | Quản trị hệ thống > Cài đặt | Administration > Settings | PROPOSED | — | — | FE-032 PR #75 |
| `g6.settings.header` | Cài đặt hệ thống | System settings | PROPOSED | — | — | FE-032 PR #75 |
| `g6.settings.loadErrorTitle` | Lỗi cài đặt hệ thống | Failed to load system settings | PROPOSED | — | — | FE-032 PR #75 |
| `g6.settings.loading` | Đang tải cài đặt hệ thống... | Loading system settings... | PROPOSED | — | — | FE-032 PR #75 |
| `g6.settings.toast.saveSuccess` | Đã lưu và áp dụng cài đặt hệ thống thành công. | System settings saved and applied successfully. | PROPOSED | — | — | FE-032 PR #75 |
| `g6.settings.toast.saveError` | Lỗi khi lưu cài đặt hệ thống. | Failed to save system settings. | PROPOSED | — | — | FE-032 PR #75 |
| `g6.settings.form.platformName` | Tên nền tảng * | Platform name * | PROPOSED | — | — | FE-032 PR #75 |
| `g6.settings.form.operatorUnit` | Đơn vị vận hành | Operating unit | PROPOSED | — | — | FE-032 PR #75 |
| `g6.settings.form.loginNoticeTitle` | Thông báo trên trang đăng nhập | Sign-in page notice | PROPOSED | — | — | FE-032 PR #75 |
| `g6.settings.form.loginNoticeLabel` | Nội dung thông báo (hiển thị công khai) | Notice content (publicly visible) | PROPOSED | — | — | FE-032 PR #75 |
| `g6.settings.form.loginNoticeHelper` | Thông báo sẽ hiển thị nổi bật tại trang đăng nhập cho mọi người dùng. | The notice will be prominently displayed on the sign-in page for all users. | PROPOSED | — | — | FE-032 PR #75 |
| `g6.settings.form.supportEmailTitle` | Email hỗ trợ * | Support email * | PROPOSED | — | — | FE-032 PR #75 |
| `g6.settings.form.supportEmailLabel` | Địa chỉ email liên hệ hỗ trợ kỹ thuật | Technical support contact email | PROPOSED | — | — | FE-032 PR #75 |
| `g6.settings.limitLabels.fileFormats` | Định dạng tài liệu: | Document formats: | PROPOSED | — | — | FE-032 PR #75 |
| `g6.settings.limitLabels.maxFileSize` | Dung lượng tối đa: | Max file size: | PROPOSED | — | — | FE-032 PR #75 |
| `g6.settings.limitLabels.registration` | Đăng ký tài khoản: | Account registration: | PROPOSED | — | — | FE-032 PR #75 |
| `g6.settings.limitLabels.version` | Phiên bản: | Version: | PROPOSED | — | — | FE-032 PR #75 |
| `g6.settings.limitLabels.timezone` | Múi giờ: | Timezone: | PROPOSED | — | — | FE-032 PR #75 |
| `g6.settings.actions.cancel` | Hủy thay đổi | Discard changes | PROPOSED | — | — | FE-032 PR #75 |
| `g6.settings.actions.note` | Thay đổi áp dụng cho toàn hệ thống sau khi lưu. | Changes apply system-wide upon saving. | PROPOSED | — | — | FE-032 PR #75 |
| `g6.settings.actions.save` | Lưu cài đặt | Save settings | PROPOSED | — | — | FE-032 PR #75 |
| `g6.settings.actions.publish` | Xuất bản | Publish | PROPOSED | — | — | FE-032 PR #75 |
| `g6.settings.dialog.title` | Lưu thay đổi cài đặt hệ thống? | Save system settings changes? | PROPOSED | — | — | FE-032 PR #75 |
| `g6.settings.dialog.description` | Các thông tin cập nhật sẽ được lưu và áp dụng cho toàn bộ người dùng trong nền tảng EduBranch AI. | Updated details will be saved and applied to all users across the EduBranch AI platform. | PROPOSED | — | — | FE-032 PR #75 |
| `g6.settings.dialog.confirm` | Lưu & Áp dụng | Save & Apply | PROPOSED | — | — | FE-032 PR #75 |
| `g6.settings.dialog.cancel` | Hủy bỏ | Cancel | PROPOSED | — | — | FE-032 PR #75 |
| `common.loading` | Đang tải... | Loading... | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.errors.validation` | Dữ liệu yêu cầu chưa hợp lệ. Vui lòng kiểm tra lại. | Invalid request data. Please check and try again. | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.errors.forbidden` | Bạn không có quyền thực hiện thao tác này. | You do not have permission to perform this action. | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.errors.notFound` | Không tìm thấy dữ liệu bài nộp hoặc hàng đợi phản hồi. | Submission or feedback queue data not found. | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.errors.conflict` | Dữ liệu bị xung đột hoặc đã được cập nhật bởi phiên khác. | Data conflict occurred or submission was updated elsewhere. | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.errors.network` | Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng. | Cannot connect to server. Please check your network connection. | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.errors.generic` | Đã có lỗi xảy ra. Vui lòng thử lại. | Something went wrong. Please try again. | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.errors.loadTitle` | Không thể tải hàng đợi bài nộp | Unable to load submissions queue | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.actions.review` | Xem & Nhận xét | Inspect & Review | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.actions.viewDetail` | Chi tiết | Details | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.allCourses` | Mọi khóa học | All courses | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.badges.completed` | Hoàn thành | Completed | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.badges.pending` | Chờ phản hồi | Pending | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.badges.reflected` | Đã phản tư | Reflected | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.badges.reviewed` | Đã phản hồi | Reviewed | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.columns.action` | Thao tác | Action | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.columns.attempt` | Lần làm | Attempt | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.columns.case` | Case Study & Khóa học | Case Study & course | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.columns.mode` | Chế độ học | Mode | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.columns.status` | Trạng thái xét duyệt | Review Status | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.columns.student` | Sinh viên | Student | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.columns.submittedAt` | Thời gian nộp | Submitted | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.courseFilter` | Lọc theo khóa học | Filter by course | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.emptyDescription` | Hiện chưa có sinh viên nào nộp bài hoặc không có bài nộp nào khớp với bộ lọc hiện tại. | No student submissions exist yet or no submissions match the current filter criteria. | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.emptyTitle` | Chưa có bài nộp nào | No submissions found | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.analysisTitle` | 1. Phân tích tình huống (Situation Analysis) | 1. Situation Analysis | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.attemptNumber` | Lần làm #{{n}} | Attempt #{{n}} | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.close` | Đóng panel | Close panel | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.composerNotice` | Nhận xét 100% mang tính định tính sư phạm. Không có AI chấm điểm và không gán điểm số/thang điểm. | 100% human qualitative academic feedback. No AI grading and no numerical scoring. | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.composerTitle` | Nhận xét định tính của giảng viên | Lecturer Qualitative Feedback | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.emptyAnalysis` | Sinh viên không điền phân tích tình huống | No situation analysis provided | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.emptyReflection` | Sinh viên chưa nộp bài phản tư tổng kết | Reflection not yet submitted | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.feedbackFailed` | Không thể lưu nhận xét: {{error}} | Failed to save feedback: {{error}} | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.feedbackLabel` | Nội dung nhận xét định tính * | Qualitative feedback content * | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.feedbackMin` | Nhận xét định tính phải có ít nhất 10 ký tự. | Feedback must contain at least 10 characters. | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.feedbackPlaceholder` | Viết nhận xét định tính chi tiết về lập luận, giải pháp hoặc hướng rẽ nhánh của sinh viên... | Write qualitative feedback regarding student reasoning, solution, or journey decisions... | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.feedbackSuccess` | Đã lưu nhận xét định tính và chuyển trạng thái bài nộp sang REVIEWED thành công! | Qualitative feedback saved and submission transitioned to REVIEWED successfully! | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.journeyTitle` | Lộ trình hành trình | Journey Path | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.outcome` | Kết cục hành trình | Terminal Outcome | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.previousFeedback` | Nhận xét đã gửi trước đó: | Previously sent feedback: | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.reasoningTitle` | 3. Lập luận căn cứ & Đánh đổi (Supporting Reasoning) | 3. Supporting Reasoning & Trade-offs | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.reflectionTitle` | Bài phản tư tổng kết của sinh viên | Student Reflection Summary | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.selectPromptDesc` | Nhấp vào bất kỳ bài nộp nào ở danh sách bên trái để kiểm tra chi tiết bài làm và soạn nhận xét định tính. | Click any submission in the list on the left to inspect student work and compose qualitative feedback. | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.selectPromptTitle` | Chọn bài nộp để xét duyệt | Select a submission to review | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.sentAt` | Gửi ngày {{time}} | Sent on {{time}} | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.solutionTitle` | 2. Phương án giải pháp (Proposed Solution) | 2. Proposed Solution | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.stepsCount` | {{count}} bước quyết định | {{count}} decision steps | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.studentInfo` | Thông tin sinh viên | Student information | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.submissionDetails` | Nội dung bài làm | Submission work | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.submitFeedback` | Lưu & Gửi nhận xét cho sinh viên | Save & Send Feedback to Student | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.submittingFeedback` | Đang lưu nhận xét... | Saving feedback... | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.title` | Chi tiết bài nộp & Nhận xét | Submission Inspection & Feedback | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.listLabel` | Danh sách bài nộp | Submissions | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.metrics.cases` | Case Study có bài nộp | Cases with submissions | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.metrics.pending` | Chờ phản hồi | Awaiting feedback | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.metrics.reviewed` | Đã phản hồi | Feedback given | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.metrics.total` | Tổng bài làm đã nộp | Submitted attempts | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.modeFilter` | Lọc theo chế độ học | Filter by learning mode | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.modes.all` | Mọi chế độ học | All learning modes | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.modes.branching` | Branching Study | Branching Study | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.modes.review` | Review Study | Review Study | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.searchLabel` | Tìm bài nộp | Search submissions | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.searchPlaceholder` | Tên sinh viên, case hoặc mã lớp... | Student name, case title, or course... | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.sort.newest` | Mới nhất | Newest | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.sort.oldest` | Cũ nhất | Oldest | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.sortLabel` | Sắp xếp | Sort | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.status.all` | Mọi trạng thái | All statuses | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.status.completed` | Hành trình hoàn thành (COMPLETED) | Completed Journey (COMPLETED) | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.status.pending` | Chờ phản hồi | Awaiting feedback | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.status.pendingReview` | Chờ phản hồi (PENDING_REVIEW) | Awaiting Review (PENDING_REVIEW) | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.status.reflected` | Đã hoàn tất phản tư (REFLECTED) | Reflected (REFLECTED) | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.status.reflectionPending` | Chưa nộp bài phản tư | Reflection Pending | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.status.reflectionSubmitted` | Đã nộp bài phản tư | Reflection Submitted | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.status.reviewed` | Đã phản hồi | Reviewed | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.statusFilter` | Lọc theo trạng thái | Filter by status | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.alreadyReviewedNotice` | Bài làm này đã có nhận xét định tính (chỉ xem, không thể sửa đổi). | This submission already has qualitative feedback (read-only, cannot be modified). | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.emptyStepReasoning` | Chưa có lập luận hồi cứu | No retrospective reasoning provided | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.emptySteps` | Chưa có bước quyết định nào được ghi nhận | No decision steps recorded | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.selectedOption` | Lựa chọn đã chọn: | Selected option: | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.situation` | Tình huống | Situation | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.stepNumber` | Bước {{n}} | Step {{n}} | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.inspector.stepReasoningTitle` | Lập luận hồi cứu của sinh viên | Student retrospective reasoning | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.actions.viewFeedback` | Xem phản hồi | View feedback | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.pagination.showing` | Hiển thị | Showing | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.pagination.ofTotal` | trên {{count}} bài làm | of {{count}} submissions | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.pagination.pageSize` | Số bài làm mỗi trang | Submissions per page | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.pagination.nav` | Phân trang bài làm | Submissions pagination | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.pagination.previous` | Trang trước | Previous page | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.pagination.next` | Trang sau | Next page | PROPOSED | — | — | FE-019 PR #68 |
| `g4.queue.pagination.pageN` | Trang {{page}} | Page {{page}} | PROPOSED | — | — | FE-019 PR #68 |
| `caseReview.openRubric` | Rubric nghiên cứu | Research rubric | PROPOSED | — | — | FE-029 |
| `rubric.case.regionLabel` | Tình huống được đánh giá | Case being evaluated | PROPOSED | — | — | FE-029 |
| `rubric.case.loading` | Đang tải thông tin case… | Loading case information… | PROPOSED | — | — | FE-029 |
| `rubric.case.errorTitle` | Không tải được case | Could not load the case | PROPOSED | — | — | FE-029 |
| `rubric.case.errorDescription` | Kiểm tra kết nối mạng rồi thử lại. | Check your network connection and try again. | PROPOSED | — | — | FE-029 |
| `rubric.case.notFoundTitle` | Không tìm thấy Case Study | Case Study not found | PROPOSED | — | — | FE-029 |
| `rubric.case.notFoundDescription` | Case này không tồn tại hoặc đã bị xóa. | This case does not exist or has been removed. | PROPOSED | — | — | FE-029 |
| `rubric.case.forbiddenTitle` | Không có quyền truy cập case này | Access denied for this case | PROPOSED | — | — | FE-029 |
| `rubric.case.forbiddenDescription` | Bạn chỉ có thể đánh giá các case thuộc khóa học do mình phụ trách. | You can only evaluate cases belonging to your own courses. | PROPOSED | — | — | FE-029 |
| `rubric.case.noneTitle` | Chưa chọn case | No case selected | PROPOSED | — | — | FE-029 |
| `rubric.case.noneDescriptionLecturer` | Chọn một tình huống từ danh sách Case Study để chấm điểm rubric nghiên cứu. | Open a case from Case Studies to complete the research quality rubric. | PROPOSED | — | — | FE-029 |
| `rubric.case.noneDescriptionAdmin` | Chọn một tình huống từ danh sách Case Study toàn hệ thống để chấm điểm rubric nghiên cứu. | Open a case from All Case Studies to complete the research quality rubric. | PROPOSED | — | — | FE-029 |
| `rubric.case.goToCases` | Mở danh sách Case Study | Browse Case Studies | PROPOSED | — | — | FE-029 |
| `rubric.case.mode.BRANCHING_STUDY` | Branching Study | Branching Study | PROPOSED | — | — | FE-029 |
| `rubric.case.mode.REVIEW_STUDY` | Review Study | Review Study | PROPOSED | — | — | FE-029 |
| `rubric.average.label` | Điểm trung bình | Average score | PROPOSED | — | — | FE-029 |
| `rubric.average.fromCount` | từ {{count}} tiêu chí | from {{count}} criteria | PROPOSED | — | — | FE-029 |
| `rubric.average.unavailable` | Chưa có điểm | No score yet | PROPOSED | — | — | FE-029 |
| `rubric.criteria.realism.name` | Tính thực tế | Realism | PROPOSED | — | — | FE-029 |
| `rubric.criteria.realism.description` | Mức độ sát với các tình huống khủng hoảng thực tế tại doanh nghiệp | How closely it matches real business crisis situations | PROPOSED | — | — | FE-029 |
| `rubric.criteria.difficulty.name` | Độ khó | Difficulty | PROPOSED | — | — | FE-029 |
| `rubric.criteria.difficulty.description` | Mức độ phức tạp của bài toán và đòi hỏi tư duy phân tích cao | How complex the problem is and how much analytical thinking it demands | PROPOSED | — | — | FE-029 |
| `rubric.criteria.curriculumFit.name` | Phù hợp môn | Course fit | PROPOSED | — | — | FE-029 |
| `rubric.criteria.curriculumFit.description` | Độ gắn kết với mục tiêu chuẩn đầu ra (CLO) của học phần | How well it aligns with the course learning outcomes (CLO) | PROPOSED | — | — | FE-029 |
| `rubric.scoring.title` | Đánh giá chất lượng tình huống | Case quality evaluation | PROPOSED | — | — | FE-029 |
| `rubric.scoring.description` | Thang 1–5 cho mỗi tiêu chí. Đây là đánh giá chất lượng case phục vụ nghiên cứu, không phải điểm của sinh viên. | Scale 1–5 for each criterion. This rates case quality for research, not student scores. | PROPOSED | — | — | FE-029 |
| `rubric.scoring.noScore` | Chưa có điểm | No score yet | PROPOSED | — | — | FE-029 |
| `rubric.scoring.scoreOptionLabel` | {{criterion}}: {{value}} trên 5 | {{criterion}}: {{value}} out of 5 | PROPOSED | — | — | FE-029 |
| `rubric.scoring.save` | Lưu phiếu đánh giá | Save evaluation | PROPOSED | — | — | FE-029 |
| `rubric.scoring.update` | Cập nhật phiếu đánh giá | Update evaluation | PROPOSED | — | — | FE-029 |
| `rubric.scoring.cancelEdit` | Hủy chỉnh sửa | Cancel edit | PROPOSED | — | — | FE-029 |
| `rubric.scoring.saving` | Đang lưu… | Saving… | PROPOSED | — | — | FE-029 |
| `rubric.scoring.saveSuccess` | Đã lưu phiếu đánh giá | Evaluation saved | PROPOSED | — | — | FE-029 |
| `rubric.scoring.updateSuccess` | Đã cập nhật phiếu đánh giá | Evaluation updated | PROPOSED | — | — | FE-029 |
| `rubric.scoring.deleteSuccess` | Đã xóa phiếu đánh giá | Evaluation deleted | PROPOSED | — | — | FE-029 |
| `rubric.scoring.duplicateError` | Bạn đã có phiếu đánh giá cho case này. Hệ thống đã chuyển sang chế độ sửa phiếu đã lưu. | You already evaluated this case. Switched to editing your saved evaluation. | PROPOSED | — | — | FE-029 |
| `rubric.scoring.forbiddenError` | Bạn không có quyền thực hiện đánh giá cho case này. | You do not have permission to evaluate this case. | PROPOSED | — | — | FE-029 |
| `rubric.scoring.validationError` | Dữ liệu đánh giá chưa hợp lệ. Vui lòng kiểm tra điểm và ghi chú. | Invalid evaluation data. Please check your scores and note. | PROPOSED | — | — | FE-029 |
| `rubric.scoring.networkError` | Không thể kết nối máy chủ. Kiểm tra mạng rồi thử lại. | Could not reach the server. Check your connection and try again. | PROPOSED | — | — | FE-029 |
| `rubric.scoring.saveError` | Chưa lưu được phiếu đánh giá. Vui lòng thử lại. | Could not save the evaluation. Please try again. | PROPOSED | — | — | FE-029 |
| `rubric.scoring.incompleteHint` | Chọn đủ 3 tiêu chí (1–5) để tính điểm trung bình và lưu phiếu. | Select all 3 criteria (1–5) to compute the average and save. | PROPOSED | — | — | FE-029 |
| `rubric.scoring.closeAlert` | Đóng thông báo lỗi | Dismiss error | PROPOSED | — | — | FE-029 |
| `rubric.note.label` | Ghi chú (không bắt buộc) | Note (optional) | PROPOSED | — | — | FE-029 |
| `rubric.note.placeholder` | Điểm cần chỉnh ở phiên bản sau… | What to adjust in the next version… | PROPOSED | — | — | FE-029 |
| `rubric.note.counter` | {{count}}/{{max}} ký tự | {{count}}/{{max}} characters | PROPOSED | — | — | FE-029 |
| `rubric.saved.title` | Phiếu đánh giá đã lưu | Saved evaluations | PROPOSED | — | — | FE-029 |
| `rubric.saved.titleWithCount` | Phiếu đánh giá đã lưu ({{count}}) | Saved evaluations ({{count}}) | PROPOSED | — | — | FE-029 |
| `rubric.saved.loading` | Đang tải danh sách phiếu đánh giá… | Loading saved evaluations… | PROPOSED | — | — | FE-029 |
| `rubric.saved.errorTitle` | Không tải được danh sách phiếu đánh giá | Could not load saved evaluations | PROPOSED | — | — | FE-029 |
| `rubric.saved.errorDescription` | Kiểm tra kết nối mạng rồi thử lại. | Check your network connection and try again. | PROPOSED | — | — | FE-029 |
| `rubric.saved.emptyTitle` | Chưa có phiếu đánh giá nào | No evaluations yet | PROPOSED | — | — | FE-029 |
| `rubric.saved.emptyDescription` | Các phiếu đánh giá chất lượng case sau khi lưu sẽ hiển thị tại đây. | Saved case quality evaluations will appear here. | PROPOSED | — | — | FE-029 |
| `rubric.saved.evaluator` | Người đánh giá: {{name}} | Evaluator: {{name}} | PROPOSED | — | — | FE-029 |
| `rubric.saved.averageBadge` | TB {{score}}/5 | Avg {{score}}/5 | PROPOSED | — | — | FE-029 |
| `rubric.saved.noteLabel` | Ghi chú: | Note: | PROPOSED | — | — | FE-029 |
| `rubric.saved.edit` | Sửa | Edit | PROPOSED | — | — | FE-029 |
| `rubric.saved.editAria` | Sửa phiếu đánh giá cho {{title}} | Edit evaluation for {{title}} | PROPOSED | — | — | FE-029 |
| `rubric.saved.delete` | Xóa | Delete | PROPOSED | — | — | FE-029 |
| `rubric.saved.deleteAria` | Xóa phiếu đánh giá cho {{title}} | Delete evaluation for {{title}} | PROPOSED | — | — | FE-029 |
| `rubric.saved.fallbackTitle` | Phiếu #{{index}} | Evaluation #{{index}} | PROPOSED | — | — | FE-029 |
| `rubric.deleteDialog.title` | Xóa phiếu đánh giá? | Delete evaluation? | PROPOSED | — | — | FE-029 |
| `rubric.deleteDialog.description` | Phiếu đánh giá cho “{{title}}” sẽ bị xóa vĩnh viễn và không thể khôi phục. | The evaluation for “{{title}}” will be permanently deleted and cannot be undone. | PROPOSED | — | — | FE-029 |
| `rubric.deleteDialog.fallbackCase` | tình huống này | this case | PROPOSED | — | — | FE-029 |
| `rubric.deleteDialog.cancel` | Hủy bỏ | Cancel | PROPOSED | — | — | FE-029 |
| `rubric.deleteDialog.confirm` | Xóa phiếu | Delete | PROPOSED | — | — | FE-029 |
| `rubric.deleteDialog.deleting` | Đang xóa… | Deleting… | PROPOSED | — | — | FE-029 |
| `rubric.deleteDialog.error` | Chưa xóa được phiếu đánh giá. Vui lòng thử lại. | Could not delete the evaluation. Please try again. | PROPOSED | — | — | FE-029 |
