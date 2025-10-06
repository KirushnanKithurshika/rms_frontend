// src/services/auth.ts
import api from "./api";
import { jwtDecode } from "jwt-decode";

type Claims = { sub?: string }; // your token's subject = username/email

export async function logout() {
  try {
    const token = localStorage.getItem("token");
    const claims = token ? jwtDecode<Claims>(token) : null;
    const username = claims?.sub || localStorage.getItem("pendingUsername") || "";

    // Your backend logout expects ?username=...
    await api.post("/auth/logout", null, { params: { username } }).catch(() => {});
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("pendingUsername");
    sessionStorage.clear();
  }
}
