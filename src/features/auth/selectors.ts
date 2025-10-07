import type { RootState } from "../../app/store";

export const selectAuthStatus = (s: RootState) => s.auth.status;
export const selectAuthError = (s: RootState) => s.auth.error;
export const selectToken = (s: RootState) => s.auth.token;
export const selectPendingUsername = (s: RootState) => s.auth.pendingUsername;
export const selectIsAuthed = (s: RootState) => Boolean(s.auth.token);
