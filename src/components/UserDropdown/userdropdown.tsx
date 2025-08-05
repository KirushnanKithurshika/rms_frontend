import React from 'react';
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import './userdropdown.css';

const UserDropdown: React.FC = () => {
  return (
    <div className="dropdown-menuuser">
      <div className="dropdown-itemuser" onClick={() => alert("My Account clicked")}>
        <FaUser className="dropdown-iconuser" />
        <span>My Account</span>
      </div>
      <div className="dropdown-itemuser" onClick={() => alert("Preferences clicked")}>
        <FaCog className="dropdown-iconuser" />
        <span>Preferences</span>
      </div>
      <div className="dropdown-itemuser" onClick={() => alert("Logging out...")}>
        <FaSignOutAlt className="dropdown-iconuser" />
        <span>Logout</span>
      </div>
    </div>
  );
};

export default UserDropdown;
