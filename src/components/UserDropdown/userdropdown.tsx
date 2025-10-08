import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import './userdropdown.css';

const UserDropdown: React.FC = () => {
  const navigate = useNavigate();

  const handleAccountClick = () => {
    navigate('/account-setting');
  };

  const handlePreferencesClick = () => {
    navigate('/preferences');
  };

  const handleLogout = () => {
    // Clear user data from localStorage/sessionStorage if needed
    localStorage.removeItem('authToken'); // or whatever key you used
    sessionStorage.clear();

    // Show alert (optional)
    alert("Logging out...");

    // Redirect to login page
    navigate('/login', { replace: true });

  };
  return (
    <div className="dropdown-menuuser" role="menu">
      {/* Account (use Link) */}
      <Link to="/account-setting" className="dropdown-itemuser" role="menuitem">
        <FaUser className="dropdown-iconuser" />
        <span>My Account</span>
      </Link>

      {/* Preferences (use Link) */}
      <Link to="/preferences" className="dropdown-itemuser" role="menuitem">
        <FaCog className="dropdown-iconuser" />
        <span>Preferences</span>
      </Link>

      {/* Logout (use button) */}
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