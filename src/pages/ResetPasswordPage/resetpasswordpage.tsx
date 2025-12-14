import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/navbar';
import './resetpassword.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ResetPassword: React.FC = () => {
 
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleReset = () => {

    alert('Password reset successful!');
    navigate('/login'); 
  };

  return (
    <div className="page-wrapper">
      <div className="navcon">
        <Navbar />
      </div>

      <div className="Reset-container">
        <div className="login-box">
          <h2>Reset Password</h2>

          
       

          
          <label htmlFor="newPassword">New Password</label>
          <div className="password-wrapper">
            <input
              type={showNew ? 'text' : 'password'}
              id="newPassword"
              className="login-input"
            />
            <span
              className="toggle-icon"
              onClick={() => setShowNew((prev) => !prev)}
            >
              {showNew ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

        
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="password-wrapper">
            <input
              type={showConfirm ? 'text' : 'password'}
              id="confirmPassword"
              className="login-input"
            />
            <span
              className="toggle-icon"
              onClick={() => setShowConfirm((prev) => !prev)}
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="button-wrapper">
            <button className="login-button" onClick={handleReset}>
              Reset Password
            </button>
          </div>

          <div>
            <span className="forgot-text">
              Remembered your password? <a href="/login">Login</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
