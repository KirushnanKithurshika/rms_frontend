// DepartmentTable.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../../../services/api";
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
import "./table.css"; // reuse same classes from your tables

type Department = {
  id: number;
  code: string;             // e.g., "ENG-CE"
  name: string;             // e.g., "Department of Civil Engineering"
  // New API-compatible fields
  departmentName?: string;
  specializationTitle?: string;
  facultyId?: number;
  facultyName?: string;
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

type SortKey = keyof Pick<Department, "code" | "departmentName" | "specializationTitle" | "facultyId" | "facultyName">;

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

export default function DepartmentTable() {
  const [rows, setRows] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("code");
  const [sortAsc, setSortAsc] = useState(true);
  const [sortingEnabled, setSortingEnabled] = useState(false);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [editing, setEditing] = useState<Department | null>(null);
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<Department | null>(null);
  const [viewData, setViewData] = useState<Department | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);
  const viewDrag = useDraggable();
  const [creatingError, setCreatingError] = useState<string | null>(null);
  const [savingCreate, setSavingCreate] = useState(false);
  const [editingError, setEditingError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [faculties, setFaculties] = useState<Array<{ id: number; name: string; code?: string; universityCode?: string }>>([]);
  const [deletingDept, setDeletingDept] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Load faculties for select (component scope)
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/faculties`).catch(() => null as any);
        const list = Array.isArray(res?.data?.data)
          ? res!.data.data
          : (Array.isArray(res?.data) ? res!.data : []);
        setFaculties(list.map((f: any) => ({ id: f.id ?? f.facultyId, name: f.name ?? f.facultyName, code: f.code ?? f.shortName, universityCode: f.universityCode })));
      } catch {
        setFaculties([]);
      }
    })();
  }, []);

  
  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/v1/departments/GetAll`).catch(() => null as any);
        if (res && Array.isArray(res?.data?.data)) {
          const list = res.data.data;
          const mapped: Department[] = list.map((d: any) => ({
            id: d.departmentId ?? d.id,
            code: d.code ?? d.departmentCode ?? d.code,
            // keep both for compatibility
            name: d.departmentName ?? d.name,
            departmentName: d.departmentName ?? d.name,
            specializationTitle: d.specializationTitle,
            facultyId: d.facultyId,
            facultyName: d.facultyName,
            facultyCode: d.facultyName ?? d.facultyCode,
          }));
          const ordered = mapped.slice().sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
          setRows(ordered);
        } else {
          setRows(SAMPLE_DEPARTMENTS);
        }
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
          [r.code, r.departmentName ?? r.name, r.specializationTitle, r.facultyId, r.facultyName]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(t))
        )
      : rows;

    if (!sortingEnabled) return f;

    const s = [...f].sort((a, b) => {
      const av = (a[sortBy] ?? "").toString().toLowerCase();
      const bv = (b[sortBy] ?? "").toString().toLowerCase();
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });

    return s;
  }, [rows, q, sortBy, sortAsc, sortingEnabled]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const view = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: SortKey) => {
    setSortingEnabled(true);
    if (key === sortBy) setSortAsc((v) => !v);
    else {
      setSortBy(key);
      setSortAsc(true);
    }
  };

  const sortIcon = (key: SortKey) =>
    !sortingEnabled ? <FaSort /> : sortBy !== key ? <FaSort /> : sortAsc ? <FaSortUp /> : <FaSortDown />;

  // Open/close view modal with backend fetch
  const openView = async (d: Department) => {
    setViewing(d);
    setViewData(null);
    setViewLoading(true);
    setViewError(null);
    try {
      const res = await api.get(`/v1/departments/GetById/${d.id}`);
      const dd = res?.data?.data ?? res?.data;
      if (dd) {
        const mapped: Department = {
          id: dd.departmentId ?? d.id,
          code: dd.code ?? d.code,
          name: dd.departmentName ?? d.name,
          departmentName: dd.departmentName ?? d.name,
          specializationTitle: dd.specializationTitle,
          facultyId: dd.facultyId,
          facultyName: dd.facultyName,
        };
        setViewData(mapped);
      }
    } catch (e: any) {
      const data = e?.response?.data;
      const arrayErrors = Array.isArray(data?.errors) ? data.errors.join(', ') : undefined;
      const objectErrors = data?.errors && typeof data.errors === 'object'
        ? Object.values(data.errors as any).flat().map(String).join(', ')
        : undefined;
      const msg = data?.message || arrayErrors || objectErrors || data?.error || e?.message || 'An unexpected error occurred';
      setViewError(String(msg));
      setViewData(d);
    } finally {
      setViewLoading(false);
    }
  };

  const closeView = () => {
    setViewing(null);
    setViewData(null);
    setViewLoading(false);
  };

  // Delete modal handlers
  const askDelete = (d: Department) => {
    setDeptToDelete(d);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeptToDelete(null);
  };

  const confirmDelete = async () => {
    if (!deptToDelete) return;
    setDeleteError(null);
    setDeletingDept(true);
    const id = deptToDelete.id;
    try {
      await api.delete(`/v1/departments/Delete/${id}`);
    } catch (e1: any) {
      try {
        await api.delete(`/departments/${id}`);
      } catch (e2: any) {
        const data = e2?.response?.data ?? e1?.response?.data;
        const msg = (data?.message
          || (Array.isArray(data?.errors) ? data.errors.join(', ') : undefined)
          || data?.error
          || e2?.message
          || e1?.message
          || 'Failed to delete department');
        setDeleteError(String(msg));
        setDeletingDept(false);
        return;
      }
    }
    setRows((r) => r.filter((x) => x.id !== id));
    setDeletingDept(false);
    closeDeleteModal();
  };

  const handleCreate = async (payload: { departmentCode: string; departmentName: string; specializationTitle?: string; facultyId: number; }) => {
    setCreatingError(null);
    setSavingCreate(true);
    const body = {
      departmentCode: payload.departmentCode.trim(),
      departmentName: payload.departmentName.trim(),
      specializationTitle: payload.specializationTitle?.trim() || undefined,
      facultyId: Number(payload.facultyId),
    };
    try {
      const res = await api.post(`/v1/departments/Create`, body);
      const d = res?.data?.data ?? res?.data;
      if (d) {
        const row: Department = {
          id: d.departmentId ?? d.id,
          code: d.code ?? body.departmentCode,
          name: d.departmentName ?? body.departmentName,
          specializationTitle: d.specializationTitle,
          facultyId: d.facultyId ?? body.facultyId,
          facultyName: d.facultyName,
          facultyCode: d.facultyName,
        };
        setRows((r) => {
          const next = [...r, row];
          const totalPages = Math.max(1, Math.ceil(next.length / pageSize));
          setPage(totalPages);
          return next;
        });
        setCreating(false);
      }
    } catch (e: any) {
      const data = e?.response?.data;
      const msg = (data?.message || (Array.isArray(data?.errors) ? data.errors.join(', ') : undefined) || data?.error || e?.message || 'An unexpected error occurred');
      setCreatingError(String(msg));
    } finally {
      setSavingCreate(false);
    }
  };

  const handleUpdate = async (id: number, payload: { departmentCode: string; departmentName: string; specializationTitle?: string; facultyId: number; }) => {
    setEditingError(null);
    setSavingEdit(true);
    const body = {
      departmentCode: payload.departmentCode.trim(),
      departmentName: payload.departmentName.trim(),
      specializationTitle: payload.specializationTitle?.trim() || undefined,
      facultyId: Number(payload.facultyId),
    };
    try {
      const res = await api.put(`/v1/departments/Update/${id}`, body);
      const d = res?.data?.data ?? res?.data;
      if (d) {
        const row: Department = {
          id: d.departmentId ?? id,
          code: d.code ?? body.departmentCode,
          name: d.departmentName ?? body.departmentName,
          specializationTitle: d.specializationTitle,
          facultyId: d.facultyId ?? body.facultyId,
          facultyName: d.facultyName,
          facultyCode: d.facultyName,
        };
        setRows((r) => r.map((x) => (x.id === id ? row : x)).slice().sort((a, b) => (a.id ?? 0) - (b.id ?? 0)));
        setEditing(null);
      }
    } catch (e: any) {
      const data = e?.response?.data;
      const msg = (data?.message || (Array.isArray(data?.errors) ? data.errors.join(', ') : undefined) || data?.error || e?.message || 'An unexpected error occurred');
      setEditingError(String(msg));
    } finally {
      setSavingEdit(false);
    }
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
              <th>departmentId</th>
              <th onClick={() => toggleSort("code")}>
                code {sortIcon("code")}
              </th>
              <th onClick={() => toggleSort("departmentName")}>
                departmentName {sortIcon("departmentName")}
              </th>
              <th onClick={() => toggleSort("specializationTitle")}>
                specializationTitle {sortIcon("specializationTitle")}
              </th>
              <th onClick={() => toggleSort("facultyId")}>
                facultyId {sortIcon("facultyId")}
              </th>
              <th onClick={() => toggleSort("facultyName")}>
                facultyName {sortIcon("facultyName")}
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

            {!loading && view.map((d, i) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.code}</td>
                <td>{d.departmentName ?? d.name}</td>
                <td>{d.specializationTitle || "-"}</td>
                <td>{d.facultyId ?? "-"}</td>                

                <td>
                  {(() => {
                    const f = faculties.find(x => x.id === (d.facultyId ?? 0));
                    const uniCode =
                      (f as any)?.universityCode ??
                      (f as any)?.university?.code ??
                      (d as any)?.universityCode ??
                      (d as any)?.university?.code ??
                      "";
                    const facName = f?.name ?? d.facultyName ?? "";

                    // first: universityCode, then faculty name
                    const out = [uniCode, facName].filter(Boolean).join(" ");
                    return out || "-";
                  })()}
                </td>

                <td className="actions">
                  <button className="icon-btn" title="View" onClick={() => openView(d)}>
                    <FaEye className="icon view-icon" />
                  </button>
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
          faculties={faculties}
          onCancel={() => setCreating(false)}
          onSubmit={(payload) => handleCreate(payload)}
          error={creatingError ?? undefined}
          saving={savingCreate}
        />
      )}

      {/* Edit modal */}
      {editing && (
        <AppFormModal
          title="Edit Department"
          initial={{
            departmentCode: editing.code,
            departmentName: editing.departmentName ?? editing.name,
            specializationTitle: editing.specializationTitle,
            facultyId: editing.facultyId,
          }}
          faculties={faculties}
          onCancel={() => setEditing(null)}
          onSubmit={(payload) => handleUpdate(editing.id, payload)}
          error={editingError ?? undefined}
          saving={savingEdit}
        />
      )}

      {viewing && (
        <div className="app-modal-backdrop" role="dialog" aria-modal="true">
          <div
            className="app-modal"
            style={{ transform: `translate(${viewDrag.pos.x}px, ${viewDrag.pos.y}px)` }}
          >
            <div className="app-modal__header" onMouseDown={viewDrag.onMouseDown} style={{ cursor: 'move' }}>
              <h3 className="app-modal__title">Department Details</h3>
              <button type="button" className="app-modal__close" onClick={closeView} aria-label="Close" title="Close">
                <FaTimes />
              </button>
            </div>
            <div className="app-form" style={{ paddingTop: 0 }}>
              {viewError && (
                <div style={{ color: '#b91c1c', marginBottom: 8 }}>{viewError}</div>
              )}
              <div className="app-grid">
                <div className="app-field"><span className="app-label">departmentId</span><div className="app-input" style={{background:'#f8fafc'}}>{(viewData?.id ?? viewing.id) || '-'}</div></div>
                <div className="app-field"><span className="app-label">code</span><div className="app-input" style={{background:'#f8fafc'}}>{(viewData?.code ?? viewing.code) || '-'}</div></div>
                <div className="app-field"><span className="app-label">departmentName</span><div className="app-input" style={{background:'#f8fafc'}}>{(viewData?.departmentName ?? viewData?.name ?? viewing.departmentName ?? viewing.name) || '-'}</div></div>
                <div className="app-field"><span className="app-label">specializationTitle</span><div className="app-input" style={{background:'#f8fafc'}}>{(viewData?.specializationTitle ?? viewing.specializationTitle) || '-'}</div></div>
                <div className="app-field"><span className="app-label">facultyId</span><div className="app-input" style={{background:'#f8fafc'}}>{(viewData?.facultyId ?? viewing.facultyId) ?? '-'}</div></div>
                <div className="app-field"><span className="app-label">facultyName</span><div className="app-input" style={{background:'#f8fafc'}}>{(() => {
                  const fid = (viewData?.facultyId ?? viewing.facultyId) as number | undefined;
                  const f = faculties.find(x => x.id === (fid ?? 0));
                  if (f) {
                    const uni = (f as any).universityCode || '';
                    const name = f.name || '';
                    const label = [uni, name].filter(Boolean).join(' ').trim();
                    return label || '-';
                  }
                  return (viewData?.facultyName ?? viewing.facultyName) || '-';
                })()}</div></div>
              </div>
              <div className="app-modal__actions">
                <button type="button" className="app-btn app-btn--primary" onClick={closeView}>Close</button>
              </div>
            </div>
          </div>
        </div>
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
            {deleteError && (
              <div style={{ color: '#b91c1c' }}>{deleteError}</div>
            )}
            </div>
            <div className="modal-footer">
              <button className="btn-delete danger" onClick={confirmDelete} disabled={deletingDept}>
                {deletingDept ? 'Deleting...' : 'Delete'}
              </button>
              <button className="btn-delete ghost" onClick={closeDeleteModal} disabled={deletingDept}>
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
  faculties,
  error,
  saving,
  onCancel,
  onSubmit,
}: {
  title: string;
  initial?: Partial<{ departmentCode: string; departmentName: string; specializationTitle?: string; facultyId: number }>;
  faculties: Array<{ id: number; name: string; code?: string; universityCode?: string }>;
  error?: string;
  saving?: boolean;
  onCancel: () => void;
  onSubmit: (payload: { departmentCode: string; departmentName: string; specializationTitle?: string; facultyId: number }) => void;
}) {
  const drag = useDraggable();
  const [departmentCode, setDepartmentCode] = useState(initial?.departmentCode ?? "");
  const [departmentName, setDepartmentName] = useState(initial?.departmentName ?? "");
  const [specializationTitle, setSpecializationTitle] = useState(initial?.specializationTitle ?? "");
  const [facultyId, setFacultyId] = useState<number>(
    initial?.facultyId ?? (faculties.length ? faculties[0].id : (undefined as unknown as number))
  );

  useEffect(() => {
    if (!initial?.facultyId && faculties.length) {
      setFacultyId(faculties[0].id);
    }
  }, [faculties]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      departmentCode: departmentCode.trim(),
      departmentName: departmentName.trim(),
      specializationTitle: specializationTitle.trim() ? specializationTitle.trim() : undefined,
      facultyId: Number(facultyId),
    });
  };

  // Prevent closing via Esc; only the close button closes

  return (
    <div className="app-modal-backdrop" role="dialog" aria-modal="true">
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

        {error && (
          <div className="app-form" style={{ paddingTop: 0 }}>
            <div style={{
              background: '#fff1f2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: '10px 12px',
              margin: '8px 12px',
            }}>
              {error}
            </div>
          </div>
        )}

        <form onSubmit={submit} className="app-form">
          <div className="app-grid">
            <label className="app-field">
              <span className="app-label">Department Code</span>
              <input
                className="app-input"
                value={departmentCode}
                onChange={(e) => setDepartmentCode(e.target.value)}
                required
              />
            </label>

            <label className="app-field">
              <span className="app-label">Department Name</span>
              <input
                className="app-input"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                required
              />
            </label>

            <label className="app-field">
              <span className="app-label">Specialization Title (optional)</span>
              <input
                className="app-input"
                value={specializationTitle}
                onChange={(e) => setSpecializationTitle(e.target.value)}
                placeholder="e.g., Software Engineering"
              />
            </label>

            <label className="app-field">
              <span className="app-label">Faculty</span>
              <select
                className="app-input"
                value={facultyId ?? ''}
                onChange={(e) => setFacultyId(Number(e.target.value))}
              >
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {`${(f.universityCode ?? '').toString().trim()} ${((f.name ?? '') || '').toString().trim()}`.trim() || (f.name || f.code || `Faculty #${f.id}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="app-modal__actions">
            <button type="submit" className="app-btn app-btn--primary" disabled={!!saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="app-btn" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
