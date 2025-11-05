import React, { useState, useEffect } from "react";
import "./searchdropdown.css";
import { FaSearch, FaChevronDown } from "react-icons/fa";

interface Course {
  courseId: string;
  courseDisplayName: string;
}

interface Props {
  courses: Course[];
  selectedCourseId: string;
  onCourseSelect: (courseId: string) => void;
}

const CourseSearchBarlechome: React.FC<Props> = ({
  courses,
  selectedCourseId,
  onCourseSelect,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const selectedCourse =
    courses.find((c) => c.courseId === selectedCourseId)?.courseDisplayName ||
    "Select Course";

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      onCourseSelect(courses[0].courseId);
    }
  }, [courses]);

  return (
    <div className="course-search-container">
      <FaSearch className="search-iconLH" />
      <div
        className="selected-courseLH"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <span>{selectedCourse}</span>
        <FaChevronDown className="dropdown-iconLH" />
      </div>
      {dropdownOpen && (
        <ul className="dropdown-menuLH">
          {courses.map((course) => (
            <li
              key={course.courseId}
              onClick={() => {
                onCourseSelect(course.courseId);
                setDropdownOpen(false);
              }}
            >
              {course.courseDisplayName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CourseSearchBarlechome;
