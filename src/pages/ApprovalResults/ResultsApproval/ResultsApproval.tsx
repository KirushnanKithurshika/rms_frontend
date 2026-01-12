import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Navbarin from "../../../components/Navbar/navbarin";
import "./ResultsApproval.css";
import PendingApprovals from "../../../components/resultsApproval/ResultsAppAdministration/PendingApproval";
import ResultsApprovalSidebar from "../../../components/resultsApproval/ResultsApprovalSidebar/reapproval";
import ResultsSheetAP from "../../../components/resultsApproval/ResultsSheetAP/ResultsSheetAP";
import type { ResultSheetRow } from "../../../components/resultsApproval/ResultsSheetAP/ResultsSheetAP";
import { downloadExactHtmlPdf } from "../../../utils/downloadResultsSheetPdf";
import { useAppSelector } from "../../../app/hooks";
import { selectPrivileges } from "../../../features/auth/selectors";
import api from "../../../services/api";
import { showError, showSuccess } from "../../../utils/toast";

type ResultBatchResponse = {
  id: number;
  name: string;
  semesterName?: string;
  departmentName?: string;
  status: string;
  resultCount?: number;
  results?: ResultSheetRow[];
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  DEPT_APPROVED: "Dept. Approved",
  FACULTY_APPROVED: "Faculty Approved",
  SENATE_APPROVED: "Senate Approved",
  RELEASED: "Released",
  LOCKED: "Locked",
};

type ApprovalLevel = "FACULTY" | "SENATE";

const ResultsApprovalPage = () => {
  const privileges = useAppSelector(selectPrivileges);
  const canApproveFaculty = privileges?.includes("APPROVE_RESULT_FACULTY");
  const canApproveSenate = privileges?.includes("APPROVE_RESULT_SENATE");
  const approvalLevel: ApprovalLevel | null = canApproveSenate
    ? "SENATE"
    : canApproveFaculty
    ? "FACULTY"
    : null;

  const [batches, setBatches] = useState<ResultBatchResponse[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<ResultBatchResponse | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const printRootRef = useRef<HTMLDivElement | null>(null);

  const completedStatus = approvalLevel === "SENATE" ? "SENATE_APPROVED" : "FACULTY_APPROVED";

  const fetchBatches = useCallback(async () => {
    if (!approvalLevel) return;
    setListLoading(true);
    setError(null);
    try {
      const res = await api.get("/result-batches/get-all-batches");
      const data = (res.data?.data ?? res.data) as ResultBatchResponse[];
      setBatches(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load batches.";
      setError(msg);
      showError(msg);
    } finally {
      setListLoading(false);
    }
  }, [approvalLevel]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const fetchBatchDetails = useCallback(async (batchId: number) => {
    setDetailsLoading(true);
    setError(null);
    try {
      const res = await api.get(`/result-batches/${batchId}`, {
        params: { includeResults: true },
      });
      const data = (res.data?.data ?? res.data) as ResultBatchResponse;
      setSelectedBatch({
        ...data,
        results: Array.isArray(data.results) ? data.results : [],
      });
      setSelectedId(batchId);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load batch details.";
      setError(msg);
      showError(msg);
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const handleSelectBatch = useCallback(
    (id: string) => {
      const batchId = Number(id);
      if (Number.isNaN(batchId)) return;
      fetchBatchDetails(batchId);
    },
    [fetchBatchDetails]
  );

  const handleBack = () => {
    setSelectedId(null);
    setSelectedBatch(null);
    setError(null);
  };

  const isBatchActionable = useCallback(
    (batch?: ResultBatchResponse | null) => {
      if (!approvalLevel || !batch) return false;
      if (approvalLevel === "FACULTY") {
        return batch.status === "DEPT_APPROVED";
      }
      if (approvalLevel === "SENATE") {
        return batch.status === "FACULTY_APPROVED";
      }
      return false;
    },
    [approvalLevel]
  );

  const handleApprove = async () => {
    if (!selectedBatch || !approvalLevel || !isBatchActionable(selectedBatch)) return;

    setApproving(true);
    setError(null);
    try {
      const path =
        approvalLevel === "SENATE"
          ? `/result-batches/${selectedBatch.id}/approve-senate`
          : `/result-batches/${selectedBatch.id}/approve-faculty`;

      await api.post(path);
      showSuccess("Batch approved successfully.");
      await fetchBatches();
      await fetchBatchDetails(selectedBatch.id);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to approve batch.";
      setError(msg);
      showError(msg);
    } finally {
      setApproving(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedBatch) return;
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await downloadExactHtmlPdf("#results-pdf-root", `${selectedBatch.name}.pdf`);
  };

  const approvalHeading = approvalLevel === "SENATE" ? "Senate" : "Dean";

  const pendingItems = useMemo(
    () =>
      batches.map((batch) => {
        const actionable = isBatchActionable(batch);
        const statusLabel = STATUS_LABELS[batch.status] ?? batch.status;
        const statusClass = actionable
          ? "pending"
          : batch.status === completedStatus
          ? "approved"
          : "neutral";
        return {
          id: String(batch.id),
          title: batch.name,
          subtitle: [batch.departmentName, batch.semesterName].filter(Boolean).join(" • "),
          statusText: statusLabel,
          statusClass,
          meta: `${batch.resultCount ?? 0} results`,
          actionLabel: actionable ? "View & Approve" : "View",
        };
      }),
    [batches, completedStatus, isBatchActionable]
  );

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
                <span className="tAR-heading">
                  {approvalLevel ? `${approvalHeading} Result Approval` : "Results Approval"}
                </span>
              </div>

              {!approvalLevel && (
                <div className="tAR-inline-body-results">
                  <p>You do not have permission to approve result batches.</p>
                </div>
              )}

              {approvalLevel && !selectedId && (
                <>
                  {error && (
                    <div className="hod-error" role="alert">
                      {error}
                    </div>
                  )}
                  {listLoading && <div className="hod-loading">Loading batches…</div>}
                  {!listLoading && (
                    <PendingApprovals items={pendingItems} onApprove={handleSelectBatch} />
                  )}
                </>
              )}

              {approvalLevel && selectedId && selectedBatch && (
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
                        disabled={detailsLoading}
                      >
                        Download PDF
                      </button>

                      <button
                        type="button"
                        className="taAR-btn"
                        onClick={handleApprove}
                        disabled={
                          approving || detailsLoading || !isBatchActionable(selectedBatch)
                        }
                      >
                        {approving
                          ? "Approving…"
                          : isBatchActionable(selectedBatch)
                          ? "Approve"
                          : "Already Approved"}
                      </button>
                    </div>
                  </div>

                  <div className="tAR-inline-body-results">
                    <div className="rap" ref={printRootRef}>
                      <ResultsSheetAP
                        sheetTitle={selectedBatch.name}
                        departmentName={selectedBatch.departmentName}
                        semesterName={selectedBatch.semesterName}
                        batchName={selectedBatch.name}
                        statusLabel={STATUS_LABELS[selectedBatch.status] ?? selectedBatch.status}
                        results={selectedBatch.results}
                        loading={detailsLoading}
                      />
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
