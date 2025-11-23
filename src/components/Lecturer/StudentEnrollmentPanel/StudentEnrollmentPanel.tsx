import React, { useState } from "react";
import * as XLSX from "xlsx"; 
import { FaCloudUploadAlt } from "react-icons/fa";
import "./StudentEnrollmentPanel.css";

type Course = {
  code: string;
  name: string;
};

type Student = {
  id: number;
  regNo: string;
  name: string;
  email: string;
  batch: string;
  courseCode: string;
};

const SAMPLE_COURSES: Course[] = [
  { code: "EC7201", name: "Information Security" },
  { code: "EE7001", name: "Research & Methodology" },
  { code: "CS6103", name: "Machine Learning" },
];

const SAMPLE_BATCHES = ["2018/2019", "2019/2020", "2020/2021", "2021/2022"];

const SAMPLE_STUDENTS: Student[] = [
  {
    id: 1,
    regNo: "EG/2019/001",
    name: "Tharindu Perera",
    email: "tharindu.perera@example.com",
    batch: "2019/2020",
    courseCode: "EC7201",
  },
  {
    id: 2,
    regNo: "EG/2019/012",
    name: "Nethmi Silva",
    email: "nethmi.silva@example.com",
    batch: "2019/2020",
    courseCode: "EC7201",
  },
  {
    id: 3,
    regNo: "EG/2018/005",
    name: "Sahan Jayasinghe",
    email: "sahan.jayasinghe@example.com",
    batch: "2018/2019",
    courseCode: "EE7001",
  },
  {
    id: 4,
    regNo: "EG/2018/022",
    name: "Dilini Fernando",
    email: "dilini.fernando@example.com",
    batch: "2018/2019",
    courseCode: "EE7001",
  },
  {
    id: 5,
    regNo: "EG/2020/003",
    name: "Isuru Karunaratne",
    email: "isuru.k@example.com",
    batch: "2020/2021",
    courseCode: "CS6103",
  },
  {
    id: 6,
    regNo: "EG/2020/017",
    name: "Malsha Jayawardena",
    email: "malsha.j@example.com",
    batch: "2020/2021",
    courseCode: "CS6103",
  },
];

const StudentEnrollmentPanel: React.FC = () => {
    const [selectedCourse, setSelectedCourse] = useState<string>("EC7201");
    const [selectedBatch, setSelectedBatch] = useState<string>("2019/2020");

    const [students, setStudents] = useState<Student[]>(() =>
    SAMPLE_STUDENTS.filter(
      (s) => s.courseCode === "EC7201" && s.batch === "2019/2020"
    )
  );

  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCourse = e.target.value;
    setSelectedCourse(newCourse);

      if (newCourse && selectedBatch) {
      const filtered = SAMPLE_STUDENTS.filter(
        (s) => s.courseCode === newCourse && s.batch === selectedBatch
      );
      setStudents(filtered);
    } else {
      setStudents([]);
    }
  };

  const handleBatchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBatch = e.target.value;
    setSelectedBatch(newBatch);

    if (selectedCourse && newBatch) {
      const filtered = SAMPLE_STUDENTS.filter(
        (s) => s.courseCode === selectedCourse && s.batch === newBatch
      );
      setStudents(filtered);
    } else {
      setStudents([]);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedCourse || !selectedBatch) {
      setUploadError("Please select course and batch before uploading.");
      e.target.value = "";
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      const parsedStudents: Student[] = json.map((row, index) => ({
        id: index + 1,
        regNo: row.RegNo || row["Reg No"] || row["Registration No"] || "",
        name: row.Name || row["Student Name"] || "",
        email: row.Email || row["Email Address"] || "",
        batch: selectedBatch,
        courseCode: selectedCourse,
      }));

      setStudents(parsedStudents);
      setUploadError(null);
    } catch (err) {
      console.error(err);
      setUploadError("Failed to read the file. Please check the format.");
    } finally {
      e.target.value = "";
    }
  };

  const selectedCourseLabel =
    SAMPLE_COURSES.find((c) => c.code === selectedCourse)?.name || "";

  return (
    <div className="stu-enroll-panel">
      <div className="stu-enroll-header">
        <h2 className="stu-enroll-title">Student Enrollment</h2>
        <p className="stu-enroll-subtitle">
          Select a course &amp; batch, upload an Excel sheet of students, and view them below.
        </p>
      </div>

     
      <div className="stu-enroll-filterbar">
   
        <div className="stu-enroll-toprow">
          <div className="stu-enroll-field">
            <label>Course</label>
            <select value={selectedCourse} onChange={handleCourseChange}>
              <option value="">Select Course</option>
              {SAMPLE_COURSES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="stu-enroll-field">
            <label>Batch</label>
            <select value={selectedBatch} onChange={handleBatchChange}>
              <option value="">Select Batch</option>
              {SAMPLE_BATCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Upload section */}
        <div className="stu-enroll-upload">
          <div className="upload-label-row">
            <span className="upload-label">Upload Student List</span>
            <span className="upload-hint">Excel (.xlsx, .xls, .csv)</span>
          </div>

          <label className="file-dropzone">
            <div className="file-dropzone-inner">
              <div className="file-icon-circle">
                <FaCloudUploadAlt className="file-upload-icon" />
              </div>
              <div className="file-dropzone-text">
                <span className="file-dropzone-title">Click to choose file</span>
                <span className="file-dropzone-sub">
                  or drop your student Excel sheet here
                </span>
              </div>
            </div>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {uploadError && <div className="stu-enroll-error">{uploadError}</div>}

  
      {selectedCourse && selectedBatch && (
        <div className="stu-enroll-meta">
          <span>
            <strong>Course:</strong> {selectedCourse}
            {selectedCourseLabel && ` - ${selectedCourseLabel}`}
          </span>
          <span>
            <strong>Batch:</strong> {selectedBatch}
          </span>
          <span>
            <strong>Total Students:</strong> {students.length}
          </span>
        </div>
      )}

    
      <div className="stu-enroll-table-wrap">
        {students.length === 0 ? (
          <div className="stu-enroll-empty">
            No students to display. Select course &amp; batch, then upload an Excel
            file.
          </div>
        ) : (
          <table className="stu-enroll-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Reg No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Batch</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => (
                <tr key={s.id}>
                  <td>{idx + 1}</td>
                  <td>{s.regNo}</td>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.batch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StudentEnrollmentPanel;
