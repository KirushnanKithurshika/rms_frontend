import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
// Backend integration removed: keep UI only
// import api from "../../services/api";
import { useAppSelector } from "../../app/hooks";
import { selectUserId } from "../../features/auth/selectors";
import "./createcourseform.css";

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="form-group custom-dropdown" ref={dropdownRef}>
      <label className="dropdown-label">{label}</label>
      <div
        className={`dropdown-selected ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span>{value || placeholder}</span>
        <FaChevronDown className={`dropdown-icon ${open ? "rotate" : ""}`} />
      </div>

      {open && (
        <div className="dropdown-options">
          {options.map((option, index) => (
            <div
              key={index}
              className={`dropdown-option ${value === option ? "active" : ""}`}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

type DepartmentDto = {
  departmentId: number;
  code: string;
  departmentName: string;
  specializationTitle?: string;
  facultyId?: number;
  facultyName?: string;
};

type SemesterDto = {
  id: number;
  name: string;
  number?: number;
  year?: number;
  batchName?: string;
};

const COURSE_TYPES = [
  "CORE",
  "TECHNICAL_ELECTIVE",
  "GENERAL_ELECTIVE",
] as const;
type CourseType = (typeof COURSE_TYPES)[number];

const CreateCourseForm: React.FC = () => {
  const userId = useAppSelector(selectUserId);

  const [departmentLabel, setDepartmentLabel] = useState("");
  const [semesterLabel, setSemesterLabel] = useState("");
  const [courseType, setCourseType] = useState<CourseType>("CORE");

  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [semesters, setSemesters] = useState<SemesterDto[]>([]);

  // Mapped selections
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [semesterId, setSemesterId] = useState<number | null>(null);

  // Course fields
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [credits, setCredits] = useState<string>("");

  // Allocation fields
  const [caPassPercent, setCaPassPercent] = useState<string>("40");
  const [endExamPassPercent, setEndExamPassPercent] = useState<string>("40");
  const [overallPassPercent, setOverallPassPercent] = useState<string>("40");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lecturerId, setLecturerId] = useState<number | null>(null);

  // Assessments state (depends on allocation + type ids)
  type AssessmentGroup = "CA" | "END_EXAM";
  type AssessmentForm = {
    title: string;
    assessmentGroup: AssessmentGroup;
    maxMarks: string;
    weight: string;
    date: string; // yyyy-mm-dd
    description?: string;
  };
  const [assessments, setAssessments] = useState<AssessmentForm[]>([]);
  const [assDraft, setAssDraft] = useState<AssessmentForm>({
    title: "",
    assessmentGroup: "CA",
    maxMarks: "",
    weight: "",
    date: "",
    description: "",
  });
  const [assessError, setAssessError] = useState<string | null>(null);

  // Fetch departments and semesters from backend
  useEffect(() => {
    const load = async () => {
      // Integration removed: provide empty dropdowns
      setDepartments([]);
      setSemesters([]);
    };
    load();
  }, []);

  // Map current userId -> lecturerId via backend
  useEffect(() => {
    const fetchLecturer = async () => {
      if (!userId) return;
      // Integration removed: assume lecturerId equals userId for UI flow
      setLecturerId(Number(userId) || null);
    };
    fetchLecturer();
  }, [userId]);

  // Update mapped IDs when labels change
  useEffect(() => {
    if (departmentLabel) {
      const d = departments.find(
        (x) => `${x.code} - ${x.departmentName}` === departmentLabel
      );
      setDepartmentId(d?.departmentId ?? null);
    } else {
      setDepartmentId(null);
    }
  }, [departmentLabel, departments]);

  useEffect(() => {
    if (semesterLabel) {
      const s = semesters.find((x) => x.name === semesterLabel);
      setSemesterId(s?.id ?? null);
    } else {
      setSemesterId(null);
    }
  }, [semesterLabel, semesters]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!courseCode.trim() || !courseTitle.trim()) {
      setError("Course code and title are required");
      return;
    }
    const creditsNum = Number(credits);
    if (!Number.isFinite(creditsNum) || creditsNum <= 0) {
      setError("Credits must be a positive number");
      return;
    }
    if (!departmentId) {
      setError("Select a department");
      return;
    }
    if (!semesterId) {
      setError("Select a semester");
      return;
    }
    if (!userId) {
      setError("Not logged in");
      return;
    }
    if (!lecturerId) {
      setError("Lecturer profile not found for current user");
      return;
    }

    // Validate no duplicate assessment titles (case-insensitive)
    const titles = assessments
      .map((a) => a.title.trim().toLowerCase())
      .filter(Boolean);
    const unique = new Set(titles);
    if (titles.length !== unique.size) {
      setError(
        "Duplicate assessment titles detected. Please remove duplicates."
      );
      return;
    }

    // Validate each assessment has required fields (title, group, maxMarks, weight, date)
    for (const a of assessments) {
      if (!a.title.trim()) {
        setError("Every assessment must have a title");
        return;
      }
      if (!a.assessmentGroup) {
        setError("Every assessment must have a group (CA/END_EXAM)");
        return;
      }
      const mm = Number(a.maxMarks);
      if (!Number.isFinite(mm) || mm <= 0) {
        setError("Every assessment must have a positive Max Marks");
        return;
      }
      const ww = Number(a.weight);
      if (!Number.isFinite(ww) || ww <= 0) {
        setError("Every assessment must have a positive Weight %");
        return;
      }
      if (!a.date) {
        setError("Every assessment must have a date");
        return;
      }
    }

    const caP = Number(caPassPercent) || 0;
    const endP = Number(endExamPassPercent) || 0;
    const overP = Number(overallPassPercent) || 0;

    setSubmitting(true);
    try {
      // Integration removed: no server calls; emulate success
      const createdAssessCount = assessments.length;
      setSuccess(
        `Course created (offline), allocation saved (offline), ${createdAssessCount} assessment(s) processed (offline).`
      );
      // Optionally reset form
      setCourseCode("");
      setCourseTitle("");
      setCredits("");
      setDepartmentLabel("");
      setSemesterLabel("");
      setCourseType("CORE");
      setCaPassPercent("40");
      setEndExamPassPercent("40");
      setOverallPassPercent("40");
      setDescription("");
      setAssessments([]);
      setAssDraft({
        title: "",
        assessmentGroup: "CA",
        maxMarks: "",
        weight: "",
        date: "",
        description: "",
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Course creation failed";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-wrapper">
      <h2 className="form-title">Create Course</h2>

      <form className="form-content" onSubmit={handleSubmit}>
        <div className="section course-section">
          <h3 className="section-headingCC">Course Details</h3>
          <div className="form-grid">
            <div>
              <div className="form-group">
                <label>Course Code</label>
                <input
                  className="input"
                  placeholder="Course Code"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <div className="form-group">
                <label>Course Title</label>
                <input
                  className="input"
                  placeholder="Course Title"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  required
                />
              </div>

              <CustomDropdown
                label="Department"
                options={(Array.isArray(departments) ? departments : []).map(
                  (d) => `${d.code} - ${d.departmentName}`
                )}
                value={departmentLabel}
                placeholder={
                  Array.isArray(departments) && departments.length
                    ? "Select Department"
                    : "Loading..."
                }
                onChange={setDepartmentLabel}
              />
            </div>

            <div>
              <CustomDropdown
                label="Semester"
                options={(Array.isArray(semesters) ? semesters : []).map(
                  (s) => s.name
                )}
                value={semesterLabel}
                placeholder={
                  Array.isArray(semesters) && semesters.length
                    ? "Select Semester"
                    : "Loading..."
                }
                onChange={setSemesterLabel}
              />
            </div>

            <div>
              <div className="form-group">
                <label>Credit Value</label>
                <input
                  className="input"
                  placeholder="Credit Value"
                  inputMode="numeric"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Allocation config */}
        <div className="section coordinator-section">
          <h3 className="section-headingCC">Allocation</h3>
          <div className="form-grid">
            <CustomDropdown
              label="Course Type"
              options={COURSE_TYPES as unknown as string[]}
              value={courseType}
              placeholder="Select course type"
              onChange={(v) => setCourseType(v as CourseType)}
            />
            <div className="form-group">
              <label>CA Pass Percent</label>
              <input
                className="input"
                placeholder="CA Pass %"
                inputMode="numeric"
                value={caPassPercent}
                onChange={(e) => setCaPassPercent(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>End Exam Pass Percent</label>
              <input
                className="input"
                placeholder="End Exam Pass %"
                inputMode="numeric"
                value={endExamPassPercent}
                onChange={(e) => setEndExamPassPercent(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Overall Pass Percent</label>
              <input
                className="input"
                placeholder="Overall Pass %"
                inputMode="numeric"
                value={overallPassPercent}
                onChange={(e) => setOverallPassPercent(e.target.value)}
              />
            </div>
            <div className="form-group full-width">
              <label>Description</label>
              <input
                className="input"
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Assessments: title first, then group, others the same */}
        <div className="assessment-section">
          <h3 className="section-headingCC">Assessments</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Assessment Title</label>
              <input
                className="input"
                placeholder="Assessment title"
                value={assDraft.title}
                onChange={(e) =>
                  setAssDraft((a) => ({ ...a, title: e.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label>Group</label>
              <select
                className="input"
                value={assDraft.assessmentGroup}
                onChange={(e) =>
                  setAssDraft((a) => ({
                    ...a,
                    assessmentGroup: e.target.value as AssessmentGroup,
                  }))
                }
              >
                <option value="CA">CA</option>
                <option value="END_EXAM">END_EXAM</option>
              </select>
            </div>
            <div className="form-group">
              <label>Max Marks</label>
              <input
                className="input"
                placeholder="Max marks"
                inputMode="numeric"
                value={assDraft.maxMarks}
                onChange={(e) =>
                  setAssDraft((a) => ({ ...a, maxMarks: e.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label>Weight %</label>
              <input
                className="input"
                placeholder="Weight %"
                inputMode="numeric"
                value={assDraft.weight}
                onChange={(e) =>
                  setAssDraft((a) => ({ ...a, weight: e.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                className="input"
                type="date"
                value={assDraft.date}
                onChange={(e) =>
                  setAssDraft((a) => ({ ...a, date: e.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                className="input"
                placeholder="Description (optional)"
                value={assDraft.description}
                onChange={(e) =>
                  setAssDraft((a) => ({ ...a, description: e.target.value }))
                }
              />
            </div>
          </div>
          <div
            className="submit-button-createcoursediv"
            style={{ justifyContent: "flex-start" }}
          >
            <button
              type="button"
              className=""
              onClick={() => {
                const t = assDraft.title.trim();
                if (!t) {
                  setAssessError("Assessment title is required");
                  return;
                }
                const exists = assessments.some(
                  (a) => a.title.trim().toLowerCase() === t.toLowerCase()
                );
                if (exists) {
                  setAssessError(
                    "An assessment with this title already exists"
                  );
                  return;
                }
                if (!assDraft.assessmentGroup) {
                  setAssessError("Please select a group (CA/END_EXAM)");
                  return;
                }
                const mm = Number(assDraft.maxMarks);
                if (!Number.isFinite(mm) || mm <= 0) {
                  setAssessError("Max Marks is required and must be > 0");
                  return;
                }
                const ww = Number(assDraft.weight);
                if (!Number.isFinite(ww) || ww <= 0) {
                  setAssessError("Weight % is required and must be > 0");
                  return;
                }
                if (!assDraft.date) {
                  setAssessError("Date is required");
                  return;
                }
                setAssessments((prev) => [...prev, assDraft]);
                setAssDraft({
                  title: "",
                  assessmentGroup: "CA",
                  maxMarks: "",
                  weight: "",
                  date: "",
                  description: "",
                });
                setAssessError(null);
              }}
              style={{
                background: "#0a2558",
                color: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "8px 12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              + Add Assessment
            </button>
          </div>
          {assessError && (
            <div style={{ color: "#b91c1c", marginTop: 8 }}>{assessError}</div>
          )}
          {assessments.length > 0 && (
            <div className="chip-wrap">
              {assessments.map((a, i) => (
                <span className="chip" key={`${a.title}-${i}`}>
                  {a.assessmentGroup}: {a.title} ({a.maxMarks} marks, {a.weight}
                  %)
                  <button
                    type="button"
                    className="chip-x"
                    aria-label={`Remove ${a.title}`}
                    onClick={() =>
                      setAssessments((prev) =>
                        prev.filter((_, idx) => idx !== i)
                      )
                    }
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {error && <div style={{ color: "#b91c1c", marginTop: 8 }}>{error}</div>}
        {success && (
          <div style={{ color: "#15803d", marginTop: 8 }}>{success}</div>
        )}
        <div className="submit-button-createcoursediv">
          <button
            type="submit"
            className="submit-button-createcourse"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create course"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCourseForm;
