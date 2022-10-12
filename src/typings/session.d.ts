interface QuizSessionData {
    state: SessionState,
    events: Record<string, SessionEvent>,
    answers: Record<string, SessionAnswer>,
}

interface SessionState {
    id: string,
    question: number,
    timeLimitStarted: Record<number, Date>,
    timeLimitEnded: Record<number, boolean>,
    memoryGameStarted: Record<number, boolean>,
    memoryGameFinished: Record<number, boolean>,
}

type SessionEvent = {
    event: 'changeQuestion',
    from: number,
    to: number,
} | {
    event: 'startQuestion',
    question: number,
} | {
    event: 'finishQuestion',
    question: number,
} | {
    event: 'changeAnswer',
    question: number,
    from?: SessionAnswer,
    to: SessionAnswer,
};

type SessionAnswer = {
    type: 'multichoice',
    answer: number | number[],
} | {
    type: 'numerical',
    answer: string,
} | {
    type: 'memory_game',
    score: number,
}