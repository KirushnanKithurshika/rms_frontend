// BatchesTable.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../../../services/api";
import { FaSearch, FaPlus, FaTimes, FaSort, FaSortUp, FaSortDown, FaEye } from "react-icons/fa";
import { MdEdit, MdDelete } from "react-icons/md";
import "./table.css";

export type Batch = {
  id: number;
  name: string;
  startYear: number;
  durationYears: number;
  facultyId: number;
  facultyName: string;
};

type SortKey = keyof Pick<Batch, "name" | "startYear" | "durationYears" | "facultyName">;

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

export default function BatchesTable() {
  const [rows, setRows] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);

  const [sortBy, setSortBy] = useState<SortKey | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  // view/edit/delete state
  const [viewing, setViewing] = useState<any>(null);
  const [viewingError, setViewingError] = useState<string | null>(null);
  const viewDrag = useDraggable();
  const viewModalRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = viewModalRef.current;
    if (!el) return;
    el.style.setProperty('--drag-x', `${viewDrag.pos.x}px`);
    el.style.setProperty('--drag-y', `${viewDrag.pos.y}px`);
  }, [viewDrag.pos.x, viewDrag.pos.y]);

  const [editing, setEditing] = useState<Batch | null>(null);
  const [editingError, setEditingError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [creating, setCreating] = useState(false);
  const [creatingError, setCreatingError] = useState<string | null>(null);
  const [savingCreate, setSavingCreate] = useState(false);

  const [showDelete, setShowDelete] = useState(false);
  const [toDelete, setToDelete] = useState<Batch | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Faculties for dropdowns (match Department page behavior)
  const [faculties, setFaculties] = useState<Array<{ id: number; name: string; code?: string; universityCode?: string }>>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/faculties`).catch(() => null as any);
        const list = Array.isArray(res?.data?.data)
          ? res!.data.data
          : (Array.isArray(res?.data) ? res!.data : []);
        setFaculties(
          list.map((f: any) => ({
            id: f.id ?? f.facultyId,
            name: f.name ?? f.facultyName,
            code: f.code ?? f.shortName,
            universityCode: f.universityCode,
          }))
        );
      } catch {
        setFaculties([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/v1/batches/GetAll`);
        const arr = Array.isArray(res?.data?.data) ? res.data.data : (Array.isArray(res?.data) ? res.data : []);
        const mapped: Batch[] = (arr as any[]).map((b: any) => ({
          id: b.id,
          name: b.name,
          startYear: b.startYear,
          durationYears: b.durationYears,
          facultyId: b.facultyId,
          facultyName: b.facultyName,
        }));
        setRows(mapped.slice().sort((a, b) => a.id - b.id));
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    const f = t
      ? rows.filter((r) => [r.name, r.startYear, r.durationYears, r.facultyName]
          .filter((v) => v !== undefined && v !== null)
          .some((v) => String(v).toLowerCase().includes(t)))
      : rows;

    if (!sortBy) return f;

    const s = [...f].sort((a, b) => {
      const av = a[sortBy] as any;
      const bv = b[sortBy] as any;
      if (typeof av === "number" && typeof bv === "number") {
        return sortAsc ? av - bv : bv - av;
      }
      const as = String(av ?? "").toLowerCase();
      const bs = String(bv ?? "").toLowerCase();
      if (as < bs) return sortAsc ? -1 : 1;
      if (as > bs) return sortAsc ? 1 : -1;
      return 0;
    });
    return s;
  }, [rows, q, sortBy, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (key === sortBy) setSortAsc((v) => !v);
    else { setSortBy(key); setSortAsc(true); }
  };

  const sortIcon = (key: SortKey) => (sortBy !== key ? <FaSort /> : sortAsc ? <FaSortUp /> : <FaSortDown />);

  // View details
  const handleView = async (id: number) => {
    setViewingError(null);
    try {
      const res = await api.get(`/v1/batches/GetById/${id}`);
      const data = res?.data?.data ?? res?.data;
      if (data) { setViewing(data); return; }
      throw new Error("Empty response");
    } catch (e: any) {
      const local = rows.find((x) => x.id === id) || null;
      if (local) setViewing(local);
      const d = e?.response?.data;
      const msg = (d?.message || (Array.isArray(d?.errors) ? d.errors.join(", ") : undefined) || d?.error || e?.message || "An unexpected error occurred");
      setViewingError(String(msg));
    }
  };

  // Edit
  const handleOpenEdit = async (id: number) => {
    setEditingError(null);
    try {
      const res = await api.get(`/v1/batches/GetById/${id}`);
      const b = res?.data?.data ?? res?.data;
      if (b) {
        setEditing({ id: b.id, name: b.name, startYear: b.startYear, durationYears: b.durationYears, facultyId: b.facultyId, facultyName: b.facultyName });
        return;
      }
      throw new Error("Empty response");
    } catch (e: any) {
      const local = rows.find((x) => x.id === id) || null;
      if (local) setEditing(local);
      const d = e?.response?.data;
      const msg = (d?.message || (Array.isArray(d?.errors) ? d.errors.join(", ") : undefined) || d?.error || e?.message || "An unexpected error occurred");
      setEditingError(String(msg));
    }
  };

  const handleUpdate = async (id: number, payload: Omit<Batch, "id">) => {
    setEditingError(null);
    setSavingEdit(true);
    const body = { name: payload.name.trim(), startYear: Number(payload.startYear), durationYears: Number(payload.durationYears), facultyId: Number(payload.facultyId) };
    try {
      const res = await api.put(`/v1/batches/Update/${id}`, body);
      const d = res?.data?.data ?? res?.data;
      if (res && res.status >= 200 && res.status < 300) {
        if (d) {
          const mapped: Batch = { id: d.id, name: d.name, startYear: d.startYear, durationYears: d.durationYears, facultyId: d.facultyId, facultyName: d.facultyName };
          setRows((prev) => prev.map((x) => (x.id === id ? mapped : x)).slice().sort((a, b) => a.id - b.id));
        }
        setEditing(null);
      }
    } catch (e: any) {
      const data = e?.response?.data;
      const msg = (data?.message || (Array.isArray(data?.errors) ? data.errors.join(", ") : undefined) || data?.error || e?.message || "An unexpected error occurred");
      setEditingError(String(msg));
    } finally {
      setSavingEdit(false);
    }
  };

  
  const handleCreate = async (payload: Omit<Batch, 'id' | 'facultyName'>) => {
    setCreatingError(null);
    setSavingCreate(true);
    const body = { name: String(payload.name).trim(), startYear: Number(payload.startYear), durationYears: Number(payload.durationYears), facultyId: Number(payload.facultyId) };
    try {
      const res = await api.post(`/v1/batches/Create`, body);
      const d = res?.data?.data ?? res?.data;
      if (res && res.status >= 200 && res.status < 300 && d) {
        const mapped: Batch = { id: d.id, name: d.name, startYear: d.startYear, durationYears: d.durationYears, facultyId: d.facultyId, facultyName: d.facultyName };
        setRows((prev) => prev.concat(mapped).slice().sort((a, b) => a.id - b.id));
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
// Delete
  const askDelete = (b: Batch) => { setToDelete(b); setDeleteError(null); setShowDelete(true); };
  const closeDelete = () => { setShowDelete(false); setToDelete(null); };
  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await api.delete(`/v1/batches/Delete/${toDelete.id}`);
      if (res && res.status >= 200 && res.status < 300) {
        setRows((prev) => prev.filter((x) => x.id !== toDelete.id));
        closeDelete();
      }
    } catch (e: any) {
      const data = e?.response?.data;
      const msg = (data?.message || (Array.isArray(data?.errors) ? data.errors.join(", ") : undefined) || data?.error || e?.message || "An unexpected error occurred");
      setDeleteError(String(msg));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Top toolbar (theme-consistent) */}
      <div className="user-management-header">
        <div className="custom-searchbar">
          <input
            ref={searchRef}
            type="text"
            placeholder="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            type="button"
            className="icon-btn search-btn-floating"
            aria-label="Search"
            title="Search"
            onClick={() => {
              const val = searchRef.current?.value ?? "";
              setQ(val.trim());
              searchRef.current?.focus();
            }}
          >
            <FaSearch className="search-icon" />
          </button>
        </div>
        <div className="filters">         <button className="add-user-btn" onClick={() => setCreating(true)}> <FaPlus className="icon-left-gap" />Add Batch</button>     </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Id</th>
              <th onClick={() => toggleSort("name")}>Batch name {sortIcon("name")}</th>
              <th onClick={() => toggleSort("startYear")}>Start year {sortIcon("startYear" as any)}</th>
              <th onClick={() => toggleSort("durationYears")}>duration year {sortIcon("durationYears" as any)}</th>
              <th onClick={() => toggleSort("facultyName")}>faculty name {sortIcon("facultyName" as any)}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6}>Loading...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6}>No data</td></tr>
            )}
            {!loading && filtered.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.name}</td>
                <td>{b.startYear}</td>
                <td>{b.durationYears}</td>
                <td>
                  {(() => {
                    const f = faculties.find(x => x.id === (b.facultyId ?? 0));
                    const uni = (f as any)?.universityCode ?? '';
                    const name = f?.name ?? b.facultyName ?? '';
                    const out = [uni, name].filter(Boolean).join(' ').trim();
                    return out || '-';
                  })()}
                </td>
                <td className="actions">
                  <button className="icon-btn" title="View" onClick={() => handleView(b.id)}>
                    <FaEye className="icon view-icon" />
                  </button>
                  <button className="icon-btn" title="Edit" onClick={() => handleOpenEdit(b.id)}>
                    <MdEdit className="icon edit-icon" />
                  </button>
                  <button className="icon-btn" title="Delete" onClick={() => askDelete(b)}>
                    <MdDelete className="icon delete-icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View modal */}
      {viewing && (
        <div className="app-modal-backdrop" role="dialog" aria-modal="true">
          <div className="app-modal app-modal--draggable" onClick={(e) => e.stopPropagation()} ref={viewModalRef}>
            <div className="app-modal__header is-draggable" onMouseDown={viewDrag.onMouseDown}>
              <h3 className="app-modal__title">Batch Details</h3>
              <button type="button" className="app-modal__close" onClick={() => setViewing(null)} aria-label="Close" title="Close">
                <FaTimes />
              </button>
            </div>
            <div className="app-form app-form--tight">
              {viewingError && (
                <div className="app-error">{viewingError}</div>
              )}
              <div className="app-grid">
                <div className="app-field"><span className="app-label">Id</span><div className="app-input app-input--readonly">{String(viewing.id)}</div></div>
                <div className="app-field app-grid--2"><span className="app-label">Batch name</span><div className="app-input app-input--readonly">{viewing.name}</div></div>
                <div className="app-field"><span className="app-label">Start year</span><div className="app-input app-input--readonly">{viewing.startYear}</div></div>
                <div className="app-field"><span className="app-label">duration year</span><div className="app-input app-input--readonly">{viewing.durationYears}</div></div>
                <div className="app-field"><span className="app-label">faculty name</span><div className="app-input app-input--readonly">{viewing.facultyName}</div></div>
              </div>
              <div className="app-modal__actions">
                <button type="button" className="app-btn app-btn--primary" onClick={() => setViewing(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <BatchFormModal
          title="Edit Batch"
          initial={{ name: editing.name, startYear: editing.startYear, durationYears: editing.durationYears, facultyId: editing.facultyId }}
          onCancel={() => setEditing(null)}
          onSubmit={(payload) => handleUpdate(editing.id, payload as any)}
          error={editingError ?? undefined}
          saving={savingEdit}
          faculties={faculties}
        />
      )}

            {creating && (
        <BatchFormModal
          title="Add Batch"
          onCancel={() => setCreating(false)}
          onSubmit={(payload) => handleCreate(payload as any)}
          error={creatingError ?? undefined}
          saving={savingCreate}
          faculties={faculties}
        />
      )}

      {/* Delete confirmation */}
      {showDelete && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <div className="modal" role="document" onClick={(e) => e.stopPropagation()} tabIndex={-1}>
            <div className="modal-header">
              <h4 id="delete-title">Delete Batch</h4>
              <button className="close-btn" aria-label="Close" onClick={closeDelete}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-body">
                {toDelete ? (<>Are you sure you want to delete <strong>{toDelete.name}</strong>?</>) : ("Are you sure you want to delete this batch?")}
              </p>
              {deleteError && (<div className="app-error">{deleteError}</div>)}
            </div>
            <div className="modal-footer">
              <button className="btn-delete danger" onClick={confirmDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</button>
              <button className="btn-delete ghost" onClick={closeDelete} disabled={deleting}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BatchFormModal({ title, initial, onCancel, onSubmit, error, saving, faculties }: {
  title: string;
  initial?: Partial<Batch>;
  onCancel: () => void;
  onSubmit: (payload: Omit<Batch, 'id' | 'facultyName'>) => void;
  error?: string;
  saving?: boolean;
  faculties: Array<{ id: number; name: string; code?: string; universityCode?: string }>;
}) {
  const drag = useDraggable();
  const modalRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    el.style.setProperty('--drag-x', `${drag.pos.x}px`);
    el.style.setProperty('--drag-y', `${drag.pos.y}px`);
  }, [drag.pos.x, drag.pos.y]);
  const [name, setName] = useState(initial?.name ?? "");
  const [startYear, setStartYear] = useState<number | "">(initial?.startYear ?? "");
  const [durationYears, setDurationYears] = useState<number | "">(initial?.durationYears ?? "");
  const [facultyId, setFacultyId] = useState<number | "">(
    (initial?.facultyId as number | undefined) ?? (faculties.length ? faculties[0].id : ("" as any))
  );

  // When faculties load and no initial provided, pick first by default
  useEffect(() => {
    if ((initial?.facultyId == null || initial?.facultyId === undefined) && faculties.length && (facultyId === "" || facultyId == null)) {
      setFacultyId(faculties[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faculties]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name: String(name).trim(), startYear: Number(startYear), durationYears: Number(durationYears), facultyId: Number(facultyId) } as any);
  };

  return (
    <div className="app-modal-backdrop" role="dialog" aria-modal="true">
      <div className="app-modal app-modal--draggable" onClick={(e) => e.stopPropagation()} ref={modalRef}>
        <div className="app-modal__header is-draggable" onMouseDown={drag.onMouseDown}>
          <h3 className="app-modal__title">{title}</h3>
          <button type="button" className="app-modal__close" onClick={onCancel} aria-label="Close" title="Close">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={submit} className="app-form">
          {error && (<div className="app-error">{error}</div>)}
          <div className="app-grid">
            <label className="app-field">
              <span className="app-label">Batch name</span>
              <input className="app-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="app-field">
              <span className="app-label">Start year</span>
              <input className="app-input" type="number" value={startYear as number | ""} onChange={(e) => setStartYear(e.target.value === "" ? "" : Number(e.target.value))} required />
            </label>
            <label className="app-field">
              <span className="app-label">duration year</span>
              <input className="app-input" type="number" value={durationYears as number | ""} onChange={(e) => setDurationYears(e.target.value === "" ? "" : Number(e.target.value))} required />
            </label>
            <label className="app-field">
              <span className="app-label">Faculty</span>
              <select
                className="app-input"
                value={facultyId as number | ""}
                onChange={(e) => setFacultyId(e.target.value === "" ? "" : Number(e.target.value))}
                required
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
            <button type="submit" className="app-btn app-btn--primary" disabled={!!saving}>{saving ? 'Saving...' : 'Save'}</button>
            <button type="button" className="app-btn" onClick={onCancel} disabled={!!saving}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}





