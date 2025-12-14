import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/navbar";
import "./loginpage.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setSubmitting(false), []);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);

    // Simple front-end validation only
    const u = username.trim();
    if (!u || !password) {
      setError("Please enter username and password.");
      setSubmitting(false);
      return;
    }

    // No API: just persist username and move to verification
    sessionStorage.setItem("pending_username", u);
    navigate("/verification", { state: { username: u }, replace: true });
  };

  return (
    <div className="page-wrapper">
      <div className="navcon">
        <Navbar />
      </div>

      <div className="login-container">
        <div className="login-box">
          <h2>Login</h2>

          <form className="login-form" onSubmit={handleSubmit} autoComplete="on" noValidate>
            <label htmlFor="username">User Name</label>
            <input
              id="username"
              type="text"
              className="login-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              required
              disabled={submitting}
            />

            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={submitting}
              />
              <span
                className="toggle-icon"
                role="button"
                tabIndex={0}
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => !submitting && setShowPassword((v) => !v)}
                style={submitting ? { pointerEvents: "none", opacity: 0.6 } : undefined}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {error && <div className="error-text">{error}</div>}
            <div className="button-wrapper">
              <button
                className="login-button"
                type="button"
                onClick={() => {
                 
                 
                  navigate("/verification");
                }}
                disabled={submitting}
              >
                {submitting ? "Processing…" : "Log in"}
              </button>
            </div>

          </form>

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
