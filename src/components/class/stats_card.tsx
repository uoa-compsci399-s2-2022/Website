import { Class, Student, User } from '@prisma/client';
import Card from '../card';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const StatsCard: React.FC = ({ }) => {
  const data = {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [
      {
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  }

  return (
    <Card width=''>
      <h5 className="mt-4 text-xl font-bold text-text-colour">Class Statistics</h5>
      <div className='grid grid-cols-3 gap-0 p-4'>
        <a><Doughnut data={data} width={'100px'} height={'100px'} options={options} /></a>
        <a><Doughnut data={data} width={'100px'} height={'100px'} options={options} /></a>
        <a><Doughnut data={data} width={'100px'} height={'100px'} options={options} /></a>
      </div>
    </Card>
  )
}

export default StatsCard