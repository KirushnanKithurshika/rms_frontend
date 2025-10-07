import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import CreateCourseForm from "./components/createcourseform/createcourseform";
import "./App.css";
import WelcomePage from "./pages/Intropage/welcomepage";
import LoginPage from "./pages/loginpage/loginpage";
import TwoStepVerification from "./pages/verificaionpage/verification"; // <-- fixed path
import UserDropdown from "./components/UserDropdown/userdropdown";
import LecturerDashboard from "./pages/lectures/homePageLecturer/homeLecturer";
import CreateCourseUI from "./pages/lectures/createcourse/createcourse";
import Courses from "./pages/lectures/courses/courses";
import ResultsPreviewPage from "./pages/lectures/resultspreviewpage/resultspreviewpage";
import AnalizePage from "./pages/lectures/analysepage/analysepage";
import AdminDashboard from "./pages/Admin/adminhomepage/admindashboard";
import UserManagement from "./pages/Admin/usermanagement/usermanagement";
import RoleManagement from "./pages/Admin/rolemanagementpage/rolemanagement";
import AccountSettings from "./pages/UserProfileSetting/userprofilesetting";
import ResetPassword from "./pages/ResetPasswordPage/resetpasswordpage";
import ResetPasswordEmail from "./pages/ResetPasswordEmail/resetpasswordemail";
import StudentManagement from "./pages/Admin/studentmanagementpage/studentmanagement";
import StudentDashboard from "./pages/Students/StudentsHomePage/studenthomepage";
import StudentResultsSheet from "./components/Students/Studentsresultsheet/StudentResultsSheet";
import StudentCourses from "./pages/Students/StudentsCourse/studentscourseinterface";
import StudentCoursesPage from "./pages/Students/StudentsCourse/studentscourseinterface";
import StudentTranscript from "./pages/Students/Studenttranscriptpage/StudentTrancscript";
import StudentTranscriptRequestForm from "./pages/Students/StuentstranscriptApplicationPage/StuTraAppPage";
import TranscriptStatusTimeline from "./components/Students/StuTraSta/StuTraSta";
import TranscripStatus from "./pages/Students/stuTraStatus/StuTraStatus";

function App() {
  return (
    <div className="mt-16">
      <Routes>
        <Route path="/StudentResultsSheet" element={<StudentResultsSheet />} />
        <Route path="/student-courses" element={<StudentCoursesPage />} />
        <Route path="/student/transcript" element={<StudentTranscript />} />
        <Route
          path="/student/transcript/request"
          element={<StudentTranscriptRequestForm />}
        />
        <Route
          path="/student/transcript/status"
          element={<TranscripStatus />}
        />

        {/* Lecturer */}

        {/* Admin */}

        {/* default landing: redirect to login (or to dashboard if authed) */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* auth flow */}
        <Route path="/welcomepage" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verification" element={<TwoStepVerification />} />

        {/* app pages */}
        <Route path="/drop" element={<UserDropdown />} />
        <Route path="/createcourse" element={<CreateCourseForm />} />
        <Route path="/lecturerhome" element={<LecturerDashboard />} />
        <Route path="/createcourseui" element={<CreateCourseUI />} />
        <Route path="/results-preview" element={<ResultsPreviewPage />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/results-analysis" element={<AnalizePage />} />

        {/* admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/user-management" element={<UserManagement />} />
        <Route path="/admin/role-management" element={<RoleManagement />} />
        <Route
          path="/admin/student-management"
          element={<StudentManagement />}
        />

        {/* alias so navigate('/dashboard') works */}
        <Route path="/dashboard" element={<AdminDashboard />} />

        {/* settings + reset */}
        <Route path="/account-setting" element={<AccountSettings />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password-mail" element={<ResetPasswordEmail />} />

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route
          path="/student/student-dashboard"
          element={<StudentDashboard />}
        />
      </Routes>
    </div>
  );
}

export default App;
