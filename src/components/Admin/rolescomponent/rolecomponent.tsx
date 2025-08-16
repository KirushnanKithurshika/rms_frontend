// RolesPanel.tsx
import React, { useState } from "react";
import "./rolecomponent.css";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

// Map HTTP errors to short, friendly messages
const friendlyHttpError = async (res: Response) => {
  // Try to read any server-provided message (ignored if parsing fails)
  let serverMsg = "";
  try {
    const j = await res.clone().json();
    serverMsg = j?.message || j?.error || j?.data || j?.detail || "";
  } catch {
    try {
      serverMsg = (await res.clone().text()).slice(0, 140);
    } catch {}
  }

  switch (res.status) {
    case 400:
      return "Invalid request.";
    case 401:
      return "Invalid credentials. Please sign in again.";
    case 403:
      return "You don’t have permission to do that.";
    case 404:
      return "Not found.";
    case 409:
      return "Role already exists.";
    case 422:
      return "Please check the fields and try again.";
    case 500:
      return "Server error. Try again later.";
    default:
      return serverMsg || `Error ${res.status}. Please try again.`;
  }
};

const RolesPanel: React.FC = () => {
  const [roles, setRoles] = useState<string[]>([
    "Admin",
    "Students",
    "Lecturer",
    "Administrative Staff",
    "Librarian",
    "Hostel Warden",
    "Sports Departement",
    "Dean",
    "Disciplinary Commitee",
    "Financial Officer",
  ]);

  const [activeRole, setActiveRole] = useState("Admin");
  const [showModal, setShowModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setNewRoleName("");
    setSubmitting(false);
    setError(null);
    setSuccess(null);
  };

  const handleAddRole = async () => {
    const name = newRoleName.trim();
    if (!name) return;

    // Optional: local unique check (prevents obvious dupes)
    if (roles.some((r) => r.toLowerCase() === name.toLowerCase())) {
      setError("Role name already exists.");
      return;
    }

    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/v1/roles/Create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
        body: JSON.stringify({
          name,
          // privileges will be configured later
          privilegeIds: [],
        }),
      });

      if (!res.ok) {
        const msg = await friendlyHttpError(res);
        throw new Error(msg);
      }

      setRoles((prev) => [...prev, name]);
      setActiveRole(name);
      setSuccess("Role created.");

      setTimeout(() => {
        setShowModal(false);
        resetForm();
      }, 250);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="roles-container">
      <div className="roles-subheader">
        <span>Roles</span>
        <button className="new-role-btn" onClick={() => setShowModal(true)}>
          + New
        </button>
      </div>

      <div className="roles-list">
        {roles.map((role, index) => (
          <div
            key={index}
            className={`role-item ${activeRole === role ? "active-role" : ""}`}
            onClick={() => setActiveRole(role)}
          >
            {role}
          </div>
        ))}
      </div>

      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            if (!submitting) setShowModal(false);
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-role-title"
          >
            <h3 id="add-role-title">Add Role</h3>

            <label className="role-name-label">Role Name</label>
            <input
              type="text"
              placeholder="Enter role name"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              disabled={submitting}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newRoleName.trim() && !submitting) {
                  handleAddRole();
                }
              }}
            />

            {error && <div className="error-text">{error}</div>}
            {success && <div className="success-text">{success}</div>}

            <div className="modal-actions">
              <button
                className="add-btn"
                onClick={handleAddRole}
                disabled={submitting || !newRoleName.trim()}
              >
                {submitting ? "Creating..." : "Add Role"}
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPanel;
