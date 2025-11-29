import React, { useEffect, useState } from "react";
import "./adduserform.css";
import { FaArrowLeft, FaChevronDown, FaUpload, FaCheckCircle } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8087/api";

interface AddUserFormProps {
  onClose: () => void;
  mode?: 'create' | 'edit';
  initial?: {
    id?: number;
    username?: string;
    fullName?: string;
    email?: string;
    roleName?: string;
    roleId?: number;
  } | null;
  onCreate?: (user: {
    username: string;
    password: string;
    roleId: number;
    fullName?: string;
    email?: string;
  }) => void;
  onUpdate?: (user: {
    id?: number;
    username?: string;
    roleId?: number | null;
    roleLabel?: string;
    fullName?: string;
    email?: string;
  }) => void;
}

interface Role {
  id: number;
  label: string;
}

const AddUserForm: React.FC<AddUserFormProps> = ({ onClose, onCreate, onUpdate, mode = 'create', initial }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [rolesOpen, setRolesOpen] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const selectedRoleLabel =
    roles.find((r) => r.id === selectedRoleId)?.label ?? "Select a role";

  // Fetch roles for dropdown
  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const loadRoles = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/v1/roles/GetAll`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        const json = await res.json().catch(() => ({}));
        const payload: any = json?.data ?? json;
        const raw = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.content)
          ? payload.content
          : [];
        const mapped: Role[] = raw
          .map((r: any) => {
            const label = String(
              r?.name ?? r?.roleName ?? r?.label ?? r?.code ?? ""
            ).trim();
            const id =
              typeof r?.id === "number"
                ? r.id
                : Number(r?.id ?? r?.roleId ?? r?.code ?? 0) || undefined;
            if (!id || !label) return null;
            return { id, label };
          })
          .filter((r): r is Role => Boolean(r?.id && r?.label))
          .filter((r) => r.label.toUpperCase() !== "STUDENT");

        setRoles(mapped);
        setSelectedRoleId((prev) => {
          if (prev != null && mapped.some((r) => r.id === prev)) return prev;
          return mapped[0]?.id ?? null;
        });
      } catch {
        setRoles([]);
        setSelectedRoleId(null);
      }
    };

    loadRoles();
  }, []);

  // Prefill when editing
  useEffect(() => {
    if (!initial) return;
    if (initial.username) setUsername(initial.username);
    if (initial.fullName) setFullName(initial.fullName);
    if (initial.email) setEmail(initial.email);
    if (initial.roleId) setSelectedRoleId(initial.roleId);
    else if (initial.roleName) {
      const match = roles.find(r => r.label.toUpperCase() === String(initial.roleName).toUpperCase());
      if (match) setSelectedRoleId(match.id);
    }
  }, [initial, roles]);

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
    if (!username || (!password && mode === 'create') || !selectedRoleId) {
      alert("Please fill required fields");
      return;
    }

    setSubmitting(true);

    // simulate success
    setTimeout(() => {
      if (mode === 'edit') {
        onUpdate?.({ id: initial?.id, username, roleId: selectedRoleId, roleLabel: selectedRoleLabel, fullName, email });
      } else {
        onCreate?.({ username, password, roleId: selectedRoleId, fullName, email });
      }

      setUsername("");
      setPassword("");
      setFullName("");
      setEmail("");
      setFile(null);
      setUploadProgress(0);
      setIsUploaded(false);

      setSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="dashboard-cards">
      <div className="add-user-form-container">
        <div className="add-user-form-header">
          <button type="button" className="add-user-back-btn" onClick={onClose}>
            <FaArrowLeft className="add-user-back-icon" />
          </button>
          <span className="add-user-title">{mode === 'edit' ? 'Edit User' : 'Add Staff User'}</span>
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
          <span className="add-user-divider-title">{mode === 'edit' ? 'Edit manually' : 'Add manually'}</span>
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
            <label className="add-user-label">Password{mode === 'edit' ? ' (leave blank to keep)' : ''}</label>
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
            {submitting ? (mode === 'edit' ? 'Saving...' : 'Creating...') : (mode === 'edit' ? 'Save changes' : 'Create')}
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
