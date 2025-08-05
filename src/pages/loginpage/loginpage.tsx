import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import Navbar from '../../components/Navbar/navbar';
import './LoginPage.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {

    navigate('/verification');
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
          <input type="text" id="username" className="login-input" />

          <label htmlFor="password">Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="login-input"
            />
            <span
              className="toggle-icon"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="button-wrapper">
            <button className="login-button" onClick={handleLogin}>
              Log in
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
