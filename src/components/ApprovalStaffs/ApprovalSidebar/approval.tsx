import React, { useState } from "react";
import { NavLink } from "react-router-dom";

import {
  FaChevronLeft,
  FaChevronRight,
  FaClipboardCheck, 
  FaReceipt,         
} from "react-icons/fa";

type SidebarState = "expanded" | "collapsed" | "hidden";

const ApprovalSidebar: React.FC = () => {
  const [sidebarState, setSidebarState] = useState<SidebarState>("collapsed");

  const handleToggle = () => {
    setSidebarState((prev) =>
      prev === "expanded" ? "collapsed" : prev === "collapsed" ? "hidden" : "expanded"
    );
  };

 


  return (
    <aside className={`student-sidebar ${sidebarState}`} aria-label="Approvals sidebar">
      <button
        className="sidebar-toggle-btn"
        aria-label="Toggle sidebar"
        onClick={handleToggle}
      >
        {sidebarState === "hidden" ? <FaChevronRight /> : <FaChevronLeft />}
      </button>

      
      {sidebarState !== "expanded" && (
        <div className="mobile-sidebar-backdrop" onClick={handleToggle} />
      )}

      {(sidebarState === "expanded" || sidebarState === "collapsed") && (
        <>
          <div className="sidebar-divider" />

          <NavLink
            to={`/approval-requests`}
            end
            className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
          >
            <FaClipboardCheck className="sidebar-icon" />
            {sidebarState === "expanded" && <span>Approval Requests</span>}
          </NavLink>

        
          <NavLink
            to={`/history`}
            className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
          >
            <FaReceipt className="sidebar-icon" />
            {sidebarState === "expanded" && <span>History</span>}
          </NavLink>
        </>
      )}
    </aside>
  );
};

export default ApprovalSidebar;
