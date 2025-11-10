import React, { useState } from "react";
import { FaFileExcel, FaFile, FaFolder, FaDownload } from "react-icons/fa";
import "./ResultUploadInterface.css";

interface ResultUploadInterfaceProps {
  course: { code: string; title: string };
  allocationId?: number | null;
  assessment?: {
    id?: number;
    title: string;
    group: "CA" | "END_EXAM";
    maxMarks?: number;
    weight?: number;
    date?: string;
  } | null;
  onBack: () => void;
  onFileUpload: (name: string) => void;
}

const ResultUploadInterface: React.FC<ResultUploadInterfaceProps> = ({
  course,
  allocationId,
  assessment,
  onBack,
  onFileUpload,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"ca" | "final">("ca"); // Track active tab

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileUpload(file.name);
    }
  };

  return (
    <div className="result-upload-container">
      <div className="header-section">
        <h3 className="dragdrophead">
          Add Results: {course.code} - {course.title}
        </h3>
        {assessment && (
          <p style={{ margin: "6px 0", color: "#475569", fontSize: 13 }}>
            Assessment: <strong>{assessment.title}</strong> ({assessment.group}){" "}
            {assessment.maxMarks ? `• Max ${assessment.maxMarks}` : ""}{" "}
            {assessment.weight ? `• Weight ${assessment.weight}%` : ""}
          </p>
        )}
        {allocationId ? (
          <p style={{ margin: 0, color: "#6b7280", fontSize: 12 }}>
            Allocation ID: {allocationId}
          </p>
        ) : null}
        <hr />
      </div>

      {!assessment && (
        <div className="upload-tabs">
          <button
            className={`tab-btnCA ${activeTab === "ca" ? "active" : ""}`}
            onClick={() => setActiveTab("ca")}
          >
            Continuous Assessment
          </button>
          <button
            className={`tab-btnCA ${activeTab === "final" ? "active" : ""}`}
            onClick={() => setActiveTab("final")}
          >
            Final Exam
          </button>
        </div>
      )}

      <div className="Uploadarea">
        <div className="file-info-header">
          Maximum file size: 20 MB, maximum number of files: 1
        </div>

        <div className="upload-box">
          <div className="upload-box-icons">
            <button className="icon-btn">
              <FaFile />
            </button>
            <button className="icon-btn">
              <FaFolder />
            </button>
            <button className="icon-btn">
              <FaDownload />
            </button>
          </div>

          {!selectedFile ? (
            <>
              <FaFileExcel className="custom-icon-uploadinterface" />
              <p className="choosefileP">
                Choose a file or Drag and Drop it Here
              </p>
              <div className="upload-text-group">
                <small>CSV file format</small>
                <label htmlFor="fileUpload" className="upload-btn">
                  Browse File
                </label>
              </div>

              <input
                type="file"
                id="fileUpload"
                className="file-input"
                onChange={handleFileSelect}
                accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                hidden
              />
            </>
          ) : (
            <div className="file-preview">
              <FaFileExcel className="custom-icon-uploadinterface" />
              <span className="file-name-uploadsection">
                {selectedFile.name}
              </span>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button className="save-btn" onClick={onBack}>
            Save Changes
          </button>
          <button className="cancel-btn" onClick={onBack}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultUploadInterface;
