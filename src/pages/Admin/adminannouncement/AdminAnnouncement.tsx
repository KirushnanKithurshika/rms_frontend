import React, { useState } from "react";
import Navbarin from "../../../components/Navbar/navbarin";
import BreadcrumbNav from "../../../components/breadcrumbnav/breadcrumbnav";
import AdminSidebar from "../../../components/Admin/adminsidebar/adminsidebar";

interface Announcement {
  id: number;
  title: string;
  content: string;
  postedBy: string;
  time: string;
}

interface NewAnnouncement {
  title: string;
  content: string;
}

const AnnouncementAdminPage: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 1,
      title: "Exam Schedule Released",
      content: "The exam schedule for this semester is now available.",
      postedBy: "Admin",
      time: "October 25, 2025, 10:00 AM",
    },
    {
      id: 2,
      title: "Assignment 2 Deadline",
      content: "Assignment 2 submission deadline is extended to 31st Oct.",
      postedBy: "Course Coordinator",
      time: "October 24, 2025, 2:30 PM",
    },
  ]);
  const [newAnnouncement, setNewAnnouncement] = useState<NewAnnouncement>({
    title: "",
    content: "",
  });

  const handleBackdropClick = (): void => setSidebarOpen(false);

  const handleAddAnnouncement = (): void => {
    if (newAnnouncement.title && newAnnouncement.content) {
      const now = new Date();
      const formattedTime = now.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      setAnnouncements([
        ...announcements,
        {
          id: announcements.length + 1,
          title: newAnnouncement.title,
          content: newAnnouncement.content,
          postedBy: "You", 
          time: formattedTime,
        },
      ]);
      setNewAnnouncement({ title: "", content: "" });
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
        className={`sidebar-backdrop ${isSidebarOpen ? "active" : ""}`}
        onClick={handleBackdropClick}
      ></div>


      <div className="main-area">

        <div className={`sidebar ${isSidebarOpen ? "active" : ""}`}>
          <AdminSidebar />
        </div>

    
        <div className="dashboard-content">
          <div className="card">
            <div className="Ann-head">Announcements</div>

            <div className="announcement-list">
              {announcements.map((ann) => (
                <div key={ann.id} className="announcement-card">
                  <div className="ann-title">{ann.title}</div>
                  <div className="ann-meta">
                    Posted by {ann.postedBy} • {ann.time}
                  </div>
                  <p>{ann.content}</p>
                </div>
              ))}
            </div>

            <div className="add-announcement">
              <div className="New-ann">Add New Announcement</div>
              <input
                type="text"
                placeholder="Title"
                value={newAnnouncement.title}
                onChange={(e) =>
                  setNewAnnouncement({
                    ...newAnnouncement,
                    title: e.target.value,
                  })
                }
              />
              <textarea
                placeholder="Content"
                value={newAnnouncement.content}
                onChange={(e) =>
                  setNewAnnouncement({
                    ...newAnnouncement,
                    content: e.target.value,
                  })
                }
              ></textarea>
              <button onClick={handleAddAnnouncement}>
                Add Announcement
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementAdminPage;
