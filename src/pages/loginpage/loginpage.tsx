import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import Navbar from "../../components/Navbar/navbar";
import "./LoginPage.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../../services/api.tsx";

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState(""); // <-- add
  const [password, setPassword] = useState(""); // <-- add
  const [loading, setLoading] = useState(false); // <-- add
  const [error, setError] = useState<string | null>(null); // <-- add
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    // ensure no stale token goes with /auth/login
    localStorage.removeItem("token");

    try {
      // adjust keys if your backend expects { email, password }
      const res = await api.post("/auth/login", { username, password });
      // if login returns nothing but triggers OTP, that’s fine
      localStorage.setItem("pendingUsername", username);
      navigate("/verification", { state: { username } });
    } catch (e: any) {
      // Friendly error
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Login failed. Check username/password.";
      setError(msg);
      console.error("Login error:", e);
    } finally {
      setLoading(false);
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
