import { useState } from 'react';
import Navbarin from '../../components/Navbar/navbarin.tsx';
import BreadcrumbNav from '../../components/breadcrumbnav/breadcrumbnav.tsx';
import { FaArrowLeft, FaChevronDown, FaCamera, FaEye, FaEyeSlash } from "react-icons/fa";
import "./userprofilesetting.css";

const AccountSettings: React.FC = () => {
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

  return (
    <div className="lec-dashboard-container">
      <div className="nav"><Navbarin /></div>
      <div className="breadcrumb"><BreadcrumbNav /></div>

      <div className="main-area">
        <div className="dashboard-content">
          <div className="dashboard-cards">
            <div className="card account-settings-wrapper">

             
              <div className="account-settings-header">
                <button className="back-btn" title="Go Back" aria-label="Go Back"><FaArrowLeft /></button>
                <span className="account-title">Account Settings</span>
              </div>

             
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

              <div className="password-section">
                <div className="password-header">
                  <h4>Password Management</h4>
                  <button
                    className="collapse-btn"
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                    aria-label={showPasswordSection ? "Collapse password section" : "Expand password section"}
                    title={showPasswordSection ? "Collapse password section" : "Expand password section"}
                  >
                    <FaChevronDown className={showPasswordSection ? "rotate" : " "} />
                  </button>
                </div>

                {showPasswordSection && (
                  <div className="password-grid">
                    
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

             
              <div className="button-row">
                <button className="save-btn">Save</button>
                <button className="cancel-btn">Cancel</button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
