import React, { useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import "./studentcourses.css";

type Course = { code: string; name: string; credits: number; status: string };
type Semester = { title: string; courses: Course[] };

const semestersData: Semester[] = [
  {
    title: "Semester 06",
    courses: Array.from({ length: 6 }).map(() => ({
      code: "EE6701",
      name: "Embedded System",
      credits: 2,
      status: "Pending", 
    })),
  },
  {
    title: "Semester 05",
    courses: Array.from({ length: 6 }).map(() => ({
      code: "EE5701",
      name: "Embedded System",
      credits: 2,
      status: "Updated",
    })),
  },
 
];

const SemesterCourses: React.FC = () => {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return semestersData;

    return semestersData
      .map((s) => ({
        ...s,
        courses: s.courses.filter(
          (c) =>
            s.title.toLowerCase().includes(term) ||
            c.code.toLowerCase().includes(term) ||
            c.name.toLowerCase().includes(term) ||
            String(c.credits).includes(term) ||
            c.status.toLowerCase().includes(term)
        ),
      }))
      .filter((s) => s.courses.length > 0);
  }, [q]);

  const onSubmit = (e: React.FormEvent) => e.preventDefault();

  return (
    <div className="sc-wrap">
      {/* search on the right */}
      <div className="sc-toolbar">
        <form className="sc-search" onSubmit={onSubmit} role="search" aria-label="Search semesters or courses">
          <input
            className="sc-input"
            type="text"
            placeholder="Search Semester"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            inputMode="search"
            aria-label="Search Semester"
          />
          <button className="sc-btn" type="submit" aria-label="Search">
            <FaSearch className="sc-ico" />
          </button>
        </form>
      </div>

      {filtered.map((sem) => (
        <section key={sem.title} className="sc-card">
          <header className="sc-head">{sem.title}</header>

          <div className="sc-table-wrap">
            <table className="sc-table" aria-label={`${sem.title} taken courses`}>
              <thead>
                <tr>
                  <th>Module Code</th>
                  <th>Module&nbsp;Name</th>
                  <th>Credits</th>
                  <th>Results Status</th>
                </tr>
              </thead>
              <tbody>
                {sem.courses.map((c, i) => (
                  <tr key={`${sem.title}-${i}`}>
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
