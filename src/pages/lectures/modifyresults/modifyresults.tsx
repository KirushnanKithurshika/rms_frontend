import { useState } from 'react';
import Navbarin from '../../../components/Navbar/navbarin.tsx';
import LectureSidebar from '../../../components/sidebarlecturer/coursesidebar.tsx';
import BreadcrumbNav from '../../../components/breadcrumbnav/breadcrumbnav.tsx';
import CourseSearchBarlechome from '../../../components/SearchDropdown/searchdropdown.tsx';


const ModifyResultsPage= () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const handleBackdropClick = () => setSidebarOpen(false);

    return (
        <div className="lec-dashboard-container">
            <div className='nav'> <Navbarin /></div>

            <div className='breadcrumb'>
                <BreadcrumbNav />
            </div>

          
            <div className={`sidebar-backdrop ${isSidebarOpen ? 'active' : ''}`} onClick={handleBackdropClick}></div>

            <div className="main-area">
                <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
                    <LectureSidebar />
                </div>

                <div className="dashboard-content">
                     <div className="analytics-section">
            <div className="analytics-header">
              <h3>Analytics Latest Updates</h3>
              <div className='searchbarlecturer'>
                <CourseSearchBarlechome />
              </div>


            </div>
           




          </div>
                </div>
            </div>
        </div>

    );
};

export default ModifyResultsPage;
