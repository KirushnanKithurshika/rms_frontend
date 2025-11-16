import React from "react";
import "./ResultsSheetAp.css";
import ResultsTable from "./ResultsTable/ResultsTable";
import SignatureBoardRS from "../SignatureCanvasResultsSheet/SignatureCanvasRS";

type Item = { code: string; name: string; credits: number };
type Student = { name: string; regNo: string; gradesByCode: Record<string, string> };
type Counting = { core?: string[]; electives?: string[] };

type Props = {
    university?: string;
    facultyLine?: string;
    specialization?: string;
    sheetTitle?: string;
    provisionalLine?: string;
    version?: string;
    core?: Item[];
    electives?: Item[];
    student?: Student;
    modulesCountingForGPA?: Counting;
    note?: string;
    /** Single date shown on the sheet. If not provided, today's date is used. */
    finalApprovalDate?: string | Date;
};

const formatLongDate = (d?: string | Date) => {
    const date = d ? new Date(d) : new Date();
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
    }).format(date);
};

const ResultsSheetAP: React.FC<Props> = ({
    university = "Faculty of Engineering University of Ruhuna",
    facultyLine =
    "Bachelor of the Science of Engineering Honours-Semester 4 Examination E2020 Batch (Curriculum 2018)",
    specialization = "Specialisation: Computer Engineering Honors Degree Programme (CE)",
    sheetTitle = "RESULTS_SHEET_September, 2024",
    provisionalLine = "(Provisional results subject to confirmation by the senate)",
    version = "Version 1",
    core = [
        { code: "IS4305", name: "Probability and Statistics", credits: 3 },
        { code: "EE4250", name: "Signals & Systems", credits: 3 },
    ],
    electives = [
        { code: "IS4411", name: "Data Mining", credits: 3 },
        { code: "IS4510", name: "Embedded Systems", credits: 3 },
    ],
    student = {
        name: "Kithurshika K",
        regNo: "EG/2020/2005",
        gradesByCode: { EE4250: "A+", IS4305: "A", IS4411: "B+", IS4510: "A-" },
    },
    modulesCountingForGPA = { core: ["EE4250", "IS4305"], electives: ["IS4411", "IS4510"] },
    note = "Note: The results of the module IS4411 were previously released on December 23, 2024 and submitted for Senate Approval.",
    finalApprovalDate,
}) => {
    const gradeRow = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "E", "N", "W"];
    const gpRow = ["4.0", "4.0", "3.7", "3.3", "3.0", "2.7", "2.3", "2.0", "1.7", "0.0", "-", "-"];

    const coreCodes = Array.isArray(modulesCountingForGPA.core) ? modulesCountingForGPA.core : [];
    const elecCodes = Array.isArray(modulesCountingForGPA.electives) ? modulesCountingForGPA.electives : [];

    const coreCount = Math.max(coreCodes.length || 0, 1);
    const elecCount = Math.max(elecCodes.length || 0, 1);
    const totalCount = coreCount + elecCount;

    const grades = student?.gradesByCode ?? {};

    const handlePrint = () => window.print();

    return (
        <>
            <section className="sheet a4" id="results-pdf-root">
                {/* The sheet sits inside the page scroller */}
                <div role="document" aria-label="A4 Results Sheet">
                    <div className="rs-top avoid-break">
                        {/* Header */}
                        <div className="hdr uni">{university}</div>
                        <div className="hdr under">{facultyLine}</div>
                        <div className="hdr spec">{specialization}</div>
                        <div className="hdr title">{sheetTitle}</div>
                        <div className="hdr under">{provisionalLine}</div>
                        <div className="hdr ver">{version}</div>

                        {/* Section title */}
                        <div className="section-title avoid-break">Modules Counting for GPA</div>

                        {/* Column labels */}
                        <div className="labels">
                            <span className="u">Module No.</span>
                            <span className="u">Module Name</span>
                            <span className="u right">Credits</span>
                        </div>

                        {/* Core */}
                        <div className="group">Core Modules</div>
                        <table className="list avoid-break">
                            <tbody>
                                {core.map((m, i) => (
                                    <tr key={`c-${i}`}>
                                        <td className="code">{m.code}</td>
                                        <td className="name">{m.name}</td>
                                        <td className="cr">{m.credits}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Electives */}
                        <div className="group">Technical / General Electives</div>
                        <table className="list">
                            <tbody>
                                {electives.map((m, i) => (
                                    <tr key={`e-${i}`}>
                                        <td className="code">{m.code}</td>
                                        <td className="name">{m.name}</td>
                                        <td className="cr">{m.credits}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="legend avoid-break">
                            <div className="legend-row">
                                <span className="legend-head">Grade</span>
                                {gradeRow.map((g) => (
                                    <span key={g} className="legend-cell">
                                        {g}
                                    </span>
                                ))}
                            </div>
                            <div className="legend-row">
                                <span className="legend-head">Grade Point</span>
                                {gpRow.map((g, i) => (
                                    <span key={i} className="legend-cell">
                                        {g}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="rs-box">
                            <ResultsTable />


                            <section className="rs-sign-exactAP avoid-break">
                                <div className="sig-gridAP">
                                   
                                    <div className="sig-colAP">
                           
                                        <div className="sig-signboxAP">
                                            <SignatureBoardRS />
                                        </div>

                              
                                        <div className="sig-rightHeaderAP sig-rightHeaderAP--below">
                                          <div className="sig-smallAP">Checked</div>
                                          
                                        </div>

                                   
                                        <div className="sig-signboxAP">
                                            <SignatureBoardRS />
                                        </div>

                                        <div className="sig-smallAP">Certified Correct.</div>
                                        <div className="sig-captionAP">
                                            Assistant Registrar<br />
                                            Faculty of Engineering, University of Ruhuna<br />
                                            Hapugala, Galle
                                        </div>

                                        <div className="sig-dateAP">
                                            <span className="sig-dateLabelAP">Final Approval Date :</span>
                                            <span className="sig-dateValueAP">{formatLongDate(finalApprovalDate)}</span>
                                        </div>
                                    </div>


                                    {/* RIGHT COLUMN */}
                                    <div className="sig-colAP">
                                        {/* Dean */}
                                        <div className="sig-signboxAP">
                                            <SignatureBoardRS />
                                        </div>
                                        <div className="sig-captionAP">Dean, Faculty of Engineering</div>

                                        {/* VC */}
                                        <div className="sig-signboxAP">
                                            <SignatureBoardRS />
                                        </div>
                                        <div className="sig-captionAP">Vice-chancellor, University of Ruhuna</div>
                                    </div>
                                </div>
                            </section>

                        </div>
                    </div>
                </div>
            </section>

            <section className="sheet a4"></section>
            <section className="sheet a4"></section>
        </>
    );
};

export default ResultsSheetAP;
