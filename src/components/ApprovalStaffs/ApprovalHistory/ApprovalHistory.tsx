import React, { useMemo, useState } from "react";
import { FaChevronDown, FaSearch, FaEye } from "react-icons/fa";
import { format } from "date-fns";
import Navbarin from "../../../components/Navbar/navbarin";
import ApprovalSidebar from "../../../components/ApprovalStaffs/ApprovalSidebar/approval";
import "./ApprovalHistory.css";

export type HistoryRow = {
  id: string;
  name: string;
  sid: string;
  batch: string;
  department: string;
  decision: "APPROVED" | "REJECTED";
  summary: string;          
  reason?: string;         
  decidedBy: string;        
  decidedAt: string;       
};

const demoHistory: HistoryRow[] = [
  {
    id: "1",
    name: "John Smith",
    sid: "EG/2020/4023",
    batch: "E2020",
    department: "Electrical",
    decision: "APPROVED",
    summary: "Approved CA marks release for Semester 06",
    decidedBy: "staff.senate1",
    decidedAt: "2025-10-08T10:12:00Z",
  },
  {
    id: "2",
    name: "Anika Perera",
    sid: "EG/2020/4098",
    batch: "E2019",
    department: "Computer",
    decision: "REJECTED",
    summary: "Rejected CA marks due to inconsistent lab scores",
    reason: "Lab component total did not match uploaded breakdown.",
    decidedBy: "staff.dean2",
    decidedAt: "2025-10-07T15:41:00Z",
  },
  {
    id: "3",
    name: "Ruwan Silva",
    sid: "EG/2020/4216",
    batch: "E2021",
    department: "Mechanical",
    decision: "APPROVED",
    summary: "Approved profile update & eligibility",
    decidedBy: "staff.hod3",
    decidedAt: "2025-10-06T08:25:00Z",
  },
];

const ApprovalHistoryPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [filterDecision, setFilterDecision] = useState<"ALL" | "APPROVED" | "REJECTED">("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const data = useMemo(() => {
    let rows = [...demoHistory].sort(
      (a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime()
    );

    if (filterDecision !== "ALL") {
      rows = rows.filter((r) => r.decision === filterDecision);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.sid.toLowerCase().includes(q) ||
          r.batch.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [query, filterDecision]);

  return (
    

      
       

    
          <div className="ah-card">
            <div className="ah-header">
              <h3>Approval History</h3>

              <div className="ah-tools">
                <div className="ah-search">
                  <FaSearch className="ah-search-icon" />
                  <input
                    type="text"
                    placeholder="Search name, ID, summary…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search history"
                  />
                </div>

                <select
                  className="ah-select"
                  value={filterDecision}
                  onChange={(e) => setFilterDecision(e.target.value as any)}
                  aria-label="Filter by decision"
                >
                  <option value="ALL">All</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            <div className="ah-scroll-x">
              <table className="ah-table" role="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>ID</th>
                    <th>Batch</th>
                    <th>Department</th>
                    <th>Summary</th>
                    <th>Decision</th>
                    <th>Decided At</th>
                    <th className="ah-actions-col">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {data.length === 0 && (
                    <tr>
                      <td colSpan={8} className="ah-empty">No history found.</td>
                    </tr>
                  )}

                  {data.map((r) => {
                    const isOpen = expandedId === r.id;
                    return (
                      <React.Fragment key={r.id}>
                        <tr>
                          <td className="ah-strong">{r.name}</td>
                          <td><span className="ah-chip">{r.sid}</span></td>
                          <td><span className="ah-chip">{r.batch}</span></td>
                          <td>{r.department}</td>
                          <td className="ah-summary" title={r.summary}>{r.summary}</td>
                          <td>
                            <span className={`ah-badge ${r.decision === "APPROVED" ? "ok" : "bad"}`}>
                              {r.decision === "APPROVED" ? "Approved" : "Rejected"}
                            </span>
                          </td>
                          <td>{format(new Date(r.decidedAt), "yyyy-MM-dd HH:mm")}</td>
                          <td className="ah-actions">
                            <button
                              type="button"
                              className="ah-btn-view"
                              onClick={() => setExpandedId(isOpen ? null : r.id)}
                              aria-expanded={isOpen}
                              aria-controls={`ah-detail-${r.id}`}
                              title="View details"
                            >
                              <FaEye /> View
                              <FaChevronDown className={`ah-caret ${isOpen ? "rot" : ""}`} />
                            </button>
                          </td>
                        </tr>

                        {/* Detail row */}
                        {isOpen && (
                          <tr id={`ah-detail-${r.id}`} className="ah-detail-row">
                            <td colSpan={8}>
                              <div className="ah-detail">
                                <div className="ah-detail-grid">
                                  <div>
                                    <div className="ah-k">Decision</div>
                                    <div className="ah-v">
                                      <span className={`ah-badge ${r.decision === "APPROVED" ? "ok" : "bad"}`}>
                                        {r.decision === "APPROVED" ? "Approved" : "Rejected"}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="ah-k">Decided by</div>
                                    <div className="ah-v">{r.decidedBy}</div>
                                  </div>
                                  <div>
                                    <div className="ah-k">Decided at</div>
                                    <div className="ah-v">
                                      {format(new Date(r.decidedAt), "yyyy-MM-dd HH:mm:ss")}
                                    </div>
                                  </div>
                                  {r.reason && (
                                    <div className="ah-span-2">
                                      <div className="ah-k">Reason</div>
                                      <div className="ah-v">{r.reason}</div>
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

export default ApprovalHistoryPage;
