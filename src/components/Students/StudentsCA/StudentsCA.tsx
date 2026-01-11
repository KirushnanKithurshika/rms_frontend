import React from "react";
import "./StudentsCA.css";

// Legacy fixed CA entry (quiz1/quiz2/lab)
type CAEntry = {
  code: string;
  name: string;
  quiz1: number; // out of 20
  quiz2: number; // out of 20
  lab: number; // out of 20
};

// Dynamic CA entry with arbitrary components from backend
type CAComponent = {
  componentName: string;
  maxMarks: number;
  obtainedMarks: number;
};

type DynamicCAEntry = {
  code: string;
  name: string;
  components: CAComponent[];
  total?: number;
  status?: string; // PASS/FAIL
};

type Props = {
  universityTitle?: string;
  department?: string;
  batchText?: string;
  sheetSubtitle?: string;
  studentName?: string;
  regNo?: string;
  semester?: string | number;
  passThreshold?: number; // default 30 if we need to compute status
  ca?: CAEntry[]; // legacy: one row per subject
  caDynamic?: DynamicCAEntry[]; // preferred: backend-driven components
};

const StudentsConAss: React.FC<Props> = ({
  universityTitle = "",
  department = "",
  batchText = "",
  sheetSubtitle = "CA Marks",
  studentName = "",
  regNo = "",
  semester,
  passThreshold = 30,
  ca,
  caDynamic,
}) => {
  const handlePrint = () => window.print();

  const getTotal = (r: CAEntry) => r.quiz1 + r.quiz2 + r.lab;
  const getStatus = (total: number) =>
    total >= passThreshold ? "Pass" : "Fail";

  const getDynTotal = (r: DynamicCAEntry) =>
    typeof r.total === "number"
      ? r.total
      : (r.components || []).reduce(
          (sum, c) => sum + (c.obtainedMarks ?? 0),
          0
        );
  const getDynStatus = (r: DynamicCAEntry) => {
    const s = r.status?.toUpperCase();
    if (s === "PASS" || s === "FAIL") return s;
    const t = getDynTotal(r);
    return t >= passThreshold ? "PASS" : "FAIL";
  };

  return (
    <div className="results-page-students">
      <div className="sheet-scroller">
        <div
          className="a4-sheet"
          role="document"
          aria-label="A4 CA Marks Sheet"
        >
          {/* Header */}
          <header className="a4-header">
            <h1 className="uni-title">{universityTitle}</h1>
            <div className="dept-line">{department}</div>
            <div className="batch-line">{batchText}</div>
            <div className="sheet-subtitle">{sheetSubtitle}</div>
          </header>

          {/* Student info */}
          <section className="student-meta">
            <div className="meta-row">
              <span className="meta-label">Name</span>
              <span className="meta-sep">:</span>
              <span className="meta-value">{studentName}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Student_ID</span>
              <span className="meta-sep">:</span>
              <span className="meta-value">{regNo}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Semester</span>
              <span className="meta-sep">:</span>
              <span className="meta-value">{semester}</span>
            </div>
          </section>

          {/* CA tables – one per subject */}
          <section className="ca-blocks">
            {((caDynamic && caDynamic.length > 0 ? caDynamic : ca) ?? []).map(
              (row: any, idx: number) => {
                const isDynamic = !!caDynamic;
                if (!isDynamic) {
                  const total = getTotal(row as CAEntry);
                  const status = getStatus(total);
                  return (
                    <div
                      className="ca-table-wrap"
                      key={(row as CAEntry).code + idx}
                    >
                      <table className="ca-table" role="table">
                        <thead>
                          <tr>
                            <th>Module code</th>
                            <th>Module Name</th>
                            <th>Quiz 1(20)</th>
                            <th>Quiz 2(20)</th>
                            <th>Lab(20)</th>
                            <th>Total(60)</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{(row as CAEntry).code}</td>
                            <td>{(row as CAEntry).name}</td>
                            <td className="t-center">
                              {(row as CAEntry).quiz1}
                            </td>
                            <td className="t-center">
                              {(row as CAEntry).quiz2}
                            </td>
                            <td className="t-center">{(row as CAEntry).lab}</td>
                            <td className="t-center">{total}</td>
                            <td
                              className={`t-center status ${
                                status === "Pass" ? "ok" : "bad"
                              }`}
                            >
                              {status}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  );
                }

                const d = row as DynamicCAEntry;
                const total = getDynTotal(d);
                const status = getDynStatus(d); // PASS/FAIL
                return (
                  <div className="ca-table-wrap" key={d.code + idx}>
                    <table className="ca-table" role="table">
                      <thead>
                        <tr>
                          <th>Module code</th>
                          <th>Module Name</th>
                          {d.components.map((c, i) => (
                            <th
                              key={i}
                            >{`${c.componentName}(${c.maxMarks})`}</th>
                          ))}
                          <th>{`Total`}</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{d.code}</td>
                          <td>{d.name}</td>
                          {d.components.map((c, i) => (
                            <td key={i} className="t-center">
                              {c.obtainedMarks}
                            </td>
                          ))}
                          <td className="t-center">{total}</td>
                          <td
                            className={`t-center status ${
                              status === "PASS" ? "ok" : "bad"
                            }`}
                          >
                            {status === "PASS" ? "Pass" : "Fail"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              }
            )}
          </section>
        </div>
      </div>

      {/* Controls (hidden on print) */}
      <div className="down-controls no-print">
        <button type="button" onClick={handlePrint}>
          Print
        </button>
      </div>
    </div>
  );
};

export default StudentsConAss;
