import { useNavigate } from "react-router-dom";
import Navbarin from '../../components/Navbar/navbarin';
import ApprovalSidebar from "../../components/ApprovalStaffs/ApprovalSidebar/approval";




const StudentTranscriptRequestForm = () => {
 

  return (
    <div className="lec-dashboard-container">
      <div className="nav">
        <Navbarin />
      </div>

      <div className="dashboard-content-students-transcript">
       
        <div className="subnav-divider" />

        <div className="main-area-students-transcript">
          <div className="sidebar-student">
            <ApprovalSidebar />
          </div>

          <div className="card-students-trsnscript">
        
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTranscriptRequestForm;
