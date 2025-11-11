// UniversitiesTable.tsx
import { useEffect, useMemo, useRef, useState } from "react";
// Removed react-draggable usage to avoid findDOMNode issues on React 18/19
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
import "./table.css";

type University = {
  id: number;
  code: string;
  name: string;
  // table friendly
  address?: string;
  contactNumber?: string;
  email?: string;
  // full details (from backend)
  shortName?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  establishedYear?: number;
  logoUrl?: string;
  active?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

const SAMPLE_UNIS: University[] = [
  { id: 1, code: "UOR", name: "University of Ruhuna", address: "Hapugala, Galle 80000, Sri Lanka", contactNumber: "+94 91 224 5765", email: "info@uor.ac.lk" },
  { id: 2, code: "UOM", name: "University of Moratuwa", address: "Bandaranayake Mawatha, Moratuwa 10400", contactNumber: "+94 11 265 0301", email: "info@uom.lk" },
  { id: 3, code: "UOC", name: "University of Colombo", address: "94 Cumaratunga Munidasa Mawatha, Colombo 03", contactNumber: "+94 11 258 1835", email: "info@cmb.ac.lk" },
  { id: 4, code: "UOJ", name: "University of Jaffna", address: "Thirunelvely, Jaffna 40000", contactNumber: "+94 21 222 6714", email: "info@univ.jfn.ac.lk" },
];

type SortKey = keyof Pick<University, "code" | "name" | "address" | "contactNumber" | "email">;

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
    origin.current = { x: e.clientX, y: e.clientY } as any;
    start.current = pos;
    window.addEventListener("mousemove", onMouseMove as any);
    window.addEventListener("mouseup", onMouseUp);
  };
  useEffect(() => () => {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }, []);
  return { pos, onMouseDown };
}

export default function UniversitiesTable() {
  const [rows, setRows] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [sortBy, setSortBy] = useState<SortKey | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [editing, setEditing] = useState<University | null>(null);
  const [creating, setCreating] = useState(false);
  const [creatingError, setCreatingError] = useState<string | null>(null);
  const [savingCreate, setSavingCreate] = useState(false);
  const [editingError, setEditingError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [viewing, setViewing] = useState<University | null>(null);
  const [viewingLoading, setViewingLoading] = useState(false);
  const [viewingError, setViewingError] = useState<string | null>(null);
  const viewDrag = useDraggable();
  const viewModalRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = viewModalRef.current;
    if (!el) return;
    el.style.setProperty('--drag-x', `${viewDrag.pos.x}px`);
    el.style.setProperty('--drag-y', `${viewDrag.pos.y}px`);
  }, [viewDrag.pos.x, viewDrag.pos.y]);

  const mapUni = (u: any): University => ({
    id: u.id,
    code: u.code,
    name: u.name,
    email: u.email,
    contactNumber: u.phone ?? u.contactNumber,
    address: [u.addressLine1, u.addressLine2, u.city].filter(Boolean).join(", "),
    shortName: u.shortName,
    phone: u.phone,
    website: u.website,
    addressLine1: u.addressLine1,
    addressLine2: u.addressLine2,
    city: u.city,
    state: u.state,
    country: u.country,
    postalCode: u.postalCode,
    establishedYear: u.establishedYear,
    logoUrl: u.logoUrl,
    active: u.active,
    createdAt: u.createdAt ?? null,
    updatedAt: u.updatedAt ?? null,
  });

  const handleView = async (id: number) => {
    setViewingError(null);
    setViewingLoading(true);
    try {
      const res = await api.get(`/universities/${id}`);
      const u = res?.data?.data ?? res?.data;
      setViewing(mapUni(u));
    } catch (e: any) {
      const data = e?.response?.data;
      const msg = (data?.message
        || (Array.isArray(data?.errors) ? data.errors.join(', ') : undefined)
        || data?.error
        || e?.message
        || 'Failed to load university');
      setViewingError(String(msg));
    } finally {
      setViewingLoading(false);
    }
  };

  // Always fetch fresh data before opening Edit
  const handleOpenEdit = async (id: number) => {
    try {
      setEditingError(null);
      const res = await api.get(`/universities/${id}`);
      const u = res?.data?.data ?? res?.data;
      setEditing(mapUni(u));
    } catch (e: any) {
      const data = e?.response?.data;
      const msg = (data?.message
        || (Array.isArray(data?.errors) ? data.errors.join(', ') : undefined)
        || data?.error
        || e?.message
        || 'Failed to load university for edit');
      setEditingError(String(msg));
    }
  };

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [universityToDelete, setUniversityToDelete] = useState<University | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/universities`);
        const payload = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
        const mapped: University[] = payload.map((u: any) => ({
          id: u.id,
          code: u.code,
          name: u.name,
          email: u.email,
          contactNumber: u.phone ?? u.contactNumber,
          address: [u.addressLine1, u.addressLine2, u.city].filter(Boolean).join(", "),
          shortName: u.shortName,
          phone: u.phone,
          website: u.website,
          addressLine1: u.addressLine1,
          addressLine2: u.addressLine2,
          city: u.city,
          state: u.state,
          country: u.country,
          postalCode: u.postalCode,
          establishedYear: u.establishedYear,
          logoUrl: u.logoUrl,
          active: u.active,
          createdAt: u.createdAt ?? null,
          updatedAt: u.updatedAt ?? null,
        }));
        const ordered = (mapped.length ? mapped : SAMPLE_UNIS).slice().sort((a,b) => (a.id ?? 0) - (b.id ?? 0));
        setRows(ordered);
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
    setDeleteError(null);
    setDeleting(true);
    try {
      const res = await api.delete(`/universities/${universityToDelete.id}`);
      if (res && res.status >= 200 && res.status < 300) {
    setRows((r) => r.filter((x) => x.id !== universityToDelete.id).slice().sort((a,b)=> (a.id ?? 0) - (b.id ?? 0)));
        closeDeleteModal();
      }
    } catch (e: any) {
      const data = e?.response?.data;
      const msg = (data?.message
        || (Array.isArray(data?.errors) ? data.errors.join(', ') : undefined)
        || data?.error
        || e?.message
        || 'Failed to delete university');
      setDeleteError(String(msg));
    } finally {
      setDeleting(false);
    }
  };

  const handleCreate = async (payload: Omit<University, "id">) => {
    setCreatingError(null);
    setSavingCreate(true);
    // Normalize optional fields (empty strings -> undefined) and coerce numbers
    const toUndef = (v: any) => (v === "" || v === null ? undefined : v);
    const eyRaw = payload.establishedYear as any;
    const establishedYear =
      typeof eyRaw === "number"
        ? eyRaw
        : typeof eyRaw === "string" && eyRaw.trim() !== ""
        ? Number(eyRaw)
        : undefined;

    const shortNameNorm = toUndef(payload.shortName) ?? payload.code;
    const body: any = {
      code: payload.code,
      name: payload.name,
      shortName: shortNameNorm,
      email: toUndef(payload.email),
      phone: toUndef(payload.phone ?? payload.contactNumber),
      website: toUndef(payload.website),
      addressLine1: toUndef(payload.addressLine1 ?? payload.address),
      addressLine2: toUndef(payload.addressLine2),
      city: toUndef(payload.city),
      state: toUndef(payload.state),
      country: toUndef(payload.country),
      postalCode: toUndef(payload.postalCode),
      establishedYear,
      logoUrl: toUndef(payload.logoUrl),
      active: payload.active,
    };
    // Remove undefined keys to avoid backend validation errors
    Object.keys(body).forEach((k) => (body as any)[k] === undefined && delete (body as any)[k]);
    try {
      const res = await api.post(`/universities`, body);
      // After create, re-fetch list to follow backend-defined order for numbering
      const list = await api.get(`/universities`);
      const payload = Array.isArray(list?.data?.data) ? list.data.data : (Array.isArray(list?.data) ? list.data : []);
      const mapped: University[] = payload.map((u: any) => ({
        id: u.id,
        code: u.code,
        name: u.name,
        email: u.email,
        contactNumber: u.phone ?? u.contactNumber,
        address: [u.addressLine1, u.addressLine2, u.city].filter(Boolean).join(", "),
        shortName: u.shortName,
        phone: u.phone,
        website: u.website,
        addressLine1: u.addressLine1,
        addressLine2: u.addressLine2,
        city: u.city,
        state: u.state,
        country: u.country,
        postalCode: u.postalCode,
        establishedYear: u.establishedYear,
        logoUrl: u.logoUrl,
        active: u.active,
      }));
      setRows(mapped.slice().sort((a,b)=> (a.id ?? 0) - (b.id ?? 0)));
      setPage(1);
      setCreating(false);
    } catch (e: any) {
      const data = e?.response?.data;
      const msg = (data?.message
        || (Array.isArray(data?.errors) ? data.errors.join(', ') : undefined)
        || data?.error
        || e?.message
        || 'Failed to create university');
      setCreatingError(String(msg));
    } finally {
      setSavingCreate(false);
    }
  };

  const handleUpdate = async (id: number, payload: Omit<University, "id">) => {
    setEditingError(null);
    setSavingEdit(true);
    const toUndef = (v: any) => (v === "" || v === null ? undefined : v);
    const eyRaw = payload.establishedYear as any;
    const establishedYear =
      typeof eyRaw === "number"
        ? eyRaw
        : typeof eyRaw === "string" && eyRaw.trim() !== ""
        ? Number(eyRaw)
        : undefined;

    const body: any = {
      name: payload.name,
      shortName: toUndef(payload.shortName),
      email: toUndef(payload.email),
      phone: toUndef(payload.phone ?? payload.contactNumber),
      website: toUndef(payload.website),
      addressLine1: toUndef(payload.addressLine1 ?? payload.address),
      addressLine2: toUndef(payload.addressLine2),
      city: toUndef(payload.city),
      state: toUndef(payload.state),
      country: toUndef(payload.country),
      postalCode: toUndef(payload.postalCode),
      establishedYear,
      logoUrl: toUndef(payload.logoUrl),
      active: payload.active,
    };
    Object.keys(body).forEach((k) => (body as any)[k] === undefined && delete (body as any)[k]);
    try {
      const res = await api.put(`/universities/${id}`, body);
      const u = res?.data?.data ?? res?.data;
      const updated: University = {
        id: u.id,
        // Prefer backend value; fallback to submitted value in case API omits it
        code: (u.code ?? payload.code) as string,
        name: u.name,
        email: u.email,
        contactNumber: u.phone ?? u.contactNumber,
        address: [u.addressLine1, u.addressLine2, u.city].filter(Boolean).join(", "),
        shortName: u.shortName,
        phone: u.phone,
        website: u.website,
        addressLine1: u.addressLine1,
        addressLine2: u.addressLine2,
        city: u.city,
        state: u.state,
        country: u.country,
        postalCode: u.postalCode,
        establishedYear: u.establishedYear,
        logoUrl: u.logoUrl,
        active: u.active,
      };
    setRows((r) => r.map((x) => (x.id === id ? updated : x)).slice().sort((a,b)=> (a.id ?? 0) - (b.id ?? 0)));
      setEditing(null);
    } catch (e: any) {
      const data = e?.response?.data;
      const msg = (data?.message
        || (Array.isArray(data?.errors) ? data.errors.join(', ') : undefined)
        || data?.error
        || e?.message
        || 'Failed to update university');
      setEditingError(String(msg));
    } finally {
      setSavingEdit(false);
    }
  };

  useEffect(() => { setPage(1); }, [q]);

  return (
    <div>
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

        <div className="filters">
          <button className="add-user-btn" onClick={() => setCreating(true)}>
            <FaPlus className="icon-left-gap" />
            Add University
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Id</th>
              <th className="w-60px">Logo</th>
              <th onClick={() => toggleSort("code")}>
                code {sortIcon("code")}
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
              <tr><td colSpan={8}>Loading...</td></tr>
            )}

            {!loading && view.length === 0 && (
              <tr><td colSpan={8}>No data</td></tr>
            )}

            {!loading && view.map((u, i) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>
                  {u.logoUrl ? (
                    <img
                      src={u.logoUrl}
                      alt={`${u.name || u.code} logo`}
                      className="img-28-contain"
                    />
                  ) : (
                    '-'
                  )}
                </td>
                <td>{u.code}</td>
                <td>{u.name}</td>
                <td>{u.address || "-"}</td>
                <td>{u.contactNumber || "-"}</td>
                <td>{u.email || "-"}</td>
                <td className="actions">
                  <button className="icon-btn" title="View" onClick={() => handleView(u.id)}>
                    <FaEye className="icon view-icon" />
                  </button>
                  <button className="icon-btn" title="Edit" onClick={() => handleOpenEdit(u.id)}>
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
          error={creatingError ?? undefined}
          saving={savingCreate}
          disableBackdropClose
          disableEscClose
        />
      )}

      {/* Edit modal */}
      {editing && (
        <AppFormModal
          title="Edit University"
          initial={editing}
          onCancel={() => setEditing(null)}
          onSubmit={(payload) => handleUpdate(editing.id, payload)}
          error={editingError ?? undefined}
          saving={savingEdit}
          disableBackdropClose
          disableEscClose
        />
      )}

      {/* View modal */}
      {viewing && (
        <div
          className="app-modal-backdrop"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="app-modal app-modal--draggable"
            ref={viewModalRef}
          >
            <div className="app-modal__header is-draggable" onMouseDown={viewDrag.onMouseDown}>
                <h3 className="app-modal__title">University Details</h3>
                <button
                  type="button"
                  className="app-modal__close"
                  onClick={() => setViewing(null)}
                  aria-label="Close"
                  title="Close"
                >
                  <FaTimes />
                </button>
              </div>
            <div className="app-form app-form--tight">
                {viewingLoading && (
                  <div>Loading...</div>
                )}
                {viewingError && (
                  <div className="app-error">{viewingError}</div>
                )}
                <div className="app-grid">
                <div className="app-field"><span className="app-label">id</span><div className="app-input app-input--readonly">{String(viewing.id)}</div></div>
                <div className="app-field"><span className="app-label">code</span><div className="app-input app-input--readonly">{viewing.code}</div></div>
                <div className="app-field"><span className="app-label">name</span><div className="app-input app-input--readonly">{viewing.name}</div></div>
                <div className="app-field"><span className="app-label">shortName</span><div className="app-input app-input--readonly">{viewing.shortName || '-'}</div></div>
                <div className="app-field"><span className="app-label">email</span><div className="app-input app-input--readonly">{viewing.email || '-'}</div></div>
                <div className="app-field"><span className="app-label">phone</span><div className="app-input app-input--readonly">{viewing.phone || viewing.contactNumber || '-'}</div></div>
                <div className="app-field app-grid--2"><span className="app-label">website</span><div className="app-input app-input--readonly">{viewing.website || '-'}</div></div>
                <div className="app-field app-grid--2"><span className="app-label">addressLine1</span><div className="app-input app-input--readonly">{viewing.addressLine1 || '-'}</div></div>
                <div className="app-field app-grid--2"><span className="app-label">addressLine2</span><div className="app-input app-input--readonly">{viewing.addressLine2 || '-'}</div></div>
                <div className="app-field"><span className="app-label">city</span><div className="app-input app-input--readonly">{viewing.city || '-'}</div></div>
                <div className="app-field"><span className="app-label">state</span><div className="app-input app-input--readonly">{viewing.state || '-'}</div></div>
                <div className="app-field"><span className="app-label">country</span><div className="app-input app-input--readonly">{viewing.country || '-'}</div></div>
                <div className="app-field"><span className="app-label">postalCode</span><div className="app-input app-input--readonly">{viewing.postalCode || '-'}</div></div>
                <div className="app-field"><span className="app-label">establishedYear</span><div className="app-input app-input--readonly">{viewing.establishedYear ?? '-'}</div></div>
                <div className="app-field app-grid--2"><span className="app-label">logoUrl</span><div className="app-input app-input--readonly">{viewing.logoUrl ? <img src={viewing.logoUrl} alt="logo" className="img-thumb-50" /> : '-'}</div></div>
                <div className="app-field"><span className="app-label">active</span><div className="app-input app-input--readonly">{String(viewing.active ?? true)}</div></div>
              </div>
              <div className="app-modal__actions">
                <button type="button" className="app-btn app-btn--primary" onClick={() => setViewing(null)}>Close</button>
              </div>
            </div>
            </div>
        </div>
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
                title="Close"
                onClick={closeDeleteModal}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-body">
                {universityToDelete ? (
                  <>Are you sure you want to delete <strong>{universityToDelete.code} - {universityToDelete.name}</strong>?</>
                ) : (
                  "Are you sure you want to delete this university?"
                )}
              </p>
            </div>
            <div className="modal-footer">
              {deleteError && (
                <div className="app-error">{deleteError}</div>
              )}
              <button className="btn-delete danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
              <button className="btn-delete ghost" onClick={closeDeleteModal} disabled={deleting}>
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
  error,
  saving,
  disableBackdropClose,
  disableEscClose,
}: {
  title: string;
  initial?: Partial<Omit<University, "id">>;
  onCancel: () => void;
  onSubmit: (payload: Omit<University, "id">) => void;
  error?: string;
  saving?: boolean;
  disableBackdropClose?: boolean;
  disableEscClose?: boolean;
}) {
  // Core
  const [code, setCode] = useState(initial?.code ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [shortName, setShortName] = useState(initial?.shortName ?? "");
  const isEdit = title.toLowerCase().includes("edit");

  // Contact
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? initial?.contactNumber ?? "");
  const [website, setWebsite] = useState(initial?.website ?? "");

  // Address
  const [addressLine1, setAddressLine1] = useState(initial?.addressLine1 ?? "");
  const [addressLine2, setAddressLine2] = useState(initial?.addressLine2 ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [state, setState] = useState(initial?.state ?? "");
  const [country, setCountry] = useState(initial?.country ?? "");
  const [postalCode, setPostalCode] = useState(initial?.postalCode ?? "");
  // Combined address for table convenience
  const [address, setAddress] = useState(
    initial?.address ?? [initial?.addressLine1, initial?.addressLine2, initial?.city].filter(Boolean).join(", ")
  );

  // Misc
  const [establishedYear, setEstablishedYear] = useState<string | number>(
    initial?.establishedYear ?? ""
  );
  const [logoUrl, setLogoUrl] = useState(initial?.logoUrl ?? "");
  const [active, setActive] = useState<boolean>(initial?.active ?? true);

  // Keep combined address roughly in sync
  useEffect(() => {
    const combined = [addressLine1, addressLine2, city].filter(Boolean).join(", ");
    if (combined && combined !== address) setAddress(combined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressLine1, addressLine2, city]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      code,
      name,
      shortName,
      email,
      phone,
      website,
      address,
      contactNumber: phone,
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      postalCode,
      establishedYear: typeof establishedYear === "string" && establishedYear !== "" ? Number(establishedYear) : (establishedYear as number),
      logoUrl,
      active,
    } as Omit<University, "id">);
  };

  useEffect(() => {
    if (disableEscClose) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, disableEscClose]);

  const drag = useDraggable();
  const modalRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    el.style.setProperty('--drag-x', `${drag.pos.x}px`);
    el.style.setProperty('--drag-y', `${drag.pos.y}px`);
  }, [drag.pos.x, drag.pos.y]);

  return (
    <div
      className="app-modal-backdrop"
      onClick={disableBackdropClose ? undefined : onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="app-modal app-modal--draggable"
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
            {!isEdit && (
              <label className="app-field">
                <span className="app-label">code</span>
                <input className="app-input" value={code} onChange={(e) => setCode(e.target.value)} />
              </label>
            )}

            <label className="app-field">
              <span className="app-label">name</span>
              <input className="app-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>

            <label className="app-field">
              <span className="app-label">shortName</span>
              <input className="app-input" value={shortName} onChange={(e) => setShortName(e.target.value)} required />
            </label>

            <label className="app-field">
              <span className="app-label">email</span>
              <input className="app-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>

            <label className="app-field">
              <span className="app-label">phone</span>
              <input className="app-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>

            <label className="app-field app-grid--2">
              <span className="app-label">website</span>
              <input className="app-input" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </label>

            <label className="app-field app-grid--2">
              <span className="app-label">addressLine1</span>
              <input className="app-input" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
            </label>

            <label className="app-field app-grid--2">
              <span className="app-label">addressLine2</span>
              <input className="app-input" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
            </label>

            <label className="app-field">
              <span className="app-label">city</span>
              <input className="app-input" value={city} onChange={(e) => setCity(e.target.value)} />
            </label>

            <label className="app-field">
              <span className="app-label">state</span>
              <input className="app-input" value={state} onChange={(e) => setState(e.target.value)} />
            </label>

            <label className="app-field">
              <span className="app-label">country</span>
              <input className="app-input" value={country} onChange={(e) => setCountry(e.target.value)} />
            </label>

            <label className="app-field">
              <span className="app-label">postalCode</span>
              <input className="app-input" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            </label>

            <label className="app-field">
              <span className="app-label">establishedYear</span>
              <input className="app-input" type="number" value={establishedYear as any} onChange={(e) => setEstablishedYear(e.target.value)} />
            </label>

            <label className="app-field app-grid--2">
              <span className="app-label">logoUrl</span>
              <input className="app-input" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
            </label>

            <label className="app-field">
              <span className="app-label">Active</span>
              <div className="app-input app-input--inline">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                />
                <span>{active ? 'Enabled' : 'Disabled'}</span>
              </div>
            </label>
          </div>

          <div className="app-modal__actions">
            <button type="submit" className="app-btn app-btn--primary" disabled={!!saving}>{saving ? 'Saving…' : 'Save'}</button>
            <button type="button" className="app-btn" onClick={onCancel} disabled={!!saving}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}





