// src/routes/landing.ts
// List the *capabilities* (privileges) that imply each landing page, in priority order.
// Put ADMIN-like capabilities first so admins land on admin dashboard.
const LANDING_RULES: Array<{ anyOf: string[]; path: string }> = [
  // Admin landing – any privilege that only admins have (pick one or more)
  { anyOf: ["MANAGE_PRIVILEGES"], path: "/admin/dashboard" },

  // Lecturer landing – privileges lecturers uniquely have
  {
    anyOf: ["CREATE_COURSE", "VIEW_COURSE", "EDIT_COURSE"],
    path: "/lecturerhome",
  },

  // Student landing – privileges students uniquely have
  { anyOf: ["VIEW_RESULT", "VIEW_TRANSCRIPT"], path: "/student/dashboard" },
];

// Fallback if nothing matches
const DEFAULT_LANDING = "/welcomepage"; // or "/welcomepage"

export function resolveLandingPath(
  privileges: string[] | undefined | null
): string {
  const set = new Set(privileges || []);
  for (const rule of LANDING_RULES) {
    if (rule.anyOf.some((p) => set.has(p))) return rule.path;
  }
  return DEFAULT_LANDING;
}
