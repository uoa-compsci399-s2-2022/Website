/**
 * The 'QuizEditor' component enables instructors to edit quizzes
 **/
import Button from '@/components/button';
import { QuizCreator } from '@/components/quiz_creator';
import { gql, useQuery } from '@apollo/client';
import { Quiz, QuizAssignment, QuizQuestion, QuizQuestionLink } from '@prisma/client';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export const GetQuizQuery = gql`
    query($id: String!) {
        quiz(id: $id) {
            id
            name
            description
            timeLimit
            questions {
                id
                timeLimit
                quizQuestion {
                    id
                    name
                }
            }
        }
    }
`;

interface QuizEditorProps {
    id: string,
}

const QuizEditor: React.FC<QuizEditorProps> = ({ id }) => {
    const [quizEditorOpen, setQuizEditorOpen] = useState(false);
    const { data, refetch } = useQuery(GetQuizQuery, {
        variables: {
            id
        }
    });
    const quiz = data.quiz as Quiz & {
        questions: (QuizQuestionLink & {
            quizQuestion?: QuizQuestion
        })[],
        assignments: QuizAssignment[],
    };
    const editorInitial = {
        name: quiz.name,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        questions: 0
    };

    return <div>

        <div className="w-4/5 mx-auto">
            <div className="rounded-lg bg-slate-600 m-4">
                <div className="flex p-4 items-center">
                    <h1 className="text-white text-3xl p-2 flex-grow">
                        {quiz.name}
                    </h1>
                    <span>
                        <Button
                            theme='solid'
                            action={() => setQuizEditorOpen(true)}
                        >
                            Edit
                        </Button>
                    </span>
                </div>
                <div
                    className="prose m-4 p-2 bg-white w-full"
                >
                    <ReactMarkdown>
                        {quiz.description}
                    </ReactMarkdown>
                </div>
                <h3 className="text-white text-lg px-6">
                    Time limit: {quiz.timeLimit} minutes
                </h3>
                <div className="px-6 pb-6 flex flex-col gap-2">
                    {
                        quiz.questions.map((question, index) => {
                            return (<div key={`question-${index}`}>
                                <p className="text-white text-md font-bold">Question {index + 1}</p>
                                {
                                    question.quizQuestion ? (
                                        <p className="text-white">{question.quizQuestion.name}</p>
                                    ) : (
                                        <h1 className="text-white">No question assigned.</h1>
                                    )
                                }
                            </div>)
                        })
                    }

                </div>
            </div>
        </div>
        <QuizCreator
            isOpen={quizEditorOpen}
            setIsOpen={setQuizEditorOpen}
            editor={true}
            initialValues={editorInitial}
            doRefetch={() => refetch()}
            id={quiz.id}
        />
    </div >
}

export default QuizEditor