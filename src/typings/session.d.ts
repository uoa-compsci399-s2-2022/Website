interface SessionState {
    id: string,
}

type SessionEvent = {
    event: 'changeQuestion',
    from: number,
    to: number,
} | {
    event: 'changeAnswer',
    question: number,
    from?: number,
    to: number,
};

type SessionAnswer = {
    type: 'multichoice',
    answer: number,
} | {
    type: 'numerical',
    answer: string,
} | {
    type: 'memory_game',
    /* TODO: answer: memory_game_state */
    answer: any,
}