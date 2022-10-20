import { Class, Quiz, Student, User } from '@prisma/client';
import Card from '../card';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import Button from '../button';
import { SetStateAction, useEffect, useState } from 'react';
import ImportQuiz from '../quiz/quiz_import';
import ExportStatistics from './statistics_export';
import { useQuery } from '@apollo/client';
import { GetQuizzesQuery } from '@/pages/quiz/list';
import { Selector } from '../selector';
import { LoadingSpinner } from '../loading';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface QuizSelectorProps {
  value: { id: string, name: string },
  setValue: React.Dispatch<SetStateAction<{ id: string, name: string }>>,
}

const QuizSelector: React.FC<QuizSelectorProps> = ({ value, setValue }) => {
  const { data, loading, ...all } = useQuery(GetQuizzesQuery);

  const allQuizzes = { id: '', name: 'All Quizzes' };

  const quizzes = (data ? [allQuizzes, ...data?.quizzes] : [allQuizzes]) as Quiz[];

  useEffect(() => {
    setValue(quizzes[0]);
  }, []);

  if (loading) return;

  return (
    <Selector
      value={value}
      values={quizzes}
      onChange={setValue}
      filter={(quiz: { id: string, name: string }, search: string) => {
        return quiz.name.toLowerCase().indexOf(search.toLowerCase()) >= 0;
      }}
      display={(quiz?: { id: string, name: string }) => quiz?.name ?? 'loading...'}
      _key={(quiz: { id: string, name: string }) => quiz.id}
    />
  )
};

const StatsCard: React.FC = ({ }) => {
  const [selectedQuiz, setSelectedQuiz] = useState<{ id: string, name: string }>({ id: '', name: '' });
  const [exporting, setExporting] = useState(false);

  const data1 = {
    labels: ['Complete', 'Incomplete'],
    datasets: [
      {
        label: 'Completion',
        data: [17, 4],
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)',
          'rgba(255, 99, 132, 0.2)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const data2 = {
    labels: ['Correct', 'Incorrect'],
    datasets: [
      {
        label: 'Average Mark',
        data: [65, 35],
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)',
          'rgba(255, 99, 132, 0.2)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const data3 = {
    labels: ['My Quiz', 'Quiz 2', 'Quiz 3', 'Quiz 4', 'Quiz 5'],
    datasets: [{
      label: 'Average Grade',
      data: [65, 59, 80, 81, 56, 55, 40],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(255, 205, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(201, 203, 207, 0.2)'
      ],
      borderColor: [
        'rgb(255, 99, 132)',
        'rgb(255, 159, 64)',
        'rgb(255, 205, 86)',
        'rgb(75, 192, 192)',
        'rgb(54, 162, 235)',
        'rgb(153, 102, 255)',
        'rgb(201, 203, 207)'
      ],
      borderWidth: 1
    }]
  };

  const optionsDoughnut = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  }

  const optionsBar = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  }

  return (
    <Card width=''>
      <div className="flex flex-col h-52">
        <h1 className="text-white font-bold text-xl">Statistics</h1>
        <div className='grid grid-cols-3 gap-0 p-4'>
          <a><Doughnut data={data1} width={'100px'} height={'100px'} options={optionsDoughnut} /></a>
          <a><Doughnut data={data2} width={'100px'} height={'100px'} options={optionsDoughnut} /></a>
          <a><Bar data={data3} width={'100px'} height={'100px'} options={optionsBar} /></a>
        </div>
        <div className="mt-auto justify-self-end flex items-center gap-2">
          <div className="flex-grow flex items-center pr-4">
            <p className="w-20">
              By quiz:
            </p>
            <div className="flex-grow">
              <QuizSelector
                value={selectedQuiz}
                setValue={setSelectedQuiz}
              />

            </div>
          </div>
          {selectedQuiz.id !== '' &&
            <>
              {
                exporting && <LoadingSpinner />
              }
              <ExportStatistics
                quizId={selectedQuiz.id}
                onStart={() => setExporting(true)}
                onComplete={() => setExporting(false)}
              />
            </>
          }
        </div>
      </div>
    </Card>
  )
}

export default StatsCard