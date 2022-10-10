/**
 * The 'QuizApplet' component enables students to take tests.
 **/
import React, { useEffect, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Quiz, QuizQuestionLink, QuizQuestion, QuizAssignment, QuizSession } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { DescriptionQuestion } from '@/components/question/description';
import { MultiChoiceQuestion } from '@/components/question/multichoice';
import Button from '@/components/button';
import ReactMarkdown from 'react-markdown';
import { zeroPad } from '@/lib/util';

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

const GradeSessionQuery = gql`
    query($id: String!) {
        gradeSession(id: $id) {
            grade
            graded
        }
    }
`;

const CreateSessionMutation = gql`
    mutation($assignment: String!) {
        createSession(assignment: $assignment) {
            id
            start
            finish
            data
        }
    }
`;

const SetStateMutation = gql`
    mutation($id: String!, $state: JSON!) {
        setState(id: $id, state: $state) {
            id
            start
            finish
            data
        }
    }
`;

const PushEventMutation = gql`
    mutation($id: String!, $event: JSON!) {
        pushEvent(id: $id, event: $event) {
            id
            start
            finish
            data
        }
    }
`;

const ChangeAnswerMutation = gql`
    mutation($id: String!, $key: String!, $answer: JSON!) {
        changeAnswer(id: $id, key: $key, answer: $answer) {
            id
            start
            finish
            data
        }
    }
`;

const FinishSessionMutation = gql`
    mutation($id: String!) {
        finishSession(id: $id) {
            id
            start
            finish
            data
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
    question: QuizQuestion,
    state: SessionState,
    answer?: SessionAnswer,
    updateState: (update: any) => void,
    changeAnswer: (answer: SessionAnswer) => void,
    pushEvent: (event: SessionEvent) => void,
}

const QuestionView: React.FC<QuestionViewProps> = ({ question, state, answer, updateState, changeAnswer, pushEvent }) => {
    let content = (<></>);

    switch (question.type) {
        case 'description': {
            content = <DescriptionQuestion content={question.content} />;
            break;
        };
        case 'multichoice': {
            content = <MultiChoiceQuestion content={question.content} answer={answer} changeAnswer={changeAnswer} />;
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

interface QuizCountdownProps {
    started: Date,
    timeLimit: number,
    onTimeUp: () => void,
}

const QuizCountdown: React.FC<QuizCountdownProps> = ({ started, timeLimit, onTimeUp }) => {
    const [remaining, setRemaining] = useState({ tseconds: 0, seconds: 0, minutes: 0, hours: 0 });

    const updateTimer = () => {
        const currentTime = new Date();
        const seconds = (currentTime.getTime() - new Date(started).getTime()) / 1000;
        const remaining = (timeLimit * 60) - seconds;
        setRemaining({
            hours: Math.floor(remaining / (60 * 60)),
            minutes: Math.floor(remaining / 60) % 60,
            seconds: Math.floor(remaining % 60),
            tseconds: Math.floor(remaining),
        });
        if (remaining <= 0) {
            onTimeUp();
        }
    }

    useEffect(() => {
        updateTimer();
        const updateInterval = setInterval(updateTimer, 500);
        return () => clearInterval(updateInterval);
    }, []);

    return (
        <div className="absolute top-24 right-4">
            <div className="rounded-lg bg-slate-600 m-4 p-4">
                <h1 className="text-white">
                    {remaining.hours > 0 && <span>{zeroPad(remaining.hours, 2)}:</span>}
                    <span>{zeroPad(remaining.minutes, 2)}</span>:
                    <span>{zeroPad(remaining.seconds, 2)}</span>
                    {' '} remaining
                </h1>
                <p className="text-white">
                </p>
                {remaining.tseconds < 60 && <p
                    className="text-red-500"
                >
                    Your quiz will be submitted automatically
                </p>}
            </div>
        </div>
    )
}

interface InQuizStateProps {
    quiz: Quiz & {
        questions: (QuizQuestionLink & {
            quizQuestion?: QuizQuestion
        })[],
        assignments: QuizAssignment[],
    };
    session: QuizSession,
    finishQuiz: () => void,
}

const InQuizState: React.FC<InQuizStateProps> = ({ quiz, session, finishQuiz }) => {
    const initialData = (session.data as any as QuizSessionData);
    const [state, setState] = useState<SessionState>(initialData.state);
    const [answers, setAnswers] = useState<Record<string, SessionAnswer>>(initialData.answers);
    const [setStateMutation] = useMutation(SetStateMutation);
    const [pushEventMutation] = useMutation(PushEventMutation);
    const [changeAnswerMutation] = useMutation(ChangeAnswerMutation);

    const updateState = (update: any) => {
        setState(state => {
            const next = {
                ...state,
                ...update,
            };
            setStateMutation({
                variables: {
                    id: session.id,
                    state: next,
                }
            });
            return next;
        });
    }

    const setQuestion = (question: number) => {
        pushEventMutation({
            variables: {
                id: session.id,
                event: {
                    event: 'changeQuestion',
                    from: state.question,
                    to: question,
                } as SessionEvent
            }
        })
        updateState({ question });
    }

    const changeAnswer = (to: SessionAnswer) => {
        let from = undefined;
        if (`${state.question}` in answers) {
            from = answers[`${state.question}`];
        }
        setAnswers((answers) => {
            const newAnswer: any = {};
            newAnswer[`${state.question}`] = to;
            return {
                ...answers,
                ...newAnswer,
            }
        });
        pushEventMutation({
            variables: {
                id: session.id,
                event: {
                    event: 'changeAnswer',
                    question: state.question,
                    from,
                    to,
                } as SessionEvent,
            }
        })
        changeAnswerMutation({
            variables: {
                id: session.id,
                key: `${state.question}`,
                answer: to,
            }
        })
    }

    return (
        <div className="p-4">
            <QuizCountdown
                started={session.start}
                timeLimit={quiz.timeLimit}
                onTimeUp={finishQuiz}
            />
            <div>
                <QuestionView
                    question={quiz.questions[state.question].quizQuestion}
                    state={state}
                    answer={answers[`${state.question}`]}
                    updateState={updateState}
                    changeAnswer={changeAnswer}
                    pushEvent={(event) => {
                        pushEventMutation({
                            variables: {
                                id: session.id,
                                event,
                            }
                        });
                    }}
                />
            </div>
            <div className="flex items-center justify-center gap-4">
                <Button
                    action={() => {
                        setQuestion(state.question - 1);
                    }}
                    disabled={state.question <= 0}
                    theme='solid'
                >
                    &lt;
                </Button>
                <p className="text-center text-white text-lg">
                    {
                        state.question + 1
                    }
                    {' / '}
                    {
                        quiz.questions.length
                    }
                </p>
                <Button
                    action={() => {
                        setQuestion(state.question + 1);
                    }}
                    disabled={state.question >= quiz.questions.length - 1}
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
    session: QuizSession,
}

const FinishState: React.FC<FinishStateProps> = ({ quiz, session }) => {
    const { data, loading } = useQuery(GradeSessionQuery, {
        variables: {
            id: session.id,
        }
    });

    console.log(data);

    return (<div>
        <div className="max-w-md mx-auto rounded-lg bg-slate-600 my-4">
            <h1
                className="text-3xl text-white p-6"
            >
                You have completed {quiz.name}
            </h1>
            <div className="px-6 text-white pb-6">
                {
                    loading ?
                        <p>Loading grade</p> :
                        <p>
                            Your grade is {data.gradeSession.grade}/{data.gradeSession.graded}
                        </p>

                }
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
    const { data: authSession, status } = useSession();
    const [appletState, setAppletState] = useState<AppletStates>('start');
    const [loading, setLoading] = useState(true);
    const [createSessionMutation] = useMutation(CreateSessionMutation);
    const [finishSessionMutation] = useMutation(FinishSessionMutation);
    const [setStateMutation] = useMutation(SetStateMutation);
    const [session, setSession] = useState<QuizSession | null>(null);
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

    const assignment = assignmentData.assignment as QuizAssignment & {
        sessions: QuizSession[],
    };

    useEffect(() => {
        // On page load, check if we already have a session
        (async () => {
            const findSession = (id: string) => {
                for (const session of assignment.sessions) {
                    if ((session.data as any as QuizSessionData).state.id === id) {
                        setSession(session);
                        return true;
                    }
                }
                return false;
            }

            if (authSession.user.group) {
                const existingId = localStorage.getItem(`quiz-${assignment.id}-session`);
                if (existingId) {
                    if (!findSession(existingId)) {
                        alert('failed to find your existing quiz session!');
                    }
                }
            } else {
                findSession(authSession.user.uid);
            }
            setLoading(false);
        })();
    }, []);

    useEffect(() => {
        // if our session has been populated, we can now start the quiz
        if (session && appletState === 'start') {
            if (session.finish) {
                setAppletState('finish');
            } else {
                setAppletState('in-quiz');
            }
        }
    }, [session])

    if (!assignmentData.assignment) {
        return <InfoState title="Error" description='This quiz has not been assigned to you' />
    }

    if (status === 'loading' || loading) {
        return <p>loading...</p>
    }

    const startQuiz = async () => {
        const newSession = async (id: string) => {
            try {
                const { data } = await createSessionMutation({
                    variables: {
                        assignment: assignment.id,
                    }
                });
                if (!data || !data.createSession) {
                    throw Error('Failed to create quiz session');
                }
                const createdSession = data.createSession as QuizSession;
                const state: SessionState = {
                    id,
                    question: 0,
                }
                const { data: updatedData } = await setStateMutation({
                    variables: {
                        id: createdSession.id,
                        state,
                    }
                })
                setSession(updatedData.setState);
            } catch (error) {
                alert(error);
                console.error(error);
            }
        }

        // create a new session
        if (authSession.user.group) {
            // note: race condition here.  if two group users load the page
            // at the same time, sessions.length will be the same and they will have
            // the same id...
            const id = `group-user-${assignment.sessions.length}`;
            localStorage.setItem(`quiz-${assignment.id}-session`, id);
            newSession(id);
        } else {
            newSession(authSession.user.uid);
        }
    }

    const finishQuiz = async () => {
        // close our quiz session
        try {
            await finishSessionMutation({
                variables: {
                    id: session.id,
                }
            });
            setAppletState('finish');
        } catch (error) {
            alert(error);
            console.error(error);
        }
    }

    switch (appletState) {
        case 'start': return <StartState quiz={quiz} startQuiz={startQuiz} />;
        case 'in-quiz': return <InQuizState quiz={quiz} session={session} finishQuiz={finishQuiz} />;
        case 'finish': return <FinishState quiz={quiz} session={session} />;
    }

    return <InfoState title="Error" description='Invalid quiz state.  Please refresh the page.' />;
}

export default QuizApplet