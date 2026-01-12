import { useState, useEffect } from "react";
import "../../../index.css";
import Navbarin from "../../../components/Navbar/navbarin.tsx";
import BreadcrumbNav from "../../../components/breadcrumbnav/breadcrumbnav.tsx";
import AdminSidebar from "../../../components/Admin/adminsidebar/adminsidebar.tsx";
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import "./studentmanagement.css";
import { FaChevronDown, FaSpinner, FaCalendarAlt } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import Pagination from "../../../components/Admin/pagination/pagination.tsx";

import AddStudentForm from "../../../components/Admin/addstudentsform/addstudentsform.tsx";

const statuses = [
  "All Statuses",
  "Active",
  "Inactive",
  "Pending",
  "Banned",
  "Suspended",
];
const dateOptions = [
  "Newest",
  "Oldest",
  "Joined This Month",
  "Joined Last 30 Days",
];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import { Popconfirm, message } from "antd";
import dayjs from "dayjs";

const statusColors: Record<string, string> = {
  Active: "active",
  Inactive: "inactive",
  Banned: "banned",
  Pending: "pending",
  Suspended: "suspended",
};

const StudentManagement: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState("Status");
  const [selectedDate, setSelectedDate] = useState("Date");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "view" | "edit">(
    "create"
  );
  const [selectStudentId, setSelectStudentId] = useState<number | null>(null);

  const handleBackdropClick = () => setSidebarOpen(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleCreateUser = (user: any) => {
    console.log("New User:", user);
    // setShowAddUserForm(false);
    setShowForm(false);
  };

  const handleSelectStatus = (status: string) => {
    setSelectedStatus(status);
    setIsStatusOpen(false);
  };

  const handleSelectDate = (option: string) => {
    setSelectedDate(option);
    setIsDateOpen(false);
  };

  const toggleStatusDropdown = () => {
    setIsStatusOpen((prev) => !prev);
    setIsDateOpen(false);
  };

  const toggleDateDropdown = () => {
    setIsDateOpen((prev) => !prev);
    setIsStatusOpen(false);
  };

  const [Student, setStudent] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const statusColorMap: Record<string, string> = {
    ACTIVE: "#4caf50", // green
    DROPOUT: "#ff9800", // orange
    SUSPENDED: "#f44336", // red
    GRADUATED: "#2196f3", // blue
  };
  const token = localStorage.getItem("token");
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        page: String(page - 1),
        size: String(pageSize),
      });
      // Keep backend-provided order; do not enforce a sort
      // attach optional filters for backend if supported
      const normalizeStatus = (s: string) => {
        const map: Record<string, string> = {
          Active: "ACTIVE",
          Inactive: "INACTIVE",
          Pending: "PENDING",
          Banned: "BANNED",
          Suspended: "SUSPENDED",
        };
        return map[s] || s;
      };
      if (selectedStatus && selectedStatus !== "Status" && selectedStatus !== "All Statuses") {
        qs.set("status", normalizeStatus(selectedStatus));
      }
      if (searchTerm.trim()) {
        qs.set("search", searchTerm.trim());
      }
      if (selectedDate && selectedDate !== "Date") {
        const now = dayjs();
        let from: any = null;
        if (selectedDate === "Joined This Month") from = now.startOf("month");
        if (selectedDate === "Joined Last 30 Days") from = now.subtract(30, "day");
        if (from) {
          qs.set("from", from.toISOString());
          qs.set("to", now.toISOString());
        }
      }
      let res = await fetch(`${API_BASE_URL}/v1/students?${qs.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        // fallback to alt endpoint (no pagination) if first call fails
        res = await fetch(`${API_BASE_URL}/v1/students/GetAll`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
      const json = await res.json().catch(() => ({}));
      const payload: any = json?.data;
      let list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.content)
        ? payload.content
        : Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload?.records)
        ? payload.records
        : Array.isArray(payload?.students)
        ? payload.students
        : [];
      // Client-side fallback filtering
      const term = searchTerm.trim().toLowerCase();
      if (
        term ||
        (selectedStatus && selectedStatus !== "Status" && selectedStatus !== "All Statuses") ||
        (selectedDate && selectedDate !== "Date")
      ) {
        const statusCodeMap: Record<string, string> = {
          Active: "ACTIVE",
          Inactive: "INACTIVE",
          Pending: "PENDING",
          Banned: "BANNED",
          Suspended: "SUSPENDED",
        };
        const statusCode = statusCodeMap[selectedStatus] || selectedStatus;
        const now = dayjs();
        let from: any = null;
        if (selectedDate === "Joined This Month") from = now.startOf("month");
        if (selectedDate === "Joined Last 30 Days") from = now.subtract(30, "day");
        const inDateRange = (it: any) => {
          if (!from) return true;
          const d = it.createdAt || it.joinedAt || it.registeredAt;
          if (!d) return true;
          const dt = dayjs(d);
          return dt.isAfter(from) && dt.isBefore(now.add(1, "second"));
        };
        const matches = (it: any) => {
          const statusOk =
            selectedStatus === "Status" || selectedStatus === "All Statuses"
              ? true
              : String(it.studentStatus || "").toUpperCase() === statusCode;
          const termOk = !term
            ? true
            : [
                it.firstName,
                it.lastName,
                it.registrationNumber || it.regNumber || it.regNo,
                it.email,
                it.phoneNumber,
                it.gender,
                it.batch?.name || it.batchName,
                it.department?.departmentName || it.departmentName,
                it.address?.city,
              ]
                .filter(Boolean)
                .some((v: any) => String(v).toLowerCase().includes(term));
          return statusOk && termOk && inDateRange(it);
        };
        list = list.filter(matches);
      }
      setStudent(list);
      const totalVal =
        (typeof payload?.totalElements === "number" && payload.totalElements) ||
        (typeof payload?.total === "number" && payload.total) ||
        (typeof json?.total === "number" && json.total) ||
        (typeof json?.data?.total === "number" && json.data.total) ||
        (Array.isArray(payload) ? payload.length : list.length);
      setTotal(totalVal);
    } catch (error: any) {
      setStudent([]);
      setTotal(0);
      setLoadError(error?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, selectedStatus, selectedDate, searchTerm]);

  const handleDeleteStudent = async (id: number) => {
    if (!token) {
      message.error("You are not authenticated.");
      messageApi.error("You are not authenticated.");
      return;
    }
    try {
      setDeletingId(id);
      const res = await fetch(`${API_BASE_URL}/v1/students/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        message.error(data?.message || "Failed to delete student");
        messageApi.error(data?.message || "Failed to delete student");
        return;
      }

      // success: remove from table optimistically
      setStudent((prev) => prev.filter((s) => (s.id ?? s.studentId) !== id));
      message.success(data?.message || "Student deleted");
      messageApi.success(data?.message || "Student deleted");
    } catch (err: any) {
      message.error(err?.message || "Failed to delete student");
      messageApi.error(err?.message || "Failed to delete student");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-dashboard-container">
      {contextHolder}
      <div className="nav">
        <Navbarin />
      </div>

      <div className="breadcrumb">
        <BreadcrumbNav />
      </div>

      <div
        className={`sidebar-backdrop ${isSidebarOpen ? "active" : ""}`}
        onClick={handleBackdropClick}
      ></div>

      <div className="main-area">
        <div className={`sidebar ${isSidebarOpen ? "active" : ""}`}>
          <AdminSidebar />
        </div>

        <div className="dashboard-content">
          {!showForm && (
            <div className="dashboard-cards">
              <div className="cardcourse">
                <h3 className="user-management-header">Student Management</h3>
                <div className="user-management-header">
                  <div className="custom-searchbar">
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    />
                    <FiSearch className="search-icon" />
                  </div>

                  <div className="filters">
                    <div className="custom-dropdown">
                      <button
                        className="dropdown-toggle"
                        onClick={toggleStatusDropdown}
                      >
                        <FaSpinner className="icon spin" />
                        <span>{selectedStatus}</span>
                        <FaChevronDown className="chevron" />
                      </button>
                      {isStatusOpen && (
                        <ul className="dropdown-menu">
                          {statuses.map((status, index) => (
                            <li
                              key={index}
                              onClick={() => { handleSelectStatus(status); setPage(1); }}
                            >
                              {status}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="custom-dropdown">
                      <button
                        className="dropdown-toggle"
                        onClick={toggleDateDropdown}
                      >
                        <FaCalendarAlt className="icon" />
                        <span>{selectedDate}</span>
                        <FaChevronDown className="chevron" />
                      </button>
                      {isDateOpen && (
                        <ul className="dropdown-menu">
                          {dateOptions.map((option, index) => (
                            <li
                              key={index}
                              onClick={() => { handleSelectDate(option); setPage(1); }}
                            >
                              {option}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <button
                      className="add-user-btn"
                      onClick={() => {
                        setFormMode("create");
                        setSelectStudentId(null);
                        setShowForm(true);
                      }}
                    >
                      Add Student +
                    </button>
                  </div>
                </div>

                                {loadError && (
                                  <div style={{margin:'8px 0', color:'#b91c1c'}}>Error: {loadError}</div>
                                )}
                                <div className="table-wrapper">
                  <table className="user-table">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Full Name</th>
                        <th>Reg No</th>
                        <th>Username</th>
                        <th>Phone No</th>
                        <th>Gender</th>
                        <th>DOB</th>
                        <th>Batch</th>
                        <th>Department</th>
                        <th>Address</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={12}> loading...</td>
                        </tr>
                      ) : Student.length === 0 ? (
                        <tr>
                          <td colSpan={12}> No data available</td>
                        </tr>
                      ) : (
                        Student.map((student, i) => (
                          <tr key={
                            student.id ||
                            student.studentId ||
                            student.registrationNumber ||
                            student.regNumber ||
                            student.regNo ||
                            i
                          }>
                            <td>{(page - 1) * pageSize + i + 1}</td>
                            <td>
                              {student.firstName} {student.lastName}
                            </td>
                            <td>
                              {student.registrationNumber ??
                                student.regNumber ??
                                student.regNo ??
                                "-"}
                            </td>
                            <td>{student.email}</td>
                            <td>{student.phoneNumber}</td>
                            <td>{student.gender}</td>
                            <td>{student.dateOfBirth}</td>
                            <td>
                              {student.batch?.name ?? student.batchName ?? "-"}
                            </td>
                            <td>
                              {student.department?.departmentName ??
                                student.departmentName ??
                                "-"}
                            </td>
                            <td>{student.address?.city ?? "-"}</td>
                            <td>
                              <span
                                style={{
                                  color: "#fff",
                                  backgroundColor:
                                    statusColorMap[student.studentStatus] ||
                                    "#757575",
                                  padding: "2px 10px",
                                  borderRadius: "12px",
                                  fontWeight: 500,
                                  fontSize: "0.95em",
                                  display: "inline-block",
                                  minWidth: "80px",
                                  textAlign: "center",
                                }}
                              >
                                {student.studentStatus}
                              </span>
                            </td>
                            <td className="action py-2">
                              <div className="student-action-group">
                                <button
                                  className="action-btn view-btn"
                                  title="View Details"
                                  onClick={() => {
                                    setFormMode("view");
                                    setSelectStudentId(student.id);
                                    setShowForm(true);
                                  }}
                                >
                                  <FaEye />
                                </button>

                                <button
                                  className="action-btn edit-btn"
                                  title="Edit"
                                  onClick={() => {
                                    setFormMode("edit");
                                    setSelectStudentId(
                                      student.id ?? student.studentId
                                    );
                                    setShowForm(true);
                                  }}
                                >
                                  <FaEdit />
                                </button>

                                <Popconfirm
                                  title="Delete student?"
                                  description="This action cannot be undone."
                                  okText="Delete"
                                  okButtonProps={{
                                    danger: true,
                                    loading:
                                      deletingId ===
                                      (student.id ?? student.studentId),
                                  }}
                                  cancelText="Cancel"
                                  onConfirm={() =>
                                    handleDeleteStudent(
                                      student.id ?? student.studentId
                                    )
                                  }
                                >
                                  <button
                                    className="action-btn delete-btn"
                                    title="Delete"
                                    disabled={
                                      deletingId ===
                                      (student.id ?? student.studentId)
                                    }
                                  >
                                    <FaTrashAlt />
                                  </button>
                                </Popconfirm>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="pagination">
                  <Pagination
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={(p) => setPage(p)}
                    onPageSizeChange={(s) => {
                      setPageSize(s);
                      setPage(1);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {showForm && (
            <AddStudentForm
              mode={formMode}
              studentId={selectStudentId ?? undefined}
              onClose={() => setShowForm(false)}
              onCreate={() => {
                setShowForm(false);
                fetchStudents(); // refresh after create
                messageApi.success("Student created successfully");
              }}
              onUpdate={() => {
                setShowForm(false);
                fetchStudents(); // refresh after edit
                messageApi.success("Student updated successfully");
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;


