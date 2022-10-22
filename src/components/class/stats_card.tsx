import { Class, Quiz, Student, User } from '@prisma/client';
import Card from '../card';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import Button from '../button';
import { SetStateAction, useEffect, useState } from 'react';
import ImportQuiz from '../quiz/quiz_import';
import ExportStatistics from './statistics_export';
import { gql, useLazyQuery, useQuery } from '@apollo/client';
import { GetQuizzesQuery } from '@/pages/quiz/list';
import { Selector } from '../selector';
import { LoadingSpinner } from '../loading';
import { StatsResult } from '@/graphql/resolvers/statistics';

const ClassStatisticsQuery = gql`
  query($classId: String!) {
    classStatistics(classId: $classId) {
      id
      completed
      assigned
      averageGrade
      data
    }
  }
`;

const QuizStatisticsQuery = gql`
  query($classId: String!, $quizId: String!) {
    quizStatistics(classId: $classId, quizId: $quizId) {
      id
      completed
      assigned
      averageGrade
      data
    }
  }
`;

ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement);

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

interface StatsCard {
  classId: string,
}
const StatsCard: React.FC<StatsCard> = ({ classId }) => {
  const [selectedQuiz, setSelectedQuiz] = useState<{ id: string, name: string }>({ id: '', name: '' });
  const [quizData, setQuizData] = useState<Record<string, StatsResult>>({});
  const [exporting, setExporting] = useState(false);
  const { data, loading } = useQuery(ClassStatisticsQuery, {
    variables: {
      classId,
    }
  });
  const [quizStatisticsQuery] = useLazyQuery(QuizStatisticsQuery);

  if (!loading) {
    console.log(data);
  }

  useEffect(() => {
    if (!loading && data.classStatistics) {
      setQuizData((prev) => {
        const next = {
          ...prev
        };

        next[''] = data.classStatistics as StatsResult;

        return next;
      })
    }
  }, [data]);

  useEffect(() => {
    (async () => {
      if (!(selectedQuiz.id in quizData) && selectedQuiz.id !== '') {
        try {
          const result = await quizStatisticsQuery({
            variables: {
              classId,
              quizId: selectedQuiz.id,
            }
          });
          setQuizData((prev) => {
            const next = {
              ...prev,
            };

            next[selectedQuiz.id] = result.data.quizStatistics;

            return next;
          });
        } catch (error) {
          console.error(error);
        }
      }
    })();
  }, [selectedQuiz]);

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

  const optionsDoughnut1 = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Completion',
        position: 'bottom' as const,
        padding: {
          top: 10,
          bottom: 0,
        }
      }
    }
  }

  const optionsDoughnut2 = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Average Mark',
        position: 'bottom' as const,
        padding: {
          top: 10,
          bottom: 0,
        }
      }
    }
  }

  const optionsBar = {
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Quiz Breakdown',
        position: 'bottom' as const,
        padding: {
          top: 10,
          bottom: 0,
        }
      }
    }
  }

  const isLoading = loading || quizData[selectedQuiz.id] === undefined;
  const isEmpty = !isLoading && quizData[selectedQuiz.id].completed === 0;
  console.log(quizData[selectedQuiz.id]);
  return (
    <Card width=''>
      <div className="flex flex-col h-52">
        <div className='grid grid-cols-3 gap-0 p-4 flex-grow'>
          {
            isLoading ? <LoadingSpinner /> : isEmpty ? <p>No quiz attempts</p> : <>
              <p><Bar data={data3} width={'100px'} height={'100px'} options={optionsBar} /></p>
              <p><Doughnut data={data1} width={'100px'} height={'100px'} options={optionsDoughnut1} /></p>
              <p><Doughnut data={data2} width={'100px'} height={'100px'} options={optionsDoughnut2} /></p>
            </>
          }
        </div>
        <div className="mt-auto justify-self-end flex items-center gap-2">
          <div className="flex-grow flex items-center pr-4">
            <p className="w-20">
              Stats for:
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