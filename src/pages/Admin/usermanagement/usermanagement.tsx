import { useState } from 'react';
import Navbarin from '../../../components/Navbar/navbarin.tsx';
import BreadcrumbNav from '../../../components/breadcrumbnav/breadcrumbnav.tsx';
import AdminSidebar from '../../../components/Admin/adminsidebar/adminsidebar.tsx';
import './usermanagement.css';
import {
    FaUser,
    FaChevronDown,
    FaSpinner,
    FaCalendarAlt,
    
} from 'react-icons/fa';

import { MdEdit, MdDelete } from "react-icons/md";

import { FiSearch } from 'react-icons/fi';
import Pagination from '../../../components/Admin/pagination/pagination.tsx';

const roles = ['All Roles', 'Admin', 'Moderator', 'User', 'Guest'];
const statuses = ['All Statuses', 'Active', 'Inactive', 'Pending', 'Banned', 'Suspended'];
const dateOptions = ['Newest', 'Oldest', 'Joined This Month', 'Joined Last 30 Days'];

const users = [
    {
        name: "John Smith",
        email: "john.smith@gmail.com",
        username: "eg20204023",
        status: "Active",
        role: "Admin",
        joined: "March 12, 2023",
        active: "1 minute ago",
    },
    {
        name: "Olivia Bennett",
        email: "ollyben@gmail.com",
        username: "eg20204025",
        status: "Inactive",
        role: "User",
        joined: "June 27, 2022",
        active: "1 month ago",
    },
    
     {
        name: "John Smith",
        email: "john.smith@gmail.com",
        username: "eg20204023",
        status: "Banned",
        role: "Admin",
        joined: "March 12, 2023",
        active: "1 minute ago",
    },
];

const statusColors: Record<string, string> = {
    Active: "active",
    Inactive: "inactive",
    Banned: "banned",
    Pending: "pending",
    Suspended: "suspended",
};

const UserManagement: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isRoleOpen, setIsRoleOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isDateOpen, setIsDateOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState('Roles');
    const [selectedStatus, setSelectedStatus] = useState('Status');
    const [selectedDate, setSelectedDate] = useState('Date');

    const handleBackdropClick = () => setSidebarOpen(false);

    const toggleRoleDropdown = () => {
        setIsRoleOpen(!isRoleOpen);
        setIsStatusOpen(false);
        setIsDateOpen(false);
    };

    const toggleStatusDropdown = () => {
        setIsStatusOpen(!isStatusOpen);
        setIsRoleOpen(false);
        setIsDateOpen(false);
    };

    const toggleDateDropdown = () => {
        setIsDateOpen(!isDateOpen);
        setIsRoleOpen(false);
        setIsStatusOpen(false);
    };

    const handleSelectRole = (role: string) => {
        setSelectedRole(role);
        setIsRoleOpen(false);
    };

    const handleSelectStatus = (status: string) => {
        setSelectedStatus(status);
        setIsStatusOpen(false);
    };

    const handleSelectDate = (option: string) => {
        setSelectedDate(option);
        setIsDateOpen(false);
    };

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
                    <div className="dashboard-cards">
                        
                        <div className="cardcourse">
                            <h3>User Management</h3>
                            <div className="user-management-header">
                                {/* Search Bar */}
                                <div className="custom-searchbar">
                                    <input type="text" placeholder="Search…" />
                                    <FiSearch className="search-icon" />
                                </div>

                                {/* Filters */}
                                <div className="filters">
                                    {/* Role Dropdown */}
                                    <div className="custom-dropdown">
                                        <button className="dropdown-toggle" onClick={toggleRoleDropdown}>
                                            <FaUser className="icon" />
                                            <span>{selectedRole}</span>
                                            <FaChevronDown className="chevron" />
                                        </button>
                                        {isRoleOpen && (
                                            <ul className="dropdown-menu">
                                                {roles.map((role, index) => (
                                                    <li key={index} onClick={() => handleSelectRole(role)}>
                                                        {role}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    {/* Status Dropdown */}
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

                                    {/* Date Dropdown */}
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

                                    <button className="add-user-btn">Add User +</button>
                                </div>
                            </div>

                            {/* User Table */}
                            <div className="table-wrapper">
                            <table className="user-table">
                                <thead>
                                    <tr>
                                        <th>Full Name</th>
                                        <th>Email</th>
                                        <th>Username</th>
                                        <th>Status</th>
                                        <th>Role</th>
                                        <th>Joined Date</th>
                                        <th>Last Active</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u, i) => (
                                        <tr key={i}>
                                            <td>{u.name}</td>
                                            <td>{u.email}</td>
                                            <td>{u.username}</td>
                                            <td>
                                                <span className={`status-badge ${statusColors[u.status]}`}>
                                                    {u.status}
                                                </span>
                                            </td>
                                            <td>{u.role}</td>
                                            <td>{u.joined}</td>
                                            <td>{u.active}</td>
                                            <td className="actions">
                                                <td className="actions">
                                                    <MdEdit className="icon edit-icon" />
                                                    <MdDelete className="icon delete-icon" />
                                                </td>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </div>

                            {/* Pagination */}
                            <div className="pagination">
                               
                               <Pagination/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
