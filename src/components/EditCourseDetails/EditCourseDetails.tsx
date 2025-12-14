import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import "./EditCourseDetails.css";

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

/* ---------- Page/Form component ---------- */
type CourseDraft = {
  code: string;
  title: string;
  academicYear: string;
  department: string;
  semester: string;
  degreeProgram: string;
  creditValue: string;
  coordinator: string;
  coordinatorId: string;
  email: string;
  assessments: string[];
};

type Props = {
  /** Optional initial values when editing an existing course */
  initial?: Partial<CourseDraft>;
  /** Bubble up actions if you want to handle in parent */
  onUpdate?: (payload: CourseDraft) => void;
  onCancel?: () => void;
};

const EditCourseDetails: React.FC<Props> = ({ initial, onUpdate, onCancel }) => {
  // static options
  const academicYears = ["2020/2021","2021/2022","2022/2023","2023/2024","2024/2025"];
  const departments = ["Computer Engineering","Electrical Engineering","Mechanical Engineering","Marine Engineering","Civil Engineering"];
  const semesters = ["Semester 1","Semester 2","Semester 3","Semester 4","Semester 5","Semester 6","Semester 7","Semester 8"];

  // build initial snapshot (what “Cancel” restores)
  const initialSnapshot: CourseDraft = useMemo(
    () => ({
      code: initial?.code ?? "",
      title: initial?.title ?? "",
      academicYear: initial?.academicYear ?? "",
      department: initial?.department ?? "",
      semester: initial?.semester ?? "",
      degreeProgram: initial?.degreeProgram ?? "",
      creditValue: initial?.creditValue ?? "",
      coordinator: initial?.coordinator ?? "",
      coordinatorId: initial?.coordinatorId ?? "",
      email: initial?.email ?? "",
      assessments: initial?.assessments ?? [],
    }),
    [initial]
  );

  // form state
  const [code, setCode] = useState(initialSnapshot.code);
  const [title, setTitle] = useState(initialSnapshot.title);
  const [academicYear, setAcademicYear] = useState(initialSnapshot.academicYear);
  const [department, setDepartment] = useState(initialSnapshot.department);
  const [semester, setSemester] = useState(initialSnapshot.semester);
  const [degreeProgram, setDegreeProgram] = useState(initialSnapshot.degreeProgram);
  const [creditValue, setCreditValue] = useState(initialSnapshot.creditValue);
  const [coordinator, setCoordinator] = useState(initialSnapshot.coordinator);
  const [coordinatorId, setCoordinatorId] = useState(initialSnapshot.coordinatorId);
  const [email, setEmail] = useState(initialSnapshot.email);
  const [assessments, setAssessments] = useState<string[]>(initialSnapshot.assessments);

  // assessment input
  const [assessmentInput, setAssessmentInput] = useState("");

  // detect “dirty” (any change vs. snapshot)
  const isDirty = useMemo(() => {
    const snap = initialSnapshot;
    return !(
      code === snap.code &&
      title === snap.title &&
      academicYear === snap.academicYear &&
      department === snap.department &&
      semester === snap.semester &&
      degreeProgram === snap.degreeProgram &&
      creditValue === snap.creditValue &&
      coordinator === snap.coordinator &&
      coordinatorId === snap.coordinatorId &&
      email === snap.email &&
      JSON.stringify(assessments) === JSON.stringify(snap.assessments)
    );
  }, [
    code, title, academicYear, department, semester, degreeProgram, creditValue,
    coordinator, coordinatorId, email, assessments, initialSnapshot
  ]);

  // helpers: assessments
  const addAssessment = (raw: string) => {
    const v = raw.trim().replace(/\s+/g, " ");
    if (!v) return;
    setAssessments((prev) =>
      prev.some((x) => x.toLowerCase() === v.toLowerCase()) ? prev : [...prev, v]
    );
  };
  const removeAssessment = (name: string) =>
    setAssessments((prev) => prev.filter((x) => x !== name));
  const handleAssessmentsKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addAssessment(assessmentInput);
      setAssessmentInput("");
    } else if (e.key === "Backspace" && !assessmentInput) {
      setAssessments((prev) => prev.slice(0, -1));
    }
  };

  // actions
  const handleUpdate = () => {
    const payload: CourseDraft = {
      code,
      title,
      academicYear,
      department,
      semester,
      degreeProgram,
      creditValue,
      coordinator,
      coordinatorId,
      email,
      assessments,
    };
    if (onUpdate) onUpdate(payload);
    else console.log("UPDATE course payload:", payload);
  };

  const handleCancel = () => {
    // restore snapshot
    setCode(initialSnapshot.code);
    setTitle(initialSnapshot.title);
    setAcademicYear(initialSnapshot.academicYear);
    setDepartment(initialSnapshot.department);
    setSemester(initialSnapshot.semester);
    setDegreeProgram(initialSnapshot.degreeProgram);
    setCreditValue(initialSnapshot.creditValue);
    setCoordinator(initialSnapshot.coordinator);
    setCoordinatorId(initialSnapshot.coordinatorId);
    setEmail(initialSnapshot.email);
    setAssessments(initialSnapshot.assessments);
    setAssessmentInput("");
    if (onCancel) onCancel();
  };

  return (
    <div className="form-wrapper">
      <div className="form-header-row">
        <h2 className="form-title">Edit Course</h2>

       
      </div>

      <form
        className="form-content"
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdate();
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

              <CustomDropdown
                label="Academic Year"
                options={academicYears}
                value={academicYear}
                placeholder="Select Academic Year"
                onChange={setAcademicYear}
              />
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
                options={departments}
                value={department}
                placeholder="Select Department"
                onChange={setDepartment}
              />
            </div>

            <div>
              <CustomDropdown
                label="Semester"
                options={semesters}
                value={semester}
                placeholder="Select Semester"
                onChange={setSemester}
              />

              <div className="form-group">
                <label>Degree Program</label>
                <input
                  className="input"
                  placeholder="Degree Program"
                  value={degreeProgram}
                  onChange={(e) => setDegreeProgram(e.target.value)}
                />
              </div>
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
        </div>

        <div className="section coordinator-section">
          <h3 className="section-headingCC">Coordinator Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Coordinator</label>
              <input
                className="input"
                placeholder="Coordinator"
                value={coordinator}
                onChange={(e) => setCoordinator(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Coordinator Staff ID</label>
              <input
                className="input"
                placeholder="Coordinator Staff ID"
                value={coordinatorId}
                onChange={(e) => setCoordinatorId(e.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label>Email Address</label>
              <input
                className="input"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="assessment-section">
          <h3 className="section-headingCC">Assessment Components</h3>

          <div className="form-group" style={{ marginBottom: "10px" }}>
            <input
              className="input"
              placeholder="Type assessment and press Enter"
              value={assessmentInput}
              onChange={(e) => setAssessmentInput(e.target.value)}
              onKeyDown={handleAssessmentsKeyDown}
              aria-label="Add assessment"
            />
          </div>

          {assessments.length > 0 && (
            <div className="chip-wrap">
              {assessments.map((a) => (
                <span className="chip" key={a}>
                  {a}
                  <button
                    type="button"
                    className="chip-x"
                    aria-label={`Remove ${a}`}
                    onClick={() => removeAssessment(a)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom actions (same as top for convenience) */}
        <div className="form-actions bottom-actions">
          <button type="button" className="btn ghost" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="btn primary" disabled={!isDirty}>
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCourseDetails;
