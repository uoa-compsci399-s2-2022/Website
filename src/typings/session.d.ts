interface QuizSessionData {
    state: SessionState,
    events: Record<string, SessionEvent>,
    answers: Record<string, SessionAnswer>,
}

interface SessionState {
    id: string,
    question: number,
}

type SessionEvent = {
    event: 'changeQuestion',
    from: number,
    to: number,
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
    /* TODO: answer: memory_game_state */
    answer: any,
}