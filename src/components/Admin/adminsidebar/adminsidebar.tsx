import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

import {
  FaHome,
  FaUsers,
  FaUserGraduate,
  FaChartBar,
  FaUserShield,
  FaFileAlt,
  FaGavel,
  FaMoneyBillAlt,
  FaBuilding,
  FaBullhorn,
  FaChevronLeft,
  FaChevronRight,
  FaScroll,     
  FaUniversity     
} from 'react-icons/fa';

type SidebarState = 'expanded' | 'collapsed' | 'hidden';

const AdminSidebar: React.FC = () => {
  const [sidebarState, setSidebarState] = useState<SidebarState>('expanded');

  const handleToggle = () => {
    setSidebarState(prev =>
      prev === 'expanded' ? 'collapsed' :
      prev === 'collapsed' ? 'hidden' :
      'expanded'
    );
  };

  return (
    <div className={`course-sidebar ${sidebarState}`}>
      <button className="sidebar-toggle-btn" onClick={handleToggle}>
        {sidebarState === 'hidden' ? <FaChevronRight /> : <FaChevronLeft />}
        {sidebarState !== 'expanded' && (
          <div className="mobile-sidebar-backdrop" onClick={handleToggle}></div>
        )}
      </button>

      {(sidebarState === 'expanded' || sidebarState === 'collapsed') && (
        <>
          <div className="sidebar-divider" />

          <NavLink to="/admin/dashboard" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <FaHome className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Dashboard</span>}
          </NavLink>

          <NavLink to="/admin/user-management" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <FaUsers className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>User Management</span>}
          </NavLink>

          <NavLink to="/admin/student-management" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <FaUserGraduate className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Student Management</span>}
          </NavLink>

          <NavLink to="/admin/results-management" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <FaChartBar className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Results Management</span>}
          </NavLink>

      
          <NavLink to="/admin/transcript-requests" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <FaScroll className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Transcript Requests </span>}
          </NavLink>

             <NavLink to="/admin/academicsetup" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <FaUniversity className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Academic Setup </span>}
          </NavLink>

          <NavLink to="/admin/role-management" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <FaUserShield className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Role &amp; Management</span>}
          </NavLink>

          <NavLink to="/admin/audit-logs" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <FaFileAlt className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Audit Logs</span>}
          </NavLink>

          <NavLink to="/admin/disciplinary-cases" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <FaGavel className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Disciplinary Cases</span>}
          </NavLink>

          <NavLink to="/admin/fees" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <FaMoneyBillAlt className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Fee &amp; Dues Management</span>}
          </NavLink>

          <NavLink to="/admin/department-control" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <FaBuilding className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Department Control Panel</span>}
          </NavLink>

          <NavLink to="/admin/Announcement" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <FaBullhorn className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Announcement</span>}
          </NavLink>
        </>
      )}
    </div>
  );
};

export default AdminSidebar;
