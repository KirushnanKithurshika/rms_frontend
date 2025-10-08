import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Table,
    Tag,
    Space,
    Input,
    Select,
    DatePicker,
    Button,
    Drawer,
    Typography,
    Tooltip,
} from "antd";
import type { TablePaginationConfig, TableProps } from "antd";
import { SearchOutlined, ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import axios from "axios";
import "./AuditLog.css";

const { RangePicker } = DatePicker;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type AuditLog = {
    id: number;
    entity: string;
    changedBy: string;
    action: string;
    changedAt: string;
    changedFields?: string;
};

const prettyJson = (raw?: string) => {
    if (!raw) return "";
    try {
        return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
        return raw;
    }
};

const AuditLogTable: React.FC = () => {
    // table data
    const [data, setData] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);

    // pagination/sort
    const [page, setPage] = useState(1); // AntD is 1-based
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [sorterState, setSorterState] = useState<{ field?: string; order?: "ascend" | "descend" }>({
        field: "changedAt",
        order: "descend",
    });

    // filters (UI: Name → API: changedBy)
    const [nameLike, setNameLike] = useState<string>();
    const [action, setAction] = useState<string>();
    const [entity, setEntity] = useState<string>();
    const [entityOptions, setEntityOptions] = useState<{ value: string; label: string }[]>([]);
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

    // drawer
    const [openDrawer, setOpenDrawer] = useState(false);
    const [drawerRecord, setDrawerRecord] = useState<AuditLog | null>(null);

    const token = localStorage.getItem("token");

    // derive action options from the loaded data (supports free-typed values too)
    const actionOptions = useMemo(() => {
        const set = new Set<string>();
        data.forEach((d) => d.action && set.add(d.action));
        if (action && !set.has(action)) set.add(action);
        return Array.from(set)
            .sort()
            .map((a) => ({ value: a, label: a }));
    }, [data, action]);

    const sortParam = useMemo(() => {
        if (!sorterState.field || !sorterState.order) return undefined;
        const dir = sorterState.order === "ascend" ? "asc" : "desc";
        return `${sorterState.field},${dir}`;
    }, [sorterState]);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (token) headers.Authorization = `Bearer ${token}`;

            const [start, end] = dateRange ?? [null, null];
const formatFullDateTime = (d: dayjs.Dayjs) =>
  d ? d.format("YYYY-MM-DD HH:mm:ss") : undefined;

            const params = {
                changedBy: nameLike?.trim() || undefined, // map UI "Name" → API changedBy
                action: action?.trim() || undefined,
                entity: entity?.trim() || undefined,
                startDate: start ? formatFullDateTime(start.startOf("day")) : undefined,
                endDate: end ? formatFullDateTime(end.endOf("day")) : undefined,
                page: page - 1, // API 0-based
                size: pageSize,
                sort: sortParam || "changedAt,desc",
            };

            const res = await axios.get(`${API_BASE_URL}/v1/audit-logs`, { headers, params });

            // Try Spring pageable shape first (data.content)
            const body = res.data as any;
            const pageData = body?.data ?? body;

            if (pageData?.content && Array.isArray(pageData.content)) {
                setData(pageData.content);
                setTotal(pageData.totalElements ?? pageData.content.length ?? 0);
            } else if (Array.isArray(pageData)) {
                setData(pageData);
                setTotal(Number(res.headers["x-total-count"]) || pageData.length || 0);
            } else {
                setData([]);
                setTotal(0);
            }
        } catch {
            setData([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, token, nameLike, action, entity, dateRange, page, pageSize, sortParam]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);
    useEffect(() => {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        axios
            .get(`${API_BASE_URL}/v1/audit-logs/entity`, { headers })
            .then((res) => {
                const body = res.data as any;
                const list: string[] = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
                const opts = (list || [])
                    .filter((s) => typeof s === "string")
                    .map((s: string) => ({ value: s, label: s }))
                    .sort((a, b) => a.label.localeCompare(b.label));
                setEntityOptions(opts);
            })
            .catch(() => {
                setEntityOptions([]); // fail silently; user can still type if needed
            });
    }, []);

    const onTableChange: TableProps<AuditLog>["onChange"] = (pagination, _filters, sorter) => {
        const { current = 1, pageSize = 10 } = pagination;
        setPage(current);
        setPageSize(pageSize);

        const s = Array.isArray(sorter) ? sorter[0] : sorter;
        if (s && s.field && s.order) {
            setSorterState({ field: String(s.field), order: s.order as any });
        } else {
            setSorterState({ field: "changedAt", order: "descend" });
        }
    };

    const resetFilters = () => {
        setNameLike(undefined);
        setAction(undefined);
        setEntity(undefined);
        setDateRange(null);
        setPage(1);
        setSorterState({ field: "changedAt", order: "descend" });
    };

    const pagination: TablePaginationConfig = {
        current: page,
        pageSize,
        total,
        showSizeChanger: true,
        showTotal: (t, range) => `${range[0]}-${range[1]} of ${t}`,
    };

    return (
        <div className="auditlog-card" style={{ background: "#f0f2f5", borderRadius: 12, padding: 10 }}>
            {/* Filters: big Name search  other filters (responsive grid) */}
            <div className="audit-filters" style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 12, color: "#666" }}>Name</span>
                    <Input
                        allowClear
                        showCount
                        maxLength={50}
                        size="large"
                        value={nameLike}
                        onChange={(e) => setNameLike(e.target.value)}
                        onPressEnter={() => {
                            setPage(1);
                            fetchLogs();
                        }}
                        placeholder="Type or search by name"
                        suffix={<SearchOutlined style={{ color: "#999" }} />}
                        style={{
                            width: "100%",
                            borderRadius: 6,
                        }}
                    />
                </div>


                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 12, color: "#666" }}>Action</span>
                    <Select
                        allowClear
                        showSearch
                        placeholder="Type or select action"
                        value={action}
                        onChange={(v) => setAction(v)}
                        options={actionOptions}
                        style={{ width: "100%" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 12, color: "#666" }}>Entity</span>
                    <Select
                        allowClear
                        showSearch
                        placeholder="Type or select entity"
                        value={entity}
                        onChange={(v) => setEntity(v)}
                        options={entityOptions}
                        style={{ width: "100%" }}
                        filterOption={(input, option) =>
                            (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 12, color: "#666" }}>Date Range</span>
                    <RangePicker
                        value={dateRange as any}
                        onChange={(v) => setDateRange((v as any) ?? null)}
                        allowClear
                        format="YYYY-MM-DD"
                        style={{ width: "100%" }}
                    />
                </div>

                <Space className="audit-filter-actions">
                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={() => {
                            setPage(1);
                            fetchLogs();
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => {
                            resetFilters();
                            setTimeout(fetchLogs, 0);
                        }}
                    >
                        Reset
                    </Button>
                </Space>
            </div>

            {/* Table */}
            <Table<AuditLog>
                rowKey="id"
                dataSource={data}
                loading={loading}
                pagination={pagination}
                onChange={onTableChange}
                size="middle"
                scroll={{ x: true }}
            >
                <Table.Column<AuditLog>
                    title="Entity"
                    dataIndex="entity"
                    key="entity"
                    width={160}
                    sorter
                    render={(v: string) => <Tag>{v}</Tag>}
                />
                <Table.Column<AuditLog>
                    title="Action"
                    dataIndex="action"
                    key="action"
                    width={140}
                    sorter
                    render={(a: string) => {
                        const color =
                            a === "CREATE" ? "green" : a === "UPDATE" ? "geekblue" : a === "DELETE" ? "volcano" : "default";
                        return <Tag color={color}>{a}</Tag>;
                    }}
                />
                <Table.Column<AuditLog> title="Name" dataIndex="changedBy" key="changedBy" ellipsis />
                <Table.Column<AuditLog>
                    title="Changed At"
                    dataIndex="changedAt"
                    key="changedAt"
                    sorter
                    width={200}
                    render={(iso: string) => dayjs(iso).format("YYYY-MM-DD HH:mm:ss")}
                />
                <Table.Column<AuditLog>
                    title="Changed Fields"
                    key="changedFields"
                    width={120}
                    render={(_, record) => (
                        <Tooltip title="View change details">
                            <Button
                                icon={<EyeOutlined />}
                                size="small"
                                onClick={() => {
                                    setDrawerRecord(record);
                                    setOpenDrawer(true);
                                }}
                            >
                                View
                            </Button>
                        </Tooltip>
                    )}
                />
            </Table>

            <Drawer
                title={`Audit Log #${drawerRecord?.id} • ${drawerRecord?.entity} • ${drawerRecord?.action}`}
                open={openDrawer}
                onClose={() => setOpenDrawer(false)}
                width={640}
            >
                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                    <Typography.Text type="secondary">
                        Name: {drawerRecord?.changedBy} •{" "}
                        {drawerRecord ? dayjs(drawerRecord.changedAt).format("YYYY-MM-DD HH:mm:ss") : ""}
                    </Typography.Text>
                    <Typography.Text code style={{ display: "block", whiteSpace: "pre-wrap" }}>
                        {prettyJson(drawerRecord?.changedFields)}
                    </Typography.Text>
                </Space>
            </Drawer>
        </div>
    );
};

export default AuditLogTable;