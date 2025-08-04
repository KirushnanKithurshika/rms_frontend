import React, { useState } from "react";
import "./roleprivilegestable.css";

interface Privilege {
  module: string;
  view: boolean;
  edit: boolean;
  delete: boolean;
  add: boolean;
}

const RolePrivilegesTable: React.FC = () => {
  const [privileges, setPrivileges] = useState<Privilege[]>([
    { module: "Results", view: false, edit: false, delete: false, add: false },
    { module: "Students", view: true, edit: false, delete: false, add: false },
    { module: "Lecturers", view: false, edit: false, delete: false, add: false },
    { module: "Courses", view: false, edit: false, delete: false, add: false },
    { module: "Departments", view: false, edit: false, delete: false, add: false },
    { module: "Dashboard", view: true, edit: false, delete: false, add: false },
    { module: "Settings", view: false, edit: false, delete: false, add: false },
    { module: "Reports", view: false, edit: false, delete: false, add: false },
    { module: "User Management", view: false, edit: false, delete: false, add: false },
    { module: "Attendance", view: true, edit: false, delete: false, add: false },
    { module: "Library", view: false, edit: false, delete: false, add: false },
    { module: "Timetable", view: false, edit: false, delete: false, add: false },
    { module: "Finance", view: false, edit: false, delete: false, add: false },
    { module: "Exams", view: true, edit: false, delete: false, add: false },
  ]);

  const fields: (keyof Privilege)[] = ["view", "edit", "delete", "add"];

  const handleCheckboxChange = (rowIndex: number, field: keyof Privilege) => {
    setPrivileges((prev) =>
      prev.map((priv, i) =>
        i === rowIndex ? { ...priv, [field]: !priv[field] } : priv
      )
    );
  };

  return (
    <div className="privileges-table-container">
      {/* Header */}
      <table className="privileges-table header-table">
        <thead>
          <tr>
            <th>Module</th>
            {fields.map((field) => (
              <th key={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</th>
            ))}
          </tr>
        </thead>
      </table>

      {/* Scrollable Body */}
      <div className="privileges-table-body">
        <table className="privileges-table">
          <tbody>
            {privileges.map((priv, index) => (
              <tr key={`${priv.module}-${index}`}>
                <td>{priv.module}</td>
                {fields.map((field) => (
                  <td key={`${index}-${field}`}>
                    <input
                      type="checkbox"
                    
                      onChange={() => handleCheckboxChange(index, field)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RolePrivilegesTable;
