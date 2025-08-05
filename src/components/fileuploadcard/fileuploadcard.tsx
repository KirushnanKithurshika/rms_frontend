import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaFileCsv } from 'react-icons/fa';
import './fileuploadcard.css';


interface FileUploadProps {
  fileName: string;
}

const FileUploadCard: React.FC<FileUploadProps> = ({ fileName }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          return 100;
        }
        return prev + 5;
      });
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="upload-section-down">
      <FaFileCsv className="file-icon" size={60} />
      <div className="upload-details">
        <div className="file-name">{fileName}</div>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="progress-footer">
          {!isComplete ? (
            <span className="uploading">Uploading.........</span>
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
