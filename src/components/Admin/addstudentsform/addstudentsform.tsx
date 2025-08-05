import React, { useState } from "react";
import "./adduserform.css";
import { FaArrowLeft, FaChevronDown, FaUpload, FaCheckCircle } from "react-icons/fa";

interface AddStudentFormProps {
  onClose: () => void;
  onCreate: (student: {
    username: string;
    password: string;
    fullName: string;
    email: string;
  }) => void;
}

const AddStudentForm: React.FC<AddStudentFormProps> = ({ onClose, onCreate }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [showManualForm, setShowManualForm] = useState(true);

  // File upload states
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setIsUploaded(false);
      setUploadProgress(0);

      // Simulate upload progress
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

  const handleSubmit = () => {
    if (!username || !password || !fullName || !email) {
      alert("Please fill all fields!");
      return;
    }

    onCreate({ username, password, fullName, email });

    // Reset form
    setUsername("");
    setPassword("");
    setFullName("");
    setEmail("");
    setFile(null);
    setUploadProgress(0);
    setIsUploaded(false);
    onClose();
  };

  return (
    <div className="dashboard-cards">
      <div className="add-user-form-container">
        {/* Header */}
        <div className="add-user-form-header">
          <button type="button" className="add-user-back-btn" onClick={onClose}>
            <FaArrowLeft className="add-user-back-icon" />
          </button>
          <span className="add-user-title">Add Student</span>
        </div>

        {/* File Upload */}
        <div className="add-user-file-section">
          <label className="add-user-label">Select File (Excel File)</label>
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

        {/* Divider */}
        <div
          className="add-user-divider"
          onClick={() => setShowManualForm((prev) => !prev)}
        >
          <span className="add-user-divider-title">Add manually</span>
          <FaChevronDown
            className={`add-user-divider-arrow ${showManualForm ? "open" : ""}`}
          />
        </div>

        {/* Manual Form */}
        {showManualForm && (
          <div className="add-user-form-grid">
            <div className="add-user-form-group">
              <label className="add-user-label">Username</label>
              <input
                type="text"
                className="add-user-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="add-user-form-group">
              <label className="add-user-label">Password</label>
              <input
                type="password"
                className="add-user-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="add-user-form-group">
              <label className="add-user-label">Email</label>
              <input
                type="email"
                className="add-user-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="add-user-form-group add-user-full-width">
              <label className="add-user-label">Full Name</label>
              <input
                type="text"
                className="add-user-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="add-user-form-actions">
          <button
            type="button"
            className="add-user-create-btn"
            onClick={handleSubmit}
          >
            Create
          </button>
          <button
            type="button"
            className="add-user-cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStudentForm;
