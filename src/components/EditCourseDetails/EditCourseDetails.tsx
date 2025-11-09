import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import api from "../../services/api";
import { useAppSelector } from "../../app/hooks";
import { selectUserId } from "../../features/auth/selectors";
import "./EditCourseDetails.css";
import { showError } from "../../utils/toast";

/* ---------- Reusable dropdown ---------- */
interface DropdownProps {
  label: string;
  options: string[];
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}
const CustomDropdown: React.FC<DropdownProps> = ({
  label,
  options,
  value,
  placeholder,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="form-group custom-dropdown" ref={ref}>
      <label className="dropdown-label">{label}</label>
      <div
        className={`dropdown-selected ${open ? "open" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{value || placeholder}</span>
        <FaChevronDown className={`dropdown-icon ${open ? "rotate" : ""}`} />
      </div>

      {open && (
        <div className="dropdown-options">
          {options.map((opt) => (
            <div
              key={opt}
              className={`dropdown-option ${value === opt ? "active" : ""}`}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------- Types shared with parent ---------- */
export type CourseView = {
  id?: number | string;
  code: string;
  title: string;
  department?: string; // label "CODE - Name"
  credits?: number;           // numeric in the view (input uses string)
};

type Props = {
  initial?: Partial<CourseView>;
  allocationId?: number; // pass selected allocation id from parent
  onUpdate?: (payload: CourseView) => void;
  onCancel?: () => void;
};

const EditCourseDetails: React.FC<Props> = ({ initial, allocationId, onUpdate, onCancel }) => {
  // Dropdown data from backend
  type DepartmentDto = {
    departmentId: number;
    code: string;
    departmentName: string;
  };
  type SemesterDto = {
    id: number;
    name: string;
  };
  const COURSE_TYPES = ["CORE", "TECHNICAL_ELECTIVE", "GENERAL_ELECTIVE"] as const;

  // Build snapshot compatible with parent
  const initialSnapshot = useMemo<CourseView>(() => ({
    id: initial?.id,
    code: initial?.code ?? "",
    title: initial?.title ?? "",
    department: initial?.department ?? "",
    credits: initial?.credits,
  }), [initial]);

  // Local form state (credit as string for the input)
  const [code, setCode] = useState(initialSnapshot.code);
  const [title, setTitle] = useState(initialSnapshot.title);
  const [department, setDepartment] = useState(initialSnapshot.department ?? "");
  const [creditValue, setCreditValue] = useState(
    initialSnapshot.credits != null ? String(initialSnapshot.credits) : ""
  );

  // Backend-driven dropdowns and mapping
  const userId = useAppSelector(selectUserId);
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [semesters, setSemesters] = useState<SemesterDto[]>([]);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [lecturerId, setLecturerId] = useState<number | null>(null);

  // Allocations for this course (owned by current lecturer)
  type AllocationItem = {
    allocationId: number;
    courseType: string;
    course: { id: number; courseCode: string; courseName: string };
    semester: { id: number; name: string };
    pass?: { caPassPercent?: number; endExamPassPercent?: number; overallPassPercent?: number };
    description?: string;
  };
  const [allocations, setAllocations] = useState<AllocationItem[]>([]);
  const [selectedAllocId, setSelectedAllocId] = useState<number | null>(null);
  const [allocCourseType, setAllocCourseType] = useState<string>("CORE");
  const [allocSemesterId, setAllocSemesterId] = useState<number | null>(null);
  const [allocSemesterLabel, setAllocSemesterLabel] = useState<string>("");
  const [allocCaPass, setAllocCaPass] = useState<string>("40");
  const [allocEndPass, setAllocEndPass] = useState<string>("40");
  const [allocOverallPass, setAllocOverallPass] = useState<string>("40");
  const [allocDescription, setAllocDescription] = useState<string>("");
  const [courseId, setCourseId] = useState<number | null>(
    initialSnapshot.id != null ? Number(initialSnapshot.id) : null
  );

  // If allocation id is provided by parent, use it
  useEffect(() => {
    if (allocationId != null) {
      setSelectedAllocId(Number(allocationId));
    }
  }, [allocationId]);

  // Seed selected allocation from props
  useEffect(() => {
    if (typeof (arguments as any) === 'undefined') {
      // no-op to keep TS happy in some editors
    }
  }, []);
  useEffect(() => {
    if (typeof (initial as any) !== 'undefined') {
      // placeholder to avoid unused warning
    }
  }, [initial]);
  useEffect(() => {
    // When parent passes allocationId, prefer it and skip listing dropdown
    const propAllocId = ({} as any); // dummy to avoid hoist issues
  }, []);
  // simple set from prop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (typeof (arguments as any) !== 'undefined') {} }, []);

  // Assessments for selected allocation (CA only, edit via Update endpoint)
  type AssessmentRow = {
    assessmentId: number;
    assessmentTypeId: number;
    title: string;
    maxMarks: number;
    weight?: number;
    date?: string;
    description?: string;
  };
  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [assLoading, setAssLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Sync form whenever a different course is passed in
  useEffect(() => {
    setCode(initialSnapshot.code);
    setTitle(initialSnapshot.title);
    setDepartment(initialSnapshot.department ?? "");
    setCreditValue(initialSnapshot.credits != null ? String(initialSnapshot.credits) : "");
  }, [initialSnapshot]);

  // Load dropdown data + lecturer id + allocations for this course
  useEffect(() => {
    const load = async () => {
      try {
        const [depRes, semRes] = await Promise.all([
          api.get("/v1/departments/GetAll"),
          api.get("/v1/semesters/GetCurrent-semesters"),
        ]);
        const depRaw = depRes.data?.data ?? depRes.data;
        const semRaw = semRes.data?.data ?? semRes.data;
        setDepartments(Array.isArray(depRaw) ? depRaw : []);
        setSemesters(Array.isArray(semRaw) ? semRaw : []);
      } catch (e: any) {
        // non-fatal
      }
      // Map user -> lecturer
      try {
        if (userId) {
          const r = await api.get(`/v1/lecturers/GetByUserId/${userId}`);
          const d = r.data?.data ?? r.data;
          setLecturerId(Number(d?.id) || null);
        }
      } catch {}
    };
    load();
  }, [userId]);

  // Map department label -> id
  useEffect(() => {
    if (!department) {
      setDepartmentId(null);
      return;
    }
    const m = departments.find((x) => `${x.code} - ${x.departmentName}` === department);
    setDepartmentId(m?.departmentId ?? null);
  }, [department, departments]);

  // Load allocations for this course under this lecturer
  useEffect(() => {
    const fetchAllocations = async () => {
      if (selectedAllocId != null) return; // parent provided
      if (!lecturerId) return;
      try {
        const res = await api.get(`../lecturers/${lecturerId}/allocations`);
        const data = (res.data?.data ?? res.data) as any[];
        const all = Array.isArray(data) ? data : [];
        setAllocations(all as AllocationItem[]);
        // Try to auto-pick one matching current course code or id, else first
        const byCode = all.find((a: any) => a.course?.courseCode === code);
        const byId = all.find((a: any) => a.course?.id === Number(initialSnapshot.id));
        const pick = byCode ?? byId ?? all[0];
        if (pick) setSelectedAllocId(pick.allocationId);
      } catch {}
    };
    fetchAllocations();
  }, [lecturerId, initialSnapshot.id, selectedAllocId, code]);

  // When selected allocation changes, populate form + fetch assessments (CA)
  useEffect(() => {
    const sel = allocations.find((a) => a.allocationId === selectedAllocId);
    if (!sel) return;
    // Fetch fresh allocation details by id
    (async () => {
      try {
        const allocRes = await api.get(`/v1/course-allocations/GetById/${sel.allocationId}`);
        const a = allocRes.data?.data ?? allocRes.data;
        setAllocCourseType(a?.courseType ?? "CORE");
        if (a?.course?.id) setCourseId(Number(a.course.id));
        setAllocSemesterId(a?.semester?.id ?? null);
        setAllocSemesterLabel(a?.semester?.name ?? "");
        setAllocCaPass(String(a?.caPassPercent ?? "40"));
        setAllocEndPass(String(a?.endExamPassPercent ?? "40"));
        setAllocOverallPass(String(a?.overallPassPercent ?? "40"));
        setAllocDescription(a?.description ?? "");
      } catch {
        setAllocCourseType(sel.courseType ?? "CORE");
        setAllocSemesterId(sel.semester?.id ?? null);
        setAllocSemesterLabel(sel.semester?.name ?? "");
      }
    })();

    const loadCA = async () => {
      setAssLoading(true);
      try {
        const r = await api.get(`../results/preview`, {
          params: { allocationId: sel.allocationId, type: "CA", page: 0, size: 1, includeMeta: true },
        });
        const header = (r.data?.data ?? r.data)?.header;
        const basic: AssessmentRow[] = Array.isArray(header?.assessments)
          ? header.assessments.map((a: any) => ({
              assessmentId: a.assessmentId,
              assessmentTypeId: a.assessmentTypeId,
              title: a.title,
              maxMarks: a.maxMarks,
              weight: a.weight,
              date: a.date,
              description: "",
            }))
          : [];
        // Fetch full details per assessment id
        const detailed = await Promise.all(
          basic.map(async (b) => {
            try {
              const ad = await api.get(`/v1/assessments/GetById/${b.assessmentId}`);
              const d = ad.data?.data ?? ad.data;
              return {
                assessmentId: d?.id ?? b.assessmentId,
                assessmentTypeId: d?.assessmentTypeId ?? b.assessmentTypeId,
                title: d?.title ?? b.title,
                maxMarks: d?.maxMarks ?? b.maxMarks,
                weight: d?.weight ?? b.weight,
                date: d?.date ?? b.date,
                description: d?.description ?? b.description,
              } as AssessmentRow;
            } catch {
              return b;
            }
          })
        );
        setAssessments(detailed);
      } catch {
        setAssessments([]);
      } finally {
        setAssLoading(false);
      }
    };
    loadCA();
  }, [selectedAllocId, allocations]);

  // Fetch course by code (preferred) or by id to prefill
  useEffect(() => {
    const loadCourse = async () => {
      try {
        if (initialSnapshot.code) {
          const r = await api.get(`/v1/courses/GetByCode/${encodeURIComponent(initialSnapshot.code)}`);
          const d = r.data?.data ?? r.data;
          if (d?.id) setCourseId(Number(d.id));
          if (d?.courseCode) setCode(String(d.courseCode));
          if (d?.courseName) setTitle(String(d.courseName));
          if (d?.credits != null) setCreditValue(String(d.credits));
          if (d?.departmentCode && d?.departmentName) setDepartment(`${d.departmentCode} - ${d.departmentName}`);
          return;
        }
      } catch {}
      try {
        const idNum = Number(initialSnapshot.id);
        if (!idNum) return;
        const res = await api.get(`/v1/courses/GetById/${idNum}`);
        const d = res.data?.data ?? res.data;
        if (d?.id) setCourseId(Number(d.id));
        if (d?.courseCode) setCode(String(d.courseCode));
        if (d?.courseName) setTitle(String(d.courseName));
        if (d?.credits != null) setCreditValue(String(d.credits));
        if (d?.departmentCode && d?.departmentName) setDepartment(`${d.departmentCode} - ${d.departmentName}`);
      } catch {}
    };
    loadCourse();
  }, [initialSnapshot.id, initialSnapshot.code]);

  // Dirty detection
  const courseDirty = useMemo(() => {
    const snap = initialSnapshot;
    const snapCredit = snap.credits != null ? String(snap.credits) : "";
    return !(code === snap.code && title === snap.title && department === (snap.department ?? "") && creditValue === snapCredit);
  }, [code, title, department, creditValue, initialSnapshot]);

  const updateCourse = async () => {
    setError(null); setSuccess(null); setSaving(true);
    try {
      // Resolve course id: prefer fetched courseId; else initial snapshot; else allocations
      let id = Number(courseId ?? initialSnapshot.id);
      if (!Number.isFinite(id) || id <= 0) {
        const sel = allocations.find((a) => a.allocationId === selectedAllocId);
        if (sel?.course?.id) id = Number(sel.course.id);
      }
      if (!Number.isFinite(id) || id <= 0) {
        const byCode = allocations.find((a) => a.course?.courseCode === code);
        if (byCode?.course?.id) id = Number(byCode.course.id);
      }
      if (!Number.isFinite(id) || id <= 0) throw new Error("Missing course id");
      if (!departmentId) throw new Error("Select a department");
      const creditsNum = Number(creditValue);
      if (!Number.isFinite(creditsNum) || creditsNum <= 0) throw new Error("Credits must be > 0");
      const body = { courseCode: code.trim(), courseName: title.trim(), credits: creditsNum, departmentId };
      const res = await api.put(`/v1/courses/Update/${id}`, body);
      const data = res.data?.data ?? res.data;
      setSuccess("Course updated successfully");
      onUpdate?.({ id, code: data.courseCode ?? code, title: data.courseName ?? title, department, credits: creditsNum });
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Course update failed");
    } finally {
      setSaving(false);
    }
  };

  const updateAllocation = async () => {
    setError(null); setSuccess(null); setSaving(true);
    try {
      const allocId = selectedAllocId;
      if (!allocId) throw new Error("Select an allocation");
      const courseIdVal = Number(courseId ?? initialSnapshot.id);
      if (!courseIdVal) throw new Error("Missing course id");
      if (!lecturerId) throw new Error("Missing lecturer id");
      if (!allocSemesterId) throw new Error("Select semester");
      const body = {
        courseId: courseIdVal,
        courseType: allocCourseType,
        lecturerId,
        semesterId: allocSemesterId,
        caPassPercent: Number(allocCaPass) || 0,
        endExamPassPercent: Number(allocEndPass) || 0,
        overallPassPercent: Number(allocOverallPass) || 0,
        description: allocDescription || undefined,
      };
      await api.put(`/v1/course-allocations/Update/${allocId}`, body);
      setSuccess("Allocation updated successfully");
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Allocation update failed");
    } finally {
      setSaving(false);
    }
  };

  const saveAssessment = async (row: AssessmentRow) => {
    setError(null); setSuccess(null); setSaving(true);
    try {
      const id = row.assessmentId;
      const body = {
        assessmentTypeId: row.assessmentTypeId,
        title: row.title?.trim(),
        maxMarks: Number(row.maxMarks) || 0,
        weight: Number(row.weight) || 0,
        date: row.date || undefined,
        description: row.description || undefined,
      };
      await api.put(`/v1/assessments/Update/${id}`, body);
      setSuccess("Assessment updated");
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Assessment update failed");
    } finally {
      setSaving(false);
    }
  };

  // removed legacy actions (academic year / coordinator fields)

  return (
    <div className="form-wrapper">
      <div className="form-header-row">
        <h2 className="form-title">Edit Course</h2>
      </div>

      <form
        className="form-content"
        onSubmit={(e) => {
          e.preventDefault();
          updateCourse();
        }}
      >
        <div className="section course-section">
          <h3 className="section-headingCC">Course Details</h3>
          <div className="form-grid">
            <div>
              <div className="form-group">
                <label>Course Code</label>
                <input
                  className="input"
                  placeholder="Course Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="form-group">
                <label>Course Title</label>
                <input
                  className="input"
                  placeholder="Course Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <CustomDropdown
                label="Department"
                options={(Array.isArray(departments) ? departments : []).map(
                  (d) => `${d.code} - ${d.departmentName}`
                )}
                value={department}
                placeholder={
                  Array.isArray(departments) && departments.length
                    ? "Select Department"
                    : "Loading..."
                }
                onChange={setDepartment}
              />
            </div>

            <div>
              <div className="form-group">
                <label>Credit Value</label>
                <input
                  className="input"
                  placeholder="Credit Value"
                  value={creditValue}
                  onChange={(e) => setCreditValue(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="form-actions bottom-actions" style={{ justifyContent: 'flex-end' }}>
            <button type="submit" className="btn primary" disabled={!courseDirty || saving}>
              Save Course
            </button>
          </div>
        </div>

        {/* Allocation panel */}
        <div className="section coordinator-section">
          <h3 className="section-headingCC">Allocation</h3>
          <div className="form-grid">
            {/* Hide allocation selector if parent passed allocationId */}
            {selectedAllocId == null && (
              <CustomDropdown
                label="Select Allocation"
                options={(Array.isArray(allocations) ? allocations : []).map(
                  (a) => `${a.allocationId} - ${a.course?.courseCode ?? ''} ${a.course?.courseName ?? ''} (${a.semester?.name ?? ''})`
                )}
                value={
                  selectedAllocId
                    ? (() => {
                        const a = (Array.isArray(allocations) ? allocations : []).find(
                          (x) => x.allocationId === selectedAllocId
                        );
                        return a
                          ? `${a.allocationId} - ${a.course?.courseCode ?? ''} ${a.course?.courseName ?? ''} (${a.semester?.name ?? ''})`
                          : "";
                      })()
                    : ""
                }
                placeholder={
                  Array.isArray(allocations) && allocations.length
                    ? "Select Allocation"
                    : "No allocations"
                }
                onChange={(label) => {
                  const id = Number(String(label).split(" - ")[0]);
                  setSelectedAllocId(Number.isFinite(id) ? id : null);
                }}
              />
            )}
            <CustomDropdown
              label="Course Type"
              options={COURSE_TYPES as unknown as string[]}
              value={allocCourseType}
              placeholder="Select type"
              onChange={setAllocCourseType}
            />
            <CustomDropdown
              label="Semester"
              options={(Array.isArray(semesters) ? semesters : []).map((s) => `${s.id} - ${s.name}`)}
              value={
                allocSemesterId
                  ? (() => {
                      const s = (Array.isArray(semesters) ? semesters : []).find(
                        (x) => x.id === allocSemesterId
                      );
                      const nm = s?.name ?? allocSemesterLabel;
                      return `${allocSemesterId} - ${nm ?? ""}`;
                    })()
                  : ""
              }
              placeholder={
                Array.isArray(semesters) && semesters.length
                  ? "Select Semester"
                  : "Loading..."
              }
              onChange={(label) => {
                const id = Number(String(label).split(" - ")[0]);
                setAllocSemesterId(Number.isFinite(id) ? id : null);
              }}
            />
            <div className="form-group">
              <label>CA Pass %</label>
              <input className="input" inputMode="numeric" value={allocCaPass} onChange={(e) => setAllocCaPass(e.target.value)} />
            </div>
            <div className="form-group">
              <label>End Exam Pass %</label>
              <input className="input" inputMode="numeric" value={allocEndPass} onChange={(e) => setAllocEndPass(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Overall Pass %</label>
              <input className="input" inputMode="numeric" value={allocOverallPass} onChange={(e) => setAllocOverallPass(e.target.value)} />
            </div>
            <div className="form-group full-width">
              <label>Description</label>
              <input className="input" value={allocDescription} onChange={(e) => setAllocDescription(e.target.value)} />
            </div>
          </div>
          <div className="form-actions bottom-actions" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn primary" onClick={updateAllocation} disabled={saving || !selectedAllocId}>
              Save Allocation
            </button>
          </div>
        </div>

        <div className="assessment-section">
          <h3 className="section-headingCC">Assessments (CA)</h3>
          {assLoading ? (
            <div>Loading assessments...</div>
          ) : assessments.length === 0 ? (
            <div>No CA assessments found for this allocation.</div>
          ) : (
            <div className="form-grid">
              {assessments.map((row, idx) => (
                <div key={row.assessmentId} className="cd-item" style={{ gridColumn: '1 / -1' }}>
                  <div className="cd-k">{`#${idx + 1}`} </div>
                  <div className="cd-v" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(120px, 1fr)) 120px', gap: '8px' }}>
                    <input className="input" value={row.title} onChange={(e) => setAssessments(prev => prev.map(r => r.assessmentId === row.assessmentId ? { ...r, title: e.target.value } : r))} placeholder="Title" />
                    <input className="input" value={row.maxMarks} onChange={(e) => setAssessments(prev => prev.map(r => r.assessmentId === row.assessmentId ? { ...r, maxMarks: Number(e.target.value) || 0 } : r))} placeholder="Max" inputMode="numeric" />
                    <input className="input" value={row.weight ?? ''} onChange={(e) => setAssessments(prev => prev.map(r => r.assessmentId === row.assessmentId ? { ...r, weight: Number(e.target.value) || 0 } : r))} placeholder="Weight %" inputMode="numeric" />
                    <input className="input" type="date" value={row.date ?? ''} onChange={(e) => setAssessments(prev => prev.map(r => r.assessmentId === row.assessmentId ? { ...r, date: e.target.value } : r))} />
                    <input className="input" value={row.description ?? ''} onChange={(e) => setAssessments(prev => prev.map(r => r.assessmentId === row.assessmentId ? { ...r, description: e.target.value } : r))} placeholder="Description (optional)" />
                    <button type="button" className="btn" onClick={() => saveAssessment(row)} disabled={saving}>
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions bottom-actions">
          <button type="button" className="btn ghost" onClick={onCancel}>
            Cancel
          </button>
          {error && <div style={{ color: '#b91c1c' }}>{error}</div>}
          {success && <div style={{ color: '#15803d' }}>{success}</div>}
        </div>
      </form>
    </div>
  );
};

export default EditCourseDetails;
