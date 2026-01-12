import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbarin from '../../components/Navbar/navbarin.tsx';
import BreadcrumbNav from '../../components/breadcrumbnav/breadcrumbnav.tsx';
import { FaArrowLeft, FaChevronDown, FaCamera, FaEye, FaEyeSlash } from "react-icons/fa";
import "./userprofilesetting.css";
import api from "../../services/api";
import { Popconfirm, message } from "antd";
import { useAppSelector } from "../../app/hooks";
import { selectUsername, selectUserRoles } from "../../features/auth/selectors";

type BasicForm = {
  email: string;
  fullName: string;
  department: string;
  address: string;
  contact: string;
};

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const username = useAppSelector(selectUsername);
  const roles = useAppSelector(selectUserRoles);
  const displayName = username || "User";
  const primaryRole = roles[0] || "User";

  const [showPasswordSection, setShowPasswordSection] = useState(true);
  const [profileImage, setProfileImage] = useState(
    "https://cdn-icons-png.flaticon.com/512/847/847969.png"
  );

  // --- Basic info form state (UPPER PART) ---
  const initialForm: BasicForm = useMemo(
    () => ({
      email: "",
      fullName: "",
      department: "",
      address: "",
      contact: "",
    }),
    []
  );

  const [form, setForm] = useState<BasicForm>(initialForm);
  const [savedProfileImage, setSavedProfileImage] = useState(profileImage); // for cancel reset

  const onChange = (k: keyof BasicForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  // Upper-part Save/Cancel
  const handleSaveUpper = () => {
    // TODO: call API to save profile + form fields
    setSavedProfileImage(profileImage);
    alert("Profile details saved successfully!");
  };
  const handleCancelUpper = () => {
    // revert to last saved values (no navigation)
    setForm(initialForm);
    setProfileImage(savedProfileImage);
  };


  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();


  const validatePasswordForm = () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      return "Please fill in all password fields.";
    }
    if (passwordForm.newPassword.length < 8) {
      return "New password must be at least 8 characters.";
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return "New password and confirm password do not match.";
    }
    return null;
  };

  const handleSaveBottom = async () => {
    const validationError = validatePasswordForm();
    if (validationError) {
      messageApi.error(validationError);
      return;
    }

    try {
      setIsUpdatingPassword(true);
      const res = await api.post("/auth/change-password", {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      const successMessage = res?.data?.message || "Password changed successfully.";
      messageApi.success(successMessage);
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Could not change password. Please try again.";
      messageApi.error(msg);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleConfirmOpen = () => {
    const validationError = validatePasswordForm();
    if (validationError) {
      messageApi.error(validationError);
      return;
    }
    setConfirmOpen(true);
  };
  const handleCancelBottom = () => {
    navigate("/lecturerhome");
  };

  return (
    <div className="lec-dashboard-container">
      {contextHolder}
      <div className="nav"><Navbarin /></div>
      <div className="breadcrumb"><BreadcrumbNav /></div>

      <div className="main-area">
        <div className="dashboard-content">
          <div className="dashboard-cards">
            <div className="account-settings-wrapper">


              <div className="account-settings-header">
                <button
                  className="back-btn"
                  onClick={() => navigate("/")}
                >
                  <FaArrowLeft />
                </button>
                <div className="account-title">Account Settings</div>
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
                  <h3 className="profile-name">{displayName}</h3>
                  <p className="profile-id">{primaryRole}</p>
                </div>
              </div>

            
              <div className="form-grid">
                <div className="form-group">
                  <label>User Name</label>
                  <input type="text" value={displayName} disabled className="input disabled-input" />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="Enter Email"
                    disabled className="input disabled-input"
                    value={displayName}
                    onChange={onChange("email")}
                  />
                </div>

                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter Full Name"
                    className="input"
                    value={form.fullName}
                    onChange={onChange("fullName")}
                  />
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    placeholder="Enter Department"
                    className="input"
                    value={form.department}
                    onChange={onChange("department")}
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    placeholder="Enter Address"
                    className="input"
                    value={form.address}
                    onChange={onChange("address")}
                  />
                </div>

                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="text"
                    placeholder="Enter Contact Number"
                    className="input"
                    value={form.contact}
                    onChange={onChange("contact")}
                  />
                </div>
              </div>


              <div className="button-row">
                <button className="save-btn-ACsetting" onClick={handleSaveUpper}>Save</button>
                <button className="cancel-btn-ACsetting" onClick={handleCancelUpper}>Cancel</button>
              </div>


              <div className="password-section">
                <div className="password-header">
                  <h3>Password Management</h3>
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
                          placeholder="Enter current password"
                          value={passwordForm.oldPassword}
                          onChange={(e) =>
                            setPasswordForm((p) => ({ ...p, oldPassword: e.target.value }))
                          }
                          autoComplete="off"
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
                          placeholder="Enter new password"
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
                          }
                          autoComplete="new-password"
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
                          placeholder="Confirm new password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
                          }
                          autoComplete="new-password"
                        />
                        <span
                          className="eye-icon"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                      </div>
                    </div>
                    <div></div>
                    <div className="button-row">
                      <Popconfirm
                        title="Change password?"
                        description="Are you sure you want to update your password?"
                        okText="Update"
                        cancelText="Cancel"
                        okButtonProps={{ loading: isUpdatingPassword }}
                        open={confirmOpen}
                        onOpenChange={(open) => {
                          if (!open) setConfirmOpen(false);
                        }}
                        onConfirm={() => {
                          setConfirmOpen(false);
                          handleSaveBottom();
                        }}
                        onCancel={() => setConfirmOpen(false)}
                      >
                        <button
                          className="save-btn-ACsetting"
                          onClick={handleConfirmOpen}
                          disabled={isUpdatingPassword}
                        >
                          {isUpdatingPassword ? "Updating..." : "Update"}
                        </button>
                      </Popconfirm>
                      <button className="cancel-btn-ACsetting" onClick={handleCancelBottom}>Cancel</button>
                    </div>
                  </div>

                )}

              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
