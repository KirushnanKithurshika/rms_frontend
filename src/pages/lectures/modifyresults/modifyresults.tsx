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
  const [savingRowId, setSavingRowId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allocationsLoadedRef = useRef(false);
  const baseRowsRef = useRef<EditableResultRow[]>([]);
  const hasResultCacheRef = useRef<Record<number, boolean>>({});

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

  // Load results preview for allocation + type, then build assessments + rows
  useEffect(() => {
    const load = async () => {
      if (!selectedAllocationId) return;
      setLoading(true);
      setError(null);
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
        const targetAssessmentId = selectedAssessmentId ?? (ass[0]?.assessmentId ?? null);
        if (!targetAssessmentId) {
          setRows([]);
          baseRowsRef.current = [];
          return;
        }

        // First, check if this assessment has any results at all
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

        if (!hasResults) {
          setRows([]);
          baseRowsRef.current = [];
          setError("This assessment does not have results to edit.");
          return;
        }

        const built: EditableResultRow[] = await Promise.all(
          students.map(async (s: any) => {
            const marksMap = s.marksByAssessmentId || {};
            const fallbackMarks =
              marksMap[String(targetAssessmentId)] ??
              (activeType === "END_EXAM" ? s.endExamMarks : null);

            try {
              const ar = await api.get(
                `/v1/assessment-results/GetByStudentAndAssessment`,
                {
                  params: {
                    studentId: s.studentId,
                    assessmentId: targetAssessmentId,
                  },
                }
              );
              const d = ar.data?.data ?? ar.data;
              return {
                resultId: d?.id != null ? Number(d.id) : null,
                assessmentId: targetAssessmentId,
                studentId: d?.studentId ?? s.studentId,
                studentRegNo: d?.studentRegNo ?? s.regNo,
                studentName: d?.studentName ?? s.name,
                marksObtained:
                  d?.marksObtained != null
                    ? Number(d.marksObtained)
                    : fallbackMarks != null
                    ? Number(fallbackMarks)
                    : null,
                remarks: d?.remarks ?? "",
              } as EditableResultRow;
            } catch {
              // No existing result; still show row with fallback marks
              return {
                resultId: null,
                assessmentId: targetAssessmentId,
                studentId: s.studentId,
                studentRegNo: s.regNo,
                studentName: s.name,
                marksObtained:
                  fallbackMarks != null ? Number(fallbackMarks) : null,
                remarks: "",
              } as EditableResultRow;
            }
          })
        );
        setRows(built);
        baseRowsRef.current = built;
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || "Failed to load results";
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

  const handleMarksChange = (idx: number, value: string) => {
    setRows((prev) =>
      prev.map((r, i) =>
        i === idx ? { ...r, marksObtained: value === "" ? null : Number(value) } : r
      )
    );
  };

  const handleRemarksChange = (idx: number, value: string) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, remarks: value } : r)));
  };

  const isRowDirty = (row: EditableResultRow) => {
    const base = baseRowsRef.current.find(
      (r) => r.assessmentId === row.assessmentId && r.studentId === row.studentId
    );
    if (!base) return false;
    return (
      (base.marksObtained ?? null) !== (row.marksObtained ?? null) ||
      (base.remarks ?? "") !== (row.remarks ?? "")
    );
  };

  const saveRow = async (row: EditableResultRow) => {
    if (!row.resultId) {
      toast.error("Result id not available for this row");
      return;
    }
    if (row.marksObtained == null || isNaN(row.marksObtained)) {
      toast.error("Enter a valid mark");
      return;
    }
    setSavingRowId(row.resultId);
    try {
      const body = {
        marksObtained: row.marksObtained,
        remarks: row.remarks ?? "",
      };
      const res = await api.put(`/v1/assessment-results/Update/${row.resultId}`, body);
      const msg = res.data?.message || "Assessment result updated";
      toast.success(msg);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Failed to update";
      toast.error(msg);
    } finally {
      setSavingRowId(null);
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

            {!loading && !error && selectedAllocationId && selectedAssessmentId && (
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
                        <td>
                          <input
                            className="input"
                            type="number"
                            value={r.marksObtained ?? ""}
                            onChange={(e) => handleMarksChange(idx, e.target.value)}
                            style={{ maxWidth: 90 }}
                          />
                        </td>
                        <td>
                          <input
                            className="input"
                            value={r.remarks}
                            onChange={(e) => handleRemarksChange(idx, e.target.value)}
                          />
                        </td>
                        <td>
                          {r.resultId ? (
                            <button
                              type="button"
                              className="btn small"
                              onClick={() => saveRow(r)}
                              disabled={
                                (savingRowId !== null && savingRowId === r.resultId) ||
                                !isRowDirty(r)
                              }
                            >
                              {savingRowId !== null && savingRowId === r.resultId ? (
                                <FaTimes />
                              ) : (
                                <>
                                  <FaSave style={{ marginRight: 4 }} /> Update
                                </>
                              )}
                            </button>
                          ) : (
                            <span style={{ color: "#9ca3af", fontSize: 12 }}>
                              No existing result
                            </span>
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
    </div>
  );
};

export default ModifyResults;
