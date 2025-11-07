// DepartmentTable.tsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaSearch,
  FaPlus,
  FaTimes,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import { MdEdit, MdDelete } from "react-icons/md";
import "./table.css"; // reuse same classes from your tables

type Department = {
  id: number;
  code: string;             // e.g., "ENG-CE"
  name: string;             // e.g., "Department of Civil Engineering"
  facultyCode?: string;     // e.g., "ENG-UOR"
  hod?: string;             // Head of Department
  contactNumber?: string;
  email?: string;
  office?: string;          // building/room
};

const SAMPLE_DEPARTMENTS: Department[] = [
  { id: 1, code: "ENG-CE", name: "Department of Civil Engineering", facultyCode: "ENG-UOR", hod: "Dr. S. Gunasekara", contactNumber: "+94 91 224 5001", email: "ce@uor.ac.lk", office: "Block C, Room 201" },
  { id: 2, code: "ENG-EE", name: "Department of Electrical & Electronic Engineering", facultyCode: "ENG-UOR", hod: "Dr. R. Wijesinghe", contactNumber: "+94 91 224 5002", email: "ee@uor.ac.lk", office: "Block E, Room 105" },
  { id: 3, code: "ENG-ME", name: "Department of Mechanical & Manufacturing Engineering", facultyCode: "ENG-UOR", hod: "Prof. T. Perera", contactNumber: "+94 91 224 5003", email: "me@uor.ac.lk", office: "Block M, Lab 02" },
  { id: 4, code: "ENG-CS", name: "Department of Computer Science & Engineering", facultyCode: "ENG-UOR", hod: "Dr. N. Fernando", contactNumber: "+94 91 224 5004", email: "cse@uor.ac.lk", office: "IT Block, 3rd Floor" },
  { id: 5, code: "ENG-IM", name: "Department of Interdisciplinary Studies", facultyCode: "ENG-UOR", hod: "Dr. H. Jayawardena", contactNumber: "+94 91 224 5005", email: "ids@uor.ac.lk", office: "Admin Block, 1st Floor" },
];

type SortKey = keyof Pick<Department, "code" | "name" | "facultyCode" | "hod" | "contactNumber" | "email" | "office">;

export default function DepartmentTable() {
  const [rows, setRows] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("code");
  const [sortAsc, setSortAsc] = useState(true);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [editing, setEditing] = useState<Department | null>(null);
  const [creating, setCreating] = useState(false);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.get<Department[]>("/api/departments");
        setRows(Array.isArray(data) && data.length ? data : SAMPLE_DEPARTMENTS);
      } catch {
        setRows(SAMPLE_DEPARTMENTS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    const f = t
      ? rows.filter((r) =>
          [r.code, r.name, r.facultyCode, r.hod, r.office, r.contactNumber, r.email]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(t))
        )
      : rows;

    const s = [...f].sort((a, b) => {
      const av = (a[sortBy] ?? "").toString().toLowerCase();
      const bv = (b[sortBy] ?? "").toString().toLowerCase();
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });

    return s;
  }, [rows, q, sortBy, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const view = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: SortKey) => {
    if (key === sortBy) setSortAsc((v) => !v);
    else {
      setSortBy(key);
      setSortAsc(true);
    }
  };

  const sortIcon = (key: SortKey) =>
    sortBy !== key ? <FaSort /> : sortAsc ? <FaSortUp /> : <FaSortDown />;

  // Delete modal handlers
  const askDelete = (d: Department) => {
    setDeptToDelete(d);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeptToDelete(null);
  };

  const confirmDelete = async () => {
    if (!deptToDelete) return;
    try {
      await axios.delete(`/api/departments/${deptToDelete.id}`);
    } catch {
      return; // optionally toast error
    }
    setRows((r) => r.filter((x) => x.id !== deptToDelete.id));
    closeDeleteModal();
  };

  const handleCreate = async (payload: Omit<Department, "id">) => {
    const { data } = await axios.post<Department>("/api/departments", payload);
    setRows((r) => [data, ...r]);
    setCreating(false);
  };

  const handleUpdate = async (id: number, payload: Omit<Department, "id">) => {
    const { data } = await axios.put<Department>(`/api/departments/${id}`, payload);
    setRows((r) => r.map((x) => (x.id === id ? data : x)));
    setEditing(null);
  };

  useEffect(() => { setPage(1); }, [q]);

  return (
    <div>
      {/* Top toolbar (reuse) */}
      <div className="user-management-header">
        <div className="custom-searchbar">
          <input
            type="text"
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <FaSearch className="search-icon" />
        </div>

        <div className="filters">
          <button className="add-user-btn" onClick={() => setCreating(true)}>
            <FaPlus style={{ marginRight: 6 }} />
            Add Department
          </button>
        </div>
      </div>

      {/* Table (reuse classes) */}
      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>#</th>
              <th onClick={() => toggleSort("code")}>
                Dept. ID {sortIcon("code")}
              </th>
              <th onClick={() => toggleSort("name")}>
                Name {sortIcon("name")}
              </th>
              <th onClick={() => toggleSort("facultyCode")}>
                Faculty {sortIcon("facultyCode")}
              </th>
              <th onClick={() => toggleSort("hod")}>
                HOD {sortIcon("hod")}
              </th>
              <th onClick={() => toggleSort("contactNumber")}>
                Contact {sortIcon("contactNumber")}
              </th>
              <th onClick={() => toggleSort("email")}>
                Email {sortIcon("email")}
              </th>
              <th onClick={() => toggleSort("office")}>
                Office {sortIcon("office")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr><td colSpan={9}>Loading…</td></tr>
            )}

            {!loading && view.length === 0 && (
              <tr><td colSpan={9}>No data</td></tr>
            )}

            {!loading && view.map((d, i) => (
              <tr key={d.id}>
                <td>{(page - 1) * pageSize + i + 1}</td>
                <td>{d.code}</td>
                <td>{d.name}</td>
                <td>{d.facultyCode || "-"}</td>
                <td>{d.hod || "-"}</td>
                <td>{d.contactNumber || "-"}</td>
                <td>{d.email || "-"}</td>
                <td>{d.office || "-"}</td>
                <td className="actions">
                  <button className="icon-btn" title="Edit" onClick={() => setEditing(d)}>
                    <MdEdit className="icon edit-icon" />
                  </button>
                  <button className="icon-btn" title="Delete" onClick={() => askDelete(d)}>
                    <MdDelete className="icon delete-icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      {creating && (
        <AppFormModal
          title="Add Department"
          initial={{}}
          onCancel={() => setCreating(false)}
          onSubmit={(payload) => handleCreate(payload)}
        />
      )}

      {/* Edit modal */}
      {editing && (
        <AppFormModal
          title="Edit Department"
          initial={editing}
          onCancel={() => setEditing(null)}
          onSubmit={(payload) => handleUpdate(editing.id, payload)}
        />
      )}

      {/* Delete confirmation modal (your class names) */}
      {showDeleteModal && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          onClick={closeDeleteModal}
        >
          <div
            className="modal"
            role="document"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            <div className="modal-header">
              <h4 id="delete-title">Delete Department</h4>
              <button
                className="close-btn"
                aria-label="Close"
                onClick={closeDeleteModal}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-body">
                {deptToDelete ? (
                  <>
                    Are you sure you want to delete{" "}
                    <strong>
                      {deptToDelete.code} — {deptToDelete.name}
                    </strong>
                    ?
                  </>
                ) : (
                  "Are you sure you want to delete this department?"
                )}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-delete danger" onClick={confirmDelete}>
                Delete
              </button>
              <button className="btn-delete ghost" onClick={closeDeleteModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Reusable modal with the same app-* classes */
function AppFormModal({
  title,
  initial,
  onCancel,
  onSubmit,
}: {
  title: string;
  initial?: Partial<Omit<Department, "id">>;
  onCancel: () => void;
  onSubmit: (payload: Omit<Department, "id">) => void;
}) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [facultyCode, setFacultyCode] = useState(initial?.facultyCode ?? "ENG-UOR");
  const [hod, setHod] = useState(initial?.hod ?? "");
  const [contactNumber, setContactNumber] = useState(initial?.contactNumber ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [office, setOffice] = useState(initial?.office ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ code, name, facultyCode, hod, contactNumber, email, office });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="app-modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="app-modal" onClick={(e) => e.stopPropagation()}>
        <div className="app-modal__header">
          <h3 className="app-modal__title">{title}</h3>
          <button
            type="button"
            className="app-modal__close"
            onClick={onCancel}
            aria-label="Close"
            title="Close"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={submit} className="app-form">
          <div className="app-grid">
            <label className="app-field">
              <span className="app-label">Department ID</span>
              <input className="app-input" value={code} onChange={(e) => setCode(e.target.value)} required />
            </label>

            <label className="app-field">
              <span className="app-label">Name</span>
              <input className="app-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>

            <label className="app-field">
              <span className="app-label">Faculty Code</span>
              <input className="app-input" value={facultyCode} onChange={(e) => setFacultyCode(e.target.value)} />
            </label>

            <label className="app-field">
              <span className="app-label">Head of Department</span>
              <input className="app-input" value={hod} onChange={(e) => setHod(e.target.value)} />
            </label>

            <label className="app-field">
              <span className="app-label">Contact</span>
              <input className="app-input" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
            </label>

            <label className="app-field">
              <span className="app-label">Email</span>
              <input className="app-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>

            <label className="app-field app-grid--2">
              <span className="app-label">Office</span>
              <input className="app-input" value={office} onChange={(e) => setOffice(e.target.value)} />
            </label>
          </div>

          <div className="app-modal__actions">
            <button type="submit" className="app-btn app-btn--primary">Save</button>
            <button type="button" className="app-btn" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
