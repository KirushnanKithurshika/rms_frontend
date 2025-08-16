import React, { useContext, useCallback } from 'react';
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './userdropdown.css';
import { AuthContext } from '../../context/authContext';

const UserDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const go = (path: string) => () => navigate(path);

  const handleLogout = useCallback(() => {
 
    logout();
  
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  return (
    <div className="dropdown-menuuser">
      <div className="dropdown-itemuser" onClick={go('/account-setting')}>
        <FaUser className="dropdown-iconuser" />
        <span>My Account</span>
      </div>

      <div className="dropdown-itemuser" onClick={go('/preferences')}>
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
