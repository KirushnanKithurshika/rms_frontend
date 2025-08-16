import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import Navbar from '../../components/Navbar/navbar';
import './loginpage.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AuthContext } from '../../context/authContext';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  
  useEffect(() => {
    setSubmitting(false);
  }, []);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (submitting) return; 
    setError(null);
    setSubmitting(true);

    try {
      const u = username.trim();
      const p = password; 
      await login(u, p);
      sessionStorage.setItem('pending_username', u);
      navigate('/verification', { state: { username: u } });
      
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
     
      setSubmitting(false);
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

          <form className="login-form" onSubmit={handleSubmit} autoComplete="on" noValidate>
            <label htmlFor="username">User Name</label>
            <input
              type="text"
              id="username"
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
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={submitting}
              />
              <span
                className="toggle-icon"
                onClick={() => { if (!submitting) setShowPassword((prev) => !prev); }}
                role="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
                style={submitting ? { pointerEvents: 'none', opacity: 0.6 } : undefined}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {error && <div className="error-text">{error}</div>}

            <div className="button-wrapper">
              <button
                className="login-button"
                type="submit"
                disabled={submitting }
              >
                {submitting ? 'Logging in…' : 'Log in'}
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
