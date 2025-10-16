import { useMemo, useState } from 'react';
import Navbarin from '../../../components/Navbar/navbarin.tsx';
import LectureSidebar from '../../../components/sidebarlecturer/coursesidebar.tsx';
import BreadcrumbNav from '../../../components/breadcrumbnav/breadcrumbnav.tsx';
import CourseSearchBarlechome from '../../../components/SearchDropdown/searchdropdown.tsx';
import DonutChart from '../../../components/graphs/passfailgraph/passfailgraph.tsx';
import MarksRangeBarChart from '../../../components/graphs/marksrangegraph/marksrange.tsx';

type Course = { id: string; name: string };

const AnalizePage = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // --- Mock data (replace with API data) ---
  const courses: Course[] = useMemo(
    () => [
      { id: 'CSE101', name: 'Programming I' },
      { id: 'CSE202', name: 'Data Structures' },
      { id: 'ENG301', name: 'Signals & Systems' },
    ],
    []
  );

  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id ?? '');

  // Example pass/fail for the selected course
  const [pass, setPass] = useState<number>(78);
  const [fail, setFail] = useState<number>(22);

  // Example marks-range data for the bar chart (adjust to your component’s shape)
  // If your MarksRangeBarChart expects a different structure, align it here.
  const [dataValues, setDataValues] = useState<number[]>([3, 12, 25, 18, 7]); // e.g., [0–20, 21–40, 41–60, 61–80, 81–100]

  const handleBackdropClick = () => setSidebarOpen(false);

  const onCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
    // TODO: fetch & set pass/fail + dataValues for the chosen course
    // setPass(...); setFail(...); setDataValues([...]);
  };

  return (
    <div className="lec-dashboard-container">
      <div className="nav"><Navbarin /></div>

      <div className="breadcrumb">
        <BreadcrumbNav />
      </div>

      {/* Show backdrop only on mobile */}
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
                {/* FIX 1: Provide required props (map to expected shape) */}
                <CourseSearchBarlechome
                  courses={courses.map(c => ({ courseId: c.id, courseDisplayName: c.name }))}
                  selectedCourseId={selectedCourseId}
                  onCourseSelect={onCourseSelect}
                />
              </div>
            </div>

            <div className="analytics-graphs-container">
              <div className="graph-card">
                <h4 className="graph-title">Pass vs Fail Percentage</h4>
                {/* FIX 2: Provide pass/fail */}
                <DonutChart pass={pass} fail={fail} />
              </div>

              <div className="graph-card">
                <h4 className="graph-title">Marks Range Vs Students Number</h4>
                {/* FIX 3: Provide dataValues */}
                <MarksRangeBarChart dataValues={dataValues} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalizePage;
