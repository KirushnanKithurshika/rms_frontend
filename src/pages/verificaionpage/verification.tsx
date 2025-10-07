import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/navbar";
import "./verification.css";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { verifyOtpThunk, resetError } from "../../features/auth/authSlice";
import {
  selectAuthError,
  selectAuthStatus,
  selectPendingUsername,
} from "../../features/auth/selectors";
import { showError, showSuccess } from "../../utils/toast";

const TwoStepVerification: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [uiUsername, setUiUsername] = useState("");

  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);
  const pendingUsername = useAppSelector(selectPendingUsername);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fromState = (location.state as any)?.username;
    setUiUsername(fromState || pendingUsername || "");
  }, [location.state, pendingUsername]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) setOtp(value);
  };

  const handleVerify = async () => {
    if (!uiUsername)
      return showError("Username missing — please log in again.");
    if (otp.length !== 6) return showError("Please enter a valid 6-digit OTP.");

    dispatch(resetError());
    const res = await dispatch(verifyOtpThunk({ username: uiUsername, otp }));

    if (verifyOtpThunk.fulfilled.match(res)) {
      navigate("/dashboard", { replace: true });
    }
  };

  const loading = status === "loading";

  return (
    <div className="page-wrapper">
      <div className="navcon">
        <Navbar />
      </div>

      <div className="verification-container">
        <div className="verification-box">
          <span className="verificationH">Two Step Verification</span>
          <p>Enter the 6-digit code sent to your email.</p>

          {uiUsername && (
            <p style={{ fontSize: 12, opacity: 0.7, marginTop: -6 }}>
              Verifying: <b>{uiUsername}</b>
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

          {error && (
            <p style={{ color: "crimson", marginTop: 8, fontSize: 14 }}>
              {error}
            </p>
          )}

          <button
            className="verify-button"
            onClick={handleVerify}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TwoStepVerification;
