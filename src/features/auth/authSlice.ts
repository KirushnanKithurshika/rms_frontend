import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import type { AuthState, LoginPayload, VerifyOtpPayload } from "./types";
import api from "../../services/api";
import { showSuccess, showError } from "../../utils/toast";

type JwtClaims = {
  sub?: string;
  roles?: string[];
  authorities?: string[];
  userId?: number;
  iat?: number;
  exp?: number;
};

function decodeJwt(token: string | null): JwtClaims | null {
  if (!token) return null;
  try {
    return jwtDecode<JwtClaims>(token);
  } catch {
    return null;
  }
}

// Define reusable API response type
type ApiResponse<T> = {
  status: "success" | "error";
  message?: string;
  data: T;
  statusCode?: string;
  type?: string;
};

/* -------------------------------------------------------------------------- */
/*                                  THUNKS                                   */
/* -------------------------------------------------------------------------- */

export const loginThunk = createAsyncThunk<
  void,
  LoginPayload,
  { rejectValue: string }
>("auth/login", async (body, { rejectWithValue }) => {
  try {
    const res = await api.post("/auth/login", body);

    if (res.data.status === "success") {
      showSuccess(res.data.message || "Login successful!");
    } else {
      showError(res.data.message || "Login failed!");
    }

    return;
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      "Login failed. Check username/password.";
    showError(msg);
    return rejectWithValue(msg);
  }
});

export const verifyOtpThunk = createAsyncThunk<
  string,
  VerifyOtpPayload,
  { rejectValue: string }
>("auth/verifyOtp", async (body, { rejectWithValue }) => {
  try {
    const res = await api.post<ApiResponse<string>>("/auth/verify-otp", body);

    if (res.data.status !== "success") {
      const msg = res.data.message || "OTP verification failed!";
      showError(msg);
      return rejectWithValue(msg);
    }

    const token = res.data.data;
    if (!token)
      return rejectWithValue("Verification failed: no token received.");

    showSuccess(res.data.message || "OTP verified successfully!");
    return token;
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      "Invalid or expired code.";
    showError(msg);
    return rejectWithValue(msg);
  }
});

export const logoutThunk = createAsyncThunk<
  void,
  void,
  { state: { auth: AuthState }; rejectValue: string }
>("auth/logout", async (_, { getState, rejectWithValue }) => {
  const { token, pendingUsername } = getState().auth;
  try {
    const sub = (() => {
      try {
        if (!token) return null;
        const [, payload] = token.split(".");
        return payload ? JSON.parse(atob(payload))?.sub || null : null;
      } catch {
        return null;
      }
    })();

    const username = sub || pendingUsername || "";
    await api
      .post("/auth/logout", null, { params: { username } })
      .catch(() => {});
  } catch (e: any) {
    return rejectWithValue(
      e?.response?.data?.message || e?.message || "Logout failed."
    );
  }
});

/* -------------------------------------------------------------------------- */
/*                              STATE INITIALIZER                             */
/* -------------------------------------------------------------------------- */

// Restore user only within the current browser session after a successful login
// We use sessionStorage flag to differentiate a fresh app start vs. in-session refresh.
const storedToken = localStorage.getItem("token");
const storedClaims = decodeJwt(storedToken);
const tokenValid = Boolean(storedClaims?.exp) && Date.now() / 1000 < (storedClaims!.exp as number);
const rehydrateSession = sessionStorage.getItem("sessionAuthed") === "1";

const initialState: AuthState = {
  status: tokenValid && rehydrateSession ? "authenticated" : "idle",
  token: tokenValid && rehydrateSession ? storedToken : null,
  pendingUsername: localStorage.getItem("pendingUsername"),
  error: null,
  currentUser: tokenValid && rehydrateSession
    ? {
        id: storedClaims?.userId ?? undefined,
        username: storedClaims?.sub || "",
        roles: storedClaims?.roles || [],
        authorities: storedClaims?.authorities || [],
      }
    : null,
};

// If token is invalid/expired, clear it from storage to avoid confusing refresh behavior
if (!tokenValid) {
  localStorage.removeItem("token");
}

/* -------------------------------------------------------------------------- */
/*                                   SLICE                                   */
/* -------------------------------------------------------------------------- */

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setPendingUsername(state, action) {
      state.pendingUsername = action.payload || null;
      if (state.pendingUsername)
        localStorage.setItem("pendingUsername", state.pendingUsername);
      else localStorage.removeItem("pendingUsername");
    },
    resetError(state) {
      state.error = null;
    },
  },
  extraReducers: (b) => {
    /* ---------------------------- LOGIN HANDLERS ---------------------------- */
    b.addCase(loginThunk.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(loginThunk.fulfilled, (s) => {
      s.status = "otp_required";
    });
    b.addCase(loginThunk.rejected, (s, a) => {
      s.status = "error";
      s.error = a.payload || "Login failed";
    });

    /* --------------------------- VERIFY OTP HANDLERS --------------------------- */
    b.addCase(verifyOtpThunk.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(verifyOtpThunk.fulfilled, (s, a) => {
      s.status = "authenticated";
      s.token = a.payload;
      s.error = null;
      localStorage.setItem("token", a.payload);
      s.pendingUsername = null;
      localStorage.removeItem("pendingUsername");
      // Mark this browser session as authenticated so refresh stays on the same page
      try { sessionStorage.setItem("sessionAuthed", "1"); } catch {}

      const claims = decodeJwt(a.payload);
      const id = claims?.userId ?? undefined;
      const roles = claims?.roles || [];
      const authorities = claims?.authorities || [];
      const username = claims?.sub || "";

      // console.log("✅ Decoded JWT after OTP:", { id, username, roles, authorities });

      s.currentUser = { id, username, roles, authorities };
    });
    b.addCase(verifyOtpThunk.rejected, (s, a) => {
      s.status = "error";
      s.error = a.payload || "OTP verification failed";
    });

    /* ----------------------------- LOGOUT HANDLERS ----------------------------- */
    b.addCase(logoutThunk.fulfilled, (s) => {
      s.status = "idle";
      s.token = null;
      s.pendingUsername = null;
      s.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("pendingUsername");
      sessionStorage.clear();
      s.currentUser = null;
    });
    b.addCase(logoutThunk.rejected, (s) => {
      s.status = "idle";
      s.token = null;
      s.pendingUsername = null;
      localStorage.removeItem("token");
      localStorage.removeItem("pendingUsername");
      sessionStorage.clear();
      s.currentUser = null;
    });
  },
});

export const { setPendingUsername, resetError } = slice.actions;
export default slice.reducer;
