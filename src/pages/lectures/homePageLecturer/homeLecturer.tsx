import { useState } from 'react';
import Navbarin from '../../../components/Navbar/navbarin.tsx';
import './homeLecturer.css';
import LectureSidebar from '../../../components/sidebarlecturer/coursesidebar.tsx';
import BreadcrumbNav from '../../../components/breadcrumbnav/breadcrumbnav.tsx';
import CourseSearchBarlechome from '../../../components/SearchDropdown/searchdropdown.tsx'
import DonutChart from '../../../components/graphs/passfailgraph/passfailgraph.tsx'
import MarksRangeBarChart from '../../../components/graphs/marksrangegraph/marksrange.tsx'
const LecturerDashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleBackdropClick = () => setSidebarOpen(false);

  return (
    <div className="lec-dashboard-container">
      <div className='nav'> <Navbarin /></div>

      <div className='breadcrumb'>
        <BreadcrumbNav />
      </div>

      {/* Show backdrop only on mobile */}
      <div className={`sidebar-backdrop ${isSidebarOpen ? 'active' : ''}`} onClick={handleBackdropClick}></div>

      <div className="main-area">
        <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
          <LectureSidebar />
        </div>

        <div className="dashboard-content">
          <div className="dashboard-cards">
            <div className="card">
              <p>Currently Assigned Courses</p>
              <h2>03</h2>
            </div>
            <div className="card">
              <p>Total Enroll Students</p>
              <h2>255</h2>
            </div>
            <div className="card">
              <p>Managing Semester</p>
              <h2>02, 05, 06</h2>
            </div>
          </div>

          <div className="analytics-section">
            <div className="analytics-header">
              <h3>Analytics Latest Updates</h3>
              <div className='searchbarlecturer'>
                <CourseSearchBarlechome />
              </div>


            </div>
            <div className="analytics-graphs-container">
              <div className="graph-card">
                <h4 className="graph-title">Pass vs Fail Percentage</h4>
                <DonutChart />
              </div>

              <div className="graph-card">
                <h4 className="graph-title">Marks Range Vs Students Number</h4>
                <MarksRangeBarChart />
              </div>
            </div>




          </div>

        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard;
