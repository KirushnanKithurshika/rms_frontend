// src/pages/ResetPasswordPage/resetpasswordpage.tsx
import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar/navbar";
import "./resetpassword.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../../services/api";

const ResetPassword: React.FC = () => {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [search] = useSearchParams();
  const navigate = useNavigate();

  // read token (and optional email if you include it in the link)
  const token = useMemo(() => search.get("token") || search.get("t") || "", [search]);
  const email = useMemo(() => search.get("email") || "", [search]); // harmless if backend ignores

  const validate = () => {
    if (!token) return "Missing or invalid reset token. Please open the link from your email.";
    if (newPassword.length < 8) return "Password must be at least 8 characters.";
    if (newPassword !== confirm) return "Passwords do not match.";
    return null;
  };

const handleReset = async () => {
  const newPassword = (document.getElementById("newPassword") as HTMLInputElement)?.value || "";
  const confirm = (document.getElementById("confirmPassword") as HTMLInputElement)?.value || "";

  if (!token) {
    alert("Missing reset token. Please use the link from your email.");
    return;
  }
  if (!newPassword || newPassword.length < 8) {
    alert("Password must be at least 8 characters.");
    return;
  }
  if (newPassword !== confirm) {
    alert("Passwords do not match.");
    return;
  }

  try {
    // IMPORTANT: send as query/form params (NOT JSON)
    await api.post("/auth/reset-password", null, {
      params: { token, newPassword },
    });
    alert("Password reset successful!");
    localStorage.removeItem("token"); // ensure logged-out after reset
    navigate("/login");
  } catch (e: any) {
    alert(e?.response?.data?.message || "Could not reset password. Link may be invalid/expired.");
  }
};


  return (
    <div className="page-wrapper">
      <div className="navcon"><Navbar /></div>

      <div className="Reset-container">
        <div className="login-box">
          <h2>Reset Password</h2>

          {!token && (
            <p style={{ color: "crimson", marginBottom: 8 }}>
              Missing reset token. Please open the link from your email.
            </p>
          )}

          <label htmlFor="newPassword">New Password</label>
          <div className="password-wrapper">
            <input
              type={showNew ? "text" : "password"}
              id="newPassword"
              className="login-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <span className="toggle-icon" onClick={() => setShowNew((p) => !p)}>
              {showNew ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="password-wrapper">
            <input
              type={showConfirm ? "text" : "password"}
              id="confirmPassword"
              className="login-input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
            <span className="toggle-icon" onClick={() => setShowConfirm((p) => !p)}>
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {msg && <p style={{ color: "#065f46", marginTop: 8 }}>{msg}</p>}
          {error && <p style={{ color: "crimson", marginTop: 8 }}>{error}</p>}

          <div className="button-wrapper">
            <button
              className="login-button"
              onClick={handleReset}
              disabled={loading || !token}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>

          <div>
            <span className="forgot-text">
              Remembered your password? <a href="/login">Login</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
