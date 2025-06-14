import React, { useState } from 'react';
import Navbar from '../../components/Navbar/navbar';
import './LoginPage.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

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
            <button className="login-button">Log in</button>
          </div>

          <p className="forgot-text">
            Forget Password? <a href="#">Click Here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
