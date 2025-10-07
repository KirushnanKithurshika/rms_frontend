import { useEffect, useState } from "react";
import Navbarin from "../../../components/Navbar/navbarin.tsx";
import BreadcrumbNav from "../../../components/breadcrumbnav/breadcrumbnav.tsx";
import AdminSidebar from "../../../components/Admin/adminsidebar/adminsidebar.tsx";
import "./admindashboard.css";
import { FaArrowCircleRight } from "react-icons/fa";
import backgroundImage from "../../../assets/backgroundimage.png";

const AdminDashboard: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleBackdropClick = () => setSidebarOpen(false);

  return (
    <div className="admin-dashboard-container">
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
          <div className="dashboard-cards">
            <div className="cardcourse">
              <div className="dashboard-cards-container">
                {[
                  {
                    title: "Students",
                    count: 653,
                    color: "#1D6F83",
                    border: "#32B8DB",
                  },
                  {
                    title: "Lecturers",
                    count: 54,
                    color: "#A57500",
                    border: "#F2AE30",
                  },
                  {
                    title: "Pending Results",
                    count: 16,
                    color: "#6C0C74",
                    border: "#C936C6",
                  },
                  {
                    title: "Published Results",
                    count: 24,
                    color: "#218C32",
                    border: "#3DDC58",
                  },
                  {
                    title: "Results Approval",
                    count: 54,
                    color: "#4727B3",
                    border: "#6F4CF1",
                  },
                  {
                    title: "Alerts",
                    count: 10,
                    color: "#A8001C",
                    border: "#F03C3C",
                  },
                ].map((card, index) => (
                  <div
                    key={index}
                    className="admin-card-outer"
                    style={{
                      backgroundImage: `url(${backgroundImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      backgroundColor: card.border,
                    }}
                  >
                    <div
                      className="admin-card-inner"
                      style={{ backgroundColor: card.color }}
                    >
                      <div className="admin-card-content">
                        <div>
                          <div className="admin-card-title">{card.title}</div>
                          <div className="admin-card-count">{card.count}</div>
                        </div>
                        <div className="admin-card-icon">
                          <FaArrowCircleRight />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Empty admin landing area, add widgets/statistics/cards here later */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
