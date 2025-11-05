import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import Navbar from "../../components/Navbar/navbar";
import "./LoginPage.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  loginThunk,
  setPendingUsername,
  resetError,
} from "../../features/auth/authSlice";
import {
  selectAuthError,
  selectAuthStatus,
} from "../../features/auth/selectors";

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState(""); // <-- add
  const [password, setPassword] = useState(""); // <-- add
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);
  const navigate = useNavigate();

  const loading = status === "loading";

  const handleLogin = async () => {
    if (!username || !password) return;
    dispatch(resetError());
    dispatch(setPendingUsername(username));

    const res = await dispatch(loginThunk({ username, password }));
    if (loginThunk.fulfilled.match(res)) {
      navigate("/verification", { state: { username } });
    }
  };
  return (
    <div className="page-wrapper">
      <div className="navcon">
        <Navbar />
      </div>

      <div className="login-container">
        <div className="login-box">
          <h2>Login</h2>

          <label htmlFor="username">User Name</label>
          <input
            type="text"
            id="username"
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />

          <label htmlFor="password">Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <span
              className="toggle-icon"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {error && (
            <p className="error" style={{ color: "crimson" }}>
              {error}
            </p>
          )}

          <div className="button-wrapper">
            <button
              className="login-button"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </div>

          <div>
            <span className="forgot-text">
              Forget Password? <Link to="/reset-password-mail">Click Here</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
