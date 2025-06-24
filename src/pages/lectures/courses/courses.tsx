import { useState } from 'react';
import Navbarin from '../../../components/Navbar/navbarin.tsx';
import './courses.css';
import LectureSidebar from '../../../components/sidebarlecturer/coursesidebar.tsx';
import BreadcrumbNav from '../../../components/breadcrumbnav/breadcrumbnav.tsx';
const Courses= () => {
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
                    <div className="dashboard-cards">

                        <div className="course-card">
                            <div className="card-top" />
                            <div className="card-details">
                                <div className="course-code">EE5028</div>
                                <div className="course-title">Machine Learning</div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Courses;
