export type LoginPayload = { username: string; password: string };
export type VerifyOtpPayload = { username: string; otp: string };

export type AuthState = {
  status: "idle" | "loading" | "otp_required" | "authenticated" | "error";
  token: string | null;
  pendingUsername: string | null;
  error: string | null;
};
