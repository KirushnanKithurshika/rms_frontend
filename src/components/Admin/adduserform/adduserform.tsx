import React, { useEffect, useState } from "react";
import "./adduserform.css";
import { FaArrowLeft, FaChevronDown, FaUpload, FaCheckCircle } from "react-icons/fa";

interface AddUserFormProps {
  onClose: () => void;
  onCreate?: (user: {
    username: string;
    password: string;
    roleId: number;
    fullName?: string;
    email?: string;
  }) => void;
}

interface Role {
  id: number;
  label: string;
}

const FALLBACK_ROLES: Role[] = [
  { id: 1, label: "ADMIN" },
  { id: 2, label: "LECTURER" },
  { id: 3, label: "HOD" },
  { id: 4, label: "DEAN" },
  { id: 5, label: "EXAM_CONTROLLER" },
  { id: 6, label: "EXAM_OFFICER" },
  { id: 7, label: "QA_OFFICER" },
  { id: 8, label: "AR_OFFICER" },
  { id: 9, label: "REGISTRAR" },
  { id: 10, label: "LIBRARIAN" },
  { id: 11, label: "SYSTEM_ADMIN" },
  { id: 12, label: "PROGRAM_COORDINATOR" },
];

const AddUserForm: React.FC<AddUserFormProps> = ({ onClose, onCreate }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [roles, setRoles] = useState<Role[]>(FALLBACK_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(FALLBACK_ROLES[0].id);
  const [rolesOpen, setRolesOpen] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const selectedRoleLabel =
    roles.find((r) => r.id === selectedRoleId)?.label ?? "Select a role";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
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

  const handleSubmit = () => {
    if (!username || !password || !selectedRoleId) {
      alert("Please fill required fields");
      return;
    }

    setSubmitting(true);

    // just simulate success
    setTimeout(() => {
      onCreate?.({ username, password, roleId: selectedRoleId, fullName, email });

      setUsername("");
      setPassword("");
      setFullName("");
      setEmail("");
      setFile(null);
      setUploadProgress(0);
      setIsUploaded(false);

      setSubmitting(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="dashboard-cards">
      <div className="add-user-form-container">
        <div className="add-user-form-header">
          <button type="button" className="add-user-back-btn" onClick={onClose}>
            <FaArrowLeft className="add-user-back-icon" />
          </button>
          <span className="add-user-title">Add Staff User</span>
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
                />
              </div>
              <span className="progress-text">{uploadProgress}%</span>
              {isUploaded && <FaCheckCircle className="success-icon" />}
            </div>
          )}
        </div>

        {/* Manual Form */}
        <div className="add-user-divider">
          <span className="add-user-divider-title">Add manually</span>
          <FaChevronDown className="add-user-divider-arrow open" />
        </div>

        <div className="add-user-form-grid">
          <div className="add-user-form-group">
            <label className="add-user-label">User Name</label>
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

          {/* Role Dropdown */}
          <div className="add-user-form-group role-selector">
            <label className="add-user-label">Role</label>
            <div
              className="custom-role-dropdown"
              onClick={() => setRolesOpen((prev) => !prev)}
            >
              <span className="selected-role">{selectedRoleLabel}</span>
              <FaChevronDown className={`dropdown-icon ${rolesOpen ? "open" : ""}`} />
            </div>

            {rolesOpen && (
              <div className="custom-role-options">
                {roles.map((r) => (
                  <div
                    key={r.id}
                    className={`role-option-card ${selectedRoleId === r.id ? "active" : ""}`}
                    onClick={() => {
                      setSelectedRoleId(r.id);
                      setRolesOpen(false);
                    }}
                  >
                    <span>{r.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="add-user-form-group">
            <label className="add-user-label">Email (optional)</label>
            <input
              type="email"
              className="add-user-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="add-user-form-group add-user-full-width">
            <label className="add-user-label">Full Name (optional)</label>
            <input
              type="text"
              className="add-user-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="add-user-form-actions">
          <button
            type="button"
            className="add-user-create-btn"
            onClick={handleSubmit}
            disabled={submitting || !selectedRoleId}
          >
            {submitting ? "Creating..." : "Create"}
          </button>
          <button
            type="button"
            className="add-user-cancel-btn"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserForm;
