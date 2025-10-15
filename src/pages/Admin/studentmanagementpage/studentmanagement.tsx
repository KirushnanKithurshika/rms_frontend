// StudentManagement.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import "../../../index.css";

import Navbarin from "../../../components/Navbar/navbarin.tsx";
import BreadcrumbNav from "../../../components/breadcrumbnav/breadcrumbnav.tsx";
import AdminSidebar from "../../../components/Admin/adminsidebar/adminsidebar.tsx";

import {
    Table,
    Tag,
    Popconfirm,
    message,
    Button,
    Input,
    Space,
} from "antd";
import type {
    FilterDropdownProps,
    ColumnType,
    ColumnsType,
} from "antd/es/table/interface";
import type { InputRef } from "antd";
import {
    ArrowsAltOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";

import AddStudentForm from "../../../components/Admin/addstudentsform/addstudentsform.tsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

type Nullable<T> = T | null | undefined;

// ---- Data types ------------------------------------------------------------

interface Batch {
    id?: number;
    name?: string;
}

interface Department {
    id?: number;
    departmentName?: string;
}

interface Address {
    city?: string;
    line1?: string;
}

export interface StudentRow {
    id?: number;
    studentId?: number;
    firstName?: string;
    lastName?: string;
    registrationNumber?: string;
    email?: string;
    phoneNumber?: string;
    gender?: string;
    dateOfBirth?: string;
    batch?: Batch;
    department?: Department;
    address?: Address;
    studentStatus?: string; // e.g., ACTIVE, DROPOUT, SUSPENDED, GRADUATED
}

// ---- Status pill colors ----------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
    ACTIVE: "#4caf50",
    DROPOUT: "#ff9800",
    SUSPENDED: "#f44336",
    GRADUATED: "#2196f3",
};

// ---- Column search hook (reusable) -----------------------------------------

function useColumnSearch<T extends object>() {
    const [searchText, setSearchText] = useState<string>("");
    const [searchedKey, setSearchedKey] = useState<string>("");
    const inputRef = useRef<InputRef>(null);

    const normalize = (val: unknown) =>
        val === null || val === undefined ? "" : String(val);

    const handleSearch = (
        selectedKeys: React.Key[],
        confirm: FilterDropdownProps["confirm"],
        columnKey: string
    ) => {
        confirm();
        setSearchText(String(selectedKeys[0] ?? ""));
        setSearchedKey(columnKey);
    };

    const handleReset = (clearFilters?: () => void) => {
        clearFilters?.();
        setSearchText("");
    };

    /**
     * dataIndexKey: a unique string key for this column (used to track highlight)
     * getText: how to extract string text from the row for filtering/highlighting
     */
    const getColumnSearchProps = (
        dataIndexKey: string,
        getText: (record: T) => Nullable<string | number>,
        placeholder?: string
    ): ColumnType<T> => ({
        filterDropdown: ({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
        }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={inputRef}
                    placeholder={placeholder ?? "Search"}
                    value={selectedKeys[0] as string}
                    onChange={(e) =>
                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                    }
                    onPressEnter={() =>
                        handleSearch(selectedKeys as string[], confirm, dataIndexKey)
                    }
                    style={{ marginBottom: 8, display: "block" }}
                    allowClear
                />
                <Space>
                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        size="small"
                        onClick={() =>
                            handleSearch(selectedKeys as string[], confirm, dataIndexKey)
                        }
                    >
                        Search
                    </Button>
                    <Button size="small" onClick={() => handleReset(clearFilters)}>
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
        ),
        onFilter: (value, record) => {
            const text = normalize(getText(record));
            return text.toLowerCase().includes(String(value).toLowerCase());
        },
        onFilterDropdownOpenChange(open) {
            if (open) setTimeout(() => inputRef.current?.select(), 100);
        },
        render: (_: unknown, record) => {
            const text = normalize(getText(record));
            if (searchedKey !== dataIndexKey) return text;
            return (
                <Highlighter
                    highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text}
                />
            );
        },
    });

    return { getColumnSearchProps };
}

// ---- Component -------------------------------------------------------------

const StudentManagement: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "view" | "edit">("create");
    const [selectStudentId, setSelectStudentId] = useState<number | undefined>(
        undefined
    );

    const [rows, setRows] = useState<StudentRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [messageApi, contextHolder] = message.useMessage();

    const token = localStorage.getItem("token");

    
    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/v1/students`, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                    "Content-Type": "application/json",
                },
            });
            const json = await res.json();
            const list = Array.isArray(json?.data) ? (json.data as StudentRow[]) : [];
            setRows(list);
        } catch {
            setRows([]);
            messageApi.error("Failed to load students");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDelete = async (id: number) => {
        if (!token) {
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
                messageApi.error(data?.message || "Failed to delete student");
                return;
            }

            setRows((prev) => prev.filter((s) => (s.id ?? s.studentId) !== id));
            messageApi.success(data?.message || "Student deleted");
        } catch (err: any) {
            messageApi.error(err?.message || "Failed to delete student");
        } finally {
            setDeletingId(null);
        }
    };

    const handleOpenCreate = () => {
        setFormMode("create");
        setSelectStudentId(undefined);
        setShowForm(true);
    };

    const handleOpenView = (id?: number) => {
        setFormMode("view");
        setSelectStudentId(id);
        setShowForm(true);
    };

    const handleOpenEdit = (id?: number) => {
        setFormMode("edit");
        setSelectStudentId(id);
        setShowForm(true);
    };

    const { getColumnSearchProps } = useColumnSearch<StudentRow>();

    const columns: ColumnsType<StudentRow> = useMemo(
        () => [
            {
                title: "Full Name",
                key: "fullName",
                ...getColumnSearchProps(
                    "fullName",
                    (r) => `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim()
                ),
            },
            {
                title: "Reg No",
                key: "registrationNumber",
                ...getColumnSearchProps(
                    "registrationNumber",
                    (r) => r.registrationNumber ?? ""
                ),
            },
            {
                title: "Username (Email)",
                key: "email",
                ...getColumnSearchProps("email", (r) => r.email ?? ""),
            },
            {
                title: "Phone No",
                key: "phoneNumber",
                responsive: ["md"],
                ...getColumnSearchProps("phoneNumber", (r) => r.phoneNumber ?? ""),
            },
            {
                title: "Gender",
                dataIndex: "gender",
                key: "gender",
                width: 100,
                filters: [
                    { text: "Male", value: "Male" },
                    { text: "Female", value: "Female" },
                    { text: "Other", value: "Other" },
                ],
                onFilter: (value, record) =>
                    String(record.gender ?? "").toLowerCase() ===
                    String(value).toLowerCase(),
            },
            {
                title: "DOB",
                dataIndex: "dateOfBirth",
                key: "dateOfBirth",
                responsive: ["lg"],
                sorter: (a, b) =>
                    new Date(a.dateOfBirth ?? 0).getTime() -
                    new Date(b.dateOfBirth ?? 0).getTime(),
            },
            {
                title: "Batch",
                key: "batch",
                responsive: ["md"],
                ...getColumnSearchProps("batch", (r) => r.batch?.name ?? ""),
            },
            {
                title: "Department",
                key: "department",
                responsive: ["lg"],
                ...getColumnSearchProps(
                    "department",
                    (r) => r.department?.departmentName ?? ""
                ),
            },
            {
                title: "Address",
                key: "address",
                responsive: ["lg"],
                ...getColumnSearchProps("address", (r) => r.address?.city ?? ""),
            },
            {
                title: "Status",
                dataIndex: "studentStatus",
                key: "studentStatus",
                width: 140,
                filters: [
                    { text: "ACTIVE", value: "ACTIVE" },
                    { text: "DROPOUT", value: "DROPOUT" },
                    { text: "SUSPENDED", value: "SUSPENDED" },
                    { text: "GRADUATED", value: "GRADUATED" },
                ],
                onFilter: (value, record) =>
                    String(record.studentStatus ?? "") === String(value),
                render: (status: string) => {
                    const color = STATUS_COLORS[status] ?? "#757575";
                    return (
                        <span
                            style={{
                                color: "#fff",
                                backgroundColor: color,
                                padding: "2px 10px",
                                borderRadius: 12,
                                fontWeight: 500,
                                fontSize: "0.95em",
                                display: "inline-block",
                                minWidth: 80,
                                textAlign: "center",
                            }}
                        >
                            {status ?? "—"}
                        </span>
                    );
                },
            },
            {
                title: "Action",
                key: "action",
                fixed: "right",
                width: 140,
                render: (_, record) => {
                    const id = record.id ?? record.studentId!;
                    const disabled = deletingId === id;
                    return (
                        <Space>
                            <Button
                                title="View"
                                onClick={() => handleOpenView(id)}
                                icon={<ArrowsAltOutlined />}
                            />
                            <Button
                                title="Edit"
                                onClick={() => handleOpenEdit(id)}
                                icon={<EditOutlined />}
                            />
                            <Popconfirm
                                title="Delete student?"
                                description="This action cannot be undone."
                                okText="Delete"
                                okButtonProps={{ danger: true, loading: disabled }}
                                cancelText="Cancel"
                                onConfirm={() => handleDelete(id)}
                            >
                                <Button
                                    title="Delete"
                                    danger
                                    disabled={disabled}
                                    icon={<DeleteOutlined />}
                                />
                            </Popconfirm>
                        </Space>
                    );
                },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [deletingId]
    );

    const handleBackdropClick = () => setSidebarOpen(false);

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
            />

            <div className="main-area">
                <div className={`sidebar ${isSidebarOpen ? "active" : ""}`}>
                    <AdminSidebar />
                </div>

                <div className="dashboard-content">
                    {!showForm && (
                        <div className="dashboard-cards">
                            <div className="cardcourse">
                                <div className="user-management-header">
                                    <h3 className="user-management-header">Student Management</h3>
                                    <Button type="primary" onClick={handleOpenCreate}>
                                        Add Student +
                                    </Button>
                                </div>

                                <Table<StudentRow>
                                    bordered
                                    loading={loading}
                                    rowKey={(r) => (r.id ?? r.studentId ?? Math.random()).toString()}
                                    columns={columns}
                                    dataSource={rows}
                                    scroll={{ x: 1200 }}
                                    pagination={{
                                        pageSize: 15,
                                        showSizeChanger: true,
                                        showTotal: (total, range) =>
                                            `${range[0]}-${range[1]} of ${total} students`,
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {showForm && (
                        <AddStudentForm
                            mode={formMode}
                            studentId={selectStudentId}
                            onClose={() => setShowForm(false)}
                            onCreate={() => {
                                setShowForm(false);
                                fetchStudents();
                                message.success("Student created successfully");
                            }}
                            onUpdate={() => {
                                setShowForm(false);
                                fetchStudents();
                                message.success("Student updated successfully");
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentManagement;
