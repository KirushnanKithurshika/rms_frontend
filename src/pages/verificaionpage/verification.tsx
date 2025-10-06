import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/navbar";
import "./verification.css";
import api from "../../services/api";

type ApiResponse<T> = {
  status: string;
  statusCode?: string;
  message?: string;
  type?: string;
  data: T; // JWT in 'data'
};

const TwoStepVerification: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fromState = (location.state as any)?.username;
    const stored = localStorage.getItem("pendingUsername");
    setUsername(fromState || stored || "");
  }, [location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) setOtp(value);
  };

  const handleVerify = async () => {
    setError(null);
    if (!username) return setError("Missing username/email. Please login again.");
    if (otp.length !== 6) return setError("Enter the 6-digit code.");

    try {
      setLoading(true);
      // no Authorization header thanks to interceptor guard
      const res = await api.post<ApiResponse<string>>("/auth/verify-otp", { username, otp });
      console.log("verify-otp response:", res.data);

      const token = res.data?.data;
      if (!token) return setError("Verification failed: no token received.");

      localStorage.setItem("token", token);
      localStorage.removeItem("pendingUsername");

      // Go to dashboard (use the route that actually exists in App.tsx)
      navigate("/dashboard", { replace: true });
      // If you only have /admin/dashboard, use that instead:
      // navigate("/admin/dashboard", { replace: true });
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || "Invalid or expired code.";
      setError(msg);
      console.error("OTP verify error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="navcon"><Navbar /></div>

      <div className="verification-container">
        <div className="verification-box">
          <span className="verificationH">Two Step Verification</span>
          <p>For added security, please enter the verification code sent to your registered email or mobile number to complete the login process.</p>

          {username && (
            <p style={{ fontSize: 12, opacity: 0.7, marginTop: -6 }}>
              Verifying: <b>{username}</b>
            </p>
          )}

          <input
            type="password"
            maxLength={6}
            value={otp}
            onChange={handleChange}
            className="otp-input"
            inputMode="numeric"
          />

          {error && <p style={{ color: "crimson", marginTop: 8, fontSize: 14 }}>{error}</p>}

          <button
            className="verify-button"
            onClick={handleVerify}
            disabled={loading || otp.length !== 6 || !username}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TwoStepVerification;
