import React from "react";
import { FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import "./userdropdown.css";

const UserDropdown: React.FC = () => {
  const go = (path: string) => () => {
    console.log("Navigate to:", path);
    // replace with navigate(path) if you wire up routing
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    // replace with actual logout + navigation
  };

  return (
    <div className="dropdown-menuuser">
      <div className="dropdown-itemuser" onClick={go("/account-setting")}>
        <FaUser className="dropdown-iconuser" />
        <span>My Account</span>
      </div>

      <div className="dropdown-itemuser" onClick={go("/preferences")}>
        <FaCog className="dropdown-iconuser" />
        <span>Preferences</span>
      </div>

      <div className="dropdown-itemuser" onClick={handleLogout}>
        <FaSignOutAlt className="dropdown-iconuser" />
        <span>Logout</span>
      </div>
    </div>
  );
};

export default UserDropdown;
