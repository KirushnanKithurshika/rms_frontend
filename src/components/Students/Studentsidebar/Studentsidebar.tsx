import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Studentsidebar.css";
import {
  FaChevronLeft,
  FaChevronRight,
  FaHome,
  FaFileAlt,
  FaShareSquare,
  FaCreditCard,
  FaSpinner,
  FaReceipt,
} from "react-icons/fa";

type SidebarState = "expanded" | "collapsed" | "hidden";

const StudentSidebar: React.FC = () => {
  const [sidebarState, setSidebarState] = useState<SidebarState>("collapsed");

  const handleToggle = () => {
    setSidebarState((prev) =>
      prev === "expanded" ? "collapsed" : prev === "collapsed" ? "hidden" : "expanded"
    );
  };

  return (
    <div className={`student-sidebar ${sidebarState}`}>
      <button
  className="sidebar-toggle-btn"
  aria-label="Toggle sidebar"
  onClick={handleToggle}
>
  {sidebarState === "hidden" ? <FaChevronRight /> : <FaChevronLeft />}
  {/* optional: same mobile backdrop behavior */}
  {sidebarState !== "expanded" && (
    <div className="mobile-sidebar-backdrop" onClick={handleToggle}></div>
  )}
</button>

      {(sidebarState === "expanded" || sidebarState === "collapsed") && (
        <>
          <div className="sidebar-divider" />

         

          {/* all flat items */}
          <NavLink
            to="/student/transcript"
            end
            className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
          >
            <FaFileAlt className="sidebar-icon" />
            {sidebarState === "expanded" && <span>Transcript</span>}
          </NavLink>

          <NavLink
            to="/student/transcript/request"
            className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
          >
            <FaShareSquare className="sidebar-icon" />
            {sidebarState === "expanded" && <span>Request Transcript</span>}
          </NavLink>

          <NavLink
            to="/student/transcript/payment"
            className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
          >
            <FaCreditCard className="sidebar-icon" />
            {sidebarState === "expanded" && <span>Payment</span>}
          </NavLink>

          <NavLink
            to="/student/transcript/status"
            className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
          >
            <FaSpinner className="sidebar-icon" />
            {sidebarState === "expanded" && <span>Status</span>}
          </NavLink>

          <NavLink
            to="/student/transcript/history"
            className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
          >
            <FaReceipt className="sidebar-icon" />
            {sidebarState === "expanded" && <span>History</span>}
          </NavLink>
        </>
      )}
    </div>
  );
};

export default StudentSidebar;
