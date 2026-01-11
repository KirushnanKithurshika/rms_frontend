import React, { useMemo, useState } from "react";
import { FaChevronDown, FaEye, FaSearch } from "react-icons/fa";
import { format } from "date-fns";


export type RejectedTranscriptRow = {
  id: string;
  studentName: string;
  regNo: string;
  batch: string;
  department: string;

  requestType: string;     
  reason: string;          
  rejectedBy: string;      
  rejectedAt: string;       
};

const demoRejected: RejectedTranscriptRow[] = [
  {
    id: "1",
    studentName: "Anika Perera",
    regNo: "EG/2020/4098",
    batch: "E2019",
    department: "Computer",
    requestType: "Transcript",
    reason: "Payment receipt missing / invalid.",
    rejectedBy: "staff.registrar1",
    rejectedAt: "2025-11-20T10:12:00Z",
  },
  {
    id: "2",
    studentName: "Ruwan Silva",
    regNo: "EG/2020/4216",
    batch: "E2021",
    department: "Mechanical",
    requestType: "Transcript",
    reason: "Student has pending library clearance.",
    rejectedBy: "staff.dean2",
    rejectedAt: "2025-11-18T15:41:00Z",
  },
];

const RejectedTranscriptRequests: React.FC = () => {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const data = useMemo(() => {
    let rows = [...demoRejected].sort(
      (a, b) => new Date(b.rejectedAt).getTime() - new Date(a.rejectedAt).getTime()
    );

    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.studentName.toLowerCase().includes(q) ||
          r.regNo.toLowerCase().includes(q) ||
          r.batch.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q) ||
          r.requestType.toLowerCase().includes(q) ||
          r.reason.toLowerCase().includes(q) ||
          r.rejectedBy.toLowerCase().includes(q)
      );
    }

    return rows;
  }, [query]);

  return (
    <div className="dashboard-cards">
      <div className="cardcourse">
        <div className="tARD">
     
        </div>

        <div className="ah-card">
          <div className="ah-header">
            <h3>Rejected Requests</h3>

            <div className="ah-tools">
              <div className="ah-search">
                <FaSearch className="ah-search-icon" />
                <input
                  type="text"
                  placeholder="Search name, reg no, reason…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search rejected transcript requests"
                />
              </div>
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
                  <th>Request Type</th>
                  <th>Decision</th>
                  <th>Rejected At</th>
                  <th className="ah-actions-col">Actions</th>
                </tr>
              </thead>

              <tbody>
                {data.length === 0 && (
                  <tr>
                    <td colSpan={8} className="ah-empty">
                      No rejected requests found.
                    </td>
                  </tr>
                )}

                {data.map((r) => {
                  const isOpen = expandedId === r.id;

                  return (
                    <React.Fragment key={r.id}>
                      <tr>
                        <td className="ah-strong">{r.studentName}</td>
                        <td>
                          <span className="ah-chip">{r.regNo}</span>
                        </td>
                        <td>
                          <span className="ah-chip">{r.batch}</span>
                        </td>
                        <td>{r.department}</td>
                        <td className="ah-summary" title={r.requestType}>
                          {r.requestType}
                        </td>

                
                        <td>
                          <span className="ah-badge bad">Rejected</span>
                        </td>

                        <td className="decidedat">
                          {format(new Date(r.rejectedAt), "yyyy-MM-dd HH:mm")}
                        </td>

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

               
                      {isOpen && (
                        <tr id={`ah-detail-${r.id}`} className="ah-detail-row">
                          <td colSpan={8}>
                            <div className="ah-detail">
                              <div className="ah-detail-grid">
                                <div>
                                  <div className="ah-k">Decision</div>
                                  <div className="ah-v">
                                    <span className="ah-badge bad">Rejected</span>
                                  </div>
                                </div>

                                <div>
                                  <div className="ah-k">Rejected by</div>
                                  <div className="ah-v">{r.rejectedBy}</div>
                                </div>

                                <div>
                                  <div className="ah-k">Rejected at</div>
                                  <div className="ah-v">
                                    {format(new Date(r.rejectedAt), "yyyy-MM-dd HH:mm:ss")}
                                  </div>
                                </div>

                                <div className="ah-span-2">
                                  <div className="ah-k">Reason</div>
                                  <div className="ah-v">{r.reason}</div>
                                </div>
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
     
      </div>
    </div>
  );
};

export default RejectedTranscriptRequests;
