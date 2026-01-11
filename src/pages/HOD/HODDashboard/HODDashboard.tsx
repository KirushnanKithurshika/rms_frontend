import React, { useEffect, useMemo, useState } from "react";
import Navbarin from "../../../components/Navbar/navbarin";
import BreadcrumbNav from "../../../components/breadcrumbnav/breadcrumbnav";
import { FaRegFilePdf } from "react-icons/fa";
import "./hoddashboard.css";
import { downloadExactHtmlPdf } from "../../../utils/downloadResultsSheetPdf";
import api from "../../../services/api";

import FinalResultsHOD from "../../../components/HOD/HODViewResultsSheet/HODViewResultsSheet";
import type {
  SubjectMeta,
  StudentResult,
} from "../../../components/HOD/HODViewResultsSheet/HODViewResultsSheet";

interface HODResultSheet {
  id: number;
  courseCode: string;
  courseTitle: string;
  batch: string;
  semester: string;
  approved?: boolean;
  subjectMeta: SubjectMeta;
  results: StudentResult[];
}

type CourseSummary = {
  allocationId: number;
  courseCode: string;
  courseTitle: string;
  batch: string;
  semester: string;
  hasSheet: boolean;
  approved: boolean;
};

const HODDashboard: React.FC = () => {
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [departmentName, setDepartmentName] = useState<string>("");
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [sheets, setSheets] = useState<HODResultSheet[]>([]);
  const [activeSheetId, setActiveSheetId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uniqueSemesters = useMemo(() => {
    if (!courses.length) return [];
    return Array.from(new Set(courses.map((c) => c.semester || "Unspecified")));
  }, [courses]);

  useEffect(() => {
    let cancelled = false;

    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const depRes = await api.get("/v1/user/department-id");
        const depRaw = depRes.data?.data ?? depRes.data;
        const depId = Number(
          typeof depRaw === "object" && depRaw !== null ? depRaw?.departmentId : depRaw
        );
        if (!depId || Number.isNaN(depId)) {
          throw new Error("Unable to determine department.");
        }
        if (!cancelled) {
          setDepartmentId(depId);
        }

        const dashRes = await api.get(`/v1/departments/${depId}/hod-dashboard`);
        const payload = dashRes.data?.data ?? dashRes.data;
        if (cancelled) return;

        setDepartmentName(payload?.departmentName ?? "");
        setCourses(payload?.courses ?? []);
        setSheets(payload?.sheets ?? []);
      } catch (e: any) {
        if (cancelled) return;
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Failed to load HOD dashboard.";
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeSheet = activeSheetId
    ? sheets.find((s) => s.id === activeSheetId) || null
    : null;

  const openSheet = (sheet: HODResultSheet) => {
    setActiveSheetId(sheet.id);
  };

  const handleApproveSheet = (sheetId: number) => {
    setSheets((prev) =>
      prev.map((s) => (s.id === sheetId ? { ...s, approved: true } : s))
    );
    setActiveSheetId(null);
  };

  const handleBackFromResults = () => {
    setActiveSheetId(null);
  };

  const getCoursesBySemester = (semester: string) =>
    courses.filter((c) => c.semester === semester);

 
  const handleTopBarApprove = () => {
    if (!activeSheet) return;
    handleApproveSheet(activeSheet.id);
    alert("Approved successfully!");
  };


  const handleDownloadPdf = async () => {
    if (!activeSheet) return;

    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve())
    );

    await downloadExactHtmlPdf(
      "#results-pdf-root",
      `${activeSheet.courseCode}-${activeSheet.courseTitle}.pdf`
    );
  };

  const renderSemesterSection = (semester: string) => {
    const semesterCourses = getCoursesBySemester(semester);
    const batchLabel = semesterCourses[0]?.batch;

    return (
      <section className="hod-semester-section" key={semester}>
        <div className="hod-semester-header">
          <span>{semester}</span>
          {batchLabel && <span className="hod-batch-label">{batchLabel}</span>}
        </div>

        <section className="pa-scope pa-wrap">
          <div className="pa-list">
            {semesterCourses.length === 0 && (
              <span className="hod-empty-placeholder" />
            )}

            {semesterCourses.map((course) => {
              const sheet = sheets.find(
                (s) =>
                  s.courseCode === course.courseCode &&
                  s.semester === course.semester &&
                  s.batch === course.batch
              );

              const canOpen = Boolean(sheet);
              const isApproved = sheet?.approved ?? course.approved;
              const isPending = !canOpen;

              return (
                <div
                  key={`${semester}-${course.courseCode}-${course.batch}`}
                  className="pa-card"
                  role="group"
                  aria-label={`${course.courseCode}-${course.courseTitle}`}
                >
                  <div className="pa-card-left">
                    <FaRegFilePdf className="pa-icon" aria-hidden="true" />
                    <div className="pa-title">
                      {course.courseCode}-{course.courseTitle}
                    </div>
                  </div>

                  <button
                    className={`pa-button ${
                      isApproved
                        ? "hod-approved"
                        : isPending
                        ? "hod-pending"
                        : ""
                    }`}
                    onClick={() => canOpen && !isApproved && sheet && openSheet(sheet)}
                    disabled={!canOpen || isApproved}
                  >
                    {isPending
                      ? "Pending"
                      : isApproved
                      ? "Approved"
                      : "View & Approve"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </section>
    );
  };

  return (
    <div className="lec-dashboard-container">
      <div className="hod-role-label">HOD</div>
      {departmentName && (
        <div className="hod-role-subtitle">
          {departmentName} {departmentId ? `(ID: ${departmentId})` : ""}
        </div>
      )}

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
                  {error && (
                    <div className="hod-error" role="alert">
                      {error}
                    </div>
                  )}
                  {loading && (
                    <div className="hod-loading">Loading dashboard...</div>
                  )}
                  {!loading && !error && uniqueSemesters.length === 0 && (
                    <div className="hod-empty-placeholder">
                      No courses available for approval.
                    </div>
                  )}
                  {!loading &&
                    !error &&
                    uniqueSemesters.map((semester) => renderSemesterSection(semester))}
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

                      <div className="tAR-inline-spacer" />

                      <button
                        type="button"
                        className="taAR-btn taAR-btn--ghost"
                        onClick={handleDownloadPdf}
                      >
                        Download PDF
                      </button>

                      <button
                        type="button"
                        className="taAR-btn"
                        onClick={handleTopBarApprove}
                      >
                        Approve
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
