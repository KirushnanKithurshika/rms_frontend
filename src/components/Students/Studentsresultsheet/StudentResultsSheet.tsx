import React from "react";
import "./StudentResultsSheet.css";

type Item = { code: string; name: string; credits: number };
type Student = {
  name: string;
  regNo: string;
  gradesByCode: Record<string, string> | null;
};
type Counting = { core?: string[]; electives?: string[] };

type Props = {
  university?: string;
  facultyLine?: string;
  specialization?: string;
  sheetTitle?: string;
  provisionalLine?: string;
  core?: Item[];
  electives?: Item[];
  student?: Student;
  modulesCountingForGPA?: Counting;
  note?: string;
  gradeByCode?: Record<string, string>;
};

const StudentResultsSheet: React.FC<Props> = ({
  university,
  facultyLine,
  specialization,
  sheetTitle,
  provisionalLine,
  core,
  electives,
  student,
  modulesCountingForGPA,
  note,
  gradeByCode,
}) => {
  const gradeRow = [
    "A+",
    "A",
    "A-",
    "B+",
    "B",
    "B-",
    "C+",
    "C",
    "C-",
    "E",
    "N",
    "W",
  ];
  const gpRow = [
    "4.0",
    "4.0",
    "3.7",
    "3.3",
    "3.0",
    "2.7",
    "2.3",
    "2.0",
    "1.7",
    "0.0",
    "-",
    "-",
  ];

  const coreCodes = Array.isArray(modulesCountingForGPA?.core)
    ? modulesCountingForGPA?.core
    : [];
  const elecCodes = Array.isArray(modulesCountingForGPA?.electives)
    ? modulesCountingForGPA.electives
    : [];

  const coreCount = Math.max(coreCodes.length || 0, 1);
  const elecCount = Math.max(elecCodes.length || 0, 1);
  const totalCount = coreCount + elecCount;

  const grades = gradeByCode ?? {};

  const handlePrint = () => window.print();

  return (
    <div className="results-page">
      <div className="sheet-scroller">
        <div className="a4-sheet" role="document" aria-label="A4 Results Sheet">
          <div className="rs-top">
            {/* Header */}
            <div className="hdr uni">{university}</div>
            <div className="hdr under">{facultyLine}</div>
            <div className="hdr spec">{specialization}</div>
            <div className="hdr title">{sheetTitle}</div>
            <div className="hdr under">{provisionalLine}</div>

            {/* Section title */}
            <div className="section-title">Modules Counting for GPA</div>

            {/* Column labels */}
            <div className="labels">
              <span className="u">Module No.</span>
              <span className="u">Module Name</span>
              <span className="u right">Credits</span>
            </div>

            {/* Core Modules */}
            <div className="group">Core Modules</div>
            <table className="list">
              <tbody>
                {core?.map((m, i) => (
                  <tr key={`c-${i}`}>
                    <td className="code">{m.code}</td>
                    <td className="name">{m.name}</td>
                    <td className="cr">{m.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Electives */}
            <div className="group">Technical / General Electives</div>
            <table className="list">
              <tbody>
                {electives?.map((m, i) => (
                  <tr key={`e-${i}`}>
                    <td className="code">{m.code}</td>
                    <td className="name">{m.name}</td>
                    <td className="cr">{m.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Legend */}
            <div className="legend">
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

            {/* GPA Table */}
            <div className="rs-box">
              <table className="rs-table">
                <thead>
                  <tr>
                    <th rowSpan={2} style={{ width: "28%" }}>
                      Name
                    </th>
                    <th rowSpan={2} style={{ width: "22%" }}>
                      Registration No
                    </th>
                    <th colSpan={totalCount} className="center">
                      Modules Counting for the GPA
                    </th>
                  </tr>
                  <tr>
                    <th colSpan={coreCount} className="center">
                      Core Modules
                    </th>
                    <th colSpan={elecCount} className="center">
                      Technical / General Elective
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{student?.name}</td>
                    <td>{student?.regNo}</td>

                    {coreCodes.length
                      ? coreCodes.map((c, i) => (
                          <td key={`cc-${i}`} className="center">
                            {c}
                          </td>
                        ))
                      : Array.from({ length: coreCount }).map((_, i) => (
                          <td key={`cc-empty-${i}`} className="center">
                            -
                          </td>
                        ))}

                    {elecCodes.length
                      ? elecCodes.map((c, i) => (
                          <td key={`ec-${i}`} className="center">
                            {c}
                          </td>
                        ))
                      : Array.from({ length: elecCount }).map((_, i) => (
                          <td key={`ec-empty-${i}`} className="center">
                            -
                          </td>
                        ))}
                  </tr>

                  <tr>
                    <td colSpan={2}></td>

                    {coreCodes.length
                      ? coreCodes.map((c, i) => (
                          <td key={`cg-${i}`} className="center">
                            {grades[c] ?? "-"}
                          </td>
                        ))
                      : Array.from({ length: coreCount }).map((_, i) => (
                          <td key={`cg-empty-${i}`} className="center">
                            -
                          </td>
                        ))}

                    {elecCodes.length
                      ? elecCodes.map((c, i) => (
                          <td key={`eg-${i}`} className="center">
                            {grades[c] ?? "-"}
                          </td>
                        ))
                      : Array.from({ length: elecCount }).map((_, i) => (
                          <td key={`eg-empty-${i}`} className="center">
                            -
                          </td>
                        ))}
                  </tr>
                </tbody>
              </table>

              <div className="rs-note">{note}</div>

              {/* Signatures */}
              <section className="rs-sign-exact">
                <div className="sig-row top">
                  <div className="cell left">
                    <div className="label">Checked By:</div>
                  </div>
                  <div className="cell right">
                    <div className="lineBox">
                      <span className="sig-line r-line" />
                    </div>
                    <div className="caption">
                      Vice Chancellor, University of Ruhuna
                    </div>
                  </div>
                </div>

                <div className="sig-row two-col">
                  <div className="cell left">
                    <div className="label strong">Certified Correct:</div>
                    <div className="lineBox">
                      <span className="sig-line l-line" />
                    </div>
                    <div className="caption">
                      Senior Assistant Registrar,
                      <br />
                      Faculty of Engineering, University of Ruhuna,
                      <br />
                      Hapugala, Galle
                    </div>
                  </div>

                  <div className="cell right">
                    <div className="lineBox">
                      <span className="sig-line r-line" />
                    </div>
                    <div className="caption">Dean, Faculty of Engineering</div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <div className="down-controls no-print">
        <button type="button" onClick={handlePrint}>
          Print
        </button>
      </div>
    </div>
  );
};

export default StudentResultsSheet;
