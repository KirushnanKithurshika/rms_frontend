import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbarin from '../../../components/Navbar/navbarin.tsx';
import './courses.css';
import LectureSidebar from '../../../components/sidebarlecturer/coursesidebar.tsx';
import BreadcrumbNav from '../../../components/breadcrumbnav/breadcrumbnav.tsx';
import ResultUploadInterface from '../../../components/resultuploadinterface/ResultUploadInterface.tsx';
import FileUploadCard from '../../../components/fileuploadcard/fileuploadcard.tsx';
import { FaEdit, FaTrash, FaInfoCircle, FaArrowLeft } from 'react-icons/fa';

interface Course {
  code: string;
  title: string;
  credits?: number;
  department?: string;
  semester?: string;
  coordinator?: string;
  academicYear?: string;
  degreeProgram?: string;
  description?: string;
}

const courseData: Course[] = [
  { code: 'EE7001', title: 'Research & Methodology', credits: 2, department: 'Electrical Engineering', semester: 'Semester 1', coordinator: 'Dr. A. R. Silva', academicYear: '2024/2025', degreeProgram: 'MSc/PGDip in EE', description: 'Covers research design, literature surveys, data collection methods, and academic writing for engineering research.' },
  { code: 'EE7002', title: 'Machine Learning', credits: 3, department: 'Electrical Engineering', semester: 'Semester 1', coordinator: 'Dr. N. Jay', academicYear: '2024/2025', degreeProgram: 'MSc/PGDip in EE', description: 'Supervised/unsupervised learning, model evaluation, regularization, neural networks, and practical labs in Python.' },
  { code: 'EE7003', title: 'Data Structures', credits: 3, department: 'Electrical Engineering', semester: 'Semester 2', coordinator: 'Prof. P. Wick', academicYear: '2024/2025', degreeProgram: 'MSc/PGDip in EE', description: 'Abstract data types, trees, graphs, hashing, and performance; assignments focused on C++ implementations.' },
  { code: 'EE7004', title: 'Database Systems', credits: 3, department: 'Electrical Engineering', semester: 'Semester 2', coordinator: 'Dr. S. Fernando', academicYear: '2024/2025', degreeProgram: 'MSc/PGDip in EE', description: 'Relational modeling, SQL, transactions, indexing, query optimization, and a mini-project using PostgreSQL.' },
  { code: 'EE7005', title: 'Computer Networks', credits: 3, department: 'Electrical Engineering', semester: 'Semester 2', coordinator: 'Eng. M. Perera', academicYear: '2024/2025', degreeProgram: 'MSc/PGDip in EE', description: 'OSI/TCP-IP, routing, congestion control, WLAN, network security; packet labs with Wireshark.' },
  { code: 'EE7006', title: 'Artificial Intelligence', credits: 3, department: 'Electrical Engineering', semester: 'Semester 2', coordinator: 'Dr. K. Raj', academicYear: '2024/2025', degreeProgram: 'MSc/PGDip in EE', description: 'Search, planning, reasoning, knowledge representation, and intro to deep learning with practical exercises.' },
];

type ViewMode = 'list' | 'details' | 'upload';

const Courses: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // use local state so we can delete
  const [courses, setCourses] = useState<Course[]>(courseData);

  // view state
  const [view, setView] = useState<ViewMode>('list');
  const [detailsCourse, setDetailsCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // dropdown
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

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
    setCourses(prev => prev.filter(c => c.code !== courseToDelete.code));
    // if the deleted one is currently in a view, go back to list
    if (detailsCourse?.code === courseToDelete.code || selectedCourse?.code === courseToDelete.code) {
      setView('list');
      setDetailsCourse(null);
      setSelectedCourse(null);
      setUploadedFileName(null);
    }
    closeDeleteModal();
  };

  const handleBackdropClick = () => setSidebarOpen(false);

  const filteredCourses = courses.filter(course =>
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCourseClick = (course: Course) => {
    setDetailsCourse(course);
    setView('details');
    setUploadedFileName(null);
  };

  const handleBackToList = () => {
    setView('list');
    setDetailsCourse(null);
    setSelectedCourse(null);
    setUploadedFileName(null);
  };

  const handleGoToUpload = () => {
    if (detailsCourse) {
      setSelectedCourse(detailsCourse);
      setView('upload');
    }
  };

  const handleDropdownToggle = (idx: number) => {
    setActiveMenuIndex(prev => (prev === idx ? null : idx));
  };

  const navigate = useNavigate();
  const handleCreateCourse = () => navigate('/createcourseui');

 
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveMenuIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  useEffect(() => {
    if (!showDeleteModal) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeDeleteModal();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showDeleteModal]);

  return (
    <div className="lec-dashboard-container">
      <div className="nav"><Navbarin /></div>

      <div className="breadcrumb">
        <BreadcrumbNav />
      </div>

      <div
        className={`sidebar-backdrop ${isSidebarOpen ? 'active' : ''}`}
        onClick={handleBackdropClick}
      ></div>

      <div className="main-area">
        <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
          <LectureSidebar />
        </div>

        <div className="dashboard-content">

    
          {view === 'list' && (
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
                  <button><i className="fa fa-search"></i></button>
                </div>
              </div>

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
                          ⋮
                        </div>

                        {activeMenuIndex === idx && (
                          <div
                            className="card-dropdown"
                            ref={dropdownRef}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="dropdown-item" onClick={() => alert('Edit (demo)')}>
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
                                setView('details');
                                setActiveMenuIndex(null);
                              }}
                              role="button"
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

              <div className="create-course-btn">
                <button onClick={handleCreateCourse}>Create Course +</button>
              </div>
            </div>
          )}

          {view === 'details' && detailsCourse && (
            <div className="details-view card">
              <div className="details-header">
                <button className="back-btn" onClick={handleBackToList}>
                  <FaArrowLeft style={{ marginRight: 8 }} />
                </button>
                <div>
                  <h3 className="cd-title">
                    {detailsCourse.code} — {detailsCourse.title}
                  </h3>
                  {detailsCourse.academicYear && (
                    <div className="cd-subtitle">Academic Year: {detailsCourse.academicYear}</div>
                  )}
                </div>
              </div>

              <div className="cd-body" style={{ paddingTop: 0 }}>
                <div className="cd-grid">
                  <div className="cd-item">
                    <div className="cd-k">Department</div>
                    <div className="cd-v">{detailsCourse.department ?? '-'}</div>
                  </div>
                  <div className="cd-item">
                    <div className="cd-k">Semester</div>
                    <div className="cd-v">{detailsCourse.semester ?? '-'}</div>
                  </div>
                  <div className="cd-item">
                    <div className="cd-k">Credits</div>
                    <div className="cd-v">{detailsCourse.credits ?? '-'}</div>
                  </div>
                  <div className="cd-item">
                    <div className="cd-k">Coordinator</div>
                    <div className="cd-v">{detailsCourse.coordinator ?? '-'}</div>
                  </div>
                  <div className="cd-item">
                    <div className="cd-k">Degree Program</div>
                    <div className="cd-v">{detailsCourse.degreeProgram ?? '-'}</div>
                  </div>

                  <div className="cd-item cd-span-2">
                    <div className="cd-k">Description</div>
                    <div className="cd-v">{detailsCourse.description ?? '—'}</div>
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

          {view === 'upload' && selectedCourse && (
            <div className="result-upload-section">
              <div className="card">
                <div className="details-header">
                  <button className="back-btn" onClick={handleBackToList}>
                    <FaArrowLeft style={{ marginRight: 8 }} />
                  </button>
                  <div>
                    <h3 className="cd-title">
                      Upload Results — {selectedCourse.code} — {selectedCourse.title}
                    </h3>
                  </div>
                </div>

                <ResultUploadInterface
                  course={selectedCourse}
                  onBack={handleBackToList}
                  onFileUpload={(name: string) => setUploadedFileName(name)}
                />
                {uploadedFileName && <FileUploadCard fileName={uploadedFileName} />}
              </div>
            </div>
          )}

        </div>
      </div>

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
              <button className="close-btn" aria-label="Close" onClick={closeDeleteModal}>×</button>
            </div>

            <div className="modal-body">
              <p className='modal-body'>
                {courseToDelete
                  ? <>Are you sure you want to delete <strong>{courseToDelete.code} — {courseToDelete.title}</strong>?</>
                  : "Are you sure you want to delete this course?"}
              </p>
            </div>

            <div className="modal-footer">
              <button className="btn-delete danger" onClick={confirmDelete}>Delete</button>

              <button className="btn-delete ghost" onClick={closeDeleteModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
