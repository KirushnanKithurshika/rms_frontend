import { useState, useRef } from 'react';
import Navbarin from '../../../components/Navbar/navbarin.tsx';
import BreadcrumbNav from '../../../components/breadcrumbnav/breadcrumbnav.tsx';
import AdminSidebar from '../../../components/Admin/adminsidebar/adminsidebar.tsx';
import PendingApprovals from "../../../components/resultsApproval/ResultsAppAdministration/PendingApproval";
import ResultsApprovalSidebar from "../../../components/resultsApproval/ResultsApprovalSidebar/reapproval";
import ResultsSheetAP from "../../../components/resultsApproval/ResultsSheetAP/ResultsSheetAP";
import { downloadExactHtmlPdf } from "../../../utils/downloadResultsSheetPdf"; 

const AdminResultsManagement: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const printRootRef = useRef<HTMLDivElement | null>(null);

  const handleBackdropClick = () => setSidebarOpen(false);
  const onApprove = (id: string) => setSelectedId(id);
  const handleBack = () => setSelectedId(null);

  const handleApprove = () => {
    alert("Approved successfully!");
    setSelectedId(null);
  };

  const handleDownloadPdf = async () => {
    await new Promise<void>((r) => requestAnimationFrame(() => r())); // ensure render done
    await downloadExactHtmlPdf("#results-pdf-root", "ResultsSheet.pdf");
  };

  return (
    <div className="admin-dashboard-container">
      <div className="nav">
        <Navbarin />
      </div>

      <div className="breadcrumb">
        <BreadcrumbNav />
      </div>

      <div
        className={`sidebar-backdrop ${isSidebarOpen ? 'active' : ''}`}
        onClick={handleBackdropClick}
      ></div>

      <div className="main-area">
        <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
          <AdminSidebar />
        </div>

        <div className="dashboard-content">
          
            
        
                <div className="main-area-approval">
                  <div className="card-approval">
                    <div className="CAA">
                      <div className="tARD">
                        <span className="tAR-heading">Pending Results Approval</span>
                      </div>

                      {/* Pending Approvals List */}
                      {!selectedId && (
                        <PendingApprovals
                          items={[
                            { id: "1", title: "Results Sheet - Batch 2023" },
                            { id: "2", title: "Results Sheet - Batch 2024" },
                            { id: "3", title: "Results Sheet - Batch 2025" },
                          ]}
                          onApprove={onApprove}
                        />
                      )}

                      {/* Approval View */}
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

                          {/* Results Table Section */}
                          <div className="tAR-inline-body-results">
                            <div className="rap" id="results-pdf-root" ref={printRootRef}>
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
    
   
    </div>
  );
};

export default AdminResultsManagement;
