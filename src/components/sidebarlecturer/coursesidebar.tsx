import React, { useState, useEffect } from 'react';
import './CourseSidebar.css';
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

const CourseSidebar: React.FC = () => {
  const [sidebarState, setSidebarState] = useState<SidebarState>('expanded');
  const [coursesExpanded, setCoursesExpanded] = useState(false);

  const courseList = [
    { code: 'EC7201', name: 'Information Security' },
    { code: 'EE7001', name: 'Research & Methodology' },
    { code: 'CS6103', name: 'Machine Learning' },
  ];

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
      {/* Toggle Button */}
      <button className="sidebar-toggle-btn" onClick={handleToggle}>
        {sidebarState === 'hidden' ? <FaChevronRight /> : <FaChevronLeft />}
      </button>

      {/* Course Title */}
      {sidebarState === 'expanded' && (
        <div className="course-title">EC7201 - Information Security</div>
      )}
      {sidebarState === 'collapsed' && (
        <h1 className="course-collapsed-title">EC7201</h1>
      )}

      {(sidebarState === 'expanded' || sidebarState === 'collapsed') && (
        <>
          <div className="sidebar-divider" />

          {/* Dashboard */}
          <div className="sidebar-item">
            <FaHome className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Dashboard</span>}
          </div>

          {/* Courses Toggle */}
          <div
            className="sidebar-item clickable"
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
          </div>

          {/* TreeView: Course List */}
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

          {/* Create Course */}
          <div className="sidebar-item">
            <FaPlusCircle className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Create Course</span>}
          </div>

          {/* Results Analysis */}
          <div className="sidebar-item">
            <FaChartBar className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Results Analysis</span>}
          </div>

          {/* Modify Results */}
          <div className="sidebar-item">
            <FaPencilAlt className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Modify Results</span>}
          </div>

          {/* Preview Results */}
          <div className="sidebar-item">
            <FaEye className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Results Preview</span>}
          </div>

          {/* Course Details (active by default) */}
          <div className="sidebar-item active">
            <FaInfoCircle className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Course Details</span>}
          </div>
          
          <div className="sidebar-item">
            <FaComments className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Student Enquiries</span>}
          </div>

         
          <div className="sidebar-item">
            <FaBullhorn className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Announcements</span>}
          </div>

        </>
      )}
    </div>
  );
};

export default CourseSidebar;
