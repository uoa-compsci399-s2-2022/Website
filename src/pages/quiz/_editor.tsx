/**
 * The 'QuizEditor' component enables instructors to edit quizzes
 **/
import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Quiz, QuizAssignment, QuizQuestion, QuizQuestionLink } from '@prisma/client';
import Button from '@/components/button';
import { Modal } from '@/components/modal';
import { QuestionAssigner } from '@/components/quiz/question_assigner';
import { QuizCreator } from '@/components/quiz/quiz_creator';

export const GetQuizQuery = gql`
    query($id: String!) {
        quiz(id: $id) {
            id
            name
            description
            timeLimit
            questions {
                id
                index
                timeLimit
                quizQuestion {
                    id
                    name
                }
            }
        }
    }
`;

export const UpdateQuizQuestionMutation = gql`
    mutation($linkId: String!, $questionId: String, $timeLimit: Int) {
        updateQuizQuestion(linkId: $linkId, questionId: $questionId, timeLimit: $timeLimit) {
            id
        }
    }
`;

const AddQuizQuestionMutation = gql`
    mutation($id: String!) {
        addQuizQuestion(id: $id) {
            id
        }
    }
`;

const RemoveQuizQuestionMutation = gql`
    mutation($id: String!, $linkId: String!) {
        removeQuizQuestion(id: $id, linkId: $linkId) {
            id
        }
    }
`;

interface QuizEditorProps {
    id: string,
}

const QuizEditor: React.FC<QuizEditorProps> = ({ id }) => {
    const [quizEditorOpen, setQuizEditorOpen] = useState(false);
    const [timeLimitOpen, setTimeLimitOpen] = useState(false);
    const [currentTimeLimit, setCurrentTimeLimit] = useState(0);
    const timeLimitRef = useRef<HTMLInputElement | null>(null);
    const [questionAssignerOpen, setQuestionAssignerOpen] = useState(false);
    const [questionAssignerId, setQuestionAssignerId] = useState('');
    const [questionAssignerDescription, setQuestionAssignerDescription] = useState('');
    const { data, refetch } = useQuery(GetQuizQuery, {
        variables: {
            id
        }
    });
    const [addQuizQuestion] = useMutation(AddQuizQuestionMutation, {
        variables: {
            id
        }
    });
    const [removeQuizQuestion] = useMutation(RemoveQuizQuestionMutation);
    const [updateQuizQuestion] = useMutation(UpdateQuizQuestionMutation);

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

    const addQuestion = async () => {
        try {
            await addQuizQuestion();
            refetch();
        } catch (error) {
            alert(error);
        }
    }

    const deleteQuestion = async (linkId: string) => {
        try {
            await removeQuizQuestion({
                variables: {
                    id, linkId,
                }
            });
            refetch();
        } catch (error) {
            alert(error);
        }
    }

    const setQuestionTimeLimit = async (linkId: string, timeLimit: number) => {
        try {
            await updateQuizQuestion({
                variables: {
                    linkId,
                    timeLimit
                }
            });
            refetch();
            setTimeLimitOpen(false);
        } catch (error) {
            alert(error);
        }
    }

    return <div className="w-4/5 mx-auto pb-4">
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
                className="prose prose-invert m-4 p-2 w-full"
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
                    [...quiz.questions].sort((a, b) => a.index - b.index).map((question, index) => {
                        return (<div key={`question-${question.id}`}>
                            <p className="text-white text-md font-bold">Question {index + 1}</p>
                            {
                                question.quizQuestion ? (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-white">{question.quizQuestion.name}</p>
                                        <div className='flex gap-2'>
                                            <Button action={() => {
                                                setQuestionAssignerId(question.id);
                                                setQuestionAssignerDescription((index + 1).toString());
                                                setTimeLimitOpen(true);
                                            }} theme='solid'>
                                                {question.timeLimit === 0 ? 'Add' : `Edit ${question.timeLimit} minute`} time limit
                                            </Button>
                                            <Button action={() => {
                                                window.open(`/quiz/preview/${question.quizQuestion.id}`, '_blank').focus();
                                            }} theme='solid'>View Question</Button>
                                            <Button action={() => {
                                                setQuestionAssignerDescription((index + 1).toString());
                                                setQuestionAssignerId(question.id);
                                                setQuestionAssignerOpen(true);
                                            }} theme='solid'>Reassign</Button>
                                            <Button action={() => {
                                                deleteQuestion(question.id);
                                            }} theme='danger'>
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-2 flex gap-2">
                                        <Button action={() => {
                                            setQuestionAssignerDescription((index + 1).toString());
                                            setQuestionAssignerId(question.id);
                                            setQuestionAssignerOpen(true);
                                        }} theme='solid'>Assign question</Button>
                                        <Button action={() => {
                                            deleteQuestion(question.id);
                                        }} theme='danger'>Remove</Button>
                                    </div>
                                )
                            }
                        </div>)
                    })
                }

            </div>
            <div className="px-6 py-4">
                <Button action={() => {
                    addQuestion();
                }} theme='solid'>Add new question</Button>
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
        <QuestionAssigner
            description={questionAssignerDescription}
            doRefetch={() => refetch()}
            isOpen={questionAssignerOpen}
            setIsOpen={setQuestionAssignerOpen}
            linkId={questionAssignerId}
        />
        <Modal
            isOpen={timeLimitOpen}
            setIsOpen={setTimeLimitOpen}
            title={`Question ${questionAssignerDescription} time limit`}
        >
            <div className="flex flex-col gap-2">
                <input
                    type="number"
                    className="rounded p-2"
                    ref={timeLimitRef}
                    value={currentTimeLimit}
                    onChange={(event) => setCurrentTimeLimit(parseInt(event.target.value))}
                />
                <p>Enter a time limit in minutes, or 0 for no time limit.</p>
                <div className="flex gap-2">
                    <Button action={() => {
                        setQuestionTimeLimit(questionAssignerId, parseInt(timeLimitRef.current.value));
                    }} theme='solid'>Set</Button>
                    <Button
                        action={() => {
                            setTimeLimitOpen(false);
                        }}
                        theme='grey'>
                        Cancel
                    </Button>
                </div>
            </div>
        </Modal>
    </div>
}

export default QuizEditor