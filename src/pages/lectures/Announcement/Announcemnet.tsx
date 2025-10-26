import { useState } from 'react';
import Navbarin from '../../../components/Navbar/navbarin.tsx';
import LectureSidebar from '../../../components/sidebarlecturer/coursesidebar.tsx';
import BreadcrumbNav from '../../../components/breadcrumbnav/breadcrumbnav.tsx';
import CourseSearchBarlechome from '../../../components/SearchDropdown/searchdropdown.tsx';
import "./Announcement.css";

const AnnouncementPage = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: "Exam Schedule Released", content: "The exam schedule for this semester is now available." },
    { id: 2, title: "Assignment 2 Deadline", content: "Assignment 2 submission deadline is extended to 31st Oct." }
  ]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });

  const handleBackdropClick = () => setSidebarOpen(false);

  const handleAddAnnouncement = () => {
    if (newAnnouncement.title && newAnnouncement.content) {
      setAnnouncements([
        ...announcements,
        { id: announcements.length + 1, title: newAnnouncement.title, content: newAnnouncement.content }
      ]);
      setNewAnnouncement({ title: "", content: "" });
    }
  };

  return (
    <div className="lec-dashboard-container">
      <div className='nav'><Navbarin /></div>

      <div className='breadcrumb'><BreadcrumbNav /></div>

      <div className={`sidebar-backdrop ${isSidebarOpen ? 'active' : ''}`} onClick={handleBackdropClick}></div>

      <div className="main-area">
        <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
          <LectureSidebar />
        </div>

        <div className="dashboard-content">
            <div className='card'>
          <h2>Announcements</h2>
          
          <div className="announcement-list">
            {announcements.map((ann) => (
              <div key={ann.id} className="announcement-card">
                <h3>{ann.title}</h3>
                <p>{ann.content}</p>
              </div>
            ))}
          </div>

          <div className="add-announcement">
            <h3>Add New Announcement</h3>
            <input
              type="text"
              placeholder="Title"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
            />
            <textarea
              placeholder="Content"
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
            ></textarea>
            <button onClick={handleAddAnnouncement}>Add Announcement</button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementPage;
