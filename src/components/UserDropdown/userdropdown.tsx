import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import "./userdropdown.css";
import { logout } from "../../services/auth";

const UserDropdown: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout(); // clear token (and optional server call)
    navigate("/login", { replace: true }); // send to login
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
        className="dropdown-itemuser"
        onClick={handleLogout}
        role="menuitem"
      >
        <FaSignOutAlt className="dropdown-iconuser" />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default UserDropdown;
