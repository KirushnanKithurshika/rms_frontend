import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import "./userdropdown.css";
import { logout } from "../../services/auth";

const UserDropdown: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();                          // clear token (and optional server call)
    navigate("/login", { replace: true });   // send to login
  };

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

      <div className="dropdown-itemuser" onClick={handleLogout}>
        <FaSignOutAlt className="dropdown-iconuser" />
        <span>Logout</span>
      </div>
    </div>
  );
};

export default UserDropdown;
