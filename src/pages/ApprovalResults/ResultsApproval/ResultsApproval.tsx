import { useState, useRef } from "react";
import Navbarin from "../../../components/Navbar/navbarin";
import "./ResultsApproval.css";
import PendingApprovals from "../../../components/resultsApproval/ResultsAppAdministration/PendingApproval";
import ResultsApprovalSidebar from "../../../components/resultsApproval/ResultsApprovalSidebar/reapproval";
import ResultsSheetAP from "../../../components/resultsApproval/ResultsSheetAP/ResultsSheetAP";
import { downloadExactHtmlPdf} from "../../../utils/downloadResultsSheetPdf"; // ✅ correct util

const ResultsApprovalPage = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const printRootRef = useRef<HTMLDivElement | null>(null);

  const onApprove = (id: string) => setSelectedId(id);

  const handleApprove = () => {
    alert("Approved successfully!");
    setSelectedId(null);
  };

  const handleBack = () => setSelectedId(null);

 const handleDownloadPdf = async () => {
  await new Promise<void>((r) => requestAnimationFrame(() => r())); // ensure mounted

  // Option A: by selector (simplest)
  await downloadExactHtmlPdf("#results-pdf-root", "ResultsSheet.pdf");
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
            <div className="CAA">
              <div className="tARD">
                <span className="tAR-heading">Pending Results Approval</span>
              </div>

              {!selectedId && (
                <PendingApprovals
                  items={[
                    { id: "1", title: "Results Sheet - Batch 2023" },
                    { id: "2", title: "Results Sheet - Batch 2024" },
                  ]}
                  onApprove={onApprove}
                />
              )}

              {selectedId && (
                <>
                  <div className="tAR-inline">
                    <div className="tAR-inline-topbar">
                      <button
                        type="button"
                        className="taAR-btn taAR-btn--ghost"
                        onClick={handleBack}
                      >
                        ← Back
                      </button>

                      <div className="tAR-inline-spacer" />

                      <button
                        type="button"
                        className="taAR-btn taAR-btn--ghost"
                        onClick={handleDownloadPdf}
                      >
                        Download PDF
                      </button>

                      <button
                        type="button"
                        className="taAR-btn"
                        onClick={handleApprove}
                      >
                        Approve
                      </button>
                    </div>
                  </div>

                  <div className="tAR-inline-body">
                    <div className="rap" ref={printRootRef}>
                      {/* Ensure ResultsTable inside ResultsSheetAP renders <table class="rs-table"> */}
                      <ResultsSheetAP />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsApprovalPage;
