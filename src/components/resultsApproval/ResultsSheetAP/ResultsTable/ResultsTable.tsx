import React, { useMemo } from "react";
import type { ResultSheetRow } from "../ResultsSheetAP";
import "./ResultsTable.css";

type ResultsTableProps = {
  rows: ResultSheetRow[];
  loading?: boolean;
};

type StudentAggregate = {
  regNo: string;
  name: string;
  status?: string | null;
  modules: Record<string, string>;
};

const formatCourseLabel = (row: ResultSheetRow, fallbackIndex: number) => {
  const label = row.courseCode ?? row.courseName;
  if (label) return label;
  return `Course ${fallbackIndex}`;
};

const ResultsTable: React.FC<ResultsTableProps> = ({ rows, loading }) => {
  const { courseColumns, studentRows } = useMemo(() => {
    if (!rows?.length) {
      return { courseColumns: [] as string[], studentRows: [] as StudentAggregate[] };
    }

    const columnMap = new Map<string, string>();
    const studentMap = new Map<string, StudentAggregate>();

    rows.forEach((row, idx) => {
      const colKey = formatCourseLabel(row, idx + 1);
      if (!columnMap.has(colKey)) {
        columnMap.set(colKey, colKey);
      }

      const reg = row.studentRegNo ?? `student-${idx}`;
      const existing = studentMap.get(reg) ?? {
        regNo: row.studentRegNo ?? "-",
        name: row.studentName ?? "-",
        status: row.status ?? null,
        modules: {},
      };

      if (row.status) {
        existing.status = row.status;
      }

      existing.modules[colKey] = row.gradeLetter ?? "-";
      studentMap.set(reg, existing);
    });

    const sortedStudents = Array.from(studentMap.values()).sort((a, b) =>
      a.regNo.localeCompare(b.regNo)
    );

    return {
      courseColumns: Array.from(columnMap.values()),
      studentRows: sortedStudents,
    };
  }, [rows]);

  if (loading) {
    return <div className="rt-loading">Loading batch results…</div>;
  }

  if (!studentRows.length) {
    return <div className="rt-empty">No results available for this batch.</div>;
  }

  return (
    <div className="rt-wrapper">
      <table id="results-table" className="results-table rs-table">
        <thead>
          <tr>
            <th>Reg. No.</th>
            <th>Name</th>
            {courseColumns.map((course) => (
              <th key={course}>{course}</th>
            ))}
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {studentRows.map((student) => (
            <tr key={student.regNo}>
              <td>{student.regNo}</td>
              <td>{student.name}</td>
              {courseColumns.map((course) => (
                <td key={course}>{student.modules[course] ?? "-"}</td>
              ))}
              <td>{student.status ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
