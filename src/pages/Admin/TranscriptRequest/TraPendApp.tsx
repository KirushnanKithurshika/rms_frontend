// pages/Admin/TranscriptApprovalsAR/TraPendApprovalAR.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import Navbarin from "../../../components/Navbar/navbarin.tsx";
import BreadcrumbNav from "../../../components/breadcrumbnav/breadcrumbnav.tsx";
import AdminSidebar from "../../../components/Admin/adminsidebar/adminsidebar.tsx";
import TranscriptApprovalCard from "../../../components/Admin/transcriptapproval/TranscriptApprovalAR/transcriptApprovalCard.tsx";
import Transcript, { type TranscriptData } from "../../../components/Admin/transcriptapproval/Transcript/Transcript.tsx";
import { downloadTranscriptPDF } from "../../../utils/downloadTranscriptPdf"; // ⬅️ new
import {
  fetchAdminPayments,
  type AdminPayment,
} from "../../../services/payments";
import "./TraPendApprovalAR.css";

const TrasncriptApprovalsAR: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
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

  useEffect(() => {
    let isActive = true;
    const loadPayments = async () => {
      setPaymentsLoading(true);
      setPaymentsError(null);
      try {
        const data = await fetchAdminPayments({
          page: 0,
          size: 10,
          sortBy: "createdAt",
          sortDir: "desc",
        });
        if (isActive) {
          setPayments(data.payments ?? []);
        }
      } catch (err: any) {
        if (!isActive) return;
        const message =
          err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Failed to load payments.";
        setPaymentsError(String(message));
      } finally {
        if (isActive) setPaymentsLoading(false);
      }
    };

    loadPayments();
    return () => {
      isActive = false;
    };
  }, []);

  const formatAmount = (amount: number, currency?: string) => {
    const prefix = currency ? `${currency} ` : "";
    return `${prefix}${amount.toFixed(2)}`;
  };

  const formatDate = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  };

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

            <div className="cardcourse">
              <div className="tARD">
                <span className="tAR-heading">Recent Payments</span>
              </div>

              <div className="tAR-payments">
                {paymentsLoading && (
                  <div className="tAR-payments-state">Loading payments...</div>
                )}
                {!paymentsLoading && paymentsError && (
                  <div className="tAR-payments-error">{paymentsError}</div>
                )}
                {!paymentsLoading && !paymentsError && payments.length === 0 && (
                  <div className="tAR-payments-state">No payments found.</div>
                )}
                {!paymentsLoading && !paymentsError && payments.length > 0 && (
                  <div className="tAR-payments-table">
                    <table className="tAR-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Email</th>
                          <th>Reference</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>PayHere ID</th>
                          <th>Method</th>
                          <th>Paid Date</th>
                          <th>Transcript</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment.referenceId}>
                            <td>{payment.studentName}</td>
                            <td>{payment.studentEmail}</td>
                            <td>{payment.referenceId}</td>
                            <td>{payment.paymentType}</td>
                            <td>{formatAmount(payment.amount, payment.currency)}</td>
                            <td>
                              <span
                                className={`pay-status pay-status--${payment.status.toLowerCase()}`}
                              >
                                {payment.status}
                              </span>
                            </td>
                            <td>{payment.payherePaymentId || "-"}</td>
                            <td>{payment.paymentMethod || "-"}</td>
                            <td>{formatDate(payment.paidAt)}</td>
                            <td>
                              <span
                                className={`pay-flag ${
                                  payment.isTranscriptRequest
                                    ? "pay-flag--yes"
                                    : "pay-flag--no"
                                }`}
                              >
                                {payment.isTranscriptRequest ? "Yes" : "No"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrasncriptApprovalsAR;
