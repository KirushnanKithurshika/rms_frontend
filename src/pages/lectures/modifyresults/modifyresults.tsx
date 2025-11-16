import React, { useState, useEffect } from "react";
import Navbarin from "../../../components/Navbar/navbarin.tsx";
import LectureSidebar from "../../../components/sidebarlecturer/coursesidebar.tsx";
import BreadcrumbNav from "../../../components/breadcrumbnav/breadcrumbnav.tsx";
import CourseSearchBarlechome from "../../../components/SearchDropdown/searchdropdown.tsx";
import "./modifyresults.css"; // add styles as needed
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";

// The imported component may not have proper prop types; create a loose-typed alias to allow passing props here.
const CourseSearchBarlechomeAny = CourseSearchBarlechome as unknown as React.ComponentType<any>;

type Course = {
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
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Result[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Editing modal state
    const [editingResult, setEditingResult] = useState<Result | null>(null);
    const [saving, setSaving] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const handleBackdropClick = () => setSidebarOpen(false);

    // When a course is chosen, fetch its results
    useEffect(() => {
        if (!selectedCourse) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/courses/${selectedCourse.id}/results`);
                if (!res.ok) throw new Error(`Failed to load results (${res.status})`);
                const data: Result[] = await res.json();
                setResults(data);
            } catch (err: any) {
                setError(err.message || "Failed to load results");
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [selectedCourse]);

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
            const res = await fetch(`/api/results/${toSave.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    project: toSave.project,
                    quiz1: toSave.quiz1,
                    quiz2: toSave.quiz2,
                    total: toSave.total,
                    status: toSave.status,
                }),
            });

            if (!res.ok) {
                // revert optimistic update
                setResults(prevResults);
                const text = await res.text();
                throw new Error(text || `Save failed (${res.status})`);
            }

            const updated: Result = await res.json();
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
                        <CourseSearchBarlechomeAny
                            // assume this component accepts onCourseSelect
                            onCourseSelect={(c: Course) => setSelectedCourse(c)}
                            selectedCourse={selectedCourse}
                        />









                        {loading && <p>Loading results...</p>}
                        {error && <div className="error">{error}</div>}

                        {!loading && selectedCourse && results.length === 0 && <p>No results found for this course.</p>}

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
