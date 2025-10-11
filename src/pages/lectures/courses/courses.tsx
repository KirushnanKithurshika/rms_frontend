import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchLecturerCourses } from "../../../features/lecturerCourses/lecturerCoursesSlice";
import { selectUserId } from "../../../features/auth/selectors";
import Navbarin from "../../../components/Navbar/navbarin";
import LectureSidebar from "../../../components/sidebarlecturer/coursesidebar";
import BreadcrumbNav from "../../../components/breadcrumbnav/breadcrumbnav";
import ResultUploadInterface from "../../../components/resultuploadinterface/ResultUploadInterface";
import FileUploadCard from "../../../components/fileuploadcard/fileuploadcard";
import { FaEdit, FaTrash, FaInfoCircle } from "react-icons/fa";
import "./courses.css";
import type { Course } from "../../../features/lecturerCourses/course";

const Courses: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // ✅ Redux state
  const { courses, loading, error } = useAppSelector(
    (state) => state.lecturerCourses
  );
  const userId = useAppSelector(selectUserId);

  // ✅ Local state
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);

  // ✅ Fetch lecturer’s courses on mount
  useEffect(() => {
    if (userId) {
      dispatch(fetchLecturerCourses(userId));
    }
  }, [dispatch, userId]);

  // ✅ No need for .data anymore
  const filteredCourses = courses.filter(
    (c) =>
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Handle click outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveMenuIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Event Handlers
  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setUploadedFileName(null);
  };

  const handleCreateCourse = () => navigate("/createcourseui");

  return (
    <div className="lec-dashboard-container">
      {/* Navbar */}
      <div className="nav">
        <Navbarin />
      </div>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <BreadcrumbNav />
      </div>

      {/* Sidebar + Main */}
      <div className="main-area">
        <div className={`sidebar ${isSidebarOpen ? "active" : ""}`}>
          <LectureSidebar />
        </div>

        <div className="dashboard-content">
          {/* Loading / Error / Main content */}
          {loading ? (
            <div>Loading courses...</div>
          ) : error ? (
            <div>Error: {error}</div>
          ) : !selectedCourse ? (
            <div className="cardcourse">
              {/* Header */}
              <div className="courses-header">
                <h3>Courses</h3>
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Search Courses"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Course Cards */}
              <div className="dashboard-cardscourse">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course, idx) => (
                    <div
                      className="course-card"
                      key={course.id ?? idx}
                      onClick={() => handleCourseClick(course)}
                    >
                      <div className="card-top">
                        <div
                          className="card-options"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuIndex(
                              activeMenuIndex === idx ? null : idx
                            );
                          }}
                        >
                          ⋮
                        </div>

                        {activeMenuIndex === idx && (
                          <div className="card-dropdown" ref={dropdownRef}>
                            <div className="dropdown-item">
                              <FaEdit className="iconcard" />
                            </div>
                            <div className="dropdown-item">
                              <FaTrash className="iconcard" />
                            </div>
                            <div className="dropdown-item">
                              <FaInfoCircle className="iconcard" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="cardcourse-details">
                        <div className="course-code">{course.code}</div>
                        <div className="course-title">{course.title}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div>No courses found.</div>
                )}
              </div>

              {/* Create Course Button */}
              <div className="create-course-btn">
                <button onClick={handleCreateCourse}>Create Course +</button>
              </div>
            </div>
          ) : (
            // ✅ Selected Course View
            <div className="result-upload-section">
              <ResultUploadInterface
                course={selectedCourse}
                onBack={() => setSelectedCourse(null)}
                onFileUpload={(name: string) => setUploadedFileName(name)}
              />
              {uploadedFileName && (
                <FileUploadCard fileName={uploadedFileName} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;
