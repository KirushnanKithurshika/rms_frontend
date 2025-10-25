import React, { useMemo, useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./resultspreview.css";
import Logo from "../../assets/ResultsP_Logo.png";

// Dummy Data
const dummyData = [
  { id: "1", name: "Student A", project: 18, quiz1: 25, quiz2: 28, total: 71, status: "Pass" },
  { id: "2", name: "Student B", project: 15, quiz1: 22, quiz2: 27, total: 64, status: "Pass" },
  { id: "3", name: "Student C", project: 17, quiz1: 26, quiz2: 25, total: 68, status: "Pass" },
  { id: "4", name: "Student D", project: 19, quiz1: 27, quiz2: 29, total: 75, status: "Pass" },
  { id: "5", name: "Student E", project: 20, quiz1: 28, quiz2: 28, total: 76, status: "Pass" },
];

const courses = [
  { code: "EC7201", name: "Information Security" },
  { code: "EC7202", name: "Computer Networks" },
  { code: "EC7203", name: "Web Engineering" },
];

type Option = { value: string; label: string };

// Custom Dropdown
const CustomDropdownVL: React.FC<{
  label: string;
  options: Option[];
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}> = ({ label, options, value, placeholder, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const selected = useMemo(() => options.find((o) => o.value === value), [options, value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((o) => !o);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="form-group custom-dropdown rp-dd" ref={ref}>
      <label className="dropdown-label">{label}</label>
      <div
        className={`dropdown-selected ${open ? "open" : ""}`}
        tabIndex={0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <span className={`dropdown-icon ${open ? "rotate" : ""}`}>▾</span>
      </div>
      {open && (
        <div className="dropdown-options" role="listbox">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`dropdown-option ${value === opt.value ? "active" : ""}`}
              role="option"
              aria-selected={value === opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/** ------- Main Component ------- */
const ResultsPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"CA" | "FE">("CA");
  const [selectedCourse, setSelectedCourse] = useState(courses[0]);

  const courseOptions: Option[] = useMemo(
    () => courses.map((c) => ({ value: c.code, label: `${c.code} - ${c.name}` })),
    []
  );

  const handleCourseChange = (code: string) => {
    const course = courses.find((c) => c.code === code);
    if (course) setSelectedCourse(course);
  };

  // -------- PDF Export (only results content) ----------
  const handleExportPDF = async () => {
    const input = document.querySelector(".rp-results-content") as HTMLElement;
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 3, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;

    let heightLeft = pdfHeight;
    let position = 0;

    while (heightLeft > 0) {
      pdf.addImage(imgData, "PNG", 0, position, pageWidth, pdfHeight);
      heightLeft -= pageHeight;
      position -= pageHeight;
      if (heightLeft > 0) pdf.addPage();
    }

    pdf.save(`${selectedCourse.code}_Results.pdf`);
  };

  return (
    <div className="rp-container">
      {/* Header */}
      <div className="rp-header no-print">
        <h3 className="rp-title">Results Preview</h3>
        <div className="rp-select-row">
          <CustomDropdownVL
            label="Select Course"
            options={courseOptions}
            value={selectedCourse.code}
            placeholder="Select Course"
            onChange={handleCourseChange}
          />
        </div>
        <hr className="rp-divider" />
      </div>

      {/* Tabs */}
      <div className="rp-tabs no-print">
        <button
          className={`rp-tab ${activeTab === "CA" ? "is-active" : ""}`}
          onClick={() => setActiveTab("CA")}
        >
          Continuous Assessment
        </button>
        <button
          className={`rp-tab ${activeTab === "FE" ? "is-active" : ""}`}
          onClick={() => setActiveTab("FE")}
        >
          Final Exam
        </button>
        <button className="rp-tab rp-print-btn" onClick={handleExportPDF}>
          Export PDF
        </button>
      </div>

      {/* Results Page */}
      <div className="rp-page">
        {activeTab === "CA" && (
          <div className="rp-card">
            <div className="rp-results-content">
              <div className="results-page">
                <div className="rp-card-header">
                  <div className="rp-section">
                    <h4>{selectedCourse.name}</h4>
                    <p>CA Marks (Total 40%)</p>
                  </div>
                  <div className="rp-logo">
                    <img src={Logo} alt="University/Department Logo" />
                  </div>
                  <div className="rp-section rp-right">
                    <p>
                      2024 <br />
                      22nd Batch <br />
                      Department: Computer Engineering <br />
                      Module Code: {selectedCourse.code}
                    </p>
                  </div>
                </div>
                <div className="rp-table-wrap">
                  <table className="rp-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Project (20)</th>
                        <th>Quiz 1 (30)</th>
                        <th>Quiz 2 (30)</th>
                        <th>Total (80)</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dummyData.map((s, idx) => (
                        <tr key={s.id}>
                          <td>{idx + 1}</td>
                          <td>{s.id}</td>
                          <td>{s.name}</td>
                          <td>{s.project}</td>
                          <td>{s.quiz1}</td>
                          <td>{s.quiz2}</td>
                          <td>{s.total}</td>
                          <td className={s.status === "Pass" ? "ok" : "bad"}>{s.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <footer className="rp-print-footer">Printed on: {new Date().toLocaleDateString()}</footer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "FE" && (
          <div className="rp-card">
            <div className="rp-results-content">
              <div className="results-page">
                <div className="rp-card-header">
                  <div className="rp-section">
                    <h4>{selectedCourse.name}</h4>
                    <p>Final Exam (Total 60%)</p>
                  </div>
                  <div className="rp-logo">
                    <img src={Logo} alt="University/Department Logo" />
                  </div>
                  <div className="rp-section rp-right">
                    <p>
                      2024 <br />
                      22nd Batch <br />
                      Department: Computer Engineering <br />
                      Module Code: {selectedCourse.code}
                    </p>
                  </div>
                </div>
                <div className="rp-table-wrap">
                  <table className="rp-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Final Exam (60)</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dummyData.map((s, idx) => {
                        const fe = Math.max(0, (s.total ?? 0) - 40);
                        return (
                          <tr key={s.id}>
                            <td>{idx + 1}</td>
                            <td>{s.id}</td>
                            <td>{s.name}</td>
                            <td>{fe}</td>
                            <td className={s.status === "Pass" ? "ok" : "bad"}>{s.status}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <footer className="rp-print-footer">Printed on: {new Date().toLocaleDateString()}</footer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPreview;
