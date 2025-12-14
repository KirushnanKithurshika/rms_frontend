// BatchesTable.tsx
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
import "./table.css"; // reuse the same shared classes

type BatchStatus = "Planned" | "Active" | "Archived";

type Batch = {
  id: number;
  code: string;             // e.g., "ENG-2025-01"
  name: string;             // e.g., "Engineering Intake 2025 - Batch 01"
  faculty?: string;         // display name or code, e.g., "ENG-UOR"
  department?: string;      // e.g., "MME"
  intakeYear: number;       // e.g., 2025
  startDate?: string;       // ISO or display string
  endDate?: string;         // ISO or display string
  status?: BatchStatus;     // Planned | Active | Archived
  size?: number;            // number of students (optional)
};

const SAMPLE_BATCHES: Batch[] = [
  {
    id: 1,
    code: "ENG-2025-01",
    name: "Engineering Intake 2025 - Batch 01",
    faculty: "ENG-UOR",
    department: "MME",
    intakeYear: 2025,
    startDate: "2025-08-15",
    endDate: "2029-06-30",
    status: "Planned",
    size: 120,
  },
  {
    id: 2,
    code: "ENG-2024-01",
    name: "Engineering Intake 2024 - Batch 01",
    faculty: "ENG-UOR",
    department: "EEE",
    intakeYear: 2024,
    startDate: "2024-08-14",
    endDate: "2028-06-30",
    status: "Active",
    size: 118,
  },
  {
    id: 3,
    code: "SCI-2023-02",
    name: "Science Intake 2023 - Batch 02",
    faculty: "SCI-UOR",
    department: "Physics",
    intakeYear: 2023,
    startDate: "2023-08-10",
    endDate: "2027-06-30",
    status: "Active",
    size: 95,
  },
  {
    id: 4,
    code: "ENG-2021-01",
    name: "Engineering Intake 2021 - Batch 01",
    faculty: "ENG-UOM",
    department: "CSE",
    intakeYear: 2021,
    startDate: "2021-08-12",
    endDate: "2025-06-30",
    status: "Archived",
    size: 130,
  },
];

type SortKey = keyof Pick<
  Batch,
  "code" | "name" | "faculty" | "department" | "intakeYear" | "startDate" | "endDate" | "status" | "size"
>;

export default function BatchesTable() {
  const [rows, setRows] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("code");
  const [sortAsc, setSortAsc] = useState(true);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [editing, setEditing] = useState<Batch | null>(null);
  const [creating, setCreating] = useState(false);

  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<Batch | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.get<Batch[]>("/api/batches");
        setRows(Array.isArray(data) && data.length ? data : SAMPLE_BATCHES);
      } catch {
        setRows(SAMPLE_BATCHES);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    const f = t
      ? rows.filter((r) =>
          [
            r.code,
            r.name,
            r.faculty,
            r.department,
            r.intakeYear?.toString(),
            r.startDate,
            r.endDate,
            r.status,
            r.size?.toString(),
          ]
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
  const askDelete = (b: Batch) => {
    setBatchToDelete(b);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setBatchToDelete(null);
  };

  const confirmDelete = async () => {
    if (!batchToDelete) return;
    try {
      await axios.delete(`/api/batches/${batchToDelete.id}`);
    } catch {
      return; // optionally toast error
    }
    setRows((r) => r.filter((x) => x.id !== batchToDelete.id));
    closeDeleteModal();
  };

  const handleCreate = async (payload: Omit<Batch, "id">) => {
    const { data } = await axios.post<Batch>("/api/batches", payload);
    setRows((r) => [data, ...r]);
    setCreating(false);
  };

  const handleUpdate = async (id: number, payload: Omit<Batch, "id">) => {
    const { data } = await axios.put<Batch>(`/api/batches/${id}`, payload);
    setRows((r) => r.map((x) => (x.id === id ? data : x)));
    setEditing(null);
  };

  useEffect(() => {
    setPage(1);
  }, [q]);

  return (
    <div>
      {/* Top toolbar (shared classes) */}
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
            Add Batch
          </button>
        </div>
      </div>

      {/* Table (shared classes) */}
      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>#</th>
              <th onClick={() => toggleSort("code")}>
                Batch ID {sortIcon("code")}
              </th>
              <th onClick={() => toggleSort("name")}>
                Name {sortIcon("name")}
              </th>
              <th onClick={() => toggleSort("faculty")}>
                Faculty {sortIcon("faculty")}
              </th>
              <th onClick={() => toggleSort("department")}>
                Department {sortIcon("department")}
              </th>
              <th onClick={() => toggleSort("intakeYear")}>
                Intake Year {sortIcon("intakeYear")}
              </th>
              <th onClick={() => toggleSort("startDate")}>
                Start Date {sortIcon("startDate")}
              </th>
              <th onClick={() => toggleSort("endDate")}>
                End Date {sortIcon("endDate")}
              </th>
              <th onClick={() => toggleSort("status")}>
                Status {sortIcon("status")}
              </th>
              <th onClick={() => toggleSort("size")}>
                Size {sortIcon("size")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={11}>Loading…</td>
              </tr>
            )}

            {!loading && view.length === 0 && (
              <tr>
                <td colSpan={11}>No data</td>
              </tr>
            )}

            {!loading &&
              view.map((b, i) => (
                <tr key={b.id}>
                  <td>{(page - 1) * pageSize + i + 1}</td>
                  <td>{b.code}</td>
                  <td>{b.name}</td>
                  <td>{b.faculty || "-"}</td>
                  <td>{b.department || "-"}</td>
                  <td>{b.intakeYear}</td>
                  <td>{b.startDate || "-"}</td>
                  <td>{b.endDate || "-"}</td>
                  <td>{b.status || "-"}</td>
                  <td>{b.size ?? "-"}</td>
                  <td className="actions">
                    <button
                      className="icon-btn"
                      title="Edit"
                      onClick={() => setEditing(b)}
                    >
                      <MdEdit className="icon edit-icon" />
                    </button>
                    <button
                      className="icon-btn"
                      title="Delete"
                      onClick={() => askDelete(b)}
                    >
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
          title="Add Batch"
          initial={{}}
          onCancel={() => setCreating(false)}
          onSubmit={(payload) => handleCreate(payload)}
        />
      )}

      {/* Edit modal */}
      {editing && (
        <AppFormModal
          title="Edit Batch"
          initial={editing}
          onCancel={() => setEditing(null)}
          onSubmit={(payload) => handleUpdate(editing.id, payload)}
        />
      )}

      {/* Delete confirmation (uses your common modal classes) */}
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
              <h4 id="delete-title">Delete Batch</h4>
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
                {batchToDelete ? (
                  <>
                    Are you sure you want to delete{" "}
                    <strong>
                      {batchToDelete.code} — {batchToDelete.name}
                    </strong>
                    ?
                  </>
                ) : (
                  "Are you sure you want to delete this batch?"
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
  initial?: Partial<Omit<Batch, "id">>;
  onCancel: () => void;
  onSubmit: (payload: Omit<Batch, "id">) => void;
}) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [faculty, setFaculty] = useState(initial?.faculty ?? "");
  const [department, setDepartment] = useState(initial?.department ?? "");
  const [intakeYear, setIntakeYear] = useState<number>(
    initial?.intakeYear ?? new Date().getFullYear()
  );
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [status, setStatus] = useState<BatchStatus>(initial?.status ?? "Planned");
  const [size, setSize] = useState<number | "">(initial?.size ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      code,
      name,
      faculty,
      department,
      intakeYear: Number(intakeYear),
      startDate,
      endDate,
      status,
      size: size === "" ? undefined : Number(size),
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="app-modal-backdrop"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
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
              <span className="app-label">Batch ID</span>
              <input
                className="app-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                placeholder="e.g., ENG-2025-01"
              />
            </label>

            <label className="app-field">
              <span className="app-label">Name</span>
              <input
                className="app-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g., Engineering Intake 2025 - Batch 01"
              />
            </label>

            <label className="app-field">
              <span className="app-label">Faculty</span>
              <input
                className="app-input"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder="e.g., ENG-UOR"
              />
            </label>

            <label className="app-field">
              <span className="app-label">Department</span>
              <input
                className="app-input"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g., MME"
              />
            </label>

            <label className="app-field">
              <span className="app-label">Intake Year</span>
              <input
                className="app-input"
                type="number"
                value={intakeYear}
                onChange={(e) => setIntakeYear(Number(e.target.value))}
                min={1980}
                max={2099}
              />
            </label>

            <label className="app-field">
              <span className="app-label">Start Date</span>
              <input
                className="app-input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>

            <label className="app-field">
              <span className="app-label">End Date</span>
              <input
                className="app-input"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>

            <label className="app-field">
              <span className="app-label">Status</span>
              <select
                className="app-input"
                value={status}
                onChange={(e) => setStatus(e.target.value as BatchStatus)}
              >
                <option value="Planned">Planned</option>
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>
            </label>

            <label className="app-field app-grid--2">
              <span className="app-label">Size</span>
              <input
                className="app-input"
                type="number"
                min={0}
                value={size as number | undefined}
                onChange={(e) =>
                  setSize(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="e.g., 120"
              />
            </label>
          </div>

          <div className="app-modal__actions">
            <button type="submit" className="app-btn app-btn--primary">
              Save
            </button>
            <button type="button" className="app-btn" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
