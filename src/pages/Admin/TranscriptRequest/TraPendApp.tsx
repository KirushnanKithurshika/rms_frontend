// pages/Admin/TranscriptApprovalsAR/TraPendApprovalAR.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import Navbarin from "../../../components/Navbar/navbarin.tsx";
import BreadcrumbNav from "../../../components/breadcrumbnav/breadcrumbnav.tsx";
import TranscriptApprovalCard from "../../../components/Admin/transcriptapproval/TranscriptApprovalAR/transcriptApprovalCard.tsx";
import Transcript, { type TranscriptData } from "../../../components/Admin/transcriptapproval/Transcript/Transcript.tsx";
import { downloadTranscriptPDF } from "../../../utils/downloadTranscriptPdf"; // ⬅️ new
import {
  approveTranscriptRequest,
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
  const [approvingReferenceId, setApprovingReferenceId] = useState<string | null>(
    null
  );
  const [confirmingPayment, setConfirmingPayment] = useState<AdminPayment | null>(
    null
  );
  const [filterStatus, setFilterStatus] = useState<
    Array<"pending" | "approved" | "rejected">
  >(["pending"]);
  const [searchTerm, setSearchTerm] = useState("");
  const printRootRef = useRef<HTMLDivElement | null>(null);
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

  const handleApproveTranscript = async (payment: AdminPayment) => {
    if (!payment.payherePaymentId) return;
    setApprovingReferenceId(payment.referenceId);
    try {
      await approveTranscriptRequest(payment.payherePaymentId);
      setPayments((prev) =>
        prev.map((item) =>
          item.referenceId === payment.referenceId
            ? { ...item, isApproved: true }
            : item
        )
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to approve transcript request.";
      alert(String(message));
    } finally {
      setApprovingReferenceId(null);
    }
  };

  const openApproveConfirm = (payment: AdminPayment) => {
    setConfirmingPayment(payment);
  };

  const closeApproveConfirm = () => {
    setConfirmingPayment(null);
  };

  const confirmApprove = (payment: AdminPayment) => {
    closeApproveConfirm();
    handleApproveTranscript(payment);
  };

  const filteredPayments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const base = payments.filter((payment) => {
      if (filterStatus.length === 0) return true;
      if (filterStatus.includes("approved") && payment.isApproved) {
        return payment.isApproved;
      }
      if (
        filterStatus.includes("rejected") &&
        payment.status !== "COMPLETED"
      ) {
        return true;
      }
      if (
        filterStatus.includes("pending") &&
        payment.isTranscriptRequest &&
        !payment.isApproved
      ) {
        return true;
      }
      return false;
    });

    if (!normalizedSearch) return base;

    return base.filter((payment) => {
      const haystack = [
        payment.studentName,
        payment.studentEmail,
        payment.referenceId,
        payment.payherePaymentId ?? "",
        String(payment.studentId),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [payments, filterStatus, searchTerm]);

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

              <div className="tAR-filters">
                <div className="tAR-filter-group">
                  <button
                    type="button"
                    className={`tAR-filter-btn${
                      filterStatus.includes("pending") ? " is-active" : ""
                    }`}
                    onClick={() =>
                      setFilterStatus((prev) =>
                        prev.includes("pending")
                          ? prev.filter((status) => status !== "pending")
                          : [...prev, "pending"]
                      )
                    }
                  >
                    Want to approve
                  </button>
                  <button
                    type="button"
                    className={`tAR-filter-btn${
                      filterStatus.includes("approved") ? " is-active" : ""
                    }`}
                    onClick={() =>
                      setFilterStatus((prev) =>
                        prev.includes("approved")
                          ? prev.filter((status) => status !== "approved")
                          : [...prev, "approved"]
                      )
                    }
                  >
                    Approved
                  </button>
                  <button
                    type="button"
                    className={`tAR-filter-btn${
                      filterStatus.includes("rejected") ? " is-active" : ""
                    }`}
                    onClick={() =>
                      setFilterStatus((prev) =>
                        prev.includes("rejected")
                          ? prev.filter((status) => status !== "rejected")
                          : [...prev, "rejected"]
                      )
                    }
                  >
                    Rejected
                  </button>
                </div>
                <div className="tAR-search">
                  <input
                    type="search"
                    placeholder="Search by name, email, reference, or PayHere ID"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
              </div>

              <div className="tAR-payments">
                {paymentsLoading && (
                  <div className="tAR-payments-state">Loading payments...</div>
                )}
                {!paymentsLoading && paymentsError && (
                  <div className="tAR-payments-error">{paymentsError}</div>
                )}
                {!paymentsLoading &&
                  !paymentsError &&
                  filteredPayments.length === 0 && (
                    <div className="tAR-payments-state">No matching payments.</div>
                  )}
                {!paymentsLoading &&
                  !paymentsError &&
                  filteredPayments.length > 0 && (
                  <div className="tAR-payments-table">
                    <table className="tAR-table">
                      <thead>
                        <tr>
                          <th>Student ID</th>
                          <th>Student</th>
                          <th>Email</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>PayHere ID</th>
                          <th>Reference ID</th>
                          <th>Paid Date</th>
                          <th>Request</th>
                          <th>Approved Status</th>
                          <th>Approve</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayments.map((payment) => (
                          <tr key={payment.referenceId}>
                            <td>{payment.studentId}</td>
                            <td>{payment.studentName}</td>
                            <td>{payment.studentEmail}</td>
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
                            <td>{payment.referenceId}</td>
                            <td>{formatDate(payment.paidAt)}</td>
                            <td>
                              <span
                                className={`pay-flag ${payment.isTranscriptRequest
                                    ? "pay-flag--yes"
                                    : "pay-flag--no"
                                  }`}
                              >
                                {payment.isTranscriptRequest ? "Yes" : "No"}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`pay-flag ${
                                  payment.isApproved
                                    ? "pay-flag--yes"
                                    : "pay-flag--no"
                                }`}
                              >
                                {payment.isApproved ? "Yes" : "No"}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className={`taAR-btn${
                                  payment.isApproved ? " taAR-btn--approved" : ""
                                }`}
                                disabled={
                                  !payment.isTranscriptRequest ||
                                  payment.isApproved ||
                                  !payment.payherePaymentId ||
                                  approvingReferenceId === payment.referenceId
                                }
                                onClick={() => openApproveConfirm(payment)}
                              >
                                {payment.isApproved ? "Approved" : "Approve"}
                              </button>
                            </td>
                            
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {confirmingPayment && (
              <div
                className="tAR-modal-backdrop"
                role="dialog"
                aria-modal="true"
                onClick={closeApproveConfirm}
              >
                <div className="tAR-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="tAR-modal-header">
                    <h3>Approve Transcript Request</h3>
                    <button
                      type="button"
                      className="tAR-modal-close"
                      aria-label="Close"
                      onClick={closeApproveConfirm}
                    >
                      ×
                    </button>
                  </div>
                  <div className="tAR-modal-body">
                    <p className="tAR-modal-text">
                      Are you sure you want to approve this transcript request?
                    </p>
                    <div className="tAR-modal-summary">
                      <div>
                        <strong>Student:</strong> {confirmingPayment.studentName}
                      </div>
                      <div>
                        <strong>Reference:</strong> {confirmingPayment.referenceId}
                      </div>
                      <div>
                        <strong>PayHere ID:</strong>{" "}
                        {confirmingPayment.payherePaymentId || "-"}
                      </div>
                    </div>
                  </div>
                  <div className="tAR-modal-footer">
                    <button
                      type="button"
                      className="tAR-modal-btn tAR-modal-btn--ghost"
                      onClick={closeApproveConfirm}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="tAR-modal-btn"
                      onClick={() => confirmApprove(confirmingPayment)}
                      disabled={approvingReferenceId === confirmingPayment.referenceId}
                    >
                      {approvingReferenceId === confirmingPayment.referenceId
                        ? "Approving..."
                        : "Approve"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
 
  );
};

export default TrasncriptApprovalsAR;
