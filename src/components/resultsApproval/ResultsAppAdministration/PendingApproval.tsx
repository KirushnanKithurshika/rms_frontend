import React from "react";
import { FaRegFilePdf } from "react-icons/fa6";
import "./PendingApproval.css";

export type ApprovalItem = { id: string; title: string };

type PendingApprovalsProps = {
  onApprove: (id: string) => void;
};

const PendingApprovals: React.FC<PendingApprovalsProps> = ({ onApprove }) => {
  // Define approvals list here (no need to import or pass from parent)
  const approvals: ApprovalItem[] = [
    { id: "22-5", title: "22nd Batch - 5th Semester Results" },
    { id: "22-6", title: "22nd Batch - 6th Semester Results" },
  ];

  return (
    <section className="pa-scope pa-wrap">
      <div className="pa-list">
        {approvals.map((item) => (
          <div key={item.id} className="pa-card" role="group" aria-label={item.title}>
            <div className="pa-card-left">
              <FaRegFilePdf className="pa-icon" aria-hidden="true" focusable="false" />
              <div className="pa-title" title={item.title}>
                {item.title}
              </div>
            </div>

            <button
              className="pa-button"
              onClick={() => onApprove(item.id)}
              aria-label={`View and approve ${item.title}`}
            >
              View &amp; Approve
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PendingApprovals;
