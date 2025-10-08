export type LoginPayload = { username: string; password: string };
export type VerifyOtpPayload = { username: string; otp: string };

export type CurrentUser = {
  id?: number; // filled from /auth/me (or left undefined if not available)
  username: string; // from JWT 'sub'
  roles: string[]; // from JWT 'roles' or 'authorities'
  authorities: string[];
};

export type AuthState = {
  status: "idle" | "loading" | "otp_required" | "authenticated" | "error";
  token: string | null;
  pendingUsername: string | null;
  error: string | null;
  currentUser: CurrentUser | null;
};
