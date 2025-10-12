import { useState, useEffect, useRef } from 'react';

import Navbarin from '../../../components/Navbar/navbarin.tsx';
import LectureSidebar from '../../../components/sidebarlecturer/coursesidebar.tsx';
import BreadcrumbNav from '../../../components/breadcrumbnav/breadcrumbnav.tsx';
import ActivityHistoryPage from '../../../components/Lecturer/LecCourseHis/LecCourseHis.tsx';




const Courses: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const handleBackdropClick = () => setSidebarOpen(false);



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

                    <div className="card">
                        <ActivityHistoryPage />
                    </div>



                </div>
            </div>


        </div>
    );
};

export default Courses;
