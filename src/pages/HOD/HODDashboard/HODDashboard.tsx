import React, { useState } from "react";
import Navbarin from "../../../components/Navbar/navbarin";
import BreadcrumbNav from "../../../components/breadcrumbnav/breadcrumbnav";
import { FaRegFilePdf } from "react-icons/fa";
import "./hoddashboard.css";

import FinalResultsHOD from "../../../components/HOD/HODViewResultsSheet/HODViewResultsSheet";
import type {
  SubjectMeta,
  StudentResult,
} from "../../../components/HOD/HODViewResultsSheet/HODViewResultsSheet";

/* -------- Types -------- */

interface HODResultSheet {
  id: number;
  courseCode: string;
  courseTitle: string;
  batch: string;
  semester: "Semester 01" | "Semester 02";
  approved?: boolean;
  subjectMeta: SubjectMeta;
  results: StudentResult[];
}

type CourseSummary = {
  code: string;
  title: string;
  batch: string;
  semester: "Semester 01" | "Semester 02";
};

/* ---------- All current subjects (for pending detection) ---------- */

const allCourses: CourseSummary[] = [
  {
    code: "EE1202",
    title: "Infrastructure",
    batch: "22nd Batch",
    semester: "Semester 01",
  },
  {
    code: "EE1101",
    title: "Basic Electrical Engineering",
    batch: "22nd Batch",
    semester: "Semester 01",
  },
  {
    code: "CE1101",
    title: "Engineering Mechanics",
    batch: "22nd Batch",
    semester: "Semester 01",
  },
  {
    code: "ME1201",
    title: "Thermodynamics",
    batch: "22nd Batch",
    semester: "Semester 02",
  },
];

/* ---------- Initial uploaded result sheets (dummy data) ---------- */

const initialSheets: HODResultSheet[] = [
  {
    id: 1,
    courseCode: "EE1202",
    courseTitle: "Infrastructure",
    batch: "22nd Batch",
    semester: "Semester 01",
    approved: false,
    subjectMeta: {
      code: "EE1202",
      title: "Infrastructure",
      batch: "22nd Batch",
      semester: "Semester 01",
      academicYear: "2023/2024",
      degreeProgram: "BSc. Eng. in Electrical & Information Engineering",
      coordinator: "Dr. A. R. Silva",
      credits: 3,
    },
    results: [
      { index: 1, regNo: "EG/2020/4023", name: "Kithurshika K.", grade: "A" },
      { index: 2, regNo: "EG/2020/4011", name: "Nevaa S.", grade: "A-" },
      { index: 3, regNo: "EG/2020/4005", name: "Thana T.", grade: "B+" },
      { index: 4, regNo: "EG/2020/4030", name: "Pamith P.", grade: "C" },
    ],
  },
  {
    id: 2,
    courseCode: "EE1202",
    courseTitle: "Infrastructure",
    batch: "22nd Batch",
    semester: "Semester 01",
    approved: false,
    subjectMeta: {
      code: "EE1202",
      title: "Infrastructure",
      batch: "22nd Batch",
      semester: "Semester 01",
      academicYear: "2023/2024",
      degreeProgram: "BSc. Eng. in Electrical & Information Engineering",
      coordinator: "Dr. A. R. Silva",
      credits: 3,
    },
    results: [
      { index: 1, regNo: "EG/2020/4025", name: "Student One", grade: "B" },
      { index: 2, regNo: "EG/2020/4026", name: "Student Two", grade: "A" },
    ],
  },
];

const HODDashboard: React.FC = () => {
  const [sheets, setSheets] = useState<HODResultSheet[]>(initialSheets);
  const [activeSheetId, setActiveSheetId] = useState<number | null>(null);


  const semester01 = sheets.filter((s) => s.semester === "Semester 01");
  const semester02 = sheets.filter((s) => s.semester === "Semester 02");

  const activeSheet = activeSheetId
    ? sheets.find((s) => s.id === activeSheetId) || null
    : null;

 
  const pendingCourses = allCourses.filter((course) => {
    const sheet = sheets.find(
      (s) =>
        s.courseCode === course.code &&
        s.semester === course.semester &&
        s.batch === course.batch
    );
    return !sheet; 
  });

  const openSheet = (sheet: HODResultSheet) => {
    setActiveSheetId(sheet.id);
  };

  const handleApproveSheet = (sheetId: number) => {
    setSheets((prev) =>
      prev.map((s) =>
        s.id === sheetId ? { ...s, approved: true } : s
      )
    );
    setActiveSheetId(null);
  };

  const handleBackFromResults = () => {
    setActiveSheetId(null);
  };

  return (
    <div className="lec-dashboard-container">

      <div className="hod-role-label">HOD</div>


      <div className="nav">
        <Navbarin />
      </div>

  
      <div className="breadcrumb">
        <BreadcrumbNav />
      </div>

     
      <div className="dashboard-content-approval">
        <div className="main-area-approval">
          <div className="card-approval">
            <div className="CAA">
              <div className="tARD">
                <span className="tAR-heading">Pending Results Approval</span>
              </div>

          
              {!activeSheet && (
                <div className="tAR-inline-body-results">
               
                  {pendingCourses.length > 0 && (
                    <section className="hod-semester-section">
                      <div className="hod-semester-header">
                        <span>Pending Result Subjects</span>
                        <span className="hod-batch-label">22nd Batch</span>
                      </div>

                      <section className="pa-scope pa-wrap">
                        <div className="pa-list">
                          {pendingCourses.map((course) => (
                            <div
                              key={`pending-${course.semester}-${course.code}`}
                              className="pa-card"
                              role="group"
                              aria-label={`${course.code}-${course.title}`}
                            >
                              <div className="pa-card-left">
                                <FaRegFilePdf
                                  className="pa-icon"
                                  aria-hidden="true"
                                />
                                <div className="pa-title">
                                  {course.code}-{course.title}
                                  <span className="hod-pending-label">
                                    Pending
                                  </span>
                                </div>
                              </div>

                              <button
                                className="pa-button hod-pending"
                                disabled
                              >
                                Pending
                              </button>
                            </div>
                          ))}
                        </div>
                      </section>
                    </section>
                  )}

                  <section className="hod-semester-section">
                    <div className="hod-semester-header">
                      <span>Semester 01</span>
                      <span className="hod-batch-label">22nd Batch</span>
                    </div>

                    <section className="pa-scope pa-wrap">
                      <div className="pa-list">
                        {semester01.map((sheet) => (
                          <div
                            key={sheet.id}
                            className="pa-card"
                            role="group"
                            aria-label={`${sheet.courseCode}-${sheet.courseTitle}`}
                          >
                            <div className="pa-card-left">
                              <FaRegFilePdf
                                className="pa-icon"
                                aria-hidden="true"
                              />
                              <div className="pa-title">
                                {sheet.courseCode}-{sheet.courseTitle}
                              </div>
                            </div>

                            <button
                              className={`pa-button ${
                                sheet.approved ? "hod-approved" : ""
                              }`}
                              onClick={() =>
                                !sheet.approved && openSheet(sheet)
                              }
                              disabled={sheet.approved}
                            >
                              {sheet.approved ? "Approved" : "View & Approve"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </section>
                  </section>

                  
                  <section className="hod-semester-section">
                    <div className="hod-semester-header">
                      <span>Semester 02</span>
                      <span className="hod-batch-label">22nd Batch</span>
                    </div>

                    <section className="pa-scope pa-wrap">
                      <div className="pa-list">
                        {semester02.length === 0 && (
                          <span className="hod-empty-placeholder" />
                        )}
                        {semester02.map((sheet) => (
                          <div
                            key={sheet.id}
                            className="pa-card"
                            role="group"
                            aria-label={`${sheet.courseCode}-${sheet.courseTitle}`}
                          >
                            <div className="pa-card-left">
                              <FaRegFilePdf
                                className="pa-icon"
                                aria-hidden="true"
                              />
                              <div className="pa-title">
                                {sheet.courseCode}-{sheet.courseTitle}
                              </div>
                            </div>

                            <button
                              className={`pa-button ${
                                sheet.approved ? "hod-approved" : ""
                              }`}
                              onClick={() =>
                                !sheet.approved && openSheet(sheet)
                              }
                              disabled={sheet.approved}
                            >
                              {sheet.approved ? "Approved" : "View & Approve"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </section>
                  </section>
                </div>
              )}

              {activeSheet && (
                <>
                  <div className="tAR-inline">
                    <div className="tAR-inline-topbar">
                      <button
                        type="button"
                        className="taAR-btn taAR-btn--ghost"
                        onClick={handleBackFromResults}
                      >
                        ← Back
                      </button>
                    </div>
                  </div>

                  <div className="tAR-inline-body-results">
                    <FinalResultsHOD
                      subject={activeSheet.subjectMeta}
                      results={activeSheet.results}
                      isApproved={activeSheet.approved}
                      onBack={handleBackFromResults}
                      onApprove={() => handleApproveSheet(activeSheet.id)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HODDashboard;
