import React from "react";
import "./SemResTable.css";

/* ===== Types (exported) ===== */
export type ModuleRow = {
  moduleNo: string;
  moduleTitle: string;
  credits: number | string;
  grade?: string;
  gradePoint?: number | string;
  attemptNote?: string;
};

export type SemesterSection =
  | { kind: "group"; title: string }
  | { kind: "rows"; rows: ModuleRow[] };

export type SemesterData = {
  title: string;
  period?: string;
  sections: SemesterSection[];
  sgpa?: string;
};

type Props = {
  semesters?: SemesterData[];

  startIndex?: number;
  endIndex?: number;

  breakAfterIndex?: number;
};

export const SAMPLE_SEMESTERS: SemesterData[] = [
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
          { moduleNo: "IS1402 (CM)", moduleTitle: "Mathematical Fundamentals for Engineers", credits: 4, grade: "B", gradePoint: 3.0 },
          { moduleNo: "IS1301 (CM)", moduleTitle: "Communication for Engineers", credits: 3, grade: "C", gradePoint: 2.0 },
          { moduleNo: "EE1101 (CM)", moduleTitle: "Computer Programming I", credits: 1, grade: "B", gradePoint: 3.0 },
          { moduleNo: "EE1302 (CM)", moduleTitle: "Introduction to Electrical Engineering", credits: 3, grade: "B", gradePoint: 3.0 },
          { moduleNo: "ME1201 (CM)", moduleTitle: "Engineering Drawing", credits: 3, grade: "B", gradePoint: 3.0 },
          { moduleNo: "ME1202 (CM)", moduleTitle: "Intro to Mechanical Engineering", credits: 2, grade: "C", gradePoint: 2.0 },
          { moduleNo: "CE1101 (CM)", moduleTitle: "Basic Concepts in Environmental Engineering", credits: 1, grade: "B", gradePoint: 3.0 },
          { moduleNo: "CE1202 (CM)", moduleTitle: "Intro to Infrastructure Planning", credits: 2, grade: "C+", gradePoint: 2.3 },
        ],
      },
    ],
    sgpa: "2.48",
  },
  {
    title: "Semester 2",
    period: "(Nov 2020 - Aug 2021)",
    sections: [
      {
        kind: "rows",
        rows: [
          { moduleNo: "IS2401 (CM)", moduleTitle: "Linear Algebra & Differential Equations", credits: 4, grade: "C+", gradePoint: 2.3 },
          { moduleNo: "EE2201 (CM)", moduleTitle: "Computer Programming II", credits: 2, grade: "B", gradePoint: 3.0 },
          { moduleNo: "EE2202 (CM)", moduleTitle: "Introduction to Electronic Engineering", credits: 2, grade: "B+", gradePoint: 3.3 },
          { moduleNo: "ME2201 (CM)", moduleTitle: "Engineering Thermodynamics", credits: 2, grade: "B+", gradePoint: 3.3 },
          { moduleNo: "ME2302 (CM)", moduleTitle: "Materials & Manufacturing", credits: 3, grade: "B-", gradePoint: 2.7 },
          { moduleNo: "CE2201 (CM)", moduleTitle: "Fluid Mechanics", credits: 2, grade: "B-", gradePoint: 2.7 },
          { moduleNo: "CE2302 (CM)", moduleTitle: "Mechanics of Materials", credits: 3, grade: "C", gradePoint: 2.0 },
        ],
      },
    ],
    sgpa: "2.59",
  },
  {
    title: "Semester 3",
    period: "(2021/2022)",
    sections: [
      {
        kind: "rows",
        rows: [
          { moduleNo: "CS3101", moduleTitle: "Data Structures & Algorithms", credits: 3, grade: "B", gradePoint: 3.0 },
          { moduleNo: "CS3102", moduleTitle: "Computer Architecture", credits: 3, grade: "B+", gradePoint: 3.3 },
          { moduleNo: "CS3103", moduleTitle: "Probability & Statistics", credits: 2, grade: "B-", gradePoint: 2.7 },
          { moduleNo: "CS3104", moduleTitle: "Object-Oriented Programming", credits: 3, grade: "A-", gradePoint: 3.7 },
          { moduleNo: "CS3105", moduleTitle: "Digital Logic", credits: 2, grade: "B", gradePoint: 3.0 },
        ],
      },
    ],
    sgpa: "3.15",
  },
  {
    title: "Semester 4",
    period: "(2022)",
    sections: [
      {
        kind: "rows",
        rows: [
          { moduleNo: "CS3201", moduleTitle: "Operating Systems", credits: 3, grade: "B", gradePoint: 3.0 },
          { moduleNo: "CS3202", moduleTitle: "Database Systems", credits: 3, grade: "A-", gradePoint: 3.7 },
          { moduleNo: "CS3203", moduleTitle: "Computer Networks", credits: 3, grade: "B+", gradePoint: 3.3 },
          { moduleNo: "CS3204", moduleTitle: "Software Engineering", credits: 3, grade: "B", gradePoint: 3.0 },
          { moduleNo: "CS3205", moduleTitle: "Numerical Methods", credits: 2, grade: "B", gradePoint: 3.0 },
        ],
      },
    ],
    sgpa: "3.20",
  },
  {
    title: "Semester 5",
    period: "(2022/2023)",
    sections: [
      {
        kind: "rows",
        rows: [
          { moduleNo: "CS4101", moduleTitle: "Machine Learning", credits: 3, grade: "A-", gradePoint: 3.7 },
          { moduleNo: "CS4102", moduleTitle: "Embedded Systems", credits: 3, grade: "B", gradePoint: 3.0 },
          { moduleNo: "CS4103", moduleTitle: "Distributed Systems", credits: 3, grade: "B+", gradePoint: 3.3 },
          { moduleNo: "CS4104", moduleTitle: "Human-Computer Interaction", credits: 2, grade: "A", gradePoint: 4.0 },
          { moduleNo: "CS4105", moduleTitle: "Signals & Systems", credits: 2, grade: "B", gradePoint: 3.0 },
        ],
      },
    ],
    sgpa: "3.40",
  },
  {
    title: "Semester 6",
    period: "(2023)",
    sections: [
      {
        kind: "rows",
        rows: [
          { moduleNo: "CS4201", moduleTitle: "Information Security", credits: 3, grade: "A-", gradePoint: 3.7 },
          { moduleNo: "CS4202", moduleTitle: "Computer Vision", credits: 3, grade: "B+", gradePoint: 3.3 },
          { moduleNo: "CS4203", moduleTitle: "Compiler Design", credits: 3, grade: "B", gradePoint: 3.0 },
          { moduleNo: "CS4204", moduleTitle: "Data Mining", credits: 3, grade: "A", gradePoint: 4.0 },
          { moduleNo: "CS4205", moduleTitle: "Cloud Computing", credits: 2, grade: "B", gradePoint: 3.0 },
        ],
      },
    ],
    sgpa: "3.48",
  },
  {
    title: "Semester 7",
    period: "(2023/2024)",
    sections: [
      { kind: "group", title: "Core Modules" },
      {
        kind: "rows",
        rows: [
          { moduleNo: "CS5101", moduleTitle: "Deep Learning", credits: 3, grade: "A", gradePoint: 4.0 },
          { moduleNo: "CS5102", moduleTitle: "Parallel & High-Performance Computing", credits: 3, grade: "B+", gradePoint: 3.3 },
          { moduleNo: "CS5103", moduleTitle: "Advanced Networks", credits: 3, grade: "B", gradePoint: 3.0 },
          { moduleNo: "CS5101", moduleTitle: "Deep Learning", credits: 3, grade: "A", gradePoint: 4.0 },
          { moduleNo: "CS5102", moduleTitle: "Parallel & High-Performance Computing", credits: 3, grade: "B+", gradePoint: 3.3 },
          { moduleNo: "CS5101", moduleTitle: "Deep Learning", credits: 3, grade: "A", gradePoint: 4.0 },
          { moduleNo: "CS5102", moduleTitle: "Parallel & High-Performance Computing", credits: 3, grade: "B+", gradePoint: 3.3 },
          { moduleNo: "CS5103", moduleTitle: "Advanced Networks", credits: 3, grade: "B", gradePoint: 3.0 },
        ],
      },
      { kind: "group", title: "Electives" },
      {
        kind: "rows",
        rows: [
          { moduleNo: "CS5E11", moduleTitle: "Natural Language Processing", credits: 2, grade: "A-", gradePoint: 3.7 },
          { moduleNo: "CS5E12", moduleTitle: "Reinforcement Learning", credits: 2, grade: "B", gradePoint: 3.0 },
        ],
      },
    ],
    sgpa: "3.62",
  },
  {
    title: "Semester 8",
    period: "(2024/2025)",
    sections: [
      { kind: "group", title: "Final Year Project" },
      {
        kind: "rows",
        rows: [
          { moduleNo: "CS5201", moduleTitle: "FYP Phase I", credits: 4, grade: "A", gradePoint: 4.0 },
          { moduleNo: "CS5202", moduleTitle: "FYP Phase II", credits: 6, grade: "A-", gradePoint: 3.7 },
        ],
      },
      { kind: "group", title: "Remaining Core/Electives" },
      {
        kind: "rows",
        rows: [
          { moduleNo: "CS5203", moduleTitle: "Edge AI Systems", credits: 3, grade: "B+", gradePoint: 3.3 },
          { moduleNo: "CS5E21", moduleTitle: "Computer Graphics", credits: 2, grade: "A", gradePoint: 4.0 },
        ],
      },
    ],
    sgpa: "3.74",
  },
];

const SemesterTables: React.FC<Props> = ({
  semesters = SAMPLE_SEMESTERS,
  startIndex = 0,
  endIndex,
  breakAfterIndex,
}) => {
  const slice = semesters.slice(startIndex, endIndex ?? semesters.length);

  return (
    <div className="tsem-root">
      {slice.map((sem, localIdx) => (
        <div
          className={`tsem-wrap ${breakAfterIndex === localIdx ? "page-break-after" : ""}`}
          key={`${startIndex + localIdx}-${sem.title}`}
        >
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
