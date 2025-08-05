import React, { useState } from "react";
import "./StudentsubNav.css";

const StudentSubNav: React.FC = () => {
  const [active, setActive] = useState("Home");

  const tabs = [
    "Home",
    "Courses",
    "Academic Summary",
    "Transcript",
    "Student Verification",
  ];

  return (
    <div className="rounded-nav-container">
      <ul className="rounded-nav">
        {tabs.map((tab) => (
          <li
            key={tab}
            className={active === tab ? "nav-item active" : "nav-item"}
            onClick={() => setActive(tab)}
          >
            {tab}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentSubNav;
