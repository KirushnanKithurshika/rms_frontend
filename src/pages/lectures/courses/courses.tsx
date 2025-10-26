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
import EditCourseDetails from "../../../components/EditCourseDetails/EditCourseDetails";
import { FaEdit, FaTrash, FaInfoCircle, FaArrowLeft } from "react-icons/fa";
import type { Course } from "../../../features/lecturerCourses/course";
import "./courses.css";

const Courses: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Redux state
  const { courses, loading, error } = useAppSelector(
    (state) => state.lecturerCourses
  );
  const userId = useAppSelector(selectUserId);

  // Local state
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // Fetch courses
  useEffect(() => {
    if (userId) {
      dispatch(fetchLecturerCourses(userId));
    }
  }, [dispatch, userId]);

  // Filter courses based on search
  const filteredCourses = courses.filter(
    (c) =>
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Click outside dropdown
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

  // Handlers
  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setUploadedFileName(null);
  };

  const handleBack = () => {
    setSelectedCourse(null);
    setUploadedFileName(null);
  };

  const handleDropdownToggle = (idx: number) => {
    setActiveMenuIndex((prev) => (prev === idx ? null : idx));
  };

  const handleCreateCourse = () => {
    navigate("/createcourseui");
  };

  const openDeleteModal = (course: Course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCourseToDelete(null);
  };

  const confirmDelete = () => {
    // Dispatch delete action here if needed
    closeDeleteModal();
  };

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
          {loading ? (
            <div>Loading courses...</div>
          ) : error ? (
            <div>Error: {error}</div>
          ) : !selectedCourse ? (
            <div className="cardcourse">
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
                            handleDropdownToggle(idx);
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
                              <FaTrash
                                className="iconcard"
                                onClick={() => openDeleteModal(course)}
                              />
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

              <div className="create-course-btn">
                <button onClick={handleCreateCourse}>Create Course +</button>
              </div>
            </div>
          ) : (
            <div className="result-upload-section">
              <div className="card">
                <ResultUploadInterface
                  course={selectedCourse}
                  onBack={handleBack}
                  onFileUpload={(name: string) => setUploadedFileName(name)}
                />
                {uploadedFileName && <FileUploadCard fileName={uploadedFileName} />}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          onClick={closeDeleteModal}
        >
          <div
            className="modal"
            role="document"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            <div className="modal-header">
              <h4 id="delete-title">Delete Course</h4>
              <button className="close-btn" aria-label="Close" onClick={closeDeleteModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                {courseToDelete ? (
                  <>
                    Are you sure you want to delete{" "}
                    <strong>
                      {courseToDelete.code} — {courseToDelete.title}
                    </strong>
                    ?
                  </>
                ) : (
                  "Are you sure you want to delete this course?"
                )}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-delete danger" onClick={confirmDelete}>
                Delete
              </button>
              <button className="btn-delete ghost" onClick={closeDeleteModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
