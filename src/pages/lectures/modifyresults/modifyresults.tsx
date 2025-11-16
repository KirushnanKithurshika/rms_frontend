import React, { useState, useEffect } from "react";
import Navbarin from "../../../components/Navbar/navbarin.tsx";
import LectureSidebar from "../../../components/sidebarlecturer/coursesidebar.tsx";
import BreadcrumbNav from "../../../components/breadcrumbnav/breadcrumbnav.tsx";
import CourseSearchBarlechome from "../../../components/SearchDropdown/searchdropdown.tsx";
import "./modifyresults.css"; // add styles as needed
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchLecturerCourses } from "../../../features/lecturerCourses/lecturerCoursesSlice";
import type { Course as LecCourse } from "../../../features/lecturerCourses/course";
import { selectUserId } from "../../../features/auth/selectors";
import api from "../../../services/api";

type SelectedCourseInfo = {
    id: string;
    code?: string;
    title?: string;
};

type Result = {
    id: string;
    studentId: string;
    studentName: string;
    project: number;
    quiz1: number;
    quiz2: number;
    total: number;
    status: string;
};

const ModifyResults: React.FC = () => {
    const dispatch = useAppDispatch();
    const userId = useAppSelector(selectUserId);
    const { courses: coursesData = [], loading: coursesLoading, error: coursesError } = useAppSelector((s) => s.lecturerCourses);

    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<SelectedCourseInfo | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");

    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Result[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Editing modal state
    const [editingResult, setEditingResult] = useState<Result | null>(null);
    const [saving, setSaving] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const handleBackdropClick = () => setSidebarOpen(false);

    // Load lecturer courses on mount/user change
    useEffect(() => {
        if (userId) dispatch(fetchLecturerCourses(userId));
    }, [dispatch, userId]);

    // When a course is chosen, fetch its results
    useEffect(() => {
        if (!selectedCourseId) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.get(`/courses/${selectedCourseId}/results`);
                const data = res.data as unknown as Result[];
                setResults(data);
            } catch (err: any) {
                setError(err.message || "Failed to load results");
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [selectedCourseId]);

    // Open editor for a result
    const openEdit = (r: Result) => {
        // clone to avoid mutating list directly
        setEditingResult({ ...r });
        setValidationError(null);
    };

    // Close editor
    const closeEdit = () => {
        setEditingResult(null);
        setValidationError(null);
    };

    // Basic validation: marks are non-negative, total computed if empty
    const validateAndCompute = (r: Result) => {
        if (r.project < 0 || r.quiz1 < 0 || r.quiz2 < 0) {
            return "Marks cannot be negative";
        }
        // Example: recompute total
        r.total = Number(r.project) + Number(r.quiz1) + Number(r.quiz2);
        r.status = r.total >= 40 ? "Pass" : "Fail"; // simple example rule
        return null;
    };

    // Save changes (optimistic update)
    const saveResult = async () => {
        if (!editingResult) return;
        setValidationError(null);

        // copy and validate
        const toSave = { ...editingResult };
        const vError = validateAndCompute(toSave);
        if (vError) {
            setValidationError(vError);
            return;
        }

        setSaving(true);
        // optimistic UI update: replace locally
        const prevResults = [...results];
        setResults((r) => r.map((it) => (it.id === toSave.id ? toSave : it)));

        try {
            const res = await api.put(`/results/${toSave.id}`, {
                project: toSave.project,
                quiz1: toSave.quiz1,
                quiz2: toSave.quiz2,
                total: toSave.total,
                status: toSave.status,
            });
            const updated: Result = res.data as unknown as Result;
            // make sure UI shows backend canonical result
            setResults((r) => r.map((it) => (it.id === updated.id ? updated : it)));
            closeEdit();
        } catch (err: any) {
            setError(err.message || "Failed to save result");
        } finally {
            setSaving(false);
        }
    };

    // Small helper to update editingResult fields from inputs
    const updateEditingField = (field: keyof Result, value: string | number) => {
        if (!editingResult) return;
        setEditingResult((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

    return (
        <div className="lec-dashboard-container">
            <div className="nav">
                <Navbarin />
            </div>

            <div className="breadcrumb">
                <BreadcrumbNav />
            </div>

            <div className={`sidebar-backdrop ${isSidebarOpen ? "active" : ""}`} onClick={handleBackdropClick}></div>

            <div className="main-area">
                <div className={`sidebar ${isSidebarOpen ? "active" : ""}`}>
                    <LectureSidebar />
                </div>

                <div className="dashboard-content">
                    <div className="card">
                        <CourseSearchBarlechome
                            courses={coursesData.map((c: LecCourse) => ({
                                courseId: String(c.id),
                                courseDisplayName: `${c.code} - ${c.title}`,
                            }))}
                            selectedCourseId={selectedCourseId}
                            onCourseSelect={(id: string) => {
                                setSelectedCourseId(id);
                                const found = coursesData.find((c) => String(c.id) === id);
                                setSelectedCourse(found ? { id, code: found.code, title: found.title } : null);
                            }}
                        />









                        {loading && <p>Loading results...</p>}
                        {error && <div className="error">{error}</div>}

                        {!loading && selectedCourseId && results.length === 0 && <p>No results found for this course.</p>}

                        {!loading && results.length > 0 && (
                            <div className="results-table-wrapper">
                                <table className="results-table" aria-label="Results table">
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Project</th>
                                            <th>Quiz 1</th>
                                            <th>Quiz 2</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map((r) => (
                                            <tr key={r.id}>
                                                <td>{r.studentName}</td>
                                                <td>{r.project}</td>
                                                <td>{r.quiz1}</td>
                                                <td>{r.quiz2}</td>
                                                <td>{r.total}</td>
                                                <td>{r.status}</td>
                                                <td>
                                                    <button className="btn small" onClick={() => openEdit(r)} aria-label={`Edit ${r.studentName}`}>
                                                        <FaEdit /> Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Edit Modal */}
                    
                </div>
            </div>
        </div>
    );
};

export default ModifyResults;

