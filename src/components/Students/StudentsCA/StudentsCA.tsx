import React from "react";
import "./StudentsCA.css";

type CAEntry = {
  code: string;
  name: string;
  quiz1: number;   // out of 20
  quiz2: number;   // out of 20
  lab: number;     // out of 20
};

type Props = {
  universityTitle?: string;
  department?: string;
  batchText?: string;
  sheetSubtitle?: string;
  studentName?: string;
  regNo?: string;
  semester?: string | number;
  passThreshold?: number;      // total out of 60 to pass (default 30)
  ca?: CAEntry[];              // one row per subject
};

const StudentsConAss: React.FC<Props> = ({
  universityTitle = "Faculty of Engineering University of Ruhuna",
  department = "Department: Computer Engineering",
  batchText = "22nd Batch",
  sheetSubtitle = "CA Marks",
  studentName = "Kithurshika K",
  regNo = "EG/2020/4023",
  semester = "6",
  passThreshold = 30,
  ca = [
    { code: "EE6250", name: "Information Security", quiz1: 18, quiz2: 15, lab: 16 },
    { code: "EE6242", name: "Computer Networks",    quiz1: 16, quiz2: 14, lab: 17 },
    { code: "EE6231", name: "Database Systems",     quiz1: 19, quiz2: 13, lab: 15 },
  ],
}) => {
  const handlePrint = () => window.print();

  const getTotal = (r: CAEntry) => r.quiz1 + r.quiz2 + r.lab;
  const getStatus = (total: number) => (total >= passThreshold ? "Pass" : "Fail");

  return (
    <div className="results-page">
      <div className="sheet-scroller">
        <div className="a4-sheet" role="document" aria-label="A4 CA Marks Sheet">
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

          {/* CA tables – one per subject like your picture */}
          <section className="ca-blocks">
            {ca.map((row, idx) => {
              const total = getTotal(row);
              const status = getStatus(total);
              return (
                <div className="ca-table-wrap" key={row.code + idx}>
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
                        <td>{row.code}</td>
                        <td>{row.name}</td>
                        <td className="t-center">{row.quiz1}</td>
                        <td className="t-center">{row.quiz2}</td>
                        <td className="t-center">{row.lab}</td>
                        <td className="t-center">{total}</td>
                        <td className={`t-center status ${status === "Pass" ? "ok" : "bad"}`}>
                          {status}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </section>
        </div>
      </div>

      {/* Controls (hidden on print) */}
      <div className="down-controls no-print">
        <button type="button" onClick={handlePrint}>Print</button>
      </div>
    </div>
  );
};

export default StudentsConAss;
