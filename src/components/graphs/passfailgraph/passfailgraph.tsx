import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './passfailgraph.css';
ChartJS.register(ArcElement, Tooltip, Legend);

const DonutChart = () => {
  const data = {
    labels: ['Pass', 'Fail'],
    datasets: [
      {
        label: 'Pass vs Fail',
        data: [90, 10],
        backgroundColor: ['#0b8d79', '#26e184'],
        borderColor: '#fff',
        borderWidth: 2,
        cutout: '70%',
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    layout: {
      padding: 0,
    },
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '300px',
        height: 'auto',
        aspectRatio: '1 / 1',
        margin: '0 auto',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Doughnut data={data} options={options} />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '1rem',
          color: '#333',
        }}
      >
        90%<br />Pass
      </div>
    </div>
  );
};

export default DonutChart;
