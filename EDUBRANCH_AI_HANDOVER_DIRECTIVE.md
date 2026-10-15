# CHỈ THỊ BÀN GIAO & ĐỒNG BỘ TOÀN DIỆN CHO AI — DỰ ÁN EDUBRANCH-AI

> **Tài liệu bàn giao chuyên dụng cho AI Assistant (AI Handover & Alignment Directive)**  
> **Dự án áp dụng**: EduBranch AI (Capstone C1SE.65 — Đại học Duy Tân)  
> **Thư mục làm việc của dự án**: `D:\CAPSTONE_2026\EduBranch-AI`  
> **Nguồn pháp lý & nghiệp vụ chuẩn**: Proposal V1.2 (C1SE.65 — Đại học Duy Tân)  
> **Ngày phê duyệt**: 2026-10-12  

---

## ⚠️ 3 NGUYÊN TẮC CỐT TỬ DÀNH CHO AI ĐỌC TÀI LIỆU NÀY:

### 1. ĐÂY LÀ DỰ ÁN ĐANG TRIỂN KHAI DỞ DANG (NOT GREENFIELD):
* Dự án đã có đầy đủ repository, mã nguồn NestJS Backend, FastAPI AI-Service, React 19 Frontend, cơ sở dữ liệu PostgreSQL 16 pgvector, và MinIO.
* **TUYỆT ĐỐI KHÔNG** xem đây là dự án mới. **KHÔNG** được tự tạo lại kiến trúc, **KHÔNG** chia lại số Sprint, **KHÔNG** viết lại backlog hoặc thay thế mã nguồn hiện có.
* **KẾ THỪA 100% WORKING TREE HIỆN TẠI**: Tại branch `develop`, đang có 20 file modified và 7 file untracked (thuộc Phase 3.6). Toàn bộ mã nguồn này đã được xác minh chạy **PASS 63/63 unit tests** và **PASS 11/11 HTTP Security E2E tests**, build cả Backend lẫn Frontend đều thành công. Tuyệt đối không xóa hay `git reset / clean / restore` làm mất code này!

### 2. BASELINE QUẢN TRỊ BẤT DI BẤT DỊCH (IMMUTABLE BASELINE):
* **4 Sprints cố định** (KHÔNG ĐƯỢC CHUYỂN SANG 6 SPRINTS).
* **Tổng cộng đúng 84 tasks / 336 Story Points**.
* Thời gian thực thi: **07/10/2026 – 15/12/2026 (10 tuần)**.
* Master Task ID: `EBA-101` $\rightarrow$ `EBA-435`.
* Nguồn quản trị gốc (Single Source of Truth): `docs/5.Sprint_Backlog/SPRINT-BACKLOG.md`.

### 3. ĐỊNH HƯỚNG SƯ PHẠM CỐT LÕI: QUÁ TRÌNH HỌC TẬP TÌNH HUỐNG THỰC NGHIỆM:
* Dự án EduBranch-AI được thiết kế tối ưu cho **Quá trình học tập tình huống thực nghiệm và rèn luyện tư duy phản biện (Experiential Case-Based Learning & Decision-Making Process)**, giúp người học trải nghiệm các quyết định đa chiều trong môi trường đào tạo chuyên sâu (Kinh doanh, Luật, Y khoa, Kỹ thuật, Quản trị...).
* **CHUẨN HÓA THUẬT NGỮ VÀ MÔ HÌNH HỌC TẬP CHUYÊN NGHIỆP**:
  * Đối tượng: **Lecturer** (Giảng viên / Người hướng dẫn) và **Student** (Sinh viên / Người học).
  * Bối cảnh: **Course** (Học phần / Khóa học) và **Teaching Materials** (Syllabus, giáo trình, case tài liệu).
  * Hoạt động cốt lõi: **Case Study** gồm 2 chế độ:
    * `Branching Study`: Người học nhập vai đưa ra quyết định rẽ nhánh theo cây quyết định (Decision Tree - ReactFlow).
    * `Review Study`: Phản biện mở, xem lại toàn bộ hành trình đã chọn (Journey Review), tự suy ngẫm (Reflection), và nhận nhận xét định tính từ giảng viên (Lecturer Feedback).

---

## 1. TỔNG QUAN PHÂN BỔ 4 SPRINTS CHUẨN (84 TASKS / 336 SP)

```text
EduBranch AI (Key: EBA) — 4 Sprints / 10 Tuần / 84 Tasks / 336 Story Points
        │
        ├── Sprint 1 - Foundation      (07/10 - 20/10/2026 / 2 tuần / 10 tasks / 42 SP)
        ├── Sprint 2 - Material & RAG  (21/10 - 03/11/2026 / 2 tuần / 20 tasks / 75 SP)
        ├── Sprint 3 - Case & Approval (04/11 - 17/11/2026 / 2 tuần / 19 tasks / 81 SP)
        └── Sprint 4 - Learning & Review (18/11 - 15/12/2026 / 4 tuần / 35 tasks / 138 SP)
```

### Bảng Cơ Cấu 5 Nhóm Chuyên Môn Sau Khi Tách `OPS`:
* **`DES` (Design Figma)**: **15 tasks** (50 SP) — `DES-001` $\rightarrow$ `DES-015`
* **`FE` (Frontend React 19)**: **22 tasks** (86 SP) — `FE-001` $\rightarrow$ `FE-022`
* **`BE` (Backend NestJS & AI)**: **25 tasks** (110 SP) — Giữ nguyên logic nghiệp vụ
* **`OPS` (DevOps & Hạ Tầng)**: **3 tasks** (11 SP) — `OPS-001`, `OPS-002`, `OPS-003` (Chuyển đổi từ `BE-004`, `BE-006`, `BE-011`)
* **`QA` (Kiểm Thử & Bảo Mật)**: **19 tasks** (79 SP) — `QA-001` $\rightarrow$ `QA-019`
* **TỔNG CỘNG**: **84 tasks / 336 Story Points (Khớp 100% với SPRINT-BACKLOG.md)**.

---

## 2. HIỆN TRẠNG KỸ THUẬT ĐÃ XÁC MINH (VERIFIED TEST BASELINE)

AI nhận nhiệm vụ cần biết chính xác hệ thống đang ở trạng thái kỹ thuật nào:

| Hạng mục | Kết quả xác minh độc lập | Ghi chú kỹ thuật |
|---|:---:|---|
| **Backend Unit Tests** | ✅ **63 / 63 PASS** (7 suites) | MigrationRunner (8/8), Health (8/8), Branching Attempt (18/18), Case (21/21), Material (8/8). |
| **HTTP Security E2E** | ✅ **11 / 11 PASS** | Supertest kiểm tra RBAC, chặn token rỗng, chặn sinh viên xem case DRAFT, chặn can thiệp chéo giữa giảng viên. |
| **Backend Build** | ✅ **SUCCESS** | `nest build` biên dịch sạch, không lỗi TypeScript. |
| **Frontend Build** | ✅ **SUCCESS** | `tsc -b && vite build` hoàn thành trong 2.24s. |
| **Uncommitted Work** | 20 modified + 7 untracked | Chứa MigrationRunner (advisory lock), Health check controller, Direct-link route restoration. |

---

## 3. MỤC TIÊU BIG UPDATE: CHUẨN HÓA CẤU TRÚC `docs/` THÀNH 6 FILE CHUẨN

Hiện tại thư mục `docs/` của EduBranch AI đang bị phân mảnh và dồn toàn bộ 84 tasks vào file `SPRINT-BACKLOG.md` (65 KB).  
**Nhiệm vụ của AI**: Chuẩn hóa hệ thống tài liệu thành bộ 6 file chuẩn (đánh số `01` đến `06`) theo chuẩn quản trị chuyên nghiệp của EduBranch AI, **bảo toàn nguyên vẹn 100% nội dung các tài liệu kiến trúc hiện có** (`architecture/`, `features/`, `database/`):

### Bản Đồ Ánh Xạ 6 File Chuẩn Hóa:

```text
docs/
├── 01_MASTER-TASKS.md           # [TẠO MỚI] Danh mục 84 Master Tasks (EBA-101 -> EBA-435) chia 4 Sprints (336 SP)
├── 02_SPRINT-TASKS.md           # [TẠO MỚI] Cây phân rã 84 tasks theo 5 nhóm: DES (15), FE (22), BE (25), OPS (3), QA (19)
├── 03_TASK-DETAILS.md           # [TẠO MỚI] Đặc tả chi tiết 84 tasks (Deliverable, Acceptance Criteria, Dependencies)
├── 04_JIRA/
│   ├── eba-jira-import.csv      # [ĐÃ COPY] File CSV 47 cột sẵn sàng import 1-click lên Jira Software
│   ├── JIRA-BACKLOG-REFERENCE.md# [ĐÃ COPY] Bản đặc tả tham chiếu chi tiết toàn bộ tasks Jira
│   └── JIRA-CSV-AUDIT.md        # [TẠO MỚI] Biên bản đối soát 3 chiều (02 ↔ 03 ↔ CSV) xác nhận khớp 84/84 tasks (100%)
├── 05_FIGMA.md                  # [TẠO MỚI] Danh mục 15 tasks thiết kế giao diện UI/UX (DES-001 -> DES-015)
├── 06_QA.md                     # [TẠO MỚI] Danh mục 19 tasks kiểm thử chất lượng (QA-001 -> QA-019)
├── 5.Sprint_Backlog/
│   └── SPRINT-BACKLOG.md        # [GIỮ NGUYÊN] SSOT gốc về quy chuẩn Sprint và Sprint Goal
├── architecture/                # [GIỮ NGUYÊN 100%] Các tài liệu ADR, System Architecture, Reference Audit
├── database/                    # [GIỮ NGUYÊN 100%] DATA-MODEL.md, OPERATIONAL-BASELINE-GUIDE.md
├── features/                    # [GIỮ NGUYÊN 100%] Đặc tả chi tiết từng tính năng nghiệp vụ
└── ...
```

---

## 4. CHI TIẾT BẢNG ĐỐI CHIẾU CHUYỂN ĐỔI NHÓM OPS (CŨ $\rightarrow$ MỚI)

Để chuẩn hóa 5 nhóm mà không làm thay đổi tổng số 84 tasks:

| Master Task ID | Mã Nhóm Cũ | Mã Nhóm Mới | Tên Task Chuẩn Hóa | Sprint | SP | Căn Cứ Chuyên Môn OPS |
|:---:|:---:|:---:|---|:---:|:---:|---|
| **`EBA-108`** | `BE-004` | **`OPS-001`** | `[OPS-001] PostgreSQL Migration Runner, Environment Validation & Health Checks` | Sprint 1 | 3 | Viết MigrationRunner tự động, advisory lock CSDL, kiểm tra biến môi trường và healthcheck vận hành. |
| **`EBA-209`** | `BE-006` | **`OPS-002`** | `[OPS-002] Implement MinIO Storage Service with Secure Object Key Naming` | Sprint 2 | 3 | Cấu hình hạ tầng lưu trữ Object Storage MinIO, quản lý bucket và bảo mật object key. |
| **`EBA-214`** | `BE-011` | **`OPS-003`** | `[OPS-003] Implement Document Chunks Persistence & HNSW Vector Indexing` | Sprint 2 | 5 | Tối ưu hóa hạ tầng cơ sở dữ liệu vector pgvector, cấu hình HNSW index và tuning tham số tìm kiếm. |

*(Toàn bộ các task `BE` còn lại được giữ nguyên logic nghiệp vụ từ `BE-001` đến `BE-028` trừ 3 task trên).*

---

## 5. QUY CHUẨN LÀM VIỆC & COMMIT GIT CHO THÀNH VIÊN VÀ AI

1. **Quy tắc Tên Nhánh Git**:
   - Dùng tên chung của tính năng: `feature/<feature-name>` (Ví dụ: `feature/auth-guard`, `feature/material-ingestion`, `feature/case-generator`).
   - **TUYỆT ĐỐI KHÔNG** đặt tên nhánh theo mã task (như `feature/EBA-105` hay `feature/BE-001`).
2. **Quy tắc Commit Message**:
   - Bắt buộc gắn mã task con vào commit message:
     ```text
     feat(backend): implement migration runner with advisory lock [OPS-001]
     test(security): add http rbac e2e regression suite [QA-002]
     feat(frontend): implement material upload modal with validation [FE-003]
     ```
3. **Quy trình Tra Cứu Task Hàng Ngày**:
   - Khi nhận task trên Jira $\rightarrow$ Mở **`03_TASK-DETAILS.md`** để lấy đúng tên file cần tạo (`Deliverable`) và điều kiện nghiệm thu (`Acceptance Criteria`).
   - Không tự ý bịa thêm tính năng ngoài phạm vi đã đặc tả.

---

## 6. KẾ HOẠCH HÀNH ĐỘNG 4 BƯỚC CHO AI TIẾP QUẢN

Khi AI tiếp quản thực hiện tại `D:\CAPSTONE_2026\EduBranch-AI`:

* **BƯỚC 1: Đóng gói Working Tree Phase 3.6**:
  Stage và commit an toàn 20 file modified + 7 file untracked trên nhánh làm việc với commit message chuẩn:
  `feat(security): complete migration runner, operational health and rbac e2e guards [EBA-108][EBA-110]`
* **BƯỚC 2: Khởi tạo bộ 6 file `docs/`**:
  Tạo các file `01_MASTER-TASKS.md`, `02_SPRINT-TASKS.md`, `03_TASK-DETAILS.md`, `05_FIGMA.md`, `06_QA.md` theo nội dung 84 tasks đã trích xuất từ `SPRINT-BACKLOG.md` và `docs/04_JIRA/JIRA-BACKLOG-REFERENCE.md`.
* **BƯỚC 3: Hoàn tất đối soát Jira CSV & Audit Report**:
  Cập nhật 3 mã `OPS` trong file `docs/04_JIRA/eba-jira-import.csv` và tạo file `docs/04_JIRA/JIRA-CSV-AUDIT.md` xác nhận 84/84 tasks khớp 100%.
* **BƯỚC 4: Báo cáo hoàn tất**:
  Báo cáo với chủ dự án rằng hệ thống tài liệu và Jira đã sẵn sàng 100%, sẵn sàng bắt tay vào lập trình Sprint 2 (Material & RAG).
