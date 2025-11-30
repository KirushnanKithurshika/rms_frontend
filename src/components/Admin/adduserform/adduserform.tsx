import React, { useEffect, useMemo, useState } from "react";
import "./adduserform.css";
import { FaArrowLeft, FaChevronDown, FaUpload, FaCheckCircle } from "react-icons/fa";
import { showError, showSuccess } from "../../../utils/toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8087/api";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9]{10,12}$/;
const DESIGNATIONS = ["PROFESSOR", "SENIOR_LECTURER", "LECTURER", "ASSISTANT_LECTURER"];

interface LecturerPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: string;
  departmentId: number;
  roleIds: number[];
}

interface Department {
  id: number;
  name: string;
}

interface AddUserFormProps {
  onClose: () => void;
  mode?: "create" | "edit";
  initial?:
    | {
        id?: number;
        username?: string;
        fullName?: string;
        email?: string;
        roleName?: string;
        roleId?: number;
      }
    | null;
  onCreate?: (user: {
    username?: string;
    password?: string;
    roleId?: number;
    fullName?: string;
    email?: string;
    kind?: "user" | "lecturer";
    lecturerPayload?: LecturerPayload;
  }) => void;
  onUpdate?: (user: {
    id?: number;
    username?: string;
    roleId?: number | null;
    roleLabel?: string;
    fullName?: string;
    email?: string;
    kind?: "user" | "lecturer";
    lecturerPayload?: LecturerPayload;
  }) => void;
}

interface Role {
  id: number;
  label: string;
}

const defaultUserForm = {
  username: "",
  password: "",
  fullName: "",
  email: "",
};

const defaultLecturerForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  designation: "",
  departmentId: "",
};

const AddUserForm: React.FC<AddUserFormProps> = ({
  onClose,
  onCreate,
  onUpdate,
  mode = "create",
  initial,
}) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [userForm, setUserForm] = useState(defaultUserForm);
  const [lecturerForm, setLecturerForm] = useState(defaultLecturerForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedRoleLabel =
    roles.find((r) => r.id === selectedRoleId)?.label ?? "Select a role";

  const isLecturerRole = useMemo(() => {
    const label = selectedRoleLabel.toLowerCase();
    return label.includes("lecturer");
  }, [selectedRoleLabel]);

  // Fetch roles
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

  // Fetch departments
  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const loadDepartments = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/v1/departments/GetAll`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        const json = await res.json().catch(() => ({}));
        const payload: any = json?.data ?? json;
        const raw = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.content)
          ? payload.content
          : [];
        const mapped: Department[] = raw
          .map((d: any) => {
            const id =
              typeof d?.id === "number"
                ? d.id
                : Number(d?.id ?? d?.departmentId ?? d?.code ?? 0) || undefined;
            const name = String(d?.name ?? d?.departmentName ?? d?.code ?? "").trim();
            if (!id || !name) return null;
            return { id, name };
          })
          .filter((d): d is Department => Boolean(d?.id && d?.name));

        setDepartments(mapped);
      } catch {
        setDepartments([]);
      }
    };

    loadDepartments();
  }, []);

  // Prefill when editing
  useEffect(() => {
    if (!initial) {
      setUserForm(defaultUserForm);
      setLecturerForm(defaultLecturerForm);
      return;
    }

    setUserForm((prev) => ({
      ...prev,
      username: initial.username ?? "",
      fullName: initial.fullName ?? "",
      email: initial.email ?? "",
      password: "",
    }));

    if (initial.roleId) setSelectedRoleId(initial.roleId);
    else if (initial.roleName) {
      const match = roles.find(
        (r) =>
          r.label.toUpperCase() === String(initial.roleName).toUpperCase()
      );
      if (match) setSelectedRoleId(match.id);
    }
  }, [initial, roles]);

  // Prefill lecturer fields when switching into lecturer role
  useEffect(() => {
    if (!initial || !isLecturerRole) return;
    const [firstName, ...rest] = (initial.fullName ?? "").split(" ").filter(Boolean);
    const lastName = rest.join(" ");
    setLecturerForm((prev) => ({
      ...prev,
      firstName: firstName || prev.firstName,
      lastName: lastName || prev.lastName,
      email: initial.email ?? prev.email,
    }));
  }, [initial, isLecturerRole]);

  useEffect(() => {
    setFormErrors({});
  }, [isLecturerRole]);

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

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!selectedRoleId) errors.role = "Role is required";

    if (isLecturerRole) {
      if (!lecturerForm.firstName.trim()) errors.firstName = "First name is required";
      if (!lecturerForm.lastName.trim()) errors.lastName = "Last name is required";
      if (!lecturerForm.email.trim()) errors.lecturerEmail = "Email is required";
      else if (!emailRegex.test(lecturerForm.email.trim())) errors.lecturerEmail = "Invalid email format";
      if (!lecturerForm.phone.trim()) errors.phone = "Phone number is required";
      else if (!phoneRegex.test(lecturerForm.phone.trim())) errors.phone = "Invalid phone number format";
      if (!lecturerForm.designation.trim()) errors.designation = "Designation is required";
      const deptIdNum = Number(lecturerForm.departmentId);
      if (!lecturerForm.departmentId || Number.isNaN(deptIdNum)) errors.departmentId = "Department ID is required";
    } else {
      const usernameVal = userForm.username.trim();
      if (!usernameVal) errors.username = "Username is required";
      else if (!emailRegex.test(usernameVal)) errors.username = "Username must be a valid email";
      if (mode === "create" && !userForm.password.trim()) {
        errors.password = "Password is required";
      } else if (userForm.password && userForm.password.trim().length < 6) {
        errors.password = "Password must be at least 6 characters";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setUserForm(defaultUserForm);
    setLecturerForm(defaultLecturerForm);
    setFile(null);
    setUploadProgress(0);
    setIsUploaded(false);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setServerError("");

    const token = localStorage.getItem("token") || "";

    try {
      // Edit flows stay delegated to parent handler
      if (mode === "edit") {
        if (isLecturerRole) {
          const payload: LecturerPayload = {
            firstName: lecturerForm.firstName.trim(),
            lastName: lecturerForm.lastName.trim(),
            email: lecturerForm.email.trim(),
            phone: lecturerForm.phone.trim(),
            designation: lecturerForm.designation.trim(),
            departmentId: Number(lecturerForm.departmentId),
            roleIds: selectedRoleId ? [selectedRoleId] : [],
          };
          onUpdate?.({
            id: initial?.id,
            roleId: selectedRoleId,
            roleLabel: selectedRoleLabel,
            fullName: `${payload.firstName} ${payload.lastName}`.trim(),
            email: payload.email,
            kind: "lecturer",
            lecturerPayload: payload,
          });
        } else {
          onUpdate?.({
            id: initial?.id,
            username: userForm.username.trim(),
            roleId: selectedRoleId,
            roleLabel: selectedRoleLabel,
            fullName: userForm.fullName.trim() || undefined,
            email: userForm.email.trim() || undefined,
            kind: "user",
          });
        }
        showSuccess("Changes saved");
        resetForm();
        setSubmitting(false);
        onClose();
        return;
      }

      if (isLecturerRole) {
        const payload: LecturerPayload = {
          firstName: lecturerForm.firstName.trim(),
          lastName: lecturerForm.lastName.trim(),
          email: lecturerForm.email.trim(),
          phone: lecturerForm.phone.trim(),
          designation: lecturerForm.designation.trim(),
          departmentId: Number(lecturerForm.departmentId),
          roleIds: selectedRoleId ? [selectedRoleId] : [],
        };

        const res = await fetch(`${API_BASE_URL}/users/add-lec`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = json?.message || "Failed to add lecturer";
          throw new Error(String(msg));
        }

        onCreate?.({
          username: payload.email,
          roleId: selectedRoleId ?? undefined,
          fullName: `${payload.firstName} ${payload.lastName}`.trim(),
          email: payload.email,
          kind: "lecturer",
          lecturerPayload: payload,
        });
        showSuccess("Lecturer created");
      } else {
        const payload: any = {
          username: userForm.username.trim(),
          password: userForm.password.trim(),
          roleIds: selectedRoleId ? [selectedRoleId] : [],
          status: 1,
        };
        if (userForm.fullName.trim()) payload.fullName = userForm.fullName.trim();
        if (userForm.email.trim()) payload.email = userForm.email.trim();

        const res = await fetch(`${API_BASE_URL}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = json?.message || "Failed to add user";
          throw new Error(String(msg));
        }

        onCreate?.({
          username: payload.username,
          password: payload.password,
          roleId: selectedRoleId ?? undefined,
          fullName: payload.fullName,
          email: payload.email,
          kind: "user",
        });
        showSuccess("User created");
      }

      resetForm();
      onClose();
    } catch (e: any) {
      const msg = String(e?.message || "Failed to submit form");
      setServerError(msg);
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const renderError = (field: string) =>
    formErrors[field] ? <span className="add-user-error">{formErrors[field]}</span> : null;

  return (
    <div className="dashboard-cards">
      <div className="add-user-form-container">
        <div className="add-user-form-header">
          <button type="button" className="add-user-back-btn" onClick={onClose}>
            <FaArrowLeft className="add-user-back-icon" />
          </button>
          <div>
            <span className="add-user-title">{mode === "edit" ? "Edit User" : "Add Staff User"}</span>
            <p className="add-user-subtitle">Upload in bulk or switch role to fill the right form</p>
          </div>
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
          <span className="add-user-divider-title">{mode === "edit" ? "Edit manually" : "Add manually"}</span>
          <FaChevronDown className="add-user-divider-arrow open" />
        </div>

        {/* Role selector */}
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
          {renderError("role")}
        </div>

        <div className="add-user-form-card">
          <div className="add-user-section-header">
            <div>
              <p className="add-user-section-title">
                {isLecturerRole ? "Lecturer details" : "User details"}
              </p>
              <p className="add-user-section-subtitle">
                {isLecturerRole
                  ? "Capture lecturer profile and contact details"
                  : "Create a standard account with login credentials"}
              </p>
            </div>
            <span className="add-user-chip">{isLecturerRole ? "Lecturer" : "Common user"}</span>
          </div>

          {serverError && <div className="add-user-error">{serverError}</div>}

          {isLecturerRole ? (
            <div className="add-user-form-grid">
              <div className="add-user-form-group">
                <label className="add-user-label">First name *</label>
                <input
                  type="text"
                  className={`add-user-input ${formErrors.firstName ? "error" : ""}`}
                  value={lecturerForm.firstName}
                  onChange={(e) =>
                    setLecturerForm((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                />
                {renderError("firstName")}
              </div>

              <div className="add-user-form-group">
                <label className="add-user-label">Last name *</label>
                <input
                  type="text"
                  className={`add-user-input ${formErrors.lastName ? "error" : ""}`}
                  value={lecturerForm.lastName}
                  onChange={(e) =>
                    setLecturerForm((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                />
                {renderError("lastName")}
              </div>

              <div className="add-user-form-group">
                <label className="add-user-label">Email *</label>
                <input
                  type="email"
                  className={`add-user-input ${formErrors.lecturerEmail ? "error" : ""}`}
                  value={lecturerForm.email}
                  onChange={(e) =>
                    setLecturerForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
                {renderError("lecturerEmail")}
              </div>

              <div className="add-user-form-group">
                <label className="add-user-label">Phone *</label>
                <input
                  type="tel"
                  className={`add-user-input ${formErrors.phone ? "error" : ""}`}
                  placeholder="+94123456789"
                  value={lecturerForm.phone}
                  onChange={(e) =>
                    setLecturerForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
                {renderError("phone")}
              </div>

              <div className="add-user-form-group">
                <label className="add-user-label">Designation *</label>
                <select
                  className={`add-user-input ${formErrors.designation ? "error" : ""}`}
                  value={lecturerForm.designation}
                  onChange={(e) =>
                    setLecturerForm((prev) => ({ ...prev, designation: e.target.value }))
                  }
                >
                  <option value="">Select designation</option>
                  {DESIGNATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
                {renderError("designation")}
              </div>

              <div className="add-user-form-group">
                <label className="add-user-label">Department *</label>
                <select
                  className={`add-user-input ${formErrors.departmentId ? "error" : ""}`}
                  value={lecturerForm.departmentId}
                  onChange={(e) =>
                    setLecturerForm((prev) => ({ ...prev, departmentId: e.target.value }))
                  }
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {renderError("departmentId")}
              </div>
            </div>
          ) : (
            <div className="add-user-form-grid">
              <div className="add-user-form-group">
                <label className="add-user-label">Username (email) *</label>
                <input
                  type="email"
                  className={`add-user-input ${formErrors.username ? "error" : ""}`}
                  value={userForm.username}
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, username: e.target.value }))
                  }
                />
                {renderError("username")}
              </div>

              <div className="add-user-form-group">
                <label className="add-user-label">
                  Password{mode === "edit" ? " (leave blank to keep)" : " *"}
                </label>
                <input
                  type="password"
                  className={`add-user-input ${formErrors.password ? "error" : ""}`}
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                />
                {renderError("password")}
              </div>

              
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="add-user-form-actions">
          <button
            type="button"
            className="add-user-create-btn"
            onClick={handleSubmit}
            disabled={submitting || !selectedRoleId}
          >
            {submitting
              ? mode === "edit"
                ? "Saving..."
                : "Creating..."
              : mode === "edit"
              ? "Save changes"
              : "Create"}
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
