
import React from "react";
import { useSelector } from "react-redux";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./studenthomepagegraph.css";
import type { RootState } from "../../../app/store";

interface MetricProps {
  value: number;
  maxValue?: number;
  text: string;
  label: string;
  color?: string;
}

const MetricCircle: React.FC<MetricProps> = ({
  value,
  maxValue = 100,
  text,
  label,
  color = "#2EA3BD",
}) => {
  return (
    <div className="metric-item">
      <CircularProgressbar
        value={value}
        maxValue={maxValue}
        text={text}
        styles={buildStyles({
          textColor: "#0b3054",
          pathColor: color,
          trailColor: "#0b3054",
          textSize: "24px",
        })}
      />
      <p className="metric-label">{label}</p>
    </div>
  );
};

const StudentMetrics: React.FC = () => {
  const resultsSheet = useSelector(
    (state: RootState) => state.studentResults.resultsSheet
  );

  if (!resultsSheet) {
    return <p>Loading metrics...</p>;
  }

  // Calculate metrics
  const semesters = resultsSheet.semesters;
  const currentSemester = semesters.length;
  const allCourses = semesters.flatMap((s) => [...s.core, ...s.electives]);
  const totalCourses = allCourses.length;
  const totalCredits = allCourses.reduce((sum, c) => sum + c.credits, 0);
  const currentGPA = semesters.length ? semesters[semesters.length - 1].gpa : 0;

  // Count repeated modules (assuming grade "F" or "N" means repeated)
  const repeatedModules = semesters
    .flatMap((s) => Object.entries(s.gradesByCode))
    .filter(([_, grade]) => grade === "E" || grade === "N").length;

  return (
    <div className="metrics-container">
      <MetricCircle
        value={currentGPA}
        maxValue={4.0}
        text={currentGPA.toFixed(2)}
        label="Current GPA"
      />
      <MetricCircle
        value={totalCourses}
        maxValue={60}
        text={totalCourses.toString()}
        label="Number of Courses Taken"
      />
      <MetricCircle
        value={totalCredits}
        maxValue={150}
        text={totalCredits.toString()}
        label="Number of Credits Taken"
      />
      <MetricCircle
        value={currentSemester}
        maxValue={8}
        text={currentSemester.toString()}
        label="Current Semester"
      />
      <MetricCircle
        value={repeatedModules}
        maxValue={10}
        text={repeatedModules.toString().padStart(2, "0")}
        label="Repeated Modules"
      />
    </div>
  );
};

export default StudentMetrics;
