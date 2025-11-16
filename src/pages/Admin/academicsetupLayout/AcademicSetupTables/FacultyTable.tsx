// FacultyTable.tsx
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
import "./table.css"; // reuses same classes

type Faculty = {
  id: number;
  code: string;
  name: string;
  dean?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
};

const SAMPLE_FACULTIES: Faculty[] = [
  { id: 1, code: "ENG-UOR", name: "Faculty of Engineering", dean: "Dr. M. Perera", contactNumber: "+94 91 224 5765", email: "eng@uor.ac.lk", address: "Hapugala, Galle 80000" },
  { id: 2, code: "SCI-UOR", name: "Faculty of Science", dean: "Prof. K. Jayasena", contactNumber: "+94 91 224 1111", email: "science@uor.ac.lk", address: "Wellamadama, Matara" },
  { id: 3, code: "ENG-UOM", name: "Faculty of Engineering", dean: "Prof. A. Silva", contactNumber: "+94 11 265 0301", email: "eng@uom.lk", address: "Katubedda, Moratuwa" },
  { id: 4, code: "MED-UOC", name: "Faculty of Medicine", dean: "Prof. R. Fernando", contactNumber: "+94 11 258 1835", email: "med@cmb.ac.lk", address: "Colombo 03" },
  { id: 5, code: "ART-UOJ", name: "Faculty of Arts", dean: "Dr. T. Sutharsan", contactNumber: "+94 21 222 6714", email: "arts@univ.jfn.ac.lk", address: "Thirunelvely, Jaffna" },
];

type SortKey = keyof Pick<Faculty, "code" | "name" | "dean" | "contactNumber" | "email" | "address">;

export default function FacultyTable() {
  const [rows, setRows] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("code");
  const [sortAsc, setSortAsc] = useState(true);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [editing, setEditing] = useState<Faculty | null>(null);
  const [creating, setCreating] = useState(false);

  // Delete modal state (reusing same class names)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState<Faculty | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.get<Faculty[]>("/api/faculties");
        setRows(Array.isArray(data) && data.length ? data : SAMPLE_FACULTIES);
      } catch {
        setRows(SAMPLE_FACULTIES);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    const f = t
      ? rows.filter((r) =>
          [r.code, r.name, r.dean, r.address, r.contactNumber, r.email]
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
  const askDelete = (f: Faculty) => {
    setFacultyToDelete(f);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setFacultyToDelete(null);
  };

  const confirmDelete = async () => {
    if (!facultyToDelete) return;
    try {
      await axios.delete(`/api/faculties/${facultyToDelete.id}`);
    } catch {
      return; // keep row if API failed; optionally toast an error
    }
    setRows((r) => r.filter((x) => x.id !== facultyToDelete.id));
    closeDeleteModal();
  };

  const handleCreate = async (payload: Omit<Faculty, "id">) => {
    const { data } = await axios.post<Faculty>("/api/faculties", payload);
    setRows((r) => [data, ...r]);
    setCreating(false);
  };

  const handleUpdate = async (id: number, payload: Omit<Faculty, "id">) => {
    const { data } = await axios.put<Faculty>(`/api/faculties/${id}`, payload);
    setRows((r) => r.map((x) => (x.id === id ? data : x)));
    setEditing(null);
  };

  useEffect(() => { setPage(1); }, [q]);

  return (
    <div>
      {/* Top toolbar (same class names) */}
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
            Add Faculty
          </button>
        </div>
      </div>

      {/* Table (same classes) */}
      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>#</th>
              <th onClick={() => toggleSort("code")}>
                Faculty ID {sortIcon("code")}
              </th>
              <th onClick={() => toggleSort("name")}>
                Name {sortIcon("name")}
              </th>
              <th onClick={() => toggleSort("dean")}>
                Dean {sortIcon("dean")}
              </th>
              <th onClick={() => toggleSort("contactNumber")}>
                Contact number {sortIcon("contactNumber")}
              </th>
              <th onClick={() => toggleSort("email")}>
                Email {sortIcon("email")}
              </th>
              <th onClick={() => toggleSort("address")}>
                Address {sortIcon("address")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr><td colSpan={8}>Loading…</td></tr>
            )}

            {!loading && view.length === 0 && (
              <tr><td colSpan={8}>No data</td></tr>
            )}

            {!loading && view.map((f, i) => (
              <tr key={f.id}>
                <td>{(page - 1) * pageSize + i + 1}</td>
                <td>{f.code}</td>
                <td>{f.name}</td>
                <td>{f.dean || "-"}</td>
                <td>{f.contactNumber || "-"}</td>
                <td>{f.email || "-"}</td>
                <td>{f.address || "-"}</td>
                <td className="actions">
                  <button className="icon-btn" title="Edit" onClick={() => setEditing(f)}>
                    <MdEdit className="icon edit-icon" />
                  </button>
                  <button className="icon-btn" title="Delete" onClick={() => askDelete(f)}>
                    <MdDelete className="icon delete-icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create modal (reusing the same component & classes) */}
      {creating && (
        <AppFormModal
          title="Add Faculty"
          initial={{}}
          onCancel={() => setCreating(false)}
          onSubmit={(payload) => handleCreate(payload)}
        />
      )}

      {/* Edit modal */}
      {editing && (
        <AppFormModal
          title="Edit Faculty"
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
              <h4 id="delete-title">Delete Faculty</h4>
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
                {facultyToDelete ? (
                  <>
                    Are you sure you want to delete{" "}
                    <strong>
                      {facultyToDelete.code} — {facultyToDelete.name}
                    </strong>
                    ?
                  </>
                ) : (
                  "Are you sure you want to delete this faculty?"
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
  initial?: Partial<Omit<Faculty, "id">>;
  onCancel: () => void;
  onSubmit: (payload: Omit<Faculty, "id">) => void;
}) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [dean, setDean] = useState(initial?.dean ?? "");
  const [contactNumber, setContactNumber] = useState(initial?.contactNumber ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ code, name, dean, contactNumber, email, address });
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
              <span className="app-label">Faculty ID</span>
              <input className="app-input" value={code} onChange={(e) => setCode(e.target.value)} required />
            </label>

            <label className="app-field">
              <span className="app-label">Name</span>
              <input className="app-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>

            <label className="app-field">
              <span className="app-label">Dean</span>
              <input className="app-input" value={dean} onChange={(e) => setDean(e.target.value)} />
            </label>

            <label className="app-field">
              <span className="app-label">Contact number</span>
              <input className="app-input" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
            </label>

            <label className="app-field">
              <span className="app-label">Email</span>
              <input className="app-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>

            <label className="app-field app-grid--2">
              <span className="app-label">Address</span>
              <input className="app-input" value={address} onChange={(e) => setAddress(e.target.value)} />
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
