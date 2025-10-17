import { useEffect, useState } from "react";
import Navbarin from "../../../components/Navbar/navbarin.tsx";
import LectureSidebar from "../../../components/sidebarlecturer/coursesidebar.tsx";
import BreadcrumbNav from "../../../components/breadcrumbnav/breadcrumbnav.tsx";
import CourseSearchBarlechome from "../../../components/SearchDropdown/searchdropdown.tsx";
import DonutChart from "../../../components/graphs/passfailgraph/passfailgraph.tsx";
import MarksRangeBarChart from "../../../components/graphs/marksrangegraph/marksrange.tsx";
import { useAppSelector, useAppDispatch } from "../../../app/hooks.ts";
import {
  fetchLecturerDashboard,
  setSelectedCourse,
} from "../../../features/lecturerDashboard/lecturerDashboardSlice.ts";
import { selectUserId } from "../../../features/auth/selectors.ts";

const AnalizePage = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useAppDispatch();
  const userId = useAppSelector(selectUserId);

  const { data, loading, error, selectedCourseId } = useAppSelector(
    (state) => state.lecturerDashboard
  );

  useEffect(() => {
    if (userId) dispatch(fetchLecturerDashboard(userId));
  }, [dispatch, userId]);

  const handleCourseChange = (courseId: string) => {
    dispatch(setSelectedCourse(courseId));
  };

  const handleBackdropClick = () => setSidebarOpen(false);

  const selectedAnalytics =
    (selectedCourseId && data?.analyticsData?.[selectedCourseId]) || null;

  const isAnalyticsObject =
    selectedAnalytics && typeof selectedAnalytics === "object";

  const passCount = isAnalyticsObject
    ? (selectedAnalytics as any).passFailPercentage?.passCount ?? 0
    : 0;

  const failCount = isAnalyticsObject
    ? (selectedAnalytics as any).passFailPercentage?.failCount ?? 0
    : 0;

  const marksRange: number[] = isAnalyticsObject
    ? (selectedAnalytics as any).marksRange?.studentCounts ?? [0, 0, 0, 0, 0]
    : [0, 0, 0, 0, 0];

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div className="lec-dashboard-container">
      <div className="nav">
        <Navbarin />
      </div>

      <div className="breadcrumb">
        <BreadcrumbNav />
      </div>

      {/* Backdrop */}
      <div
        className={`sidebar-backdrop ${isSidebarOpen ? "active" : ""}`}
        onClick={handleBackdropClick}
      ></div>

      <div className="main-area">
        {/* Sidebar */}
        <div className={`sidebar ${isSidebarOpen ? "active" : ""}`}>
          <LectureSidebar />
        </div>

        <div className="dashboard-content">
          <div className="analytics-section">
            <div className="analytics-header">
              <h3>Analytics Latest Updates</h3>
              <div className="searchbarlecturer">
                <CourseSearchBarlechome
                  courses={data?.availableCourses ?? []}
                  selectedCourseId={selectedCourseId ?? ""}
                  onCourseSelect={handleCourseChange}
                />
              </div>
            </div>

            <div className="analytics-graphs-container">
              <div className="graph-card">
                <h4 className="graph-title">Pass vs Fail Percentage</h4>
                <DonutChart pass={passCount} fail={failCount} />
              </div>

              <div className="graph-card">
                <h4 className="graph-title">Marks Range Vs Students Number</h4>
                <MarksRangeBarChart dataValues={marksRange} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalizePage;
