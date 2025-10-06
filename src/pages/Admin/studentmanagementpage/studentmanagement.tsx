import { useState, useEffect } from 'react';
import Navbarin from '../../../components/Navbar/navbarin.tsx';
import BreadcrumbNav from '../../../components/breadcrumbnav/breadcrumbnav.tsx';
import AdminSidebar from '../../../components/Admin/adminsidebar/adminsidebar.tsx';

import {
    FaChevronDown,
    FaSpinner,
    FaCalendarAlt,
} from 'react-icons/fa';

import { MdEdit, MdDelete } from "react-icons/md";
import { FiSearch } from 'react-icons/fi';
import Pagination from '../../../components/Admin/pagination/pagination.tsx';

import AddStudentForm from '../../../components/Admin/addstudentsform/addstudentsform.tsx';

const statuses = ['All Statuses', 'Active', 'Inactive', 'Pending', 'Banned', 'Suspended'];
const dateOptions = ['Newest', 'Oldest', 'Joined This Month', 'Joined Last 30 Days'];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


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

    const [showAddUserForm, setShowAddUserForm] = useState(false);

    const handleBackdropClick = () => setSidebarOpen(false);

    const handleCreateUser = (user: any) => {
        console.log("New User:", user);
        setShowAddUserForm(false);
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

    const statusColorMap: Record<string, string> = {
        ACTIVE: "#4caf50",      // green
        DROPOUT: "#ff9800",     // orange
        SUSPENDED: "#f44336",   // red
        GRADUATED: "#2196f3",   // blue
    };
    useEffect(() => {
        setLoading(true);
        const token = localStorage.getItem('token');
        fetch(`${API_BASE_URL}/v1/students`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(data => {
                setStudent(Array.isArray(data.data) ? data.data : []);
                setLoading(false);
            })
            .catch(() => {
                setStudent([]);
                setLoading(false);
            });
    }, []);

    return (
        <div className="admin-dashboard-container">
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
                    {!showAddUserForm && (
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

                                        <button className="add-user-btn" onClick={() => setShowAddUserForm(true)}>
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
                                                        <td className='action'>
                                                            <MdEdit className="icon edit-icon" />
                                                            <MdDelete className="icon delete-icon" />
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

                    {showAddUserForm && (
                        <AddStudentForm
                            onClose={() => setShowAddUserForm(false)}
                            onCreate={handleCreateUser}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentManagement;
