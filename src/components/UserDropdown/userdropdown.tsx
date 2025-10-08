import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import "./userdropdown.css";
import { logout } from "../../services/auth";
import { useAppDispatch } from "../../app/hooks";
import { logoutThunk } from "../../features/auth/authSlice";
import { showSuccess, showError } from "../../utils/toast";

const UserDropdown: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    // Dispatch Redux async thunk — it will clear token & session
    await dispatch(logoutThunk());
    showSuccess("Logout Success..");

    // Redirect user to login page
    navigate("/login", { replace: true });
  };
  return (
    <div className="dropdown-menuuser" role="menu" aria-label="User menu">
      {/* Link item */}
      <Link to="/account-setting" className="dropdown-itemuser" role="menuitem">
        <FaUser className="dropdown-iconuser" />
        <span>My Account</span>
      </Link>

      {/* Button item */}
      <button
        type="button"
        className="dropdown-itemuser"
        onClick={() => alert("Preferences clicked")}
        role="menuitem"
      >
        <FaCog className="dropdown-iconuser" />
        <span>Preferences</span>
      </button>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        className="dropdown-itemuser"
        role="menuitem"
      >
        <FaSignOutAlt className="dropdown-iconuser" />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default UserDropdown;