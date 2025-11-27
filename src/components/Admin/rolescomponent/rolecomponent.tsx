// RolesPanel.tsx
import React, { useEffect, useMemo, useState } from "react";
import { MdEdit, MdDelete } from "react-icons/md";
import "./rolecomponent.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

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

type Role = {
  id?: number;
  name: string;
  privileges?: { id: number; name: string }[];
  privilegeIds?: number[];
};
type Priv = { id: number; name: string };

const RolesPanel: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);

  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [roleName, setRoleName] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [allPrivileges, setAllPrivileges] = useState<Priv[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Load roles from backend on mount
  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const load = async () => {
      try {
        // fallback to possible alt path
        let res = await fetch(`${API_BASE_URL}/v1/roles/GetAll`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json().catch(() => ({}));
        const payload: any = json?.data;
        const raw = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.content)
          ? payload.content
          : [];
        const mapped: Role[] = raw.map((r: any) => ({
          id: r.id,
          name: r.name,
          privileges: Array.isArray(r.privileges) ? r.privileges : [],
          privilegeIds: Array.isArray(r.privileges)
            ? r.privileges.map((p: any) => p.id)
            : [],
        }));
        setRoles(mapped);
        setActiveRole(mapped[0] || null);
      } catch {
        setRoles([]);
        setActiveRole(null);
      }
    };
    load();
  }, []);

  const resetForm = () => {
    setRoleName("");
    setSubmitting(false);
    setError(null);
    setSuccess(null);
    setSelectedIds([]);
  };

  // Fetch all privileges when modal opens
  useEffect(() => {
    if (!showModal) return;
    const token = localStorage.getItem("token") || "";
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/v1/privileges/GetAll`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json().catch(() => ({}));
        const data = Array.isArray(json?.data) ? (json.data as Priv[]) : [];
        setAllPrivileges(data);
      } catch {
        setAllPrivileges([]);
      }
    })();
  }, [showModal]);

  const openCreate = () => {
    setModalMode("create");
    setRoleName("");
    setSelectedIds([]);
    setShowModal(true);
  };

  const openEdit = () => {
    if (!activeRole?.id) return;
    setModalMode("edit");
    setRoleName(activeRole.name);
    setSelectedIds(activeRole.privilegeIds || []);
    setShowModal(true);
  };

  const togglePriv = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    const name = roleName.trim();
    if (!name && modalMode === "create") return;
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const token = localStorage.getItem("token") || "";
    try {
      if (modalMode === "create") {
        if (roles.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
          setError("Role name already exists.");
          setSubmitting(false);
          return;
        }
        const res = await fetch(`${API_BASE_URL}/v1/roles/Create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, privilegeIds: selectedIds }),
        });
        if (!res.ok) throw new Error(await friendlyHttpError(res));
        const json = await res.json().catch(() => ({}));
        const created: Role = {
          id: json?.data?.id,
          name: json?.data?.name,
          privileges: Array.isArray(json?.data?.privileges)
            ? json.data.privileges
            : [],
          privilegeIds: Array.isArray(json?.data?.privileges)
            ? json.data.privileges.map((p: any) => p.id)
            : [],
        };
        setRoles((prev) => [...prev, created]);
        setActiveRole(created);
        setSuccess("Role created successfully");
      } else if (modalMode === "edit" && activeRole?.id) {
        const res = await fetch(
          `${API_BASE_URL}/v1/roles/Update/${activeRole.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(selectedIds),
          }
        );
        if (!res.ok) throw new Error(await friendlyHttpError(res));
        setRoles((prev) =>
          prev.map((r) =>
            r.id === activeRole.id
              ? { ...r, privilegeIds: [...selectedIds] }
              : r
          )
        );
        setSuccess("Privileges updated successfully");
      }
      setTimeout(() => {
        setShowModal(false);
        resetForm();
      }, 250);
    } catch (e: any) {
      setError(e?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!activeRole?.id) return;
    if (!confirm(`Delete role "${activeRole.name}"?`)) return;
    const token = localStorage.getItem("token") || "";
    try {
      const res = await fetch(
        `${API_BASE_URL}/v1/roles/Delete/${activeRole.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error(await friendlyHttpError(res));
      setRoles((prev) => prev.filter((r) => r.id !== activeRole.id));
      setActiveRole(roles.find((r) => r.id !== activeRole.id) || null);
    } catch (e: any) {
      alert(e?.message || "Failed to delete role");
    }
  };

  return (
    <div className="roles-container">
      <div className="roles-subheader">
        <div className="left-group">
          <button className="new-role-btn primary" onClick={openCreate}>
            Create Role
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th style={{ width: 80 }}>ID</th>
              <th style={{ width: 220 }}>Name</th>
              <th>Privileges</th>
              <th style={{ width: 120 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.id ?? r.name} onClick={() => setActiveRole(r)}>
                <td>{r.id ?? "-"}</td>
                <td style={{ fontWeight: 500 }}>{r.name}</td>
                <td>
                  <div className="priv-chips">
                    {(r.privileges || []).map((p) => (
                      <span key={p.id} className="chip">
                        {p.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <MdEdit
                    title="Edit privileges"
                    className="icon edit-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveRole(r);
                      openEdit();
                    }}
                  />
                  <MdDelete
                    title="Delete role"
                    className="icon delete-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveRole(r);
                      handleDelete();
                    }}
                    style={{ marginLeft: 10 }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
            <h3 id="add-role-title">
              {modalMode === "create" ? "Add Role" : "Edit Role Privileges"}
            </h3>

            <label className="role-name-label">Role Name</label>
            <input
              type="text"
              placeholder="Enter role name"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              disabled={submitting || modalMode === "edit"}
            />

            <div className="privileges-picker">
              <div className="picker-header">Select Privileges</div>
              <div className="picker-body">
                {allPrivileges.length === 0 ? (
                  <div style={{ padding: 8 }}>Loading privileges...</div>
                ) : (
                  allPrivileges.map((p) => (
                    <label key={p.id} className="priv-item">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => togglePriv(p.id)}
                        disabled={submitting}
                      />
                      <span>{p.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {error && <div className="error-text">{error}</div>}
            {success && <div className="success-text">{success}</div>}

            <div className="modal-actions">
              <button
                className="add-btn"
                onClick={handleSave}
                disabled={
                  submitting || (modalMode === "create" && !roleName.trim())
                }
              >
                {submitting
                  ? modalMode === "create"
                    ? "Creating..."
                    : "Saving..."
                  : modalMode === "create"
                  ? "Add Role"
                  : "Save"}
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
