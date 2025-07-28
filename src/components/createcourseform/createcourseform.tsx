import React from 'react';
import './createcourseform.css';

const CreateCourseForm: React.FC = () => {
    return (
        <div className="form-wrapper">

            <div className="section title-section">
                <h2 className="form-title">Create Course</h2>
            </div>

            <form className="form-content">

                <div className="section course-section">
                    <h3 className="section-headingCC">Course Details</h3>
                    <div className="form-grid">
                        <div>
                            <div className="form-group">
                                <label htmlFor="courseCode">Course Code</label>
                                <input id="courseCode" className="input" placeholder="Course Code" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="academicYear">Academic Year</label>
                                <input id="academicYear" className="input" placeholder="Academic Year" />
                            </div>
                        </div>
                        <div>

                            <div className="form-group">
                                <label htmlFor="courseTitle">Course Title</label>
                                <input id="courseTitle" className="input" placeholder="Course Title" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="department">Department</label>
                                <input id="department" className="input" placeholder="Department" />
                            </div>
                        </div>
                        <div>
                            <div className="form-group">
                                <label htmlFor="semester">Semester</label>
                                <select id="semester" className="input">
                                    <option value="">Select Semester</option>
                                    <option value="1">Semester 1</option>
                                    <option value="2">Semester 2</option>
                                    <option value="3">Semester 3</option>
                                    <option value="4">Semester 4</option>
                                    <option value="5">Semester 5</option>
                                    <option value="6">Semester 6</option>
                                    <option value="7">Semester 7</option>
                                    <option value="8">Semester 8</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="degreeProgram">Degree Program</label>
                                <input id="degreeProgram" className="input" placeholder="Degree Program" />
                            </div>
                        </div>
                        <div>
                            <div className="form-group">
                                <label htmlFor="coordinator">Coordinator</label>
                                <input id="coordinator" className="input" placeholder="Coordinator" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="creditValue">Credit Value</label>
                                <input id="creditValue" className="input" placeholder="Credit Value" />
                            </div>
                        </div>
                    </div>
                </div>


                <div className="section coordinator-section">
                    <h3 className="section-headingCC">Coordinator Details</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="coordinator">Coordinator</label>
                            <input id="coordinator" className="input" placeholder="Coordinator" />
                        </div>

                        <div className="form-group ">
                            <label htmlFor="staffId">Coordinator Staff ID</label>
                            <input id="staffId" className="input" placeholder="Coordinator Staff ID" />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="email">Email Address</label>
                            <input id="email" className="input" placeholder="Email Address" />
                        </div>
                    </div>

                </div>


                <div className="assessment-section">
                    <h3 className="section-headingCC">Assessment Components:</h3>
                    <div className="checkbox-grid">
                        {[
                            'Quizzes',
                            'Lab Work',
                            'Take Home ',
                            'Assignments',
                            'Project Work',
                            'Mini Project',
                            'Midterm Exam',
                            'Final Exam',
                        ].map((label) => (
                            <label key={label} className="checkbox-item">
                                <input type="checkbox" className="custom-checkbox" />
                                <span>{label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className='submit-button-createcoursediv'>
                    <button type="submit" className="submit-button-createcourse">
                        Create course
                    </button>
                </div>

                
            </form>
        </div>
    );
};

export default CreateCourseForm;
