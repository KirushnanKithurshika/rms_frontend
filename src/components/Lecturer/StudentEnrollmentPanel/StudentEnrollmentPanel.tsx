import React, { useEffect, useMemo, useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import "./StudentEnrollmentPanel.css";
import { useAppSelector } from "../../../app/hooks";
import { selectUserId } from "../../../features/auth/selectors";
import api from "../../../services/api";
import { toast } from "react-toastify";

type AllocationItem = {
  allocationId: number;
  courseType: string;
  course: { id: number; courseCode: string; courseName: string };
  semester: { id: number; name: string; batchName?: string };
};

type EnrollmentRow = {
  id: number;
  studentId: number;
  regNo: string;
  name: string;
  email: string;
  batchName: string;
  departmentName: string;
  status: string;
  repeat: boolean;
  grade: number | null;
};

type UploadSummary = {
  totalRows: number;
  successCount: number;
  failedCount: number;
  errors: string[];
};

const StudentEnrollmentPanel: React.FC = () => {
  const userId = useAppSelector(selectUserId);

  const [lecturerId, setLecturerId] = useState<number | null>(null);
  const [allocations, setAllocations] = useState<AllocationItem[]>([]);
  const [allocationsLoading, setAllocationsLoading] = useState(false);
  const [selectedAllocationId, setSelectedAllocationId] = useState<number | null>(null);

  const [students, setStudents] = useState<EnrollmentRow[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSummary, setUploadSummary] = useState<UploadSummary | null>(null);
  const [uploading, setUploading] = useState(false);

  // Resolve lecturerId from logged in userId
  useEffect(() => {
    const mapLecturer = async () => {
      if (!userId) return;
      try {
        const r = await api.get(`/v1/lecturers/GetByUserId/${userId}`);
        const d = r.data?.data ?? r.data;
        const lid = Number(d?.id) || null;
        setLecturerId(lid);
      } catch (e: any) {
        const msg =
          e?.response?.data?.message || e?.message || "Failed to resolve lecturer";
        setError(msg);
        toast.error(msg);
      }
    };
    mapLecturer();
  }, [userId]);

  // Load course allocations for this lecturer
  useEffect(() => {
    const loadAllocations = async () => {
      if (!lecturerId) return;
      setAllocationsLoading(true);
      setError(null);
      try {
        const res = await api.get(`../lecturers/${lecturerId}/allocations`);
        const data = res.data?.data ?? res.data;
        const list: AllocationItem[] = Array.isArray(data) ? data : [];
        setAllocations(list);
        if (!selectedAllocationId && list.length > 0) {
          setSelectedAllocationId(list[0].allocationId);
        }
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Failed to load course allocations";
        setError(msg);
        toast.error(msg);
      } finally {
        setAllocationsLoading(false);
      }
    };
    loadAllocations();
    // we intentionally ignore selectedAllocationId in deps to avoid resetting on user change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lecturerId]);

  // Load enrolled students when allocation changes
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedAllocationId) {
        setStudents([]);
        return;
      }
      setStudentsLoading(true);
      setError(null);
      try {
        const res = await api.get(
          `/v1/enrolled-courses/GetByCourseAllocation/${selectedAllocationId}`,
          {
            params: { page: 0, size: 50 },
          }
        );
        const payload = res.data?.data ?? res.data;
        const content: any[] = Array.isArray(payload?.content)
          ? payload.content
          : [];
        const mapped: EnrollmentRow[] = content.map((item) => ({
          id: Number(item.id),
          studentId: Number(item.student?.id),
          regNo: item.student?.registrationNumber ?? "",
          name: `${item.student?.firstName ?? ""} ${
            item.student?.lastName ?? ""
          }`.trim(),
          email: item.student?.email ?? "",
          batchName: item.student?.batchName ?? "",
          departmentName: item.student?.departmentName ?? "",
          status: item.status ?? "",
          repeat: Boolean(item.repeat),
          grade:
            item.grade !== undefined && item.grade !== null
              ? Number(item.grade)
              : null,
        }));
        setStudents(mapped);
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Failed to load enrolled students";
        setError(msg);
        toast.error(msg);
        setStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    };
    loadStudents();
  }, [selectedAllocationId]);

  const selectedAllocation = useMemo(
    () =>
      allocations.find((a) => a.allocationId === selectedAllocationId) ?? null,
    [allocations, selectedAllocationId]
  );

  const handleAllocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const id = Number(val);
    setSelectedAllocationId(Number.isFinite(id) && id > 0 ? id : null);
    setUploadSummary(null);
    setUploadError(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedAllocationId) {
      setUploadError("Please select a course allocation before uploading.");
      e.target.value = "";
      return;
    }

    setUploadError(null);
    setUploadSummary(null);

    try {
      setUploading(true);
      const form = new FormData();
      form.append("courseAllocationId", String(selectedAllocationId));
      form.append("file", file);

      const res = await api.post("../enrollments/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const payload = res.data?.data ?? res.data;
      const summary: UploadSummary = {
        totalRows: Number(payload?.totalRows ?? 0),
        successCount: Number(payload?.successCount ?? 0),
        failedCount: Number(payload?.failedCount ?? 0),
        errors: Array.isArray(payload?.errors) ? payload.errors : [],
      };
      setUploadSummary(summary);

      const msg =
        res.data?.message || "Enrollment file uploaded successfully";
      toast.success(msg);

      // Reload enrolled students list after successful upload
      try {
        const res2 = await api.get(
          `/v1/enrolled-courses/GetByCourseAllocation/${selectedAllocationId}`,
          { params: { page: 0, size: 50 } }
        );
        const payload2 = res2.data?.data ?? res2.data;
        const content2: any[] = Array.isArray(payload2?.content)
          ? payload2.content
          : [];
        const mapped2: EnrollmentRow[] = content2.map((item) => ({
          id: Number(item.id),
          studentId: Number(item.student?.id),
          regNo: item.student?.registrationNumber ?? "",
          name: `${item.student?.firstName ?? ""} ${
            item.student?.lastName ?? ""
          }`.trim(),
          email: item.student?.email ?? "",
          batchName: item.student?.batchName ?? "",
          departmentName: item.student?.departmentName ?? "",
          status: item.status ?? "",
          repeat: Boolean(item.repeat),
          grade:
            item.grade !== undefined && item.grade !== null
              ? Number(item.grade)
              : null,
        }));
        setStudents(mapped2);
      } catch (e2: any) {
        const msg2 =
          e2?.response?.data?.message ||
          e2?.message ||
          "Failed to refresh enrolled students";
        setError(msg2);
        toast.error(msg2);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to upload enrollment file";
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="stu-enroll-panel">
      <div className="stu-enroll-header">
        <h2 className="stu-enroll-title">Student Enrollment</h2>
        <p className="stu-enroll-subtitle">
          Select a course allocation, upload an Excel sheet of students, and view enrolled students below.
        </p>
      </div>

      <div className="stu-enroll-filterbar">
        <div className="stu-enroll-toprow">
          <div className="stu-enroll-field">
            <label>Course Allocation</label>
            <select
              value={selectedAllocationId ?? ""}
              onChange={handleAllocationChange}
              disabled={allocationsLoading}
            >
              <option value="">
                {allocationsLoading ? "Loading..." : "Select Course Allocation"}
              </option>
              {allocations.map((a) => (
                <option key={a.allocationId} value={a.allocationId}>
                  {a.course.courseCode} - {a.course.courseName} (
                  {a.semester.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="stu-enroll-upload">
          <div className="upload-label-row">
            <span className="upload-label">Upload Student List</span>
            <span className="upload-hint">
              Excel (.xlsx) generated from the official template
            </span>
          </div>

          <label className="file-dropzone">
            <div className="file-dropzone-inner">
              <div className="file-icon-circle">
                <FaCloudUploadAlt className="file-upload-icon" />
              </div>
              <div className="file-dropzone-text">
                <span className="file-dropzone-title">
                  {uploading ? "Uploading..." : "Click to choose file"}
                </span>
                <span className="file-dropzone-sub">
                  or drop your enrollment Excel sheet here
                </span>
              </div>
            </div>
            <input
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileUpload}
              disabled={uploading || !selectedAllocationId}
            />
          </label>
        </div>
      </div>

      {error && <div className="stu-enroll-error">{error}</div>}
      {uploadError && <div className="stu-enroll-error">{uploadError}</div>}

      {uploadSummary && (
        <div className="stu-enroll-meta">
          <span>
            <strong>Uploaded Rows:</strong> {uploadSummary.totalRows}
          </span>
          <span>
            <strong>Success:</strong> {uploadSummary.successCount}
          </span>
          <span>
            <strong>Failed:</strong> {uploadSummary.failedCount}
          </span>
          {uploadSummary.errors.length > 0 && (
            <span>
              <strong>Errors:</strong>{" "}
              {uploadSummary.errors.slice(0, 3).join("; ")}
              {uploadSummary.errors.length > 3 ? " ..." : ""}
            </span>
          )}
        </div>
      )}

      {selectedAllocation && (
        <div className="stu-enroll-meta">
          <span>
            <strong>Course:</strong> {selectedAllocation.course.courseCode} -{" "}
            {selectedAllocation.course.courseName}
          </span>
          <span>
            <strong>Semester:</strong> {selectedAllocation.semester.name}
          </span>
          {selectedAllocation.semester.batchName && (
            <span>
              <strong>Batch:</strong> {selectedAllocation.semester.batchName}
            </span>
          )}
          <span>
            <strong>Total Students:</strong> {students.length}
          </span>
        </div>
      )}

      <div className="stu-enroll-table-wrap">
        {studentsLoading ? (
          <div className="stu-enroll-empty">Loading enrolled students...</div>
        ) : !selectedAllocationId ? (
          <div className="stu-enroll-empty">
            Select a course allocation, then upload an Excel file.
          </div>
        ) : students.length === 0 ? (
          <div className="stu-enroll-empty">
            No students to display for this allocation.
          </div>
        ) : (
          <table className="stu-enroll-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Reg No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Batch</th>
                <th>Department</th>
                <th>Status</th>
                <th>Repeat</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => (
                <tr key={s.id}>
                  <td>{idx + 1}</td>
                  <td>{s.regNo}</td>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.batchName}</td>
                  <td>{s.departmentName}</td>
                  <td>{s.status}</td>
                  <td>{s.repeat ? "Yes" : "No"}</td>
                  <td>{s.grade ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StudentEnrollmentPanel;
