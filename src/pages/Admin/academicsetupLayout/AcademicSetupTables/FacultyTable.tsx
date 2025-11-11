// FacultyTable.tsx
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
import "./table.css"; // reuses same classes

type Faculty = {
  id: number;
  code: string;
  name: string; // maps to backend facultyName
  dean?: string; // maps to backend degreeTitle
  contactNumber?: string; // maps to backend phone
  email?: string;
  address?: string; // maps to backend website (for table display)
  // details for view modal
  shortName?: string;
  website?: string;
  universityId?: number;
  universityCode?: string;
  universityName?: string;
  active?: boolean;
};

type FacultyCreatePayload = {
  code: string;
  facultyName: string;
  degreeTitle?: string;
  shortName?: string;
  email?: string;
  phone?: string;
  website?: string;
  universityId: number;
  active: boolean;
};

const SAMPLE_FACULTIES: Faculty[] = [
  { id: 1, code: "ENG-UOR", name: "Faculty of Engineering", dean: "Dr. M. Perera", contactNumber: "+94 91 224 5765", email: "eng@uor.ac.lk", address: "Hapugala, Galle 80000" },
  { id: 2, code: "SCI-UOR", name: "Faculty of Science", dean: "Prof. K. Jayasena", contactNumber: "+94 91 224 1111", email: "science@uor.ac.lk", address: "Wellamadama, Matara" },
  { id: 3, code: "ENG-UOM", name: "Faculty of Engineering", dean: "Prof. A. Silva", contactNumber: "+94 11 265 0301", email: "eng@uom.lk", address: "Katubedda, Moratuwa" },
  { id: 4, code: "MED-UOC", name: "Faculty of Medicine", dean: "Prof. R. Fernando", contactNumber: "+94 11 258 1835", email: "med@cmb.ac.lk", address: "Colombo 03" },
  { id: 5, code: "ART-UOJ", name: "Faculty of Arts", dean: "Dr. T. Sutharsan", contactNumber: "+94 21 222 6714", email: "arts@univ.jfn.ac.lk", address: "Thirunelvely, Jaffna" },
];

type SortKey = keyof Pick<Faculty, "code" | "name" | "shortName" | "dean" | "contactNumber" | "email" | "website">;

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

export default function FacultyTable() {
  const [rows, setRows] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [sortBy, setSortBy] = useState<SortKey | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [editing, setEditing] = useState<Faculty | null>(null);
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<Faculty | null>(null);
  const [viewingLoading, setViewingLoading] = useState(false);
  const [viewingError, setViewingError] = useState<string | null>(null);
  const [creatingError, setCreatingError] = useState<string | null>(null);
  const [savingCreate, setSavingCreate] = useState(false);
  const [editingError, setEditingError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [universities, setUniversities] = useState<Array<{ id: number; name: string; code?: string }>>([]);

  // Delete modal state (reusing same class names)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState<Faculty | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // Load faculties list
        const res = await api.get(`/faculties`);
        const arr = Array.isArray(res?.data?.data)
          ? res.data.data
          : (Array.isArray(res?.data) ? res.data : []);

        const mapped: Faculty[] = arr.map((f: any) => ({
          id: f.id,
          code: f.code,
          name: f.facultyName ?? f.name,
          shortName: f.shortName,
          dean: f.degreeTitle ?? f.dean,
          contactNumber: f.phone ?? f.contactNumber,
          email: f.email,
          website: f.website,
          address: f.website ?? f.address,
          universityId: f.universityId,
          universityCode: f.universityCode,
          universityName: f.universityName,
          active: f.active,
        }));
        const ordered = (mapped.length ? mapped : SAMPLE_FACULTIES)
          .slice()
          .sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
        setRows(ordered);
      } catch {
        setRows(SAMPLE_FACULTIES);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load universities for the create/edit form select
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/universities`);
        const list = Array.isArray(res?.data?.data)
          ? res.data.data
          : (Array.isArray(res?.data) ? res.data : []);
        setUniversities(
          list.map((u: any) => ({ id: u.id, name: u.name, code: u.code }))
        );
      } catch {
        setUniversities([]);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    const f = t
      ? rows.filter((r) =>
          [r.code, r.name, r.shortName, r.dean, r.website, r.contactNumber, r.email]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(t))
        )
      : rows;

    if (!sortBy) return f;
    const s = [...f].sort((a, b) => {
      const av = (a[sortBy] ?? "").toString().toLowerCase();
      const bv = (b[sortBy] ?? "").toString().toLowerCase();
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });

    return s;
  }, [rows, q, sortBy, sortAsc]);

  // View details
  const handleView = async (id: number) => {
    setViewingError(null);
    setViewingLoading(true);
    try {
      const res = await api.get(`/faculties/${id}`);
      const f = res?.data?.data ?? res?.data;
      const mapped: Faculty = {
        id: f.id,
        code: f.code,
        name: f.facultyName ?? f.name,
        shortName: f.shortName,
        dean: f.degreeTitle ?? f.dean,
        contactNumber: f.phone ?? f.contactNumber,
        email: f.email,
        website: f.website,
        address: f.website ?? f.address,
        universityId: f.universityId,
        universityCode: f.universityCode,
        universityName: f.universityName,
        active: f.active,
      };
      setViewing(mapped);
    } catch (e: any) {
      const data = e?.response?.data;
      const msg = (data?.message
        || (Array.isArray(data?.errors) ? data.errors.join(', ') : undefined)
        || data?.error
        || e?.message
        || 'An unexpected error occurred');
      setViewingError(String(msg));
    } finally {
      setViewingLoading(false);
    }
  };

  // Always fetch fresh details before opening Edit
  const handleOpenEdit = async (id: number) => {
    try {
      setEditingError(null);
      const res = await api.get(`/faculties/${id}`);
      const f = res?.data?.data ?? res?.data;
      const mapped: Faculty = {
        id: f.id,
        code: f.code,
        name: f.facultyName ?? f.name,
        dean: f.degreeTitle ?? f.dean,
        contactNumber: f.phone ?? f.contactNumber,
        email: f.email,
        address: f.website ?? f.address,
        website: f.website,
        shortName: f.shortName,
        universityId: f.universityId,
        universityCode: f.universityCode,
        universityName: f.universityName,
        active: f.active,
      };
      setEditing(mapped);
    } catch (e: any) {
      const data = e?.response?.data;
      const msg = (data?.message
        || (Array.isArray(data?.errors) ? data.errors.join(', ') : undefined)
        || data?.error
        || e?.message
        || 'An unexpected error occurred');
      setEditingError(String(msg));
    }
  };

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
    setDeleteError(null);
    setDeleting(true);
    try {
      const res = await api.delete(`/faculties/${facultyToDelete.id}`);
      if (res && res.status >= 200 && res.status < 300) {
        setRows((r) => r
          .filter((x) => x.id !== facultyToDelete.id)
          .slice()
          .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
        );
        closeDeleteModal();
      }
    } catch (e: any) {
      const data = e?.response?.data;
      const msg = (data?.message
        || (Array.isArray(data?.errors) ? data.errors.join(', ') : undefined)
        || data?.error
        || e?.message
        || 'An unexpected error occurred');
      setDeleteError(String(msg));
    } finally {
      setDeleting(false);
    }
  };

  const handleCreate = async (payload: FacultyCreatePayload) => {
    setCreatingError(null);
    setSavingCreate(true);
    // Normalize types
    const body: FacultyCreatePayload = {
      code: payload.code.trim(),
      facultyName: payload.facultyName.trim(),
      degreeTitle: payload.degreeTitle?.trim() || undefined,
      shortName: payload.shortName?.trim() || undefined,
      email: payload.email?.trim() || undefined,
      phone: payload.phone?.trim() || undefined,
      website: payload.website?.trim() || undefined,
      universityId: Number(payload.universityId),
      active: Boolean(payload.active),
    };

    try {
      const res = await api.post(`/faculties`, body);
      const f = res?.data?.data ?? res?.data;
      if (f) {
        const mapped: Faculty = {
          id: f.id,
          code: f.code,
          name: f.facultyName ?? f.name,
          shortName: f.shortName,
          dean: f.degreeTitle ?? f.dean,
          contactNumber: f.phone ?? f.contactNumber,
          email: f.email,
          website: f.website,
          address: f.website ?? f.address,
          universityId: f.universityId,
          universityCode: f.universityCode,
          universityName: f.universityName,
          active: f.active,
        };
        setRows((r) => [...r, mapped].slice().sort((a, b) => (a.id ?? 0) - (b.id ?? 0)));
        setCreating(false);
      }
    } catch (e: any) {
      const data = e?.response?.data;
      const msg = (data?.message
        || (Array.isArray(data?.errors) ? data.errors.join(', ') : undefined)
        || data?.error
        || e?.message
        || 'An unexpected error occurred');
      setCreatingError(String(msg));
    } finally {
      setSavingCreate(false);
    }
  };

  const handleUpdate = async (id: number, payload: FacultyCreatePayload) => {
    setEditingError(null);
    setSavingEdit(true);
    const body: FacultyCreatePayload = {
      code: payload.code.trim(),
      facultyName: payload.facultyName.trim(),
      degreeTitle: payload.degreeTitle?.trim() || undefined,
      shortName: payload.shortName?.trim() || undefined,
      email: payload.email?.trim() || undefined,
      phone: payload.phone?.trim() || undefined,
      website: payload.website?.trim() || undefined,
      universityId: Number(payload.universityId),
      active: Boolean(payload.active),
    };
    try {
      const res = await api.put(`/faculties/${id}`, body);
      const f = res?.data?.data ?? res?.data;
      if (f) {
        const mapped: Faculty = {
          id: f.id,
          code: f.code,
          name: f.facultyName ?? f.name,
          shortName: f.shortName,
          dean: f.degreeTitle ?? f.dean,
          contactNumber: f.phone ?? f.contactNumber,
          email: f.email,
          website: f.website,
          address: f.website ?? f.address,
          universityId: f.universityId,
          universityCode: f.universityCode,
          universityName: f.universityName,
          active: f.active,
        };
        setRows((r) => r
          .map((x) => (x.id === id ? mapped : x))
          .slice()
          .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
        );
        setEditing(null);
      }
    } catch (e: any) {
      const data = e?.response?.data;
      const msg = (data?.message
        || (Array.isArray(data?.errors) ? data.errors.join(', ') : undefined)
        || data?.error
        || e?.message
        || 'An unexpected error occurred');
      setEditingError(String(msg));
    } finally {
      setSavingEdit(false);
    }
  };

  useEffect(() => { setPage(1); }, [q]);
  const viewDrag = useDraggable();
  const viewModalRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = viewModalRef.current;
    if (!el) return;
    el.style.setProperty('--drag-x', `${viewDrag.pos.x}px`);
    el.style.setProperty('--drag-y', `${viewDrag.pos.y}px`);
  }, [viewDrag.pos.x, viewDrag.pos.y]);

  return (
    <div>
      {/* Top toolbar (same class names) */}
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
            aria-label="Search"
            title="Search"
            onClick={() => {
              const val = searchRef.current?.value ?? "";
              setQ(val.trim());
              searchRef.current?.focus();
            }}
            className="icon-btn search-btn-floating"
          >
            <FaSearch className="search-icon" />
          </button>
        </div>

        <div className="filters">
          <button className="add-user-btn" onClick={() => setCreating(true)}>
            <FaPlus className="icon-left-gap" />
            Add Faculty
          </button>
        </div>
      </div>

      {/* Table (same classes) */}
      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Id</th>
              <th onClick={() => toggleSort("code")}>Code {sortIcon("code")}</th>
              <th onClick={() => toggleSort("name")}>Faculty Name {sortIcon("name")}</th>
              <th onClick={() => toggleSort("shortName")}>Short Name {sortIcon("shortName")}</th>
              <th onClick={() => toggleSort("dean")}>Degree Title {sortIcon("dean")}</th>
              <th onClick={() => toggleSort("email")}>Email {sortIcon("email")}</th>
              <th onClick={() => toggleSort("contactNumber")}>Phone {sortIcon("contactNumber")}</th>
              <th onClick={() => toggleSort("website")}>Website {sortIcon("website")}</th>
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
                <td>{f.id}</td>
                <td>{f.code}</td>
                <td>{f.name}</td>
                <td>{f.shortName || "-"}</td>
                <td>{f.dean || "-"}</td>
                <td>{f.email || "-"}</td>
                <td>{f.contactNumber || "-"}</td>
                <td>{f.website || f.address || "-"}</td>
                <td className="actions">
                  <button className="icon-btn" title="View" onClick={() => handleView(f.id)}>
                    <FaEye className="icon view-icon" />
                  </button>
                  <button className="icon-btn" title="Edit" onClick={() => handleOpenEdit(f.id)}>
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
          initial={{ active: true }}
          universities={universities}
          onCancel={() => setCreating(false)}
          onSubmit={(payload) => handleCreate(payload)}
          error={creatingError ?? undefined}
          saving={savingCreate}
          disableBackdropClose
          disableEscClose
        />
      )}

      {/* Edit modal */}
      {editing && (
        <AppFormModal
          title="Edit Faculty"
          initial={{
            code: editing.code,
            facultyName: editing.name,
            degreeTitle: editing.dean,
            shortName: editing.shortName,
            email: editing.email,
            phone: editing.contactNumber,
            website: editing.website ?? editing.address,
            universityId: editing.universityId,
            active: editing.active ?? true,
          }}
          universities={universities}
          onCancel={() => setEditing(null)}
          onSubmit={(payload) => handleUpdate(editing.id, payload)}
          error={editingError ?? undefined}
          saving={savingEdit}
        />
      )}

      {(viewing || viewingLoading || viewingError) && (
        <div className="app-modal-backdrop" onClick={() => setViewing(null)} role="dialog" aria-modal="true">
          <div
            className="app-modal app-modal--draggable"
            onClick={(e) => e.stopPropagation()}
            ref={viewModalRef}
          >
            <div className="app-modal__header is-draggable" onMouseDown={viewDrag.onMouseDown}>
              <h3 className="app-modal__title">Faculty Details</h3>
              <button type="button" className="app-modal__close" onClick={() => setViewing(null)} aria-label="Close" title="Close">
                <FaTimes />
              </button>
            </div>
            <div className="app-form app-form--tight">
              {viewingLoading ? (
                <div>Loading...</div>
              ) : (
                <>
                  {viewingError && (
                    <div className="app-error">{viewingError}</div>
                  )}
                  {viewing && (
                    <>
                      <div className="app-grid">
                        <div className="app-field"><span className="app-label">Id</span><div className="app-input app-input--readonly">{viewing.id}</div></div>
                        <div className="app-field"><span className="app-label">Code</span><div className="app-input app-input--readonly">{viewing.code}</div></div>
                        <div className="app-field"><span className="app-label">Faculty Name</span><div className="app-input app-input--readonly">{viewing.name}</div></div>
                        <div className="app-field"><span className="app-label">Short Name</span><div className="app-input app-input--readonly">{viewing.shortName || '-'}</div></div>
                        <div className="app-field"><span className="app-label">Degree Title</span><div className="app-input app-input--readonly">{viewing.dean || '-'}</div></div>
                        <div className="app-field"><span className="app-label">Email</span><div className="app-input app-input--readonly">{viewing.email || '-'}</div></div>
                        <div className="app-field"><span className="app-label">Phone</span><div className="app-input app-input--readonly">{viewing.contactNumber || '-'}</div></div>
                        <div className="app-field app-grid--2"><span className="app-label">Website</span><div className="app-input app-input--readonly">{viewing.website || viewing.address || '-'}</div></div>
                        <div className="app-field"><span className="app-label">University Code</span><div className="app-input app-input--readonly">{viewing.universityCode || '-'}</div></div>
                        <div className="app-field"><span className="app-label">University Name</span><div className="app-input app-input--readonly">{viewing.universityName || '-'}</div></div>
                        <div className="app-field"><span className="app-label">University Id</span><div className="app-input app-input--readonly">{viewing.universityId ?? '-'}</div></div>
                        <label className="app-field">
                          <span className="app-label">Active</span>
                          <div className="app-input app-input--readonly app-input--inline">
                            <input type="checkbox" checked={!!viewing.active} readOnly />
                            <span>{viewing.active ? 'Enabled' : 'Disabled'}</span>
                          </div>
                        </label>
                      </div>
                      <div className="app-modal__actions">
                        <button type="button" className="app-btn app-btn--primary" onClick={() => setViewing(null)}>Close</button>
                      </div>
                    </>
                  )}
                </>
              )}
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
  universities,
  onCancel,
  onSubmit,
  error,
  saving,
  disableBackdropClose,
  disableEscClose,
}: {
  title: string;
  initial?: Partial<FacultyCreatePayload>;
  universities: Array<{ id: number; name: string; code?: string }>;
  onCancel: () => void;
  onSubmit: (payload: FacultyCreatePayload) => void;
  error?: string;
  saving?: boolean;
  disableBackdropClose?: boolean;
  disableEscClose?: boolean;
}) {
  const drag = useDraggable();
  const [code, setCode] = useState(initial?.code ?? "");
  const [facultyName, setFacultyName] = useState(initial?.facultyName ?? "");
  const [degreeTitle, setDegreeTitle] = useState(initial?.degreeTitle ?? "");
  const [shortName, setShortName] = useState(initial?.shortName ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [universityId, setUniversityId] = useState<number>(
    initial?.universityId ?? (universities[0]?.id ?? 0)
  );
  const [active, setActive] = useState<boolean>(initial?.active ?? true);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      code,
      facultyName,
      degreeTitle,
      shortName,
      email,
      phone,
      website,
      universityId,
      active,
    });
  };

  // If universities load after mount and no value selected, choose first
  useEffect(() => {
    if (!universityId && universities.length > 0) {
      setUniversityId(universities[0].id);
    }
  }, [universities]);

  useEffect(() => {
    if (disableEscClose) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, disableEscClose]);

  const modalRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    el.style.setProperty('--drag-x', `${drag.pos.x}px`);
    el.style.setProperty('--drag-y', `${drag.pos.y}px`);
  }, [drag.pos.x, drag.pos.y]);

  return (
    <div className="app-modal-backdrop" onClick={disableBackdropClose ? undefined : onCancel} role="dialog" aria-modal="true">
      <div
        className="app-modal app-modal--draggable"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        <div className="app-modal__header is-draggable" onMouseDown={drag.onMouseDown}>
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
          {error && (
            <div className="app-error">{error}</div>
          )}
          <div className="app-grid">
            <label className="app-field">
              <span className="app-label">Code</span>
              <input className="app-input" value={code} onChange={(e) => setCode(e.target.value)} required />
            </label>

            <label className="app-field">
              <span className="app-label">Faculty Name</span>
              <input className="app-input" value={facultyName} onChange={(e) => setFacultyName(e.target.value)} required />
            </label>

            <label className="app-field">
              <span className="app-label">Degree Title</span>
              <input className="app-input" value={degreeTitle} onChange={(e) => setDegreeTitle(e.target.value)} />
            </label>

            <label className="app-field">
              <span className="app-label">Short Name</span>
              <input className="app-input" value={shortName} onChange={(e) => setShortName(e.target.value)} />
            </label>

            <label className="app-field">
              <span className="app-label">Email</span>
              <input className="app-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>

            <label className="app-field">
              <span className="app-label">Phone</span>
              <input className="app-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>

            <label className="app-field app-grid--2">
              <span className="app-label">Website</span>
              <input className="app-input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.edu" />
            </label>

            <label className="app-field">
              <span className="app-label">University</span>
              <select
                className="app-input"
                value={universityId}
                onChange={(e) => setUniversityId(Number(e.target.value))}
                required
              >
                <option value={0} disabled>Select university</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>{u.code ? `${u.code} — ${u.name}` : u.name}</option>
                ))}
              </select>
            </label>

            <label className="app-field">
              <span className="app-label">Active</span>
              <div className="app-input app-input--inline">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                <span>{active ? 'Enabled' : 'Disabled'}</span>
              </div>
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


