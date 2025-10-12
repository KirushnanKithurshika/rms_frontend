import React, { useMemo, useState } from "react";

import "./LecCourseHistory.css";

type ActionType =
  | "COURSE_CREATED"
  | "COURSE_UPDATED"
  | "COURSE_DELETED"
  | "RESULTS_UPLOADED"
  | "RESULTS_MODIFIED"
  | "RESULTS_DELETED";

type HistoryItem = {
  id: string;
  when: string; // ISO date
  action: ActionType;
  courseCode: string;
  courseTitle: string;
  summary: string;
  details?: Record<string, unknown>; // flexible payload
};

const demoHistory: HistoryItem[] = [
  {
    id: "h1",
    when: "2025-10-10T09:22:00Z",
  
    action: "RESULTS_UPLOADED",
    courseCode: "EE7002",
    courseTitle: "Machine Learning",
    summary: "Uploaded CA results for Semester 01",
    details: {
      semester: "Semester 01",
      component: "CA (40%)",
      fileName: "EE7002_CA_S1_2025.csv",
      rows: 65,
    },
  },
  {
    id: "h2",
    when: "2025-10-09T15:05:00Z",
 
    action: "RESULTS_MODIFIED",
    courseCode: "EE7004",
    courseTitle: "Database Systems",
    summary: "Corrected two students’ CA totals",
    details: {
      semester: "Semester 02",
      component: "CA (40%)",
      correctedIds: ["EG/2020/4023", "EG/2020/4098"],
      reason: "Data entry error in quiz component",
    },
  },
  {
    id: "h3",
    when: "2025-10-08T11:10:00Z",
 
    action: "COURSE_UPDATED",
    courseCode: "EE7006",
    courseTitle: "Artificial Intelligence",
    summary: "Updated course description and coordinator",
    details: {
      old: { coordinator: "Dr. P. Wick", description: "Intro to AI" },
      new: {
        coordinator: "Dr. K. Raj",
        description:
          "Search, planning, reasoning, knowledge representation, and intro to deep learning.",
      },
    },
  },
  {
    id: "h4",
    when: "2025-10-06T08:30:00Z",

    action: "COURSE_CREATED",
    courseCode: "EE7010",
    courseTitle: "Distributed Systems",
    summary: "New course created",
    details: {
      credits: 3,
      department: "Electrical Engineering",
      semester: "Semester 02",
      year: "2025",
    },
  },
  {
    id: "h5",
    when: "2025-10-05T17:40:00Z",
 
    action: "COURSE_DELETED",
    courseCode: "EE7001",
    courseTitle: "Research & Methodology",
    summary: "Removed course from offering list",
    details: {
      reason: "Merged into EE7008 Research Methods",
    },
  },
  {
    id: "h6",
    when: "2025-10-03T14:02:00Z",
 
    action: "RESULTS_DELETED",
    courseCode: "EE7005",
    courseTitle: "Computer Networks",
    summary: "Deleted erroneous FE results",
    details: {
      component: "FE (60%)",
      fileName: "EE7005_FE_S2_2025.csv",
      reason: "Wrong template mapping; re-upload required",
    },
  },
];

const ACTION_LABELS: Record<ActionType, string> = {
  COURSE_CREATED: "Course Created",
  COURSE_UPDATED: "Course Updated",
  COURSE_DELETED: "Course Deleted",
  RESULTS_UPLOADED: "Results Uploaded",
  RESULTS_MODIFIED: "Results Modified",
  RESULTS_DELETED: "Results Deleted",
};

const ACTION_TONES: Record<ActionType, "ok" | "warn" | "bad" | "info"> = {
  COURSE_CREATED: "ok",
  COURSE_UPDATED: "info",
  COURSE_DELETED: "bad",
  RESULTS_UPLOADED: "ok",
  RESULTS_MODIFIED: "warn",
  RESULTS_DELETED: "bad",
};

const fmt = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const ActivityHistoryPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<"ALL" | ActionType>("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const handleBackdropClick = () => setSidebarOpen(false);

  const rows = useMemo(() => {
    let data = [...demoHistory].sort(
      (a, b) => new Date(b.when).getTime() - new Date(a.when).getTime()
    );

    if (actionFilter !== "ALL") data = data.filter((r) => r.action === actionFilter);

    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter(
        (r) =>
          r.courseCode.toLowerCase().includes(q) ||
          r.courseTitle.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q)
      );
    }
    return data;
  }, [query, actionFilter]);

  return (
    
          <div className="hist-card">
            <div className="hist-header">
              <h3>Activity History</h3>

              <div className="hist-tools">
                <div className="hist-search">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search course, actor, or summary…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search history"
                  />
                </div>

                <select
                  className="hist-select"
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value as any)}
                  aria-label="Filter by action"
                >
                  <option value="ALL">All actions</option>
                  <option value="COURSE_CREATED">Course Created</option>
                  <option value="COURSE_UPDATED">Course Updated</option>
                  <option value="COURSE_DELETED">Course Deleted</option>
                  <option value="RESULTS_UPLOADED">Results Uploaded</option>
                  <option value="RESULTS_MODIFIED">Results Modified</option>
                  <option value="RESULTS_DELETED">Results Deleted</option>
                </select>
              </div>
            </div>

            <div className="hist-scroll-x">
              <table className="hist-table" role="table">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Action</th>
                    <th>Course</th>
                    <th>Summary</th>
                 
                    <th className="hist-actions-col">Details</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="hist-empty">
                        No history found.
                      </td>
                    </tr>
                  )}

                  {rows.map((r) => {
                    const isOpen = expanded === r.id;
                    return (
                      <React.Fragment key={r.id}>
                        <tr>
                          <td className="hist-when">{fmt.format(new Date(r.when))}</td>
                          <td>
                            <span className={`hist-badge ${ACTION_TONES[r.action]}`}>
                              {ACTION_LABELS[r.action]}
                            </span>
                          </td>
                          <td>
                            <div className="hist-course">
                              <span className="code">{r.courseCode}</span>
                              <span className="title">{r.courseTitle}</span>
                            </div>
                          </td>
                          <td className="hist-summary" title={r.summary}>
                            {r.summary}
                          </td>
                       
                          <td className="hist-actions">
                            <button
                              type="button"
                              className="hist-btn-view"
                              onClick={() => setExpanded(isOpen ? null : r.id)}
                              aria-expanded={isOpen}
                              aria-controls={`hist-detail-${r.id}`}
                              title="View details"
                            >
                              {isOpen ? "Hide" : "View"}
                              <span className={`caret ${isOpen ? "rot" : ""}`}>▾</span>
                            </button>
                          </td>
                        </tr>

                        {isOpen && (
                          <tr id={`hist-detail-${r.id}`} className="hist-detail-row">
                            <td colSpan={6}>
                              <div className="hist-detail">
                                <div className="hist-detail-grid">
                                  <div>
                                    <div className="k">Action</div>
                                    <div className="v">{ACTION_LABELS[r.action]}</div>
                                  </div>
                                  <div>
                                    <div className="k">When</div>
                                    <div className="v">
                                      {fmt.format(new Date(r.when))}
                                    </div>
                                  </div>
                                  <div>
                                    
                                  
                                  </div>
                                  <div className="span-2">
                                    <div className="k">Summary</div>
                                    <div className="v">{r.summary}</div>
                                  </div>

                                  {/* Render key/value details, if any */}
                                  {r.details && (
                                    <div className="span-2">
                                      <div className="k">More details</div>
                                      <div className="v details-kv">
                                        {Object.entries(r.details).map(([k, v]) => (
                                          <div className="kv" key={k}>
                                            <span className="kk">{k}</span>
                                            <span className="vv">
                                              {Array.isArray(v) ? v.join(", ") : String(v)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
       
  );
};

export default ActivityHistoryPage;
