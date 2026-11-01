# EduBranch AI — Open Product Decisions: Executive Summary

> **Document Status**: `DRAFT — PENDING STAKEHOLDER REVIEW`  
> **Reference Version**: Synchronized with `docs/OPEN_PRODUCT_DECISIONS.md` (v1.1.2)  
> **Source Documents**: Proposal V1.2 (`C1SE_65-EduBranch-AI-Proposal_V1.2.docx`), `Product Direction V2`, `docs/PROJECT_OVERVIEW.md`, `00-project-foundation.md`, `GLOBAL-DESIGN-SYSTEM.md`, feature specifications in `docs/features/`  
> **Visual Design Reference**: Figma Workspace (`EduBranch AI`, `Page 1`, 49 Canvas Frames)  
> **Target Audience**: Claude Project Knowledge Base, Project Owners, Engineering Leads, and Mentors

---

## 1. Purpose & Authority Status

This executive summary provides a scannable index of the product decisions, baseline requirements, open decisions, and requirement divergences in EduBranch AI.

- **Status**: `DRAFT — PENDING STAKEHOLDER REVIEW`
- **Governing Principle**: Figma frames represent current visual design direction, not approved business specifications. Documented invariants and requirements ratified by project stakeholders govern system behavior.
- **Decision Status Rule**: All Open Product Decisions (OPD-001 through OPD-015) remain `Status: OPEN` with `Approval: PENDING` until formally ratified by the Project Owner.

---

## 2. Product Scope & Primary Actors

- **Domain**: University-Level Higher Education Experiential Learning.
- **Core Activity**: Experiential Case-Based Learning via multi-branch decision trees (`Branching Study`) and open analytical dilemmas (`Review Study`).
- **Primary Actors**:
  - **Core Academic Roles**:
    1. **Lecturer (`LECTURER`)**: Case author, RAG curator, publication authority, and qualitative pedagogical evaluator.
    2. **Student (`STUDENT`)**: Active decision-maker, retrospective reasoning author, and reflective learner.
  - **Platform Operational Role**:
    3. **Admin (`ADMIN`)**: Platform operational administrator (scope for MVP web interface evaluated under `OPD-015`).

---

## 3. Confirmed Product Decisions (CPDs)

These 7 foundational decisions are backed by explicit documentation and core system invariants:

| CPD ID | Decision Title | Authoritative Evidence | Core Confirmed Rule |
|---|---|---|---|
| **CPD-01** | Human-in-the-Loop Case Publication Gate | Proposal V1.2 §4; `00-project-foundation.md` §4; `INV-01` | Cases transition `DRAFT` → `REVIEWED` → `APPROVED` → `PUBLISHED`. Students can never query unapproved or unpublished cases (`WHERE status = 'PUBLISHED'`). |
| **CPD-02** | 3-Phase Branching Study Experiential Flow | Proposal V1.2 Goals 3–4; `00-project-foundation.md` §6.2; `INV-02`, `INV-03` | **Phase 1 (Experience)**: uninterrupted decisions (no mid-flow reasoning or consequence cards).<br>**Phase 2 (REVIEW)**: chronological timeline replay, consequences revealed, retrospective reasoning.<br>**Phase 3 (Reflection & Retry)**: overall reflection, optional Socratic challenge, independent retry. |
| **CPD-03** | Dual Learning Mode Architecture | Proposal V1.2 §4; `FEATURE-BRANCHING-STUDY.md`; `FEATURE-REVIEW-STUDY.md` | Supports two distinct modes: `BRANCHING_STUDY` (DAG decision tree with 2–4 options per non-terminal node, 0 cycles) and `REVIEW_STUDY` (open text analysis, no tree nodes). |
| **CPD-04** | Zero AI Grading Mandate | Proposal V1.2 Goal 7; `00-project-foundation.md` §6.1; `INV-10` | AI Challenge Support is strictly limited to 1–2 Socratic rounds. AI must never generate grades, scores, percentages, ranks, or pass/fail determinations. Evaluation belongs 100% to human lecturers. |
| **CPD-05** | Untrusted Data Demarcation in Retrieval Prompts | `00-project-foundation.md` §6.1; `docs/ai/RAG-PIPELINE.md` | Retrieved chunks from pgvector are wrapped inside `<sources>...</sources>` boundary tags. Boundary tags alone do not prevent prompt injection; robust defense requires structural demarcation combined with system prompt hardening and strict output schema validation (Pydantic v2). |
| **CPD-06** | Immutable Attempts and Independent Retries | Proposal V1.2 Goal 4; `FEATURE-BRANCHING-STUDY.md` FR-BS-10; `INV-08`, `INV-09` | Retrying a case creates a new immutable row in `branching_attempts` (`attempt_number = previous + 1`). Prior attempts remain permanently in student history and are never overwritten or averaged. |
| **CPD-07** | System Role Segregation (Lecturer, Student, and Admin) | Proposal V1.2 §4, Deliverable 1; `FEATURE-AUTH-AND-ROLES.md` BR-AUTH-01; `00-project-foundation.md` §3 | Strict RBAC segregation across three roles: `LECTURER` (case authoring & qualitative evaluation), `STUDENT` (case play & reflection), and `ADMIN` (system governance & user management). The scope and delivery format of the administrative web module in MVP remain an unresolved decision under `OPD-015`. |

---

## 4. Open Product Decisions (OPD-001 through OPD-015)

Each open decision must be approved before implementing its affected functionality. Decisions explicitly deferred beyond MVP must not block the delivery of approved MVP scope.

| Decision ID | Decision Title | Affected Role | Priority | Status | Approval | Proposed Recommendation |
|---|---|:---:|:---:|:---:|:---:|---|
| **OPD-001** | Student Course Discovery & Enrollment: Direct Link vs. Class Code & Dashboard | Both | High | `OPEN` | `PENDING` | **Proposed direction (pending Project Owner approval)**: Option A (Hybrid Model) — Support enrollment by invitation code (e.g. `CS301-2026`) with a student dashboard (`1:1305`), while keeping direct case links functional. |
| **OPD-002** | Pivotal Decision Retrospective Reasoning: Mandatory vs. Optional in Review | Student | High | `OPEN` | `PENDING` | **Proposed direction (pending Project Owner approval)**: Option B (Non-Blocking Advisory Nudge) — Reasoning on pivotal nodes is encouraged with a warning dialog if left blank, but does not hard-block progressing to Reflection. |
| **OPD-003** | Incomplete Attempt Resumption ("Tiếp tục làm dở" vs. Restarting) | Student | Medium | `OPEN` | `PENDING` | **Proposed direction (pending Project Owner approval)**: Option A (Single Active Attempt with Explicit Abandonment) — One in-progress attempt allowed at a time; starting a new retry explicitly prompts to abandon the incomplete attempt. |
| **OPD-004** | Case Retry Limits: Unlimited vs. Configured Ceiling | Both | Medium | `OPEN` | `PENDING` | **Proposed direction (pending Project Owner approval)**: Option A (Configurable Ceiling with Unlimited Default) — Add optional `max_attempts` field (default `NULL` = unlimited) for lecturer flexibility. |
| **OPD-005** | AI Challenge Support UI: Targeted Modal vs. Inline Timeline Section | Student | Medium | `OPEN` | `PENDING` | **Proposed direction (pending Project Owner approval)**: Option A (Targeted Modal Dialog) — Implement Figma frame `27:321` as a focused modal targeting specific pivotal decisions from the Journey Review. |
| **OPD-006** | AI Case Studio Flow: 3-Step Wizard vs. Single Modal | Lecturer | Medium | `OPEN` | `PENDING` | **Proposed direction (pending Project Owner approval)**: Option A (3-Step Full-Page Wizard) — Implement Figma frames `1:3088`, `1:2939`, `1:2818` for step-by-step topic selection and document grounding. |
| **OPD-007** | Handling Case Edits When Student Attempts Already Exist | Both | High | `OPEN` | `PENDING` | **Proposed direction (pending Project Owner approval)**: Option A (Structural Freeze with Text-Only Edits for MVP) — Freeze DAG structure (nodes/edges) once attempts exist; allow typographical text edits only. |
| **OPD-008** | Lecturer Registration Verification: Immediate Activation vs. Approval Gate | Lecturer & Admin | Medium | `OPEN` | `PENDING` | **Proposed direction (pending Project Owner approval)**: Option A (Administrative Verification Queue) — Student accounts activate immediately; Lecturer accounts require admin/department verification before authoring. |
| **OPD-009** | Location and Display of Lecturer Feedback on Branching Attempts | Both | Medium | `OPEN` | `PENDING` | **Proposed direction (pending Project Owner approval)**: Option A (Journey Review Feedback Header) — Display lecturer feedback block at the top of the existing Journey Review timeline view (`1:619`). |
| **OPD-010** | AI Qualitative Feedback Drafting for Lecturers | Lecturer | High | `OPEN` | `PENDING` | **Proposed direction (pending Project Owner approval)**: Option A (Private Faculty Drafting Aid) — Permitted as an authoring assistant for lecturers (`1:1702`); drafts are strictly private until edited and approved by the lecturer. Zero AI grading to students is preserved. |
| **OPD-011** | Research Rubric Evaluation: In-Platform Scoring Form vs. External CSV | Lecturer & Admin | Medium | `OPEN` | `PENDING` | **Proposed direction (pending Project Owner approval)**: Option A (In-Platform Rubric + CSV Export) — Implement in-platform scoring matching Figma `1:2081` and `1:4511` to support Capstone Deliverable 6 directly. Prerequisite for the Admin Rubric screen in OPD-015. |
| **OPD-012** | Partial Document Ingestion Failure Handling During Case Generation | Lecturer | Medium | `OPEN` | `PENDING` | **Proposed direction (pending Project Owner approval)**: Option A (Granular Selection with Inline Retry) — Allow case generation if at least 1 document is `COMPLETED`; provide inline retry for `FAILED` documents in `1:2258`. |
| **OPD-013** | AI Provider Switching: Dynamic Admin UI vs. Static Environment Config | Admin | Low | `OPEN` | `PENDING` | **Proposed direction (pending Project Owner approval)**: Option B (Static Environment Config with Read-Only UI for MVP) — Retain `.env` configuration for MVP; display provider status in UI (`1:5543`) as read-only. |
| **OPD-014** | Deletion Boundaries: Teaching Materials, Courses, Cases, and Student History | Both | High | `OPEN` | `PENDING` | **Proposed direction (pending Project Owner approval)**: Option A (Soft Archival for Courses and Cases) — Deleting courses or cases soft-archives them (`status = 'ARCHIVED'`); student historical attempt records are preserved. |
| **OPD-015** | Admin Role and Administrative Web Module Scope in MVP | Admin | High | `OPEN` | `PENDING` | **Proposed direction (pending Project Owner approval)**: Option A (Lightweight Essential Admin Portal) — Implement Admin Login and User Management for faculty verification; Admin Research & Rubric screen is strictly conditional on OPD-011 approval; defer advanced settings and logs. |

---

## 5. Potential Requirement Conflicts and Design Divergences

| Divergence Area | Documented Requirement Stance | Figma Design Representation | Recommended Alignment Direction |
|---|---|---|---|
| **1. Student Discovery** | Access strictly via direct link (`PROJECT_OVERVIEW.md`). | Student dashboard (`1:1305`) and class invitation codes (`1:1084`). | **Proposed direction (pending Project Owner approval)**: Hybrid Model (`OPD-001`) enabling both invitation code dashboard access and direct links. |
| **2. Case Studio UX** | Single modal dialog (`P1-lecturer-core.md`). | 3-step full-page wizard (`1:3088` → `1:2939` → `1:2818`). | **Proposed direction (pending Project Owner approval)**: 3-Step Wizard (`OPD-006`) for improved multi-document grounding inspection. |
| **3. Lecturer Activation** | Database default `is_active = true`. | Registration notice (`1:122`) and Admin approval queue (`1:4025`). | **Proposed direction (pending Project Owner approval)**: Administrative Verification Gate (`OPD-008`) to protect institutional course authoring rights. |
| **4. AI Feedback Drafting** | Zero AI involvement in student evaluation. | Private card "Gợi ý phân tích từ AI" for lecturers (`1:1702`). | **Proposed direction (pending Project Owner approval)**: Private Faculty Drafting Aid (`OPD-010`) to assist lecturers privately while strictly preserving zero AI grading to students. |
| **5. Challenge Support UI** | Inline timeline section (`P2-student-core.md`). | Focused modal dialog (`27:321`). | **Proposed direction (pending Project Owner approval)**: Targeted Modal Dialog (`OPD-005`) isolating Socratic dialogue on specific choices. |
| **6. Rubric Scoring Tool** | Implementation method marked "Open / To Be Decided". | Complete interactive scoring screens (`1:2081`, `1:4511`). | **Proposed direction (pending Project Owner approval)**: In-Platform Rubric (`OPD-011`) to directly support Capstone Deliverable 6. |
| **7. Admin Module Scope** | Proposal V1.2 Deliverable 1 specifies Lecturer & Student web UI. | 10 full Admin screens designed in Figma (`1:4477` to `1:4345`). | **Proposed direction (pending Project Owner approval)**: Lightweight Admin Portal (`OPD-015`) focusing on faculty verification, with Admin Rubric screen strictly conditional on OPD-011 approval. |

---

## 6. Critical Decisions Requiring Project Owner Sign-Off

The following **5 decisions** have immediate architectural and delivery impacts and require formal Project Owner sign-off before sprint execution:

1. **OPD-015 (Admin Suite Scope in MVP)**: Confirm whether to deliver a lightweight administrative portal (Admin Login and User Management for faculty verification, with Admin Research & Rubric screen strictly conditional on OPD-011 approval) or the full 10-screen Admin suite.
2. **OPD-001 (Course Enrollment Mechanism)**: Ratify whether students join via class invitation codes (`CS301-2026`) or access cases strictly via direct URLs.
3. **OPD-010 (AI Qualitative Feedback Drafting for Lecturers)**: Approve or reject private AI analysis drafts for lecturers, confirming adherence to the Zero AI Grading principle.
4. **OPD-007 (Case Edits Post-Publishing)**: Ratify the policy to freeze DAG structure when student attempts exist to safeguard learning data integrity.
5. **OPD-014 (Deletion and Archival Policy)**: Confirm soft-archival for courses and cases to protect student historical records against accidental cascade deletion.

---

## 7. Product Area Cross-Reference Mapping

| Product Area | Authoritative Documentation Sections | Key Figma Frames & Node IDs |
|---|---|---|
| **Authentication & RBAC** | `00-project-foundation.md` §3; `FEATURE-AUTH-AND-ROLES.md` | • `Đăng nhập · Mặc định` (`1:2`)<br>• `Đăng ký · Sinh viên` (`1:52`)<br>• `Đăng ký · Giảng viên` (`1:122`)<br>• `Quên mật khẩu` (`1:196`, `1:223`, `1:250`, `1:279`)<br>• `Email Kích hoạt & Đặt lại mật khẩu` (`26:148`, `26:78`) |
| **Course & Materials Ingestion** | `FEATURE-COURSE-AND-MATERIALS.md`; `docs/ai/RAG-PIPELINE.md` | • `Giảng viên · Quản lý khóa học` (`1:2431`, `1:1465`)<br>• `Tài liệu môn học` (`1:2258`, `29:1106`)<br>• `RAG Source Inspector` (`16:6`) |
| **Case Generation (AI Studio)** | `00-project-foundation.md` §3, §5; `FEATURE-CASE-GENERATION.md` | • `AI Studio — Khóa học và chế độ` (`1:3088`)<br>• `AI Studio — Chủ đề và tài liệu` (`1:2939`)<br>• `AI Studio — Xác nhận cấu hình` (`1:2818`) |
| **Case Review & Publishing** | `00-project-foundation.md` §4, §5; `FEATURE-CASE-REVIEW-AND-PUBLISHING.md` | • `Giảng viên · Quản lý Case Study` (`1:2583`)<br>• `Trình chỉnh sửa Case Study` (`1:3219`)<br>• `Hộp thoại phê duyệt và xuất bản` (`1:1444`) |
| **Branching Play (Phase 1)** | Proposal V1.2 §4; `00-project-foundation.md` §6.2; `FEATURE-BRANCHING-STUDY.md` | • `Sinh viên · Giới thiệu tình huống` (`1:972`)<br>• `Tình huống · Đã chọn phương án` (`1:906`)<br>• `Tình huống · Kết thúc hành trình` (`1:880`) |
| **Journey Review (Phase 2)** | `00-project-foundation.md` §6.2; `FEATURE-BRANCHING-STUDY.md` | • `Sinh viên · Journey Review` (`1:619`) |
| **Reflection & Retry (Phase 3)** | `00-project-foundation.md` §6.2; `FEATURE-BRANCHING-STUDY.md` | • `Sinh viên · Biểu mẫu suy ngẫm` (`1:545`)<br>• `Sinh viên · Đã nộp suy ngẫm` (`1:466`)<br>• `Sinh viên · Lịch sử lần làm bài` (`1:790`) |
| **AI Challenge Support** | `00-project-foundation.md` §6.1; `FEATURE-AI-REASONING-CHALLENGE-SUPPORT.md` | • `Sinh viên · AI Challenge Support (Modal Socratic)` (`27:321`) |
| **Review Study Mode** | `00-project-foundation.md` §5; `FEATURE-REVIEW-STUDY.md` | • `Sinh viên · Biểu mẫu Review Study` (`1:384`)<br>• `Sinh viên · Review Study đã phản hồi` (`1:297`) |
| **Lecturer Feedback & Queue** | `00-project-foundation.md` §3; `FEATURE-LECTURER-FEEDBACK.md` | • `Hàng đợi Review và phản hồi` (`1:1852`)<br>• `Chi tiết phản hồi lập luận` (`1:1702`) |
| **Cohort Statistics & Analytics** | Proposal V1.2 §4; `FEATURE-STATISTICS-AND-VISUALIZATION.md` | • `Giảng viên · Thống kê luồng học tập` (`1:1493`) |
| **Research Rubric & Experiment** | Proposal V1.2 Deliverable 6; `FEATURE-EVALUATION-AND-RESEARCH.md` | • `Giảng viên · Rubric nghiên cứu` (`1:2081`)<br>• `Admin · Nghiên cứu và Rubric` (`1:4511`) |
| **Admin Platform Governance** | Proposal V1.2 Context Diagram | • `Admin · Bảng điều khiển` (`1:3715`)<br>• `Admin · Quản lý người dùng` (`1:4025`, `30:1864`)<br>• `Admin · Cấu hình dịch vụ AI` (`1:5543`)<br>• `Admin · Nhật ký & Cài đặt` (`1:5302`, `1:4345`) |
