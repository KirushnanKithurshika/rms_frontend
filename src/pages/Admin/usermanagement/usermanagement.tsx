import { useState, useEffect } from 'react';
import Navbarin from '../../../components/Navbar/navbarin.tsx';
import BreadcrumbNav from '../../../components/breadcrumbnav/breadcrumbnav.tsx';
import AdminSidebar from '../../../components/Admin/adminsidebar/adminsidebar.tsx';
import './usermanagement.css';
import '../academicsetupLayout/AcademicSetupTables/table.css';
import {
    FaUser,
    FaChevronDown,
    FaSpinner,
    FaCalendarAlt,
} from 'react-icons/fa';

import { MdEdit, MdDelete } from "react-icons/md";
import { FaEye } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import Pagination from '../../../components/Admin/pagination/pagination.tsx';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import AddUserForm from '../../../components/Admin/adduserform/adduserform.tsx';

// UI roles list: rename "Moderator" to "Lecturer"
const roles = ['All Roles', 'Admin', 'Lecturer', 'User', 'Guest'];
const statuses = ['All Statuses', 'Active', 'Inactive', 'Pending', 'Banned', 'Suspended'];
const dateOptions = ['Newest', 'Oldest', 'Joined This Month', 'Joined Last 30 Days'];


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
    // View modal state
    const [viewing, setViewing] = useState<any | null>(null);
    const [viewingLoading, setViewingLoading] = useState(false);
    const [viewingError, setViewingError] = useState<string | null>(null);

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
                const list = Array.isArray(payload?.content) ? payload.content : Array.isArray(payload) ? payload : [];
                // Do not filter a paginated page locally; render exactly what the API returned
                setItems(list);
                const totalVal = (typeof payload?.totalElements === 'number' && payload.totalElements) || list.length;
                setTotal(totalVal);
            } catch {
                setItems([]);
                setTotal(0);
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

    const handleView = async (userId: number | undefined) => {
        if (!userId) return;
        const token = localStorage.getItem('token');
        setViewingError(null);
        setViewingLoading(true);
        try {
            // Backend expects both path and query param id
            const res = await fetch(`${API_BASE_URL}/users/${userId}?id=${userId}`, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                },
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                const msg = json?.message || 'Failed to load user';
                setViewingError(String(msg));
                setViewing(null);
                return;
            }
            const d: any = json?.data ?? json;
            const norm = (s: any) => String(s || '').trim();
            const roles: string[] = [];
            if (Array.isArray(d?.roles)) {
                for (const r of d.roles) {
                    if (r && typeof r === 'object') roles.push(norm(r.name || r.roleName || r.code));
                    else if (typeof r === 'string') roles.push(norm(r));
                }
            }
            if (Array.isArray(d?.authorities)) {
                for (const a of d.authorities) {
                    if (a && typeof a === 'object') roles.push(norm(a.authority || a.name));
                    else if (typeof a === 'string') roles.push(norm(a));
                }
            }
            const fullName = d.name || d.fullName || (d.firstName || d.lastName ? `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim() : undefined);
            setViewing({
                id: d.id ?? d.userId,
                username: d.username ?? d.userName,
                fullName,
                email: d.email ?? d.mail,
                phone: d.phone ?? d.phoneNumber,
                roles: Array.from(new Set(roles)).filter(Boolean),
                enabled: d.enabled ?? d.active ?? true,
                online: d.online ?? false,
                status: d.status,
                accountNonLocked: d.accountNonLocked,
                accountNonExpired: d.accountNonExpired,
                credentialsNonExpired: d.credentialsNonExpired,
                lastActive: d.lastActive ?? d.lastLoginAt,
                createdAt: d.createdAt ?? d.joinedAt ?? d.registeredAt,
            });
        } catch (e: any) {
            setViewingError(String(e?.message || 'Failed to load user'));
            setViewing(null);
        } finally {
            setViewingLoading(false);
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
                                                <th>No.</th>
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
                                                        <td>{(page - 1) * pageSize + i + 1}</td>
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
                                                            <button
                                                              className="icon-btn"
                                                              title="View user"
                                                              onClick={() => handleView(u.id)}
                                                            >
                                                              <FaEye className="icon view-icon" />
                                                            </button>
                                                            <button
                                                              className="icon-btn"
                                                              title="Edit user"
                                                              onClick={() => { setSelectedUser(u); setShowAddUserForm(true); }}
                                                            >
                                                              <MdEdit className="icon edit-icon" />
                                                            </button>
                                                            <button
                                                              className="icon-btn"
                                                              title="Delete user"
                                                              onClick={() => handleDelete(u.id)}
                                                            >
                                                              <MdDelete className="icon delete-icon" />
                                                            </button>
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

                {(viewing || viewingLoading || viewingError) && (
                    <div className="app-modal-backdrop" onClick={() => setViewing(null)} role="dialog" aria-modal="true">
                        <div className="app-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="app-modal__header">
                                <h3 className="app-modal__title">User Details</h3>
                                <button type="button" className="app-modal__close" onClick={() => setViewing(null)} aria-label="Close" title="Close">×</button>
                            </div>
                            <div className="app-form app-form--tight">
                                {viewingLoading ? (
                                    <div>Loading...</div>
                                ) : (
                                    <>
                                        {viewingError && <div className="app-error">{viewingError}</div>}
                                        {viewing && (
                                            <div className="app-grid">
                                                <div className="app-field"><span className="app-label">Id</span><div className="app-input app-input--readonly">{viewing.id ?? '-'}</div></div>
                                                <div className="app-field"><span className="app-label">Username</span><div className="app-input app-input--readonly">{viewing.username ?? '-'}</div></div>
                                                <div className="app-field"><span className="app-label">Status Code</span><div className="app-input app-input--readonly">{(viewing.status ?? '') === '' ? '-' : viewing.status}</div></div>
                                                <div className="app-field"><span className="app-label">Online</span><div className="app-input app-input--readonly app-input--inline"><input type="checkbox" checked={!!viewing.online} readOnly /><span>{viewing.online ? 'Online' : 'Offline'}</span></div></div>
                                                <div className="app-field"><span className="app-label">Enabled</span><div className="app-input app-input--readonly app-input--inline"><input type="checkbox" checked={!!viewing.enabled} readOnly /><span>{viewing.enabled ? 'Enabled' : 'Disabled'}</span></div></div>
                                                <div className="app-field"><span className="app-label">Account Non Locked</span><div className="app-input app-input--readonly app-input--inline"><input type="checkbox" checked={!!viewing.accountNonLocked} readOnly /><span>{viewing.accountNonLocked ? 'Yes' : 'No'}</span></div></div>
                                                <div className="app-field"><span className="app-label">Account Non Expired</span><div className="app-input app-input--readonly app-input--inline"><input type="checkbox" checked={!!viewing.accountNonExpired} readOnly /><span>{viewing.accountNonExpired ? 'Yes' : 'No'}</span></div></div>
                                                <div className="app-field"><span className="app-label">Credentials Non Expired</span><div className="app-input app-input--readonly app-input--inline"><input type="checkbox" checked={!!viewing.credentialsNonExpired} readOnly /><span>{viewing.credentialsNonExpired ? 'Yes' : 'No'}</span></div></div>
                                                <div className="app-field app-grid--2"><span className="app-label">Roles</span><div className="app-input app-input--readonly">{(viewing.roles || []).join(', ') || '-'}</div></div>
                                                <div className="app-field"><span className="app-label">Full Name</span><div className="app-input app-input--readonly">{viewing.fullName ?? '-'}</div></div>
                                                <div className="app-field"><span className="app-label">Email</span><div className="app-input app-input--readonly">{viewing.email ?? '-'}</div></div>
                                                <div className="app-field"><span className="app-label">Phone</span><div className="app-input app-input--readonly">{viewing.phone ?? '-'}</div></div>
                                                <div className="app-field"><span className="app-label">Last Active</span><div className="app-input app-input--readonly">{viewing.lastActive ?? '-'}</div></div>
                                                <div className="app-field"><span className="app-label">Created At</span><div className="app-input app-input--readonly">{viewing.createdAt ?? '-'}</div></div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                </div>
                
            </div>
            </div>
       
    );
};

export default UserManagement;

