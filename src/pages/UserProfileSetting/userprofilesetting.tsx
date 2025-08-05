import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbarin from '../../components/Navbar/navbarin.tsx';
import BreadcrumbNav from '../../components/breadcrumbnav/breadcrumbnav.tsx';
import { FaArrowLeft, FaChevronDown, FaCamera, FaEye, FaEyeSlash } from "react-icons/fa";
import "./userprofilesetting.css";

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();

  const [showPasswordSection, setShowPasswordSection] = useState(true);
  const [profileImage, setProfileImage] = useState(
    "https://cdn-icons-png.flaticon.com/512/847/847969.png"
  );

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleSave = () => {
    alert("Profile saved successfully!");
  };

  const handleCancel = () => {
    navigate("/lecturerhome");
  };

  return (
    <div className="lec-dashboard-container">
      <div className="nav"><Navbarin /></div>
      <div className="breadcrumb"><BreadcrumbNav /></div>

      <div className="main-area">
        <div className="dashboard-content">
          <div className="dashboard-cards">
            <div className="account-settings-wrapper">

              {/* Header with Back Button */}
              <div className="account-settings-header">
                <button 
                  className="back-btn"
                  onClick={() => navigate("/lecturerhome")}
                >
                  <FaArrowLeft />
                </button>
                <div className="account-title">Account Settings</div>
              </div>

              {/* Profile Picture Section */}
              <div className="profile-header">
                <div className="profile-picture-wrapper">
                  <img src={profileImage} alt="Profile" className="profile-picture" />
                  <label htmlFor="profile-upload" className="camera-icon">
                    <FaCamera />
                  </label>
                  <input
                    type="file"
                    id="profile-upload"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="profile-info">
                  <h3 className="profile-name">Dr.A.R.Silva</h3>
                  <p className="profile-id">Lecturer</p>
                </div>
              </div>

              {/* Basic Info Form */}
              <div className="form-grid">
                <div className="form-group">
                  <label>User Name</label>
                  <input type="text" value="kithurshika" disabled className="input disabled-input" />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input type="email" placeholder="Enter Email" className="input" />
                </div>

                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" placeholder="Enter Full Name" className="input" />
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <input type="text" placeholder="Enter Department" className="input" />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <input type="text" placeholder="Enter Address" className="input" />
                </div>

                <div className="form-group">
                  <label>Contact Number</label>
                  <input type="text" placeholder="Enter Contact Number" className="input" />
                </div>
              </div>

              {/* Password Management Section */}
              <div className="password-section">
                <div className="password-header">
                  <h4>Password Management</h4>
                  <button
                    className="collapse-btn"
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                  >
                    <FaChevronDown className={showPasswordSection ? "rotate" : ""} />
                  </button>
                </div>

                {showPasswordSection && (
                  <div className="password-grid">
                    
                    {/* Current Password */}
                    <div className="form-group password-input-wrapper">
                      <label>Current Password</label>
                      <div className="password-field">
                        <input 
                          type={showCurrentPassword ? "text" : "password"} 
                          className="input" 
                        />
                        <span 
                          className="eye-icon" 
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="form-group password-input-wrapper">
                      <label>New Password</label>
                      <div className="password-field">
                        <input 
                          type={showNewPassword ? "text" : "password"} 
                          className="input" 
                        />
                        <span 
                          className="eye-icon" 
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="form-group password-input-wrapper full-width">
                      <label>Confirm New Password</label>
                      <div className="password-field">
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          className="input" 
                        />
                        <span 
                          className="eye-icon" 
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="button-row">
                <button className="save-btn" onClick={handleSave}>Save</button>
                <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
