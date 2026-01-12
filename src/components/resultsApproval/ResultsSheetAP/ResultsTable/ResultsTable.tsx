import React from "react";
import type { ResultSheetRow } from "../ResultsSheetAP";
import "./ResultsTable.css";

type ResultsTableProps = {
  rows: ResultSheetRow[];
  loading?: boolean;
};

const TABLE_COLUMNS = [
  { key: "studentRegNo", label: "Reg. No." },
  { key: "studentName", label: "Name" },
  { key: "course", label: "Course" },
  { key: "gradeLetter", label: "Grade" },
  { key: "totalPercent", label: "Total %" },
  { key: "status", label: "Status" },
];

const ResultsTable: React.FC<ResultsTableProps> = ({ rows, loading }) => {
  if (loading) {
    return <div className="rt-loading">Loading batch results…</div>;
  }

  if (!rows.length) {
    return <div className="rt-empty">No results available for this batch.</div>;
  }

  return (
    <div className="rt-wrapper">
      <table id="results-table" className="results-table rs-table">
        <thead>
          <tr>
            {TABLE_COLUMNS.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id ?? idx}>
              <td>{row.studentRegNo ?? "-"}</td>
              <td>{row.studentName ?? "-"}</td>
              <td>
                {[row.courseCode, row.courseName].filter(Boolean).join(" - ") ||
                  "-"}
              </td>
              <td>{row.gradeLetter ?? "-"}</td>
              <td>
                {typeof row.totalPercent === "number"
                  ? row.totalPercent.toFixed(2)
                  : "-"}
              </td>
              <td>{row.status ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
