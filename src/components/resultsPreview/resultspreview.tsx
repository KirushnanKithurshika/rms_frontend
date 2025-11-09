import React, { useMemo, useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import html2pdf from "html2pdf.js";
import "./resultspreview.css";
import Logo from "../../assets/ResultsP_Logo.png";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectUserId } from "../../features/auth/selectors";
import {
  fetchAllocationsByLecturer,
  fetchResultsPreview,
} from "../../features/resultsPreview/resultsPreviewSlice";

// No dummy data; wired to backend

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
  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
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
              className={`dropdown-option ${
                value === opt.value ? "active" : ""
              }`}
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
  const dispatch = useAppDispatch();
  const userId = useAppSelector(selectUserId);
  const allocations = useAppSelector((s) => s.resultsPreview.allocations);
  const allocationsLoading = useAppSelector(
    (s) => s.resultsPreview.allocationsLoading
  );
  const results = useAppSelector((s) => s.resultsPreview.results);
  const resultsLoading = useAppSelector((s) => s.resultsPreview.resultsLoading);
  const [activeTab, setActiveTab] = useState<"CA" | "FE">("CA");
  const [selectedAllocationId, setSelectedAllocationId] = useState<
    number | null
  >(null);

  useEffect(() => {
    // Convert userId to lecturerId is done server-side in endpoint; here we have direct lecturer endpoints.
    // We assume caller provides lecturerId; if not, you can add a prefetch here.
    // For now, require that lecturerId equals userId mapping on backend, or expose lecturerId in auth if needed.
    if (!userId) return;
    // If your backend requires lecturerId (not userId), you can store lecturerId in auth or fetch once and keep in Redux.
    dispatch(fetchAllocationsByLecturer(userId as number));
  }, [dispatch, userId]);

  const courseOptions: Option[] = useMemo(() => {
    return allocations.map((a) => ({
      value: String(a.allocationId),
      label: `${a.course.courseCode} - ${a.course.courseName} (${a.semester.name})`,
    }));
  }, [allocations]);

  const handleCourseChange = (allocIdString: string) => {
    const id = Number(allocIdString);
    setSelectedAllocationId(Number.isFinite(id) ? id : null);
  };

  useEffect(() => {
    if (!selectedAllocationId) return;
    const type = activeTab === "CA" ? "CA" : "END_EXAM";
    dispatch(
      fetchResultsPreview({
        allocationId: selectedAllocationId,
        type,
        page: 0,
        size: 50,
        includeMeta: true,
      })
    );
  }, [dispatch, selectedAllocationId, activeTab]);

  // -------- PDF Export (only results content) ----------
  const handleExportPDF = async () => {
    const input = document.querySelector(".rp-results-content") as HTMLElement;
    if (!input) return;

    // Temporarily expand table to full width so no columns are clipped
    const wrap = input.querySelector(".rp-table-wrap") as HTMLElement | null;
    const table = input.querySelector(".rp-table") as HTMLElement | null;
    const original: any = {};
    try {
      if (wrap && table) {
        original.wrapOverflow = wrap.style.overflow;
        original.wrapWidth = wrap.style.width;
        original.tableMinWidth = table.style.minWidth;
        // Expand wrapper to full table width
        wrap.style.overflow = "visible";
        const fullWidth = table.scrollWidth || table.clientWidth;
        if (fullWidth) {
          wrap.style.width = `${fullWidth}px`;
        }
        table.style.minWidth = "auto";
      }

      const code = (results as any)?.header?.course?.courseCode ?? "Course";
      const tab = activeTab === "CA" ? "CA" : "EndExam";

      const fullWidthPx = table?.scrollWidth || input.scrollWidth || 794;
      const orientation = fullWidthPx > 900 ? "landscape" : "portrait"; // switch if very wide

      const pageWidthMm = orientation === "portrait" ? 210 : 297;
      const pageHeightMm = orientation === "portrait" ? 297 : 210;
      const pageHeightPx = (fullWidthPx * pageHeightMm) / pageWidthMm;

      const opt = {
        // Slightly smaller bottom margin to avoid rounding-caused extra page
        margin: [10, 10, 8, 10],
        filename: `${code}_Results_${tab}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          scrollX: 0,
          scrollY: 0,
          windowWidth: fullWidthPx,
        },
        jsPDF: { unit: "mm", format: "a4", orientation },
        pagebreak: { mode: ["css", "legacy"] },
      } as any;

      // Build PDF, then prune trailing blank page heuristically
      const worker = (html2pdf() as any).set(opt).from(input).toPdf();
      await worker.get("pdf").then((pdf: any) => {
        const total = pdf.internal.getNumberOfPages();
        const contentHeightPx = input.scrollHeight;
        const pagesNeeded = Math.ceil(contentHeightPx / pageHeightPx);
        if (total > pagesNeeded) {
          // Remove extra trailing page
          pdf.deletePage(total);
        }
        pdf.save(opt.filename);
      });
    } catch (e) {
      console.error("Export PDF failed", e);
    } finally {
      if (wrap && table) {
        wrap.style.overflow = original.wrapOverflow ?? "";
        wrap.style.width = original.wrapWidth ?? "";
        table.style.minWidth = original.tableMinWidth ?? "";
      }
    }
  };

  return (
    <div className="rp-container">
      {/* Header */}
      <div className="rp-header no-print">
        <h3 className="rp-title">Results Preview</h3>
        <div className="rp-select-row">
          <CustomDropdownVL
            label="Select Course Allocation"
            options={courseOptions}
            value={selectedAllocationId ? String(selectedAllocationId) : ""}
            placeholder={
              allocationsLoading ? "Loading..." : "Select Allocation"
            }
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
                    <h4>
                      {results && "header" in results
                        ? (results as any).header?.course?.courseName
                        : ""}
                    </h4>
                    <p>
                      CA Marks (Total {(results as any)?.header?.totals?.caWeightTotal ?? ""}%)
                    </p>
                  </div>
                  <div className="rp-logo">
                    <img src={Logo} alt="University/Department Logo" />
                  </div>
                  <div className="rp-section rp-right">
                    <p>
                      {(results as any)?.header?.semester?.year ?? ""} <br />
                      {(results as any)?.header?.semester?.batchName ?? ""}{" "}
                      <br />
                      Module Code:{" "}
                      {(results as any)?.header?.course?.courseCode ?? ""}
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
                        {Array.isArray((results as any)?.header?.assessments)
                          ? (results as any).header.assessments.map(
                              (a: any) => (
                                <th
                                  key={a.assessmentId}
                                >{`${a.title} (${a.maxMarks})`}</th>
                              )
                            )
                          : null}
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray((results as any)?.students)
                        ? (results as any).students.map(
                            (s: any, idx: number) => (
                              <tr key={s.studentId}>
                                <td>{idx + 1}</td>
                                <td>{s.regNo}</td>
                                <td>{s.name}</td>
                                {(
                                  (results as any).header?.assessments || []
                                ).map((a: any) => (
                                  <td key={a.assessmentId}>
                                    {s.marksByAssessmentId?.[
                                      String(a.assessmentId)
                                    ] ?? "-"}
                                  </td>
                                ))}
                                <td>{s.total ?? ""}</td>
                                <td
                                  className={
                                    (s.status ?? "").toUpperCase() === "PASS"
                                      ? "ok"
                                      : "bad"
                                  }
                                >
                                  {s.status}
                                </td>
                              </tr>
                            )
                          )
                        : null}
                    </tbody>
                  </table>
                </div>
                <footer className="rp-print-footer">
                  Printed on: {new Date().toLocaleDateString()}
                </footer>
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
                    <h4>
                      {results && "header" in results
                        ? (results as any).header?.course?.courseName
                        : ""}
                    </h4>
                    <p>
                      Final Exam (Total {(results as any)?.header?.endExam?.weight ?? ""}%)
                    </p>
                  </div>
                  <div className="rp-logo">
                    <img src={Logo} alt="University/Department Logo" />
                  </div>
                  <div className="rp-section rp-right">
                    <p>
                      {(results as any)?.header?.semester?.year ?? ""} <br />
                      {(results as any)?.header?.semester?.batchName ?? ""}{" "}
                      <br />
                      Module Code:{" "}
                      {(results as any)?.header?.course?.courseCode ?? ""}
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
                        <th>
                          Final Exam
                          {(results as any)?.header?.endExam?.maxMarks
                            ? ` (${(results as any).header.endExam.maxMarks})`
                            : ""}
                        </th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray((results as any)?.students)
                        ? (results as any).students.map(
                            (s: any, idx: number) => (
                              <tr key={s.studentId}>
                                <td>{idx + 1}</td>
                                <td>{s.regNo}</td>
                                <td>{s.name}</td>
                                <td>{s.endExamMarks ?? ""}</td>
                                <td
                                  className={
                                    (s.status ?? "").toUpperCase() === "PASS"
                                      ? "ok"
                                      : "bad"
                                  }
                                >
                                  {s.status}
                                </td>
                              </tr>
                            )
                          )
                        : null}
                    </tbody>
                  </table>
                </div>
                <footer className="rp-print-footer">
                  Printed on: {new Date().toLocaleDateString()}
                </footer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPreview;
