import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import "./Studentsubnav.css";

const StudentSubNav: React.FC = () => {
  const [active, setActive] = useState("Home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = [
    "Home",
    "Courses",
    "Academic Summary",
    "Transcript",
    "Student Verification",
  ];

  return (
    <div className="rounded-nav-container">

      <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </div>

      <ul className={`rounded-nav ${isMenuOpen ? "open" : ""}`}>
        {tabs.map((tab) => (
          <li
            key={tab}
            className={active === tab ? "nav-item active" : "nav-item"}
            onClick={() => {
              setActive(tab);
              setIsMenuOpen(false); 
            }}
          >
            {tab}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentSubNav;
