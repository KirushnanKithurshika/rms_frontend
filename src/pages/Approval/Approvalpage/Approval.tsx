import { useNavigate } from "react-router-dom";
import Navbarin from "../../../components/Navbar/navbarin";
import ApprovalSidebar from "../../../components/ApprovalStaffs/ApprovalSidebar/approval";
import "./Approval.css";

import ApprovalRequestsTable from "../../../components/ApprovalStaffs/Approvaltable/Approval";


type ApprovalRow = {
  id: string;
  name: string;
  sid:string;
  batch: string;
  department: string;
  avatarUrl?: string;
};
const demoRows: ApprovalRow[] = [
  { id: "1", name: "John Smith", sid:"EG/2020/4023", batch: "E2020", department: "Electrical" },
  { id: "2", name: "Anika Perera",sid:"EG/2020/4098", batch: "E2019", department: "Computer" },
  { id: "3", name: "Ruwan Silva", sid:"EG/2020/4216", batch: "E2021", department: "Mechanical" },
   { id: "4", name: "John Smith", sid:"EG/2020/4227", batch: "E2020", department: "Electrical" },
  { id: "5", name: "Anika Perera",  sid:"EG/2020/4227",batch: "E2019", department: "Computer" },
  { id: "6", name: "Anika Perera",  sid:"EG/2020/4227",batch: "E2019", department: "Computer" },
  { id: "7", name: "Anika Perera", sid:"EG/2020/4227", batch: "E2019", department: "Computer" },
  { id: "8", name: "Ruwan Silva",  sid:"EG/2020/4227", batch: "E2021", department: "Mechanical" },
   { id: "9", name: "John Smith",  sid:"EG/2020/4227", batch: "E2020", department: "Electrical" },
  { id: "10", name: "Anika Perera",sid:"EG/2020/4227", batch: "E2019", department: "Computer" },
  { id: "11", name: "Ruwan Silva",   sid:"EG/2020/4227",batch: "E2021", department: "Mechanical" },
   { id: "12", name: "John Smith",  sid:"EG/2020/4227", batch: "E2020", department: "Electrical" },
  { id: "13", name: "Anika Perera", sid:"EG/2020/4227", batch: "E2019", department: "Computer" },
  { id: "14", name: "Ruwan Silva",  sid:"EG/2020/4227", batch: "E2021", department: "Mechanical" },
];

const ApprovalPage = () => {
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
            <ApprovalSidebar />
          </div>
        <div className="main-area-approval">
          

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
