import React from 'react';
import Logo from '../../assets/SRMS_ logo.png'; 
import './navbar.css'; 

const Navbar: React.FC = () => {
  return (
    <nav className="custom-navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <img src={Logo} alt="Logo" className="navbar-logo" />
          
        </div>
        <div className="navbar-right">
          <button className="loginbar-button">Login</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
