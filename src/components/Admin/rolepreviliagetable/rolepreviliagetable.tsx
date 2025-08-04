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
    { module: "Results", view: true, edit: false, delete: false, add: false },
    { module: "Results", view: false, edit: false, delete: false, add: false },
    { module: "Results", view: false, edit: false, delete: false, add: false },
    { module: "Results", view: false, edit: false, delete: false, add: false },
    { module: "Results", view: true, edit: false, delete: false, add: false },
    { module: "Results", view: false, edit: false, delete: false, add: false },
    { module: "Results", view: false, edit: false, delete: false, add: false },
    { module: "Results", view: false, edit: false, delete: false, add: false },
    { module: "Results", view: true, edit: false, delete: false, add: false },
    { module: "Results", view: false, edit: false, delete: false, add: false },
    { module: "Results", view: false, edit: false, delete: false, add: false },
    { module: "Results", view: false, edit: false, delete: false, add: false },
    { module: "Results", view: true, edit: false, delete: false, add: false },
    { module: "Results", view: false, edit: false, delete: false, add: false },
    { module: "Results", view: false, edit: false, delete: false, add: false },
  ]);

  const handleCheckboxChange = (rowIndex: number, field: keyof Privilege) => {
    const updated = [...privileges];
    updated[rowIndex][field] = !updated[rowIndex][field]; // Toggle value
    setPrivileges(updated);
  };

  return (
    <div className="privileges-table-container">
      {/* Header Table */}
      <table className="privileges-table">
        <thead>
          <tr>
            <th>Module</th>
            <th>View</th>
            <th>Edit</th>
            <th>Delete</th>
            <th>Add</th>
          </tr>
        </thead>
      </table>

      {/* Scrollable Body */}
      <div className="privileges-table-body">
        <table className="privileges-table">
          <tbody>
            {privileges.map((priv, index) => (
              <tr key={index}>
                <td>{priv.module}</td>
                {["view", "edit", "delete", "add"].map((field) => (
                  <td key={field}>
                    <input
                      type="checkbox"
                      checked={priv[field as keyof Privilege]}
                      onChange={() =>
                        handleCheckboxChange(index, field as keyof Privilege)
                      }
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
