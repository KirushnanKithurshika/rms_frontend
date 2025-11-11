// pages/Admin/TranscriptApprovalsAR/TraPendApprovalAR.tsx
import { useState, useMemo, useRef } from "react";
import Navbarin from "../../../components/Navbar/navbarin.tsx";
import BreadcrumbNav from "../../../components/breadcrumbnav/breadcrumbnav.tsx";
import AdminSidebar from "../../../components/Admin/adminsidebar/adminsidebar.tsx";
import TranscriptApprovalCard from "../../../components/Admin/transcriptapproval/TranscriptApprovalAR/transcriptApprovalCard.tsx";
import Transcript, { type TranscriptData } from "../../../components/Admin/transcriptapproval/Transcript/Transcript.tsx";
import { downloadTranscriptPDF } from "../../../utils/downloadTranscriptPdf"; // ⬅️ new
import "./TraPendApprovalAR.css";

const TrasncriptApprovalsAR: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const printRootRef = useRef<HTMLDivElement | null>(null);

  // sample transcript data (use real data later)
  const sampleData: TranscriptData = useMemo(
    () => ({
      serialNo: "EG-TR-009991",
      university: {} as any,
      student: {
        fullName: "R. P. Silva",
        registrationNo: "EG/2020/0421",
        gender: "Male",
        dateOfBirth: "1999-05-02",
      },
      programme: {
        degreeAwarded: "Bachelor of the Science of Engineering Honours",
        fieldOfSpecialization: "Mechanical and Manufacturing Engineering",
        effectiveDate: "2025-09-25",
        overallGradePointAverage: "3.42",
        academicStanding: "BScEngHons",
        medium: "English",
      },
      issueDate: "06 NOV 2025",
      registrarTitle: "Assistant Registrar / Faculty of Engineering",
    }),
    []
  );

  const handleBackdropClick = () => setSidebarOpen(false);

  // ⬇️ Download-only (no system print UI). Captures each .sheet.a4 as a PDF page.
  const handleDownloadPdf = async () => {
    const node = printRootRef.current;
    if (!node) return;
    const { registrationNo } = sampleData.student;
    await downloadTranscriptPDF(node, `Transcript-${registrationNo}.pdf`);
  };

  return (
    <div className="admin-dashboard-container">
      <div className="nav"><Navbarin /></div>
      <div className="breadcrumb"><BreadcrumbNav /></div>

      <div
        className={`sidebar-backdrop ${isSidebarOpen ? "active" : ""}`}
        onClick={handleBackdropClick}
      />

      <div className="main-area">
        <div className={`sidebar ${isSidebarOpen ? "active" : ""}`}>
          <AdminSidebar />
        </div>

        <div className="dashboard-content">
          <div className="dashboard-cards">
            <div className="cardcourse">
              <div className="tARD">
                <span className="tAR-heading">Pending Transcript Approval</span>
              </div>

              <div id="tAR-anchor" />

              {!open ? (
                <TranscriptApprovalCard
                  studentName="R. P. Silva"
                  batch="22nd Batch"
                  subtitle="Transcript"
                  onClick={() => {
                    setOpen(true);
                    document
                      .getElementById("tAR-anchor")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                />
              ) : (
                <div className="tAR-inline">
                  <div className="tAR-inline-topbar">
                    <button
                      type="button"
                      className="taAR-btn taAR-btn--ghost"
                      onClick={() => {
                        setOpen(false);
                        document
                          .getElementById("tAR-anchor")
                          ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                    >
                      ← Back
                    </button>

                    <div className="tAR-inline-spacer" />

                    {/* ⬇️ Download PDF (no print dialog) */}
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
                      onClick={() => {
                        alert("Transcript approved");
                        setOpen(false);
                        document
                          .getElementById("tAR-anchor")
                          ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                    >
                      Approve
                    </button>
                  </div>

         
                  <div className="tAR-inline-body" ref={printRootRef} id="tAR-print-root">
                    <Transcript data={sampleData} />
                  </div>
                </div>
              )}
       
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrasncriptApprovalsAR;
