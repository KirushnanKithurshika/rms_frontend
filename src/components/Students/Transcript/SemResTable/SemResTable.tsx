import React from "react";
import "./SemResTable.css";

/* ===== Types (exported so Transcript.tsx can import if needed) ===== */
export type ModuleRow = {
  moduleNo: string;
  moduleTitle: string;
  credits: number | string;
  grade?: string;
  gradePoint?: number | string;
  attemptNote?: string; // "(2nd)" etc.
};

export type SemesterSection =
  | { kind: "group"; title: string }
  | { kind: "rows"; rows: ModuleRow[] };

export type SemesterData = {
  title: string;          // "Semester 1"
  period?: string;        // "(May 2020 - Mar 2021)"
  sections: SemesterSection[];
  sgpa?: string;          // "2.59"
};

type Props = {
  semesters?: SemesterData[];
};

/* Optional fallback (used only if you render component with no props) */
const SAMPLE_SEMESTERS: SemesterData[] = [
  {
    title: "Development Programme",
    sections: [
      { kind: "group", title: "Developmental Courses" },
      {
        kind: "rows",
        rows: [
          { moduleNo: "English", moduleTitle: "", credits: "-", grade: "S", gradePoint: "-" },
          { moduleNo: "Computer Awareness", moduleTitle: "", credits: "-", grade: "S", gradePoint: "-" },
          { moduleNo: "Social Awareness", moduleTitle: "", credits: "-", grade: "M", gradePoint: "-" },
        ],
      },
    ],
  },
  {
    title: "Semester 1",
    period: "(May 2020 - Mar 2021)",
    sections: [
      {
        kind: "rows",
        rows: [
          { moduleNo: "CE1101 (CM)", moduleTitle: "Basic Concepts in Environmental Engineering", credits: 1, grade: "B", gradePoint: 3.0 },
          { moduleNo: "CE1202 (CM)", moduleTitle: "Introduction to Infrastructure Planning", credits: 2, grade: "C+", gradePoint: 2.3 },
          { moduleNo: "EE1101 (CM)", moduleTitle: "Computer Programming I", credits: 1, grade: "B", gradePoint: 3.0 },
          { moduleNo: "EE1302 (CM)", moduleTitle: "Introduction to Electrical Engineering", credits: 3, grade: "B", gradePoint: 3.0 },
          { moduleNo: "ME1201 (CM)", moduleTitle: "Engineering Drawing", credits: 3, grade: "B", gradePoint: 3.0, attemptNote: "(2nd)" },
          { moduleNo: "ME1202 (CM)", moduleTitle: "Introduction to Mechanical Engineering", credits: 2, grade: "C", gradePoint: 2.0, attemptNote: "(2nd)" },
          { moduleNo: "IS1301 (CM)", moduleTitle: "Communication for Engineers", credits: 3, grade: "C", gradePoint: 2.0 },
          { moduleNo: "IS1402 (CM)", moduleTitle: "Mathematical Fundamentals for Engineers", credits: 4, grade: "B", gradePoint: 3.0 },
        ],
      },
    ],
    sgpa: "2.48",
  },
  {
    title: "Semester 2",
    period: "(Nov 2019 - Mar 2020)",
    sections: [
      {
        kind: "rows",
        rows: [
          { moduleNo: "CE2201 (CM)", moduleTitle: "Fundamentals of Fluid Mechanics", credits: 2, grade: "B-", gradePoint: 2.7 },
          { moduleNo: "CE2302 (CM)", moduleTitle: "Mechanics of Materials", credits: 3, grade: "E", gradePoint: 0.0, attemptNote: "(2nd)" },
          { moduleNo: "EE2201 (CM)", moduleTitle: "Computer Programming II", credits: 2, grade: "B", gradePoint: 3.0 },
          { moduleNo: "EE2202 (CM)", moduleTitle: "Introduction to Electronic Engineering", credits: 2, grade: "B+", gradePoint: 3.3 },
          { moduleNo: "ME2201 (CM)", moduleTitle: "Fundamentals of Engineering Thermodynamics", credits: 2, grade: "B+", gradePoint: 3.3 },
          { moduleNo: "ME2302 (CM)", moduleTitle: "Intro to Materials Science & Manufacturing Engineering", credits: 3, grade: "B-", gradePoint: 2.7 },
          { moduleNo: "IS2401 (CM)", moduleTitle: "Linear Algebra and Differential Equations", credits: 4, grade: "C+", gradePoint: 2.3 },
        ],
      },
    ],
    sgpa: "2.59",
  },
];

const SemesterTables: React.FC<Props> = ({ semesters = SAMPLE_SEMESTERS }) => {
  return (
    <div className="tsem-root">
      {semesters.map((sem, si) => (
        <div className="tsem-wrap" key={si}>
          {/* Title band */}
          <div className="tsem-title">
            <span className="tsem-title-left">{sem.title}</span>
            {sem.period && <span className="tsem-title-right">{sem.period}</span>}
          </div>

          <table className="tsem-table" role="table" aria-label={`${sem.title} modules`}>
            <thead>
              <tr>
                <th style={{ width: "16%" }}>Module No</th>
                <th style={{ width: "54%" }}>Module Title</th>
                <th style={{ width: "10%" }}>Credits</th>
                <th style={{ width: "10%" }}>Grade</th>
                <th style={{ width: "10%" }}>Grade Point</th>
              </tr>
            </thead>

            <tbody>
              {sem.sections.map((sec, secIdx) =>
                sec.kind === "group" ? (
                  <tr className="tsem-group" key={`g-${secIdx}`}>
                    <td colSpan={5}>{sec.title}</td>
                  </tr>
                ) : (
                  sec.rows.map((r, ri) => (
                    <tr key={`r-${secIdx}-${ri}`}>
                      <td className="tsem-mno">
                        {r.moduleNo}{" "}
                        {r.attemptNote && <span className="tsem-attempt">{r.attemptNote}</span>}
                      </td>
                      <td>{r.moduleTitle}</td>
                      <td className="tsem-center">{r.credits ?? "-"}</td>
                      <td className="tsem-center">{r.grade ?? "-"}</td>
                      <td className="tsem-center">{r.gradePoint ?? "-"}</td>
                    </tr>
                  ))
                )
              )}

              {sem.sgpa && (
                <tr className="tsem-sgpa">
                  <td colSpan={4} className="tsem-sgpa-label">
                    Semester Grade Point Average
                  </td>
                  <td className="tsem-center tsem-sgpa-value">{sem.sgpa}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default SemesterTables;
