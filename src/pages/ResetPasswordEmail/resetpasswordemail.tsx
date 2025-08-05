import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/navbar';


const ResetPasswordEmail: React.FC = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSendLink = () => {
    if (!email) {
      alert('Please enter your email address.');
      return;
    }
    alert(`Reset link sent to ${email}`);
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

          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="button-wrapper">
            <button className="login-button" onClick={handleSendLink}>
              Send Reset Link
            </button>
          </div>

          <div>
            <span className="forgot-text" onClick={() => navigate('/login')}>
            <a href="/login">Back to Login</a>  
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordEmail;
