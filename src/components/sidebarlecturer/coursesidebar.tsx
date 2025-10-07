import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './coursesidebar.css';
import {
  FaPlusCircle,
  FaChartBar,
  FaPencilAlt,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaHome,
  FaAngleDown,
  FaAngleRight,
  FaBookOpen,
  FaBook,
  FaInfoCircle,
  FaComments,
  FaBullhorn,
} from 'react-icons/fa';

type SidebarState = 'expanded' | 'collapsed' | 'hidden';

const LectureSidebar: React.FC = () => {
  const [sidebarState, setSidebarState] = useState<SidebarState>('collapsed');
  const [coursesExpanded, setCoursesExpanded] = useState(false);

  const courseList = [
    { code: 'EC7201', name: 'Information Security' },
    { code: 'EE7001', name: 'Research & Methodology' },
    { code: 'CS6103', name: 'Machine Learning' },
  ];

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
        {sidebarState !== 'expanded' && <div className="mobile-sidebar-backdrop" onClick={handleToggle}></div>}
      </button>

      {(sidebarState === 'expanded' || sidebarState === 'collapsed') && (
        <>
          <div className="sidebar-divider" />

          <NavLink to="/lecturerhome" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <FaHome className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Dashboard</span>}
          </NavLink>

        <NavLink
  to="/courses"
  className={({ isActive }) => `sidebar-item clickable ${isActive ? 'active' : ''}`}
  onClick={() => setCoursesExpanded(!coursesExpanded)}
>
  <FaBookOpen className="sidebar-icon" />
  {sidebarState === 'expanded' && (
    <>
      <div className="sidebar-label">Courses</div>
      <div className="tree-toggle-icon">
        {coursesExpanded ? <FaAngleDown /> : <FaAngleRight />}
      </div>
    </>
  )}
</NavLink>

          {coursesExpanded && sidebarState === 'expanded' && (
            <div className="sidebar-tree">
              {courseList.map((course, idx) => (
                <div key={idx} className="tree-item">
                  <FaBook className="tree-icon" />
                  <span>{course.code} - {course.name}</span>
                </div>
              ))}
            </div>
          )}

          <NavLink to="/createcourseui" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <FaPlusCircle className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Create Course</span>}
          </NavLink>

          <NavLink to="/results-analysis" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <FaChartBar className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Results Analysis</span>}
          </NavLink>

          <NavLink to="/modify-results" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <FaPencilAlt className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Modify Results</span>}
          </NavLink>

          <NavLink to="/results-preview" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <FaEye className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Results Preview</span>}
          </NavLink>

          <NavLink to="/course-details" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <FaInfoCircle className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Course Details</span>}
          </NavLink>

          <NavLink to="/student-enquiries" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <FaComments className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Student Enquiries</span>}
          </NavLink>

          <NavLink to="/announcements" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <FaBullhorn className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Announcements</span>}
          </NavLink>
        </>
      )}
    </div>
  );
};

export default LectureSidebar;
