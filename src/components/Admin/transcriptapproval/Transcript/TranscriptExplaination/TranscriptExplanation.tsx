// src/components/Students/Transcript/TranscriptExplanation.tsx
import React from "react";
import "./TranscriptExplanation.css";

const TranscriptExplanation: React.FC = () => {
    return (
        <div className="txp-wrap">
            <h2 className="txp-title">Explanation of Transcript</h2>

            <div className="txp-box">
                {/* LEFT: Grading System */}
                <aside className="txp-left">
                    <div className="txp-left-head">Grading System</div>

                    <div className="txp-subhead">For GPA Modules</div>
                    <table className="txp-table" aria-label="GPA Grading">
                        <thead>
                            <tr>
                                <th>Grade</th>
                                <th>Grade Point</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>A+</td><td>4.0</td></tr>
                            <tr><td>A</td><td>4.0</td></tr>
                            <tr><td>A-</td><td>3.7</td></tr>
                            <tr><td>B+</td><td>3.3</td></tr>
                            <tr><td>B</td><td>3.0</td></tr>
                            <tr><td>B-</td><td>2.7</td></tr>
                            <tr><td>C+</td><td>2.3</td></tr>
                            <tr><td>C</td><td>2.0</td></tr>
                            <tr><td>C-</td><td>1.7</td></tr>
                            <tr><td>E</td><td>0.0</td></tr>
                        </tbody>
                    </table>

                    <div className="txp-subhead">For Non GPA Modules</div>
                    <table className="txp-table" aria-label="Non-GPA Grading">
                        <thead>
                            <tr>
                                <th>Grade</th>
                                <th>Grade Point</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>H</td><td>High</td></tr>
                            <tr><td>M</td><td>Medium</td></tr>
                            <tr><td>S</td><td>Satisfactory</td></tr>
                            <tr><td>E</td><td>Fail</td></tr>
                        </tbody>
                    </table>
                </aside>


                <main className="txp-right">
                    <dl className="txp-list">
                        <div><dt>CM :</dt><dd>   Core Module</dd></div>
                        <div><dt>TE :</dt><dd>Technical Elective Modules</dd></div>
                        <div><dt>GE :</dt><dd>General Elective Modules</dd></div>
                        <div><dt>(n<sup>th</sup>):</dt><dd>n<sup>th</sup> Attempt</dd></div>
                    </dl>

                    <p className="txp-para">
                        <strong>Credit:</strong> One credit shall be equivalent to one hour of lecture per week or
                        two hours of seminar per week or three hours of laboratory/field/design work per week
                        or a work camp/training course of two weeks or industrial training attachment of four
                        weeks.
                    </p>

                    <h3 className="txp-h3">Award of Degree</h3>
                    <p className="txp-para">
                        A student shall be deemed to be eligible for the award of the degree of the
                        <em> Bachelor of the Science of Engineering Honours (BScEngHons)</em> on satisfying
                        the graduation requirements within a period of four academic years from the commencement
                        of the common core course.
                    </p>

                    <p className="txp-para">
                        The Academic Standings of the BScEngHons degree are according to the Overall Grade Point
                        Average (OGPA) values stipulated below.
                    </p>

                    <table className="txp-standing" aria-label="Academic Standing">
                        <tbody>
                            <tr><td>OGPA ≥ 3.70</td><td>First Class</td></tr>
                            <tr><td>3.30 ≤ OGPA &lt; 3.70</td><td>Second Class Upper Division</td></tr>
                            <tr><td>3.00 ≤ OGPA &lt; 3.30</td><td>Second Class Lower Division</td></tr>
                            <tr><td>2.00 ≤ OGPA &lt; 3.00</td><td>Pass</td></tr>
                        </tbody>
                    </table>
                </main>

                
            </div>


            {/* --- Graduation Requirements box (place under the existing explanation content) --- */}
<div className="txp-req">
  <h3 className="txp-req-head">Graduation Requirements</h3>

  <p className="txp-para">
    To be admitted to the degree of the <em>Bachelor of the Science of Engineering Honours (BScEngHons)</em>,
    a student shall satisfy the following requirements;
  </p>

  <ol className="txp-ol">
    <li>
      A minimum total of <strong>150 credits</strong> that comprising all the Core Modules (CM),
      Technical Elective (TE), General Elective (GE) chosen from the list offered by his/her specialization
      course and Industrial Training.
    </li>
    <li>
      Technical Elective and General Elective modules must be chosen from the list offered by the relevant
      Department satisfying the accreditation requirements for an engineering degree as specified by the
      Institution of Engineers, Sri Lanka (IESL).
    </li>
    <li>
      Completion of the Development Programme, Industrial Training, English Language Proficiency Test and
      any other mandatory requirements prescribed by the Faculty Board with the approval of the Senate.
    </li>
    <li>
      A minimum Overall Grade Point Average of <strong>2.00</strong>.
    </li>
    <li>
      A residence requirement of four academic years as a duly registered full-time student of the University.
    </li>
  </ol>

  <p className="txp-para"><strong>The Overall Grade Point Average (OGPA) is calculated as follows;</strong></p>

  <div className="txp-eq">
    <span className="txp-eq-symbol">OGPA</span>
    <span>=</span>
    <span className="txp-sum">∑<sub>i</sub></span>
    <span className="txp-frac">
      <span className="txp-frac-top">∑<sub>j=1</sub><sup>n</sup> C<sub>j</sub> GPV<sub>j</sub></span>
      <span className="txp-frac-bar"></span>
      <span className="txp-frac-bot">∑<sub>j=1</sub><sup>n</sup> C<sub>j</sub></span>
    </span>
    <span>(W<sub>i</sub>)</span>
  </div>

  <p className="txp-para txp-small">
    where <em>n</em> is the number of modules taken to satisfy the graduation requirements in the
    <em> i</em><sup>th</sup> semester, GPV<sub>j</sub> is the Grade Point Value earned for the module
    <em> j</em>, C<sub>j</sub> is the number of credits of the module <em>j</em>, and W<sub>i</sub> is the
    weight assigned for the <em>i</em><sup>th</sup> semester. <span className="nowrap">W is defined as follows:</span>
  </p>

  <ul className="txp-weights">
    <li>0.05 for Semester 1 – 2</li>
    <li>0.15 for Semester 3 – 8</li>
  </ul>
</div>

        </div>
    );
};

export default TranscriptExplanation;
