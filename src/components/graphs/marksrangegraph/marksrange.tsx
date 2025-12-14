import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartOptions, ChartData } from "chart.js";
import "./marksrange.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Props {
  dataValues: number[];
}

const MarksRangeBarChart: React.FC<Props> = ({ dataValues }) => {
  const data: ChartData<"bar", number[], string> = {
    labels: ["0–20", "21–40", "41–60", "61–80", "81–100"],
    datasets: [
      {
        label: "Number of Students",
        data: dataValues,
        backgroundColor: "#0b8d79",
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  return (
    <div className="bar-chart-wrapper">
      <div className="bar-canvas-container">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default MarksRangeBarChart;
