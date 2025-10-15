import { useMemo, useState } from 'react';
import Navbarin from '../../../components/Navbar/navbarin.tsx';
import LectureSidebar from '../../../components/sidebarlecturer/coursesidebar.tsx';
import BreadcrumbNav from '../../../components/breadcrumbnav/breadcrumbnav.tsx';
import CourseSearchBarlechome from '../../../components/SearchDropdown/searchdropdown.tsx';

type Course = { id: string; name: string; courseId: string; courseDisplayName: string };

const ModifyResultsPage = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const handleBackdropClick = () => setSidebarOpen(false);

  // --- Mock course list; replace with API data ---
  const courses: Course[] = useMemo(
    () => [
      { id: 'ENG101', name: 'Engineering Mathematics I', courseId: 'ENG101', courseDisplayName: 'Engineering Mathematics I' },
      { id: 'CSE201', name: 'Data Structures', courseId: 'CSE201', courseDisplayName: 'Data Structures' },
      { id: 'EE210',  name: 'Signals & Systems', courseId: 'EE210', courseDisplayName: 'Signals & Systems' },
    ],
    []
  );

  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.courseId ?? '');

  const onCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
    // TODO: fetch course-specific result data here
  };

  return (
    <div className="lec-dashboard-container">
      <div className="nav"><Navbarin /></div>

      <div className="breadcrumb">
        <BreadcrumbNav />
      </div>

      <div
        className={`sidebar-backdrop ${isSidebarOpen ? 'active' : ''}`}
        onClick={handleBackdropClick}
      />

      <div className="main-area">
        <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
          <LectureSidebar />
        </div>

        <div className="dashboard-content">
          <div className="analytics-section">
            <div className="analytics-header">
              <h3>Analytics Latest Updates</h3>
              <div className="searchbarlecturer">
                {/* FIX: Provide required props */}
                <CourseSearchBarlechome
                  courses={courses}
                  selectedCourseId={selectedCourseId}
                  onCourseSelect={onCourseSelect}
                />
              </div>
            </div>

            {/* Add your modify-results UI below */}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ModifyResultsPage;
