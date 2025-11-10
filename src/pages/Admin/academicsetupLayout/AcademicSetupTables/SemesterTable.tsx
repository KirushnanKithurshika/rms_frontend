// SemesterTable.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../../../services/api";
import {
  FaSearch,
  FaPlus,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaEye,
  FaTimes,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";
import { MdEdit, MdDelete } from "react-icons/md";
import "./table.css";

// Matches backend response fields
export type Semester = {
  id: number;
  name: string;
  year: number;
  number: number;
  batchId: number;
};

type SortKey = keyof Pick<Semester, "name" | "year" | "number" | "batchId">;

type SemesterCreatePayload = {
  name: string;
  year: number;
  number: number;
  batchId: number;
};

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
  useEffect(
    () => () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    },
    []
  );
  return { pos, onMouseDown };
}

export default function SemesterTable() {
  const [rows, setRows] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);

  // reference data for rendering Batch as "Batch Name Faculty-Code"
  const [batches, setBatches] = useState<
    Array<{ id: number; name: string; facultyId?: number }>
  >([]);
  const [faculties, setFaculties] = useState<
    Array<{ id: number; code?: string; shortName?: string; name?: string }>
  >([]);

  // server paging (0-based)
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  const [sortBy, setSortBy] = useState<SortKey | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  // view + delete + create
  const [viewing, setViewing] = useState<any>(null);
  const [viewingError, setViewingError] = useState<string | null>(null);
  const viewDrag = useDraggable();
  const viewModalRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { const el=viewModalRef.current; if(!el) return; el.style.setProperty("--drag-x", `${viewDrag.pos.x}px`); el.style.setProperty("--drag-y", `${viewDrag.pos.y}px`); }, [viewDrag.pos.x, viewDrag.pos.y]);
  const [showDelete, setShowDelete] = useState(false);
  const [toDelete, setToDelete] = useState<Semester | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [creatingError, setCreatingError] = useState<string | null>(null);
  const [savingCreate, setSavingCreate] = useState(false);
  const [editing, setEditing] = useState<Semester | null>(null);
  const [editingError, setEditingError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Load a page from backend
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(
          `/v1/semesters/GetAll?page=${page}&size=${pageSize}`
        );
        const payload: any = res?.data?.data;
        const content = Array.isArray(payload?.content) ? payload.content : [];
        const mapped: Semester[] = content.map((s: any) => ({
          id: s.id,
          name: s.name,
          year: s.year,
          number: s.number,
          batchId: s.batchId,
        }));
        setRows(mapped.slice().sort((a, b) => a.id - b.id));
        setTotalPages(Number(payload?.totalPages ?? 1));
        const total = Number(
          payload?.totalElements ?? payload?.totalItems ?? payload?.total ?? 0
        );
        setTotalItems(Number.isFinite(total) ? total : 0);
      } catch {
        setRows([]);
        setTotalPages(1);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    })();
  }, [page, pageSize, reloadKey]);

  // Load reference lists (batches and faculties) once for label composition
  useEffect(() => {
    (async () => {
      try {
        const res = await api
          .get(`/v1/batches/GetAll`)
          .catch(() => null as any);
        const arr = Array.isArray(res?.data?.data)
          ? res!.data.data
          : Array.isArray(res?.data)
          ? res!.data
          : [];
        const mapped = (arr as any[]).map((b: any) => ({
          id: b.id ?? b.batchId,
          name: b.name ?? b.batchName,
          facultyId: b.facultyId ?? b.faculty?.id,
        }));
        setBatches(mapped);
      } catch {
        setBatches([]);
      }

      try {
        const fres = await api.get(`/faculties`).catch(() => null as any);
        const flist = Array.isArray(fres?.data?.data)
          ? fres!.data.data
          : Array.isArray(fres?.data)
          ? fres!.data
          : [];
        setFaculties(
          (flist as any[]).map((f: any) => ({
            id: f.id ?? f.facultyId,
            code: f.code ?? f.shortName,
            shortName: f.shortName,
            name: f.name ?? f.facultyName,
          }))
        );
      } catch {
        setFaculties([]);
      }
    })();
  }, []);

  // client filter + sort within current page
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    const f = t
      ? rows.filter((r) =>
          [r.name, r.year, r.number, r.batchId]
            .filter((v) => v !== undefined && v !== null)
            .some((v) => String(v).toLowerCase().includes(t))
        )
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

  const view = filtered; // backend already paginates

  const toggleSort = (key: SortKey) => {
    if (key === sortBy) setSortAsc((v) => !v);
    else {
      setSortBy(key);
      setSortAsc(true);
    }
  };

  const sortIcon = (key: SortKey) =>
    sortBy !== key ? <FaSort /> : sortAsc ? <FaSortUp /> : <FaSortDown />;

  // view details
  const handleView = async (id: number) => {
    setViewingError(null);
    try {
      const res = await api.get(`/v1/semesters/GetById/${id}`);
      const data = res?.data?.data ?? res?.data;
      if (data) {
        setViewing(data);
        return;
      }
      throw new Error("Empty response");
    } catch (e: any) {
      const local = rows.find((x) => x.id === id) || null;
      if (local) setViewing(local);
      const d = e?.response?.data;
      const msg =
        d?.message ||
        (Array.isArray(d?.errors) ? d.errors.join(", ") : undefined) ||
        d?.error ||
        e?.message ||
        "An unexpected error occurred";
      setViewingError(String(msg));
    }
  };

  // delete
  const askDelete = (s: Semester) => {
    setToDelete(s);
    setDeleteError(null);
    setShowDelete(true);
  };
  const closeDelete = () => {
    setShowDelete(false);
    setToDelete(null);
  };
  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await api.delete(`/v1/semesters/Delete/${toDelete.id}`);
      if (res && res.status >= 200 && res.status < 300) {
        setRows((prev) => prev.filter((x) => x.id !== toDelete.id));
        closeDelete();
      }
    } catch (e: any) {
      const data = e?.response?.data;
      const msg =
        data?.message ||
        (Array.isArray(data?.errors) ? data.errors.join(", ") : undefined) ||
        data?.error ||
        e?.message ||
        "An unexpected error occurred";
      setDeleteError(String(msg));
    } finally {
      setDeleting(false);
    }
  };

  // create
  // open edit with fresh details
  const handleOpenEdit = async (id: number) => {
    setEditingError(null);
    try {
      const res = await api.get(`/v1/semesters/GetById/${id}`);
      const d = res?.data?.data ?? res?.data;
      if (d) {
        const mapped: Semester = {
          id: d.id,
          name: d.name,
          year: d.year,
          number: d.number,
          batchId: d.batchId ?? d.batch?.id ?? 0,
        };
        setEditing(mapped);
        return;
      }
      throw new Error("Empty response");
    } catch (e: any) {
      const local = rows.find((x) => x.id === id) || null;
      if (local) setEditing(local);
      const data = e?.response?.data;
      const msg =
        data?.message ||
        (Array.isArray(data?.errors) ? data.errors.join(", ") : undefined) ||
        data?.error ||
        e?.message ||
        "An unexpected error occurred";
      setEditingError(String(msg));
    }
  };

  // update
  const handleUpdate = async (id: number, payload: SemesterCreatePayload) => {
    setEditingError(null);
    setSavingEdit(true);
    const body: SemesterCreatePayload = {
      name: payload.name.trim(),
      year: Number(payload.year),
      number: Number(payload.number),
      batchId: Number(payload.batchId),
    };
    try {
      const res = await api.put(`/v1/semesters/Update/${id}`, body);
      const d = res?.data?.data ?? res?.data;
      if (res && res.status >= 200 && res.status < 300) {
        if (d) {
          const mapped: Semester = {
            id: d.id,
            name: d.name,
            year: d.year,
            number: d.number,
            batchId: d.batchId ?? d.batch?.id ?? body.batchId,
          };
          setRows((prev) =>
            prev
              .map((x) => (x.id === id ? mapped : x))
              .slice()
              .sort((a, b) => a.id - b.id)
          );
        }
        setEditing(null);
      }
    } catch (e: any) {
      const data = e?.response?.data;
      const msg =
        data?.message ||
        (Array.isArray(data?.errors) ? data.errors.join(", ") : undefined) ||
        data?.error ||
        e?.message ||
        "An unexpected error occurred";
      setEditingError(String(msg));
    } finally {
      setSavingEdit(false);
    }
  };
  const handleCreate = async (payload: SemesterCreatePayload) => {
    setCreatingError(null);
    setSavingCreate(true);
    const body: SemesterCreatePayload = {
      name: payload.name.trim(),
      year: Number(payload.year),
      number: Number(payload.number),
      batchId: Number(payload.batchId),
    };
    try {
      const res = await api.post(`/v1/semesters/Create`, body);
      if (res && res.status >= 200 && res.status < 300) {
        setCreating(false);
        setReloadKey((k) => k + 1);
      }
    } catch (e: any) {
      const data = e?.response?.data;
      const msg =
        data?.message ||
        (Array.isArray(data?.errors) ? data.errors.join(", ") : undefined) ||
        data?.error ||
        e?.message ||
        "An unexpected error occurred";
      setCreatingError(String(msg));
    } finally {
      setSavingCreate(false);
    }
  };

  return (
    <div>
      {/* Top toolbar (shared classes) */}
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
          <label className="app-field field-inline">
            <span className="app-label">Page</span>
            <input
              className="app-input w-90px"
              type="number"
              min={0}
              value={page}
              onChange={(e) => {
                const v = Number(e.target.value);
                setPage(Number.isFinite(v) && v >= 0 ? v : 0);
              }}
            />
          </label>

          <label className="app-field field-inline ml-8">
            <span className="app-label">Size</span>
            <select
              className="app-input w-110px"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>

          <button className="add-user-btn ml-8" onClick={() => setCreating(true)}>
            <FaPlus className="icon-left-gap" />
            Add Semester
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Id</th>
              <th onClick={() => toggleSort("name")}>
                Name {sortIcon("name")}
              </th>
              <th onClick={() => toggleSort("year")}>
                Year {sortIcon("year")}
              </th>
              <th onClick={() => toggleSort("number")}>
                Number {sortIcon("number")}
              </th>
              <th onClick={() => toggleSort("batchId")}>
                Batch Id {sortIcon("batchId")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6}>Loading...</td>
              </tr>
            )}

            {!loading && view.length === 0 && (
              <tr>
                <td colSpan={6}>No data</td>
              </tr>
            )}

            {!loading &&
              view.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.name}</td>
                  <td>{s.year}</td>
                  <td>{s.number}</td>
                  <td>
                    {(() => {
                      const b = batches.find((x) => x.id === (s.batchId ?? 0));
                      const f = faculties.find(
                        (ff) => ff.id === (b?.facultyId ?? 0)
                      );
                      const facCode = f?.code ?? f?.shortName ?? "";
                      const label = [b?.name ?? "", facCode]
                        .filter(Boolean)
                        .join(" ")
                        .trim();
                      return label || String(s.batchId);
                    })()}
                  </td>
                  <td className="actions">
                    <button
                      className="icon-btn"
                      title="View"
                      onClick={() => handleView(s.id)}
                    >
                      <FaEye className="icon view-icon" />
                    </button>
                    <button
                      className="icon-btn"
                      title="Edit"
                      onClick={() => handleOpenEdit(s.id)}
                    >
                      <MdEdit className="icon edit-icon" />
                    </button>
                    <button
                      className="icon-btn"
                      title="Delete"
                      onClick={() => askDelete(s)}
                    >
                      <MdDelete className="icon delete-icon" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Pager (match user-management style, styled via table.css) */}
        <div className="custom-pagination">
          <div className="pagination-left"></div>
          <div className="pagination-right">
            <button
              className="page-btn"
              onClick={() => setPage(0)}
              disabled={page <= 0}
              aria-label="First page"
            >
              <FaAngleDoubleLeft />
            </button>
            <button
              className="page-btn"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page <= 0}
              aria-label="Previous page"
            >
              <FaAngleLeft />
            </button>
            <button className="page-number active" aria-current="page">
              {page + 1}
            </button>
            <span className="page-ellipsis">/ {totalPages}</span>
            <button
              className="page-btn"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page + 1 >= totalPages}
              aria-label="Next page"
            >
              <FaAngleRight />
            </button>
            <button
              className="page-btn"
              onClick={() => setPage(Math.max(0, totalPages - 1))}
              disabled={page + 1 >= totalPages}
              aria-label="Last page"
            >
              <FaAngleDoubleRight />
            </button>
          </div>
        </div>
      </div>

      {/* View modal */}
      {viewing && (
        <div className="app-modal-backdrop" role="dialog" aria-modal="true">
          <div
            className="app-modal app-modal--draggable"
            onClick={(e) => e.stopPropagation()}
            ref={viewModalRef}
          >
            <div
              className="app-modal__header is-draggable"
              onMouseDown={viewDrag.onMouseDown}
            >
              <h3 className="app-modal__title">Semester Details</h3>
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
              {viewingError && (
                <div className="app-error">
                  {viewingError}
                </div>
              )}
              <div className="app-grid">
                <div className="app-field">
                  <span className="app-label">Id</span>
                  <div className="app-input app-input--readonly">
                    {String(viewing.id)}
                  </div>
                </div>
                <div className="app-field app-grid--2">
                  <span className="app-label">Name</span>
                  <div className="app-input app-input--readonly">
                    {viewing.name}
                  </div>
                </div>
                <div className="app-field">
                  <span className="app-label">Year</span>
                  <div className="app-input app-input--readonly">
                    {viewing.year}
                  </div>
                </div>
                <div className="app-field">
                  <span className="app-label">Number</span>
                  <div className="app-input app-input--readonly">
                    {viewing.number}
                  </div>
                </div>
                <div className="app-field">
                  <span className="app-label">Batch Id</span>
                  <div className="app-input app-input--readonly">
                    {(() => {
                      const bid = (viewing as any)?.batchId ?? (viewing as any)?.batch?.id;
                      const b = batches.find((x) => x.id === (bid ?? 0));
                      const f = faculties.find((ff) => ff.id === (b?.facultyId ?? 0));
                      const label = [b?.name, f?.code].filter(Boolean).join(" ");
                      return label || (bid != null ? String(bid) : "-");
                    })()}
                  </div>
                </div>

                {viewing.batch && (
                  <>
                    <div className="app-field app-grid--2">
                      <span className="app-label">Batch Name</span>
                      <div className="app-input app-input--readonly">
                        {viewing.batch.name}
                      </div>
                    </div>
                    <div className="app-field">
                      <span className="app-label">Batch Start Year</span>
                      <div className="app-input app-input--readonly">
                        {viewing.batch.startYear}
                      </div>
                    </div>
                    <div className="app-field">
                      <span className="app-label">Batch Duration Years</span>
                      <div className="app-input app-input--readonly">
                        {viewing.batch.durationYears}
                      </div>
                    </div>
                  </>
                )}

                {viewing.batch?.faculty && (
                  <>
                    <div className="app-field">
                      <span className="app-label">Faculty Id</span>
                      <div className="app-input app-input--readonly">
                        {viewing.batch.faculty.id}
                      </div>
                    </div>
                    <div className="app-field">
                      <span className="app-label">Faculty Code</span>
                      <div className="app-input app-input--readonly">
                        {viewing.batch.faculty.code}
                      </div>
                    </div>
                    <div className="app-field app-grid--2">
                      <span className="app-label">Faculty Name</span>
                      <div className="app-input app-input--readonly">
                        {viewing.batch.faculty.facultyName}
                      </div>
                    </div>
                    <div className="app-field">
                      <span className="app-label">Degree Title</span>
                      <div className="app-input app-input--readonly">
                        {viewing.batch.faculty.degreeTitle || "-"}
                      </div>
                    </div>
                    <div className="app-field">
                      <span className="app-label">Short Name</span>
                      <div className="app-input app-input--readonly">
                        {viewing.batch.faculty.shortName || "-"}
                      </div>
                    </div>
                    <div className="app-field">
                      <span className="app-label">Email</span>
                      <div className="app-input app-input--readonly">
                        {viewing.batch.faculty.email || "-"}
                      </div>
                    </div>
                    <div className="app-field">
                      <span className="app-label">Phone</span>
                      <div className="app-input app-input--readonly">
                        {viewing.batch.faculty.phone || "-"}
                      </div>
                    </div>
                    <div className="app-field app-grid--2">
                      <span className="app-label">Website</span>
                      <div className="app-input app-input--readonly">
                        {viewing.batch.faculty.website || "-"}
                      </div>
                    </div>
                    <div className="app-field">
                      <span className="app-label">Faculty Active</span>
                      <div className="app-input app-input--readonly">
                        {String(viewing.batch.faculty.active ?? true)}
                      </div>
                    </div>
                  </>
                )}

                {viewing.batch?.faculty?.university && (
                  <>
                    <div className="app-field">
                      <span className="app-label">University Id</span>
                      <div className="app-input app-input--readonly">
                        {viewing.batch.faculty.university.id}
                      </div>
                    </div>
                    <div className="app-field">
                      <span className="app-label">University Code</span>
                      <div className="app-input app-input--readonly">
                        {viewing.batch.faculty.university.code}
                      </div>
                    </div>
                    <div className="app-field app-grid--2">
                      <span className="app-label">University Name</span>
                      <div className="app-input app-input--readonly">
                        {viewing.batch.faculty.university.name}
                      </div>
                    </div>
                    <div className="app-field">
                      <span className="app-label">Short Name</span>
                      <div className="app-input app-input--readonly">
                        {viewing.batch.faculty.university.shortName || "-"}
                      </div>
                    </div>
                    <div className="app-field">
                      <span className="app-label">Email</span>
                      <div className="app-input app-input--readonly">
                        {viewing.batch.faculty.university.email || "-"}
                      </div>
                    </div>
                    <div className="app-field">
                      <span className="app-label">Phone</span>
                      <div className="app-input app-input--readonly">
                        {viewing.batch.faculty.university.phone || "-"}
                      </div>
                    </div>
                    <div className="app-field app-grid--2">
                      <span className="app-label">Website</span>
                      <div className="app-input app-input--readonly">
                        {viewing.batch.faculty.university.website || "-"}
                      </div>
                    </div>
                    <div className="app-field app-grid--2">
                      <span className="app-label">Address Line 1</span>
                      <div className="app-input app-input--readonly">
                        {viewing.batch.faculty.university.addressLine1 || "-"}
                      </div>
                    </div>
                    <div className="app-field app-grid--2">
                      <span className="app-label">Address Line 2</span>
                      <div className="app-input app-input--readonly">
                        {viewing.batch.faculty.university.addressLine2 || "-"}
                      </div>
                    </div>
                    <div className="app-field">
                      <span className="app-label">City</span>
                      <div className="app-input app-input--readonly">
                        {viewing.batch.faculty.university.city || "-"}
                      </div>
                    </div>
                    <div className="app-field">
                      <span className="app-label">State</span>
                      <div className="app-input app-input--readonly">
                        {viewing.batch.faculty.university.state || "-"}
                      </div>
                    </div>
                    <div className="app-field">
                      <span className="app-label">Country</span>
                      <div className="app-input app-input--readonly">
                        {viewing.batch.faculty.university.country || "-"}
                      </div>
                    </div>
                    <div className="app-field">
                      <span className="app-label">Postal Code</span>
                      <div className="app-input app-input--readonly">
                        {viewing.batch.faculty.university.postalCode || "-"}
                      </div>
                    </div>
                    <div className="app-field">
                      <span className="app-label">Established Year</span>
                      <div className="app-input app-input--readonly">
                        {viewing.batch.faculty.university.establishedYear ??
                          "-"}
                      </div>
                    </div>
                    <div className="app-field app-grid--2">
                      <span className="app-label">Logo</span>
                      <div className="app-input app-input--readonly">
                        {viewing.batch.faculty.university.logoUrl ? (
                          <img
                            src={viewing.batch.faculty.university.logoUrl}
                            alt="logo"
                            className="img-thumb-50"
                          />
                        ) : (
                          "-"
                        )}
                      </div>
                    </div>
                    <div className="app-field">
                      <span className="app-label">University Active</span>
                      <div className="app-input app-input--readonly">
                        {String(
                          viewing.batch.faculty.university.active ?? true
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="app-modal__actions">
                <button
                  type="button"
                  className="app-btn app-btn--primary"
                  onClick={() => setViewing(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {/* Edit modal */}
      {editing && (
        <SemesterFormModal
          title="Edit Semester"
          initial={{
            name: editing.name,
            year: editing.year,
            number: editing.number,
            batchId: editing.batchId,
          }}
          onCancel={() => setEditing(null)}
          onSubmit={(payload) => handleUpdate(editing.id, payload)}
          error={editingError ?? undefined}
          saving={savingEdit}
          batches={batches}
          faculties={faculties}
        />
      )}
      {creating && (
        <SemesterFormModal
          title="Add Semester"
          onCancel={() => setCreating(false)}
          onSubmit={(payload) => handleCreate(payload)}
          error={creatingError ?? undefined}
          saving={savingCreate}
          batches={batches}
          faculties={faculties}
        />
      )}

      {/* Delete confirmation modal */}
      {showDelete && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
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
                onClick={closeDelete}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-body">
                {toDelete ? (
                  <>
                    Are you sure you want to delete{" "}
                    <strong>{toDelete.name}</strong>?
                  </>
                ) : (
                  "Are you sure you want to delete this semester?"
                )}
              </p>
              {deleteError && (
                <div className="app-error">{deleteError}</div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn-delete danger"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
              <button
                className="btn-delete ghost"
                onClick={closeDelete}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SemesterFormModal({
  title,
  initial,
  onCancel,
  onSubmit,
  error,
  saving,
  batches,
  faculties,
}: {
  title: string;
  initial?: Partial<SemesterCreatePayload>;
  onCancel: () => void;
  onSubmit: (payload: SemesterCreatePayload) => void;
  error?: string;
  saving?: boolean;
  batches: Array<{ id: number; name: string; facultyId?: number }>;
  faculties: Array<{
    id: number;
    code?: string;
    shortName?: string;
    name?: string;
  }>;
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
  const [year, setYear] = useState<number | "">(initial?.year ?? "");
  const [number, setNumber] = useState<number | "">(initial?.number ?? "");
  const [batchId, setBatchId] = useState<number | "">(
    (initial?.batchId as number | undefined) ??
      (batches.length ? batches[0].id : ("" as any))
  );

  // default first batch if none provided and list is available
  useEffect(() => {
    if (
      (initial?.batchId == null || initial?.batchId === undefined) &&
      batches.length &&
      (batchId === "" || batchId == null)
    ) {
      setBatchId(batches[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batches]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      year: Number(year),
      number: Number(number),
      batchId: Number(batchId),
    });
  };

  return (
    <div className="app-modal-backdrop" role="dialog" aria-modal="true">
      <div
        className="app-modal app-modal--draggable"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        <div
          className="app-modal__header is-draggable"
          onMouseDown={drag.onMouseDown}
        >
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
              <span className="app-label">Name</span>
              <input
                className="app-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>

            <label className="app-field">
              <span className="app-label">Year</span>
              <input
                className="app-input"
                type="number"
                value={year as number | ""}
                onChange={(e) =>
                  setYear(e.target.value === "" ? "" : Number(e.target.value))
                }
                required
              />
            </label>

            <label className="app-field">
              <span className="app-label">Number</span>
              <input
                className="app-input"
                type="number"
                value={number as number | ""}
                onChange={(e) =>
                  setNumber(e.target.value === "" ? "" : Number(e.target.value))
                }
                required
              />
            </label>

            <label className="app-field">
              <span className="app-label">Batch Id</span>
              <select
                className="app-input"
                value={batchId as number | ""}
                onChange={(e) =>
                  setBatchId(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                required
              >
                {batches.map((b) => {
                  const f = faculties.find(
                    (ff) => ff.id === (b.facultyId ?? 0)
                  );
                  const facCode = f?.code ?? f?.shortName ?? "";
                  const label = `${(b.name ?? "").toString().trim()} ${(
                    facCode ?? ""
                  )
                    .toString()
                    .trim()}`.trim();
                  return (
                    <option key={b.id} value={b.id}>
                      {label || `Batch #${b.id}`}
                    </option>
                  );
                })}
              </select>
            </label>
          </div>

          <div className="app-modal__actions">
            <button
              type="submit"
              className="app-btn app-btn--primary"
              disabled={!!saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="app-btn"
              onClick={onCancel}
              disabled={!!saving}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
