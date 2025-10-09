import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchStudentCourses } from "../../../features/studentCourses/studentCoursesSlice";
import Navbarin from "../../../components/Navbar/navbarin";
import StudentSubNav from "../../../components/Students/StudentsubNav/Studentsubnav";
import "./studentscoursesinterface.css";
import SemesterCourses from "../../../components/Students/StudentCourseInterface/studentcourses";
import { selectUserId } from "../../../features/auth/selectors";

const StudentCoursesPage = () => {
  const dispatch = useAppDispatch();
  const userId = useAppSelector(selectUserId);
  const { semesters, student, loading, error } = useAppSelector(
    (state) => state.studentCourses
  );

  useEffect(() => {
    if (userId) {
      dispatch(fetchStudentCourses(userId));
    }
  }, [dispatch, userId]);

  return (
    <div className="lec-dashboard-container">
      <div className="nav">
        <Navbarin />
      </div>

      <div className="dashboard-content">
        <StudentSubNav />
        <div className="subnav-divider"></div>
        <div className="dashboard-cards-students">
          {loading && <p>Loading student courses...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {!loading && !error && semesters.length > 0 && (
            <SemesterCourses semesters={semesters} student={student} />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentCoursesPage;
