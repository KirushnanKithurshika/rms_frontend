import React from 'react';
import Logo from '../../assets/SRMS_ logo.png';
import './navbar.css';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate(); 

  const handleLoginClick = () => {
    navigate('/login'); 
  };

  return (
    <nav className="custom-navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <img src={Logo} alt="Logo" className="navbar-logo" />
        </div>
        <div className="navbar-right">
          <button className="loginbar-button" onClick={handleLoginClick}>
            Login
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
