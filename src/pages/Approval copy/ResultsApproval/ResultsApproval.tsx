import { useMemo, useState } from "react";
import Navbarin from "../../../components/Navbar/navbarin";
import "./ResultsApproval.css";
import PendingApprovals, { type ApprovalItem } from "../../../components/resultsApproval/ResultsAppAdministration/PendingApproval";
import ResultsApprovalSidebar from "../../../components/resultsApproval/ResultsApprovalSidebar/reapproval";
import ResultApprovalViewer from "../../../components/resultsApproval/FinalResults/FinalResults";

const approvals:ApprovalItem[] = [
  { id: "22-5", title: "22nd batch 5th Semester Results" },
  { id: "22-6", title: "22nd batch 6th Semester Results" },
];


const PDF_MAP: Record<string, string> = {
  "22-5": "/pdfs/22-5.pdf",
  "22-6": "/pdfs/22-6.pdf",
};

const ResultsApprovalPage = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pdfUrl = useMemo(() => (selectedId ? PDF_MAP[selectedId] : ""), [selectedId]);

  const onApprove = (id: string) => {
    setSelectedId(id);
  };

  const handleApprove = () => {
    if (!selectedId) return;

    setSelectedId(null); 
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = "";
    a.rel = "noopener";
    a.click();
  };

  return (
    <div className="lec-dashboard-container">
      <div className="nav">
        <Navbarin />
      </div>

      <div className="dashboard-content-approval">
        <div className="sidebar-approval">
          <ResultsApprovalSidebar />
        </div>

        <div className="main-area-approval">
          <div className="card-approval">
            {!selectedId && (
              <PendingApprovals items={approvals} onApprove={onApprove} />
            )}

            {selectedId && pdfUrl && (
              <ResultApprovalViewer
                pdfUrl={pdfUrl}
                onApprove={handleApprove}
                onSign={() => console.log("Sign flow")}
                onDownload={handleDownload}
                approveLabel="Approve"
              />
            )}

            {selectedId && !pdfUrl && (
              <div>
                <p>PDF not found.</p>
                <button className="pa-button" onClick={() => setSelectedId(null)}>
                  Back
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsApprovalPage;
