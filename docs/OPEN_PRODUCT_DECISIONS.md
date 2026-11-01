# EduBranch AI — Open Product Decisions (OPD)

> **Document Status**: `DRAFT — PENDING STAKEHOLDER REVIEW`  
> **Source Documents Examined**: Proposal V1.2 (`C1SE_65-EduBranch-AI-Proposal_V1.2.docx`), `Product Direction V2`, `docs/PROJECT_OVERVIEW.md`, `.agents/rules/00-project-foundation.md`, `docs/design/GLOBAL-DESIGN-SYSTEM.md`, `docs/features/`, and `docs/architecture/`  
> **Visual Reference Examined**: Figma Design Workspace (`EduBranch AI`, `Page 1`, 49 Canvas Frames)  
> **Target Audience**: AI Assistants, Software Architects, Full-Stack Developers, UI/UX Designers, Academic Mentors, and Stakeholders  
> **Governing Principle**: Figma designs represent the current visual design direction. Visual presence in Figma does not automatically establish or approve a business requirement. Only explicit documentation ratified by project stakeholders represents approved requirements.

---

## 1. Document Purpose & Authority Status

This document records the **product decisions, workflow analyses, confirmed requirements, and open product decisions** for the EduBranch AI project.

### Authority and Status
- **Status**: `DRAFT — PENDING STAKEHOLDER REVIEW`
- This document is a **working analytical reference**, not a finalized or approved product specification.
- It identifies where current Figma visual designs align with documented requirements, where they diverge, and where business rules remain undefined.
- All recommendations in Section 5 are **proposals subject to stakeholder confirmation**; they must not be treated as approved requirements until formally signed off.
- Each open decision must be approved before implementing its affected functionality. Decisions explicitly deferred beyond MVP must not block the delivery of approved MVP scope.

### How to Use This Document
- **For AI Assistants & Developers**:
  - Differentiate between **CONFIRMED** requirements (which have authoritative documentation backing) and **OPEN** decisions (which require stakeholder resolution).
  - Do not invent business logic for items marked **OPEN**. Implement only confirmed baseline behavior or follow the proposed recommendations with explicit caveats.
  - Review the `Technical Implications – Subject to Technical Review` field in each decision before authoring database migrations or API contracts.
- **For UI/UX Designers**:
  - Use Section 6 (*Potential Requirement Conflicts and Design Divergences*) to identify interface areas where visual layouts diverge from documented business rules.
- **For Project Mentors & Stakeholders**:
  - Review the **Unresolved Question** and **Possible Options** in each OPD (Section 5) to formally confirm or adjust the proposed product directions.

---

## 2. Project Context & Pedagogical Domain

- **Product Name**: EduBranch AI — AI Platform for Experiential Case-Based Learning in University Teaching
- **Domain**: University-Level Higher Education Experiential Learning (Business, Law, Medicine, Computer Science, Engineering, Management).
- **Core Pedagogical Mission**: Move university learners from passive memorization to active decision-making under uncertainty. Students experience multi-branch decision trees (`Branching Study`) or open analytical dilemmas (`Review Study`), encounter realistic consequences, articulate retrospective reasoning, reflect, and engage in Socratic challenge dialogues without automated AI grading.

### Primary Roles
- **Core Academic Roles**:
  1. **Lecturer (`LECTURER`)**: Core academic author and pedagogical evaluator. Curates course teaching materials (PDF/DOCX), triggers RAG-assisted case generation, edits decision tree DAGs, approves and publishes cases, reviews student attempts, and authors qualitative feedback.
  2. **Student (`STUDENT`)**: Core university learner. Navigates decision nodes without mid-flow interruption, inspects journey timelines during retrospective review, submits reasoning and reflections, engages in AI Challenge Support (max 2 rounds), and initiates retries.
- **Platform Operational Role**:
  3. **Admin (`ADMIN`)**: Platform operational administrator (identified in Proposal V1.2 Context Diagram). Scope of UI implementation in the MVP is evaluated under `OPD-015`.

---

## 3. Figma Design Coverage (Page 1 Audit)

The EduBranch AI Figma workspace (`EduBranch AI`, `Page 1`) contains **49 frames** arranged along horizontal coordinate bands ($Y = 0$, $Y = 3300$, $Y = 7185$, $Y = 11000$). Every frame was inspected via the Figma MCP Bridge:

| Domain / Suite | Frame Name | Node ID | Direct Frame Link | Position $(X, Y)$ & Dimensions | Observed Interface Layout & Implied Workflow |
|---|---|:---:|---|:---:|---|
| **Admin** | `Admin · Đăng nhập` | `1:4477` | [Figma Node 1:4477](https://www.figma.com/design/edubranch-ai?node-id=1-4477) | $(0, 0)$<br>$1440 \times 1000$ | Administrative login form with server seed notice and credential inputs. |
| **Admin** | `Admin · Bảng điều khiển` | `1:3715` | [Figma Node 1:3715](https://www.figma.com/design/edubranch-ai?node-id=1-3715) | $(1560, 0)$<br>$1440 \times 1127$ | System dashboard displaying user metrics, course counts, and pending approval alerts. |
| **Admin** | `Admin · Quản lý người dùng` | `1:4025` | [Figma Node 1:4025](https://www.figma.com/design/edubranch-ai?node-id=1-4025) | $(3120, 0)$<br>$1440 \times 1060$ | User table with tabs "Tất cả người dùng (8)" and "Giảng viên chờ duyệt (1)". |
| **Admin** | `Admin · Hộp thoại xác nhận khóa người dùng` | `30:1864` | [Figma Node 30:1864](https://www.figma.com/design/edubranch-ai?node-id=30-1864) | $(3120, 1180)$<br>$560 \times 378$ | Confirmation modal for account suspension with red destructive button (`#DC2626`). |
| **Admin** | `Admin · Quản lý khóa học` | `1:4795` | [Figma Node 1:4795](https://www.figma.com/design/edubranch-ai?node-id=1-4795) | $(4680, 0)$<br>$1440 \times 1000$ | System-wide course table listing titles, course codes, and instructor ownership. |
| **Admin** | `Admin · Quản lý Case Study` | `1:5043` | [Figma Node 1:5043](https://www.figma.com/design/edubranch-ai?node-id=1-5043) | $(6240, 0)$<br>$1440 \times 1005$ | System-wide case study inventory with mode and publication status indicators. |
| **Admin** | `Admin · Cấu hình dịch vụ AI` | `1:5543` | [Figma Node 1:5543](https://www.figma.com/design/edubranch-ai?node-id=1-5543) | $(7800, 0)$<br>$1440 \times 1181$ | Form for switching LLM providers (Gemini vs. OpenAI) and configuring timeouts and rate limits. |
| **Admin** | `Admin · Nghiên cứu và Rubric` | `1:4511` | [Figma Node 1:4511](https://www.figma.com/design/edubranch-ai?node-id=1-4511) | $(9360, 0)$<br>$1440 \times 1061$ | Research oversight view with aggregate rubric scores and CSV export button. |
| **Admin** | `Admin · Nhật ký hệ thống` | `1:5302` | [Figma Node 1:5302](https://www.figma.com/design/edubranch-ai?node-id=1-5302) | $(10920, 0)$<br>$1440 \times 1005$ | Table of audit logs showing timestamps, user actions, and JSON metadata payloads. |
| **Admin** | `Admin · Cài đặt hệ thống` | `1:4345` | [Figma Node 1:4345](https://www.figma.com/design/edubranch-ai?node-id=1-4345) | $(12480, 0)$<br>$1440 \times 1000$ | System configuration controls, admin password updates, and backup policy settings. |
| **Auth** | `Đăng nhập · Mặc định` | `1:2` | [Figma Node 1:2](https://www.figma.com/design/edubranch-ai?node-id=1-2) | $(8696, 3354)$<br>$1440 \times 900$ | Login card with email/password inputs, "Sign in" button, and Google SSO button. |
| **Auth** | `Đăng ký · Sinh viên` | `1:52` | [Figma Node 1:52](https://www.figma.com/design/edubranch-ai?node-id=1-52) | $(10218, 3304)$<br>$1440 \times 1000$ | Student registration form requiring full name, Student ID (MSSV), email, and password. |
| **Auth** | `Đăng ký · Giảng viên` | `1:122` | [Figma Node 1:122](https://www.figma.com/design/edubranch-ai?node-id=1-122) | $(11698, 3304)$<br>$1440 \times 1066$ | Lecturer registration with Faculty field and notice regarding department verification. |
| **Auth** | `Email · Kích hoạt tài khoản` | `26:148` | [Figma Node 26:148](https://www.figma.com/design/edubranch-ai?node-id=26-148) | $(13198, 3354)$<br>$880 \times 900$ | Email layout with account activation button. |
| **Auth** | `Quên mật khẩu · Nhập email` | `1:196` | [Figma Node 1:196](https://www.figma.com/design/edubranch-ai?node-id=1-196) | $(14160, 3354)$<br>$1440 \times 900$ | Email submission card to request a password reset link. |
| **Auth** | `Quên mật khẩu · Đã gửi hướng dẫn` | `1:223` | [Figma Node 1:223](https://www.figma.com/design/edubranch-ai?node-id=1-223) | $(15678, 3354)$<br>$1440 \times 900$ | Confirmation screen indicating reset email delivery. |
| **Auth** | `Email · Hướng dẫn đặt lại mật khẩu` | `26:78` | [Figma Node 26:78](https://www.figma.com/design/edubranch-ai?node-id=26-78) | $(17158, 3354)$<br>$880 \times 900$ | Transactional email card with reset button and 15-minute expiration notice. |
| **Auth** | `Mật khẩu mới · Biểu mẫu` | `1:250` | [Figma Node 1:250](https://www.figma.com/design/edubranch-ai?node-id=1-250) | $(18118, 3354)$<br>$1440 \times 900$ | Form for setting and confirming a new password. |
| **Auth** | `Mật khẩu mới · Thành công` | `1:279` | [Figma Node 1:279](https://www.figma.com/design/edubranch-ai?node-id=1-279) | $(19749, 3354)$<br>$1440 \times 900$ | Confirmation screen indicating successful password reset with login link. |
| **Student** | `Sinh viên · Bàn học` | `1:1305` | [Figma Node 1:1305](https://www.figma.com/design/edubranch-ai?node-id=1-1305) | $(18569, 7185)$<br>$1440 \times 999$ | Student workspace: active tasks, course cards, and action "Tham gia lớp học mới". |
| **Student** | `Sinh viên · Khóa học của tôi` | `1:1202` | [Figma Node 1:1202](https://www.figma.com/design/edubranch-ai?node-id=1-1202) | $(20129, 7185)$<br>$1440 \times 900$ | Enrolled courses catalog with button "Tham gia bằng mã lớp". |
| **Student** | `Sinh viên · Tham gia lớp học` | `1:1084` | [Figma Node 1:1084](https://www.figma.com/design/edubranch-ai?node-id=1-1084) | $(21689, 7185)$<br>$1440 \times 900$ | Modal dialog with input for class code (e.g. `CS301-2026`) and confirmation buttons. |
| **Student** | `Sinh viên · Giới thiệu tình huống` | `1:972` | [Figma Node 1:972](https://www.figma.com/design/edubranch-ai?node-id=1-972) | $(23249, 7185)$<br>$1440 \times 1079$ | Case briefing screen with actions "Làm lại", "Xem Journey Review", and "Tiếp tục làm dở". |
| **Student** | `Tình huống · Đã chọn phương án` | `1:906` | [Figma Node 1:906](https://www.figma.com/design/edubranch-ai?node-id=1-906) | $(24809, 7185)$<br>$1440 \times 938$ | Decision Point during play: situation text, option selector, and advance button. |
| **Student** | `Tình huống · Kết thúc hành trình` | `1:880` | [Figma Node 1:880](https://www.figma.com/design/edubranch-ai?node-id=1-880) | $(26369, 7185)$<br>$1440 \times 900$ | Terminal node display: outcome description and button to proceed to Journey Review. |
| **Student** | `Sinh viên · Journey Review` | `1:619` | [Figma Node 1:619](https://www.figma.com/design/edubranch-ai?node-id=1-619) | $(27929, 7185)$<br>$1440 \times 2425$ | Timeline of traversed decisions, revealed consequences, and reasoning textareas. |
| **Student** | `Sinh viên · AI Challenge Support (Modal Socratic)` | `27:321` | [Figma Node 27:321](https://www.figma.com/design/edubranch-ai?node-id=27-321) | $(27929, 9800)$<br>$1440 \times 579$ | Socratic dialog modal with counter-question card, response input, and round indicator. |
| **Student** | `Sinh viên · Biểu mẫu suy ngẫm` | `1:545` | [Figma Node 1:545](https://www.figma.com/design/edubranch-ai?node-id=1-545) | $(29489, 7185)$<br>$1440 \times 900$ | Post-journey reflection form with prompt fields and submission action. |
| **Student** | `Sinh viên · Đã nộp suy ngẫm` | `1:466` | [Figma Node 1:466](https://www.figma.com/design/edubranch-ai?node-id=1-466) | $(31049, 7185)$<br>$1440 \times 900$ | Read-only confirmation of submitted reflection. |
| **Student** | `Sinh viên · Lịch sử lần làm bài` | `1:790` | [Figma Node 1:790](https://www.figma.com/design/edubranch-ai?node-id=1-790) | $(32609, 7185)$<br>$1440 \times 900$ | Attempt history table listing past attempts, path lengths, outcomes, and feedback status. |
| **Student** | `Sinh viên · Biểu mẫu Review Study` | `1:384` | [Figma Node 1:384](https://www.figma.com/design/edubranch-ai?node-id=1-384) | $(34169, 7185)$<br>$1440 \times 900$ | Single-column form: context data, problem prompt, proposed solution, and reasoning. |
| **Student** | `Sinh viên · Review Study đã phản hồi` | `1:297` | [Figma Node 1:297](https://www.figma.com/design/edubranch-ai?node-id=1-297) | $(35729, 7185)$<br>$1440 \times 948$ | Review Study result view displaying the lecturer's qualitative feedback block. |
| **Lecturer** | `Thanh điều hướng giảng viên (Master)` | `29:18` | [Figma Node 29:18](https://www.figma.com/design/edubranch-ai?node-id=29-18) | $(-320, 11000)$<br>$256 \times 999$ | Master 256px sidebar component containing 7 lecturer navigation items and SVG icons. |
| **Lecturer** | `Giảng viên · Tổng quan` | `1:3490` | [Figma Node 1:3490](https://www.figma.com/design/edubranch-ai?node-id=1-3490) | $(0, 11000)$<br>$1440 \times 1427$ | Lecturer dashboard: recent cases, AI Case Studio banner, review queue preview. |
| **Lecturer** | `Giảng viên · Quản lý khóa học` | `1:2431` | [Figma Node 1:2431](https://www.figma.com/design/edubranch-ai?node-id=1-2431) | $(1560, 11000)$<br>$1440 \times 1000$ | Course cards showing title, code (`CS301`), counts, and invite codes. |
| **Lecturer** | `Giảng viên · Hộp thoại khởi tạo khóa học` | `1:1465` | [Figma Node 1:1465](https://www.figma.com/design/edubranch-ai?node-id=1-1465) | $(1980, 12060)$<br>$600 \times 522$ | Modal form to create a course (Course Name, Course Code, Description). |
| **Lecturer** | `Giảng viên · Chi tiết khóa học — Tài liệu môn học` | `1:2258` | [Figma Node 1:2258](https://www.figma.com/design/edubranch-ai?node-id=1-2258) | $(3120, 11000)$<br>$1440 \times 1201$ | File upload dropzone (PDF/DOCX) and table with parsing/chunking status badges. |
| **Lecturer** | `Giảng viên · RAG Source Inspector & Tiến trình xử lý`| `16:6` | [Figma Node 16:6](https://www.figma.com/design/edubranch-ai?node-id=16-6) | $(3120, 12261)$<br>$1440 \times 1024$ | Ingestion inspector: normalized text chunks and embedding previews. |
| **Lecturer** | `Giảng viên · Hộp thoại xác nhận xóa tài liệu` | `29:1106` | [Figma Node 29:1106](https://www.figma.com/design/edubranch-ai?node-id=29-1106) | $(4680, 12261)$<br>$560 \times 413$ | Modal confirming deletion of a specific uploaded file. |
| **Lecturer** | `Giảng viên · Quản lý Case Study` | `1:2583` | [Figma Node 1:2583](https://www.figma.com/design/edubranch-ai?node-id=1-2583) | $(4680, 11000)$<br>$1440 \times 1000$ | Case management table with mode badges (`Branching`/`Review`) and status badges. |
| **Lecturer** | `Giảng viên · AI Studio — Khóa học và chế độ` | `1:3088` | [Figma Node 1:3088](https://www.figma.com/design/edubranch-ai?node-id=1-3088) | $(6240, 11000)$<br>$1440 \times 1000$ | Wizard Step 1: Select course and learning mode cards. |
| **Lecturer** | `Giảng viên · AI Studio — Chủ đề và tài liệu` | `1:2939` | [Figma Node 1:2939](https://www.figma.com/design/edubranch-ai?node-id=1-2939) | $(7800, 11000)$<br>$1440 \times 1158$ | Wizard Step 2: Topic prompt input, material checklists, node count, difficulty. |
| **Lecturer** | `Giảng viên · AI Studio — Xác nhận cấu hình` | `1:2818` | [Figma Node 1:2818](https://www.figma.com/design/edubranch-ai?node-id=1-2818) | $(9360, 11000)$<br>$1440 \times 1000$ | Wizard Step 3: Configuration review card and trigger button. |
| **Lecturer** | `Giảng viên · Trình chỉnh sửa Case Study` | `1:3219` | [Figma Node 1:3219](https://www.figma.com/design/edubranch-ai?node-id=1-3219) | $(10920, 11000)$<br>$1440 \times 2226$ | Decision Tree Canvas + Side-by-side Node Editor with pivotal decision flag. |
| **Lecturer** | `Giảng viên · Hộp thoại phê duyệt và xuất bản` | `1:1444` | [Figma Node 1:1444](https://www.figma.com/design/edubranch-ai?node-id=1-1444) | $(11360, 13286)$<br>$560 \times 353$ | Publication confirmation modal for status transition `APPROVED` → `PUBLISHED`. |
| **Lecturer** | `Giảng viên · Hàng đợi Review và phản hồi lập luận` | `1:1852` | [Figma Node 1:1852](https://www.figma.com/design/edubranch-ai?node-id=1-1852) | $(12480, 11000)$<br>$1440 \times 1038$ | Review queue with filter tabs "Tất cả (6)", "Chờ Review (4)", "Đã phản hồi (2)". |
| **Lecturer** | `Giảng viên · Chi tiết phản hồi lập luận sinh viên` | `1:1702` | [Figma Node 1:1702](https://www.figma.com/design/edubranch-ai?node-id=1-1702) | $(14040, 11000)$<br>$1440 \times 2175$ | Detailed student path review with an AI suggestion card and feedback textarea. |
| **Lecturer** | `Giảng viên · Thống kê luồng học tập` | `1:1493` | [Figma Node 1:1493](https://www.figma.com/design/edubranch-ai?node-id=1-1493) | $(15600, 11000)$<br>$1440 \times 1361$ | Cohort analytics: completion rate, branch selection breakdowns, outcome charts. |
| **Lecturer** | `Giảng viên · Rubric nghiên cứu chất lượng tình huống` | `1:2081` | [Figma Node 1:2081](https://www.figma.com/design/edubranch-ai?node-id=1-2081) | $(17160, 11000)$<br>$1440 \times 1295$ | In-platform rubric evaluation form: Realism, Difficulty, Alignment on 1–5 scale. |

---

## 4. Confirmed Product Decisions (Evidence-Backed Requirements)

The following requirements are **explicitly established in authoritative project documentation** and verified against documented invariants. Visual presence in Figma confirms design representation, but documentation provides the sole authority:

### CPD-01: Human-in-the-Loop Case Publication Gate
- **Authoritative Sources**: Proposal V1.2 Goal 2 (p. 8), Section 4 (p. 8); `00-project-foundation.md` §4; `FEATURE-CASE-REVIEW-AND-PUBLISHING.md` BR-REV-01, FR-REV-05.
- **Invariant**: `INV-01` (`WHERE status = 'PUBLISHED'`).
- **Confirmed Rule**: AI generates cases in `DRAFT` status. Cases must transition `DRAFT` → `REVIEWED` (upon lecturer editing) → `APPROVED` (explicit sign-off) → `PUBLISHED`. Students must never access cases that are not `PUBLISHED`. This rule is enforced at the database repository query level, not merely in UI route guards.

### CPD-02: 3-Phase Branching Study Experiential Flow
- **Authoritative Sources**: Proposal V1.2 Goal 3 & 4 (p. 8); `00-project-foundation.md` §6.2; `FEATURE-BRANCHING-STUDY.md` §5.
- **Invariants**: `INV-02` (no mid-flow blocking cards), `INV-03` (retrospective consequence reveal in REVIEW).
- **Confirmed Rule**:
  - **Phase 1 — Experience**: Students navigate decision points consecutively with no intermediate consequence cards or reasoning forms.
  - **Phase 2 — REVIEW**: After reaching a terminal node (`is_terminal = true`), the full journey timeline is replayed, consequences are revealed, and students author retrospective reasoning for choices.
  - **Phase 3 — Reflection & Retry**: Students submit an overall reflection, optionally engage in Socratic challenge questions, and may retry the case.

### CPD-03: Dual Learning Mode Architecture
- **Authoritative Sources**: Proposal V1.2 Section 4 (p. 8); `FEATURE-BRANCHING-STUDY.md`; `FEATURE-REVIEW-STUDY.md`.
- **Confirmed Rule**: EduBranch AI supports two distinct learning modes:
  - `BRANCHING_STUDY`: Directed Acyclic Graph (DAG) decision tree with 2–4 options per non-terminal node and zero cycles.
  - `REVIEW_STUDY`: Non-branching open analysis based on `context_text` and `problem_text`. No decision tree nodes or options exist.

### CPD-04: Zero AI Grading Mandate
- **Authoritative Sources**: Proposal V1.2 Goal 7 (p. 7); `00-project-foundation.md` §6.1; `FEATURE-AI-REASONING-CHALLENGE-SUPPORT.md` FR-CS-08; `INV-10`.
- **Confirmed Rule**: AI Reasoning / Challenge Support is strictly limited to 1–2 rounds of Socratic counter-questions. The AI must never generate numerical grades, percentage marks, letter grades, pass/fail decisions, or ranking judgments on student submissions. All formal academic evaluation remains the exclusive responsibility of human lecturers.

### CPD-05: Untrusted Data Demarcation in Retrieval Prompts
- **Authoritative Sources**: `00-project-foundation.md` §6.1; `docs/ai/RAG-PIPELINE.md`.
- **Confirmed Rule**: Teaching material chunks retrieved from pgvector must be wrapped inside `<sources>...</sources>` boundary tags in LLM prompts.
- **Security Architecture Clarification**:
  1. **Structural Source Demarcation**: XML-like `<sources>...</sources>` boundary tags delineate untrusted document context from system instructions. However, boundary tags alone do **not** prevent prompt injection; adversarial text inside retrieved chunks can mimic syntax or attempt command injection.
  2. **System Prompt Hardening**: System prompts must explicitly command the LLM to treat content within `<sources>` solely as passive reference text and to reject any instruction overrides, role shifts, or command sequences found within retrieved chunks.
  3. **Output Schema Validation**: The AI service enforces strict Pydantic v2 schemas and LangChain DAG tree validation, rejecting structural corruption or unexpected payload fields regardless of LLM generation anomalies.
  - *Summary*: Only the rigorous coordination of structural demarcation, system prompt hardening, and rigid output schema validation provides defense-in-depth against prompt injection vulnerabilities.

### CPD-06: Immutable Learning Attempts and Independent Retries
- **Authoritative Sources**: Proposal V1.2 Goal 4 (p. 7); `FEATURE-BRANCHING-STUDY.md` FR-BS-10; `INV-08`, `INV-09`.
- **Confirmed Rule**: Initiating a retry creates a new database record in `branching_attempts` (`attempt_number = previous + 1`). Prior attempts are preserved and accessible in the student's attempt history. Attempts are not automatically scored, averaged, or ranked against each other.

### CPD-07: System Role Segregation (Lecturer, Student, and Admin)
- **Authoritative Sources**: Proposal V1.2 Section 4 (p. 8), Deliverable 1 (p. 13); `FEATURE-AUTH-AND-ROLES.md` BR-AUTH-01, FR-AUTH-03; `00-project-foundation.md` §3.
- **Confirmed Rule**: The system strictly differentiates three distinct functional roles via backend RBAC guards and route boundaries:
  1. **Lecturer (`LECTURER`)**: Primary academic authority. Restricted access to case authoring, teaching material ingestion, DAG editing, publication state gate, student attempt review, qualitative feedback authoring, and cohort statistics.
  2. **Student (`STUDENT`)**: Primary university learner. Restricted access to active case play (Phase 1), retrospective reasoning and review (Phase 2), post-journey reflections and retries (Phase 3), AI Challenge Support dialogues, and Review Study submissions. Strictly isolated from unpublished cases (`WHERE status = 'PUBLISHED'`).
  3. **Admin (`ADMIN`)**: Platform operational administrator responsible for system configuration, user governance, and faculty verification.
- **Administrative Module Scope Boundary**: While the `ADMIN` role enum and backend authentication guards are confirmed requirements, **the scope, delivery format, and frontend screen implementation of the administrative web module in the MVP remain an unresolved product decision governed under OPD-015**.

---

## 5. Open Product Decisions (OPD-001 through OPD-015)

The following decisions represent **unresolved questions, design divergences, or business rules not yet formally ratified**. All recommendations are proposals subject to stakeholder review. Each open decision must be approved before implementing its affected functionality. Decisions explicitly deferred beyond MVP must not block the delivery of approved MVP scope.

---

### OPD-001: Student Course Discovery and Enrollment Mechanism

- **Decision ID**: `OPD-001`
- **Title**: Student Course Discovery and Enrollment: Direct Link vs. Class Invitation Code & Student Dashboard
- **Affected Role**: Both (Lecturer & Student)
- **Related Workflow**: Course Management, Student Onboarding, Case Discovery
- **Figma Evidence**:
  - `Sinh viên · Bàn học` (`1:1305`): [Figma Node 1:1305](https://www.figma.com/design/edubranch-ai?node-id=1-1305). Full student dashboard showing enrolled courses, active case assignments, and button "Tham gia lớp học mới".
  - `Sinh viên · Khóa học của tôi` (`1:1202`): [Figma Node 1:1202](https://www.figma.com/design/edubranch-ai?node-id=1-1202). Catalog of enrolled courses with button "Tham gia bằng mã lớp".
  - `Sinh viên · Tham gia lớp học` (`1:1084`): [Figma Node 1:1084](https://www.figma.com/design/edubranch-ai?node-id=1-1084). Modal dialog prompting for "Mã mời tham gia lớp" (e.g. `CS301-2026`).
  - `Giảng viên · Quản lý khóa học` (`1:2431`): [Figma Node 1:2431](https://www.figma.com/design/edubranch-ai?node-id=1-2431). Course cards display "Mã mời tham gia lớp: CS301".
- **Existing Documentation Evidence**:
  - `PROJECT_OVERVIEW.md` §Primary Actors: *"Students do not create cases. Students do not browse case lists. Student access is always via a direct link provided by the Lecturer."*
  - `00-project-foundation.md` §3 & §6: Describes direct link access to `/student/cases/:caseId/branching-play`.
  - `FEATURE-COURSE-AND-MATERIALS.md`: Specifies course management for lecturers, but does not define an enrollment code API or student course catalog.
- **Current Understanding**: Early documentation assumed direct-link-only access to individual cases. The Figma design introduces an enrollment model where students join courses using invitation codes and access cases through a personal dashboard.
- **Unresolved Question**: Should EduBranch AI support course enrollment via invitation codes (`class_code`) with a student dashboard, or remain strictly direct-link only for the MVP?
- **Possible Options**:
  - **Option A (Hybrid Model — Proposed)**: Lecturers share a course-level enrollment code (e.g. `CS301-2026`). Students join once and see all published cases on their dashboard (`Sinh viên · Bàn học`). Direct case links (`/student/cases/:caseId/branching-play`) also remain functional.
  - **Option B (Strict Direct Link Only)**: Remove the class code modals and course catalog from the student portal; students access cases solely via direct URLs distributed by the lecturer.
- **Technical Implications – Subject to Technical Review**:
  - Requires adding a `course_enrollments` join table (`student_id`, `course_id`, `enrolled_at`).
  - Requires `POST /api/v1/courses/enroll` endpoint accepting `{ enrollmentCode }`.
  - Requires `GET /api/v1/student/courses` and `GET /api/v1/student/dashboard` endpoints.
- **Impact**: Option A provides a cohesive home for students managing multiple attempts across a semester, but introduces enrollment state management.
- **Recommendation**: Proposed direction (pending Project Owner approval): Option A (Hybrid Model).
- **Decision Owner**: Project Lead & Backend Architect
- **Priority**: High
- **Status**: `OPEN`
- **Approval**: `PENDING`

---

### OPD-002: Student Reasoning Requirement on Pivotal Decisions in Branching Review

- **Decision ID**: `OPD-002`
- **Title**: Mandatory vs. Optional Retrospective Reasoning on Pivotal Decisions
- **Affected Role**: Student
- **Related Workflow**: Branching Study Phase 2 (REVIEW) & Journey Review
- **Figma Evidence**:
  - `Sinh viên · Journey Review` (`1:619`): [Figma Node 1:619](https://www.figma.com/design/edubranch-ai?node-id=1-619). Specific nodes display a badge `"Then chốt (Pivotal Decision)"` with a textarea `"Trình bày lập luận lựa chọn của bạn"`. The footer contains `"Chuyển sang bước Suy ngẫm (Reflection)"`.
  - `Giảng viên · Trình chỉnh sửa Case Study` (`1:3219`): [Figma Node 1:3219](https://www.figma.com/design/edubranch-ai?node-id=1-3219). Side panel editor includes a checkbox `"Đánh dấu là Quyết định then chốt (Pivotal Decision)"`.
- **Existing Documentation Evidence**:
  - `FEATURE-BRANCHING-STUDY.md` FR-BS-07: *"In the REVIEW phase, the student may write reasoning for individual decision points retrospectively. Writing reasoning is encouraged but not required for every single node — emphasis should be on pivotal decisions and outcome-influencing choices."*
  - `00-project-foundation.md` §6.2: *"Retrospective Reasoning: Students write reasoning_text retrospectively for pivotal decisions via PUT/PATCH."*
- **Current Understanding**: Retrospective reasoning is encouraged for pivotal decisions. However, neither the UI nor the documentation specifies whether leaving pivotal reasoning empty blocks advancing to Reflection.
- **Unresolved Question**: Does the system block a student from advancing to Phase 3 (Reflection) if reasoning on pivotal decision nodes is empty, or is pivotal reasoning optional?
- **Possible Options**:
  - **Option A (Mandatory for Pivotal Nodes)**: Submitting the Journey Review requires at least 20 characters of reasoning for each node marked `is_pivotal = true`. Non-pivotal nodes remain optional.
  - **Option B (Non-Blocking Advisory Nudge — Proposed)**: Reasoning remains optional. If a student leaves a pivotal node empty and clicks "Chuyển sang bước Suy ngẫm", a confirmation modal warns: *"Bạn chưa nhập lập luận cho quyết định then chốt. Tiếp tục sang Suy ngẫm?"*
  - **Option C (Fully Unrestricted)**: No validations or warnings on empty reasoning textareas.
- **Technical Implications – Subject to Technical Review**:
  - Option A requires frontend validation on the Journey Review form and backend validation on the complete review transition endpoint.
  - Option B requires a client-side warning dialog before navigating to the reflection route.
- **Impact**: Option A guarantees qualitative data for lecturer review, but may frustrate students during fast exploratory retries. Option B balances learning accountability with student autonomy.
- **Recommendation**: Proposed direction (pending Project Owner approval): Option B (Non-Blocking Advisory Nudge).
- **Decision Owner**: Pedagogical Lead & Product Owner
- **Priority**: High
- **Status**: `OPEN`
- **Approval**: `PENDING`

---

### OPD-003: Incomplete Branching Attempt Persistence and Resumption

- **Decision ID**: `OPD-003`
- **Title**: Resuming Incomplete Branching Attempts ("Tiếp tục làm dở" vs. Restarting)
- **Affected Role**: Student
- **Related Workflow**: Branching Study Phase 1 (Experience)
- **Figma Evidence**:
  - `Sinh viên · Giới thiệu tình huống` (`1:972`): [Figma Node 1:972](https://www.figma.com/design/edubranch-ai?node-id=1-972). Action bar displays three buttons:
    1. `"Làm lại (New Attempt #3)"` (`1:1058`)
    2. `"Xem Journey Review"` (`1:1073`)
    3. `"Tiếp tục làm dở"` (`1:1082`)
  - `Sinh viên · Bàn học` (`1:1305`): [Figma Node 1:1305](https://www.figma.com/design/edubranch-ai?node-id=1-1305). Case cards show status `"Đang làm dở"`.
- **Existing Documentation Evidence**:
  - `FEATURE-BRANCHING-ATTEMPT.md`: `branching_attempts` stores `current_node_id`, `is_completed = false`, and `started_at`.
  - `FEATURE-BRANCHING-STUDY.md`: Flow step 6 updates `current_node_id` on each option selection.
- **Current Understanding**: The backend records `current_node_id` per choice. Figma assumes students can resume an incomplete journey via `"Tiếp tục làm dở"`.
- **Unresolved Question**: How does the system handle an existing incomplete attempt when a student chooses `"Làm lại (New Attempt)"`? Does the incomplete attempt become abandoned, or can multiple incomplete attempts exist?
- **Possible Options**:
  - **Option A (Single Active Attempt with Explicit Abandonment — Proposed)**: A student may have only one in-progress attempt per case. Clicking `"Làm lại"` prompts: *"Bắt đầu lượt mới sẽ hủy lượt đang làm dở. Bạn có chắc chắn?"* The existing attempt transitions to `status = 'ABANDONED'`.
  - **Option B (Resume Mandatory)**: Students cannot start a new attempt until the current attempt reaches a terminal node.
- **Technical Implications – Subject to Technical Review**:
  - Requires adding an attempt status enum (`IN_PROGRESS`, `COMPLETED`, `ABANDONED`) to `branching_attempts`.
  - `GET /api/v1/cases/{caseId}/attempts/active` endpoint to fetch the resumable node ID.
- **Impact**: Clarifies state transitions and ensures the `"Tiếp tục làm dở"` button in Figma routes accurately to the student's last active node.
- **Recommendation**: Proposed direction (pending Project Owner approval): Option A (Single Active Attempt with Explicit Abandonment).
- **Decision Owner**: Backend Architect
- **Priority**: Medium
- **Status**: `OPEN`
- **Approval**: `PENDING`

---

### OPD-004: Maximum Attempt Limits and Cohort Policy

- **Decision ID**: `OPD-004`
- **Title**: Case Retry Limits: Unlimited vs. Lecturer-Configured Ceiling
- **Affected Role**: Both (Lecturer & Student)
- **Related Workflow**: Case Management, Student Retries, Cohort Analytics
- **Figma Evidence**:
  - `Sinh viên · Lịch sử lần làm bài` (`1:790`): [Figma Node 1:790](https://www.figma.com/design/edubranch-ai?node-id=1-790). Lists Attempt #1 and Attempt #2 with separate terminal outcomes.
  - `Sinh viên · Giới thiệu tình huống` (`1:972`): [Figma Node 1:972](https://www.figma.com/design/edubranch-ai?node-id=1-972). Button displays `"Làm lại (New Attempt #3)"`.
  - `Giảng viên · Thống kê luồng học tập` (`1:1493`): [Figma Node 1:1493](https://www.figma.com/design/edubranch-ai?node-id=1-1493). Shows attempt frequency metrics ("1 lần: 65%", "2 lần: 25%", "3+ lần: 10%").
- **Existing Documentation Evidence**:
  - `00-project-foundation.md` §6.2: *"Student may optionally invoke AI Challenge Support or initiate a Retry, which creates a new immutable branching_attempts row with attempt_number = previous + 1."*
  - `INV-08`: Retrying creates a new attempt row. No attempt ceiling is defined.
- **Current Understanding**: The documentation describes retrying as exploring alternative decision paths, without defining a limit.
- **Unresolved Question**: Should lecturers be able to set a maximum number of attempts (`max_attempts`) per case, or is retrying always unlimited?
- **Possible Options**:
  - **Option A (Configurable Ceiling with Unlimited Default — Proposed)**: Cases support an optional `max_attempts` setting (integer, default `NULL` = unlimited). If the limit is reached, the `"Làm lại"` button is disabled with an explanatory tooltip.
  - **Option B (Always Unlimited)**: The system never restricts retries. Lecturers enforce attempt policies externally through grading deadlines.
- **Technical Implications – Subject to Technical Review**:
  - Requires adding `max_attempts INTEGER DEFAULT NULL` to the `cases` table.
  - Backend validation check in `POST /api/v1/cases/{caseId}/branching-attempts`.
- **Impact**: Option A provides pedagogical control for classroom trials requiring single-attempt data, while supporting open exploration when set to unlimited.
- **Recommendation**: Proposed direction (pending Project Owner approval): Option A (Configurable Ceiling with Unlimited Default).
- **Decision Owner**: Product Owner & Pedagogical Lead
- **Priority**: Medium
- **Status**: `OPEN`
- **Approval**: `PENDING`

---

### OPD-005: AI Challenge Support Invocation Architecture (Modal vs. Embedded Timeline)

- **Decision ID**: `OPD-005`
- **Title**: AI Challenge Support UI Placement: Embedded Timeline Component vs. Standalone Modal
- **Affected Role**: Student
- **Related Workflow**: Branching Study Phase 2/3 & AI Challenge Support
- **Figma Evidence**:
  - `Sinh viên · Journey Review` (`1:619`): [Figma Node 1:619](https://www.figma.com/design/edubranch-ai?node-id=1-619). Renders a Challenge Support block embedded at the bottom of the timeline canvas.
  - `Sinh viên · AI Challenge Support (Modal Socratic)` (`27:321`): [Figma Node 27:321](https://www.figma.com/design/edubranch-ai?node-id=27-321). Dedicated modal dialog showing the AI counter-question, response textarea, character counter, and buttons `"Bỏ qua"` and `"Gửi phản hồi Vòng 1"`.
- **Existing Documentation Evidence**:
  - `P2-student-core.md` §3: Describes Challenge Support as an optional panel or modal entered from Journey Review, capped at 2 rounds.
  - `FEATURE-AI-REASONING-CHALLENGE-SUPPORT.md`: Specifies Socratic probing logic and round tracking, independent of UI presentation.
- **Current Understanding**: Figma contains two alternative UI treatments: an inline block at the bottom of the timeline and a dedicated modal dialog focused on a single decision.
- **Unresolved Question**: Should AI Challenge Support be presented as a modal dialog targeting a specific decision, or as a persistent inline section at the bottom of the Journey Review page?
- **Possible Options**:
  - **Option A (Targeted Modal Dialog — Proposed)**: Use `Sinh viên · AI Challenge Support (Modal Socratic)` (`27:321`). Clicking `"Thử thách lập luận cùng AI"` on a decision card opens the modal targeting that specific decision's reasoning.
  - **Option B (Inline Page Section)**: Embed Challenge Support statically at the bottom of the Journey Review page.
- **Technical Implications – Subject to Technical Review**:
  - Option A cleanly maps the session target to `student_reasoning.id` and isolates the Socratic dialogue state in a modal dialog.
  - Option B requires embedding the session state into the main timeline layout.
- **Impact**: Option A clarifies which decision is being probed and prevents confusion on long timeline pages ($>2000\text{px}$).
- **Recommendation**: Proposed direction (pending Project Owner approval): Option A (Targeted Modal Dialog).
- **Decision Owner**: Frontend Lead & UI Designer
- **Priority**: Medium
- **Status**: `OPEN`
- **Approval**: `PENDING`

---

### OPD-006: AI Case Generation Flow: 3-Step Wizard vs. Single Configuration Modal

- **Decision ID**: `OPD-006`
- **Title**: AI Case Studio Architecture: 3-Step Wizard vs. Single Modal
- **Affected Role**: Lecturer
- **Related Workflow**: Case Generation & AI Studio
- **Figma Evidence**:
  - `Giảng viên · AI Studio — Khóa học và chế độ` (`1:3088`): [Figma Node 1:3088](https://www.figma.com/design/edubranch-ai?node-id=1-3088). Step 1: Select course and learning mode.
  - `Giảng viên · AI Studio — Chủ đề và tài liệu` (`1:2939`): [Figma Node 1:2939](https://www.figma.com/design/edubranch-ai?node-id=1-2939). Step 2: Topic prompt, material checklist, node count, difficulty.
  - `Giảng viên · AI Studio — Xác nhận cấu hình` (`1:2818`): [Figma Node 1:2818](https://www.figma.com/design/edubranch-ai?node-id=1-2818). Step 3: Summary review and generation trigger button.
- **Existing Documentation Evidence**:
  - `P1-lecturer-core.md` §3: Describes a single "Generate Case" modal: `topic` (required text), optional `materialIds` multi-select, optional `targetNodeCount`.
  - `FEATURE-CASE-GENERATION.md`: Outlines generation inputs and validation rules without mandating a specific UI stepping model.
- **Current Understanding**: The early design document specified a single modal, whereas the Figma design implements a 3-step full-page wizard.
- **Unresolved Question**: Should AI case generation follow the 3-step full-page wizard from Figma, or be consolidated into a single modal dialog?
- **Possible Options**:
  - **Option A (3-Step Full-Page Wizard — Proposed)**: Implement the wizard flow (`/lecturer/courses/:courseId/cases/new/step-1` through `step-3`) matching Figma frames `1:3088`, `1:2939`, and `1:2818`.
  - **Option B (Single Modal Dialog)**: Consolidate all configuration fields into a single modal dialog launched from the case list.
- **Technical Implications – Subject to Technical Review**:
  - Option A requires dedicated sub-routes and multi-step form state management (e.g. Zustand wizard store).
  - Option B uses a simpler dialog component with local component state.
- **Impact**: Option A provides visual space to inspect material grounding checklists and review parameters before triggering long-running AI generation calls.
- **Recommendation**: Proposed direction (pending Project Owner approval): Option A (3-Step Full-Page Wizard).
- **Decision Owner**: Product Owner & Frontend Lead
- **Priority**: Medium
- **Status**: `OPEN`
- **Approval**: `PENDING`

---

### OPD-007: Case Modification and Versioning After Publication

- **Decision ID**: `OPD-007`
- **Title**: Handling Case Edits When Student Attempts Already Exist
- **Affected Role**: Both (Lecturer & Student)
- **Related Workflow**: Case Lifecycle, Case Editing, Attempt Integrity
- **Figma Evidence**:
  - `Giảng viên · Trình chỉnh sửa Case Study` (`1:3219`): [Figma Node 1:3219](https://www.figma.com/design/edubranch-ai?node-id=1-3219). Decision tree editor with status stepper (`DRAFT → REVIEWED → APPROVED → PUBLISHED`).
  - `Giảng viên · Hộp thoại phê duyệt và xuất bản` (`1:1444`): [Figma Node 1:1444](https://www.figma.com/design/edubranch-ai?node-id=1-1444). Confirmation modal warning that publishing makes the case accessible to students.
- **Existing Documentation Evidence**:
  - `00-project-foundation.md` §6.1: *"Immutability After Approval: AI must never alter lecturer-approved case branches, consequences, or outcomes."*
  - `P1-lecturer-core.md` §4: *"Read-only awareness for published+active cases: if a PUBLISHED case already has active student attempts, structural edits should surface a warning that this may create a new version rather than silently mutating history (BR-REV-04)."*
- **Current Understanding**: The documentation notes that editing an active published case requires caution, but the exact versioning policy remains undefined.
- **Unresolved Question**: When a lecturer edits a `PUBLISHED` case that already contains student attempts, does the system freeze tree structure, create a new case version, or allow in-place edits?
- **Possible Options**:
  - **Option A (Structural Freeze with Text-Only Edits — Proposed for MVP)**: If student attempts exist ($>0$), the decision tree structure (adding/deleting nodes, modifying `next_node_id`) is frozen. Lecturers may only edit typographical errors in text. An advisory banner notes: *"Cấu trúc tình huống đã khóa để bảo toàn dữ liệu bài làm của sinh viên."*
  - **Option B (Case Cloning / Versioning)**: Structural edits prompt: *"Tạo phiên bản mới (V2)?"* Clones the case into a new `DRAFT`, leaving the published V1 intact for existing student attempts.
- **Technical Implications – Subject to Technical Review**:
  - Option A requires a backend check: if `attempts_count > 0`, reject structural DAG modifications (`POST/DELETE` on nodes/options).
  - Option B requires adding a `version` integer column and `parent_case_id` self-reference to the `cases` table.
- **Impact**: Option A maintains attempt data integrity without requiring multi-version branching logic during the MVP trial.
- **Recommendation**: Proposed direction (pending Project Owner approval): Option A (Structural Freeze with Text-Only Edits for MVP).
- **Decision Owner**: Backend Architect & Database Lead
- **Priority**: High
- **Status**: `OPEN`
- **Approval**: `PENDING`

---

### OPD-008: Lecturer Registration Verification and Gatekeeping

- **Decision ID**: `OPD-008`
- **Title**: Lecturer Registration Verification: Immediate Activation vs. Department/Admin Gatekeeping
- **Affected Role**: Lecturer & Admin
- **Related Workflow**: Authentication, User Registration, Admin Governance
- **Figma Evidence**:
  - `Đăng ký · Giảng viên` (`1:122`): [Figma Node 1:122](https://www.figma.com/design/edubranch-ai?node-id=1-122). Notice: *"Quyền tác giả của Giảng viên được kích hoạt sau khi xác minh bởi Khoa / Đơn vị công tác."*
  - `Admin · Quản lý người dùng` (`1:4025`): [Figma Node 1:4025](https://www.figma.com/design/edubranch-ai?node-id=1-4025). Displays tab `"Giảng viên chờ duyệt (1)"` and audit event `APPROVE_LECTURER`.
- **Existing Documentation Evidence**:
  - `FEATURE-AUTH-AND-ROLES.md` FR-AUTH-01: Describes user registration with role selection.
  - Database schema notes `users.is_active BOOLEAN DEFAULT TRUE`.
- **Current Understanding**: The presence of `DEFAULT TRUE` in a database column does not establish that immediate self-activation was an intentional product decision. The Figma design introduces an administrative approval gate to prevent unauthorized users from gaining faculty authoring rights.
- **Unresolved Question**: Should newly registered Lecturers receive immediate active authoring status, or require approval by an Admin or institutional email verification?
- **Possible Options**:
  - **Option A (Administrative Verification Queue — Proposed)**: Student registrations are immediately active. Lecturer registrations are set to `is_active = false` (or `status = 'PENDING'`), appearing in `Admin · Quản lý người dùng` for verification before authoring permissions are enabled.
  - **Option B (Institutional Email Domain Whitelist)**: Registrations with confirmed institutional domains (`@*.edu.vn`) are auto-approved; other domains require administrative verification.
  - **Option C (Immediate Self-Service)**: All registered accounts are immediately active, relying on post-hoc removal of unauthorized users.
- **Technical Implications – Subject to Technical Review**:
  - Option A requires setting `is_active = false` for `LECTURER` registrations and adding `PUT /api/v1/admin/users/{id}/approve` endpoint.
  - Option B requires domain regex checking in the NestJS registration service.
- **Impact**: Protects institutional teaching materials and case publishing rights from unauthorized student or external accounts.
- **Recommendation**: Proposed direction (pending Project Owner approval): Option A (Administrative Verification Queue).
- **Decision Owner**: Security Lead & Product Owner
- **Priority**: Medium
- **Status**: `OPEN`
- **Approval**: `PENDING`

---

### OPD-009: Student Notification and Display of Lecturer Feedback in Branching Study

- **Decision ID**: `OPD-009`
- **Title**: Location and Notification Mechanism for Lecturer Feedback on Branching Attempts
- **Affected Role**: Both (Lecturer & Student)
- **Related Workflow**: Lecturer Feedback & Student History Review
- **Figma Evidence**:
  - `Giảng viên · Chi tiết phản hồi lập luận sinh viên` (`1:1702`): [Figma Node 1:1702](https://www.figma.com/design/edubranch-ai?node-id=1-1702). Lecturer inspects student path and submits feedback via button `"Gửi phản hồi cho sinh viên"`.
  - `Sinh viên · Review Study đã phản hồi` (`1:297`): [Figma Node 1:297](https://www.figma.com/design/edubranch-ai?node-id=1-297). Clearly displays the `"Nhận xét từ Giảng viên"` card for Review Study submissions.
  - `Sinh viên · Lịch sử lần làm bài` (`1:790`): [Figma Node 1:790](https://www.figma.com/design/edubranch-ai?node-id=1-790). Table lists attempts with column "Phản hồi giảng viên" indicating feedback presence.
- **Existing Documentation Evidence**:
  - `FEATURE-LECTURER-FEEDBACK.md`: Supports `lecturer_feedback` linked to `branching_attempt_id`.
  - `P2-student-core.md`: Does not detail the exact screen where a student views lecturer feedback for a Branching Study attempt.
- **Current Understanding**: In Review Study, feedback appears on the review submission screen. In Branching Study, students complete their reflection immediately without waiting for feedback; feedback arrives asynchronously later.
- **Unresolved Question**: Where and how does a student view the Lecturer's qualitative feedback on their Branching Study attempt?
- **Possible Options**:
  - **Option A (Journey Review Feedback Header — Proposed)**: When feedback exists for a `branching_attempt_id`, viewing `/student/cases/:caseId/attempt/:attemptId/review` displays a `Lecturer Feedback Block` (`GLOBAL-DESIGN-SYSTEM.md §6.10`) at the top of the timeline. A direct link is accessible from `Sinh viên · Lịch sử lần làm bài` (`1:790`).
  - **Option B (Separate Feedback Screen)**: Create a dedicated route `/student/cases/:caseId/attempt/:attemptId/feedback`.
- **Technical Implications – Subject to Technical Review**:
  - Option A reuses the existing Journey Review timeline component, fetching feedback via `GET /api/v1/branching-attempts/{id}/feedback`.
- **Impact**: Option A provides a unified review space without creating redundant single-purpose routes.
- **Recommendation**: Proposed direction (pending Project Owner approval): Option A (Journey Review Feedback Header).
- **Decision Owner**: Frontend Lead & UI Designer
- **Priority**: Medium
- **Status**: `OPEN`
- **Approval**: `PENDING`

---

### OPD-010: AI-Assisted Qualitative Feedback Drafting for Lecturers

- **Decision ID**: `OPD-010`
- **Title**: AI Feedback Suggestion for Lecturers: Permitted Faculty Support vs. Zero AI Grading Principle
- **Affected Role**: Lecturer
- **Related Workflow**: Lecturer Review & Feedback Authoring
- **Figma Evidence**:
  - `Giảng viên · Chi tiết phản hồi lập luận sinh viên` (`1:1702`): [Figma Node 1:1702](https://www.figma.com/design/edubranch-ai?node-id=1-1702). Interface includes card `"Gợi ý phân tích từ AI (Dành riêng cho Giảng viên tham khảo)"` with button `"Bấm để sinh gợi ý"`.
- **Existing Documentation Evidence**:
  - `00-project-foundation.md` §6.1: *"Zero AI Grading: AI Reasoning / Challenge Support MUST NOT grade, score, rank, or assign pass/fail judgments to student reasoning, solutions, or reflections. Academic evaluation belongs 100% to human lecturers."*
  - `FEATURE-LECTURER-FEEDBACK.md` §3: *"All evaluation and feedback are authored by human lecturers. AI is strictly prohibited from generating grade values, pass/fail marks, or automatic feedback evaluations."*
- **Current Understanding**:
  - The project enforces a strict four-level boundary:
    1. **AI numerical grading**: Strictly Prohibited.
    2. **AI evaluative pass/fail judgments**: Strictly Prohibited.
    3. **Private qualitative suggestions for lecturers**: Designed in Figma `1:1702` as an authoring aid.
    4. **Lecturer-approved student-facing feedback**: Required academic output.
- **Unresolved Question**: Is the AI service permitted to generate private qualitative feedback drafts for the lecturer's review, provided the draft is never sent directly to students?
- **Possible Options**:
  - **Option A (Private Faculty Drafting Aid — Proposed)**: Permitted. Clicking `"Bấm để sinh gợi ý"` generates a private draft analyzing student trade-offs against course materials. The draft is placed in an editable textarea. Nothing is visible to the student until the human lecturer reviews, edits, and submits it.
  - **Option B (Strict Zero-AI in Feedback)**: Prohibit AI from generating even private drafts for the lecturer; feedback textareas must be typed manually from a blank state.
- **Technical Implications – Subject to Technical Review**:
  - Option A requires an internal endpoint `POST /internal/v1/generation/feedback-hint` accepting student journey data and returning qualitative observations without scores.
- **Impact**: Option A assists lecturers in providing feedback to large cohorts while preserving human-in-the-loop responsibility. The Zero AI Grading principle is fully preserved because no AI score or unreviewed message reaches students.
- **Recommendation**: Proposed direction (pending Project Owner approval): Option A (Private Faculty Drafting Aid).
- **Decision Owner**: Pedagogical Lead & AI Service Lead
- **Priority**: High
- **Status**: `OPEN`
- **Approval**: `PENDING`

---

### OPD-011: Quantitative Research Rubric Evaluation Integration

- **Decision ID**: `OPD-011`
- **Title**: Rubric Quality Assessment: In-Platform Scoring Form vs. External CSV/Tool Export
- **Affected Role**: Lecturer & Admin
- **Related Workflow**: Capstone Research Experiment & Quality Assessment
- **Figma Evidence**:
  - `Giảng viên · Rubric nghiên cứu chất lượng tình huống` (`1:2081`): [Figma Node 1:2081](https://www.figma.com/design/edubranch-ai?node-id=1-2081). Full evaluation screen assessing Realism (1–5), Difficulty (1–5), and Alignment (1–5) with qualitative notes and button `"Lưu phiếu đánh giá Rubric"`.
  - `Admin · Nghiên cứu và Rubric` (`1:4511`): [Figma Node 1:4511](https://www.figma.com/design/edubranch-ai?node-id=1-4511). Oversight view of all rubric ratings across courses with button `"Xuất dữ liệu CSV"`.
- **Existing Documentation Evidence**:
  - `FEATURE-EVALUATION-AND-RESEARCH.md`: *"Implementation Method Status: Open / To Be Decided (both manual in-platform rubric scoring and structured offline data export are documented as future implementation options pending Project Owner confirmation)."*
- **Current Understanding**: The documentation left the implementation format open. The Figma design has fully visualized in-platform rubric scoring for both Lecturer and Admin. Note that OPD-011 remains an unresolved product decision; therefore, inclusion of the `Admin · Nghiên cứu và Rubric` screen (`1:4511`) in OPD-015 is strictly conditional on stakeholder ratification of this decision.
- **Unresolved Question**: Should in-platform rubric evaluation forms be implemented in the MVP web interface, or should evaluation be conducted via external research tools (Google Forms / offline CSV)?
- **Possible Options**:
  - **Option A (In-Platform Rubric + CSV Export — Proposed)**: Implement the `case_evaluations` table (`case_id`, `evaluator_id`, `realism_score`, `difficulty_score`, `alignment_score`, `notes`) and render the screens matching Figma `1:2081` and `1:4511`.
  - **Option B (External Research Instrument)**: Remove in-platform scoring forms from MVP scope; evaluators complete surveys via external forms and import CSVs for analysis. If Option B is selected, the Admin rubric oversight screen (`1:4511`) is omitted from the administrative suite.
- **Technical Implications – Subject to Technical Review**:
  - Option A requires implementing the `evaluation/` module in NestJS with CRUD endpoints.
  - Option B requires only basic CSV telemetry export from student attempts.
- **Impact**: Option A enables direct in-platform data collection for Capstone Deliverable 6 during the trial, but requires building dedicated scoring views for both lecturers and admins.
- **Recommendation**: Proposed direction (pending Project Owner approval): Option A (In-Platform Rubric + CSV Export). Note: Approval of Option A is a strict prerequisite for implementing the Admin Research & Rubric screen in OPD-015.
- **Decision Owner**: Project Lead & Research Lead
- **Priority**: Medium
- **Status**: `OPEN`
- **Approval**: `PENDING`

---

### OPD-012: Material Processing Failure Recovery and Partial Generation

- **Decision ID**: `OPD-012`
- **Title**: Handling Partial Document Ingestion Failures During Case Generation
- **Affected Role**: Lecturer
- **Related Workflow**: Document Ingestion & Case Generation
- **Figma Evidence**:
  - `Giảng viên · Chi tiết khóa học — Tài liệu môn học` (`1:2258`): [Figma Node 1:2258](https://www.figma.com/design/edubranch-ai?node-id=1-2258). Table displaying materials with status tags `Completed`, `Processing`, and `Failed`.
  - `Giảng viên · AI Studio — Chủ đề và tài liệu` (`1:2939`): [Figma Node 1:2939](https://www.figma.com/design/edubranch-ai?node-id=1-2939). Checkbox list of course materials available for grounding.
- **Existing Documentation Evidence**:
  - `FEATURE-COURSE-AND-MATERIALS.md` BR-MAT-04: Failed ingestion sets `processing_status = 'FAILED'`.
  - `P1-lecturer-core.md` §3: *"if the course has zero completed materials, disable Generate Case..."*
- **Current Understanding**: The documentation defines what happens when zero materials are completed, but does not define behavior when some materials succeed and others fail.
- **Unresolved Question**: Can case generation proceed if some materials in a course are in `FAILED` status, and does the UI provide a one-click retry button for failed documents?
- **Possible Options**:
  - **Option A (Granular Selection with Inline Retry — Proposed)**: Lecturers can generate cases as long as at least one material is `COMPLETED`. In Step 2 of AI Studio (`1:2939`), only `COMPLETED` materials are selectable. In Materials view (`1:2258`), `FAILED` rows offer a `"Thử lại"` button to re-trigger parsing/embedding.
  - **Option B (Strict All-Clear Gate)**: Case generation is blocked if any document in the course is currently in `FAILED` status.
- **Technical Implications – Subject to Technical Review**:
  - Requires `POST /api/v1/materials/{id}/retry` endpoint to re-dispatch ingestion jobs to the AI service.
- **Impact**: Option A prevents user blocking when one non-essential document fails parsing.
- **Recommendation**: Proposed direction (pending Project Owner approval): Option A (Granular Selection with Inline Retry).
- **Decision Owner**: Backend Architect & AI Lead
- **Priority**: Medium
- **Status**: `OPEN`
- **Approval**: `PENDING`

---

### OPD-013: AI Provider Switching and Runtime Admin Governance

- **Decision ID**: `OPD-013`
- **Title**: AI Provider Selection: Dynamic Admin UI Configuration vs. Environment File Static Configuration
- **Affected Role**: Admin
- **Related Workflow**: AI Service Governance & System Administration
- **Figma Evidence**:
  - `Admin · Cấu hình dịch vụ AI` (`1:5543`): [Figma Node 1:5543](https://www.figma.com/design/edubranch-ai?node-id=1-5543). Interface showing provider radios (`Google Gemini 2.0 Flash` vs `OpenAI GPT-4o-mini`), timeout fields, rate limits, and button `"Lưu cấu hình AI"`.
- **Existing Documentation Evidence**:
  - `ai-service/app/core/config.py`: Reads `LLM_PROVIDER`, `GEMINI_API_KEY`, and `OPENAI_API_KEY` from environment variables (`.env`).
  - `providers/factory.py`: Dynamically instantiates the provider based on configuration.
- **Current Understanding**: The existing codebase uses static environment variables. The Figma design presents a dynamic administrative control panel.
- **Unresolved Question**: Should provider switching be configurable at runtime via database/Redis settings, or remain statically configured via environment variables for the MVP?
- **Possible Options**:
  - **Option A (Dynamic Runtime Settings)**: Store active provider and parameters in a database configuration table; the AI service re-reads active provider settings on each call.
  - **Option B (Static Environment Config with Read-Only UI — Proposed for MVP)**: Keep provider configuration in `.env` files for the MVP. Screen `1:5543` displays current configuration in read-only mode, deferring dynamic switching to post-MVP.
- **Technical Implications – Subject to Technical Review**:
  - Option A requires dynamic configuration synchronization between NestJS, Redis, and FastAPI.
  - Option B requires zero architectural changes to `providers/factory.py`.
- **Impact**: Option B reduces architectural complexity for the initial classroom trial.
- **Recommendation**: Proposed direction (pending Project Owner approval): Option B (Static Environment Config with Read-Only UI for MVP).
- **Decision Owner**: DevOps & Backend Lead
- **Priority**: Low
- **Status**: `OPEN`
- **Approval**: `PENDING`

---

### OPD-014: Deletion Boundaries and Data Retention Policies

- **Decision ID**: `OPD-014`
- **Title**: Deletion Boundaries: Teaching Materials, Courses, Cases, and Student Learning History
- **Affected Role**: Both (Lecturer & Student)
- **Related Workflow**: Course Management, Material Deletion, Case Archival
- **Figma Evidence**:
  - `Giảng viên · Hộp thoại xác nhận xóa tài liệu` (`29:1106`): [Figma Node 29:1106](https://www.figma.com/design/edubranch-ai?node-id=29-1106). Modal confirming deletion of an uploaded file.
  - `Admin · Quản lý khóa học` (`1:4795`) & `Admin · Quản lý Case Study` (`1:5043`): Action menus with delete/archive options.
- **Existing Documentation Evidence**:
  - `FEATURE-COURSE-AND-MATERIALS.md` BR-MAT-03: *"Deleting a course cascades deletion or archiving of associated materials and generated cases."*
- **Current Understanding**:
  - Deletion operates across four distinct entities that must not be conflated:
    1. **Teaching Materials**: Deleting an uploaded file deletes the MinIO object and vector chunks.
    2. **Courses**: Deleting a course container.
    3. **Case Studies**: Deleting or archiving a decision scenario.
    4. **Student Attempts & History**: Student journey records, reasoning, reflections, and lecturer feedback.
  - An upload deletion dialog (`29:1106`) does not establish course or student record retention policy.
- **Unresolved Question**: When a lecturer deletes a course or case, are student attempts hard-deleted (permanently destroyed) or soft-archived to preserve academic history?
- **Possible Options**:
  - **Option A (Soft Archival for Courses and Cases — Proposed)**: Courses and cases use soft deletion (`is_active = false`, `status = 'ARCHIVED'`). They are hidden from active catalogs, but existing student attempt records and feedback remain preserved for student history and research audits.
  - **Option B (Hard Cascade Delete)**: Database `ON DELETE CASCADE` permanently purges all associated attempts, reasoning records, and feedback.
- **Technical Implications – Subject to Technical Review**:
  - Option A requires filtering `WHERE is_active = true` on active catalog queries and removing `CASCADE` constraints on student attempt foreign keys.
- **Impact**: Option A prevents catastrophic accidental loss of student grades, reflections, and trial telemetry.
- **Recommendation**: Proposed direction (pending Project Owner approval): Option A (Soft Archival for Courses and Cases).
- **Decision Owner**: Database Architect & Compliance Lead
- **Priority**: High
- **Status**: `OPEN`
- **Approval**: `PENDING`

---

### OPD-015: Admin Role and Administrative Module Scope in MVP

- **Decision ID**: `OPD-015`
- **Title**: Scope of the Admin Role and Administrative Web Module in the MVP
- **Affected Role**: Admin (System-Level)
- **Related Workflow**: System Administration, Faculty Verification, Platform Governance
- **Figma Evidence**:
  - 10 dedicated Admin frames designed in Figma:
    1. `Admin · Đăng nhập` (`1:4477`)
    2. `Admin · Bảng điều khiển` (`1:3715`)
    3. `Admin · Quản lý người dùng` (`1:4025`)
    4. `Admin · Hộp thoại xác nhận khóa người dùng` (`30:1864`)
    5. `Admin · Quản lý khóa học` (`1:4795`)
    6. `Admin · Quản lý Case Study` (`1:5043`)
    7. `Admin · Cấu hình dịch vụ AI` (`1:5543`)
    8. `Admin · Nghiên cứu và Rubric` (`1:4511`)
    9. `Admin · Nhật ký hệ thống` (`1:5302`)
    10. `Admin · Cài đặt hệ thống` (`1:4345`)
- **Existing Documentation Evidence**:
  - Proposal V1.2 Deliverable 1 (p. 13):
    *"Deliverable 1: A web application with a lecturer interface (case generation, verify/edit/approve, review/feedback, basic statistics) and a student interface (Branching Study case flow with Journey Review, reflection and retry, simple Review Study, reasoning entry, AI reasoning/challenge support)."*
  - Proposal V1.2 Section 4 (p. 8): Specifies primary user roles as Lecturer and Student.
  - Proposal V1.2 Context Diagram: Identifies Admin as an external boundary entity (account/role management, system monitoring).
- **Current Understanding**: The Capstone proposal focuses on the academic interaction between Lecturer and Student. An Admin entity was included in the Context Diagram, but building a 10-screen administrative web application was not enumerated under Deliverable 1. Furthermore, any inclusion of the `Admin · Nghiên cứu và Rubric` screen (`1:4511`) depends directly on stakeholder resolution of `OPD-011` (Rubric Quality Assessment).
- **Unresolved Question**: Should the full 10-screen Admin web application be built into the MVP frontend, or should administrative tasks (database seeding, user approval, system monitoring) be handled via backend scripts and minimal CLI tools for the initial trial?
- **Possible Options**:
  - **Option A (Lightweight Essential Admin Portal — Proposed)**: Implement essential administrative screens in the MVP frontend: `Admin · Đăng nhập` and `Admin · Quản lý người dùng` (for faculty verification). The `Admin · Nghiên cứu và Rubric` screen is **strictly conditional on stakeholder approval of OPD-011** (In-Platform Rubric Evaluation). If OPD-011 selects Option B (external research instrument), the Admin rubric view is excluded from MVP scope. Defer advanced system settings, live AI reconfiguration, and log viewer screens to post-MVP.
  - **Option B (Full 10-Screen Admin Web App)**: Implement all 10 Admin screens as designed in Figma.
  - **Option C (Backend-Only Administration for MVP)**: No Admin web UI in MVP; manage faculty accounts and research exports via backend database scripts and seed commands.
- **Technical Implications – Subject to Technical Review**:
  - Option A requires implementing `admin/` module routes for user approval; rubric oversight and CSV export endpoints are strictly conditional on OPD-011 approval.
  - Option B adds substantial frontend development scope across 10 screens, increasing sprint delivery risk.
- **Impact**: Option A preserves delivery focus on the core pedagogical loop (Branching Case Player and Case Review) while providing necessary administrative controls for the classroom trial without prematurely committing to an unapproved rubric view.
- **Recommendation**: Proposed direction (pending Project Owner approval): Option A (Lightweight Essential Admin Portal, with Admin Research & Rubric screen strictly conditional on OPD-011 approval).
- **Decision Owner**: Project Lead & Scrum Master
- **Priority**: High
- **Status**: `OPEN`
- **Approval**: `PENDING`

---

## 6. Potential Requirement Conflicts and Design Divergences

The following table summarizes areas where current Figma visual layouts diverge from documented requirements. These divergences are flagged for stakeholder alignment:

| Area | Documented Requirement Stance | Figma Design Representation | Nature of Divergence | Proposed Alignment Direction |
|---|---|---|---|---|
| **1. Student Case Discovery** | `PROJECT_OVERVIEW.md`: Student access is strictly via direct link; no student case browsing or dashboard. | `Sinh viên · Bàn học` (`1:1305`) & `Khóa học của tôi` (`1:1202`): Full student portal with course lists, enrollment by code, and task cards. | Design Divergence | Proposed direction (pending Project Owner approval): Hybrid Model (`OPD-001`) supporting direct links while enabling enrolled dashboard access. |
| **2. Case Generation UX** | `P1-lecturer-core.md`: Single compact modal dialog on the course cases screen. | `Giảng viên · AI Studio` (`1:3088`, `1:2939`, `1:2818`): 3-step full-page wizard. | Representation Divergence | Proposed direction (pending Project Owner approval): 3-Step Wizard (`OPD-006`) for clearer material review and RAG configuration. |
| **3. Lecturer Registration** | `FEATURE-AUTH-AND-ROLES.md`: Self-service registration; database column has `is_active DEFAULT TRUE`. | `Đăng ký · Giảng viên` (`1:122`) & `Admin · Quản lý người dùng` (`1:4025`): Verification notice and pending approval queue. | Business Rule Conflict | Proposed direction (pending Project Owner approval): Administrative Verification Gate (`OPD-008`) to prevent unauthorized case publishing. |
| **4. AI Feedback Assistance** | `FEATURE-LECTURER-FEEDBACK.md`: All feedback authored by human; zero AI involvement in student evaluation. | `Giảng viên · Chi tiết phản hồi` (`1:1702`): Private card "Gợi ý phân tích từ AI" with button "Bấm để sinh gợi ý". | Functional Enhancement | Proposed direction (pending Project Owner approval): Private Faculty Drafting Aid (`OPD-010`) to assist lecturers privately while strictly preserving zero AI grading to students. |
| **5. AI Challenge Support Placement** | `P2-student-core.md`: Embedded panel on the Journey Review page. | `Sinh viên · AI Challenge Support (Modal Socratic)` (`27:321`): Standalone modal dialog. | UI Container Divergence | Proposed direction (pending Project Owner approval): Targeted Modal Dialog (`OPD-005`) focusing Socratic probing on specific decision nodes. |
| **6. Research Rubric Scoring** | `FEATURE-EVALUATION-AND-RESEARCH.md`: Implementation status marked `Open / To Be Decided` (Google Forms/CSV). | `Giảng viên · Rubric` (`1:2081`) & `Admin · Rubric` (`1:4511`): Complete in-platform interactive scoring UI. | Scope Ambiguity | Proposed direction (pending Project Owner approval): In-Platform Rubric (`OPD-011`) to provide native support for Capstone Deliverable 6. |
| **7. Admin Suite Scope** | Proposal V1.2 Deliverable 1: Deliverables explicitly define Lecturer and Student interfaces. | Figma includes 10 dedicated Admin screens (`1:4477` through `1:4345`). | Scope Divergence | Proposed direction (pending Project Owner approval): Lightweight Admin Portal (`OPD-015`) focusing on faculty verification, with Admin Rubric screen strictly conditional on OPD-011 approval. |

---

## 7. Missing Information (To Be Specified Before Implementation)

The following operational details remain undefined across documentation and designs, and must be clarified before code freeze:

1. **Auto-Save Frequency for Case Review Editor**:
   - `Giảng viên · Trình chỉnh sửa Case Study` (`1:3219`) displays `"Đã lưu nháp tự động"`.
   - *Missing*: Debounce interval (e.g. 1500ms after last keystroke) and auto-save endpoint payload definition.
2. **Session Timeout for Active Branching Attempts**:
   - *Missing*: Does an active attempt expire if a student leaves a decision point open for over 24 hours, or remain open until explicit completion?
3. **Maximum Node Limit for Generated Trees**:
   - In AI generation, `targetNodeCount` defaults to 5–10 nodes.
   - *Missing*: Hard technical ceiling on ReactFlow DAG nodes (e.g. max 25 nodes) to guarantee browser rendering performance.
4. **Student Reflection Character Bounds**:
   - *Missing*: Minimum and maximum character thresholds for `reflection_text` (e.g. minimum 50 characters, maximum 3,000 characters).

---

## 8. Recommended Next Decisions (Roadmap for Review)

The following sequence is recommended for stakeholder sign-off:

```
[Phase 1: Foundation & Onboarding]
  1. OPD-001 (Enrollment Code vs Direct Link)  ──► Ratify course enrollment model
  2. OPD-008 (Lecturer Verification Gate)      ──► Finalize faculty registration flow
  3. OPD-015 (Admin Module Scope in MVP)       ──► Confirm MVP screen delivery list

[Phase 2: Case Authoring & Ingestion]
  4. OPD-006 (AI Studio 3-Step Wizard)        ──► Approve case generation routing
  5. OPD-007 (Case Post-Publish Immutability)  ──► Establish DAG freeze rules
  6. OPD-012 (Material Ingestion Recovery)     ──► Confirm retry endpoint behavior

[Phase 3: Student Experience & Pedagogical Evaluation]
  7. OPD-002 (Pivotal Reasoning Requirement)   ──► Set Review phase completion checks
  8. OPD-005 (Challenge Support Modal)         ──► Approve Socratic modal component
  9. OPD-010 (AI Feedback Drafting)           ──► Ratify private faculty AI hints
  10. OPD-011 (In-Platform Rubric Scoring)     ──► Confirm Deliverable 6 evaluation tools
```

---

## 9. Change Log

| Version | Date | Author / Agent | Summary of Changes |
|---|:---:|---|---|
| `1.0.0` | 2026-10-30 | Advanced Coding & UI Specialist Agent | Initial draft based on audit of 49 Figma frames and baseline documentation. Cataloged OPD-001 through OPD-014. |
| `1.1.0` | 2026-10-30 | Antigravity AI Quality Control Pass | • Updated status to `DRAFT — PENDING STAKEHOLDER REVIEW`.<br>• Corrected markdown syntax throughout.<br>• Re-verified confirmed decisions against explicit document requirements and invariants.<br>• Corrected security claims: clarified prompt demarcation vs. absolute injection immunity.<br>• Added `OPD-015` evaluating Admin suite scope against Proposal Deliverable 1.<br>• Separated business rules from `Technical Implications – Subject to Technical Review`.<br>• Renamed Section 6 to `Potential Requirement Conflicts and Design Divergences`.<br>• Re-classified all unapproved OPD recommendations as `Status: OPEN` with `Approval: PENDING`. |
| `1.1.1` | 2026-10-30 | Antigravity AI Final Consistency Review | • Made Admin Research & Rubric screen in OPD-015 strictly conditional on OPD-011 approval.<br>• Explicitly distinguished structural source demarcation, system prompt hardening, and output schema validation in CPD-05.<br>• Differentiated Lecturer, Student, and Admin roles in CPD-07 and clarified Admin web UI scope.<br>• Replaced imperative recommendation wording with 'Proposed direction (pending Project Owner approval)'.<br>• Added explicit reference to Product Direction V2 in source authorities. |
| `1.1.2` | 2026-10-30 | Antigravity AI Product Scope Precision Pass | • Renamed CPD-07 to 'System Role Segregation (Lecturer, Student, and Admin)'.<br>• Clearly distinguished Core Academic Roles (Lecturer, Student) from Platform Operational Role (Admin) in Product Scope.<br>• Clarified that open decisions govern only their affected functionality and explicitly deferred decisions do not block delivery of approved MVP scope. |
