# English Localization Copy Review: Courses & Materials [FE-026]

> **Governance Notice**:
> - **Status Authority**: ONLY the Product Owner (PO) changes status from `PROPOSED` to `APPROVED`. Implementers and agents draft copy only and MUST NEVER set status to APPROVED themselves.
> - **Release Rule**: English strings remain `PROPOSED` until the PO approves them in this review file. Quality Gate QG4 fails while any English string in the release scope is `PROPOSED`. Unapproved English copy is not released. PO approval of all English copy (`l10n-copy-review.md` all APPROVED) is strictly required before FE-026 is Done or released.
> - **Language Architecture**: Governed by AGENTS.md rule 12, CLAUDE.md frontend rules, and PO Directive 2026-11-16 (`[PO-ĐÃ-XÁC-NHẬN]`). Established domain terms are preserved.

---

## Copy Review Table

| key | vi (approved source copy) | en | status |
|---|---|---|:---:|
| `courses.title` | Khóa học | Courses | PROPOSED |
| `courses.actions.create` | Tạo khóa học mới | Create Course | PROPOSED |
| `courses.actions.archive` | Lưu trữ khóa học | Archive Course | PROPOSED |
| `courses.archiveDialog.title` | Lưu trữ khóa học | Archive Course | PROPOSED |
| `courses.archiveDialog.warning` | Bạn có chắc chắn muốn lưu trữ khóa học này? Khóa học sẽ không còn xuất hiện trong danh sách hoạt động, nhưng toàn bộ tài liệu giảng dạy, đoạn trích RAG và case study liên quan vẫn được bảo toàn nguyên vẹn. | Are you sure you want to archive this course? The course will no longer appear in active lists, but all associated teaching materials, RAG excerpts, and case studies will be fully preserved. | PROPOSED |
| `courses.archiveDialog.confirm` | Xác nhận lưu trữ | Confirm Archive | PROPOSED |
| `courses.archiveDialog.successToast` | Đã lưu trữ khóa học thành công | Course archived successfully | PROPOSED |
| `courses.validation.nameRequired` | Tên khóa học không được để trống | Course name is required | PROPOSED |
| `courses.validation.nameLength` | Tên khóa học phải có từ 2 đến 200 ký tự | Course name must be between 2 and 200 characters | PROPOSED |
| `courses.validation.codeLength` | Mã khóa học tối đa 20 ký tự | Course code must not exceed 20 characters | PROPOSED |
| `courses.validation.descriptionLength` | Mô tả khóa học tối đa 1000 ký tự | Course description must not exceed 1000 characters | PROPOSED |
| `materials.title` | Tài liệu môn học | Course Materials | PROPOSED |
| `materials.actions.upload` | Tải lên tài liệu | Upload Materials | PROPOSED |
| `materials.status.indexing` | Lập chỉ mục | Indexing | PROPOSED |
| `materials.rag.excerpt` | Đoạn trích RAG | RAG Excerpt | PROPOSED |
| `materials.actions.reupload` | Tải lên lại | Upload Again | PROPOSED |
| `materials.reupload.dialogTitle` | Tải lên lại tài liệu | Re-upload Material | PROPOSED |
| `materials.reupload.uploadButton` | Tải lên 1 tệp | Upload 1 file | PROPOSED |
| `materials.actions.delete` | Xóa | Delete | PROPOSED |
| `materials.deleteModal.warning` | Hành động này sẽ xóa vĩnh viễn tài liệu và các đoạn trích dẫn liên quan | This action will permanently delete the course material and associated excerpts | PROPOSED |
| `materials.deleteModal.confirm` | Xóa vĩnh viễn | Permanently delete | PROPOSED |
| `materials.deleteModal.errorToast` | Không thể xóa tài liệu. Vui lòng thử lại sau. | Could not delete material. Please try again later. | PROPOSED |
| `materials.validation.format` | Hệ thống chỉ hỗ trợ định dạng PDF hoặc DOCX | Only PDF or DOCX file formats are supported | PROPOSED |
| `materials.validation.size` | Dung lượng tệp vượt quá giới hạn tối đa 50MB | File size exceeds maximum limit of 50MB | PROPOSED |
| `materials.validation.empty` | Tệp không có nội dung (0 bytes) | File contains no content (0 bytes) | PROPOSED |
| `materials.rag.emptyTitle` | Tài liệu chưa có đoạn trích nào | This material has no excerpts yet | PROPOSED |
