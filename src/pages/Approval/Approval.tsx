import { useNavigate } from "react-router-dom";
import Navbarin from "../../components/Navbar/navbarin";
import ApprovalSidebar from "../../components/ApprovalStaffs/ApprovalSidebar/approval";
import "./Approval.css";

import ApprovalRequestsTable from "../../components/ApprovalStaffs/Approvaltable/Approval";

/* 👇 Add this local type so TS knows what ApprovalRow is */
type ApprovalRow = {
  id: string;
  name: string;
  batch: string;
  department: string;
  avatarUrl?: string;
};

/* Demo data */
const demoRows: ApprovalRow[] = [
  { id: "1", name: "John Smith",  batch: "E2020", department: "Electrical" },
  { id: "2", name: "Anika Perera", batch: "E2019", department: "Computer" },
  { id: "3", name: "Ruwan Silva",  batch: "E2021", department: "Mechanical" },
];

const ApprovalPage = () => {
  const navigate = useNavigate();

  const onApprove = (id: string) => {
    // go to your approval/clearance screen for this request
    navigate(`/staff/approvals/${id}`);
  };

  return (
    <div className="lec-dashboard-container">
      <div className="nav">
        <Navbarin />
      </div>

      <div className="dashboard-content-approval">
        <div className="main-area-approval">
          <div className="sidebar-approval">
            <ApprovalSidebar />
          </div>

          <div className="card-approval">
            <ApprovalRequestsTable
              rows={demoRows}
              onApprove={onApprove}
              loading={false}
              emptyMessage="No pending approval requests."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalPage;
