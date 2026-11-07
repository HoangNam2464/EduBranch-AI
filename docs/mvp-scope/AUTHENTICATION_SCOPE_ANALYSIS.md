# Authentication Scope Analysis — Google Sign-In (trường hợp mẫu)

> **Trạng thái**: `DRAFT — CHỜ PROJECT OWNER PHÊ DUYỆT` · Ngày: 2026-11-01
> Tài liệu liên quan: `MVP_SCOPE_EVIDENCE_MATRIX.md §2.1`, `OPEN_DECISIONS_MVP_IMPACT.md`

---

## 1. Kết luận

**Google Sign-In được xác định là nằm ngoài MVP (PHASE 2).** Kết luận này dựa trên các câu chữ hoãn và loại trừ **rõ ràng** trong backlog chính thức và feature spec. Nó không dựa trên việc thiếu task riêng hay BE chưa có OAuth.

Muốn đưa Google Sign-In vào MVP thì cần một **quyết định thay đổi scope chính thức** của PO/mentor, vì nó trái với `01_MASTER-TASKS.md §4.6`, tài liệu bảo vệ 4 sprint bất biến.

---

## 2. Trả lời từng câu hỏi kiểm tra

### 2.1. Proposal V1.2 yêu cầu Authentication ở mức nào?
- §4 Proposed Solution, gạch đầu dòng 2: *"Account and role management (Lecturer / Student)."* Đây là mức **chức năng**. Proposal không nêu phương thức đăng nhập.
- Context Diagram (Figure 1): các actor gồm Lecturer, Student, Admin, LLM API. **Không có Identity Provider bên ngoài** (Google, SSO). Admin có luồng *"Manage accounts & roles"*.
- Mục Future enhancements (Conclusion) không nhắc OAuth.
- → Proposal **không yêu cầu và cũng không loại trừ** Google Sign-In. Câu hỏi được trả lời ở các nguồn cấp 2–3.

### 2.2. Task Authentication chính bao gồm những chức năng nào?
| Task | AC liên quan (trích `03_TASK-DETAILS.md`) |
|---|---|
| BE-001 (DONE) | AC-1 `POST /auth/register` BCrypt 12 rounds + lưu role; AC-2 `POST /auth/login` cấp JWT 8h; AC-3 `GET /auth/me` |
| BE-002 (IN PROGRESS) | JwtAuthGuard, `@Public()`, RolesGuard, throttler trên `/auth/login`, `/auth/register` |
| FE-001 (DONE) | authStore persist, interceptor 401 → refresh/logout, PrivateRoute |
| FE-002 (IN PROGRESS) | Validation Login/Register, layout theo vai trò, CoursesPage, 404, Error Boundary |
| QA-001, QA-002 (DONE) | Test matrix Auth/Course/Permissions; token expiry, role denial |

Không AC nào nhắc OAuth hay Google. Ở đây việc thiếu AC **chỉ là dữ kiện phụ**, không phải căn cứ chính.

### 2.3. Feature spec có xác định phương thức đăng nhập không?
**Có, và xác định rõ:**
- `docs/features/FEATURE-AUTH-AND-ROLES.md §3 Scope`: *"User registration and login via email and password."*
- `§13 Out of Scope`: *"Social OAuth / OpenID login (Google, Facebook, GitHub) — **strictly excluded**."* và *"Single Sign-On (SSO) with university campus LDAP/SAML."*
- `.agents/rules/feature-authentication.md` → Excluded: *"Social login (Google, Facebook) — out of scope"*, *"OAuth2 — out of scope"*.
- `docs/design/screens/P0-FOUNDATION.md §2 Boundary`: *"No social login buttons (Google/Facebook/GitHub) — explicitly out of scope."*

### 2.4. Có nguồn nào yêu cầu hoặc thiết kế Google OAuth không?
- **Hoãn rõ ràng**: `docs/01_MASTER-TASKS.md §4.6`, với tiêu đề *"Tiện ích tài khoản thương mại & Thông báo đẩy (Password Reset, Change Password, **OAuth/SSO**, Push Notifications)"*, nội dung *"…xác thực mạng xã hội/**Google OAuth**…"*, và câu chốt *"được ghi nhận chính thức vào lộ trình **Post-MVP (Phase 2)** và tuyệt đối không đưa vào 4 Sprints hiện tại"*.
- Không có OPD nào về Google Sign-In. `OPEN_PRODUCT_DECISIONS.md` mô tả nút Google trên frame 1:2 nhưng không mở decision cho nó.
- Spec Figma `05_FIGMA.md` DES-001 Frame 00.3 mô tả `/login` gồm `University Email`, `Password`, `Sign In`, link Register. **Không có nút Google.**

### 2.5. Figma có màn hoặc trạng thái liên quan không?
| Page | Frame | Nội dung |
|---|---|---|
| Page 1 | `1:2` Đăng nhập · Mặc định | Nút "Đăng nhập với Google" |
| Page 1 | `1:52` Đăng ký · Sinh viên | Nút "Đăng ký với Google" |
| Page 1 | `1:122` Đăng ký · Giảng viên | Nút "Đăng ký với Google" |
| Page 2 | `1:6113` 00.3 Sign In, `1:6144` 00.4 Register | **Không có** Google |
| Page 1 | `1:5543` Admin · Cấu hình AI | Chữ "Google" ở đây là **Gemini** (LLM provider), không liên quan đăng nhập |

Không frame nào thiết kế các trạng thái OAuth cần có: popup consent, lỗi callback, chọn vai trò sau khi đăng nhập Google lần đầu, liên kết tài khoản trùng email. Nghĩa là thiết kế hiện chỉ có nút, chưa có luồng.

### 2.6. Backend hiện tại hỗ trợ phương thức nào?
- `backend/src/modules/auth/auth.controller.ts`: `POST register`, `POST login`, `GET me`, tất cả dùng email/password.
- `register.dto.ts`: `@IsEnum(["LECTURER","STUDENT"])`.
- `users.password_hash VARCHAR(255) NOT NULL` (V1): **bắt buộc có mật khẩu**, không có cột `provider` hay `google_sub`.
- Đây là dữ kiện về khả năng triển khai, **không phải căn cứ scope**.

### 2.7. Nếu bổ sung Google Sign-In thì cần thay đổi gì?
*(Danh sách để ước lượng tác động. Không tự tạo task hay SP. Mọi mục là đề xuất cần xác nhận.)*

| Lớp | Thay đổi cần có |
|---|---|
| Product | Quy tắc gán vai trò cho tài khoản Google lần đầu (BR-AUTH-01: một vai trò/tài khoản). Quy tắc liên kết khi email Google trùng tài khoản email/password. Có giới hạn domain trường (`@*.edu.vn`) không (đụng OPD-008). |
| DB | `password_hash` chuyển sang nullable, hoặc thêm bảng `user_identities(provider, provider_subject, user_id)`. Ràng buộc unique `(provider, provider_subject)`. Migration V5. |
| BE | Endpoint OAuth (`/auth/google`, callback) hoặc xác minh ID token. Quản lý Client ID/Secret qua env. Xử lý state/nonce/PKCE. Cấp JWT nội bộ như luồng hiện tại. Cập nhật `@Public()`, throttler. |
| FE | Nút Google trên `/login`, `/register`. Màn chọn vai trò sau lần đăng nhập Google đầu tiên. Xử lý lỗi callback. Cập nhật authStore. |
| Security | Kiểm tra `aud`/`iss`/`exp` của ID token. Chống CSRF (state). Chặn account takeover qua email trùng chưa xác minh. Đăng ký redirect URI. Đánh giá quyền riêng tư dữ liệu sinh viên (Proposal §12 Ethical). |
| QA | Test luồng OAuth thành công/hủy/lỗi, trùng email, vai trò, token giả mạo. Mở rộng QA-001/QA-002, vốn đã DONE. |
| Figma | Thiết kế bổ sung: consent/redirect, chọn vai trò, lỗi, liên kết tài khoản. Hiện chỉ có nút. |
| Backlog | Không có SP dành sẵn. Đưa vào sẽ chiếm năng lực của 84 task bất biến. |

### 2.8. Có yêu cầu nào loại trừ Google Sign-In không?
**Có, bốn nguồn độc lập:** `01_MASTER-TASKS.md §4.6` (Phase 2), `FEATURE-AUTH-AND-ROLES.md §13` (strictly excluded), `.agents/rules/feature-authentication.md` (Excluded), `P0-FOUNDATION.md §2` (Boundary).

---

## 3. Áp dụng cùng phương pháp cho các luồng Auth khác

| Luồng | Nguồn quyết định | Kết luận |
|---|---|---|
| Email/password login + register có chọn vai trò | Proposal §4; FR-AUTH-01/02; BE-001 DONE | **CONFIRMED MVP** |
| Đăng ký tách 2 form (Sinh viên / Giảng viên) | P0 §3 và `05_FIGMA` Frame 00.4 mô tả **1 form + Role Selector** | Biến thể UI chưa có căn cứ. **HOLD** chờ PO chọn baseline (D-01). |
| Trường MSSV, Khoa / Đơn vị | Không có trong FR-AUTH-01 Inputs hay `users` | **UNKNOWN**. Cần PO xác nhận có cần thu thập không. Nếu có thì phải tạo requirement và migration mới. |
| Quên mật khẩu, đặt lại mật khẩu, email hướng dẫn | `01_MASTER-TASKS §4.6` "Password Reset… SMTP" | **PHASE 2** |
| Đổi mật khẩu | `01_MASTER-TASKS §4.6` "Change Password" | **PHASE 2** |
| Email kích hoạt tài khoản | Không có nguồn nào | **PROPOSED** (chưa có yêu cầu) |
| Duyệt tài khoản Giảng viên | OPD-008 OPEN. FR-AUTH §12 yêu cầu chặn `is_active=false`, nhưng `auth.service.ts` chưa kiểm tra (lỗ hổng so với spec) | **HOLD** |
| Phiên hết hạn, refresh token | FE-001 AC-2. `feature-authentication.md` có "refresh token rotation", nhưng BE-001 AC-2 chỉ nêu access token 8h | **CONFIRMED** (hết hạn). Refresh token: **UNKNOWN**, vì rule và AC lệch nhau. |

---

## 4. Việc cần PO quyết định
1. Xác nhận Google Sign-In giữ nguyên ở **Phase 2** theo `01_MASTER-TASKS §4.6`. Nếu muốn đưa vào MVP thì cần quyết định đổi scope chính thức, và có thể cần thông qua mentor.
2. Trên Figma Page 1, 3 nút Google: đề xuất **ẩn khỏi baseline MVP**, giữ một bản ở khu vực "Phase 2" làm tham khảo. Chỉ thực hiện khi PO đồng ý.
3. Quyết định MSSV / Khoa có phải dữ liệu bắt buộc không (UNKNOWN).
