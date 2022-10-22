/**
 * The 'QuizEditor' component enables instructors to edit quizzes
 **/
import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { Quiz, QuizAssignment, QuizQuestion, QuizQuestionLink } from '@prisma/client';
import Button from '@/components/button';
import { Modal } from '@/components/modal';
import { QuestionAssigner } from '@/components/quiz/question_assigner';
import { QuizCreator } from '@/components/quiz/quiz_creator';
import { TypeNames } from '@/components/question/question_type';
import { useRouter } from 'next/router';
import { GetQuestionQuery } from './preview/[questionid]';
import { LoadingSpinner } from '@/components/loading';
import { saveFileAsString } from '@/lib/util';

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
                    type
                }
            }
        }
    }
`;

export const AddQuizQuestionMutation = gql`
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

const DeleteQuizMutation = gql`
    mutation($id: String!) {
        deleteQuiz(id: $id)
    }
`;

interface QuizEditorProps {
    id: string,
}

interface QuestionAssignerState {
    id: string,
    initialValues: {
        questionId: string,
        timeLimit: number,
        questionName: string,
        index: number,
    }
}

const QuizEditor: React.FC<QuizEditorProps> = ({ id }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [quizEditorOpen, setQuizEditorOpen] = useState(false);
    const [questionAssignerOpen, setQuestionAssignerOpen] = useState(false);
    const [questionAssignerState, setQuestionAssignerState] = useState<QuestionAssignerState>();
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
    const [getQuestion] = useLazyQuery(GetQuestionQuery);
    const [removeQuizQuestion] = useMutation(RemoveQuizQuestionMutation);
    const [deleteQuiz] = useMutation(DeleteQuizMutation);

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

    const exportQuiz = async () => {
        setLoading(true);
        const questions: Record<string, QuizQuestion> = {};
        for (const questionId of quiz.questions.filter(q => q.quizQuestion !== null).map(q => q.quizQuestion?.id)) {
            console.log(questionId);
            const question = await getQuestion({
                variables: {
                    id: questionId,
                }
            });
            questions[questionId] = question.data.question;
        }
        const outQuiz = {
            ...quiz,
            questions: [...quiz.questions]
        };

        for (let i = 0; i < outQuiz.questions.length; i++) {
            if (outQuiz.questions[i].quizQuestion?.id in questions) {
                outQuiz.questions[i] = {
                    ...outQuiz.questions[i],
                    quizQuestion: questions[outQuiz.questions[i].quizQuestion.id],
                };
            }
        }

        saveFileAsString(JSON.stringify(outQuiz), "application/json", `quiz-${quiz.name}.json`)

        setLoading(false);
    }

    const deleteQuizFunc = async () => {
        setLoading(true);
        console.log(id);
        try {
            await deleteQuiz({
                variables: {
                    id,
                }
            });
            await router.push('/quiz/list');
            router.reload();
        } catch (error) {
            alert(error);
        }
        setLoading(false);
    }

    return <div className="w-full md:w-4/5 mx-auto pb-4">
        <div className="rounded-lg bg-slate-600 m-4">
            <div className="flex flex-col sm:flex-row p-4 items-center">
                <h1 className="text-white text-3xl p-2 flex-grow">
                    {quiz.name}
                </h1>
                <span className="flex gap-2 items-center">
                    {
                        loading && <LoadingSpinner />
                    }
                    <Button
                        theme='solid'
                        action={() => setQuizEditorOpen(true)}
                    >
                        Edit
                    </Button>
                    <Button
                        theme='solid'
                        action={() => exportQuiz()}
                    >
                        Export
                    </Button>
                    <Button
                        theme='danger'
                        action={() => deleteQuizFunc()}
                    >
                        Delete
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
                        return (<div key={`question-${question.id}`} className="my-4 border border-white p-4">
                            <p className="text-white text-xl font-bold">Question {index + 1}</p>
                            {
                                question.quizQuestion ? (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-white">
                                            <span className="block">Name: {question.quizQuestion.name}</span>
                                            <span className="block">Type: {TypeNames[question.quizQuestion.type as QuestionType]}</span>
                                            {
                                                question.timeLimit > 0 && <span className="block">
                                                    Time limit: {question.timeLimit} minutes
                                                </span>
                                            }
                                        </p>
                                        <div className='flex gap-2'>
                                            <Button action={() => {
                                                window.open(`/quiz/preview/${question.quizQuestion.id}`, '_blank').focus();
                                            }} theme='solid'>Preview</Button>
                                            <Button action={() => {
                                                setQuestionAssignerDescription((index + 1).toString());
                                                setQuestionAssignerState({
                                                    id: question.id,
                                                    initialValues: {
                                                        questionId: question.quizQuestion?.id,
                                                        timeLimit: question.timeLimit,
                                                        index: question.index,
                                                        questionName: question.quizQuestion.name
                                                    }
                                                });
                                                setQuestionAssignerOpen(true);
                                            }} theme='solid'>Modify</Button>
                                            <Button action={() => {
                                                deleteQuestion(question.id);
                                            }} theme='danger'>
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-white">There is no question assigned</p>
                                        <div className="py-2 flex gap-2">
                                            <Button action={() => {
                                                setQuestionAssignerDescription((index + 1).toString());
                                                setQuestionAssignerState({
                                                    id: question.id,
                                                    initialValues: {
                                                        questionId: question.quizQuestion?.id,
                                                        timeLimit: question.timeLimit,
                                                        index: question.index,
                                                        questionName: question.quizQuestion?.name
                                                    }
                                                });
                                                setQuestionAssignerOpen(true);
                                            }} theme='solid'>Assign question</Button>
                                            <Button action={() => {
                                                deleteQuestion(question.id);
                                            }} theme='danger'>Remove</Button>
                                        </div>
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
            linkId={questionAssignerState?.id}
            initialValues={questionAssignerState?.initialValues}
        />
    </div>
}

export default QuizEditor