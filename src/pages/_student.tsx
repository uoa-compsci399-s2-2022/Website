/**
 * The 'Student' page allows students to view their upcoming quizzes.
 * Clicking on a quiz will take them to perform that quiz
 * 
 * Sections -> upcoming, available
 *          -> upcoming, cannot take yet
 **/
import { Session } from 'next-auth';
import React from 'react';

export interface Quiz {
    id: number,
    name: string,
    start_date: Date,
    end_date: Date,
}

const SampleQuizzes: Quiz[] = [
    {
        id: 0,
        name: 'Beginner spatial reasoning',
        start_date: new Date(),
        end_date: new Date()
    }
]

interface StudentProps {
    session: Session,
}

const Student: React.FC<StudentProps> = ({ session }) => {
    return (
        <>
            <main className="">
                <h1 className="">
                    student home
                </h1>
                <div>
                    {
                        SampleQuizzes.map((quiz) => {
                            return (
                                <div key={`quiz-${quiz.id}`}>
                                    <h1>{quiz.name}</h1>
                                    <p>Due {quiz.end_date.toDateString()}</p>
                                </div>
                            )
                        })
                    }
                </div>
            </main>
        </>
    )
};

export default Student;
