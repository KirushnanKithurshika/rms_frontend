import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import "./createcourseform.css";

interface DropdownProps {
  label: string;
  options: string[];
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

const CustomDropdown: React.FC<DropdownProps> = ({
  label,
  options,
  value,
  placeholder,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="form-group custom-dropdown" ref={dropdownRef}>
      <label className="dropdown-label">{label}</label>
      <div
        className={`dropdown-selected ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span>{value || placeholder}</span>
        <FaChevronDown className={`dropdown-icon ${open ? "rotate" : ""}`} />
      </div>

      {open && (
        <div className="dropdown-options">
          {options.map((option, index) => (
            <div
              key={index}
              className={`dropdown-option ${value === option ? "active" : ""}`}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CreateCourseForm: React.FC = () => {
  const academicYears = [
    "2020/2021",
    "2021/2022",
    "2022/2023",
    "2023/2024",
    "2024/2025",
  ];

  const departments = [
    "Computer Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Marine Engineering",
    "Civil Engineering",
  ];

  const semesters = [
    "Semester 1",
    "Semester 2",
    "Semester 3",
    "Semester 4",
    "Semester 5",
    "Semester 6",
    "Semester 7",
    "Semester 8",
  ];

  const [academicYear, setAcademicYear] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");

  return (
    <div className="form-wrapper">
      <h2 className="form-title">Create Course</h2>

      <form className="form-content">
        <div className="section course-section">
          <h3 className="section-headingCC">Course Details</h3>
          <div className="form-grid">
            <div>
              <div className="form-group">
                <label>Course Code</label>
                <input className="input" placeholder="Course Code" />
              </div>

              <CustomDropdown
                label="Academic Year"
                options={academicYears}
                value={academicYear}
                placeholder="Select Academic Year"
                onChange={setAcademicYear}
              />
            </div>

            <div>
              <div className="form-group">
                <label>Course Title</label>
                <input className="input" placeholder="Course Title" />
              </div>

              <CustomDropdown
                label="Department"
                options={departments}
                value={department}
                placeholder="Select Department"
                onChange={setDepartment}
              />
            </div>

            <div>
              <CustomDropdown
                label="Semester"
                options={semesters}
                value={semester}
                placeholder="Select Semester"
                onChange={setSemester}
              />

              <div className="form-group">
                <label>Degree Program</label>
                <input className="input" placeholder="Degree Program" />
              </div>
            </div>

            <div>
              <div className="form-group">
                <label>Coordinator</label>
                <input className="input" placeholder="Coordinator" />
              </div>

              <div className="form-group">
                <label>Credit Value</label>
                <input className="input" placeholder="Credit Value" />
              </div>
            </div>
          </div>
        </div>

        {/* Coordinator Section */}
        <div className="section coordinator-section">
          <h3 className="section-headingCC">Coordinator Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Coordinator</label>
              <input className="input" placeholder="Coordinator" />
            </div>

            <div className="form-group">
              <label>Coordinator Staff ID</label>
              <input className="input" placeholder="Coordinator Staff ID" />
            </div>

            <div className="form-group full-width">
              <label>Email Address</label>
              <input className="input" placeholder="Email Address" />
            </div>
          </div>
        </div>

        {/* Assessment Section */}
        <div className="assessment-section">
          <h3 className="section-headingCC">Assessment Components:</h3>
          <div className="checkbox-grid">
            {[
              "Quizzes",
              "Lab Work",
              "Take Home",
              "Assignments",
              "Project Work",
              "Mini Project",
              "Midterm Exam",
              "Final Exam",
            ].map((label) => (
              <label key={label} className="checkbox-item">
                <input type="checkbox" className="custom-checkbox" />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="submit-button-createcoursediv">
          <button type="submit" className="submit-button-createcourse">
            Create course
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCourseForm;
