import { useState } from 'react';
import Navbarin from '../../../components/Navbar/navbarin.tsx';
import './courses.css';
import LectureSidebar from '../../../components/sidebarlecturer/coursesidebar.tsx';
import BreadcrumbNav from '../../../components/breadcrumbnav/breadcrumbnav.tsx';
import ResultUploadInterface from '../../../components/resultuploadinterface/ResultUploadInterface.tsx';

interface Course {
    code: string;
    title: string;
}

const courseData: Course[] = [
    { code: 'EE7001', title: 'Research & Methodology' },
    { code: 'EE7002', title: 'Machine Learning' },
    { code: 'EE7003', title: 'Data Structures' },
    { code: 'EE7004', title: 'Database Systems' },
    { code: 'EE7005', title: 'Computer Networks' },
    { code: 'EE7006', title: 'Artificial Intelligence' },
];

const Courses: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    const handleBackdropClick = () => setSidebarOpen(false);

    const filteredCourses = courseData.filter(course =>
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCourseClick = (course: Course) => {
        setSelectedCourse(course);
    };

    const handleBack = () => {
        setSelectedCourse(null);
    };

    return (
        <div className="lec-dashboard-container">
            <div className='nav'><Navbarin /></div>

            <div className='breadcrumb'>
                <BreadcrumbNav />
            </div>

            <div className={`sidebar-backdrop ${isSidebarOpen ? 'active' : ''}`} onClick={handleBackdropClick}></div>

            <div className="main-area">
                <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
                    <LectureSidebar />
                </div>

                <div className="dashboard-content">
                    {!selectedCourse ? (
                        <div className='cardcourse'>
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
                                        <div className="course-card" key={idx} onClick={() => handleCourseClick(course)}>
                                            <div className="card-top">
                                                <div className="card-options">⋮</div>
                                            </div>
                                            <div className="card-details">
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
                                <button>Create Course +</button>
                            </div>
                        </div>
                    ) : (
                        <div className="result-upload-section">
                             <div className="card">
                            <ResultUploadInterface course={selectedCourse} onBack={handleBack} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Courses;
