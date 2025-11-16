import { useState, useEffect } from 'react';
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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import AddUserForm from '../../../components/Admin/adduserform/adduserform.tsx';

const roles = ['All Roles', 'Admin', 'Moderator', 'User', 'Guest'];
const statuses = ['All Statuses', 'Active', 'Inactive', 'Pending', 'Banned', 'Suspended'];
const dateOptions = ['Newest', 'Oldest', 'Joined This Month', 'Joined Last 30 Days'];


const demoUsers = [
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
    const [searchTerm, setSearchTerm] = useState<string>("");

    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
 
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [total, setTotal] = useState<number>(0);

    const handleBackdropClick = () => setSidebarOpen(false);

    const handleCreateUser = (user: any) => {
        console.log("New User:", user);
        setShowAddUserForm(false);
    };

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

    // Fetch users
    useEffect(() => {
        const token = localStorage.getItem('token');
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const qs = new URLSearchParams({ page: String(page - 1), size: String(pageSize) });
                if (searchTerm.trim()) qs.set('search', searchTerm.trim());
                const res = await fetch(`${API_BASE_URL}/users?${qs.toString()}`, {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                    },
                });
                const json = await res.json().catch(() => ({}));
                const payload: any = json?.data;
                let list = Array.isArray(payload?.content) ? payload.content : Array.isArray(payload) ? payload : [];
                // Exclude STUDENT users; show other roles only
                list = list.filter(
                    (u: any) =>
                        Array.isArray(u.roles) && !u.roles.some((r: any) => (r?.name || '').toUpperCase() === 'STUDENT')
                );
                // client-side filters: role, status, date, search
                const term = searchTerm.trim().toLowerCase();
                if (term || selectedRole !== 'Roles' || (selectedStatus !== 'Status' && selectedStatus !== 'All Statuses') || selectedDate !== 'Date') {
                    const roleFilter = (u: any) => {
                        if (selectedRole === 'Roles' || selectedRole === 'All Roles') return true;
                        const rolesArr = Array.isArray(u.roles) ? u.roles : [];
                        return rolesArr.some((r: any) => (r?.name || '').toLowerCase() === selectedRole.toLowerCase());
                    };
                    const statusFromUser = (u: any) => (u.online ? 'Active' : (u.enabled === false ? 'Inactive' : 'Active'));
                    const statusFilter = (u: any) => {
                        if (selectedStatus === 'Status' || selectedStatus === 'All Statuses') return true;
                        return statusFromUser(u).toLowerCase() === selectedStatus.toLowerCase();
                    };
                    const dateFilter = (u: any) => {
                        if (selectedDate === 'Date') return true;
                        const now = new Date();
                        let from: Date | null = null;
                        if (selectedDate === 'Joined This Month') {
                            from = new Date(now.getFullYear(), now.getMonth(), 1);
                        } else if (selectedDate === 'Joined Last 30 Days') {
                            from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        }
                        if (!from) return true;
                        const created = u.createdAt ? new Date(u.createdAt) : null;
                        return created ? created >= from && created <= now : true;
                    };
                    const termFilter = (u: any) => {
                        if (!term) return true;
                        return [u.username, u.email, u.name, u.fullName]
                            .filter(Boolean)
                            .some((v: any) => String(v).toLowerCase().includes(term));
                    };
                    list = list.filter((u: any) => roleFilter(u) && statusFilter(u) && dateFilter(u) && termFilter(u));
                }
                setItems(list);
                const totalVal = (typeof payload?.totalElements === 'number' && payload.totalElements) || list.length;
                setTotal(totalVal);
            } catch {
                setItems(demoUsers);
                setTotal(demoUsers.length);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize, selectedRole, selectedStatus, selectedDate, searchTerm]);

    const handleDelete = async (userId: number) => {
        const token = localStorage.getItem('token');
        if (!userId) return;
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                },
            });
            if (!res.ok) {
                const msg = (await res.json().catch(() => ({})))?.message || 'Failed to delete user';
                alert(msg);
                return;
            }
            setItems(prev => prev.filter((u) => (u.id ?? 0) !== userId));
            setTotal(prev => Math.max(0, prev - 1));
        } catch (e: any) {
            alert(e?.message || 'Failed to delete user');
        }
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
                    {!showAddUserForm && (
                        <div className="dashboard-cards">
                            <div className="cardcourse">
                                <h3 className='user-management-header'>User Management</h3>
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
                                            <button className="dropdown-toggle" onClick={toggleRoleDropdown}>
                                                <FaUser className="icon" />
                                                <span>{selectedRole}</span>
                                                <FaChevronDown className="chevron" />
                                            </button>
                                            {isRoleOpen && (
                                                <ul className="dropdown-menu">
                                                    {roles.map((role, index) => (
                                                        <li key={index} onClick={() => { handleSelectRole(role); setPage(1); }}>
                                                            {role}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>

                                      
                                        <div className="custom-dropdown">
                                            <button className="dropdown-toggle" onClick={toggleStatusDropdown}>
                                                <FaSpinner className="icon spin" />
                                                <span>{selectedStatus}</span>
                                                <FaChevronDown className="chevron" />
                                            </button>
                                            {isStatusOpen && (
                                                <ul className="dropdown-menu">
                                                    {statuses.map((status, index) => (
                                                        <li key={index} onClick={() => { handleSelectStatus(status); setPage(1); }}>
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
                                                        <li key={index} onClick={() => { handleSelectDate(option); setPage(1); }}>
                                                            {option}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>

                                        <button className="add-user-btn" onClick={() => setShowAddUserForm(true)}>
                                            Add User +
                                        </button>
                                    </div>
                                </div>

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
                                            {(loading ? [] : items).map((u: any, i: number) => {
                                                const email = u.username || u.email || '-';
                                                const fullName = u.name || u.fullName || email?.split('@')[0] || '-';
                                                const username = u.username || '-';
                                                const status = u.online ? 'Active' : (u.enabled === false ? 'Inactive' : 'Active');
                                                const role = Array.isArray(u.roles) && u.roles.length ? u.roles[0]?.name : '-';
                                                const joined = u.createdAt || '-';
                                                const active = u.lastActive || (u.online ? 'Online' : '-');
                                                return (
                                                    <tr key={u.id ?? i}>
                                                        <td>{fullName}</td>
                                                        <td>{email}</td>
                                                        <td>{username}</td>
                                                        <td>
                                                            <span className={`status-badge ${statusColors[status] || ''}`}>
                                                                {status}
                                                            </span>
                                                        </td>
                                                        <td>{role}</td>
                                                        <td>{joined}</td>
                                                        <td>{active}</td>
                                                        <td className="actions">
                                                            <MdEdit
                                                              className="icon edit-icon"
                                                              title="Edit user"
                                                              onClick={() => { setSelectedUser(u); setShowAddUserForm(true); }}
                                                              style={{ cursor: 'pointer' }}
                                                            />
                                                            <MdDelete
                                                              className="icon delete-icon"
                                                              title="Delete user"
                                                              onClick={() => handleDelete(u.id)}
                                                              style={{ cursor: 'pointer' }}
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="pagination">
                                    <Pagination
                                        page={page}
                                        pageSize={pageSize}
                                        total={total}
                                        onPageChange={(p) => setPage(p)}
                                        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
                                    />
                                </div>
                            </div>

                            
                        </div>


                             
                    )}

                    {showAddUserForm && (
                        <AddUserForm
                            onClose={() => { setShowAddUserForm(false); setSelectedUser(null); }}
                            mode={selectedUser ? 'edit' : 'create'}
                            initial={selectedUser ? {
                                id: selectedUser.id,
                                username: selectedUser.username,
                                fullName: selectedUser.name || selectedUser.fullName,
                                email: selectedUser.username || selectedUser.email,
                                roleName: (Array.isArray(selectedUser.roles) && selectedUser.roles[0]?.name) || undefined,
                            } : undefined}
                            onCreate={handleCreateUser}
                            onUpdate={async (u) => {
                                const token = localStorage.getItem('token');
                                try {
                                    const body: any = {};
                                    if (u.username != null) body.username = u.username;
                                    if (u.email != null) body.email = u.email;
                                    if (u.fullName != null) body.fullName = u.fullName;
                                    if (u.roleId != null) body.roleId = u.roleId;
                                    else if (u.roleLabel) body.roleName = u.roleLabel;

                                    if (u.id) {
                                        const res = await fetch(`${API_BASE_URL}/users/${u.id}`, {
                                            method: 'PUT',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                Authorization: token ? `Bearer ${token}` : '',
                                            },
                                            body: JSON.stringify(body),
                                        });
                                        if (!res.ok) {
                                            const msg = (await res.json().catch(() => ({})))?.message || 'Failed to update user';
                                            alert(msg);
                                            return;
                                        }
                                    }

                                    // Optimistic local update after success or if no API
                                    setItems(prev => prev.map(it => (it.id === u.id ? {
                                        ...it,
                                        username: u.username ?? it.username,
                                        name: u.fullName ?? it.name,
                                        fullName: u.fullName ?? it.fullName,
                                        email: u.email ?? it.email,
                                        roles: u.roleLabel ? [{ ...(it.roles?.[0] || {}), name: u.roleLabel }] : it.roles,
                                    } : it)));
                                    setShowAddUserForm(false);
                                    setSelectedUser(null);
                                } catch (e: any) {
                                    alert(e?.message || 'Failed to update user');
                                }
                            }}
                        />
                    )}

                </div>
                
            </div>
            </div>
       
    );
};

export default UserManagement;

