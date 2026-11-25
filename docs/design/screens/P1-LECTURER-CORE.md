# P1 — Core Lecturer Flow

> - **Document Class**: `[LIVING FEATURE / DESIGN SPEC]`
> - **Priority**: NOW. Proposal V1.2 frames Branching Study as the MVP's critical path — Case Review here gets the deepest spec of anything in the system.
> - **Visual system**: `R01` (`.agents/rules/01-ui-design-standards.md`), the single design source; token values currently in `frontend/src/index.css` (target modular stylesheets in `frontend/src/styles/`). UI copy defaults to Vietnamese with VI/EN support per `R01 §6`.
> - **Covers**: `/lecturer/dashboard` (`07.1`, `D-05`), `/lecturer/ai-studio` (`07.5–07.7`, `OPD-006`), `/lecturer/courses`, `/lecturer/courses/:courseId/materials`, `/lecturer/courses/:courseId/cases`, `/lecturer/cases/:caseId/review`, `/lecturer/rubric` (`07.8`, `OPD-011`) (Feedback & Statistics in `P3-SUPPORT-AND-STATISTICS.md`).

---

## 0. Lecturer Dashboard (`/lecturer/dashboard` — Figma `07.1`, `D-05`)

### Purpose & Function
Summary workspace added to MVP by PO decision **`D-05` (`2026-11-12`)** ([`MVP_SCOPE_AND_FIGMA_FRAME_REGISTER.md`](../../mvp-scope/MVP_SCOPE_AND_FIGMA_FRAME_REGISTER.md#L139)). *(Post-login landing route `ROLE_HOME.LECTURER` — `/lecturer/courses` currently in `frontend/src/routes/paths.ts` vs `/lecturer/dashboard` here — remains **`OPEN PO DECISION`**).*

### Layout & Components
- Greeting header + primary `"Tạo Case mới bằng AI"` CTA (links to `/lecturer/ai-studio`, rendered as a proper `Button` instance — fix Revision `01` regression `34:3183`).
- 4 KPI `MetricCard`s (published cases, drafts, pending reviews/feedback, tabular numerals; display honest `"—"` with context until `BE-030` aggregation API lands from PR #80 — never fake numbers or grading wording like `"chấm"` per `R01 §7`).
- Pending submissions queue snippet + Recent Case Studies + compact schedule/to-do panel (avoid an oversized empty calendar dominating the first viewport per `UI-AUDIT.md` §2).

---

## 1. Course Catalog (`/lecturer/courses`)

### Purpose & Function
Course management catalog for the Lecturer role (`D-05` 2026-11-12 added Lecturer Dashboard `/lecturer/dashboard` `07.1` to MVP; `ROLE_HOME.LECTURER` post-login landing target — `/lecturer/courses` currently in `frontend/src/routes/paths.ts` vs `/lecturer/dashboard` here — remains **`OPEN PO DECISION`**). Lists owned active courses and links into materials/cases (`FEATURE-COURSE-AND-MATERIALS.md` FR-MAT-01).

### User & Context
Lecturer only. Reachable directly from the Lecturer sidebar or from the Lecturer Dashboard (`/lecturer/dashboard`, Figma `07.1`). Note: `D-05` (2026-11-12) governs Dashboard `07.1`, whereas `OPD-006` (2026-11-12) strictly governs the 3-step AI Studio wizard (`/lecturer/ai-studio`).

### Layout
Page header ("Khóa học của tôi" / "Courses", `text-display`) + primary button ("Tạo khóa học" / "New Course", top-right) + grid/split detail panel per Figma `02.1`.

### Data
Per course: `name`, `courseCode`, `description` (truncated), material count, case count (if available cheaply — otherwise omit rather than invent an endpoint).

### Actions
- Create course (opens modal: `name` required, `courseCode` optional, `description` optional).
- Click a course card → `/lecturer/courses/:courseId/materials` (materials is the natural first stop after creating/selecting a course, since cases require materials).

### States
- **Empty**: "No courses yet" + primary "Create your first course" action (§5.11 pattern).
- **Loading**: skeleton course cards.
- **Error**: standard error state, retry.

### Boundary
No cross-lecturer course visibility — a lecturer only ever sees their own courses (`FEATURE-COURSE-AND-MATERIALS.md` BR-MAT-01/FR-MAT-02 ownership rule).

---

## 2. Course Materials (`/lecturer/courses/:courseId/materials`)

### Purpose & Function
Upload and inspect teaching materials (PDF/DOCX) that feed RAG retrieval and case generation (`FEATURE-COURSE-AND-MATERIALS.md`, `FEATURE-DOCUMENT-PROCESSING-AND-RAG.md`).

### Layout
Breadcrumb (Courses → [Course Name] → Materials). Upload control (drag-and-drop zone or file picker button) at top. Materials list/table below.

### Data
Per material: `originalFilename`, `mimeType`, `sizeBytes`, `processingStatus` (`PENDING`/`PROCESSING`/`COMPLETED`/`FAILED`), `chunk_count` (once completed), `uploadedAt`.

### Actions
- Upload file (PDF/DOCX only — reject other types client-side before the request, matching `BR-MAT-01`).
- Delete material (destructive — requires confirmation dialog per R01; deletion cascades per `BR-MAT-03`, so the confirmation copy must say so plainly).

### States
- **Processing status per row**: `PENDING`/`PROCESSING` show a small inline spinner + muted label; `COMPLETED` shows a `semantic-success` check + chunk count; `FAILED` shows `semantic-error` + the `processing_error` message (plain language, not a raw stack trace).
- **Empty**: "No materials uploaded yet" + prompt to upload.
- **Upload error**: file-too-large (413) → "File exceeds the 50MB limit"; unsupported type (415) → "Only PDF and DOCX files are supported."

### Boundary
No in-browser document editing/preview beyond filename/status (`FEATURE-COURSE-AND-MATERIALS.md §13` — no Google-Docs-style editor). No OCR-scanned-PDF messaging promises — if extraction fails, show the generic processing error only.

---

## 3. Cases List (`/lecturer/courses/:courseId/cases`)

### Purpose & Function
Lists cases for the course, filterable by learning mode, and is where AI case generation is triggered (`FEATURE-CASE-GENERATION.md`).

### Layout
Breadcrumb (Courses → [Course Name] → Cases). Filter tabs or segmented control: **All / Branching Study / Review Study** (§5.6 Tabs pattern, using `mode-branching`/`mode-review` tokens on the active filter). Primary button "Generate Case" (top-right). Case card grid below (Case Card component, R01).

### Data
Per case (Case Card): `title`, `learning_mode` badge, `status` badge, short `description`, `updatedAt`, AI-origin marker while `status = DRAFT`.

### Actions
- **Generate Case** ("Tạo Case mới bằng AI"): opens the **3-step AI Studio wizard** at `/lecturer/ai-studio` (OPD-006 decided 2026-11-12; Figma 07.6 course & mode → 07.5 topic & source documents → 07.7 confirm). The wizard collects `topic` (required text, 10–500 chars per `FR-GEN-01`/inputs table), optional `materialIds` multi-select (sourced from the course's completed materials only), optional `targetNodeCount`. On submit, redirects to `/lecturer/cases/:caseId/review` once the draft is created.
- Click a case card → `/lecturer/cases/:caseId/review`.

### States
- **Generation in progress**: after confirming the last wizard step, show a loading state (this can take several seconds — LLM call + validation retries per `FEATURE-CASE-GENERATION.md` FR-GEN-05); do not block the whole screen silently — show a visible "Generating your case…" state, and route to Case Review once ready.
- **Generation failure**: if the AI service exhausts retries (HTTP 502 per §12), show an error toast: "Case generation failed — please try again, or refine your topic." Do not create a broken/partial case record for the lecturer to see.
- **Empty (no materials yet)**: if the course has zero completed materials, disable "Generate Case" and show a hint pointing to the Materials screen first — generation quality depends on ingested material (`FEATURE-DOCUMENT-PROCESSING-AND-RAG.md`), and this is a real prerequisite, not an invented restriction.

### Boundary
Generation is Lecturer-only (`FR-GEN-01`/§9 permissions) — never expose a "Generate Case" affordance anywhere in the Student shell.

---

## 3b. AI Studio Wizard (`/lecturer/ai-studio` — Figma `07.6 → 07.5 → 07.7`, `OPD-006`)

### Purpose & Function
Replaced the earlier modal (`DES-006`) per PO decision **`OPD-006` (`2026-11-12`)** (`OPD-006` strictly governs this wizard, not Dashboard routing).

### Layout & Flow
- **Step 1 (`07.6`)**: Select Course + Learning Mode (`BRANCHING_STUDY` / `REVIEW_STUDY`). *(Open item `D-07`: `"Tạo thủ công từ đầu"` button remains `OPEN PO DECISION`; restore active mode-card selection marker per `MVP_SCOPE_AND_FIGMA_FRAME_REGISTER` line 195).*
- **Step 2 (`07.5`)**: Topic prompt (`10–500` chars) + multi-select `COMPLETED` materials from the selected course + optional `targetNodeCount`.
- **Step 3 (`07.7`)**: Configuration summary + confirm generation → routes to `/lecturer/cases/:caseId/review` on draft creation.
- **Footer bar**: Left step context (`"Bước x trên 3: …"`), right paired secondary + primary buttons (`UX-SCREEN-NOTES.md §1.2`).

---

## 4. Case Review — Decision Tree Editor (`/lecturer/cases/:caseId/review`)

> This is the single most business-critical screen in the product (Proposal V1.2, Discovery Plan §C footnote) — it is the mandatory Human-in-the-Loop gate (`FEATURE-CASE-REVIEW-AND-PUBLISHING.md` BR-REV-01). Give it the deepest spec.

### Purpose & Function
Lets the Lecturer inspect, edit, approve, and publish an AI-generated (or lecturer-authored) case. For `BRANCHING_STUDY` cases: a ReactFlow tree canvas + node-edit side panel. For `REVIEW_STUDY` cases: a simpler form editor (context/problem text) — **no tree**, since Review Study cases have no `case_nodes` (`FEATURE-REVIEW-STUDY.md §4`: "No Decision Tree").

### Layout — Branching Study variant
- Top: Publish/Review Status Stepper (R01) showing `DRAFT → REVIEWED → APPROVED → PUBLISHED`, plus case title (editable inline) and learning-mode badge.
- Main area: two-pane split — left/center is the ReactFlow canvas (ratio ~65%), right is the node-edit side panel (~35%), collapsible on narrower screens.
- Canvas: Decision Node component per node (R01); edges represent `CaseOption` → labeled with a short excerpt of the option text.
- Side panel (opens when a node is selected): editable `situation` textarea, list of that node's options — each with editable `option text` and `consequence` textareas, plus a next-node selector (dropdown of existing nodes, or "Mark as terminal outcome").
- Bottom/footer bar (sticky): "Save Changes," "Approve Case," "Publish Case" — buttons enabled/disabled per current status (see Actions below).

### Layout — Review Study variant
- Same status stepper header.
- No canvas. Simple stacked form: `context_text` (large textarea), `problem_text` (large textarea). No node/option editor.
- Same footer action bar (Save / Approve / Publish), same status gating.

### Data
Branching: `title`, `description`, `root_node_id`, per-node `situation`/`is_terminal`, per-option `text`/`consequence`/`next_node_id`. Review: `title`, `description`, `context_text`, `problem_text`.

### Actions
- **Save Changes**: `PUT /api/v1/cases/{caseId}/nodes/{nodeId}` (Branching) or the case-level update endpoint (Review). Any edit to a `DRAFT` case transitions it to `REVIEWED` (`FR-REV-03`) — the stepper should visibly advance the moment a save succeeds, not require a separate explicit step.
- **Approve Case**: enabled once in `REVIEWED` (or `DRAFT`) status; transitions to `APPROVED` (`FR-REV-04`).
- **Publish Case**: enabled only once `APPROVED`; transitions to `PUBLISHED` (`FR-REV-05`) — **always behind a confirmation dialog** (§5.10), since this is the moment students gain access. Confirmation copy should state plainly that the case becomes visible to enrolled students.
- Add/remove/re-link nodes and options directly on the canvas (drag a new edge to re-link `next_node_id`; delete a node prompts re-linking per `BR-REV-03` edge case).

### States
- **Graph validation error** (cycle or orphan introduced by an edit): block save, highlight the offending edge/node in `semantic-error`, inline message ("Cannot save: loop detected" / "This node has no incoming path from the start"). Matches `FEATURE-CASE-REVIEW-AND-PUBLISHING.md §12` exactly — do not invent different wording.
- **Delete-blocked**: deleting a node that other options still point to shows the exact prompt from the feature doc: "Options in Node X point to this node. Please re-link them before deleting."
- **Publish disabled**: if invariants aren't met yet (Branching: no `root_node_id`; Review: empty `context_text`/`problem_text`) the Publish button stays disabled with a tooltip explaining what's missing (`FEATURE-CASE-REVIEW-AND-PUBLISHING.md §11` publication invariants INV-02/INV-03).
- **Read-only awareness for published+active cases**: if a `PUBLISHED` case already has active student attempts, structural edits should surface a warning that this may create a new version rather than silently mutating history (`BR-REV-04`) — exact versioning UX is a backend-driven detail, but the warning itself is a required state.

### Boundary
No collaborative multi-lecturer real-time editing (no presence cursors, no locking UI — `§13` explicitly out of scope). No public marketplace/publish-to-other-universities affordance. The AI never re-generates or auto-fills content on this screen after the initial draft — every field here is lecturer-owned once opened for edit.

---

## 5. Case-Quality Evaluation Rubric (`/lecturer/cases/:caseId/rubric`, `/lecturer/rubric` — Figma `07.8`, `OPD-011`)

Per PO decision **`OPD-011 → Option A` (`2026-11-12`)**, Lecturers rate case quality (NOT students) across 3 criteria (`Realism`, `Difficulty`, `Course Alignment`, 1–5 Likert scale) + optional notes, inspect saved rubric records alongside `"Điểm trung bình x / 5"`, and export anonymized evaluation data (`FEATURE-EVALUATION-AND-RESEARCH.md`, `BE-033` pending in PR #80).

---

## Statistics & Feedback Note
`/lecturer/statistics` and Lecturer Feedback (`/lecturer/feedback` vs `/lecturer/cases/:caseId/feedback` — route convention **`OPEN PO DECISION / UNRESOLVED`**) live in [`P3-SUPPORT-AND-STATISTICS.md`](P3-SUPPORT-AND-STATISTICS.md) (included in MVP scope per PO `2026-11-25`, removing the historical `(LATER)` label while keeping `D-04` and `OPD-010` open).
