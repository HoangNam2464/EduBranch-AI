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
