import React from 'react';
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './userdropdown.css';

const UserDropdown: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
  
    alert("Logging out...");
    navigate("/login"); 
  };

  return (
    <div className="dropdown-menuuser">
      <div
        className="dropdown-itemuser"
        onClick={() => navigate("/account-setting")}
      >
        <FaUser className="dropdown-iconuser" />
        <span>My Account</span>
      </div>

      <div
        className="dropdown-itemuser"
        onClick={() => navigate("/preferences")}
      >
        <FaCog className="dropdown-iconuser" />
        <span>Preferences</span>
      </div>

      <div
        className="dropdown-itemuser"
        onClick={handleLogout}
      >
        <FaSignOutAlt className="dropdown-iconuser" />
        <span>Logout</span>
      </div>
    </div>
  );
};

export default UserDropdown;
