import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import "./Studentsubnav.css";

const links = [
  { label: "Home",                 to: "/student/student-dashboard" },
  { label: "Courses",              to: "/student-courses" }, // if your route is /student/courses, change it here
  { label: "Academic Summary",     to: "/student/academic-summary" },
  { label: "Transcript",           to: "/student/transcript" },
  { label: "Student Verification", to: "/student/verification" },
];

const StudentSubNav: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="rounded-nav-container" aria-label="Student secondary navigation">
      <button
        className="hamburger"
        type="button"
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMenuOpen}
        aria-controls="student-subnav"
        onClick={() => setIsMenuOpen(s => !s)}
      >
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <ul id="student-subnav" className={`rounded-nav ${isMenuOpen ? "open" : ""}`}>
        {links.map(({ label, to }) => (
          <li key={to}>
            <NavLink
              to={to}
              end                 /* <- exact match so ONLY one is active */
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default StudentSubNav;
