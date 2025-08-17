import React, { useState } from "react";
import "./studenthomebuttonsection.css";
import { FaSearch } from "react-icons/fa";
import StudentResultsSheet from "../Studentsresultsheet/StudentResultsSheet";

const ResultsTabsButtomSection: React.FC = () => {
  const [active, setActive] = useState<"CA" | "EXAM">("CA");
  const [q, setQ] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search semester:", q);
  };

  return (
    <div className="results-wrap">
      <h3 className="results-title">Results</h3>

      {/* Tabs + Search */}
      <div className="results-toolbar">
        <div className="tabs">
          <button
            className={`tab ${active === "CA" ? "active" : ""}`}
            onClick={() => setActive("CA")}
            type="button"
          >
            CA Marks
          </button>
          <button
            className={`tab ${active === "EXAM" ? "active" : ""}`}
            onClick={() => setActive("EXAM")}
            type="button"
          >
            Exam Results
          </button>
        </div>

        {/* Icon sits INSIDE the input on the right */}
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

      <div className="semester-band">
        <span>Semester 04</span>
      </div>

      {/* Center the results sheet */}
      <div className="results-sheet-host">
        <StudentResultsSheet />
      </div>
    </div>
  );
};

export default ResultsTabsButtomSection;
