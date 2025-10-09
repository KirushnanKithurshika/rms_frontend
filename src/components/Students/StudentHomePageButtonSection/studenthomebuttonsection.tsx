import React, { useState } from "react";
import "./studenthomebuttonsection.css";
import { FaSearch, FaChevronDown } from "react-icons/fa";
import StudentResultsSheet from "../Studentsresultsheet/StudentResultsSheet";
import StudentsConAss from "../StudentsCA/StudentsCA";

const ResultsTabsButtomSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"CA" | "EXAM">("CA");
  const [q, setQ] = useState("");
  const [openSemester, setOpenSemester] = useState<number | null>(null); // single-open

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search semester:", q);
  };

  const toggleSemester = (n: number) =>
    setOpenSemester((cur) => (cur === n ? null : n));

  const semesters = [1, 2, 3, 4, 5, 6];

  return (
    <div className="results-wrap">
      <h3 className="results-title">Results</h3>

      {/* Tabs + Search */}
      <div className="results-toolbar">
        <div className="tabs-SH">
          <button
            className={`tab ${activeTab === "CA" ? "active" : ""}`}
            onClick={() => setActiveTab("CA")}
            type="button"
          >
            CA Marks
          </button>
          <button
            className={`tab ${activeTab === "EXAM" ? "active" : ""}`}
            onClick={() => setActiveTab("EXAM")}
            type="button"
          >
            Exam Results
          </button>
        </div>

        <form className="search" onSubmit={handleSearch} role="search" aria-label="Search semester">
          <input
            type="text"
            inputMode="search"
            placeholder="Search Semester"
            className="search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search Semester"
          />
          <button className="search-icon-btn" type="submit" aria-label="Search">
            <FaSearch className="search-icon" />
          </button>
        </form>
      </div>

      {/* Accordion: Semesters 01 - 06 */}
      <div className="sem-accordion">
        {semesters.map((n) => {
          const open = openSemester === n;
          return (
            <div key={n} className={`sem-item ${open ? "open" : ""}`}>
              <button
                type="button"
                className="sem-head"
                onClick={() => toggleSemester(n)}
                aria-expanded={open}
                aria-controls={`sem-panel-${n}`}
              >
                <span className="sem-title">Semester {String(n).padStart(2, "0")}</span>
                <FaChevronDown className="sem-arrow" aria-hidden="true" />
              </button>

              <div
                id={`sem-panel-${n}`}
                className="sem-panel"
                hidden={!open}
                role="region"
                aria-label={`Semester ${n} results`}
              >
                {/* The panel is exactly the same width as the band, but the sheet is centered inside */}
                <div className="results-sheet-host">
  {activeTab === "CA" ? (
    <StudentsConAss />
  ) : (
    <StudentResultsSheet  />
  )}
</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultsTabsButtomSection;
