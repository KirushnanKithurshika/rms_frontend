import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaFileCsv } from "react-icons/fa";
import "./fileuploadcard.css";

interface FileUploadProps {
  fileName: string;
  /** optional: ms between increments */
  tickMs?: number;
  /** optional: percent to add each tick */
  stepPct?: number;
  /** optional: callback when progress hits 100% */
  onComplete?: () => void;
}

const FileUploadCard: React.FC<FileUploadProps> = ({
  fileName,
  tickMs = 300,
  stepPct = 5,
  onComplete,
}) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(100, prev + stepPct);
        if (next === 100) {
          window.clearInterval(id);
          setIsComplete(true);
          onComplete?.();
        }
        return next;
      });
    }, tickMs);

    return () => window.clearInterval(id);
  }, [tickMs, stepPct, onComplete]);

  return (
    <div className="upload-section-down">
      <FaFileCsv className="file-icon" size={60} />

      <div className="upload-details">
        <div className="file-name" title={fileName}>
          {fileName}
        </div>

        <div
          className="progress-bar-container"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label="File upload progress"
        >
            <div
            className="upload-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="progress-footer">
          {!isComplete ? (
            <span className="uploading">Uploading…</span>
          ) : (
            <span className="upload-complete">Uploaded</span>
          )}
          <span className="progress-text">{progress}%</span>
          {isComplete && <FaCheckCircle className="check-icon" />}
        </div>
      </div>
    </div>
  );
};

export default FileUploadCard;
