import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchLecturerCourses } from "../../../features/lecturerCourses/lecturerCoursesSlice";
import { selectUserId } from "../../../features/auth/selectors";

import LectureSidebar from "../../../components/sidebarlecturer/coursesidebar";
import BreadcrumbNav from "../../../components/breadcrumbnav/breadcrumbnav";

import "./courses.css";
import type { Course } from "../../../features/lecturerCourses/course";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbarin from "../../../components/Navbar/navbarin.tsx";
import ResultUploadInterface from "../../../components/resultuploadinterface/ResultUploadInterface.tsx";
import FileUploadCard from "../../../components/fileuploadcard/fileuploadcard.tsx";
import EditCourseDetails from "../../../components/EditCourseDetails/EditCourseDetails.tsx";
import { FaEdit, FaTrash, FaInfoCircle, FaArrowLeft } from "react-icons/fa";

// Extend Course with optional fields used in this view
type CourseEx = Course & {
  credits?: number;
  department?: string;
  semester?: string;
  coordinator?: string;
  academicYear?: string;
  degreeProgram?: string;
  description?: string;
};

type ViewMode = "list" | "details" | "upload" | "edit";

const Courses: React.FC = () => {
  const dispatch = useAppDispatch();

  // âœ… Redux state
  const {
    courses: coursesData = [],
    loading,
    error,
  } = useAppSelector((state) => state.lecturerCourses);
  const userId = useAppSelector(selectUserId);

  // âœ… Local state
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [view, setView] = useState<ViewMode>("list");
  const [detailsCourse, setDetailsCourse] = useState<CourseEx | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseEx | null>(null);
  const [editCourse, setEditCourse] = useState<CourseEx | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);

  // âœ… Fetch lecturerâ€™s courses on mount
  useEffect(() => {
    if (userId) {
      dispatch(fetchLecturerCourses(userId));
    }
  }, [dispatch, userId]);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const navigate = useNavigate();


  const handleDropdownToggle = (idx: number) =>
    setActiveMenuIndex((prev) => (prev === idx ? null : idx));
  const openDeleteModal = (course: Course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
    setActiveMenuIndex(null);
  };
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCourseToDelete(null);
  };
  const confirmDelete = () => {
    if (!courseToDelete) return;
    if (
      detailsCourse?.code === courseToDelete.code ||
      selectedCourse?.code === courseToDelete.code ||
      editCourse?.code === courseToDelete.code
    ) {
      setView("list");
      setDetailsCourse(null);
      setSelectedCourse(null);
      setEditCourse(null);
      setUploadedFileName(null);
    }
    closeDeleteModal();
  };

  const handleBackdropClick = () => setSidebarOpen(false);

  // --- Search ---
  const filteredCourses = coursesData.filter(
    (course) =>
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCourseClick = (course: Course) => {
    setDetailsCourse(course);
    setView("details");
    setUploadedFileName(null);
  };
  const handleBackToList = () => {
    setView("list");
    setDetailsCourse(null);
    setSelectedCourse(null);
    setEditCourse(null);
    setUploadedFileName(null);
  };
  const handleGoToUpload = () => {
    if (detailsCourse) {
      setSelectedCourse(detailsCourse);
      setView("upload");
    }
  };
  const handleCreateCourse = () => navigate("/createcourseui");

 
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      )
        setActiveMenuIndex(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  
  useEffect(() => {
    if (!showDeleteModal) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && closeDeleteModal();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showDeleteModal]);

  return (
    <div className="lec-dashboard-container">
      <div className="nav">
        <Navbarin />
      </div>
      <div className="breadcrumb">
        <BreadcrumbNav />
      </div>
      <div
        className={`sidebar-backdrop ${isSidebarOpen ? "active" : ""}`}
        onClick={handleBackdropClick}
      ></div>

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
          ) : (
            view === "list" && (
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
                    <button type="submit" aria-label="Search" title="Search">
                      <i className="fa fa-search" aria-hidden="true"></i>
                    </button>
                  </div>
                </div>

                {/* Course Cards */}
                <div className="dashboard-cardscourse">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course, idx) => (
                      <div
                        className="course-card"
                        key={course.id}
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
                              e.stopPropagation();
                              handleDropdownToggle(idx);
                            }}
                          >
                            â‹®
                          </div>

                          {activeMenuIndex === idx && (
                            <div
                              className="card-dropdown"
                              ref={dropdownRef}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div
                                className="dropdown-item"
                                onClick={() => {
                                  setEditCourse(course);
                                  setView("edit");
                                  setActiveMenuIndex(null);
                                }}
                              >
                                <FaEdit className="iconcard" />
                              </div>
                              <div
                                className="dropdown-item"
                                onClick={() => openDeleteModal(course)}
                              >
                                <FaTrash className="iconcard" />
                              </div>
                              <div
                                className="dropdown-item"
                                onClick={() => {
                                  setDetailsCourse(course);
                                  setView("details");
                                  setActiveMenuIndex(null);
                                }}
                              >
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
            )
          )}

          {/* --- Course Details --- */}
          {view === "details" && detailsCourse && (
            <div className="details-view card">
              <div className="details-header">
                <button
                  className="back-btn"
                  onClick={handleBackToList}
                  aria-label="Go back"
                  title="Go back"
                >
                  <FaArrowLeft style={{ marginRight: 8 }} aria-hidden="true" />
                </button>
                <div>
                  <h3 className="cd-title">
                    {detailsCourse.code} - {detailsCourse.title}
                  </h3>
                  {detailsCourse.academicYear && (
                    <div className="cd-subtitle">
                      Academic Year: {detailsCourse.academicYear}
                    </div>
                  )}
                </div>
              </div>
              <div className="cd-body">
                <div className="cd-grid">
                  <div className="cd-item">
                    <div className="cd-k">Department</div>
                    <div className="cd-v">
                      {detailsCourse.department ?? "-"}
                    </div>
                  </div>
                  <div className="cd-item">
                    <div className="cd-k">Semester</div>
                    <div className="cd-v">{detailsCourse.semester ?? "-"}</div>
                  </div>
                  <div className="cd-item">
                    <div className="cd-k">Credits</div>
                    <div className="cd-v">{detailsCourse.credits ?? "-"}</div>
                  </div>
                  <div className="cd-item">
                    <div className="cd-k">Coordinator</div>
                    <div className="cd-v">
                      {detailsCourse.coordinator ?? "-"}
                    </div>
                  </div>
                  <div className="cd-item">
                    <div className="cd-k">Degree Program</div>
                    <div className="cd-v">
                      {detailsCourse.degreeProgram ?? "-"}
                    </div>
                  </div>
                  <div className="cd-item cd-span-2">
                    <div className="cd-k">Description</div>
                    <div className="cd-v">
                      {detailsCourse.description ?? "-"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="details-actions">
                <button className="cd-btn primary" onClick={handleGoToUpload}>
                  Upload Results
                </button>
              </div>
            </div>
          )}

          {/* --- Result Upload --- */}
          {view === "upload" && selectedCourse && (
            // âœ… Selected Course View
            <div className="result-upload-section">
              <div className="card">
                <div className="details-header">
                  <button
                    className="back-btn"
                    onClick={handleBackToList}
                    aria-label="Go back"
                    title="Go back"
                  >
                    <FaArrowLeft
                      style={{ marginRight: 8 }}
                      aria-hidden="true"
                    />
                  </button>
                  <div>
                    <h3 className="cd-title">
                      Upload Results - {selectedCourse.code} -{" "}
                      {selectedCourse.title}
                    </h3>
                  </div>
                </div>
                <ResultUploadInterface
                  course={selectedCourse}
                  onBack={handleBackToList}
                  onFileUpload={(name: string) => setUploadedFileName(name)}
                />
                {uploadedFileName && (
                  <FileUploadCard fileName={uploadedFileName} />
                )}
              </div>
            </div>
          )}

          {/* --- Edit Course --- */}
          {view === "edit" && editCourse && (
            <div className="edit-course-section card">
              <button
                className="back-btn"
                onClick={handleBackToList}
                aria-label="Go back"
                title="Go back"
              >
                <FaArrowLeft style={{ marginRight: 8 }} aria-hidden="true" />
              </button>
              <EditCourseDetails
                key={editCourse?.id ?? editCourse?.code} // ensures clean remount on course change
                initial={editCourse ?? undefined}
                onUpdate={(updatedCourse) => {
                  // If you track the same object in details, merge ID if missing
                  const normalized = {
                    ...(detailsCourse ?? {}),
                    ...updatedCourse,
                    id: updatedCourse.id ?? detailsCourse?.id,
                  } as CourseEx;

                  setView("details");
                  setDetailsCourse(normalized); 
                  setEditCourse(null);
                }}
                onCancel={() => {
                  setView("details");
                  setEditCourse(null);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* --- Delete Modal --- */}
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
              <button
                className="close-btn"
                aria-label="Close"
                onClick={closeDeleteModal}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-body">
                {courseToDelete ? (
                  <>
                    Are you sure you want to delete{" "}
                    <strong>
                      {courseToDelete.code} - {courseToDelete.title}
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
