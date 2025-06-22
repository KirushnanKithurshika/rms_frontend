import React, { useState } from 'react';
import './searchdropdown.css';
import { FaSearch, FaChevronDown } from 'react-icons/fa';

const courses = [
  'EC7201 - Information Security',
  'EE7001 - Research & Methodology',
  'CS6103 - Machine Learning',
  'CE7102 - Data Structures',
];

const CourseSearchBarlechome: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState(courses[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSelect = (course: string) => {
    setSelectedCourse(course);
    setDropdownOpen(false);
  };

  return (
    <div className="course-search-container">
      <FaSearch className="search-iconLH" />
      <div className="selected-courseLH" onClick={() => setDropdownOpen(!dropdownOpen)}>
        <span>{selectedCourse}</span>
        <FaChevronDown className="dropdown-iconLH" />
      </div>
      {dropdownOpen && (
        <ul className="dropdown-menuLH">
          {courses.map((course, index) => (
            <li key={index} onClick={() => handleSelect(course)}>
              {course}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CourseSearchBarlechome;
