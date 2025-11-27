import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar/navbar";
import "./activateaccount.css";


const ActivateAccount: React.FC = () => {
  const [search] = useSearchParams();
  const navigate = useNavigate();

  const token = useMemo(
    () => search.get("token") || search.get("t") || "",
    [search]
  );

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!token)
      return "Missing activation token. Please open the link from your email.";
    if (newPassword.length < 8) return "Password must be at least 8 characters.";
    if (newPassword !== confirm) return "Passwords do not match.";
    return null;
  };

  const handleActivate = async () => {
    setMsg(null);
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    try {
      setLoading(true);
      await api.post("/auth/activate", null, { params: { token, newPassword } });
      setMsg("Account activated. You can now log in.");
      setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Activation failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="navcon">
        <Navbar />
      </div>

      <div className="activate-set-container">
        <div className="activate-set-box">
          <h2 className="activate-set-h">Set Your Password</h2>
          <p className="activate-set-intro">
            Create a password for your new account to continue.
          </p>

          {!token && (
            <p className="activate-set-warning">
              Missing activation token. Please open the link from your email.
            </p>
          )}

          <label className="as-label" htmlFor="newPassword">New Password</label>
          <div className="as-password-wrap">
            <input
              type={showNew ? "text" : "password"}
              id="newPassword"
              className="as-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Enter a new password"
            />
            <button
              type="button"
              className="as-eye"
              onClick={() => setShowNew((p) => !p)}
              aria-label={showNew ? "Hide password" : "Show password"}
            >
              {showNew ? "Hide" : "Show"}
            </button>
          </div>

          <label className="as-label" htmlFor="confirmPassword">Confirm Password</label>
          <div className="as-password-wrap">
            <input
              type={showConfirm ? "text" : "password"}
              id="confirmPassword"
              className="as-input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              placeholder="Re-enter your password"
            />
            <button
              type="button"
              className="as-eye"
              onClick={() => setShowConfirm((p) => !p)}
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? "Hide" : "Show"}
            </button>
          </div>

          {msg && <p className="activate-set-msg">{msg}</p>}
          {error && <p className="activate-set-error">{error}</p>}

          <div className="activate-set-actions">
            <button
              className="activate-set-button"
              onClick={handleActivate}
              disabled={loading || !token}
            >
              {loading ? "Activating..." : "Activate & Continue"}
            </button>
            <button
              className="activate-set-cancel"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivateAccount;
