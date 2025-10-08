import type { RootState } from "../../app/store";

export const selectToken = (s: RootState) => s.auth.token;
export const selectAuthStatus = (s: RootState) => s.auth.status;
export const selectAuthError = (s: RootState) => s.auth.error;

export const selectCurrentUser = (s: RootState) => s.auth.currentUser;
export const selectUsername = (s: RootState) =>
  s.auth.currentUser?.username || "";
export const selectPendingUsername = (s: RootState) => s.auth.pendingUsername;
export const selectUserId = (s: RootState) => s.auth.currentUser?.id;
export const selectUserRoles = (s: RootState) =>
  s.auth.currentUser?.roles || [];
export const selectIsAuthed = (s: RootState) => Boolean(s.auth.token);
export const selectHasAnyRole = (roles: string[]) => (s: RootState) => {
  const mine = s.auth.currentUser?.roles || [];
  return roles.some((r) => mine.includes(r));
};
export const selectPrivileges = (s: RootState) =>
  s.auth.currentUser?.authorities || [];

export const selectHasPrivilege = (privilege: string) => (s: RootState) =>
  s.auth.currentUser?.authorities?.includes(privilege) ?? false;

export const selectHasAnyPrivilege = (privs: string[]) => (s: RootState) => {
  const mine = s.auth.currentUser?.authorities || [];
  return privs.some((p) => mine.includes(p));
};
