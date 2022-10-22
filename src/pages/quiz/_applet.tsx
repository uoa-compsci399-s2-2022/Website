/**
 * The 'QuizApplet' component enables students to take tests.
 **/
import React, { useEffect, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Quiz, QuizQuestionLink, QuizQuestion, QuizAssignment, QuizSession } from '@prisma/client';
import { useSession } from 'next-auth/react';
import Button from '@/components/button';
import ReactMarkdown from 'react-markdown';
import { zeroPad } from '@/lib/util';
import { LoadingSpinner } from '@/components/loading';
import { QuestionView } from '@/components/question/question_type';

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
    query($id: String!) {
        assignment(id: $id) {
            id
            start
            end
            quiz {
                id
            }
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

interface QuizCountdownProps {
    started: Date,
    timeLimit: number,
    questionStarted?: Date,
    questionTimeLimit?: number,
    onTimeUp: () => void,
    onQuestionTimeUp: () => void,
}

const QuizCountdown: React.FC<QuizCountdownProps> = ({ started, timeLimit, questionStarted, questionTimeLimit, onTimeUp, onQuestionTimeUp }) => {
    const [remaining, setRemaining] = useState({ tseconds: 0, seconds: 0, minutes: 0, hours: 0 });
    const [remainingQ, setRemainingQ] = useState({ tseconds: 0, seconds: 0, minutes: 0, hours: 0 });

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

        if (questionStarted) {
            const currentTimeQ = new Date();
            const secondsQ = (currentTimeQ.getTime() - new Date(questionStarted).getTime()) / 1000;
            const remainingQ = (questionTimeLimit * 60) - secondsQ;
            setRemainingQ({
                hours: Math.floor(remainingQ / (60 * 60)),
                minutes: Math.floor(remainingQ / 60) % 60,
                seconds: Math.floor(remainingQ % 60),
                tseconds: Math.floor(remainingQ),
            });
            if (remainingQ <= 0) {
                onQuestionTimeUp();
            }
        }
    }

    useEffect(() => {
        updateTimer();
        const updateInterval = setInterval(updateTimer, 500);
        return () => clearInterval(updateInterval);
    }, [questionStarted]);

    return (
        <div className="absolute top-24 right-4">
            <div className="rounded-lg bg-slate-600 m-4 p-4">
                <h1 className="text-white">
                    {remaining.hours > 0 && <span>{zeroPad(remaining.hours, 2)}:</span>}
                    <span>{zeroPad(remaining.minutes, 2)}</span>:
                    <span>{zeroPad(remaining.seconds, 2)}</span>
                    {' '} remaining
                </h1>
                {
                    questionStarted &&
                    <div>
                        <p className="text-white pb-2">
                            This question: {remainingQ.hours > 0 && <span>{zeroPad(remainingQ.hours, 2)}:</span>}
                            <span>{zeroPad(remainingQ.minutes, 2)}</span>:
                            <span>{zeroPad(remainingQ.seconds, 2)}</span>
                            {' '} remaining
                        </p>
                        <Button
                            action={() => {
                                onQuestionTimeUp();
                            }}
                            theme='solid'
                        >
                            Finish question
                        </Button>
                    </div>
                }
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
    const [saving, setSaving] = useState(false);
    const [disableControls, setDisableControls] = useState(false);

    const questions = [...quiz.questions].sort((a, b) => a.index - b.index);

    const onUnload = (e: any): string | undefined => {
        if (!saving || !disableControls) {
            return undefined;
        }
        let confirmationMessage = 'We are still saving your changes.  Please wait.';

        (e || window.event).returnValue = confirmationMessage;
        return confirmationMessage;
    };

    useEffect(() => {
        window.addEventListener('beforeunload', onUnload);

        return () => {
            window.removeEventListener('beforeunload', onUnload);
        }
    }, []);

    const updateState = async (update: any | ((current: SessionState) => SessionState)) => {
        setState(state => {
            let next = {};

            if (typeof update !== 'function') {
                next = {
                    ...state,
                    ...update,
                };
            } else {
                next = update(state);
            }

            setStateMutation({
                variables: {
                    id: session.id,
                    state: next,
                }
            });
            return next as SessionState;
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

    const changeAnswer = async (to: SessionAnswer) => {
        let from = undefined;
        if (`${state.question}` in answers) {
            from = answers[`${questions[state.question].id}`];
        }
        setAnswers((answers) => {
            const newAnswer: any = {};
            newAnswer[`${questions[state.question].id}`] = to;
            return {
                ...answers,
                ...newAnswer,
            }
        });

        setSaving(true);
        await Promise.all([pushEventMutation({
            variables: {
                id: session.id,
                event: {
                    event: 'changeAnswer',
                    question: state.question,
                    from,
                    to,
                } as SessionEvent,
            }
        }), changeAnswerMutation({
            variables: {
                id: session.id,
                key: `${state.question}`,
                answer: to,
            }
        })]);
        setSaving(false);
    }

    const startQuestionTimer = () => {
        updateState((prev: SessionState) => {
            const next = { ...prev, timeLimitStarted: { ...prev.timeLimitStarted } };
            next.timeLimitStarted[prev.question] = new Date();
            console.log({ prev, next });
            return next;
        });
        pushEventMutation({
            variables: {
                id: session.id,
                event: {
                    event: 'startQuestion',
                    question: state.question,
                } as SessionEvent
            }
        });
        setDisableControls(true);
    }

    const questionTimeUp = () => {
        updateState((prev: SessionState) => {
            const next = {
                ...prev,
                timeLimitEnded: {
                    ...prev.timeLimitEnded,
                }
            };
            next.timeLimitEnded[prev.question] = true;
            return next;
        });
        pushEventMutation({
            variables: {
                id: session.id,
                event: {
                    event: 'finishQuestion',
                    question: state.question,
                } as SessionEvent
            }
        });
        setDisableControls(false);
    }

    return (
        <div className="p-4">
            <QuizCountdown
                started={session.start}
                timeLimit={quiz.timeLimit}
                questionStarted={state.timeLimitEnded[state.question] ? undefined : state.timeLimitStarted[state.question]}
                questionTimeLimit={questions[state.question].timeLimit}
                onTimeUp={finishQuiz}
                onQuestionTimeUp={questionTimeUp}
            />
            <div>
                {
                    (questions[state.question].timeLimit > 0 && !(state.question in state.timeLimitStarted)) ?
                        <div className="p-4 max-w-3xl mx-auto">
                            <div className="rounded-lg bg-slate-600 m-4 p-6 flex flex-col gap-2">
                                <h1 className="text-white">This question has a time limit</h1>
                                <p className="text-white">
                                    You only have {questions[state.question].timeLimit} minutes to complete this question.
                                    Once the time limit is up, you will no longer be able to update this question.
                                </p>
                                <Button
                                    action={() => startQuestionTimer()}
                                    theme='solid'
                                >
                                    Start
                                </Button>
                            </div>
                        </div>
                        :
                        <QuestionView
                            question={questions[state.question].quizQuestion}
                            state={state}
                            answer={answers[`${questions[state.question].id}`] ?? undefined}
                            canChangeAnswer={!(questions[state.question].timeLimit > 0 && state.timeLimitEnded[state.question])}
                            quizId={quiz.id}
                            setDisableControls={setDisableControls}
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
                }
            </div>
            <div className="flex items-center justify-center gap-4">
                <Button
                    action={() => {
                        setQuestion(state.question - 1);
                    }}
                    disabled={state.question <= 0 || saving || disableControls}
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
                    disabled={state.question >= quiz.questions.length - 1 || saving || disableControls}
                    theme='solid'
                >
                    &gt;
                </Button>
            </div>
            <div className="flex justify-center pt-4 items-center gap-2">
                <Button
                    action={() => {
                        finishQuiz()
                    }}
                    theme="solid"
                    disabled={saving}
                >
                    Submit
                </Button>
                {
                    saving && <LoadingSpinner />
                }
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
    assignmentId: string,
}

const QuizApplet: React.FC<QuizAppletProps> = ({ id, assignmentId }) => {
    const { data: authSession, status } = useSession();
    const [appletState, setAppletState] = useState<AppletStates>('start');
    const [loading, setLoading] = useState(true);
    const [createSessionMutation] = useMutation(CreateSessionMutation);
    const [finishSessionMutation] = useMutation(FinishSessionMutation);
    const [setStateMutation] = useMutation(SetStateMutation);
    const [session, setSession] = useState<QuizSession | null>(null);
    const [info, setInfo] = useState({ title: '', description: '' });
    const { data: quizData } = useQuery(GetQuizNoAnswersQuery, {
        variables: {
            id
        }
    });
    const { data: assignmentData } = useQuery(AssignmentQuery, {
        variables: {
            id: assignmentId
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
        } else if (new Date(assignment.end).getTime() - new Date().getTime() < 0) {
            setAppletState('info');
            setInfo({
                title: 'Too late!',
                description: 'You have missed the due date for this quiz',
            });
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
                    timeLimitStarted: {},
                    timeLimitEnded: {},
                    memoryGameStarted: {},
                    memoryGameFinished: {},
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
        case 'info': return <InfoState title={info.title} description={info.description} />
    }

    return <InfoState title="Error" description='Invalid quiz state.  Please refresh the page.' />;
}

export default QuizApplet