// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

// ---------- Pages ----------
import WelcomePage from "./pages/Intropage/welcomepage";
import LoginPage from "./pages/loginpage/loginpage";
import TwoStepVerification from "./pages/verificaionpage/verification";
import ResetPassword from "./pages/ResetPasswordPage/resetpasswordpage";
import ResetPasswordEmail from "./pages/ResetPasswordEmail/resetpasswordemail";

// Lecturer
import LecturerDashboard from "./pages/lectures/homePageLecturer/homeLecturer";
import CreateCourseUI from "./pages/lectures/createcourse/createcourse";
import Courses from "./pages/lectures/courses/courses";
import ResultsPreviewPage from "./pages/lectures/resultspreviewpage/resultspreviewpage";
import AnalizePage from "./pages/lectures/analysepage/analysepage";
import CreateCourseForm from "./components/createcourseform/createcourseform";

// Admin
import AdminDashboard from "./pages/Admin/adminhomepage/admindashboard";
import UserManagement from "./pages/Admin/usermanagement/usermanagement";
import RoleManagement from "./pages/Admin/rolemanagementpage/rolemanagement";
import StudentManagement from "./pages/Admin/studentmanagementpage/studentmanagement";

// Students
import StudentDashboard from "./pages/Students/StudentsHomePage/studenthomepage";
import StudentResultsSheet from "./components/Students/Studentsresultsheet/StudentResultsSheet";
import StudentCoursesPage from "./pages/Students/StudentsCourse/studentscourseinterface";
import StudentTranscript from "./pages/Students/Studenttranscriptpage/StudentTrancscript";
import StudentTranscriptRequestForm from "./pages/Students/StuentstranscriptApplicationPage/StuTraAppPage";
import TranscripStatus from "./pages/Students/stuTraStatus/StuTraStatus";

// Shared / user
import AccountSettings from "./pages/UserProfileSetting/userprofilesetting";
import UserDropdown from "./components/UserDropdown/userdropdown";

// ---------- Guards ----------
import { RequireAuth, RequireRole, RequireAnonymous } from "./routes/guards";
import LandingRedirect from "./routes/LandingRedirect";
import AuditLog from "./pages/AuditLog/AuditLog";

// ---------- Fallback ----------
const NotAuthorized = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2>403 – Not Authorized</h2>
    <p>You don’t have permission to access this page.</p>
  </div>
);

// ==========================================================
// APP ROUTES
// ==========================================================
function App() {
  return (
    <div className="mt-16">
      <div className="mt-16">
        <Routes>
          {/* ------------------ PUBLIC / AUTH FLOW ------------------ */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/welcomepage" element={<WelcomePage />} />
          <Route path="/not-authorized" element={<NotAuthorized />} />

          {/* Login, verification, reset - accessible only if NOT logged in */}
          <Route element={<RequireAnonymous />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verification" element={<TwoStepVerification />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/reset-password-mail"
              element={<ResetPasswordEmail />}
            />
          </Route>

          {/* ------------------ AUTHENTICATED AREA ------------------ */}
          <Route element={<RequireAuth />}>
            {/* Generic pages (accessible to all logged-in users) */}
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/landing" element={<LandingRedirect />} />
            <Route path="/drop" element={<UserDropdown />} />
            <Route path="/account-setting" element={<AccountSettings />} />

            {/* Lecturer routes */}
            <Route path="/lecturerhome" element={<LecturerDashboard />} />
            <Route path="/createcourse" element={<CreateCourseForm />} />
            <Route path="/createcourseui" element={<CreateCourseUI />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/results-preview" element={<ResultsPreviewPage />} />
            <Route path="/results-analysis" element={<AnalizePage />} />

            {/* Student routes */}
            <Route
              path="/student/student-dashboard"
              element={<StudentDashboard />}
            />
            <Route
              path="/StudentResultsSheet"
              element={<StudentResultsSheet />}
            />
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
          </Route>

          {/* ------------------ ADMIN-ONLY AREA ------------------ */}
          <Route element={<RequireRole roles={["ADMIN"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/user-management" element={<UserManagement />} />
            <Route path="/admin/role-management" element={<RoleManagement />} />
            <Route
              path="/admin/student-management"
              element={<StudentManagement />}
            />
            <Route path="/admin/audit-logs" element={<AuditLog />} />
          </Route>


          {/* ------------------ FALLBACK ------------------ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
