import React, { useEffect, useState } from "react";
import "./adduserform.css";
import { FaArrowLeft, FaChevronDown, FaUpload, FaCheckCircle } from "react-icons/fa";

import { api } from "../../../context/authContext"; 

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

type CreateUserPayload = {
  username: string;
  password: string;
  roleIds: number[];
};


const FALLBACK_ROLES: Role[] = [
  { id: 1,  label: "ADMIN" },
  { id: 2,  label: "LECTURER" },
  { id: 3,  label: "HOD" },               
  { id: 4,  label: "DEAN" },
  { id: 5,  label: "EXAM_CONTROLLER" },
  { id: 6,  label: "EXAM_OFFICER" },
  { id: 7,  label: "QA_OFFICER" },         
  { id: 8,  label: "AR_OFFICER" },         
  { id: 9,  label: "REGISTRAR" },
  { id: 10, label: "LIBRARIAN" },
  { id: 11, label: "SYSTEM_ADMIN" },
  { id: 12, label: "PROGRAM_COORDINATOR" },
];

const AddUserForm: React.FC<AddUserFormProps> = ({ onClose, onCreate }) => {
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");


  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(true);


  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false);

  const [submitting, setSubmitting] = useState(false);

 
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
      
        const res = await api.get<Role[]>("/roles");
        let list = (res.data || []).filter(r => r.label.toUpperCase() !== "STUDENT");
        if (!mounted) return;
        if (list.length === 0) {
          setRoles(FALLBACK_ROLES);
          setSelectedRoleId(FALLBACK_ROLES[0].id);
        } else {
          setRoles(list);
          setSelectedRoleId(list[0].id);
        }
      } catch {
        if (!mounted) return;
        setRoles(FALLBACK_ROLES);
        setSelectedRoleId(FALLBACK_ROLES[0].id);
      } finally {
        if (mounted) setRolesLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const selectedRoleLabel =
    roles.find(r => r.id === selectedRoleId)?.label ?? "Select a role";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setIsUploaded(false);
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
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

  const handleSubmit = async () => {
    if (!username || !password) {
      alert("Please enter username and password.");
      return;
    }
    if (!selectedRoleId) {
      alert("Please select a role.");
      return;
    }

    const payload: CreateUserPayload = {
      username,
      password,
      roleIds: [selectedRoleId],
    };

    try {
      setSubmitting(true);

    
   
      await api.post("api/auth/register", payload);

      onCreate?.({ username, password, roleId: selectedRoleId, fullName, email });

    
      setUsername("");
      setPassword("");
      setFullName("");
      setEmail("");
      setFile(null);
      setUploadProgress(0);
      setIsUploaded(false);

      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
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
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
              </div>
              <span className="progress-text">{uploadProgress}%</span>
              {isUploaded && <FaCheckCircle className="success-icon" />}
            </div>
          )}
        </div>

    
        <div className="add-user-divider" onClick={() => {}}>
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

       
          <div className="add-user-form-group role-selector">
            <label className="add-user-label">Role</label>
            <div
              className={`custom-role-dropdown ${rolesLoading ? "disabled" : ""}`}
              onClick={() => !rolesLoading && setRolesOpen((prev) => !prev)}
            >
              <span className="selected-role">
                {rolesLoading ? "Loading roles..." : selectedRoleLabel}
              </span>
              <FaChevronDown className={`dropdown-icon ${rolesOpen ? "open" : ""}`} />
            </div>

            {rolesOpen && !rolesLoading && (
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
            <label className="add-user-label">Email (optional now)</label>
            <input
              type="email"
              className="add-user-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="add-user-form-group add-user-full-width">
            <label className="add-user-label">Full Name (optional now)</label>
            <input
              type="text"
              className="add-user-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>

        <div className="add-user-form-actions">
          <button
            type="button"
            className="add-user-create-btn"
            onClick={handleSubmit}
            disabled={submitting || rolesLoading || !selectedRoleId}
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
