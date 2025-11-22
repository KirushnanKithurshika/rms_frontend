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
import api from "../../../services/api";
import FileUploadCard from "../../../components/fileuploadcard/fileuploadcard.tsx";
import EditCourseDetails from "../../../components/EditCourseDetails/EditCourseDetails.tsx";
import {
  FaEdit,
  FaTrash,
  FaInfoCircle,
  FaArrowLeft,
  FaEllipsisV,
} from "react-icons/fa";

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
  const [lecturerId, setLecturerId] = useState<number | null>(null);
  const [allocationId, setAllocationId] = useState<number | null>(null);
  type AssessmentRow = {
    id?: number;
    title: string;
    group: "CA" | "END_EXAM";
    maxMarks?: number;
    weight?: number;
    date?: string;
  };
  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [loadingAssess, setLoadingAssess] = useState(false);
  const [selectedAssessment, setSelectedAssessment] =
    useState<AssessmentRow | null>(null);
  const loadedForCourseRef = useRef<string | null>(null);

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
  const handleGoToUpload = (a?: AssessmentRow) => {
    if (detailsCourse) {
      setSelectedCourse(detailsCourse);
      setSelectedAssessment(a ?? null);
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

  // Load lecturerId
  useEffect(() => {
    const mapLecturer = async () => {
      if (!userId) return;
      try {
        const r = await api.get(`/v1/lecturers/GetByUserId/${userId}`);
        const d = r.data?.data ?? r.data;
        setLecturerId(Number(d?.id) || null);
      } catch {}
    };
    mapLecturer();
  }, [userId]);

  // When a course is selected, resolve allocation and assessments
  useEffect(() => {
    const load = async () => {
      if (!detailsCourse || !lecturerId) return;
      if (loadedForCourseRef.current === detailsCourse.code) return; // prevent refetch loop
      loadedForCourseRef.current = detailsCourse.code; // lock for this course code
      setLoadingAssess(true);
      try {
        // fetch allocations for lecturer and find matching course
        const res = await api.get(`../lecturers/${lecturerId}/allocations`);
        const all = (res.data?.data ?? res.data) as any[];
        const match = (all || []).find(
          (a) =>
            a.course?.courseCode === detailsCourse.code ||
            a.course?.id === (detailsCourse as any)?.id
        );
        const allocId = match?.allocationId ?? null;
        setAllocationId(allocId);
        // Prefill semester from allocation and enrich course details
        if (match?.semester?.name) {
          setDetailsCourse((prev) =>
            prev ? { ...prev, semester: match.semester.name } : prev
          );
        }
        try {
          const cr = await api.get(
            `/v1/courses/GetByCode/${encodeURIComponent(detailsCourse.code)}`
          );
          const cd = cr.data?.data ?? cr.data;
          setDetailsCourse((prev) =>
            prev
              ? {
                  ...prev,
                  credits: cd?.credits ?? prev.credits,
                  department: cd?.departmentName ?? prev.department,
                }
              : prev
          );
        } catch {}
        const rows: AssessmentRow[] = [];
        if (allocId) {
          // CA list via preview
          try {
            const r = await api.get(`../results/preview`, {
              params: {
                allocationId: allocId,
                type: "CA",
                page: 0,
                size: 1,
                includeMeta: true,
              },
            });
            const header = (r.data?.data ?? r.data)?.header;
            const cas = Array.isArray(header?.assessments)
              ? header.assessments
              : [];
            // hydrate each by id for rich details
            for (const a of cas) {
              try {
                const ax = await api.get(
                  `/v1/assessments/GetById/${a.assessmentId}`
                );
                const ad = ax.data?.data ?? ax.data;
                rows.push({
                  id: ad?.id ?? a.assessmentId,
                  title: ad?.title ?? a.title,
                  group: "CA",
                  maxMarks: ad?.maxMarks ?? a.maxMarks,
                  weight: ad?.weight ?? a.weight,
                  date: ad?.date ?? a.date,
                });
              } catch {
                rows.push({
                  id: a.assessmentId,
                  title: a.title,
                  group: "CA",
                  maxMarks: a.maxMarks,
                  weight: a.weight,
                  date: a.date,
                });
              }
            }
          } catch {}
          // End exam info (best-effort from preview)
          try {
            const r2 = await api.get(`../results/preview`, {
              params: {
                allocationId: allocId,
                type: "END_EXAM",
                page: 0,
                size: 1,
                includeMeta: true,
              },
            });
            const h2 = (r2.data?.data ?? r2.data)?.header;
            const cas = Array.isArray(h2?.assessments) ? h2.assessments : [];
            for (const a of cas) {
              try {
                const ax = await api.get(
                  `/v1/assessments/GetById/${a.assessmentId}`
                );
                const ad = ax.data?.data ?? ax.data;
                rows.push({
                  id: ad?.id ?? a.assessmentId,
                  title: ad?.title ?? a.title,
                  group: ad?.group ?? a.group,
                  maxMarks: ad?.maxMarks ?? a.maxMarks,
                  weight: ad?.weight ?? a.weight,
                  date: ad?.date ?? a.date,
                });
              } catch {
                rows.push({
                  id: a.assessmentId,
                  title: a.title,
                  group: a?.group,
                  maxMarks: a.maxMarks,
                  weight: a.weight,
                  date: a.date,
                });
              }
            }
          } catch {}
        }
        setAssessments(rows);
      } finally {
        setLoadingAssess(false);
      }
    };
    load();
  }, [detailsCourse, lecturerId]);

  // --- Close modal on Escape ---
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
                        key={`${course.code}-${idx}`}
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
                            <FaEllipsisV className="eclipse" />
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

                  <div className="cd-item cd-span-2">
                    <div className="cd-k">Description</div>
                    <div className="cd-v">
                      {detailsCourse.description ?? "-"}
                    </div>
                  </div>
                </div>

                {/* Assessments list for upload */}
                <div style={{ marginTop: 16 }}>
                  <h4 className="cd-title">Assessments</h4>
                  {loadingAssess ? (
                    <div>Loading assessments…</div>
                  ) : assessments.length === 0 ? (
                    <div>No assessments found.</div>
                  ) : (
                    <div className="rp-table-wrap">
                      <table className="rp-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Group</th>
                            <th>Title</th>
                            <th>Max</th>
                            <th>Weight %</th>
                            <th>Date</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assessments.map((a, idx) => (
                            <tr key={(a.id ?? `${a.group}-${idx}`).toString()}>
                              <td>{idx + 1}</td>
                              <td>{a.group}</td>
                              <td>{a.title}</td>
                              <td>{a.maxMarks ?? "-"}</td>
                              <td>{a.weight ?? "-"}</td>
                              <td>{a.date ?? "-"}</td>
                              <td>
                                <button
                                  className="cd-btn primary"
                                  onClick={() => handleGoToUpload(a)}
                                >
                                  Upload
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
              {/* <div className="details-actions">
                <button className="cd-btn primary" onClick={() => handleGoToUpload(undefined)}>
                  Upload Results
                </button>
              </div> */}
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
                  allocationId={allocationId}
                  assessment={selectedAssessment}
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
