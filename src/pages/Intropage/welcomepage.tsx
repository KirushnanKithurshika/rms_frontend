import React from 'react';
import Navbar from '../../components/Navbar/navbar';
import './welcomepage.css';
import welcomeImage from '../../assets/welcome_image.png'; 

const WelcomePage: React.FC = () => {
  return (
    <div>
      <Navbar/>
      <div className="welcome-container">
        <div className="welcome-left">
          <img src={welcomeImage} alt="Welcome Illustration" className="welcome-img" />
        </div>
        <div className="welcome-right">
          <h2>Welcome to the Results Management System !</h2>
          <p>
            We warmly welcome you to the official Results Management System of Faculty of Engineering, University of Ruhuna. This platform is designed to provide students, academic staff, and administrators with secure and convenient access to academic results and performance records.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
