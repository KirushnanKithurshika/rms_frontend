import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions, ChartData } from 'chart.js';

import './marksrange.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MarksRangeBarChart = () => {
  const data: ChartData<'bar', number[], string> = {
    labels: ['0–20', '21–40', '41–60', '61–80', '81–100'],
    datasets: [
      {
        label: 'Number of Students',
        data: [3, 7, 15, 20, 10],
        backgroundColor: '#0b8d79',
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#222',
          font: {
            weight: 'bold',
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#333',
          font: {
            size: 12,
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 5,
          color: '#333',
          font: {
            size: 12,
          },
        },
        grid: {
          color: '#e5e5e5',
        },
      },
    },
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
