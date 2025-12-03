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
  grade: string; // A, A-, B+, C, etc.
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
      <header className="sr-header">
        <button
          className="sr-back-btn"
          onClick={handleBack}
          aria-label="Back"
          title="Back"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>

        <div className="sr-header-main">
          <h2 className="sr-title">
            {meta.code} — {meta.title}
          </h2>
          <div className="sr-meta-row">
            <span>{meta.batch}</span>
            <span>• {meta.semester}</span>
            {meta.academicYear && <span>• {meta.academicYear}</span>}
          </div>
        </div>

        <div className="sr-header-right">
          {meta.degreeProgram && (
            <div className="sr-detail-line">{meta.degreeProgram}</div>
          )}
          {meta.coordinator && (
            <div className="sr-detail-line">
              Coordinator: {meta.coordinator}
            </div>
          )}
          {meta.credits != null && (
            <div className="sr-detail-line">Credits: {meta.credits}</div>
          )}
          {/* Approve button */}
          <button
            className={`sr-approve-btn ${
              isApproved ? "sr-approve-btn--done" : ""
            }`}
            onClick={handleApproveClick}
            disabled={isApproved}
          >
            {isApproved ? "Approved" : "Approve"}
          </button>
        </div>
      </header>

      <main className="sr-main">
        <div className="sr-card">
          <div className="sr-card-header">
            <h3>Final Results</h3>
            <span className="sr-count">{rows.length} Students</span>
          </div>

          <div className="sr-table-wrapper">
            <table className="sr-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Reg. No</th>
                  <th>Name</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.index}>
                    <td>{r.index}</td>
                    <td>{r.regNo}</td>
                    <td>{r.name}</td>
                    <td className="sr-grade-cell">{r.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </section>
  );
};

export default FinalResultsHOD;
