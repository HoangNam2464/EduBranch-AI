import { useState, type FormEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import type { RegisterRequest } from "@/types";
import { SocialSignIn } from "@/components/ds";
import { resolveSafeReturnUrl } from "@/utils/navigation";
import { PATHS } from "@/routes/paths";
import { authErrorMessage } from "@/pages/auth/components/authErrors";
import { FormMessage } from "@/pages/auth/components/FormMessage";
import {
  AuthAccountSwitch,
  AuthFormHeading,
  AuthPasswordField,
  AuthSelectField,
  type AuthSelectOption,
  AuthSplitLayout,
  AuthSubmitButton,
  AuthTextField,
} from "@/pages/auth/components/AuthLayout";
import { RoleSelector, type RegisterRole } from "@/pages/auth/components/RoleSelector";
import showcaseStudent from "@/pages/auth/assets/showcase-register-student.webp";
import showcaseLecturer from "@/pages/auth/assets/showcase-register-lecturer.webp";

/**
 * Danh mục Khoa / Đơn vị công tác đầy đủ cho môi trường Đại học & Học viện
 * Được phân nhóm theo 7 khối ngành đào tạo chuẩn của Bộ GD&ĐT và các trường ĐH lớn.
 */
const FACULTY_OPTIONS: AuthSelectOption[] = [
  // 1. Công nghệ & Kỹ thuật
  { category: "Công nghệ & Kỹ thuật", value: "Khoa Công nghệ Thông tin & Khoa học Máy tính", label: "Khoa Công nghệ Thông tin & Khoa học Máy tính" },
  { category: "Công nghệ & Kỹ thuật", value: "Khoa Kỹ thuật Phần mềm & An toàn Thông tin", label: "Khoa Kỹ thuật Phần mềm & An toàn Thông tin" },
  { category: "Công nghệ & Kỹ thuật", value: "Khoa Điện - Điện tử & Viễn thông", label: "Khoa Điện - Điện tử & Viễn thông" },
  { category: "Công nghệ & Kỹ thuật", value: "Khoa Cơ khí, Ô tô & Tự động hóa", label: "Khoa Cơ khí, Ô tô & Tự động hóa" },
  { category: "Công nghệ & Kỹ thuật", value: "Khoa Xây dựng & Kỹ thuật Công trình", label: "Khoa Xây dựng & Kỹ thuật Công trình" },
  { category: "Công nghệ & Kỹ thuật", value: "Khoa Kiến trúc, Mỹ thuật & Thiết kế Số", label: "Khoa Kiến trúc, Mỹ thuật & Thiết kế Số" },

  // 2. Kinh tế & Quản trị Kinh doanh
  { category: "Kinh tế & Quản trị", value: "Khoa Quản trị Kinh doanh", label: "Khoa Quản trị Kinh doanh" },
  { category: "Kinh tế & Quản trị", value: "Khoa Kinh tế & Thương mại Quốc tế", label: "Khoa Kinh tế & Thương mại Quốc tế" },
  { category: "Kinh tế & Quản trị", value: "Khoa Tài chính - Ngân hàng", label: "Khoa Tài chính - Ngân hàng" },
  { category: "Kinh tế & Quản trị", value: "Khoa Kế toán & Kiểm toán", label: "Khoa Kế toán & Kiểm toán" },
  { category: "Kinh tế & Quản trị", value: "Khoa Marketing & Truyền thông số", label: "Khoa Marketing & Truyền thông số" },
  { category: "Kinh tế & Quản trị", value: "Khoa Logistics & Quản lý Chuỗi Cung ứng", label: "Khoa Logistics & Quản lý Chuỗi Cung ứng" },

  // 3. Luật & Quản lý Công
  { category: "Luật & Quản lý Công", value: "Khoa Luật (Kinh tế, Dân sự & Quốc tế)", label: "Khoa Luật (Kinh tế, Dân sự & Quốc tế)" },
  { category: "Luật & Quản lý Công", value: "Khoa Quản trị Công & Chính sách Công", label: "Khoa Quản trị Công & Chính sách Công" },

  // 4. Y - Dược & Sức khỏe
  { category: "Y - Dược & Sức khỏe", value: "Khoa Y (Y Đa khoa, Răng Hàm Mặt)", label: "Khoa Y (Y Đa khoa, Răng Hàm Mặt)" },
  { category: "Y - Dược & Sức khỏe", value: "Khoa Dược", label: "Khoa Dược" },
  { category: "Y - Dược & Sức khỏe", value: "Khoa Điều dưỡng & Kỹ thuật Y học", label: "Khoa Điều dưỡng & Kỹ thuật Y học" },
  { category: "Y - Dược & Sức khỏe", value: "Khoa Y tế Công cộng & Quản trị Bệnh viện", label: "Khoa Y tế Công cộng & Quản trị Bệnh viện" },

  // 5. Khoa học Xã hội, Ngôn ngữ & Du lịch
  { category: "Xã hội, Ngôn ngữ & Du lịch", value: "Khoa Ngoại ngữ & Ngôn ngữ học Ứng dụng", label: "Khoa Ngoại ngữ & Ngôn ngữ học Ứng dụng" },
  { category: "Xã hội, Ngôn ngữ & Du lịch", value: "Khoa Du lịch, Khách sạn & Nhà hàng", label: "Khoa Du lịch, Khách sạn & Nhà hàng" },
  { category: "Xã hội, Ngôn ngữ & Du lịch", value: "Khoa Báo chí, Truyền thông & Quan hệ Công chúng", label: "Khoa Báo chí, Truyền thông & Quan hệ Công chúng" },
  { category: "Xã hội, Ngôn ngữ & Du lịch", value: "Khoa Khoa học Xã hội & Nhân văn (Tâm lý, Xã hội)", label: "Khoa Khoa học Xã hội & Nhân văn (Tâm lý, Xã hội)" },

  // 6. Khoa học Cơ bản & Sư phạm
  { category: "Khoa học Cơ bản & Giáo dục", value: "Khoa Khoa học Cơ bản & Ứng dụng (Toán, Lý, Hóa, Sinh)", label: "Khoa Khoa học Cơ bản & Ứng dụng (Toán, Lý, Hóa, Sinh)" },
  { category: "Khoa học Cơ bản & Giáo dục", value: "Khoa Sư phạm & Khoa học Giáo dục", label: "Khoa Sư phạm & Khoa học Giáo dục" },
  { category: "Khoa học Cơ bản & Giáo dục", value: "Khoa Môi trường & Quản trị Tài nguyên", label: "Khoa Môi trường & Quản trị Tài nguyên" },

  // 7. Khối Đào tạo Quốc tế & Đơn vị khác
  { category: "Viện Quốc tế & Đơn vị khác", value: "Viện Đào tạo Quốc tế", label: "Viện Đào tạo Quốc tế" },
  { category: "Viện Quốc tế & Đơn vị khác", value: "Viện Đào tạo Sau Đại học", label: "Viện Đào tạo Sau Đại học" },
  { category: "Viện Quốc tế & Đơn vị khác", value: "Phòng / Ban / Trung tâm Nghiên cứu", label: "Phòng / Ban / Trung tâm Nghiên cứu" },
  { category: "Viện Quốc tế & Đơn vị khác", value: "Đơn vị / Khoa khác...", label: "Đơn vị / Khoa khác..." },
];

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const login = useAuthStore((s) => s.login);

  // The role lives in the URL (?role=lecturer|student) so 00.4 / 00.5 are linkable.
  const role: RegisterRole = searchParams.get("role")?.toUpperCase() === "LECTURER" ? "LECTURER" : "STUDENT";

  const [form, setForm] = useState<RegisterRequest>({
    email: "",
    password: "",
    fullName: "",
    role: "STUDENT",
  });

  // Role-specific fields (collected in the UI; not part of RegisterRequest yet — see report)
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [customDepartment, setCustomDepartment] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleRoleChange = (newRole: RegisterRole) => {
    setSearchParams({ role: newRole.toLowerCase() });
    setError(null);
  };

  const stateFrom = (location.state as { from?: Location | string })?.from;
  const returnUrl = stateFrom
    ? typeof stateFrom === "string"
      ? stateFrom
      : `${stateFrom.pathname}${stateFrom.search || ""}${stateFrom.hash || ""}`
    : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!form.fullName.trim()) {
      setError(t("g1.errors.fullNameRequired"));
      return;
    }
    if (!form.email.trim()) {
      setError(t("g1.errors.universityEmailRequired"));
      return;
    }
    if (role === "STUDENT" && !studentId.trim()) {
      setError(t("g1.errors.studentIdRequired"));
      return;
    }
    const isOther = department === "Đơn vị / Khoa khác..." || department === t("g1.register.departmentOther");
    const finalDepartment = isOther ? customDepartment.trim() : department.trim();
    if (role === "LECTURER" && !finalDepartment) {
      setError(t("g1.errors.departmentRequired"));
      return;
    }
    if (form.password.length < 8) {
      setError(t("g1.errors.passwordMin"));
      return;
    }
    if (form.password !== confirmPassword) {
      setError(t("g1.errors.passwordMismatch"));
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMsg(null);

    try {
      const result = await authService.register({
        ...form,
        role,
        email: form.email.trim(),
        fullName: form.fullName.trim(),
      });
      login(result.user, result.accessToken);
      const destination = resolveSafeReturnUrl(returnUrl, result.user.role);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(authErrorMessage(err, t, "register"));
    } finally {
      setLoading(false);
    }
  }

  const handleSso = () => {
    setInfoMsg(t("g1.info.ssoPending"));
  };

  const isStudent = role === "STUDENT";

  return (
    <AuthSplitLayout showcaseImage={isStudent ? showcaseStudent : showcaseLecturer}>
      <form onSubmit={handleSubmit} noValidate className="flex w-full max-w-[460px] sm:max-w-[480px] flex-col gap-5">
        <AuthFormHeading
          title={t("g1.register.title")}
          subtitle={isStudent ? t("g1.register.subtitleStudent") : t("g1.register.subtitleLecturer")}
        />

        {error && <FormMessage tone="error">{error}</FormMessage>}
        {infoMsg && <FormMessage tone="info">{infoMsg}</FormMessage>}

        <RoleSelector value={role} onChange={handleRoleChange} />

        <div className="flex flex-col gap-4 sm:flex-row">
          <AuthTextField
            id="register-fullname"
            label={t("g1.form.fullName")}
            type="text"
            autoComplete="name"
            required
            value={form.fullName}
            onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
            placeholder={t("g1.register.fullNamePlaceholder")}
          />
          <AuthTextField
            id="register-email"
            label={t("g1.form.email")}
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            placeholder={t("g1.register.emailPlaceholder")}
          />
        </div>

        {isStudent ? (
          <AuthTextField
            id="register-student-id"
            label={t("g1.register.studentId")}
            type="text"
            required
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder={t("g1.register.studentIdPlaceholder")}
          />
        ) : (
          <div className="flex flex-col gap-3">
            <AuthSelectField
              id="register-department"
              label={t("g1.register.department")}
              required
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                if (e.target.value !== "Đơn vị / Khoa khác..." && e.target.value !== t("g1.register.departmentOther")) {
                  setCustomDepartment("");
                }
              }}
              placeholder={t("g1.register.departmentSelectPlaceholder")}
              options={FACULTY_OPTIONS}
            />
            {(department === "Đơn vị / Khoa khác..." || department === t("g1.register.departmentOther")) && (
              <AuthTextField
                id="register-custom-department"
                label={t("g1.register.customDepartmentLabel")}
                type="text"
                required
                value={customDepartment}
                onChange={(e) => setCustomDepartment(e.target.value)}
                placeholder={t("g1.register.customDepartmentPlaceholder")}
              />
            )}
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row">
          <AuthPasswordField
            id="register-password"
            label={t("g1.form.password")}
            autoComplete="new-password"
            required
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            placeholder={t("g1.register.passwordPlaceholder")}
          />
          <AuthPasswordField
            id="register-confirm-password"
            label={t("g1.register.confirmPassword")}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t("g1.register.confirmPasswordPlaceholder")}
          />
        </div>

        {!isStudent && (
          <div className="flex gap-2.5 rounded-eb-lg bg-warning-bg px-[14px] py-3">
            <Info
              aria-hidden="true"
              size={16}
              absoluteStrokeWidth
              strokeWidth={1.3}
              className="shrink-0 text-status-approved-text"
            />
            <p className="min-w-0 flex-1 text-[12px] leading-4 font-normal text-ink">{t("g1.register.lecturerNote")}</p>
          </div>
        )}

        <AuthSubmitButton disabled={loading}>{loading ? t("g1.register.submitting") : t("g1.register.submit")}</AuthSubmitButton>

        <div className="pt-1">
          <SocialSignIn
            dividerLabel={t("g1.social.divider")}
            googleLabel={t("g1.social.google")}
            microsoftLabel={t("g1.social.microsoft")}
            onGoogle={handleSso}
            onMicrosoft={handleSso}
          />
        </div>

        <AuthAccountSwitch prompt={t("g1.register.haveAccount")} linkLabel={t("g1.register.loginLink")} to={PATHS.AUTH.LOGIN} />
      </form>
    </AuthSplitLayout>
  );
}
