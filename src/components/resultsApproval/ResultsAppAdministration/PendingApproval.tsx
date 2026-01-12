import React from "react";
import { FaRegFilePdf } from "react-icons/fa6";
import "./PendingApproval.css";

export type ApprovalItem = {
  id: string;
  title: string;
  subtitle?: string;
  statusText?: string;
  statusClass?: "pending" | "approved" | "neutral";
  meta?: string;
  actionLabel?: string;
  disabled?: boolean;
};

type PendingApprovalsProps = {
  items: ApprovalItem[];
  onApprove: (id: string) => void;
};

const PendingApprovals: React.FC<PendingApprovalsProps> = ({
  items,
  onApprove,
}) => {
  if (!items.length) {
    return (
      <section className="pa-scope pa-wrap">
        <div className="pa-empty">No batches available for review.</div>
      </section>
    );
  }

  return (
    <section className="pa-scope pa-wrap">
      <div className="pa-list">
        {items.map((item) => (
          <div
            key={item.id}
            className="pa-card"
            role="group"
            aria-label={item.title}
          >
            <div className="pa-card-left">
              <FaRegFilePdf className="pa-icon" aria-hidden="true" />
              <div className="pa-meta">
                <div className="pa-title" title={item.title}>
                  {item.title}
                </div>
                {item.subtitle && (
                  <div className="pa-subtitle" title={item.subtitle}>
                    {item.subtitle}
                  </div>
                )}
                <div className="pa-info-row">
                  {item.meta && <span className="pa-meta-chip">{item.meta}</span>}
                  {item.statusText && (
                    <span
                      className={`pa-status ${
                        item.statusClass ? `pa-status--${item.statusClass}` : ""
                      }`}
                    >
                      {item.statusText}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              className="pa-button"
              onClick={() => onApprove(item.id)}
              aria-label={`View details for ${item.title}`}
              disabled={item.disabled}
            >
              {item.actionLabel ?? "View & Approve"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PendingApprovals;
