import { useNavigate } from "react-router-dom";
import Navbarin from "../../../components/Navbar/navbarin.tsx";
import StudentSubNav from "../../../components/Students/StudentsubNav/Studentsubnav.tsx";

import StudentSidebar from "../../../components/Students/Studentsidebar/Studentsidebar.tsx";


import TranscriptForm from "../../../components/Students/StuTraAppForm/StuTraAppform.tsx";

const StudentTranscriptRequestForm = () => {
 

  return (
    <div className="lec-dashboard-container">
      <div className="nav">
        <Navbarin />
      </div>

      <div className="dashboard-content-students-transcript">
        <StudentSubNav />
        <div className="subnav-divider" />

        <div className="main-area-students-transcript">
          <div className="sidebar-student">
            <StudentSidebar />
          </div>

          <div className="card-students-trsnscript">
        <TranscriptForm/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTranscriptRequestForm;
