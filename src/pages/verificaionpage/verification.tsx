import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/navbar";
import "./verification.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

type LocState = { username?: string };


const roleHome = (role?: string) => {
  const r = role?.toUpperCase?.();
  if (r === "ADMIN") return "/admin/dashboard";
  if (r === "LECTURER") return "/lecturerhome";
  if (r === "STUDENT") return "/student/student-dashboard";
  return "/";
};

const TwoStepVerification: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  
  const fromState = (location.state as LocState | undefined)?.username ?? "";
  const [username] = useState<string>(
    fromState || sessionStorage.getItem("pending_username") || ""
  );

  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
  };

  // 🔒 Pure-frontend “verify”: just check presence & 6 digits, then navigate.
  const handleVerify = () => {
    setError(null);

    const u = username.trim();
    const code = otp.trim();

    if (!u) {
      setError("Missing username. Please log in again.");
      return;
    }
    if (code.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }

    setSubmitting(true);

  
    const role = sessionStorage.getItem("pending_role") || "STUDENT";

   
    navigate(roleHome(role), { replace: true });
    setSubmitting(false);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !submitting) handleVerify();
  };

  return (
    <div className="page-wrapper">
      <div className="navcon">
        <Navbar />
      </div>

      <div className="verification-container">
        <div className="verification-box">
          <span className="verificationH">Verification</span>
          <p>
            For added security, enter the verification code sent to your
            registered email.
          </p>

          <div className="otp-wrapper">
            <input
              type={showOtp ? "text" : "password"}
              maxLength={6}
              value={otp}
              onChange={handleChange}
              onKeyDown={onKeyDown}
              className="otp-input"
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-label="6-digit verification code"
              disabled={submitting}
            />

            <button
              type="button"
              className="eye-button"
              onClick={() => setShowOtp((v) => !v)}
              disabled={submitting}
              aria-label={showOtp ? "Hide code" : "Show code"}
              title={showOtp ? "Hide code" : "Show code"}
            >
              {showOtp ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {error && <div className="error-text">{error}</div>}

          <button
            className="verify-button"
            onClick={handleVerify}
            disabled={submitting || otp.length !== 6}
          >
            {submitting ? "Verifying..." : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TwoStepVerification;
