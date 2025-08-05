import React from "react";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./studenthomepagegraph.css";

interface MetricProps {
  value: number;
  maxValue?: number;
  text: string;
  label: string;
  color?: string;
}

const MetricCircle: React.FC<MetricProps> = ({ value, maxValue = 100, text, label, color = "#3bb2e3" }) => {
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
  return (
    <div className="metrics-container">
      <MetricCircle value={3.3} maxValue={4.0} text="3.3" label="Current GPA" />
      <MetricCircle value={40} maxValue={60} text="40" label="Number of Courses Taken" />
      <MetricCircle value={128} maxValue={150} text="128" label="Number of Credits Taken" />
      <MetricCircle value={7} maxValue={8} text="07" label="Current Semester" />
      <MetricCircle value={0} maxValue={10} text="00" label="Repeated Module" />
    </div>
  );
};

export default StudentMetrics;
