import React, { useEffect, useRef, useState } from 'react';
import './navbarin.css';
import Logo from '../../assets/SRMS_ logo.png';
import MobileLogo from '../../assets/SRMS_mobile_logo.png';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import UserDropdown from '../UserDropdown/userdropdown';

const Navbarin: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 580);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDropdownToggle = () => {
    setDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="navbar">
      <div className="navbar-left">
        <img src={isMobile ? MobileLogo : Logo} alt="Logo" className="navbar-logo" />
      </div>

      <div className="navbar-center">Welcome Dr.A.R.M.Silva!</div>

      <div className="navbar-right">
        <FaBell className="iconbell" />

        <div className="dropdown" ref={dropdownRef}>
          <div className="profile" onClick={handleDropdownToggle}>
            <span className="name">Dr.A.R.M.Silva</span>
            <FaUserCircle className="icon" />
          </div>

          {dropdownOpen && (
            <div className="dropdown-content">
              <UserDropdown />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbarin;
