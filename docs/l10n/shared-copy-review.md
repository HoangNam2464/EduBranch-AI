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
| `shell.themeLight` | Chuyển sang giao diện sáng | Switch to light theme | PROPOSED | — | — | PR-54-FIX |
| `shell.themeDark` | Chuyển sang giao diện tối | Switch to dark theme | PROPOSED | — | — | PR-54-FIX |
| `shell.themeToggle` | Chuyển đổi giao diện sáng / tối | Toggle light / dark theme | PROPOSED | — | — | PR-54-FIX |
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
| `g1.select.placeholder` | -- Chọn một mục -- | -- Select an item -- | PROPOSED | — | — | PR-71-FIX |
| `g1.select.searchPlaceholder` | Tìm nhanh khoa hoặc đơn vị... | Search faculty or department... | PROPOSED | — | — | PR-71-FIX |
| `g1.select.noResults` | Không tìm thấy khoa phù hợp. Bạn có thể chọn mục "Đơn vị / Khoa khác..." ở dưới cùng. | No matching faculty found. You can select "Other Faculty / Department..." at the bottom. | PROPOSED | — | — | PR-71-FIX |
| `g1.select.otherCategory` | Khác | Other | PROPOSED | — | — | PR-71-FIX |
| `g1.register.departmentSelectPlaceholder` | -- Chọn Khoa / Đơn vị công tác -- | -- Select Faculty / Department -- | PROPOSED | — | — | PR-71-FIX |
| `g1.register.customDepartmentLabel` | Tên Khoa / Đơn vị công tác cụ thể | Specific Faculty / Department name | PROPOSED | — | — | PR-71-FIX |
| `g1.register.customDepartmentPlaceholder` | Ví dụ: Viện Nghiên cứu & Phát triển Công nghệ cao | e.g. Institute of Advanced Technology Research | PROPOSED | — | — | PR-71-FIX |
| `g1.register.departmentOther` | Đơn vị / Khoa khác... | Other Faculty / Department... | PROPOSED | — | — | PR-71-FIX |
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
