
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreateCourseForm from "./components/createcourseform/createcourseform";
import './App.css';
import WelcomePage from "./pages/Intropage/welcomepage";
import LoginPage from "./pages/loginpage/loginpage";
import TwoStepVerification from "./pages/verificaionpage/verification";
import UserDropdown from "./components/UserDropdown/userdropdown";
import LecturerDashboard from "./pages/lectures/homePageLecturer/homeLecturer";
import CreateCourseUI from "./pages/lectures/createcourse/createcourse";
import Courses from "./pages/lectures/courses/courses";

function App() {
  return (
    <Router>
      <div className="mt-16">
        <Routes>

          <Route path="/welcomepage" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="drop" element={<UserDropdown/>}/>
          <Route path="/createcourse" element={<CreateCourseForm />} />
          <Route path="/verification" element={<TwoStepVerification/>}/>
         <Route path="/lecturerhome" element={<LecturerDashboard/>}/>
         <Route path="/createcourseui" element={<CreateCourseUI/>}/>
       <Route path="/courses" element={<Courses/>}/>
       
        </Routes>
      </div>
    </Router>
  );
}

export default App;