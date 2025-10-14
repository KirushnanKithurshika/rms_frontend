import { useNavigate } from "react-router-dom";
import Navbarin from "../../../components/Navbar/navbarin";
import ApprovalSidebar from "../../../components/ApprovalStaffs/ApprovalSidebar/approval";
import "./Approval.css";
import PendingApprovals from "../../../components/resultsApproval/ResultsAppAdministration/PendingApproval";
import ResultsApprovalSidebar from "../../../components/resultsApproval/ResultsApprovalSidebar/reapproval";




const approvals = [
  { id: "22-5", title: "22nd batch 5th Semester Results" },
  { id: "22-6", title: "22nd batch 6th Semester Results" },
];
const ResultsApprovalPage = () => {
  const navigate = useNavigate();

  const onApprove = (id: string) => {
    
    navigate(`/staff/approvals/${id}`);
  };

  return (
    <div className="lec-dashboard-container">
      <div className="nav">
        <Navbarin />
      </div>

      <div className="dashboard-content-approval">
        <div className="sidebar-approval">
            <ResultsApprovalSidebar/>
          </div>
        <div className="main-area-approval">
          

          <div className="card-approval">
           <PendingApprovals items={approvals} onApprove={onApprove} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsApprovalPage;
