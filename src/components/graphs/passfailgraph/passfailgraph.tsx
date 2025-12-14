import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./passfailgraph.css";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  pass: number;
  fail: number;
}

const DonutChart: React.FC<Props> = ({ pass, fail }) => {
  const total = pass + fail;
  const passPercent = total > 0 ? Math.round((pass / total) * 100) : 0;

  const data = {
    labels: ["Pass", "Fail"],
    datasets: [
      {
        data: [pass, fail],
        backgroundColor: ["#0b8d79", "#26e184"],
        borderColor: "#fff",
        borderWidth: 2,
        cutout: "70%",
        hoverOffset: 8,
      },
    ],
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "300px",
        aspectRatio: "1 / 1",
        margin: "0 auto",
        position: "relative",
      }}
    >
      <Doughnut
        data={data}
        options={{ responsive: true, maintainAspectRatio: false }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "1rem",
          color: "#333",
        }}
      >
        {passPercent}%<br />
        Pass
      </div>
    </div>
  );
};

export default DonutChart;
