import React, { useState } from "react";
import "./adduserform.css";
import { FaArrowLeft, FaChevronDown } from "react-icons/fa";

interface AddUserFormProps {
  onClose: () => void;
  onCreate: (user: {
    username: string;
    password: string;
    role: string;
    fullName: string;
    email: string;
  }) => void;
}

interface Role {
  label: string;
}

const roles: Role[] = [
  { label: "Admin" },
  { label: "Moderator" },
  { label: "User" },
  { label: "Guest" },
];

const AddUserForm: React.FC<AddUserFormProps> = ({ onClose, onCreate }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isRoleOpen, setIsRoleOpen] = useState(false);

  const handleSubmit = () => {
    if (!username || !password || !fullName || !email) {
      alert("Please fill all fields!");
      return;
    }

    onCreate({ username, password, role, fullName, email });

    setUsername("");
    setPassword("");
    setRole("User");
    setFullName("");
    setEmail("");
    onClose();
  };

  return (
    <div className="add-user-form-container">
      
      <div className="add-user-form-header">
        <button type="button" className="add-user-back-btn" onClick={onClose}>
          <FaArrowLeft className="add-user-back-icon" />
        </button>
        <span className="add-user-title">Add User</span>
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
            className="custom-role-dropdown"
            onClick={() => setIsRoleOpen((prev) => !prev)}
          >
            <span className="selected-role">{role}</span>
            <FaChevronDown className={`dropdown-icon ${isRoleOpen ? "open" : ""}`} />
          </div>

          {isRoleOpen && (
            <div className="custom-role-options">
              {roles.map((r, index) => (
                <div
                  key={index}
                  className={`role-option-card ${role === r.label ? "active" : ""}`}
                  onClick={() => {
                    setRole(r.label);
                    setIsRoleOpen(false);
                  }}
                >
                  <span>{r.label}</span>
                </div>
              ))}
            </div>
          )}
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

     
      <div className="add-user-form-actions">
        <button type="button" className="add-user-create-btn" onClick={handleSubmit}>
          Create
        </button>
        <button type="button" className="add-user-cancel-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddUserForm;
