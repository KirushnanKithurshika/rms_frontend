import React from "react";
import { FaRegFilePdf } from "react-icons/fa6";
import "./PendingApproval.css";

export type ApprovalItem = { id: string; title: string };

type ApprovalCardProps = {
  item: ApprovalItem;
  onApprove: (id: string) => void;
};

const ApprovalCard: React.FC<ApprovalCardProps> = ({ item, onApprove }) => (
  <div className="pa-card" role="group" aria-label={item.title}>
    <div className="pa-card-left">
      <FaRegFilePdf className="pa-icon" aria-hidden="true" focusable="false" />
      <div className="pa-title" title={item.title}>{item.title}</div>
    </div>
    <button
      className="pa-button"
      onClick={() => onApprove(item.id)}
      aria-label={`View and approve ${item.title}`}
    >
      View &amp; Approve
    </button>
  </div>
);

type PendingApprovalsProps = {
  items: ApprovalItem[];
  onApprove: (id: string) => void;
};

const PendingApprovals: React.FC<PendingApprovalsProps> = ({ items, onApprove }) => (
  <section className="pa-scope pa-wrap">
    <h4 className="pa-heading">pending Results Approval</h4>
    <div className="pa-list">
      {items.map((it) => (
        <ApprovalCard key={it.id} item={it} onApprove={onApprove} />
      ))}
    </div>
  </section>
);

export default PendingApprovals;
