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
import StudentDashboard from "./pages/Students/StudentsHomePage/studenthomepage";
import StudentResultsSheet from "./components/Students/Studentsresultsheet/StudentResultsSheet";
import StudentCourses from "./pages/Students/StudentsCourse/studentscourseinterface";
import StudentCoursesPage from "./pages/Students/StudentsCourse/studentscourseinterface";
import StudentTranscript from "./pages/Students/Studenttranscriptpage/StudentTrancscript";
import StudentTranscriptRequestForm from "./pages/Students/StuentstranscriptApplicationPage/StuTraAppPage";
import TranscriptStatusTimeline from "./components/Students/StuTraSta/StuTraSta";
import TranscripStatus from "./pages/Students/stuTraStatus/StuTraStatus";
import ApprovalPage from "./pages/Approval/Approval";



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
          <Route path="/admin/student-management" element={<StudentManagement />} />
          <Route path="/StudentResultsSheet" element={<StudentResultsSheet />} />
          <Route path="/student-courses" element={<StudentCoursesPage />} />
          <Route path="/student/transcript" element={<StudentTranscript />} />
          <Route path="/student/transcript/request" element={<StudentTranscriptRequestForm />} />
          <Route path="/student/transcript/status" element={<TranscripStatus />} />
          <Route path="/approval" element={<ApprovalPage />} />





          {/* Lecturer */}



          {/* Admin */}

        </Routes>
      </div>
    </Router>
  );
}

export default App;
