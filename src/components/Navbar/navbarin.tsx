import React, { useEffect, useState } from 'react';
import './navbarin.css';
import Logo from '../../assets/SRMS_ logo.png';
import MobileLogo from '../../assets/SRMS_mobile_logo.png';
import { FaBell, FaUserCircle } from 'react-icons/fa';




const Navbarin: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 580); 
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="navbar">
      <div className="navbar-left">
        <img
          src={isMobile ? MobileLogo : Logo}
          alt="Logo"
          className="navbar-logo"
        />
      </div>

      <div className="navbar-center">Welcome Dr.A.R.M.Silva!</div>

      <div className="navbar-right">
        <FaBell className="iconbell" />

        <div className="dropdown">
          <div className="profile">
            <span className="name">Dr.A.R.M.Silva</span>
            <FaUserCircle className="icon" />
          </div>
          <div className="dropdown-content">
        
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbarin;
