import { useNavigate } from "react-router-dom";
import Navbarin from "../../../components/Navbar/navbarin";
import ApprovalSidebar from "../../../components/ApprovalStaffs/ApprovalSidebar/approval";
import "./Approval.css";




const ApprovalHistory = () => {
  

  return (
    <div className="lec-dashboard-container">
      <div className="nav">
        <Navbarin />
      </div>

      <div className="dashboard-content-approval">
        <div className="sidebar-approval">
            <ApprovalSidebar />
          </div>
        <div className="main-area-approval">
          

          <div className="card-approval">
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalHistory;
