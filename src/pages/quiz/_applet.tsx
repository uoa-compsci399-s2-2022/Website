/**
 * The 'QuizApplet' component enables students to take tests.
 **/
import React, { useEffect, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Quiz, QuizQuestionLink, QuizQuestion, QuizAssignment } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { DescriptionQuestion } from '@/components/question/description';
import { MultiChoiceQuestion } from '@/components/question/multichoice';
import Button from '@/components/button';
import ReactMarkdown from 'react-markdown';

export const GetQuizNoAnswersQuery = gql`
    query($id: String!) {
        quizNoAnswers(id: $id) {
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
                    type
                    category
                    name
                    content
                    attribution
                }
            }
        }
    }
`;

export const AssignmentQuery = gql`
    query($quiz: String!) {
        assignment(quiz: $quiz) {
            id
            start
            end
            sessions {
                id
                start
                finish
                data
            }
        }
    }
`;

interface StartStateProps {
    quiz: Quiz & {
        questions: (QuizQuestionLink & {
            quizQuestion?: QuizQuestion
        })[],
        assignments: QuizAssignment[],
    };
    startQuiz: () => void,
}

const StartState: React.FC<StartStateProps> = ({ quiz, startQuiz }) => {
    return (<div>
        <div className="max-w-md mx-auto rounded-lg bg-slate-600 my-4">
            <h1
                className="text-3xl text-white p-6"
            >
                {quiz.name}
            </h1>
            <div className="px-6 text-white">
                <div
                    className="prose prose-invert w-full pb-2"
                >
                    <ReactMarkdown>
                        {quiz.description}
                    </ReactMarkdown>
                </div>
                <p>
                    {quiz.questions.length} questions
                </p>
                <p>
                    {quiz.timeLimit} minutes
                </p>
            </div>
            <div className="p-6">
                <Button
                    action={() => {
                        startQuiz();
                    }}
                    theme='solid'
                >
                    Start quiz
                </Button>
            </div>
        </div>
    </div>)
}

interface QuestionViewProps {
    question: QuizQuestion
}

const QuestionView: React.FC<QuestionViewProps> = ({ question }) => {
    let content = (<></>);

    switch (question.type) {
        case 'description': {
            content = <DescriptionQuestion content={question.content} />;
            break;
        };
        case 'multichoice': {
            content = <MultiChoiceQuestion content={question.content} />;
            break;
        };
        case 'numerical': {

        };
    }

    return (
        <div className="p-4 max-w-3xl mx-auto">
            {question && <>
                <div className="rounded-lg bg-slate-600 m-4">
                    <h1 className="text-white text-3xl p-6 text-center">
                        {
                            question.name
                        }
                    </h1>
                    {content}
                </div>
            </>}
        </div>
    );
}

interface InQuizStateProps {
    quiz: Quiz & {
        questions: (QuizQuestionLink & {
            quizQuestion?: QuizQuestion
        })[],
        assignments: QuizAssignment[],
    };
    finishQuiz: () => void,
}

const InQuizState: React.FC<InQuizStateProps> = ({ quiz, finishQuiz }) => {
    const [question, setQuestion] = useState(0);

    return (
        <div className="p-4">
            <div>
                <QuestionView question={quiz.questions[question].quizQuestion} />
            </div>
            <div className="flex items-center justify-center gap-4">
                <Button
                    action={() => {
                        setQuestion(question => question - 1)
                    }}
                    disabled={question <= 0}
                    theme='solid'
                >
                    &lt;
                </Button>
                <p className="text-center text-white text-lg">
                    {
                        question + 1
                    }
                    {' / '}
                    {
                        quiz.questions.length
                    }
                </p>
                <Button
                    action={() => {
                        setQuestion(question => question + 1)
                    }}
                    disabled={question >= quiz.questions.length - 1}
                    theme='solid'
                >
                    &gt;
                </Button>
            </div>
            <div className="flex justify-center pt-4">
                <Button
                    action={() => {
                        finishQuiz()
                    }}
                    theme="solid"
                >
                    Submit
                </Button>
            </div>
        </div>
    )
}

interface InfoStateProps {
    title: string,
    description: string,
}

const InfoState: React.FC<InfoStateProps> = ({ title, description }) => {
    return (<div>
        <div className="max-w-md mx-auto rounded-lg bg-slate-600 my-4">
            <h1
                className="text-3xl text-white p-6"
            >
                {title}
            </h1>
            <div className="px-6 text-white pb-6">
                <p>
                    {description}
                </p>
            </div>
        </div>
    </div>)
}

interface FinishStateProps {
    quiz: Quiz & {
        questions: (QuizQuestionLink & {
            quizQuestion?: QuizQuestion
        })[],
        assignments: QuizAssignment[],
    };
}

const FinishState: React.FC<FinishStateProps> = ({ quiz }) => {
    return (<div>
        <div className="max-w-md mx-auto rounded-lg bg-slate-600 my-4">
            <h1
                className="text-3xl text-white p-6"
            >
                You have completed {quiz.name}
            </h1>
            <div className="px-6 text-white pb-6">
                <p>
                    Good job!
                </p>
            </div>
        </div>
    </div>)
}

type AppletStates = 'info' | 'start' | 'in-quiz' | 'finish';

interface QuizAppletProps {
    id: string,
}

const QuizApplet: React.FC<QuizAppletProps> = ({ id }) => {
    const { data: session, status } = useSession();
    const [appletState, setAppletState] = useState<AppletStates>('start');
    const [loading, setLoading] = useState(true);
    const { data: quizData } = useQuery(GetQuizNoAnswersQuery, {
        variables: {
            id
        }
    });
    const { data: assignmentData } = useQuery(AssignmentQuery, {
        variables: {
            quiz: id
        }
    });

    const quiz = quizData.quizNoAnswers as Quiz & {
        questions: (QuizQuestionLink & {
            quizQuestion?: QuizQuestion
        })[],
        assignments: QuizAssignment[],
    };

    const assignment = assignmentData.assignment as QuizAssignment;

    useEffect(() => {
        // TODO: on page load, check if we have an existing session.
        // if we do, we want to change our status accordingly

        setLoading(false);
    }, []);

    if (!assignmentData.assignment) {
        return <InfoState title="Error" description='This quiz has not been assigned to you' />
    }

    if (status === 'loading' || loading) {
        return <p>loading...</p>
    }

    const startQuiz = () => {
        // TODO: create our quiz session
        // NOTE: if anonymous group, save in localstorage length of
        // 'sessions' then create new session
        setAppletState('in-quiz');
    }

    const finishQuiz = () => {
        // TODO: close our quiz session
        setAppletState('finish');
    }

    switch (appletState) {
        case 'start': return <StartState quiz={quiz} startQuiz={startQuiz} />;
        case 'in-quiz': return <InQuizState quiz={quiz} finishQuiz={finishQuiz} />;
        case 'finish': return <FinishState quiz={quiz} />;
    }

    return <InfoState title="Error" description='Invalid quiz state.  Please refresh the page.' />;
}

export default QuizApplet