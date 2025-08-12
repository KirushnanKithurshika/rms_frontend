import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/navbar";
import "./verification.css";
import { AuthContext } from "../../context/authContext";

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
  const { verifyOtp } = useContext(AuthContext);

  const fromState = (location.state as LocState | undefined)?.username ?? "";
  const [username] = useState<string>(
    fromState || sessionStorage.getItem("pending_username") || ""
  );

  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
  };

  const handleVerify = async () => {
    setError(null);
    const u = username.trim();
    const code = otp.trim();
    if (!u) return setError("Missing username. Please log in again.");
    if (code.length !== 6) return setError("Enter the 6-digit code.");

    try {
      setSubmitting(true);
      const user = await verifyOtp(u, code); // builds user from JWT roles
      navigate(roleHome(user.role), { replace: true });
    } catch (e: any) {
      setError(e?.message || "Invalid or expired code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") handleVerify();
  };

  return (
    <div className="page-wrapper">
      <div className="navcon">
        <Navbar />
      </div>

      <div className="verification-container">
        <div className="verification-box">
          <span className="verificationH">Two Step Verification</span>
          <p>
            For added security, enter the verification code sent to your
            registered email or mobile number.
          </p>

          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            className="otp-input"
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label="6-digit verification code"
          />

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
