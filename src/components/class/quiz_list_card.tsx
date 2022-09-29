import { GetQuizzesQuery } from '@/pages/quiz/list';
import { useQuery } from '@apollo/client';
import { Class, Quiz, QuizAssignment, QuizQuestion, Student, User } from '@prisma/client';
import { useRef } from 'react';
import Card from '../card';

const QuizListCard: React.FC = ({ }) => {
    const searchRef = useRef<HTMLInputElement>(null);
    const { data, loading, ...all } = useQuery(GetQuizzesQuery);

    const quizzes = (data?.quizzes ?? []) as (Quiz & {
        user: User,
        assignments: QuizAssignment[],
        questions: (QuizQuestion | null)[]
    })[];

    return (
        <Card>
            <h5 className="my-4 text-xl font-bold text-text-colour">Quizes</h5>
            {/*
            <div>
                <input
                    className="outline outline-1 focus:outline-2 rounded w-full p-2"
                    type="text"
                    ref={searchRef}
                    placeholder="Search..."
                />
            </div>
             */}
            <div className='flex flex-col gap-2 py-2'>
                {loading ? <p>loading...</p> :
                    quizzes.map(quiz => (
                        <div key={`quiz-${quiz.id}`}>
                            {quiz.name} ({quiz.assignments.length} assignments)
                        </div>
                    ))
                }
            </div>
        </Card>
    )
}

export default QuizListCard