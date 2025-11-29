// src/pages/SetPassword/SetPassword.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar/navbar";
import "./setpassword.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../../services/api";

const SetPassword: React.FC = () => {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const [search] = useSearchParams();
  const navigate = useNavigate();

  // read token (and optional email if included)
  const token = useMemo(() => search.get("token") || search.get("t") || "", [search]);

  const validate = () => {
    if (!token) return "Missing or invalid activation token. Please open the link from your email.";
    if (newPassword.length < 8) return "Password must be at least 8 characters.";
    if (newPassword !== confirm) return "Passwords do not match.";
    return null;
  };

  useEffect(() => {
    let cancelled = false;
    const validateToken = async () => {
      setError(null);
      setTokenValid(null);
      if (!token) return;
      try {
        const res = await api.get("/auth/validate-activation-token", { params: { token } });
        const payload: any = res?.data || {};
        const ok = (
          String(payload?.status || "").toUpperCase() === "SUCCESS" ||
          String(payload?.statusCode || "") === "20000" ||
          payload?.data === 200 ||
          String(payload?.data) === "200"
        );
        if (!cancelled) setTokenValid(ok);
        if (!ok && !cancelled) {
          setError(payload?.message || "Token is invalid or expired.");
        }
      } catch (e: any) {
        if (!cancelled) {
          setTokenValid(false);
          setError(e?.response?.data?.message || "Token is invalid or expired.");
        }
      }
    };
    validateToken();
    return () => { cancelled = true; };
  }, [token]);

  const handleSet = async () => {
    const newPwd = (document.getElementById("newPassword") as HTMLInputElement)?.value || "";
    const conf = (document.getElementById("confirmPassword") as HTMLInputElement)?.value || "";

    // Prefer backend messages; only block on clear client-side issues
    if (!token) { setError("Missing activation token. Please use the link from your email."); return; }
    if (!newPwd || newPwd.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (newPwd !== conf) { setError("Passwords do not match."); return; }

    try {
      setLoading(true);
      setError(null);
      setMsg(null);
      const res = await api.post("/auth/activate-account", null, {
        params: { token, newPassword: newPwd },
      });
      const payload: any = res?.data || {};
      const ok = (
        String(payload?.status || "").toUpperCase() === "SUCCESS" ||
        String(payload?.statusCode || "") === "20000"
      );
      if (!ok) {
        const em = payload?.message || "Activation failed";
        setError(String(em));
        return;
      }
      const m = payload?.message || "Account activated successfully";
      setMsg(String(m));
      // ensure logged-out after activation
      try { localStorage.removeItem("token"); } catch {}
      setTimeout(() => navigate("/login"), 1200);
    } catch (e: any) {
      const errPayload = e?.response?.data;
      const arrayErrors = Array.isArray(errPayload?.errors) ? errPayload.errors.join(', ') : undefined;
      const m = errPayload?.message || arrayErrors || e?.message || "Activation failed";
      setError(String(m));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="navcon"><Navbar /></div>

      <div className="Reset-container">
        <div className="login-box">
          <h2>Activate Account</h2>

          {!token && (
            <p className="rp-error rp-mb-8">
              Missing activation token. Please open the link from your email.
            </p>
          )}

          <label htmlFor="newPassword">Set Password</label>
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

          {msg && <p className="rp-success rp-mt-8">{msg}</p>}
          {error && <p className="rp-error rp-mt-8">{error}</p>}

          <div className="button-wrapper">
            <button
              className="login-button"
              onClick={handleSet}
              disabled={loading || !token || tokenValid === false}
            >
              {loading ? "Activating..." : "Set Password"}
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

export default SetPassword;
