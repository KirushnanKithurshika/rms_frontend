import React, { useState } from "react";
import "./rolecomponent.css";

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

  const handleAddRole = () => {
    if (newRoleName.trim() === "") return;

    // Add role
    setRoles([...roles, newRoleName]);
    setActiveRole(newRoleName);

    // Reset form & close modal
    setNewRoleName("");
    setShowModal(false);
  };

  return (
    <div className="roles-container">
      <div className="roles-subheader">
        <span>Roles</span>
        <button className="new-role-btn" onClick={() => setShowModal(true)}>
          +New
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

      {/* Modal for Add Role */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Role</h3>
            <label className="role-name-label">Role Name</label>
            <input
              type="text"
              placeholder="Enter role name"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
            />
            <div className="modal-actions">
              <button className="add-btn"onClick={handleAddRole}>Add Role</button>
              <button className="cancel-btn" onClick={() => setShowModal(false)}>
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
