import React, { useState } from "react";
import { useSelector } from "react-redux";
import { FaSearch, FaChevronDown } from "react-icons/fa";
import StudentResultsSheet from "../Studentsresultsheet/StudentResultsSheet";
import "./studenthomebuttonsection.css";
import type { RootState } from "../../../app/store";

const ResultsTabsButtomSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"CA" | "EXAM">("CA");
  const [q, setQ] = useState("");
  const [openSemester, setOpenSemester] = useState<number | null>(null); // single-open

  const resultsSheet = useSelector(
    (state: RootState) => state.studentResults.resultsSheet
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search semester:", q);
  };

  const toggleSemester = (n: number) =>
    setOpenSemester((cur) => (cur === n ? null : n));

  // Use semesters from resultsSheet
  const semesters = resultsSheet?.semesters ?? [];

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

        <form
          className="search"
          onSubmit={handleSearch}
          role="search"
          aria-label="Search semester"
        >
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

      {/* Accordion: Dynamic Semesters */}
      <div className="sem-accordion">
        {semesters.length > 0 ? (
          semesters
            .filter((s) =>
              q ? s.semesterName.toLowerCase().includes(q.toLowerCase()) : true
            )
            .map((semester, index) => {
              const open = openSemester === index;
              return (
                <div key={index} className={`sem-item ${open ? "open" : ""}`}>
                  <button
                    type="button"
                    className="sem-head"
                    onClick={() => toggleSemester(index)}
                    aria-expanded={open}
                    aria-controls={`sem-panel-${index}`}
                  >
                    <span className="sem-title">{semester.semesterName}</span>
                    <FaChevronDown className="sem-arrow" aria-hidden="true" />
                  </button>

                  <div
                    id={`sem-panel-${index}`}
                    className="sem-panel"
                    hidden={!open}
                    role="region"
                    aria-label={`${semester.semesterName} results`}
                  >
                    <div className="results-sheet-host">
                      <StudentResultsSheet
                        university={resultsSheet?.university ?? ""} // <-- fallback
                        facultyLine={resultsSheet?.facultyLine ?? ""}
                        specialization={resultsSheet?.specialization ?? ""}
                        sheetTitle={resultsSheet?.sheetTitle ?? ""}
                        provisionalLine={resultsSheet?.provisionalLine ?? ""}
                        core={semester.core}
                        electives={semester.electives}
                        student={{
                          ...resultsSheet?.student!,
                          gradesByCode:
                            resultsSheet?.student?.gradesByCode ?? {}, // default empty object
                        }}
                        modulesCountingForGPA={{
                          core: semester.core.map((c) => c.code),
                          electives: semester.electives.map((c) => c.code),
                        }}
                        gradeByCode={semester.gradesByCode}
                        note={resultsSheet?.note ?? ""}
                      />
                    </div>
                  </div>
                </div>
              );
            })
        ) : (
          <p>No semester data available.</p>
        )}
      </div>
    </div>
  );
};

export default ResultsTabsButtomSection;
