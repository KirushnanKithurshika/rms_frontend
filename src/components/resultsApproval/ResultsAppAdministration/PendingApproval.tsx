import React from "react";
import { FaRegFilePdf } from "react-icons/fa6";
import "./PendingApproval.css";

export type ApprovalItem = { id: string; title: string };

type PendingApprovalsProps = {
  items: ApprovalItem[];             // ✅ add items prop
  onApprove: (id: string) => void;
};

const PendingApprovals: React.FC<PendingApprovalsProps> = ({ items, onApprove }) => {
  return (
    <section className="pa-scope pa-wrap">
      <div className="pa-list">
        {items.map((item) => (
          <div key={item.id} className="pa-card" role="group" aria-label={item.title}>
            <div className="pa-card-left">
              <FaRegFilePdf className="pa-icon" aria-hidden="true" />
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
