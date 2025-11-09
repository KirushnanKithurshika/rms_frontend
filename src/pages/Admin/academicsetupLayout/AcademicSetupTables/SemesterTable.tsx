// SemesterTable.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  FaSearch,
  FaPlus,
  FaTimes,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaEye,
} from "react-icons/fa";
import { MdEdit, MdDelete } from "react-icons/md";
import "./table.css"; // reuses the same shared styles/classes

type Semester = {
  id: number;
  code: string;            // e.g., "Y1S1"
  name: string;            // e.g., "Semester 1"
  academicYear: string;    // e.g., "2025/2026"
  startDate: string;       // ISO or display string
  endDate: string;         // ISO or display string
  status?: "Upcoming" | "Active" | "Completed";
  coordinator?: string;
};

const SAMPLE_SEMESTERS: Semester[] = [
  { id: 1, code: "Y1S1", name: "Semester 1", academicYear: "2025/2026", startDate: "2025-08-12", endDate: "2025-12-05", status: "Upcoming", coordinator: "Dr. N. Fernando" },
  { id: 2, code: "Y1S2", name: "Semester 2", academicYear: "2025/2026", startDate: "2026-01-10", endDate: "2026-05-20", status: "Upcoming", coordinator: "Dr. H. Jayawardena" },
  { id: 3, code: "Y2S1", name: "Semester 3", academicYear: "2024/2025", startDate: "2024-08-14", endDate: "2024-12-06", status: "Completed", coordinator: "Dr. S. Gunasekara" },
  { id: 4, code: "Y2S2", name: "Semester 4", academicYear: "2024/2025", startDate: "2025-01-08", endDate: "2025-05-22", status: "Completed", coordinator: "Prof. T. Perera" },
  { id: 5, code: "Y3S1", name: "Semester 5", academicYear: "2025/2026", startDate: "2025-08-12", endDate: "2025-12-05", status: "Upcoming", coordinator: "Dr. R. Wijesinghe" },
];

type SortKey = keyof Pick<
  Semester,
  "code" | "name" | "academicYear" | "startDate" | "endDate" | "status" | "coordinator"
>;

function useDraggable() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const origin = useRef({ x: 0, y: 0 });
  const start = useRef({ x: 0, y: 0 });
  const onMouseMove = (e: MouseEvent) => {
    const dx = e.clientX - origin.current.x;
    const dy = e.clientY - origin.current.y;
    setPos({ x: start.current.x + dx, y: start.current.y + dy });
  };
  const onMouseUp = () => {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };
  const onMouseDown = (e: any) => {
    origin.current = { x: e.clientX, y: e.clientY };
    start.current = pos;
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };
  useEffect(() => () => {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }, []);
  return { pos, onMouseDown };
}

export default function SemesterTable() {
  const [rows, setRows] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("code");
  const [sortAsc, setSortAsc] = useState(true);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [editing, setEditing] = useState<Semester | null>(null);
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<Semester | null>(null);
  const viewDrag = useDraggable();

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [semesterToDelete, setSemesterToDelete] = useState<Semester | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.get<Semester[]>("/api/semesters");
        setRows(Array.isArray(data) && data.length ? data : SAMPLE_SEMESTERS);
      } catch {
        setRows(SAMPLE_SEMESTERS);
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
            r.academicYear,
            r.startDate,
            r.endDate,
            r.status,
            r.coordinator,
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
  const askDelete = (s: Semester) => {
    setSemesterToDelete(s);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSemesterToDelete(null);
  };

  const confirmDelete = async () => {
    if (!semesterToDelete) return;
    try {
      await axios.delete(`/api/semesters/${semesterToDelete.id}`);
    } catch {
      return; // optionally toast error
    }
    setRows((r) => r.filter((x) => x.id !== semesterToDelete.id));
    closeDeleteModal();
  };

  const handleCreate = async (payload: Omit<Semester, "id">) => {
    const { data } = await axios.post<Semester>("/api/semesters", payload);
    setRows((r) => [data, ...r]);
    setCreating(false);
  };

  const handleUpdate = async (id: number, payload: Omit<Semester, "id">) => {
    const { data } = await axios.put<Semester>(`/api/semesters/${id}`, payload);
    setRows((r) => r.map((x) => (x.id === id ? data : x)));
    setEditing(null);
  };

  useEffect(() => {
    setPage(1);
  }, [q]);

  return (
    <div>
      {/* Toolbar (reusing your common classes) */}
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
            Add Semester
          </button>
        </div>
      </div>

      {/* Table (reusing classes) */}
      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Id</th>
              <th onClick={() => toggleSort("code")}>
                Semester ID {sortIcon("code")}
              </th>
              <th onClick={() => toggleSort("name")}>
                Name {sortIcon("name")}
              </th>
              <th onClick={() => toggleSort("academicYear")}>
                Academic Year {sortIcon("academicYear")}
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
              <th onClick={() => toggleSort("coordinator")}>
                Coordinator {sortIcon("coordinator")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={9}>Loading…</td>
              </tr>
            )}

            {!loading && view.length === 0 && (
              <tr>
                <td colSpan={9}>No data</td>
              </tr>
            )}

            {!loading &&
              view.map((s, i) => (
                <tr key={s.id}>
                  <td>{(page - 1) * pageSize + i + 1}</td>
                  <td>{s.code}</td>
                  <td>{s.name}</td>
                  <td>{s.academicYear}</td>
                  <td>{s.startDate}</td>
                  <td>{s.endDate}</td>
                  <td>{s.status || "-"}</td>
                  <td>{s.coordinator || "-"}</td>
                  <td className="actions">
                    <button className="icon-btn" title="View" onClick={() => setViewing(s)}>
                      <FaEye className="icon view-icon" />
                    </button>
                    <button className="icon-btn" title="Edit" onClick={() => setEditing(s)}>
                      <MdEdit className="icon edit-icon" />
                    </button>
                    <button className="icon-btn" title="Delete" onClick={() => askDelete(s)}>
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
          title="Add Semester"
          initial={{}}
          onCancel={() => setCreating(false)}
          onSubmit={(payload) => handleCreate(payload)}
        />
      )}

      {/* Edit modal */}
      {editing && (
        <AppFormModal
          title="Edit Semester"
          initial={editing}
          onCancel={() => setEditing(null)}
          onSubmit={(payload) => handleUpdate(editing.id, payload)}
        />
      )}

      {viewing && (
        <div className="app-modal-backdrop" onClick={() => setViewing(null)} role="dialog" aria-modal="true">
          <div
            className="app-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ transform: `translate(${viewDrag.pos.x}px, ${viewDrag.pos.y}px)` }}
          >
            <div className="app-modal__header" onMouseDown={viewDrag.onMouseDown} style={{ cursor: 'move' }}>
              <h3 className="app-modal__title">Semester Details</h3>
              <button type="button" className="app-modal__close" onClick={() => setViewing(null)} aria-label="Close" title="Close">
                <FaTimes />
              </button>
            </div>
            <div className="app-form" style={{ paddingTop: 0 }}>
              <div className="app-grid">
                <div className="app-field"><span className="app-label">Code</span><div className="app-input" style={{background:'#f8fafc'}}>{viewing.code}</div></div>
                <div className="app-field"><span className="app-label">Name</span><div className="app-input" style={{background:'#f8fafc'}}>{viewing.name}</div></div>
                <div className="app-field"><span className="app-label">Academic Year</span><div className="app-input" style={{background:'#f8fafc'}}>{viewing.academicYear}</div></div>
                <div className="app-field"><span className="app-label">Start Date</span><div className="app-input" style={{background:'#f8fafc'}}>{viewing.startDate}</div></div>
                <div className="app-field"><span className="app-label">End Date</span><div className="app-input" style={{background:'#f8fafc'}}>{viewing.endDate}</div></div>
                <div className="app-field"><span className="app-label">Status</span><div className="app-input" style={{background:'#f8fafc'}}>{viewing.status || '-'}</div></div>
                <div className="app-field app-grid--2"><span className="app-label">Coordinator</span><div className="app-input" style={{background:'#f8fafc'}}>{viewing.coordinator || '-'}</div></div>
              </div>
              <div className="app-modal__actions">
                <button type="button" className="app-btn app-btn--primary" onClick={() => setViewing(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal (uses your common modal classes) */}
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
              <h4 id="delete-title">Delete Semester</h4>
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
                {semesterToDelete ? (
                  <>
                    Are you sure you want to delete{" "}
                    <strong>
                      {semesterToDelete.code} — {semesterToDelete.name}
                    </strong>
                    ?
                  </>
                ) : (
                  "Are you sure you want to delete this semester?"
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
  initial?: Partial<Omit<Semester, "id">>;
  onCancel: () => void;
  onSubmit: (payload: Omit<Semester, "id">) => void;
}) {
  const drag = useDraggable();
  const [code, setCode] = useState(initial?.code ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [academicYear, setAcademicYear] = useState(initial?.academicYear ?? "");
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [status, setStatus] = useState<Semester["status"]>(
    initial?.status ?? "Upcoming"
  );
  const [coordinator, setCoordinator] = useState(initial?.coordinator ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      code,
      name,
      academicYear,
      startDate,
      endDate,
      status,
      coordinator,
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
      <div
        className="app-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ transform: `translate(${drag.pos.x}px, ${drag.pos.y}px)` }}
      >
        <div className="app-modal__header" onMouseDown={drag.onMouseDown} style={{ cursor: 'move' }}>
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
              <span className="app-label">Semester ID</span>
              <input
                className="app-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                placeholder="e.g., Y1S1"
              />
            </label>

            <label className="app-field">
              <span className="app-label">Name</span>
              <input
                className="app-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g., Semester 1"
              />
            </label>

            <label className="app-field">
              <span className="app-label">Academic Year</span>
              <input
                className="app-input"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g., 2025/2026"
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
                value={status ?? ""}
                onChange={(e) => setStatus(e.target.value as Semester["status"])}
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </label>

            <label className="app-field app-grid--2">
              <span className="app-label">Coordinator</span>
              <input
                className="app-input"
                value={coordinator}
                onChange={(e) => setCoordinator(e.target.value)}
                placeholder="e.g., Dr. N. Fernando"
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
