import { useState, useEffect } from 'react';
import '../../../index.css';
import Navbarin from '../../../components/Navbar/navbarin.tsx';
import BreadcrumbNav from '../../../components/breadcrumbnav/breadcrumbnav.tsx';
import AdminSidebar from '../../../components/Admin/adminsidebar/adminsidebar.tsx';
import { ArrowsAltOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
    FaChevronDown,
    FaSpinner,
    FaCalendarAlt,
} from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import Pagination from '../../../components/Admin/pagination/pagination.tsx';

import AddStudentForm from '../../../components/Admin/addstudentsform/addstudentsform.tsx';

const statuses = ['All Statuses', 'Active', 'Inactive', 'Pending', 'Banned', 'Suspended'];
const dateOptions = ['Newest', 'Oldest', 'Joined This Month', 'Joined Last 30 Days'];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import { Popconfirm, message } from "antd";


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

    const [selectedStatus, setSelectedStatus] = useState('Status');
    const [selectedDate, setSelectedDate] = useState('Date');

    // const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'view' | 'edit'>('create');
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
        setIsStatusOpen(prev => !prev);
        setIsDateOpen(false);
    };

    const toggleDateDropdown = () => {
        setIsDateOpen(prev => !prev);
        setIsStatusOpen(false);
    };

    const [Student, setStudent] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const statusColorMap: Record<string, string> = {
        ACTIVE: "#4caf50",      // green
        DROPOUT: "#ff9800",     // orange
        SUSPENDED: "#f44336",   // red
        GRADUATED: "#2196f3",   // blue
    };
    const token = localStorage.getItem('token');
    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/v1/students`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            const data = await res.json();
            setStudent(Array.isArray(data.data) ? data.data : []);
        } catch (error) {
            setStudent([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

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
                className={`sidebar-backdrop ${isSidebarOpen ? 'active' : ''}`}
                onClick={handleBackdropClick}
            ></div>

            <div className="main-area">
                <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
                    <AdminSidebar />
                </div>

                <div className="dashboard-content">
                    {!showForm && (
                        <div className="dashboard-cards">
                            <div className="cardcourse">
                                <h3>Student Management</h3>
                                <div className="user-management-header">
                                    <div className="custom-searchbar">
                                        <input type="text" placeholder="Search…" />
                                        <FiSearch className="search-icon" />
                                    </div>

                                    <div className="filters">
                                        <div className="custom-dropdown">
                                            <button className="dropdown-toggle" onClick={toggleStatusDropdown}>
                                                <FaSpinner className="icon spin" />
                                                <span>{selectedStatus}</span>
                                                <FaChevronDown className="chevron" />
                                            </button>
                                            {isStatusOpen && (
                                                <ul className="dropdown-menu">
                                                    {statuses.map((status, index) => (
                                                        <li key={index} onClick={() => handleSelectStatus(status)}>
                                                            {status}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>

                                        <div className="custom-dropdown">
                                            <button className="dropdown-toggle" onClick={toggleDateDropdown}>
                                                <FaCalendarAlt className="icon" />
                                                <span>{selectedDate}</span>
                                                <FaChevronDown className="chevron" />
                                            </button>
                                            {isDateOpen && (
                                                <ul className="dropdown-menu">
                                                    {dateOptions.map((option, index) => (
                                                        <li key={index} onClick={() => handleSelectDate(option)}>
                                                            {option}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>

                                        <button className="add-user-btn" onClick={() => { setFormMode('create'); setSelectStudentId(null); setShowForm(true); }}>
                                            Add Student +
                                        </button>
                                    </div>
                                </div>

                                <div className="table-wrapper">
                                    <table className="user-table">
                                        <thead>
                                            <tr>
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
                                                    <td colSpan={9}> loading...</td>
                                                </tr>
                                            ) : Student.length === 0 ? (
                                                <tr>
                                                    <td colSpan={9}> No data available</td>
                                                </tr>
                                            ) : (
                                                Student.map((student, i) => (
                                                    <tr key={student.id || i}>
                                                        <td>{student.firstName} {student.lastName}</td>
                                                        <td>{student.registrationNumber}</td>
                                                        <td>{student.email}</td>
                                                        <td>{student.phoneNumber}</td>
                                                        <td>{student.gender}</td>
                                                        <td>{student.dateOfBirth}</td>
                                                        <td>{student.batch?.name}</td>
                                                        <td>{student.department?.departmentName}</td>
                                                        <td>{student.address?.city}</td>
                                                        <td>
                                                            <span
                                                                style={{
                                                                    color: "#fff",
                                                                    backgroundColor: statusColorMap[student.studentStatus] || "#757575",
                                                                    padding: "2px 10px",
                                                                    borderRadius: "12px",
                                                                    fontWeight: 500,
                                                                    fontSize: "0.95em",
                                                                    display: "inline-block",
                                                                    minWidth: "80px",
                                                                    textAlign: "center"
                                                                }}
                                                            >
                                                                {student.studentStatus}
                                                            </span>
                                                        </td>
                                                        <td className="action py-2">
                                                            <div className="flex items-center justify-center gap-3">
                                                                <button
                                                                    className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200 hover:scale-110"
                                                                    title="View Details"
                                                                    onClick={() => {
                                                                        setFormMode('view');
                                                                        setSelectStudentId(student.id);
                                                                        setShowForm(true);
                                                                    }}
                                                                >
                                                                    <ArrowsAltOutlined className="text-lg" />
                                                                </button>

                                                                <button
                                                                    className="p-2 rounded-full bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-all duration-200 hover:scale-110"
                                                                    title="Edit"
                                                                    onClick={() => {
                                                                        setFormMode('edit');
                                                                        setSelectStudentId(student.id ?? student.studentId);
                                                                        setShowForm(true);
                                                                    }}
                                                                >
                                                                    <EditOutlined className="text-lg" />
                                                                </button>


                                                                <Popconfirm
                                                                    title="Delete student?"
                                                                    description="This action cannot be undone."
                                                                    okText="Delete"
                                                                    okButtonProps={{ danger: true, loading: deletingId === (student.id ?? student.studentId) }}
                                                                    cancelText="Cancel"
                                                                    onConfirm={() => handleDeleteStudent(student.id ?? student.studentId)}
                                                                >
                                                                    <button
                                                                        className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 hover:scale-110 disabled:opacity-50"
                                                                        title="Delete"
                                                                        disabled={deletingId === (student.id ?? student.studentId)}
                                                                    >
                                                                        <DeleteOutlined className="text-lg" />
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
                                    <Pagination />
                                </div>
                            </div>
                        </div>
                    )}

                    {showForm && (
                        <AddStudentForm
                            mode={formMode}
                            studentId={selectStudentId ?? undefined}
                            onClose={() => setShowForm(false)}
                            onCreate={(payload) => {
                                setShowForm(false);
                                fetchStudents(); // refresh after create
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
