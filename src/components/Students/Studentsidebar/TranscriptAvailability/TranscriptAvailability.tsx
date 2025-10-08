import React from "react";
import "./TranscriptAvailability.css";

export type TranscriptStatus = "available" | "processing" | "notApplied";

type Props = {
  status: TranscriptStatus;
  /** EITHER give imageSrc (preferred for static image) OR qrData for generated QR */
  imageSrc?: string;       // <— NEW: plain image to show
  qrData?: string;         // optional fallback: build a QR from this data
  onApply?: () => void;
  onOpen?: () => void;
  onDownload?: () => void;
  caption?: string;
};

const TranscriptAvailability: React.FC<Props> = ({
  status,
  imageSrc,
  qrData,
  onApply,
  onOpen,
  onDownload,
  caption,
}) => {
  const displaySrc =
    imageSrc ||
    (qrData
      ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
          qrData
        )}`
      : "");

  return (
    <div className={`ta-card ${status}`}>
      {status === "available" && (
        <>
          <p className="ta-line">Your Transcript is available now</p>
          <p className="ta-line-sub">Please scan the QR Code to get your Transcript</p>

          {displaySrc ? (
            <img className="ta-qr" src={displaySrc} alt="Transcript code" />
          ) : (
            <div className="ta-qr-missing">Image not available</div>
          )}

          <div className="ta-actions">
            {onOpen && <button className="ta-btn primary" onClick={onOpen}>Open</button>}
            {onDownload && <button className="ta-btn" onClick={onDownload}>Download</button>}
          </div>
        </>
      )}

      {status === "processing" && (
        <>
          <p className="ta-line strong">Transcript is in process</p>
          <p className="ta-line">We’ll notify you once it’s ready.</p>
          <div className="ta-spinner" aria-label="Loading" />
        </>
      )}

      {status === "notApplied" && (
        <>
          <p className="ta-line strong">No transcript request found</p>
          <p className="ta-line">Please apply online to get your transcript.</p>
          {onApply && <button className="ta-btn primary" onClick={onApply}>Apply Now</button>}
        </>
      )}

      {caption && <div className="ta-caption">{caption}</div>}
    </div>
  );
};

export default TranscriptAvailability;
