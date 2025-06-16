import React, { useState, useEffect } from 'react';
import './CourseSidebar.css';
import {
  FaPlus,
  FaChartLine,
  FaEdit,
  FaEye,
  FaListUl,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

type SidebarState = 'expanded' | 'collapsed' | 'hidden';

const CourseSidebar: React.FC = () => {
  const [sidebarState, setSidebarState] = useState<SidebarState>('expanded');

  useEffect(() => {
    if (window.innerWidth <= 500) {
      setSidebarState('collapsed');
    }
  }, []);

  const handleToggle = () => {
    setSidebarState(prev =>
      prev === 'expanded' ? 'collapsed' :
      prev === 'collapsed' ? 'hidden' :
      'expanded'
    );
  };

  return (
    <div className={`course-sidebar ${sidebarState}`}>
      <button
        className="sidebar-toggle-btn"
        onClick={handleToggle}
      >
        {sidebarState === 'hidden' ? <FaChevronRight /> : <FaChevronLeft />}
      </button>

      {sidebarState === 'expanded' && (
        <div className="course-title">EC7201 - Information Security</div>
      )}
      {sidebarState === 'collapsed' && (
        <h1 className="course-collapsed-title">EC7201</h1>
      )}

      {(sidebarState === 'expanded' || sidebarState === 'collapsed') && (
        <div className="sidebar-divider" />
      )}

      {(sidebarState === 'expanded' || sidebarState === 'collapsed') && (
        <>
          <div className="sidebar-item">
            <FaPlus className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Add Results</span>}
          </div>
          <div className="sidebar-item">
            <FaChartLine className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Results Analysis</span>}
          </div>
          <div className="sidebar-item">
            <FaEdit className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Modify Results</span>}
          </div>
          <div className="sidebar-item">
            <FaEye className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Results Preview</span>}
          </div>
          <div className="sidebar-item active">
            <FaListUl className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Course Details</span>}
          </div>
        </>
      )}
    </div>
  );
};

export default CourseSidebar;
