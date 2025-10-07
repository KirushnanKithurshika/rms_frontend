import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AuthState, LoginPayload, VerifyOtpPayload } from "./types";
import api from "../../services/api";
import { showSuccess, showError } from "../../utils/toast";

// Define a reusable type for all API responses
type ApiResponse<T> = {
  status: "success" | "error";
  message?: string;
  data: T;
  statusCode?: string;
  type?: string;
};

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

    if (res.data.status === "success") {
      showSuccess(res.data.message || "OTP verified successfully!");
    } else {
      // If backend sends status=error, reject here
      const msg = res.data.message || "OTP verification failed!";
      showError(msg);
      return rejectWithValue(msg);
    }
    const token = res?.data?.data;
    // console.log("login response:", res);
    if (!token)
      return rejectWithValue("Verification failed: no token received.");
    return token;
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      "Invalid or expired code.";
    showError(msg);
    // ✅ MUST return a rejection (not undefined)
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

const initialState: AuthState = {
  status: "idle",
  token: localStorage.getItem("token"),
  pendingUsername: localStorage.getItem("pendingUsername"),
  error: null,
};

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
    });
    b.addCase(verifyOtpThunk.rejected, (s, a) => {
      s.status = "error";
      s.error = a.payload || "OTP verification failed";
    });

    b.addCase(logoutThunk.fulfilled, (s) => {
      s.status = "idle";
      s.token = null;
      s.pendingUsername = null;
      s.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("pendingUsername");
      sessionStorage.clear();
    });
    b.addCase(logoutThunk.rejected, (s) => {
      s.status = "idle";
      s.token = null;
      s.pendingUsername = null;
      localStorage.removeItem("token");
      localStorage.removeItem("pendingUsername");
      sessionStorage.clear();
    });
  },
});

export const { setPendingUsername, resetError } = slice.actions;
export default slice.reducer;
