import React from "react";
import "./PendingApproval.css";

export type ApprovalItem = {
  id: string;
  title: string;
};

type ApprovalCardProps = {
  item: ApprovalItem;
  onApprove: (id: string) => void;
};

const PdfIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M6 2h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M14 2v4a2 2 0 0 0 2 2h4" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="9" cy="17" r="1.1" />
    <circle cx="12" cy="17" r="1.1" />
    <circle cx="15" cy="17" r="1.1" />
  </svg>
);

const ApprovalCard: React.FC<ApprovalCardProps> = ({ item, onApprove }) => (
  <div className="pa-card" role="group" aria-label={item.title}>
    <div className="pa-card-left">
      <PdfIcon className="pa-icon" />
      <div className="pa-title" title={item.title}>{item.title}</div>
    </div>
    <button className="pa-button" onClick={() => onApprove(item.id)} aria-label={`View and approve ${item.title}`}>
      View &amp; Approve
    </button>
  </div>
);

type PendingApprovalsProps = {
  items: ApprovalItem[];
  onApprove: (id: string) => void;
};

const PendingApprovals: React.FC<PendingApprovalsProps> = ({ items, onApprove }) => (
  <section className="pa-wrap">
    <h4 className="pa-heading">pending Results Approval</h4>
    <div className="pa-list">
      {items.map((it) => (
        <ApprovalCard key={it.id} item={it} onApprove={onApprove} />
      ))}
    </div>
  </section>
);

export default PendingApprovals;
