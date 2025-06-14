
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreateCourseForm from "./components/createcourseform/createcourseform";
import './App.css';
import Navbar from "./components/Navbar/navbar";
import Navbarin from "./components/Navbar/navbarin";
import WelcomePage from "./pages/Intropage/welcomepage";
import LoginPage from "./pages/loginpage/loginpage";
import TwoStepVerification from "./pages/verificaionpage/verification";

function App() {
  return (
    <Router>
      <div className="mt-16">
        <Routes>
          <Route path="/welcomepage" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/createcourse" element={<CreateCourseForm />} />
          <Route path="/verification" element={<TwoStepVerification/>}/>
          <Route path="/navbarlogin" element={<Navbar />} />
          <Route path="/navbarin" element={<Navbarin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;