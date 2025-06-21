
import Navbarin from '../../../components/Navbar/navbarin.tsx';
import './homeLecturer.css';
import LectureSidebar from '../../../components/sidebarlecturer/coursesidebar.tsx';
import BreadcrumbNav from '../../../components/breadcrumbnav/breadcrumbnav.tsx';

const LecturerDashboard = () => {
  return (
    <div className="lec-dashboard-container">
    <div className='nav'>   <Navbarin /></div>
   

      <div className='breadcrumb'>
<BreadcrumbNav/>
      </div>
      <div className="main-area">
        <div className='sidebar'> <LectureSidebar /></div>


        
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
            <h3>Analytics Latest Updates</h3>
            {/* Place charts here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard;
