/**
 * EduBranch AI — Admin Overview Mapper (BE-032 / FE-031).
 * Maps backend GET /admin/overview payload to frontend domain model.
 */

export interface AttentionAlertRow {
  id?: string;
  message: string;
  type?: "indexing_failure" | "login_failure" | "locked_account" | "general";
}

export interface CourseCaseStatRow {
  course_code?: string;
  courseCode?: string;
  course_name?: string;
  courseName?: string;
  published_count?: number;
  publishedCount?: number;
  draft_count?: number;
  draftCount?: number;
  total_count?: number;
  totalCount?: number;
}

export interface RecentLogRow {
  id: string;
  description: string;
  meta?: string;
  tone?: "success" | "info" | "warning" | "error";
  occurred_at?: string;
  occurredAt?: string;
}

export interface AdminOverviewRow {
  attention_alerts?: AttentionAlertRow[];
  attentionAlerts?: AttentionAlertRow[];
  total_users?: number;
  totalUsers?: number;
  user_growth_this_month?: number;
  userGrowthThisMonth?: number;
  open_courses?: number;
  openCourses?: number;
  course_growth_this_month?: number;
  courseGrowthThisMonth?: number;
  published_cases?: number;
  publishedCases?: number;
  case_growth_this_month?: number;
  caseGrowthThisMonth?: number;
  ai_case_generations?: number;
  aiCaseGenerations?: number;
  ai_case_failures?: number;
  aiCaseFailures?: number;
  students_count?: number;
  studentsCount?: number;
  lecturers_count?: number;
  lecturersCount?: number;
  admins_count?: number;
  adminsCount?: number;
  student_percent?: number;
  studentPercent?: number;
  lecturer_percent?: number;
  lecturerPercent?: number;
  admin_percent?: number;
  adminPercent?: number;
  cases_by_course?: CourseCaseStatRow[];
  casesByCourse?: CourseCaseStatRow[];
  recent_logs?: RecentLogRow[];
  recentLogs?: RecentLogRow[];
  system_health?: {
    app_server?: "UP" | "DOWN";
    database?: "UP" | "DOWN";
    ai_service?: "UP" | "DOWN";
    indexing?: "UP" | "DOWN";
    indexing_processing_count?: number;
  };
}

export interface AttentionAlert {
  id: string;
  message: string;
  type: "indexing_failure" | "login_failure" | "locked_account" | "general";
}

export interface CourseCaseStat {
  courseCode: string;
  courseName: string;
  publishedCount: number;
  draftCount: number;
  totalCount: number;
}

export interface RecentLogItem {
  id: string;
  description: string;
  meta: string;
  tone: "success" | "info" | "warning" | "error";
  occurredAt?: string;
}

export interface AdminOverview {
  attentionAlerts: AttentionAlert[];
  kpis: {
    totalUsers: number;
    userGrowthThisMonth: number;
    openCourses: number;
    courseGrowthThisMonth: number;
    publishedCases: number;
    caseGrowthThisMonth: number;
    aiCaseGenerations: number;
    aiCaseFailures: number;
  };
  roleBreakdown: {
    studentsCount: number;
    lecturersCount: number;
    adminsCount: number;
    studentPercent: number;
    lecturerPercent: number;
    adminPercent: number;
  };
  casesByCourse: CourseCaseStat[];
  recentLogs: RecentLogItem[];
  systemHealth?: {
    appServer: "UP" | "DOWN";
    database: "UP" | "DOWN";
    aiService: "UP" | "DOWN";
    indexing: "UP" | "DOWN";
    indexingProcessingCount: number;
  };
}

export function toAdminOverview(row?: AdminOverviewRow | null): AdminOverview {
  if (!row) {
    return {
      attentionAlerts: [],
      kpis: {
        totalUsers: 0,
        userGrowthThisMonth: 0,
        openCourses: 0,
        courseGrowthThisMonth: 0,
        publishedCases: 0,
        caseGrowthThisMonth: 0,
        aiCaseGenerations: 0,
        aiCaseFailures: 0,
      },
      roleBreakdown: {
        studentsCount: 0,
        lecturersCount: 0,
        adminsCount: 0,
        studentPercent: 0,
        lecturerPercent: 0,
        adminPercent: 0,
      },
      casesByCourse: [],
      recentLogs: [],
    };
  }

  const rawAlerts = row.attentionAlerts ?? row.attention_alerts ?? [];
  const attentionAlerts: AttentionAlert[] = rawAlerts.map((a, i) => ({
    id: a.id ?? `alert-${i}`,
    message: a.message,
    type: a.type ?? "general",
  }));

  const totalUsers = row.totalUsers ?? row.total_users ?? 0;
  const userGrowthThisMonth = row.userGrowthThisMonth ?? row.user_growth_this_month ?? 0;
  const openCourses = row.openCourses ?? row.open_courses ?? 0;
  const courseGrowthThisMonth = row.courseGrowthThisMonth ?? row.course_growth_this_month ?? 0;
  const publishedCases = row.publishedCases ?? row.published_cases ?? 0;
  const caseGrowthThisMonth = row.caseGrowthThisMonth ?? row.case_growth_this_month ?? 0;
  const aiCaseGenerations = row.aiCaseGenerations ?? row.ai_case_generations ?? 0;
  const aiCaseFailures = row.aiCaseFailures ?? row.ai_case_failures ?? 0;

  const studentsCount = row.studentsCount ?? row.students_count ?? 0;
  const lecturersCount = row.lecturersCount ?? row.lecturers_count ?? 0;
  const adminsCount = row.adminsCount ?? row.admins_count ?? 0;

  const totalSum = studentsCount + lecturersCount + adminsCount || totalUsers || 1;
  const studentPercent =
    row.studentPercent ?? row.student_percent ?? Math.round((studentsCount / totalSum) * 100);
  const lecturerPercent =
    row.lecturerPercent ?? row.lecturer_percent ?? Math.round((lecturersCount / totalSum) * 100);
  const adminPercent =
    row.adminPercent ?? row.admin_percent ?? Math.max(0, 100 - studentPercent - lecturerPercent);

  const rawCourses = row.casesByCourse ?? row.cases_by_course ?? [];
  const casesByCourse: CourseCaseStat[] = rawCourses.map((c) => {
    const pub = c.publishedCount ?? c.published_count ?? 0;
    const dft = c.draftCount ?? c.draft_count ?? 0;
    return {
      courseCode: c.courseCode ?? c.course_code ?? "",
      courseName: c.courseName ?? c.course_name ?? "",
      publishedCount: pub,
      draftCount: dft,
      totalCount: c.totalCount ?? c.total_count ?? pub + dft,
    };
  });

  const rawLogs = row.recentLogs ?? row.recent_logs ?? [];
  const recentLogs: RecentLogItem[] = rawLogs.map((log, i) => ({
    id: log.id ?? `log-${i}`,
    description: log.description,
    meta: log.meta ?? "",
    tone: log.tone ?? "info",
    occurredAt: log.occurredAt ?? log.occurred_at,
  }));

  let systemHealth: AdminOverview["systemHealth"];
  if (row.system_health) {
    systemHealth = {
      appServer: row.system_health.app_server ?? "UP",
      database: row.system_health.database ?? "UP",
      aiService: row.system_health.ai_service ?? "UP",
      indexing: row.system_health.indexing ?? "UP",
      indexingProcessingCount: row.system_health.indexing_processing_count ?? 0,
    };
  }

  return {
    attentionAlerts,
    kpis: {
      totalUsers,
      userGrowthThisMonth,
      openCourses,
      courseGrowthThisMonth,
      publishedCases,
      caseGrowthThisMonth,
      aiCaseGenerations,
      aiCaseFailures,
    },
    roleBreakdown: {
      studentsCount,
      lecturersCount,
      adminsCount,
      studentPercent,
      lecturerPercent,
      adminPercent,
    },
    casesByCourse,
    recentLogs,
    systemHealth,
  };
}
