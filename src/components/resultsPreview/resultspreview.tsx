import React, { useState } from 'react';
import './ResultsPreview.css';
import Logo from '../../assets/ResultsP_Logo.png';

const dummyData = [
  { id: '1', name: 'Student A', project: '18', quiz1: '25', quiz2: '28', total: '71', status: 'Pass' },
  { id: '2', name: 'Student B', project: '15', quiz1: '22', quiz2: '27', total: '64', status: 'Pass' },
  { id: '3', name: 'Student C', project: '17', quiz1: '26', quiz2: '25', total: '68', status: 'Pass' },
  { id: '4', name: 'Student D', project: '19', quiz1: '27', quiz2: '29', total: '75', status: 'Pass' },
  { id: '5', name: 'Student E', project: '20', quiz1: '28', quiz2: '28', total: '76', status: 'Pass' },
];

const courses = [
  { code: 'EC7201', name: 'Information Security' },
  { code: 'EC7202', name: 'Computer Networks' },
  { code: 'EC7203', name: 'Web Engineering' },
];

const ResultsPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CA' | 'FE'>('CA');
  const [selectedCourse, setSelectedCourse] = useState(courses[0]);

  const handlePrint = () => {
    window.print();
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const course = courses.find(c => c.code === e.target.value);
    if (course) {
      setSelectedCourse(course);
    }
  };

  return (
    <div className="results-preview-container">
      <div className="course-select-header">
        <h3>Results Preview</h3>
        <div className="select-container">
          <label className="select-label">Select Course:</label>
          <select className="custom-select">
            <option value="EC7201">EC7201 - Information Security</option>
            <option value="EC7202">EC7202 - Cryptography</option>

          </select>
        </div>
        <hr className="dropdown-divider" />

      </div>

      <div className="tabs">
        <button
          className={activeTab === 'CA' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('CA')}
        >
          Continuous Assessment
        </button>
        <button
          className={activeTab === 'FE' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('FE')}
        >
          Final Exam
        </button>
        <button className="tab print-btn" onClick={handlePrint}>
          Print
        </button>
      </div>

      {activeTab === 'CA' && (
        <div className="report-card">
          <div className="report-header">
            <div className="report-section">
              <h4>{selectedCourse.name}</h4>
              <p>CA Marks (Total 40%)</p>
            </div>
            <div className="report-logo">
              <img src={Logo} alt="Logo" />
            </div>
            <div className="report-section previewh-text">
              <p>
                2024<br />
                22nd Batch<br />
                Department: Computer Engineering<br />
                Module Code: {selectedCourse.code}
              </p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="results-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Project (20)</th>
                  <th>Quiz 1 (30)</th>
                  <th>Quiz 2 (30)</th>
                  <th>Total (80)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dummyData.map((student, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{student.project}</td>
                    <td>{student.quiz1}</td>
                    <td>{student.quiz2}</td>
                    <td>{student.total}</td>
                    <td>{student.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="print-footer">
            Printed on: {new Date().toLocaleDateString()}
          </footer>
        </div>
      )}
    </div>
  );
};

export default ResultsPreview;
