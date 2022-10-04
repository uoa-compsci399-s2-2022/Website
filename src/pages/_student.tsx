/**
 * The 'Student' page allows students to view their upcoming quizzes.
 * Clicking on a quiz will take them to perform that quiz
 * 
 * Sections -> upcoming, available
 *          -> upcoming, cannot take yet
 **/
import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { Quiz, QuizAssignment, User } from '@prisma/client';
import { CardContainer } from '@/components/card';
import QuizCard from '@/components/quiz/quiz_card';

export const GetUpcomingQuizzesQuery = gql`
    query {
        upcomingQuizzes {
            id
            start
            end
            quiz {
                id
                created
                name
                description
                timeLimit
            }
            assignedBy {
                id
                name
                email
            }
        }
    }
`;

const Student: React.FC = () => {
    const { loading, error, data } = useQuery(GetUpcomingQuizzesQuery);

    if (loading) {
        return <main>
            <h1 className="text-white text-3xl p-6">
                loading...
            </h1>
        </main>
    }

    if (error) {
        return <main>
            <h1 className="text-white text-3xl p-6">
                error {JSON.stringify(error)}
            </h1>
        </main>
    }

    const quizAssignments = data.upcomingQuizzes as (QuizAssignment & {
        quiz: Quiz,
        assignedBy: User,
    })[];

    return (
        <>
            <main className="">
                <h1 className="text-white text-3xl p-6">
                    student home
                </h1>
                <div>
                    <CardContainer>
                        {
                            quizAssignments.map((assignment) => {
                                return (
                                    <QuizCard
                                        key={`quiz-${assignment.id}`}
                                        quiz={assignment.quiz}
                                        assignment={assignment}
                                    />
                                )
                            })
                        }
                    </CardContainer>
                </div>
            </main>
        </>
    )
};

export default Student;
