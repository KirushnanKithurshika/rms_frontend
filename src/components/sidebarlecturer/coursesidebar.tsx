import React, { useState } from 'react';
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
      </button>

      {(sidebarState === 'expanded' || sidebarState === 'collapsed') && (
        <>
          <div className="sidebar-divider" />

          <div className="sidebar-item">
            <FaHome className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Dashboard</span>}
          </div>

          <div className="sidebar-item clickable" onClick={() => setCoursesExpanded(!coursesExpanded)}>
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

          <div className="sidebar-item">
            <FaPlusCircle className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Create Course</span>}
          </div>

          <div className="sidebar-item">
            <FaChartBar className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Results Analysis</span>}
          </div>

          <div className="sidebar-item">
            <FaPencilAlt className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Modify Results</span>}
          </div>

          <div className="sidebar-item">
            <FaEye className="sidebar-icon" />
            {sidebarState === 'expanded' && <span>Results Preview</span>}
          </div>

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

export default LectureSidebar;
