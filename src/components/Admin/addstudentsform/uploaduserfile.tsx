import React, { useState } from "react";
import { FaUpload, FaCheckCircle } from "react-icons/fa";
import "./uploaduserfile.css"; // Separate CSS file

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setIsUploaded(false);
      setUploadProgress(0);

      
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploaded(true);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  return (
    <div className="add-user-file-section">
      <label className="add-user-label">Select File(Excel File)</label>
      <div className="add-user-file-container">
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="add-user-file-input"
          id="excelFileInput"
        />
        <label htmlFor="excelFileInput" className="add-user-file-btn">
          <span>Add file</span>
          <FaUpload className="add-user-upload-icon" />
        </label>
      </div>

     
      {file && (
        <div className="file-progress-container">
          <span className="file-name">{file.name}</span>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>

          <span className="progress-text">{uploadProgress}%</span>
          {isUploaded && <FaCheckCircle className="success-icon" />}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
