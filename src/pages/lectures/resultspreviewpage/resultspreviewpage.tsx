import { useEffect, useState } from 'react';
import Navbarin from '../../../components/Navbar/navbarin.tsx';
import LectureSidebar from '../../../components/sidebarlecturer/coursesidebar.tsx';
import BreadcrumbNav from '../../../components/breadcrumbnav/breadcrumbnav.tsx';
import ResultsPreview from '../../../components/resultsPreview/resultspreview.tsx';
import './resultspreviewpage.css'
import { useAppSelector } from '../../../app/hooks';
import { selectUserId } from '../../../features/auth/selectors';
import api from '../../../services/api';
import { toast } from 'react-toastify';

type ResultStatus = 'UPLOADED' | 'PENDING';

type CourseResultStatus = {
  id: number;
  courseCode: string;
  courseName: string;
  caStatus: ResultStatus;
  finalStatus: ResultStatus;
  submitted?: boolean;
};

const ResultsPreviewPage = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const userId = useAppSelector(selectUserId);
  const [courseResults, setCourseResults] = useState<CourseResultStatus[]>([]);
  const [loadingStatuses, setLoadingStatuses] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const handleBackdropClick = () => setSidebarOpen(false);

  // Load course-wise CA / final result statuses for this lecturer (by userId)
  useEffect(() => {
    const loadStatuses = async () => {
      if (!userId) return;
      setLoadingStatuses(true);
      setStatusError(null);
      try {
        const res = await api.get('/v1/results/status/course-allocations', {
          params: { userId },
        });
        const data = res.data?.data ?? res.data;
        const list: CourseResultStatus[] = Array.isArray(data) ? data : [];
        setCourseResults(list);
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          'Failed to load course result statuses';
        setStatusError(msg);
        toast.error(msg);
      } finally {
        setLoadingStatuses(false);
      }
    };
    loadStatuses();
  }, [userId]);

  const reloadStatuses = async () => {
    if (!userId) return;
    try {
      const res = await api.get('/v1/results/status/course-allocations', {
        params: { userId },
      });
      const data = res.data?.data ?? res.data;
      const list: CourseResultStatus[] = Array.isArray(data) ? data : [];
      setCourseResults(list);
    } catch {
      // ignore here; main effect already handles toasts
    }
  };

  const handleSendForApproval = async (courseId: number) => {
    const course = courseResults.find((c) => c.id === courseId);
    if (!course) return;

    try {
      const body = { remarks: '' };
      const res = await api.post(
        `/v1/results/submit/by-allocation/${courseId}`,
        body
      );
      const msg =
        res.data?.message || 'Results submitted for approval successfully';
      toast.success(msg);
      await reloadStatuses();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'Failed to submit results for approval';
      toast.error(msg);
    }
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
                  {loadingStatuses && (
                    <p className="uploaded-empty-text">Loading statuses...</p>
                  )}
                  {statusError && (
                    <p className="uploaded-empty-text">{statusError}</p>
                  )}
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
                              course.caStatus === 'UPLOADED' ? 'status-uploaded-results' : 'status-pending-results'
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
                              ? 'status-uploaded-results'
                              : 'status-pending-results'
                          }`}
                        >
                          {course.finalStatus === 'UPLOADED' ? 'Uploaded' : 'Pending'}
                        </span>
                      </div>

                      <div className="uploaded-actions">
                        {course.finalStatus === 'UPLOADED' ? (
                          course.submitted ? (
                            <span className="text-hint">
                              Results already submitted for approval.
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn-send-approval"
                              onClick={() => handleSendForApproval(course.id)}
                            >
                              Send for approval
                            </button>
                          )
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
