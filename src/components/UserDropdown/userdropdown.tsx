import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import './userdropdown.css';

const UserDropdown: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data from localStorage/sessionStorage if needed
    localStorage.removeItem('authToken'); // or whatever key you used
    sessionStorage.clear();

    // Show alert (optional)
    alert("Logging out...");

    // Redirect to login page
    navigate('/login');
  };
  return (
    <div className="dropdown-menuuser">
      <Link to = "/account-setting" className = "dropdown-itemuseraccount">
      <div className="dropdown-itemuser" onClick={() => alert("My Account clicked")}>
        <FaUser className="dropdown-iconuser" />
        <span>My Account</span>
      </div>
      </Link>
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
