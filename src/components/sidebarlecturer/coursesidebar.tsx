import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./coursesidebar.css";
import {
  FaPlusCircle,
  FaChartBar,
  FaPencilAlt,
  FaChartLine,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaHome,
  FaAngleDown,
  FaAngleRight,
  FaBookOpen,
  FaBook,
  FaUserGraduate,
  FaComments,
  FaBullhorn,
  FaHistory,
} from "react-icons/fa";

type SidebarState = "expanded" | "collapsed" | "hidden";

const LectureSidebar: React.FC = () => {
  const [sidebarState, setSidebarState] = useState<SidebarState>("expanded");
  const [coursesExpanded, setCoursesExpanded] = useState(false);

  const courseList = [
    { code: "EC7201", name: "Information Security" },
    { code: "EE7001", name: "Research & Methodology" },
    { code: "CS6103", name: "Machine Learning" },
  ];

  const handleToggle = () => {
    setSidebarState((prev) =>
      prev === "expanded"
        ? "collapsed"
        : prev === "collapsed"
          ? "hidden"
          : "expanded"
    );
  };


  const handleBackdropClick = () => {
    setSidebarState("hidden");
  };

  return (
    <>
   
      {sidebarState === "expanded" && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={handleBackdropClick}
        />
      )}

      <div className={`course-sidebar ${sidebarState}`}>
        <button className="sidebar-toggle-btn" onClick={handleToggle}>
          {sidebarState === "hidden" ? <FaChevronRight /> : <FaChevronLeft />}
        </button>

        {(sidebarState === "expanded" || sidebarState === "collapsed") && (
          <>
            <div className="sidebar-divider" />

            <NavLink
              to="/lecturerhome"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active" : ""}`
              }
            >
              <FaHome className="sidebar-icon" />
              {sidebarState === "expanded" && <span>Dashboard</span>}
            </NavLink>

            <NavLink
              to="/courses"
              className={({ isActive }) =>
                `sidebar-item clickable ${isActive ? "active" : ""}`
              }
              onClick={() => {
                setCoursesExpanded((prev) => !prev);
              }}
            >
              <FaBookOpen className="sidebar-icon" />
              {sidebarState === "expanded" && (
                <>
                  <div className="sidebar-label">Courses</div>
                  <div className="tree-toggle-icon">
                    {coursesExpanded ? <FaAngleDown /> : <FaAngleRight />}
                  </div>
                </>
              )}
            </NavLink>


            {coursesExpanded && sidebarState === "expanded" && (
              <div className="sidebar-tree">
                {courseList.map((course, idx) => (
                  <div key={idx} className="tree-item">
                    <FaBook className="tree-icon" />
                    <span>
                      {course.code} - {course.name}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <NavLink
              to="/createcourseui"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active" : ""}`
              }
            >
              <FaPlusCircle className="sidebar-icon" />
              {sidebarState === "expanded" && <span>Create Course</span>}
            </NavLink>

            <NavLink
              to="/results-analysis"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active" : ""}`
              }
            >
              <FaChartBar className="sidebar-icon" />
              {sidebarState === "expanded" && <span>Results Analysis</span>}
            </NavLink>

            <NavLink
              to="/modify-results"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active" : ""}`
              }
            >
              <FaPencilAlt className="sidebar-icon" />
              {sidebarState === "expanded" && <span>Modify Results</span>}
            </NavLink>

            <NavLink
              to="/results-preview"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active" : ""}`
              }
            >
              <FaChartLine className="sidebar-icon" />
              {sidebarState === "expanded" && <span>Results Management</span>}
            </NavLink>
            

            <NavLink
              to="/lecturer/student-management"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active" : ""}`
              }
            >
              <FaUserGraduate className="sidebar-icon" />
              {sidebarState === "expanded" && <span>Student Management</span>}
            </NavLink>

            <NavLink
              to="/course-history"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active" : ""}`
              }
            >
              <FaHistory className="sidebar-icon" />
              {sidebarState === "expanded" && <span>History</span>}
            </NavLink>

            <NavLink
              to="/student-enquiries"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active" : ""}`
              }
            >
              <FaComments className="sidebar-icon" />
              {sidebarState === "expanded" && <span>Student Enquiries</span>}
            </NavLink>

            <NavLink
              to="/lec-announcement-page"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active" : ""}`
              }
            >
              <FaBullhorn className="sidebar-icon" />
              {sidebarState === "expanded" && <span>Announcements</span>}
            </NavLink>
          </>
        )}
      </div>
    </>
  );
};

export default LectureSidebar;
