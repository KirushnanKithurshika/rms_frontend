// src/pages/ResetPasswordEmail/resetpasswordemail.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/navbar";
import api from "../../services/api";

const ResetPasswordEmail: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSendLink = async () => {
    setMsg(null);
    setError(null);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/forgot-password", { email }); // <-- your backend URL
      setMsg("If that email exists, a reset link has been sent. Please check your inbox.");
      // optionally navigate after a short delay
      setTimeout(() => navigate("/login"), 1500);
    } catch (e: any) {
      const m =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Unable to send reset link. Please try again.";
      setError(m);
      console.error("forgot-password error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="navcon">
        <Navbar />
      </div>

      <div className="Reset-container">
        <div className="login-box">
          <h2>Reset Password</h2>

          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {msg && <p style={{ color: "#065f46", marginTop: 8 }}>{msg}</p>}
          {error && <p style={{ color: "crimson", marginTop: 8 }}>{error}</p>}

          <div className="button-wrapper">
            <button className="login-button" onClick={handleSendLink} disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </div>

          <div>
            <span className="forgot-text" onClick={() => navigate("/login")}>
              <a href="/login">Back to Login</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordEmail;
