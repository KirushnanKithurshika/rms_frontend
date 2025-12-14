// UniversitiesTable.tsx
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
import "./table.css";

type University = {
  id: number;
  code: string;
  name: string;
  address?: string;
  contactNumber?: string;
  email?: string;
};

const SAMPLE_UNIS: University[] = [
  { id: 1, code: "UOR", name: "University of Ruhuna", address: "Hapugala, Galle 80000, Sri Lanka", contactNumber: "+94 91 224 5765", email: "info@uor.ac.lk" },
  { id: 2, code: "UOM", name: "University of Moratuwa", address: "Bandaranayake Mawatha, Moratuwa 10400", contactNumber: "+94 11 265 0301", email: "info@uom.lk" },
  { id: 3, code: "UOC", name: "University of Colombo", address: "94 Cumaratunga Munidasa Mawatha, Colombo 03", contactNumber: "+94 11 258 1835", email: "info@cmb.ac.lk" },
  { id: 4, code: "UOJ", name: "University of Jaffna", address: "Thirunelvely, Jaffna 40000", contactNumber: "+94 21 222 6714", email: "info@univ.jfn.ac.lk" },
  { id: 5, code: "USJP", name: "University of Sri Jayewardenepura", address: "Gangodawila, Nugegoda 10250", contactNumber: "+94 11 275 8000", email: "info@sjp.ac.lk" },
  { id: 6, code: "SUSL", name: "Sabaragamuwa University of Sri Lanka", address: "Belihuloya 70140", contactNumber: "+94 45 228 0000", email: "info@sab.ac.lk" },
  { id: 7, code: "EUSL", name: "Eastern University, Sri Lanka", address: "Vantharumoolai, Chenkalady", contactNumber: "+94 65 224 0587", email: "info@esn.ac.lk" },
  { id: 8, code: "RAJ", name: "Rajarata University of Sri Lanka", address: "Mihintale, Anuradhapura", contactNumber: "+94 25 226 6627", email: "info@rjt.ac.lk" },
];

type SortKey = keyof Pick<University, "code" | "name" | "address" | "contactNumber" | "email">;

export default function UniversitiesTable() {
  const [rows, setRows] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("code");
  const [sortAsc, setSortAsc] = useState(true);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [editing, setEditing] = useState<University | null>(null);
  const [creating, setCreating] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [universityToDelete, setUniversityToDelete] = useState<University | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.get<University[]>("/api/universities");
        setRows(Array.isArray(data) && data.length ? data : SAMPLE_UNIS);
      } catch {
        setRows(SAMPLE_UNIS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    const f = t
      ? rows.filter((r) =>
          [r.code, r.name, r.address, r.contactNumber, r.email]
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

  // Open delete modal
  const askDelete = (u: University) => {
    setUniversityToDelete(u);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUniversityToDelete(null);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!universityToDelete) return;
    try {
      await axios.delete(`/api/universities/${universityToDelete.id}`);
    } catch {
      // even if API fails, you can decide to keep item; here we'll remove only on success
      // optionally toast error
      return;
    }
    setRows((r) => r.filter((x) => x.id !== universityToDelete.id));
    closeDeleteModal();
  };

  const handleCreate = async (payload: Omit<University, "id">) => {
    // Persist
    const { data } = await axios.post<University>("/api/universities", payload);
    // Update UI
    setRows((r) => [data, ...r]);
    setCreating(false);
  };

  const handleUpdate = async (id: number, payload: Omit<University, "id">) => {
    const { data } = await axios.put<University>(`/api/universities/${id}`, payload);
    setRows((r) => r.map((x) => (x.id === id ? data : x)));
    setEditing(null);
  };

  useEffect(() => { setPage(1); }, [q]);

  return (
    <div>
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
            Add University
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>#</th>
              <th onClick={() => toggleSort("code")}>
                University ID {sortIcon("code")}
              </th>
              <th onClick={() => toggleSort("name")}>
                Name {sortIcon("name")}
              </th>
              <th onClick={() => toggleSort("address")}>
                Address {sortIcon("address")}
              </th>
              <th onClick={() => toggleSort("contactNumber")}>
                Contact number {sortIcon("contactNumber")}
              </th>
              <th onClick={() => toggleSort("email")}>
                Email {sortIcon("email")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr><td colSpan={7}>Loading…</td></tr>
            )}

            {!loading && view.length === 0 && (
              <tr><td colSpan={7}>No data</td></tr>
            )}

            {!loading && view.map((u, i) => (
              <tr key={u.id}>
                <td>{(page - 1) * pageSize + i + 1}</td>
                <td>{u.code}</td>
                <td>{u.name}</td>
                <td>{u.address || "-"}</td>
                <td>{u.contactNumber || "-"}</td>
                <td>{u.email || "-"}</td>
                <td className="actions">
                  <button className="icon-btn" title="Edit" onClick={() => setEditing(u)}>
                    <MdEdit className="icon edit-icon" />
                  </button>
                  <button className="icon-btn" title="Delete" onClick={() => askDelete(u)}>
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
          title="Add University"
          initial={{}}
          onCancel={() => setCreating(false)}
          onSubmit={(payload) => handleCreate(payload)}
        />
      )}

      {/* Edit modal */}
      {editing && (
        <AppFormModal
          title="Edit University"
          initial={editing}
          onCancel={() => setEditing(null)}
          onSubmit={(payload) => handleUpdate(editing.id, payload)}
        />
      )}

      {/* Delete confirmation modal (uses your class names) */}
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
              <h4 id="delete-title">Delete University</h4>
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
                {universityToDelete ? (
                  <>
                    Are you sure you want to delete{" "}
                    <strong>
                      {universityToDelete.code} — {universityToDelete.name}
                    </strong>
                    ?
                  </>
                ) : (
                  "Are you sure you want to delete this university?"
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

/** Reusable common modal using app-* classes and FA icons */
function AppFormModal({
  title,
  initial,
  onCancel,
  onSubmit,
}: {
  title: string;
  initial?: Partial<Omit<University, "id">>;
  onCancel: () => void;
  onSubmit: (payload: Omit<University, "id">) => void;
}) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [contactNumber, setContactNumber] = useState(initial?.contactNumber ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ code, name, address, contactNumber, email });
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
              <span className="app-label">University ID</span>
              <input className="app-input" value={code} onChange={(e) => setCode(e.target.value)} required />
            </label>

            <label className="app-field">
              <span className="app-label">Name</span>
              <input className="app-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>

            <label className="app-field app-grid--2">
              <span className="app-label">Address</span>
              <input className="app-input" value={address} onChange={(e) => setAddress(e.target.value)} />
            </label>

            <label className="app-field">
              <span className="app-label">Contact number</span>
              <input className="app-input" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
            </label>

            <label className="app-field">
              <span className="app-label">Email</span>
              <input className="app-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
