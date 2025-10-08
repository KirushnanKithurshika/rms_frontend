import React, { useState } from 'react';
import './resultspreview.css';
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

  const handlePrint = () => window.print();

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const course = courses.find(c => c.code === e.target.value);
    if (course) setSelectedCourse(course);
  };

  return (
    
    <div className="rp-container">
      <div className="rp-header">
        <h3 className="rp-title">Results Preview</h3>

        <div className="rp-select-row">
          <label className="rp-select-label">Select Course:</label>
          <select
            className="rp-select"
            value={selectedCourse.code}
            onChange={handleCourseChange}
          >
            {courses.map(c => (
              <option key={c.code} value={c.code}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>

        <hr className="rp-divider" />
      </div>

      <div className="rp-tabs">
        <button
          className={`rp-tab ${activeTab === 'CA' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('CA')}
        >
          Continuous Assessment
        </button>
        <button
          className={`rp-tab ${activeTab === 'FE' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('FE')}
        >
          Final Exam
        </button>
        <button className="rp-tab rp-print-btn" onClick={handlePrint}>
          Print
        </button>
      </div>

      {activeTab === 'CA' && (
        <div className="rp-card">
          <div className="rp-card-header">
            <div className="rp-section">
              <h4>{selectedCourse.name}</h4>
              <p>CA Marks (Total 40%)</p>
            </div>
            <div className="rp-logo">
              <img src={Logo} alt="University/Department Logo" />
            </div>
            <div className="rp-section rp-right">
              <p>
                2024<br />
                22nd Batch<br />
                Department: Computer Engineering<br />
                Module Code: {selectedCourse.code}
              </p>
            </div>
          </div>

          <div className="rp-table-wrap">
            <table className="rp-table">
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
                  <tr key={student.id}>
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

          <footer className="rp-print-footer">
            Printed on: {new Date().toLocaleDateString()}
          </footer>
        </div>
      )}

      {activeTab === 'FE' && (
        <div className="rp-card">
          <div className="rp-card-header">
            <div className="rp-section">
              <h4>{selectedCourse.name}</h4>
              <p>Final Exam (Total 60%)</p>
            </div>
            <div className="rp-logo">
              <img src={Logo} alt="University/Department Logo" />
            </div>
            <div className="rp-section rp-right">
              <p>
                2024<br />
                22nd Batch<br />
                Department: Computer Engineering<br />
                Module Code: {selectedCourse.code}
              </p>
            </div>
          </div>

          <div className="rp-table-wrap">
            <table className="rp-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Final Exam (60)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dummyData.map((student, idx) => (
                  <tr key={student.id}>
                    <td>{idx + 1}</td>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    {/* simple placeholder value */}
                    <td>{Math.max(0, Number(student.total) - 40)}</td>
                    <td>{student.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="rp-print-footer">
            Printed on: {new Date().toLocaleDateString()}
          </footer>
        </div>
      )}
    </div>
  );
};

export default ResultsPreview;
