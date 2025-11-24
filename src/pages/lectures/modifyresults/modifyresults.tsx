import React, { useEffect, useMemo, useRef, useState } from "react";
import Navbarin from "../../../components/Navbar/navbarin.tsx";
import LectureSidebar from "../../../components/sidebarlecturer/coursesidebar.tsx";
import BreadcrumbNav from "../../../components/breadcrumbnav/breadcrumbnav.tsx";
import "./modifyresults.css";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { useAppSelector } from "../../../app/hooks";
import { selectUserId } from "../../../features/auth/selectors";
import api from "../../../services/api";
import { toast } from "react-toastify";

type AllocationItem = {
  allocationId: number;
  courseType: string;
  course: { id: number; courseCode: string; courseName: string };
  semester: { id: number; name: string };
};

type AssessmentInfo = {
  assessmentId: number;
  assessmentTypeId: number;
  title: string;
  group: "CA" | "END_EXAM";
  maxMarks?: number;
  weight?: number;
  date?: string;
};

type EditableResultRow = {
  resultId: number | null;
  assessmentId: number;
  studentId: number;
  studentRegNo: string;
  studentName: string;
  marksObtained: number | null;
  remarks: string;
};

type ResultType = "CA" | "END_EXAM";

type Option = { value: string; label: string };

const ModifyResults: React.FC = () => {
  const userId = useAppSelector(selectUserId);
  const [lecturerId, setLecturerId] = useState<number | null>(null);

  const [allocations, setAllocations] = useState<AllocationItem[]>([]);
  const [selectedAllocationId, setSelectedAllocationId] = useState<number | null>(null);
  const [activeType, setActiveType] = useState<ResultType>("CA");

  const [assessments, setAssessments] = useState<AssessmentInfo[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<number | null>(null);

  const [rows, setRows] = useState<EditableResultRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allocationsLoadedRef = useRef(false);
  const hasResultCacheRef = useRef<Record<number, boolean>>({});

  const [assessmentHasResults, setAssessmentHasResults] = useState<
    boolean | null
  >(null);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<EditableResultRow | null>(null);
  const [editMarks, setEditMarks] = useState<string>("");
  const [editRemarks, setEditRemarks] = useState<string>("");
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  // Map user -> lecturer
  useEffect(() => {
    const mapLecturer = async () => {
      if (!userId) return;
      try {
        const r = await api.get(`/v1/lecturers/GetByUserId/${userId}`);
        const d = r.data?.data ?? r.data;
        const lid = Number(d?.id) || null;
        setLecturerId(lid);
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || "Failed to resolve lecturer";
        setError(msg);
        toast.error(msg);
      }
    };
    mapLecturer();
  }, [userId]);

  // Load allocations once for this lecturer
  useEffect(() => {
    const load = async () => {
      if (!lecturerId || allocationsLoadedRef.current) return;
      try {
        const res = await api.get(`../lecturers/${lecturerId}/allocations`);
        const data = (res.data?.data ?? res.data) as any[];
        const all = Array.isArray(data) ? (data as AllocationItem[]) : [];
        setAllocations(all);
        if (all.length) setSelectedAllocationId(all[0].allocationId);
        allocationsLoadedRef.current = true;
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || "Failed to load allocations";
        setError(msg);
        toast.error(msg);
      }
    };
    load();
  }, [lecturerId]);

  // Load results preview for allocation + type, then build display rows
  useEffect(() => {
    const load = async () => {
      if (!selectedAllocationId) return;
      setLoading(true);
      setError(null);
      setAssessmentHasResults(null);
      try {
        const res = await api.get(`../results/preview`, {
          params: {
            allocationId: selectedAllocationId,
            type: activeType,
            page: 0,
            size: 50,
            includeMeta: true,
          },
        });
        const data = res.data?.data ?? res.data;
        const header = data?.header;
        const students = Array.isArray(data?.students) ? data.students : [];

        const ass: AssessmentInfo[] = Array.isArray(header?.assessments)
          ? header.assessments.map((a: any) => ({
              assessmentId: a.assessmentId,
              assessmentTypeId: a.assessmentTypeId,
              title: a.title,
              group: activeType,
              maxMarks: a.maxMarks,
              weight: a.weight,
              date: a.date,
            }))
          : [];
        setAssessments(ass);
        if (!selectedAssessmentId && ass.length) {
          setSelectedAssessmentId(ass[0].assessmentId);
        }

        // Build rows for a single assessment if already chosen
        const targetAssessmentId =
          selectedAssessmentId ?? ass[0]?.assessmentId ?? null;
        if (!targetAssessmentId) {
          setRows([]);
          setAssessmentHasResults(null);
          return;
        }

        // First, check if this assessment has any results at all (single call)
        let hasResults = hasResultCacheRef.current[targetAssessmentId];
        if (hasResults === undefined) {
          try {
            const hr = await api.get(
              `/v1/assessment-results/${targetAssessmentId}/has-result`
            );
            const raw = hr.data?.data ?? hr.data;
            hasResults = Boolean(raw);
            hasResultCacheRef.current[targetAssessmentId] = hasResults;
          } catch {
            hasResults = false;
            hasResultCacheRef.current[targetAssessmentId] = false;
          }
        }
        setAssessmentHasResults(hasResults);

        // If there are no results, do not build / show the table rows
        if (!hasResults) {
          setRows([]);
          return;
        }

        // Build simple display rows from preview only (no per-student fetch)
        const built: EditableResultRow[] = students.map((s: any) => {
          const marksMap = s.marksByAssessmentId || {};
          const fallbackMarks =
            marksMap[String(targetAssessmentId)] ??
            (activeType === "END_EXAM" ? s.endExamMarks : null);

          return {
            resultId: null, // resolved lazily when editing
            assessmentId: targetAssessmentId,
            studentId: s.studentId,
            studentRegNo: s.regNo,
            studentName: s.name,
            marksObtained:
              fallbackMarks !== undefined && fallbackMarks !== null
                ? Number(fallbackMarks)
                : null,
            remarks: "",
          } as EditableResultRow;
        });
        setRows(built);
      } catch (e: any) {
        const msg =
          e?.response?.data?.message || e?.message || "Failed to load results";
        setError(msg);
        toast.error(msg);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedAllocationId, activeType, selectedAssessmentId]);

  const allocationOptions: Option[] = useMemo(
    () =>
      allocations.map((a) => ({
        value: String(a.allocationId),
        label: `${a.course.courseCode} - ${a.course.courseName} (${a.semester.name})`,
      })),
    [allocations]
  );

  const assessmentOptions: Option[] = useMemo(
    () =>
      assessments.map((a) => ({
        value: String(a.assessmentId),
        label: `${a.title} (${a.group})`,
      })),
    [assessments]
  );

  const openEditModal = async (row: EditableResultRow) => {
    if (!selectedAssessmentId) return;

    // If assessment has no results at all, avoid per-student call
    if (assessmentHasResults === false) {
      toast.info("This assessment does not have results to edit.");
      return;
    }

    setIsEditModalOpen(true);
    setEditLoading(true);
    setEditingRow({
      ...row,
    });
    setEditMarks(
      row.marksObtained !== null && row.marksObtained !== undefined
        ? String(row.marksObtained)
        : ""
    );
    setEditRemarks(row.remarks ?? "");

    try {
      const ar = await api.get(
        `/v1/assessment-results/GetByStudentAndAssessment`,
        {
          params: {
            studentId: row.studentId,
            assessmentId: row.assessmentId,
          },
        }
      );
      const d = ar.data?.data ?? ar.data;
      if (!d || d.id == null) {
        throw new Error("No existing result found for this student.");
      }

      const fullRow: EditableResultRow = {
        resultId: Number(d.id),
        assessmentId: row.assessmentId,
        studentId: d.studentId ?? row.studentId,
        studentRegNo: d.studentRegNo ?? row.studentRegNo,
        studentName: d.studentName ?? row.studentName,
        marksObtained:
          d.marksObtained !== null && d.marksObtained !== undefined
            ? Number(d.marksObtained)
            : row.marksObtained,
        remarks: d.remarks ?? "",
      };
      setEditingRow(fullRow);
      setEditMarks(
        fullRow.marksObtained !== null && fullRow.marksObtained !== undefined
          ? String(fullRow.marksObtained)
          : ""
      );
      setEditRemarks(fullRow.remarks ?? "");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "No existing result for this student.";
      toast.error(msg);
      setIsEditModalOpen(false);
      setEditingRow(null);
    } finally {
      setEditLoading(false);
    }
  };

  const closeEditModal = () => {
    if (editSaving) return;
    setIsEditModalOpen(false);
    setEditingRow(null);
    setEditMarks("");
    setEditRemarks("");
    setEditLoading(false);
  };

  const saveEdit = async () => {
    if (!editingRow || editingRow.resultId == null) {
      toast.error("Result id not available for this student");
      return;
    }
    const marksNum =
      editMarks.trim() === "" ? NaN : Number(editMarks.trim());
    if (!Number.isFinite(marksNum)) {
      toast.error("Enter a valid mark");
      return;
    }

    setEditSaving(true);
    try {
      const body = {
        marksObtained: marksNum,
        remarks: editRemarks ?? "",
      };
      const res = await api.put(
        `/v1/assessment-results/Update/${editingRow.resultId}`,
        body
      );
      const msg = res.data?.message || "Assessment result updated";
      toast.success(msg);

      // Reflect changes in main table
      setRows((prev) =>
        prev.map((r) =>
          r.studentId === editingRow.studentId &&
          r.assessmentId === editingRow.assessmentId
            ? { ...r, marksObtained: marksNum, remarks: editRemarks }
            : r
        )
      );
      closeEditModal();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.message || "Failed to update";
      toast.error(msg);
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="lec-dashboard-container">
      <div className="nav">
        <Navbarin />
      </div>

      <div className="breadcrumb">
        <BreadcrumbNav />
      </div>

      <div className="main-area">
        <div className="sidebar">
          <LectureSidebar />
        </div>

        <div className="dashboard-content">
          <div className="card">
            <h3 className="cd-title">Modify Results</h3>

            {/* Allocation dropdown */}
            <div className="results-toolbar">
              <div className="form-group custom-dropdown">
                <label className="dropdown-label">Course Allocation</label>
                <select
                  className="input"
                  value={selectedAllocationId ? String(selectedAllocationId) : ""}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setSelectedAllocationId(Number.isFinite(id) ? id : null);
                  }}
                >
                  <option value="">Select Allocation</option>
                  {allocationOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type tabs */}
              <div className="rp-tabs">
                <button
                  className={`rp-tab ${activeType === "CA" ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setActiveType("CA")}
                >
                  CA
                </button>
                <button
                  className={`rp-tab ${activeType === "END_EXAM" ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setActiveType("END_EXAM")}
                >
                  End Exam
                </button>
              </div>

              {/* Assessment selector */}
              <div className="form-group custom-dropdown">
                <label className="dropdown-label">Assessment</label>
                <select
                  className="input"
                  value={selectedAssessmentId ? String(selectedAssessmentId) : ""}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setSelectedAssessmentId(Number.isFinite(id) ? id : null);
                  }}
                >
                  <option value="">Select Assessment</option>
                  {assessmentOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading && <p>Loading results...</p>}
            {error && <div className="error">{error}</div>}
            {!loading &&
              !error &&
              assessmentHasResults === false &&
              selectedAssessmentId && (
                <div className="error">
                  This assessment does not have results to edit.
                </div>
              )}

            {!loading &&
              !error &&
              selectedAllocationId &&
              selectedAssessmentId &&
              !!assessmentHasResults && (
              <div className="results-table-wrapper">
                <table className="results-table" aria-label="Assessment results table">
                  <thead>
                    <tr>
                      <th>Reg No</th>
                      <th>Name</th>
                      <th>Marks Obtained</th>
                      <th>Remarks</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, idx) => (
                      <tr key={`${r.studentId}-${r.assessmentId}`}>
                        <td>{r.studentRegNo}</td>
                        <td>{r.studentName}</td>
                        <td>{r.marksObtained ?? "-"}</td>
                        <td>{r.remarks ?? ""}</td>
                        <td>
                          {r.marksObtained === null ? (
                            <span style={{ color: "#9ca3af", fontSize: 12 }}>
                              No existing result
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn small"
                              onClick={() => openEditModal(r)}
                            >
                              <FaEdit style={{ marginRight: 4 }} /> Edit
                            </button>
                          )}
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

      {/* Edit Result Modal */}
      {isEditModalOpen && editingRow && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-result-title"
          onClick={closeEditModal}
        >
          <div
            className="modal"
            role="document"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            <div className="modal-header">
              <h4 id="edit-result-title">Edit Result</h4>
              <button
                className="close-btn"
                aria-label="Close"
                onClick={closeEditModal}
                disabled={editSaving}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {editLoading ? (
                <p>Loading result...</p>
              ) : (
                <>
                  <p>
                    <strong>Student:</strong> {editingRow.studentRegNo} —{" "}
                    {editingRow.studentName}
                  </p>
                  <p>
                    <strong>Assessment ID:</strong> {editingRow.assessmentId}
                  </p>
                  <div className="form-group">
                    <label>Marks Obtained</label>
                    <input
                      className="input"
                      type="number"
                      value={editMarks}
                      onChange={(e) => setEditMarks(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Remarks</label>
                    <input
                      className="input"
                      value={editRemarks}
                      onChange={(e) => setEditRemarks(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn-delete ghost"
                onClick={closeEditModal}
                disabled={editSaving}
              >
                Cancel
              </button>
              <button
                className="btn-delete danger"
                onClick={saveEdit}
                disabled={editSaving || editLoading}
              >
                {editSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <FaSave style={{ marginRight: 4 }} /> Update
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModifyResults;
