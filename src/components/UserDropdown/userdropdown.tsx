import React from 'react';
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import './userdropdown.css';

const UserDropdown: React.FC = () => {
  return (
    <div className="dropdown-menu">
      <div className="dropdown-item" onClick={() => alert("My Account clicked")}>
        <FaUser className="dropdown-icon" />
        <span>My Account</span>
      </div>
      <div className="dropdown-item" onClick={() => alert("Preferences clicked")}>
        <FaCog className="dropdown-icon" />
        <span>Preferences</span>
      </div>
      <div className="dropdown-item" onClick={() => alert("Logging out...")}>
        <FaSignOutAlt className="dropdown-icon" />
        <span>Logout</span>
      </div>
    </div>
  );
};

export default UserDropdown;
