import React from "react";
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
};

const DEFAULT_ROWS: ResultSheetRow[] = [
  {
    id: 1,
    studentRegNo: "EG/2020/2005",
    studentName: "Sample Student",
    courseCode: "EE4250",
    courseName: "Signals & Systems",
    gradeLetter: "A",
    totalPercent: 81.2,
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
}) => {
  const rows = Array.isArray(results) && results.length > 0 ? results : DEFAULT_ROWS;

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
          <table className="list avoid-break meta-table">
            <tbody>
              <tr>
                <td className="meta-label">Batch</td>
                <td className="meta-value">{batchName ?? "N/A"}</td>
                <td className="meta-label">Semester</td>
                <td className="meta-value">{semesterName ?? "N/A"}</td>
              </tr>
              <tr>
                <td className="meta-label">Department</td>
                <td className="meta-value" colSpan={3}>
                  {departmentName}
                </td>
              </tr>
              <tr>
                <td className="meta-label">Status</td>
                <td className="meta-value">{statusLabel ?? "Pending review"}</td>
                <td className="meta-label">Result Count</td>
                <td className="meta-value">{rows.length}</td>
              </tr>
            </tbody>
          </table>

          {summaryNote && <p className="rs-note">{summaryNote}</p>}

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
                    <SignatureBoardRS />
                  </div>
                  <div className="sig-rightHeaderAP sig-rightHeaderAP--below">
                    <div className="sig-smallAP">Checked</div>
                  </div>

                  <div className="sig-signboxAP">
                    <SignatureBoardRS />
                  </div>

                  <div className="sig-smallAP">Certified Correct.</div>
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
                    <SignatureBoardRS />
                  </div>
                  <div className="sig-captionAP">Dean, Faculty of Engineering</div>

                  <div className="sig-signboxAP">
                    <SignatureBoardRS />
                  </div>
                  <div className="sig-captionAP">Vice-chancellor, University of Ruhuna</div>
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
