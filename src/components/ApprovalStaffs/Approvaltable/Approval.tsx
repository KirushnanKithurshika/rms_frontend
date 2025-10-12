import React, { useState } from "react";
import "./Approval.css";

export type ApprovalRow = {
  id: string;
  name: string;
  sid:string;
  batch: string;
  department: string;
  avatarUrl?: string;
};

type Props = {
  rows: ApprovalRow[];
  loading?: boolean;
  onApprove: (id: string) => void;
  onReject?: (id: string, reason: string) => void; // ← NEW (optional)
  emptyMessage?: string;
};

const ApprovalRequestsTable: React.FC<Props> = ({
  rows,
  loading = false,
  onApprove,
  onReject,
  emptyMessage = "No pending approval requests.",
}) => {

  const [openId, setOpenId] = useState<string | null>(null);
  const [decision, setDecision] = useState<"approve" | "reject">("approve");
  const [reason, setReason] = useState("");

  const openModal = (id: string) => {
    setOpenId(id);
    setDecision("approve");
    setReason("");
  };

  const closeModal = () => {
    setOpenId(null);
    setReason("");
  };

  const submitDecision = () => {
    if (!openId) return;

    if (decision === "approve") {
      onApprove(openId);
      closeModal();
      return;
    }

  
    if (decision === "reject") {
      const trimmed = reason.trim();
      if (!trimmed) {

        alert("Please provide a reason for rejection.");
        return;
      }
      if (onReject) onReject(openId, trimmed);
      closeModal();
    }
  };

  const activeRow = rows.find((r) => r.id === openId) || null;

  return (
    <div className="ar-table-wrap">
      <div className="ar-table-card">
        <div className="ar-table-head">Approval Requests</div>

        <div className="ar-scroll-x">
          <table className="ar-table" role="table">
            <thead>
              <tr>
                <th scope="col">Full Name</th>
                <th scope="col">ID</th>
                <th scope="col">Batch</th>
                <th scope="col">Department</th>
                <th scope="col" className="ar-actions-col">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="ar-loading">Loading…</td>
                </tr>
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="ar-empty">{emptyMessage}</td>
                </tr>
              )}

              {!loading &&
                rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="ar-user">
                        <span className="ar-name">{r.name}</span>
                      </div>
                    </td>
                    <td><span className="ar-badge">{r.sid}</span></td>
                    <td><span className="ar-badge">{r.batch}</span></td>
                    <td><span className="ar-dept">{r.department}</span></td>
                    <td className="ar-actions">
                      <button
                        type="button"
                        className="ar-btn-approve"
                        onClick={() => openModal(r.id)}
                      >
                        Give Approval
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      
      {openId && (
        <div className="ar-modal-backdrop" role="dialog" aria-modal="true">
          <div className="ar-modal">
            <div className="ar-modal-header">
              <h3>Approval Section</h3>
              <button
                className="ar-modal-close"
                aria-label="Close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <div className="ar-modal-body">
              {activeRow && (
                <div className="ar-modal-summary">
                  <div><strong>Name:</strong> {activeRow.name}</div>
                  <div><strong>Batch:</strong> {activeRow.batch}</div>
                  <div><strong>Department:</strong> {activeRow.department}</div>
                </div>
              )}

              <div className="ar-decision-group">
                <label className="ar-radio">
                  <input
                    type="radio"
                    name="decision"
                    value="approve"
                    checked={decision === "approve"}
                    onChange={() => setDecision("approve")}
                  />
                  <span>Approve</span>
                </label>

                <label className="ar-radio">
                  <input
                    type="radio"
                    name="decision"
                    value="reject"
                    checked={decision === "reject"}
                    onChange={() => setDecision("reject")}
                  />
                  <span>Reject</span>
                </label>
              </div>

              {decision === "reject" && (
                <div className="ar-reason">
                  <label htmlFor="reject-reason">
                    Reason for rejection <span className="ar-required">*</span>
                  </label>
                  <textarea
                    id="reject-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide a brief reason…"
                    rows={4}
                  />
                </div>
              )}
            </div>

            <div className="ar-modal-footer">
              <button className="ar-btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button className="ar-btn-primary" onClick={submitDecision}>
                {decision === "approve" ? "Approve" : "Submit Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalRequestsTable;
