import { useState } from 'react';
import Navbarin from '../../../components/Navbar/navbarin.tsx';
import LectureSidebar from '../../../components/sidebarlecturer/coursesidebar.tsx';
import BreadcrumbNav from '../../../components/breadcrumbnav/breadcrumbnav.tsx';
import ResultsPreview from '../../../components/resultsPreview/resultspreview.tsx';
import './resultspreviewpage.css'
type ResultStatus = 'UPLOADED' | 'PENDING';

type CourseResultStatus = {
  id: number;
  courseCode: string;
  courseName: string;
  caStatus: ResultStatus;
  finalStatus: ResultStatus;
};

const mockCourseResults: CourseResultStatus[] = [
  {
    id: 1,
    courseCode: 'EE8263',
    courseName: 'Secure Results Management Systems',
    caStatus: 'UPLOADED',
    finalStatus: 'UPLOADED',
  },
  {
    id: 2,
    courseCode: 'CS8201',
    courseName: 'Data Structures & Algorithms',
    caStatus: 'UPLOADED',
    finalStatus: 'PENDING',
  },
  {
    id: 3,
    courseCode: 'EE8212',
    courseName: 'Optimization Techniques for Engineers',
    caStatus: 'PENDING',
    finalStatus: 'PENDING',
  },
];

const ResultsPreviewPage = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);


  const [courseResults, setCourseResults] = useState<CourseResultStatus[]>(mockCourseResults);

  const handleBackdropClick = () => setSidebarOpen(false);

  const handleSendForApproval = (courseId: number) => {
    const course = courseResults.find((c) => c.id === courseId);
    if (!course) return;

    
    console.log('Send for approval clicked for:', course.courseCode);

    alert(
      `Final results for ${course.courseCode} - ${course.courseName} have been sent for approval (stub action).`
    );
  };

  return (
    <div className="lec-dashboard-container">
      <div className="nav">
        <Navbarin />
      </div>

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
          <div className="dashboard-cards-preview">
            <div className="cardcourse">
              {/* ---- Uploaded Results Status Block ---- */}
              <div className="Uploaded-results-status">
                <div className="uploaded-header">
                  <h2 className="uploaded-title">Your Course Results Status</h2>
                  <p className="uploaded-subtitle">
                    Check CA and Final results status for each course. If final results are uploaded,
                    you can send them for approval to the Head of the Department.
                  </p>
                </div>

                <div className="uploaded-course-list">
                  {courseResults.length === 0 && (
                    <p className="uploaded-empty-text">
                      No courses found. Please ensure your courses are assigned to your account.
                    </p>
                  )}

                  {courseResults.map((course) => (
                    <div key={course.id} className="uploaded-course-card">
                      <div className="uploaded-course-header">
                        <div>
                          <div className="uploaded-course-code">{course.courseCode}</div>
                          <div className="uploaded-course-name">{course.courseName}</div>
                        </div>
                      </div>

                      <div className="uploaded-status-row">
                        <div className="uploaded-status-item">
                          <span className="uploaded-status-label">CA Results</span>
                          <span
                            className={`uploaded-status-badge ${
                              course.caStatus === 'UPLOADED' ? 'status-uploaded' : 'status-pending'
                            }`}
                          >
                            {course.caStatus === 'UPLOADED' ? 'Uploaded' : 'Pending'}
                          </span>
                        </div>

                        <div className="uploaded-status-item">
                          <span className="uploaded-status-label">Final Results</span>
                          <span
                            className={`uploaded-status-badge ${
                              course.finalStatus === 'UPLOADED'
                                ? 'status-uploaded'
                                : 'status-pending'
                            }`}
                          >
                            {course.finalStatus === 'UPLOADED' ? 'Uploaded' : 'Pending'}
                          </span>
                        </div>

                        <div className="uploaded-actions">
                          {course.finalStatus === 'UPLOADED' ? (
                            <button
                              type="button"
                              className="btn-send-approval"
                              onClick={() => handleSendForApproval(course.id)}
                            >
                              Send for approval
                            </button>
                          ) : (
                            <span className="text-hint">
                              Upload final results to enable approval.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ---- Existing Results Preview ---- */}
              <div className="rp-page">
                <ResultsPreview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPreviewPage;
