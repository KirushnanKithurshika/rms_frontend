// src/routes/landing.ts
// List the *capabilities* (privileges) that imply each landing page, in priority order.
// Put ADMIN-like capabilities first so admins land on admin dashboard.
type LandingRule = { anyOf: string[]; path: string };

const LANDING_RULES: LandingRule[] = [
  // Admin landing - any privilege that only admins have (pick one or more)
  { anyOf: ["MANAGE_PRIVILEGES"], path: "/admin/dashboard" },

  // HOD landing - privileges typically assigned to the HOD role
  {
    anyOf: ["APPROVE_RESULT", "MANAGE_RESULT_BATCH", "ADD_TRANSCRIPT"],
    path: "/hod-approval",
  },

  // Lecturer landing - privileges lecturers uniquely have
  {
    anyOf: ["CREATE_COURSE", "VIEW_COURSE", "EDIT_COURSE"],
    path: "/lecturerhome",
  },

  // Student landing - privileges students uniquely have
  {
    anyOf: ["VIEW_RESULT", "VIEW_TRANSCRIPT"],
    path: "/student/student-dashboard",
  },
];

// Fallback if nothing matches; keep it inside the authenticated area to avoid loops
const DEFAULT_LANDING = "/dashboard";

const normalizeToken = (val: string | null | undefined) =>
  (val || "").trim().toUpperCase().replace(/^ROLE_/, "");

export function resolveLandingPath(
  privileges: string[] | undefined | null,
  roles?: string[] | undefined | null
): string {
  const privSet = new Set(
    (privileges || []).map(normalizeToken).filter(Boolean)
  );
  const roleSet = new Set((roles || []).map(normalizeToken).filter(Boolean));

  // 1) Privilege-based landing (priority order)
  for (const rule of LANDING_RULES) {
    if (rule.anyOf.some((p) => privSet.has(normalizeToken(p)))) {
      return rule.path;
    }
  }

  // 2) Role-based fallback to keep users on a sensible page
  if (roleSet.has("ADMIN")) return "/admin/dashboard";
  if (roleSet.has("HOD")) return "/hod-approval";
  if (roleSet.has("LECTURER")) return "/lecturerhome";
  if (roleSet.has("STUDENT")) return "/student/student-dashboard";

  // 3) Default landing inside auth-protected routes
  return DEFAULT_LANDING;
}
