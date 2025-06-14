import React, { useState } from 'react';
import Navbar from '../../components/Navbar/navbar';
import './verificationone.css';

const TwoStepVerification: React.FC = () => {
  const [otp, setOtp] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setOtp(value);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="navcon">
        <Navbar />
      </div>
      <div className="verification-container">
        <div className="verification-box">
          <h3>Two Step Verification</h3>
          <p>
            For added security, please enter the verification code sent to your
            registered email or mobile number to complete the login process.
          </p>
          <input
            type="password"
            maxLength={6}
            value={otp}
            onChange={handleChange}
            className="otp-input"
            inputMode="numeric"
          />
          <button className="verify-button">Verify</button>
        </div>
      </div>
    </div>
  );
};

export default TwoStepVerification;
