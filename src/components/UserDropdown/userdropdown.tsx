import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import "./userdropdown.css";

const UserDropdown: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    

    navigate("/login", { replace: true });
  };

  return (
    <div className="dropdown-menuuser" role="menu" aria-label="User menu">
      <Link to="/account-setting" className="dropdown-itemuser" role="menuitem">
        <FaUser className="dropdown-iconuser" />
        <span>My Account</span>
      </Link>

      <Link to="/preferences" className="dropdown-itemuser" role="menuitem">
        <FaCog className="dropdown-iconuser" />
        <span>Preferences</span>
      </Link>

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
