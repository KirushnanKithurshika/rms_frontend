import React, { useMemo } from "react";
import "./ResultsSheetAp.css";
import SignatureBoardRS from "../SignatureCanvasResultsSheet/SignatureCanvasRS";
import ResultsTable from "./ResultsTable/ResultsTable";

export type ResultSheetRow = {
  id?: number;
  studentRegNo?: string;
  studentName?: string;
  courseCode?: string;
  courseName?: string;
  gradeLetter?: string | null;
  gradePoint?: number | null;
  totalPercent?: number | null;
  status?: string | null;
};

export type ApprovalSignature = {
  level?: string;
  approver?: string | null;
  signatureUrl?: string | null;
  decidedAt?: string | null;
};

type Props = {
  university?: string;
  facultyLine?: string;
  departmentName?: string;
  specialization?: string;
  sheetTitle?: string;
  provisionalLine?: string;
  version?: string;
  summaryNote?: string;
  semesterName?: string;
  batchName?: string;
  statusLabel?: string;
  results?: ResultSheetRow[];
  loading?: boolean;
  finalApprovalDate?: string | Date;
  approvals?: ApprovalSignature[];
};

const DEFAULT_ROWS: ResultSheetRow[] = [
  {
    id: 1,
    studentRegNo: "EG/2020/3801",
    studentName: "Student A A",
    courseCode: "CE1101",
    courseName: "Mathematics I",
    gradeLetter: "A",
    status: "FACULTY_APPROVED",
  },
  {
    id: 2,
    studentRegNo: "EG/2020/3801",
    studentName: "Student A A",
    courseCode: "CE1202",
    courseName: "Engineering Mechanics",
    gradeLetter: "B+",
    status: "FACULTY_APPROVED",
  },
  {
    id: 3,
    studentRegNo: "EG/2020/3802",
    studentName: "Student B B",
    courseCode: "CE1101",
    courseName: "Mathematics I",
    gradeLetter: "B",
    status: "FACULTY_APPROVED",
  },
  {
    id: 4,
    studentRegNo: "EG/2020/3802",
    studentName: "Student B B",
    courseCode: "CE1202",
    courseName: "Engineering Mechanics",
    gradeLetter: "A-",
    status: "FACULTY_APPROVED",
  },
];

const gradeRow = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "E", "N", "W"];
const gpRow = ["4.0", "4.0", "3.7", "3.3", "3.0", "2.7", "2.3", "2.0", "1.7", "0.0", "-", "-"];

const formatLongDate = (d?: string | Date) => {
  const date = d ? new Date(d) : new Date();
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};

const ResultsSheetAP: React.FC<Props> = ({
  university = "Faculty of Engineering University of Ruhuna",
  facultyLine = "Bachelor of the Science of Engineering Honours Examination",
  departmentName = "Department of Computer Engineering",
  specialization = "Results Batch Overview",
  sheetTitle = "Final Results Sheet",
  provisionalLine = "(Provisional results subject to confirmation by the senate)",
  version = "",
  summaryNote,
  semesterName,
  batchName,
  statusLabel,
  results,
  loading,
  finalApprovalDate,
  approvals,
}) => {
  const rows = Array.isArray(results) && results.length > 0 ? results : DEFAULT_ROWS;
  const moduleList = useMemo(() => {
    const map = new Map<string, string>();
    rows.forEach((row, idx) => {
      const code = row.courseCode ?? `COURSE-${idx + 1}`;
      const name = row.courseName ?? row.courseCode ?? `Course ${idx + 1}`;
      if (!map.has(code)) {
        map.set(code, name);
      }
    });
    return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
  }, [rows]);
  const approvalsByLevel = useMemo(() => {
    const map = new Map<string, ApprovalSignature>();
    approvals?.forEach((a) => {
      if (a.level) {
        map.set(a.level, a);
      }
    });
    return map;
  }, [approvals]);

  return (
    <section className="sheet a4" id="results-pdf-root">
      <div role="document" aria-label="A4 Results Sheet">
        <div className="rs-top avoid-break">
          <div className="hdr uni">{university}</div>
          <div className="hdr under">{facultyLine}</div>
          <div className="hdr spec">{departmentName}</div>
          <div className="hdr title">{sheetTitle}</div>
          {specialization && <div className="hdr under">{specialization}</div>}
          <div className="hdr under">{provisionalLine}</div>
          {version && <div className="hdr ver">{version}</div>}

          <div className="section-title avoid-break">Batch Summary</div>
          <table className="meta-table avoid-break">
            <tbody>
              <tr>
                <td className="meta-label">Batch</td>
                <td className="meta-value">{batchName ?? "N/A"}</td>
              </tr>
              <tr>
                <td className="meta-label">Semester</td>
                <td className="meta-value">{semesterName ?? "N/A"}</td>
              </tr>
              <tr>
                <td className="meta-label">Department</td>
                <td className="meta-value">{departmentName}</td>
              </tr>
              <tr>
                <td className="meta-label">Status</td>
                <td className="meta-value">{statusLabel ?? "Pending review"}</td>
              </tr>
              <tr>
                <td className="meta-label">Result Count</td>
                <td className="meta-value">{rows.length}</td>
              </tr>
            </tbody>
          </table>

          {summaryNote && <p className="rs-note">{summaryNote}</p>}

          <div className="section-title avoid-break">Modules Counting for GPA</div>
          <div className="labels">
            <span className="u">Module No.</span>
            <span className="u">Module Name</span>
          </div>
          <table className="list avoid-break">
            <tbody>
              {moduleList.map((m, i) => (
                <tr key={`module-${i}`}>
                  <td className="code">{m.code}</td>
                  <td className="name">{m.name}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="section-title avoid-break">Student Results</div>
          <div className="rs-box">
            <ResultsTable rows={rows} loading={loading} />

            <div className="legend avoid-break">
              <div className="legend-row">
                <span className="legend-head">Grade</span>
                {gradeRow.map((g) => (
                  <span key={g} className="legend-cell">
                    {g}
                  </span>
                ))}
              </div>
              <div className="legend-row">
                <span className="legend-head">Grade Point</span>
                {gpRow.map((g, i) => (
                  <span key={i} className="legend-cell">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <section className="rs-sign-exactAP avoid-break">
              <div className="sig-gridAP">
                <div className="sig-colAP">
                  <div className="sig-signboxAP">
                    <SignatureBoardRS
                      readOnly
                      value={approvalsByLevel.get("DEPARTMENT_BOARD")?.signatureUrl}
                    />
                  </div>
                  <div className="sig-captionAP">Head of Department</div>
                  {approvalsByLevel.get("DEPARTMENT_BOARD")?.decidedAt && (
                    <div className="sig-smallAP">
                      {new Date(
                        approvalsByLevel.get("DEPARTMENT_BOARD")!.decidedAt!
                      ).toLocaleDateString()}
                    </div>
                  )}
                  <div className="sig-signboxAP">
                    <SignatureBoardRS readOnly value={null} />
                  </div>

                  <div className="sig-smallAP">Assistant Registrar</div>
                  <div className="sig-captionAP">
                    Assistant Registrar
                    <br />
                    Faculty of Engineering, University of Ruhuna
                    <br />
                    Hapugala, Galle
                  </div>

                  <div className="sig-dateAP">
                    <span className="sig-dateLabelAP">Final Approval Date :</span>
                    <span className="sig-dateValueAP">{formatLongDate(finalApprovalDate)}</span>
                  </div>
                </div>

                <div className="sig-colAP">
                  <div className="sig-signboxAP">
                    <SignatureBoardRS
                      readOnly
                      value={approvalsByLevel.get("FACULTY_COMMITTEE")?.signatureUrl}
                    />
                  </div>
                  <div className="sig-captionAP">Dean, Faculty of Engineering</div>

                  <div className="sig-signboxAP">
                    <SignatureBoardRS
                      readOnly
                      value={approvalsByLevel.get("SENATE")?.signatureUrl}
                    />
                  </div>
                  <div className="sig-captionAP">Senate Approval</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResultsSheetAP;
