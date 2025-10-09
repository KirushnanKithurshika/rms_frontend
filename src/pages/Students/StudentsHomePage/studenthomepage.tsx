import { useEffect, useState } from "react";
import Navbarin from "../../../components/Navbar/navbarin.tsx";
import StudentSubNav from "../../../components/Students/StudentsubNav/Studentsubnav.tsx";
import "./studenthomepage.css";
import StudentMetrics from "../../../components/Students/studenthomepagegraphs/studenthomepagegraph.tsx";
import ResultsTabsButtomSection from "../../../components/Students/StudentHomePageButtonSection/studenthomebuttonsection.tsx";
import { useAppDispatch, useAppSelector } from "../../../app/hooks.ts";
import { selectUserId } from "../../../features/auth/selectors.ts";
import { fetchStudentResultsSheet } from "../../../features/studentResults/studentResultsSlice.ts";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store.ts";

const StudentDashboard = () => {
  const dispatch = useAppDispatch();
  const userId = useAppSelector(selectUserId);
  const resultsSheet = useSelector(
    (state: RootState) => state.studentResults.resultsSheet
  );

  useEffect(() => {
    if (userId) dispatch(fetchStudentResultsSheet(userId));
  }, [dispatch, userId]);

  useEffect(() => {
    console.log("Redux resultsSheet state updated:", resultsSheet);
  }, [resultsSheet]);

  return (
    <div className="lec-dashboard-container">
      {/* Navbar */}
      <div className="nav">
        <Navbarin />
      </div>

      {/* <div className="breadcrumb">
        <BreadcrumbNav />
      </div>*/}

      <div className="dashboard-content">
        <StudentSubNav />

        <div className="subnav-divider"></div>
        <div className="dashboard-cards-students">
          <div className="card-students">
            <StudentMetrics />
          </div>
          <div className="SHP">
            <ResultsTabsButtomSection />
          </div>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
