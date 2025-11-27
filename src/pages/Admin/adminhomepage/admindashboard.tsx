import { useEffect, useState } from "react";
import Navbarin from "../../../components/Navbar/navbarin.tsx";
import BreadcrumbNav from "../../../components/breadcrumbnav/breadcrumbnav.tsx";
import AdminSidebar from "../../../components/Admin/adminsidebar/adminsidebar.tsx";
import "./admindashboard.css";
import { FaArrowCircleRight } from "react-icons/fa";
import backgroundImage from "../../../assets/backgroundimage.png";
import api from "../../../services/api";
import { toast } from "react-toastify";

type AdminDashboardStats = {
  totalStudents: number;
  totalLecturers: number;
  pendingResults: number;
  publishedResults: number;
  resultsApprovalCount: number;
  alertsCount: number;
};

const AdminDashboard: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Escape /api base to reach http://localhost:8087/admin/admin-dashboard
        const res = await api.get("../admin/admin-dashboard");
        const data = res.data?.data ?? res.data;
        setStats(data as AdminDashboardStats);
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Failed to load admin dashboard statistics";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const handleBackdropClick = () => setSidebarOpen(false);

  const cards = [
    {
      title: "Students",
      count: stats?.totalStudents ?? 0,
      color: "#1D6F83",
      border: "#32B8DB",
    },
    {
      title: "Lecturers",
      count: stats?.totalLecturers ?? 0,
      color: "#A57500",
      border: "#F2AE30",
    },
    {
      title: "Pending Results",
      count: stats?.pendingResults ?? 0,
      color: "#6C0C74",
      border: "#C936C6",
    },
    {
      title: "Published Results",
      count: stats?.publishedResults ?? 0,
      color: "#218C32",
      border: "#3DDC58",
    },
    {
      title: "Results Approval",
      count: stats?.resultsApprovalCount ?? 0,
      color: "#4727B3",
      border: "#6F4CF1",
    },
    // {
    //   title: "Alerts",
    //   count: stats?.alertsCount ?? 0,
    //   color: "#A8001C",
    //   border: "#F03C3C",
    // },
  ];

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
              {loading && (
                <p className="uploaded-empty-text">
                  Loading dashboard stats...
                </p>
              )}
              {error && <p className="uploaded-empty-text">{error}</p>}
              <div className="dashboard-cards-container">
                {cards.map((card, index) => (
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
