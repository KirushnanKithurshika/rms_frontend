import React, { useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import "./studentcourses.css";

type Course = { code: string; name: string; credits: number; status: string };
type Semester = { semesterName: string; courses: Course[] };

interface Props {
  semesters: Semester[];
  student?: {
    id: number;
    name: string;
    registrationNumber: string;
    batchName: string;
    departmentName: string;
  } | null;
}

const SemesterCourses: React.FC<Props> = ({ semesters, student }) => {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return semesters;

    return semesters
      .map((s) => ({
        ...s,
        courses: s.courses.filter(
          (c) =>
            s.semesterName.toLowerCase().includes(term) ||
            c.code.toLowerCase().includes(term) ||
            c.name.toLowerCase().includes(term) ||
            String(c.credits).includes(term) ||
            c.status.toLowerCase().includes(term)
        ),
      }))
      .filter((s) => s.courses.length > 0);
  }, [q, semesters]);

  return (
    <div className="sc-wrap">
      <div className="sc-toolbar">
        <form className="sc-search" onSubmit={(e) => e.preventDefault()}>
          <input
            className="sc-input"
            type="text"
            placeholder="Search Semester"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="sc-btn" type="submit">
            <FaSearch className="sc-ico" />
          </button>
        </form>
      </div>

      {/* {student && (
        <div className="student-info">
          <h3>{student.name}</h3>
          <p>
            Reg. No: {student.registrationNumber} | Batch: {student.batchName} |{" "}
            Dept: {student.departmentName}
          </p>
        </div>
      )} */}

      {filtered.map((sem) => (
        <section key={sem.semesterName} className="sc-card">
          <header className="sc-head">{sem.semesterName}</header>
          <div className="sc-table-wrap">
            <table className="sc-table">
              <thead>
                <tr>
                  <th>Module Code</th>
                  <th>Module&nbsp;Name</th>
                  <th>Credits</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sem.courses.map((c, i) => (
                  <tr key={`${sem.semesterName}-${i}`}>
                    <td>{c.code}</td>
                    <td>{c.name}</td>
                    <td className="sc-center">{c.credits}</td>
                    <td>{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
};

export default SemesterCourses;
