import React from "react";
import { FaRegFilePdf } from "react-icons/fa6";
import "./transcriptApprovalCard.css";

type Props = {
  studentName: string;   // e.g. "R.P Silva"
  batch: string;         // e.g. "22nd batch"
  subtitle?: string;     // e.g. "Transcript"
  onClick: () => void;
};


const TranscriptApprovalCard: React.FC<Props> = ({
  studentName,
  batch,
  subtitle = "Transcript",
  onClick,
}) => {
  return (
    <div className="taAR-card" role="group" aria-label={`Transcript: ${studentName}`}>
      
      <div className="taAR-card-left">
        <FaRegFilePdf className="taAR-icon" aria-hidden="true" />
        <div className="taAR-title" title={`${studentName} ${batch} ${subtitle}`}>
          <span className="taAR-name">{studentName}</span>
          <span className="taAR-sep">&nbsp;</span>
          <span className="taAR-batch">{batch}</span>
          <span className="taAR-sep">&nbsp;</span>
          <span className="taAR-sub">{subtitle}</span>
        </div>
      </div>

      <button
        className="taAR-button"
        onClick={onClick}
        aria-label={`View and approve transcript for ${studentName}`}
      >
        View &amp; Approve
      </button>
    </div>
  );
};

export default TranscriptApprovalCard;
