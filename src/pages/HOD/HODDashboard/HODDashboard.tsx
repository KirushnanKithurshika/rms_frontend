import React, { useEffect, useMemo, useState } from "react";
import Navbarin from "../../../components/Navbar/navbarin";
import BreadcrumbNav from "../../../components/breadcrumbnav/breadcrumbnav";
import { FaRegFilePdf } from "react-icons/fa";
import "./hoddashboard.css";
import { downloadExactHtmlPdf } from "../../../utils/downloadResultsSheetPdf";
import api from "../../../services/api";

import FinalResultsHOD from "../../../components/HOD/HODViewResultsSheet/HODViewResultsSheet";
import SignatureBoardRS from "../../../components/resultsApproval/SignatureCanvasResultsSheet/SignatureCanvasRS";
import type {
  SubjectMeta,
  StudentResult,
} from "../../../components/HOD/HODViewResultsSheet/HODViewResultsSheet";

interface HODResultSheet {
  id: number;
  courseCode: string;
  courseTitle: string;
  batch: string;
  semester: string;
  approved?: boolean;
  subjectMeta: SubjectMeta;
  results: StudentResult[];
}

type CourseSummary = {
  allocationId: number;
  courseCode: string;
  courseTitle: string;
  batch: string;
  semester: string;
  semesterId?: number;
  hasSheet: boolean;
  approved: boolean;
};

type ResultBatchStatus = "BATCH_CREATED" | "DEPT_APPROVED" | string;

type ResultBatch = {
  id: number;
  name: string;
  semesterId: number;
  semesterName: string;
  departmentId: number;
  departmentName: string;
  status: ResultBatchStatus;
  resultCount: number;
};

const HODDashboard: React.FC = () => {
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [departmentName, setDepartmentName] = useState<string>("");
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [sheets, setSheets] = useState<HODResultSheet[]>([]);
  const [activeSheetId, setActiveSheetId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSemesterKey, setSelectedSemesterKey] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
  const [batchName, setBatchName] = useState("");
  const [batchError, setBatchError] = useState<string | null>(null);
  const [currentBatch, setCurrentBatch] = useState<ResultBatch | null>(null);
  const [creatingBatch, setCreatingBatch] = useState(false);
  const [approvingBatch, setApprovingBatch] = useState(false);
  const [hodSignature, setHodSignature] = useState<string | null>(null);

  const semesterOptions = useMemo(() => {
    const map = new Map<string, { key: string; name: string; id: number | null }>();
    courses.forEach((c) => {
      const name = c.semester || "Unspecified";
      const id = typeof c.semesterId === "number" ? c.semesterId : null;
      const key = `${id ?? "na"}::${name}`;
      if (!map.has(key)) {
        map.set(key, { key, name, id });
      }
    });
    return Array.from(map.values());
  }, [courses]);

  const semesterNames = useMemo(() => {
    const names = new Set<string>();
    courses.forEach((c) => names.add(c.semester || "Unspecified"));
    return Array.from(names);
  }, [courses]);

  useEffect(() => {
    let cancelled = false;

    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const depRes = await api.get("/v1/user/department-id");
        const depRaw = depRes.data?.data ?? depRes.data;
        const depId = Number(
          typeof depRaw === "object" && depRaw !== null ? depRaw?.departmentId : depRaw
        );
        if (!depId || Number.isNaN(depId)) {
          throw new Error("Unable to determine department.");
        }
        if (!cancelled) {
          setDepartmentId(depId);
        }

        const dashRes = await api.get(`/v1/departments/${depId}/hod-dashboard`);
        const payload = dashRes.data?.data ?? dashRes.data;
        if (cancelled) return;

        setDepartmentName(payload?.departmentName ?? "");
        const incomingCourses = payload?.courses ?? [];
        setCourses(incomingCourses);
        setSheets(payload?.sheets ?? []);
        setCurrentBatch(null);
        setBatchError(null);
        setBatchName("");
        setSelectedSemesterKey((prev) => prev);
      } catch (e: any) {
        if (cancelled) return;
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Failed to load HOD dashboard.";
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!semesterOptions.length) {
      setSelectedSemesterKey(null);
      setSelectedSemester(null);
      setSelectedSemesterId(null);
      return;
    }
    const exists = semesterOptions.some((opt) => opt.key === selectedSemesterKey);
    if (!exists) {
      setSelectedSemesterKey(semesterOptions[0].key);
    }
  }, [semesterOptions, selectedSemesterKey]);

  useEffect(() => {
    if (!selectedSemesterKey) {
      setSelectedSemester(null);
      setSelectedSemesterId(null);
      return;
    }
    const match = semesterOptions.find((opt) => opt.key === selectedSemesterKey);
    setSelectedSemester(match?.name ?? null);
    setSelectedSemesterId(match?.id ?? null);
  }, [selectedSemesterKey, semesterOptions]);

  useEffect(() => {
    if (!selectedSemester) return;
    setBatchName((prev) => (prev ? prev : `${selectedSemester} Batch`));
  }, [selectedSemester]);

  const activeSheet = activeSheetId
    ? sheets.find((s) => s.id === activeSheetId) || null
    : null;

  const openSheet = (sheet: HODResultSheet) => {
    setActiveSheetId(sheet.id);
  };

  const handleBackFromResults = () => {
    setActiveSheetId(null);
  };

  const getCoursesBySemester = (semester: string) =>
    courses.filter((c) => c.semester === semester);

  const handleDownloadPdf = async () => {
    if (!activeSheet) return;

    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve())
    );

    await downloadExactHtmlPdf(
      "#results-pdf-root",
      `${activeSheet.courseCode}-${activeSheet.courseTitle}.pdf`
    );
  };

  const handleCreateBatch = async () => {
    if (!departmentId || !selectedSemesterId) {
      setBatchError("Select a semester that includes a valid ID.");
      return;
    }
    if (!batchName.trim()) {
      setBatchError("Provide a batch name.");
      return;
    }

    setCreatingBatch(true);
    setBatchError(null);
    try {
      const res = await api.post("/result-batches", null, {
        params: {
          name: batchName.trim(),
          semesterId: selectedSemesterId,
          departmentId,
        },
      });
      const data = (res.data?.data ?? res.data) as ResultBatch;
      setCurrentBatch(data);
      setHodSignature(null);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Failed to create batch.";
      setBatchError(msg);
    } finally {
      setCreatingBatch(false);
    }
  };

  const handleApproveBatch = async () => {
    if (!currentBatch?.id) {
      setBatchError("Create a batch before approving.");
      return;
    }
    if (!hodSignature) {
      setBatchError("Please capture your signature before approval.");
      return;
    }
    setApprovingBatch(true);
    setBatchError(null);
    try {
      const res = await api.post(`/result-batches/${currentBatch.id}/approve-department`, {
        signatureImage: hodSignature,
      });
      const data = (res.data?.data ?? res.data) as ResultBatch;
      setCurrentBatch(data);
      setHodSignature(null);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Failed to approve batch.";
      setBatchError(msg);
    } finally {
      setApprovingBatch(false);
    }
  };

  const renderSemesterSection = (semester: string) => {
    const semesterCourses = getCoursesBySemester(semester);
    const batchLabel = semesterCourses[0]?.batch;

    return (
      <section className="hod-semester-section" key={semester}>
        <div className="hod-semester-header">
          <span>{semester}</span>
          {batchLabel && <span className="hod-batch-label">{batchLabel}</span>}
        </div>

        <section className="pa-scope pa-wrap">
          <div className="pa-list">
            {semesterCourses.length === 0 && (
              <span className="hod-empty-placeholder" />
            )}

            {semesterCourses.map((course) => {
              const sheet = sheets.find(
                (s) =>
                  s.courseCode === course.courseCode &&
                  s.semester === course.semester &&
                  s.batch === course.batch
              );

              const canOpen = Boolean(sheet);
              const isApproved = sheet?.approved ?? course.approved;
              const isPending = !canOpen;

              return (
                <div
                  key={`${semester}-${course.courseCode}-${course.batch}`}
                  className="pa-card"
                  role="group"
                  aria-label={`${course.courseCode}-${course.courseTitle}`}
                >
                  <div className="pa-card-left">
                    <FaRegFilePdf className="pa-icon" aria-hidden="true" />
                    <div className="pa-title">
                      {course.courseCode}-{course.courseTitle}
                    </div>
                  </div>

                  <button
                    className={`pa-button ${
                      isApproved
                        ? "hod-approved"
                        : isPending
                        ? "hod-pending"
                        : ""
                    }`}
                    onClick={() => canOpen && sheet && openSheet(sheet)}
                    disabled={!canOpen}
                  >
                    {isPending
                      ? "Pending"
                      : isApproved
                      ? "Approved"
                      : "View"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </section>
    );
  };

  return (
    <div className="lec-dashboard-container">
      <div className="hod-role-label">HOD</div>
      {departmentName && (
        <div className="hod-role-subtitle">
          {departmentName} {departmentId ? `(ID: ${departmentId})` : ""}
        </div>
      )}

      <div className="nav">
        <Navbarin />
      </div>

      <div className="breadcrumb">
        <BreadcrumbNav />
      </div>

      <div className="dashboard-content-approval">
        <div className="main-area-approval">
          <div className="card-approval">
            <div className="CAA">
              <div className="tARD">
                <span className="tAR-heading">Pending Results Approval</span>
              </div>

              {!activeSheet && (
                <div className="tAR-inline-body-results">
                  <div className="hod-batch-panel">
                    <div className="batch-panel-header">
                      <div>
                        <h3>Create/Approve Result Batch</h3>
                        <p>Select a semester, provide a batch name, then create and approve.</p>
                      </div>
                      {currentBatch && (
                        <span className={`batch-status ${currentBatch.status?.toLowerCase()}`}>
                          {currentBatch.status.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                    <div className="batch-panel-grid">
                      <label className="batch-field">
                        <span>Semester</span>
                        <select
                          value={selectedSemesterKey ?? ""}
                          onChange={(e) =>
                            setSelectedSemesterKey(e.target.value || null)
                          }
                        >
                          <option value="">Select semester</option>
                          {semesterOptions.map((opt) => (
                            <option
                              key={opt.key}
                              value={opt.key}
                              disabled={!opt.id}
                            >
                              {opt.name}
                              {opt.id ? ` (ID: ${opt.id})` : " (ID missing)"}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="batch-field">
                        <span>Batch Name</span>
                        <input
                          type="text"
                          value={batchName}
                          onChange={(e) => setBatchName(e.target.value)}
                          placeholder="e.g. Sem 02 - 22nd Batch"
                        />
                      </label>
                      <div className="batch-actions">
                        <button
                          type="button"
                          className="taAR-btn"
                          onClick={handleCreateBatch}
                          disabled={
                            creatingBatch ||
                            !selectedSemesterId ||
                            !departmentId ||
                            !batchName.trim()
                          }
                        >
                          {creatingBatch ? "Creating..." : "Create Batch"}
                        </button>
                        <button
                          type="button"
                          className="taAR-btn taAR-btn--ghost"
                          onClick={handleApproveBatch}
                          disabled={
                            approvingBatch ||
                            !currentBatch ||
                            currentBatch.status === "DEPT_APPROVED"
                          }
                        >
                          {approvingBatch
                            ? "Approving..."
                            : currentBatch?.status === "DEPT_APPROVED"
                            ? "Approved"
                            : "Approve Department"}
                        </button>
                      </div>
                    </div>
                    {currentBatch?.status !== "DEPT_APPROVED" && (
                      <div className="hod-signature-panel">
                        <h4>Department Board Signature</h4>
                        <SignatureBoardRS value={hodSignature} onChange={setHodSignature} />
                        <span className="hod-signature-hint">
                          Save your signature before approving the batch.
                        </span>
                      </div>
                    )}
                    {batchError && (
                      <div className="hod-error" role="alert">
                        {batchError}
                      </div>
                    )}
                    {currentBatch && (
                      <div className="batch-summary">
                        <span>
                          <strong>ID:</strong> {currentBatch.id}
                        </span>
                        <span>
                          <strong>Results:</strong> {currentBatch.resultCount}
                        </span>
                        <span>
                          <strong>Semester:</strong> {currentBatch.semesterName}
                        </span>
                      </div>
                    )}
                  </div>
                  {error && (
                    <div className="hod-error" role="alert">
                      {error}
                    </div>
                  )}
                  {loading && (
                    <div className="hod-loading">Loading dashboard...</div>
                  )}
                  {!loading && !error && semesterNames.length === 0 && (
                    <div className="hod-empty-placeholder">
                      No courses available for approval.
                    </div>
                  )}
                  {!loading &&
                    !error &&
                    semesterNames.map((semester) => renderSemesterSection(semester))}
                </div>
              )}

              {activeSheet && (
                <>
                  <div className="tAR-inline">
                    <div className="tAR-inline-topbar">
                      <button
                        type="button"
                        className="taAR-btn taAR-btn--ghost"
                        onClick={handleBackFromResults}
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
                    </div>
                  </div>

                  <div className="tAR-inline-body-results">
                    <FinalResultsHOD
                      subject={activeSheet.subjectMeta}
                      results={activeSheet.results}
                      onBack={handleBackFromResults}
                    />
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

export default HODDashboard;
