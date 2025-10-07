// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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

// Shared / user
import AccountSettings from "./pages/UserProfileSetting/userprofilesetting";
import UserDropdown from "./components/UserDropdown/userdropdown";

// ---------- Guards ----------
import { RequireAuth, RequireRole, RequireAnonymous } from "./routes/guards";
import LandingRedirect from "./routes/LandingRedirect";

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
          <Route path="/reset-password-mail" element={<ResetPasswordEmail />} />
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
        </Route>

        {/* ------------------ FALLBACK ------------------ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
