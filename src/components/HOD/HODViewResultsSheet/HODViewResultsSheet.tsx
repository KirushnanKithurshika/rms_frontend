import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export type SubjectMeta = {
  code: string;
  title: string;
  batch: string;
  semester: string;
  academicYear?: string;
  degreeProgram?: string;
  coordinator?: string;
  credits?: number;
};

export type StudentResult = {
  index: number;
  regNo: string;
  name: string;
  grade: string; 
};

type FinalResultsProps = {
  subject?: SubjectMeta;
  results?: StudentResult[];
  onBack?: () => void;
  onApprove?: () => void;
  isApproved?: boolean;
};

const FinalResultsHOD: React.FC<FinalResultsProps> = ({
  subject,
  results,
  onBack,
  onApprove,
  isApproved,
}) => {
  const meta: SubjectMeta =
    subject ?? {
      code: "EE1202",
      title: "Infrastructure",
      batch: "22nd Batch",
      semester: "Semester 01",
      academicYear: "2023/2024",
      degreeProgram: "BSc. Eng. in Electrical & Information Engineering",
      coordinator: "Dr. A. R. Silva",
      credits: 3,
    };

  const rows: StudentResult[] =
    results ?? [
      { index: 1, regNo: "EG/2020/4023", name: "Kithurshika K.", grade: "A" },
      { index: 2, regNo: "EG/2020/4011", name: "Nevaa S.", grade: "A-" },
      { index: 3, regNo: "EG/2020/4005", name: "Thana T.", grade: "B+" },
      { index: 4, regNo: "EG/2020/4030", name: "Pamith P.", grade: "C" },
    ];

  const gradeRow = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "E", "N", "W"];
  const gpRow = ["4.0", "4.0", "3.7", "3.3", "3.0", "2.7", "2.3", "2.0", "1.7", "0.0", "-", "-"];

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (window.history.length > 1) {
      window.history.back();
    }
  };

  const handleApproveClick = () => {
    if (isApproved) return;
    onApprove?.();
  };

  return (
    <section className="sr-shell">
     
      

     
      <section className="sheet a4" id="results-pdf-root">
        <div role="document" aria-label="A4 Results Sheet">
          <div className="rs-top avoid-break">
         
            <div className="hdr uni">Faculty of Engineering, University of Ruhuna</div>
            {meta.degreeProgram && (
              <div className="hdr under">{meta.degreeProgram}</div>
            )}
            <div className="hdr spec">
              {meta.code} — {meta.title}
            </div>
            <div className="hdr title">
              Final Results Sheet ({meta.batch}, {meta.semester})
            </div>
            {meta.academicYear && (
              <div className="hdr under">Academic Year: {meta.academicYear}</div>
            )}

  
            <div className="section-title avoid-break">Course / Subject Information</div>
            <table className="list avoid-break meta-table">
              <tbody>
                <tr>
                  <td className="meta-label">Course Code</td>
                  <td className="meta-value">{meta.code}</td>
                  <td className="meta-label">Course Title</td>
                  <td className="meta-value">{meta.title}</td>
                </tr>
                <tr>
                  <td className="meta-label">Batch</td>
                  <td className="meta-value">{meta.batch}</td>
                  <td className="meta-label">Semester</td>
                  <td className="meta-value">{meta.semester}</td>
                </tr>
                {meta.academicYear && (
                  <tr>
                    <td className="meta-label">Academic Year</td>
                    <td className="meta-value">{meta.academicYear}</td>
                    <td className="meta-label">Credits</td>
                    <td className="meta-value">{meta.credits ?? "-"}</td>
                  </tr>
                )}
                {meta.coordinator && (
                  <tr>
                    <td className="meta-label">Course Coordinator</td>
                    <td className="meta-value" colSpan={3}>
                      {meta.coordinator}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

           
            <div className="section-title avoid-break">
              Final Grades – {rows.length} Students
            </div>

            <div className="rs-box">
         
              

      
              <table className="list avoid-break grades-table">
                <thead>
                  <tr>
                    <th className="legend-head">Grade</th>
                    {gradeRow.map((g) => (
                      <th key={g} className="legend-cell">
                        {g}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="legend-head">Grade Point</td>
                    {gpRow.map((g, i) => (
                      <td key={i} className="legend-cell">
                        {g}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>

              <table className="results-table clean-table">
              <thead>
                <tr>
                  <th className="center">Student Reg.No</th>
                  <th className="center">Name</th>
                  <th className="center">Result</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "row-light" : "row-dark"}>
                    <td className="center">{r.regNo}</td>
                    <td className="center">{r.name}</td>
                    <td className="center">{r.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default FinalResultsHOD;
