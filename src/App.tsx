import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import CreateCourseForm from "./components/createcourseform/createcourseform";
import "./App.css";
import WelcomePage from "./pages/Intropage/welcomepage";
import LoginPage from "./pages/loginpage/loginpage";
import TwoStepVerification from "./pages/verificaionpage/verification";
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

import { RequireAuth, RequireRole, RequirePendingOtp, PublicOnly } from "./routes/guards";

function App() {
  return (
    <Router>
      <div className="mt-16">
        <Routes>
          {/* Public */}
          <Route path="/" element={<WelcomePage />} />
          <Route path="/drop" element={<UserDropdown />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password-mail" element={<ResetPasswordEmail />} />
          <Route path="/student/student-dashboard" element={<StudentDashboard />} />
          <Route path="/verification" element={<TwoStepVerification />} />
          <Route path="/account-setting" element={<AccountSettings />} />
          <Route path="/lecturerhome" element={<LecturerDashboard />} />
          <Route path="/createcourseui" element={<CreateCourseUI />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/results-preview" element={<ResultsPreviewPage />} />
          <Route path="/results-analysis" element={<AnalizePage />} />
          <Route path="/createcourse" element={<CreateCourseForm />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/user-management" element={<UserManagement />} />
          <Route path="/admin/role-management" element={<RoleManagement />} />
          <Route path="/admin/student-management" element={<StudentManagement />} />
          <Route element={<RequirePendingOtp />}>

          </Route>

          <Route element={<RequireAuth />}>


            {/* Lecturer */}
            <Route element={<RequireRole roles={["LECTURER"]} />}>

            </Route>

            {/* Admin */}
            <Route element={<RequireRole roles={["ADMIN"]} />}>

            </Route>

            {/* Student */}
            <Route element={<RequireRole roles={["STUDENT"]} />}>

            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
