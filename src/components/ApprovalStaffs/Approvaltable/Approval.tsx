import React from "react";
import "./Approval.css";

export type ApprovalRow = {
  id: string;
  name: string;
  batch: string;          
  department: string;     
  avatarUrl?: string;
};

type Props = {
  rows: ApprovalRow[];
  loading?: boolean;
  onApprove: (id: string) => void;
  emptyMessage?: string;
};

const ApprovalRequestsTable: React.FC<Props> = ({
  rows,
  loading = false,
  onApprove,
  emptyMessage = "No pending approval requests.",
}) => {
  return (
    <div className="ar-table-wrap">
      <div className="ar-table-card">
        <div className="ar-table-head">Approval Requests</div>

        <div className="ar-scroll-x">
          <table className="ar-table" role="table">
            <thead>
              <tr>
                <th scope="col">Full Name</th>
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

              {!loading && rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="ar-user">
                      <span className="ar-name">{r.name}</span>
                    </div>
                  </td>
                  <td><span className="ar-badge">{r.batch}</span></td>
                  <td><span className="ar-dept">{r.department}</span></td>
                  <td className="ar-actions">
                    <button
                      type="button"
                      className="ar-btn-approve"
                      onClick={() => onApprove(r.id)}
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
    </div>
  );
};

export default ApprovalRequestsTable;
