import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Navbarin from "../../../components/Navbar/navbarin";
import "./ResultsApproval.css";
import PendingApprovals from "../../../components/resultsApproval/ResultsAppAdministration/PendingApproval";
import ResultsApprovalSidebar from "../../../components/resultsApproval/ResultsApprovalSidebar/reapproval";
import ResultsSheetAP from "../../../components/resultsApproval/ResultsSheetAP/ResultsSheetAP";
import type {
  ResultSheetRow,
  ApprovalSignature,
} from "../../../components/resultsApproval/ResultsSheetAP/ResultsSheetAP";
import SignatureBoardRS from "../../../components/resultsApproval/SignatureCanvasResultsSheet/SignatureCanvasRS";
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
  approvals?: ApprovalSignature[];
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
  const canRelease = privileges?.includes("RELEASE_RESULT");
  const approvalLevel: ApprovalLevel | null = canApproveSenate
    ? "SENATE"
    : canApproveFaculty
    ? "FACULTY"
    : null;
  const showReleaseOnly = !approvalLevel && canRelease;
  const noAccess = !approvalLevel && !canRelease;

  const [batches, setBatches] = useState<ResultBatchResponse[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<ResultBatchResponse | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [releaseSignature, setReleaseSignature] = useState<string | null>(null);
  const printRootRef = useRef<HTMLDivElement | null>(null);

  const completedStatus = approvalLevel === "SENATE" ? "SENATE_APPROVED" : "FACULTY_APPROVED";
  const currentLevelKey =
    approvalLevel === "SENATE" ? "SENATE" : approvalLevel === "FACULTY" ? "FACULTY_COMMITTEE" : null;

  const fetchBatches = useCallback(async () => {
    if (noAccess) return;
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
  }, [noAccess]);

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
    setSignatureData(null);
  };

  useEffect(() => {
    setSignatureData(null);
    setReleaseSignature(null);
  }, [selectedId, approvalLevel]);

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
    const signatureRequired =
      !currentApprovalRecord?.signatureUrl && approvalLevel !== null && !!currentLevelKey;
    if (signatureRequired && !signatureData) {
      showError("Please capture your signature before approving.");
      return;
    }

    setApproving(true);
    setError(null);
    try {
      const path =
        approvalLevel === "SENATE"
          ? `/result-batches/${selectedBatch.id}/approve-senate`
          : `/result-batches/${selectedBatch.id}/approve-faculty`;

      const payload = signatureData ? { signatureImage: signatureData } : {};
      await api.post(path, payload);
      showSuccess("Batch approved successfully.");
      await fetchBatches();
      await fetchBatchDetails(selectedBatch.id);
      setSignatureData(null);
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

  const handleRelease = async () => {
    if (!selectedBatch || !releaseActionEnabled) return;
    if (!releaseSignature) {
      showError("Please capture your signature before releasing.");
      return;
    }
    setReleasing(true);
    setError(null);
    try {
      await api.post(`/result-batches/${selectedBatch.id}/release`, {
        signatureImage: releaseSignature,
      });
      showSuccess("Batch released successfully.");
      await fetchBatches();
      await fetchBatchDetails(selectedBatch.id);
      setReleaseSignature(null);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to release batch.";
      setError(msg);
      showError(msg);
    } finally {
      setReleasing(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedBatch) return;
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await downloadExactHtmlPdf("#results-pdf-root", `${selectedBatch.name}.pdf`);
  };

  const approvalHeading = approvalLevel === "SENATE"
    ? "Senate Result Approval"
    : approvalLevel === "FACULTY"
    ? "Dean Result Approval"
    : canRelease
    ? "Results Release"
    : "Results Approval";

  const displayBatches = useMemo(() => {
    if (approvalLevel) return batches;
    if (canRelease) {
      return batches.filter((b) => ["SENATE_APPROVED", "RELEASED"].includes(b.status));
    }
    return [];
  }, [approvalLevel, batches, canRelease]);

  const pendingItems = useMemo(
    () =>
      displayBatches.map((batch) => {
        const actionableApproval = approvalLevel ? isBatchActionable(batch) : false;
        const actionableRelease = !approvalLevel && canRelease && batch.status === "SENATE_APPROVED";
        const actionable = actionableApproval || actionableRelease;
        const statusLabel = STATUS_LABELS[batch.status] ?? batch.status;
        const statusClass = actionable
          ? "pending"
          : approvalLevel
          ? batch.status === completedStatus
            ? "approved"
            : "neutral"
          : batch.status === "RELEASED"
          ? "approved"
          : "neutral";
        const actionLabel = actionable
          ? approvalLevel
            ? "View & Approve"
            : "View & Release"
          : "View";
        return {
          id: String(batch.id),
          title: batch.name,
          subtitle: [batch.departmentName, batch.semesterName].filter(Boolean).join(" • "),
          statusText: statusLabel,
          statusClass,
          meta: `${batch.resultCount ?? 0} results`,
          actionLabel,
        };
      }),
    [approvalLevel, canRelease, completedStatus, displayBatches, isBatchActionable]
  );

  const currentApprovalRecord = useMemo(() => {
    if (!currentLevelKey || !selectedBatch?.approvals) return null;
    return selectedBatch.approvals.find((a) => a.level === currentLevelKey) ?? null;
  }, [currentLevelKey, selectedBatch]);
  const requiresSignature =
    !!(
      approvalLevel &&
      currentLevelKey &&
      selectedBatch &&
      isBatchActionable(selectedBatch) &&
      !currentApprovalRecord?.signatureUrl
    );
  const releaseRecord = useMemo(
    () =>
      selectedBatch?.approvals?.find((a) => a.level === "SPECIAL_RESULTS_BOARD") ?? null,
    [selectedBatch]
  );
  const releaseActionEnabled = Boolean(
    canRelease && selectedBatch && selectedBatch.status === "SENATE_APPROVED"
  );
  const releaseRequiresSignature = releaseActionEnabled && !releaseRecord?.signatureUrl;

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
                <span className="tAR-heading">{approvalHeading}</span>
              </div>

              {noAccess && (
                <div className="tAR-inline-body-results">
                  <p>You do not have permission to approve result batches.</p>
                </div>
              )}

              {!noAccess && !selectedId && (
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

              {!noAccess && selectedId && selectedBatch && (
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

                      {approvalLevel && (
                        <button
                          type="button"
                          className="taAR-btn"
                          onClick={handleApprove}
                          disabled={
                            approving || detailsLoading || !isBatchActionable(selectedBatch)
                              || (requiresSignature && !signatureData)
                          }
                        >
                          {approving
                            ? "Approving…"
                            : isBatchActionable(selectedBatch)
                            ? "Approve"
                            : "Already Approved"}
                        </button>
                      )}
                    </div>
                  </div>

                  {approvalLevel && (
                    <div className="signature-panel">
                      <div className="signature-panel-header">
                        <span>
                          {currentApprovalRecord?.signatureUrl
                            ? "Signature recorded"
                            : "Capture your signature"}
                        </span>
                        {currentApprovalRecord?.decidedAt && (
                          <span>
                            {new Date(currentApprovalRecord.decidedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {currentApprovalRecord?.signatureUrl ? (
                        <div className="signature-preview">
                          <img
                            src={currentApprovalRecord.signatureUrl}
                            alt="Recorded signature"
                          />
                          <p className="signature-info">
                            Signed by {currentApprovalRecord.approver ?? "N/A"}
                          </p>
                        </div>
                      ) : (
                        <SignatureBoardRS value={signatureData} onChange={setSignatureData} />
                      )}
                    </div>
                  )}

                  {selectedBatch && (releaseActionEnabled || releaseRecord) && (
                    <div className="signature-panel">
                      <div className="signature-panel-header">
                        <span>Assistant Registrar Release Signature</span>
                        {releaseRecord?.decidedAt && (
                          <span>{new Date(releaseRecord.decidedAt).toLocaleString()}</span>
                        )}
                      </div>
                      {releaseRecord?.signatureUrl ? (
                        <div className="signature-preview">
                          <img src={releaseRecord.signatureUrl} alt="Release signature" />
                          <p className="signature-info">
                            Signed by {releaseRecord.approver ?? "N/A"}
                          </p>
                        </div>
                      ) : (
                        <>
                          <SignatureBoardRS
                            value={releaseSignature}
                            onChange={setReleaseSignature}
                          />
                          {releaseActionEnabled && (
                            <button
                              type="button"
                              className="taAR-btn"
                              onClick={handleRelease}
                              disabled={releasing || !releaseSignature}
                            >
                              {releasing ? "Releasing…" : "Release Results"}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  <div className="tAR-inline-body-results">
                    <div className="rap" ref={printRootRef}>
                      <ResultsSheetAP
                        sheetTitle={selectedBatch.name}
                        departmentName={selectedBatch.departmentName}
                        semesterName={selectedBatch.semesterName}
                        batchName={selectedBatch.name}
                        statusLabel={STATUS_LABELS[selectedBatch.status] ?? selectedBatch.status}
                        results={selectedBatch.results}
                        approvals={selectedBatch.approvals}
                        finalApprovalDate={releaseRecord?.decidedAt ?? undefined}
                        pendingReleaseSignature={releaseSignature}
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
