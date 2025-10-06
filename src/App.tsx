import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import CreateCourseForm from "./components/createcourseform/createcourseform";
import "./App.css";
import "./App.css";
import WelcomePage from "./pages/Intropage/welcomepage";
import LoginPage from "./pages/loginpage/loginpage";
import TwoStepVerification from "./pages/verificaionpage/verification"; // if your folder is "verificationpage", fix this path
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

// ---- inline guards (no extra files needed) ----
type Claims = { exp?: number; roles?: string[]; authorities?: string[] };

const isAuthed = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    const { exp } = jwtDecode<Claims>(token);
    return !exp || Date.now() / 1000 < exp;
  } catch {
    return false;
  }
};

const hasAny = (required: string[]) => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    const { roles = [], authorities = [] } = jwtDecode<Claims>(token);
    const haystack = new Set([...(roles || []), ...(authorities || [])]);
    return required.some((r) => haystack.has(r));
  } catch {
    return false;
  }
};

const RequireAuth = () => (isAuthed() ? <Outlet /> : <Navigate to="/login" replace />);

const RequireRole = ({ roles }: { roles: string[] }) =>
  !isAuthed()
    ? <Navigate to="/login" replace />
    : hasAny(roles)
      ? <Outlet />
      : <Navigate to="/not-authorized" replace />;

// very small inline page; optional
const NotAuthorized = () => (
  <div style={{ padding: 24 }}>
    <h2>403 – Not authorized</h2>
    <p>You don’t have permission to view this page.</p>
  </div>
);

// ------------------------------------------------

function App() {
  return (
    <div className="mt-16">
      <Routes>
        {/* public / auth flow */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/welcomepage" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verification" element={<TwoStepVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password-mail" element={<ResetPasswordEmail />} />
        <Route path="/not-authorized" element={<NotAuthorized />} />

        {/* any logged-in user */}
        <Route element={<RequireAuth />}>
          <Route path="/drop" element={<UserDropdown />} />
          <Route path="/createcourse" element={<CreateCourseForm />} />
          <Route path="/lecturerhome" element={<LecturerDashboard />} />
          <Route path="/createcourseui" element={<CreateCourseUI />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/results-preview" element={<ResultsPreviewPage />} />
          <Route path="/results-analysis" element={<AnalizePage />} />
          <Route path="/account-setting" element={<AccountSettings />} />
          {/* alias so navigate('/dashboard') works for any authed user */}
          <Route path="/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* ADMIN-only area */}
        <Route element={<RequireRole roles={["ADMIN"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/user-management" element={<UserManagement />} />
          <Route path="/admin/role-management" element={<RoleManagement />} />
          <Route path="/admin/student-management" element={<StudentManagement />} />
        </Route>

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;

