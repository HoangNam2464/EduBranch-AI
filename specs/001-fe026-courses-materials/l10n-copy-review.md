# English Localization Copy Review: Courses & Materials [FE-026]

> **Governance Notice**:
> - **Total Keys Registered**: 30 keys (all PROPOSED; awaiting PO review and approval).
> - **Registry Schema**: Schema A (`| key | vi | en | status | approved_by | approved_on | source |`).
> - **Array Key Notation**: For array values (e.g. i18next `returnObjects`), keys descend into arrays using numeric index segments (e.g. `g1.landing.how.steps.0`, `g1.landing.how.steps.0.title`); leaf nodes must be strings (numbers, booleans and null are flagged as errors).
> - **Status Authority**: ONLY the Product Owner (PO) changes status from `PROPOSED` to `APPROVED` and fills `approved_by` and `approved_on`. Implementers and agents draft copy only and MUST NEVER set status to APPROVED themselves.
> - **Release Rule**: English strings remain `PROPOSED` until the PO approves them in this review file. Quality Gate QG4 runs `node scripts/l10n-approval-check.mjs --release` (exit 0 required) and fails while any English string in the release scope is `PROPOSED`, unregistered, or modified without re-approval. Unapproved English copy is not released. PO approval of all English copy (`l10n-copy-review.md` all APPROVED) is strictly required before FE-026 is Done or released.
> - **Language Architecture**: Governed by AGENTS.md rule 12, CLAUDE.md frontend rules, and PO Directive 2026-11-16 (`[PO-ĐÃ-XÁC-NHẬN]`). Established domain terms are preserved.

---

## Copy Review Table

| key | vi | en | status | approved_by | approved_on | source |
|---|---|---|:---:|:---:|:---:|---|
| `courses.title` | Quản lý khóa học | Course Management | PROPOSED | — | — | `483:9641` (02.1) |
| `courses.actions.create` | Tạo khóa học mới | Create New Course | PROPOSED | — | — | `I483:9668;225:164` (02.1) |
| `courses.actions.archive` | Lưu trữ khóa học | Archive Course | PROPOSED | — | — | PO Q4 2026-11-15 (OPD-014) `[ĐỀ-XUẤT]` — CONFLICT with Figma 02.3 delete copy (`I483:10341;228:301/302/310`), pending PO |
| `courses.createDialog.title` | Khởi tạo khóa học mới | Initialize New Course | PROPOSED | — | — | `483:10099` (02.2) |
| `courses.createDialog.submit` | Tạo khóa học | Create Course | PROPOSED | — | — | `I483:10110;225:146` (02.2) |
| `courses.empty.createFirst` | Tạo khóa học đầu tiên | Create First Course | PROPOSED | — | — | `[ĐỀ-XUẤT]` spec.md §5 / lines 171, 189 |
| `courses.archiveDialog.title` | Lưu trữ khóa học | Archive Course | PROPOSED | — | — | PO Q4 2026-11-15 (OPD-014) `[ĐỀ-XUẤT]` — CONFLICT with Figma 02.3 delete copy (`I483:10341;228:301/302/310`), pending PO |
| `courses.archiveDialog.warning` | Bạn có chắc chắn muốn lưu trữ khóa học này? Khóa học sẽ không còn xuất hiện trong danh sách hoạt động, nhưng toàn bộ tài liệu giảng dạy, đoạn trích RAG và case study liên quan vẫn được bảo toàn nguyên vẹn. | Are you sure you want to archive this course? The course will no longer appear in active lists, but all associated teaching materials, RAG excerpts, and case studies will be fully preserved. | PROPOSED | — | — | PO Q4 2026-11-15 (OPD-014) `[ĐỀ-XUẤT]` — CONFLICT with Figma 02.3 delete copy (`I483:10341;228:301/302/310`), pending PO |
| `courses.archiveDialog.confirm` | Xác nhận lưu trữ | Confirm Archive | PROPOSED | — | — | PO Q4 2026-11-15 (OPD-014) `[ĐỀ-XUẤT]` — CONFLICT with Figma 02.3 delete copy (`I483:10341;228:301/302/310`), pending PO |
| `courses.archiveDialog.successToast` | Đã lưu trữ khóa học thành công | Course archived successfully | PROPOSED | — | — | PO Q4 2026-11-15 (OPD-014) `[ĐỀ-XUẤT]` (spec.md §4.1 / FR-003) — CONFLICT with Figma 02.3 delete copy (`I483:10341;228:301/302/310`), pending PO |
| `courses.validation.nameRequired` | Tên khóa học không được để trống | Course name is required | PROPOSED | — | — | `[ĐỀ-XUẤT]` limits from `backend/src/modules/course/dto/create-course.dto.ts:5-17` |
| `courses.validation.nameLength` | Tên khóa học phải có từ 2 đến 200 ký tự | Course name must be between 2 and 200 characters | PROPOSED | — | — | `[ĐỀ-XUẤT]` limits from `backend/src/modules/course/dto/create-course.dto.ts:5-17` |
| `courses.validation.codeLength` | Mã khóa học tối đa 20 ký tự | Course code must not exceed 20 characters | PROPOSED | — | — | `[ĐỀ-XUẤT]` limits from `backend/src/modules/course/dto/create-course.dto.ts:5-17` |
| `courses.validation.descriptionLength` | Mô tả khóa học tối đa 1000 ký tự | Course description must not exceed 1000 characters | PROPOSED | — | — | `[ĐỀ-XUẤT]` limits from `backend/src/modules/course/dto/create-course.dto.ts:5-17` |
| `materials.title` | Tài liệu môn học | Course Materials | PROPOSED | — | — | `483:10402` (02.4) |
| `materials.actions.upload` | Tải tài liệu mới | Upload New Materials | PROPOSED | — | — | `483:10470` (02.4) |
| `materials.status.indexing` | Lập chỉ mục | Indexing | PROPOSED | — | — | `[ĐỀ-XUẤT]` spec.md §5 (Figma status texts: `507:6599` "Đang chờ lập chỉ mục", `507:6577` "Lập chỉ mục thất bại", `588:8474` "2/5 đã lập chỉ mục") |
| `materials.rag.excerpt` | Đoạn trích | Excerpt | PROPOSED | — | — | `483:11174` (02.7) |
| `materials.actions.reupload` | Tải lên lại | Upload Again | PROPOSED | — | — | PO Q3 2026-11-15 `[ĐỀ-XUẤT]` — CONFLICT with Figma FAILED action "Thử lại" (`586:8534`, `586:8570`), pending PO |
| `materials.uploadDialog.title` | Tải tài liệu môn học | Upload Course Materials | PROPOSED | — | — | `483:10858` (02.5) |
| `materials.uploadDialog.submit` | Tải lên {{count}} tệp | Upload {{count}} files | PROPOSED | — | — | `I483:10889;225:146` (02.5) |
| `materials.actions.delete` | Xóa | Delete | PROPOSED | — | — | `[ĐỀ-XUẤT]` aria-label (Figma 02.4 shows a trash icon without text) |
| `materials.deleteModal.title` | Xóa tài liệu này? | Delete this material? | PROPOSED | — | — | `I483:11147;228:301` (02.6) |
| `materials.deleteModal.warning` | Tệp và các đoạn trích đã lập chỉ mục sẽ bị xóa vĩnh viễn. AI sẽ không dùng tài liệu này khi sinh case mới. Thao tác này không thể hoàn tác. | The file and indexed excerpts will be permanently deleted. AI will not use this material when generating new cases. This action cannot be undone. | PROPOSED | — | — | `I483:11147;228:302` (02.6) |
| `materials.deleteModal.confirm` | Xóa vĩnh viễn | Permanently delete | PROPOSED | — | — | `I483:11147;228:310;225:254` (02.6) |
| `materials.deleteModal.errorToast` | Không thể xóa tài liệu. Vui lòng thử lại sau. | Could not delete material. Please try again later. | PROPOSED | — | — | `[ĐỀ-XUẤT]` spec.md §4.2 / FR-008 |
| `materials.validation.format` | Chỉ hỗ trợ tệp PDF và DOCX. | Only PDF and DOCX files are supported. | PROPOSED | — | — | `483:10878` (02.5) / `backend/src/modules/material/material.service.ts` (`ALLOWED_MIME_TYPES`) |
| `materials.validation.size` | Tệp vượt quá giới hạn 50 MB. | File exceeds 50 MB limit. | PROPOSED | — | — | `483:10885` (02.5) / `backend/src/modules/material/material.service.ts` (`MAX_SIZE_BYTES`) |
| `materials.validation.empty` | Tệp không có nội dung (0 bytes) | File contains no content (0 bytes) | PROPOSED | — | — | `[ĐỀ-XUẤT]` data-model.md §3 / `backend/src/modules/material/material.service.ts` |
| `materials.rag.emptyTitle` | Tài liệu chưa có đoạn trích nào | This material has no excerpts yet | PROPOSED | — | — | `[ĐỀ-XUẤT]` spec.md §4.3 / FR-009 |
