import { MouseEventHandler, useEffect, useRef, useState } from 'react';
import { Field, useField } from 'formik';
import gen, { RandomSeed } from 'random-seed';
import Button from '../../button';
import { Tabs } from '../../tabs';
import { QuizQuestion } from '@prisma/client';

const MemoryGameTypeField: React.FC = () => {
    const [input, meta, helper] = useField<boolean>('content.game_type');

    return (
        <div className="flex flex-col gap-1 py-2">
            <p className="font-bold">Game Type</p>
            <Tabs
                pages={[
                    {
                        title: 'Grid',
                        content: <div>
                            <p>The memory game will take place on a grid</p>
                            <div className="flex flex-col gap-2 pt-2">
                                <div className="flex gap-1">
                                    <Field
                                        id={`content-new_pattern`}
                                        name={`content.new_pattern`}
                                        type="checkbox"
                                    />
                                    <label htmlFor="content-new_pattern">
                                        Use a new pattern in each round
                                    </label>

                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col gap-1">
                                        <label htmlFor={`content-rows`}>
                                            Rows
                                        </label>
                                        <Field
                                            id={`content-rows`}
                                            className="outline outline-1 focus:outline-2 rounded w-full p-2 text-black"
                                            name={`content.rows`}
                                            type="number"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label htmlFor={`content.cols`}>
                                            Columns
                                        </label>
                                        <Field
                                            id={`content-cols`}
                                            className="outline outline-1 focus:outline-2 rounded w-full p-2 text-black"
                                            name={`content.cols`}
                                            type="number"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    },
                    {
                        title: 'Corsi',
                        content: <div>
                            <p>The memory game will simulate the Corsi block-tapping test</p>
                        </div>
                    }
                ]}
                defaultIndex={meta.value ? 1 : 0}
                onChange={(index) => {
                    helper.setValue(index === 1);
                }}
            />
        </div>
    )
}

interface MemoryGameQuestionBuilderProps {

}

export const MemoryGameQuestionBuilder: React.FC<MemoryGameQuestionBuilderProps> = ({ }) => {
    const [field, meta, helper] = useField<any[]>("content.answers");
    return (
        <>
            <div className="flex gap-1">
                <Field
                    id={`content-random`}
                    name={`content.random`}
                    type="checkbox"
                />
                <label htmlFor="content-random">
                    Use a random seed for each user
                </label>
            </div>
            <MemoryGameTypeField />
            <div className="flex flex-col gap-1">
                <label htmlFor={`content-grade`}>
                    Maximum score (Grade: <code>max(0, min(score/max, 1))</code>)
                </label>
                <Field
                    id={`content-grade`}
                    className="outline outline-1 focus:outline-2 rounded w-full p-2 text-black"
                    name={`content.grade`}
                    type="number"
                />
            </div>
        </>
    );
}

interface MemoryGameBlock {
    x: number,
    y: number,
    width: number,
    height: number,
}

type InGameState = 'no-input' | 'reading-pattern';

interface MemoryGameState {
    blocks: MemoryGameBlock[],
    pattern: number[],
    inputPattern: number[],
    failed: number,
    score: number,
    state: InGameState,
    correct?: MemoryGameBlock,
}

interface MemoryGameProps {
    content: any,
    quizId: string,
    finishGame: (score: number) => void,
}

const GRID = {
    BORDER: 10,
    PADDING: 20,
    RADIUS: 5,
};

const MemoryGame: React.FC<MemoryGameProps> = ({ content, quizId, finishGame }) => {
    const [waiting, setWaiting] = useState(true);
    const rng = useRef<RandomSeed>(gen.create(content.random === true ? new Date().toISOString() : quizId));
    const gameState = useRef<MemoryGameState>({
        blocks: [],
        pattern: [],
        inputPattern: [],
        failed: 0,
        score: 0,
        state: 'no-input',
    });
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const renderBlocks = ({ highlight, selected, correct, correctResult }: { highlight?: number, selected?: number, correct?: boolean, correctResult?: boolean }) => {
        const context = canvasRef.current.getContext('2d');
        if (!context) {
            alert("Failed to get canvas render context!  Unable to play.");
            return;
        }
        context.clearRect(0, 0, 500, 500);

        for (let i = 0; i < gameState.current.blocks.length; i++) {
            const block = gameState.current.blocks[i];
            const { x, y, width: w, height: h } = block;
            const r = GRID.RADIUS;

            if (highlight === i) {
                context.fillStyle = "#F05D23";
            } else if (selected === i) {
                context.fillStyle = correct ? "#a87619" : "#f00";
            } else {
                context.fillStyle = "#f0a823";
            }

            if (content.game_type === true) {
                context.fillRect(x, y, w, h);
            } else {
                context.beginPath();
                context.moveTo(x + r, y);
                context.arcTo(x + w, y, x + w, y + h, r);
                context.arcTo(x + w, y + h, x, y + h, r);
                context.arcTo(x, y + h, x, y, r);
                context.arcTo(x, y, x + w, y, r);
                context.closePath();
                context.fill();
            }
        }

        const correctBlock = gameState.current.correct;
        if (correctBlock) {
            context.strokeStyle = '#fff';
            context.fillStyle = '#000';
            if (correctResult !== undefined) {
                context.fillStyle = correctResult ? '#0f0' : '#f00';
            }
            context.fillRect(
                correctBlock.x,
                correctBlock.y,
                correctBlock.width,
                correctBlock.height
            );
            context.beginPath();
            context.moveTo(correctBlock.x + 10, correctBlock.y + 25);
            context.lineTo(correctBlock.x + 20, correctBlock.y + 35);
            context.lineTo(correctBlock.x + 40, correctBlock.y + 10);
            context.lineWidth = 5;
            context.stroke();
        }
    }

    const shuffle = (seed: number): number[] => {
        const rng = gen.create(content.random === true ?
            new Date().toISOString() : `${quizId}-${seed}`);

        const array = new Array(24).fill(0).map((_, i) => i);
        for (let i = array.length - 1; i > 0; i--) {
            let j = rng.intBetween(0, i);
            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    };

    const generateBlocks = () => {
        const blocks: MemoryGameBlock[] = [];

        if (content.game_type === true) {
            // corsi
            const rows = 4;
            const cols = 7;

            const width = (500 - 2 * GRID.BORDER - cols * GRID.PADDING) / cols;
            const yBorder = (500 - rows * width - (rows - 1) * GRID.PADDING) / 2;

            const blockIndices = shuffle(gameState.current.pattern.length);
            for (const index of blockIndices.slice(0, 9)) {
                const row = Math.floor(index / 6);
                const col = index % 6;

                const block: MemoryGameBlock = {
                    x: GRID.PADDING + col * (width + GRID.PADDING),
                    y: yBorder + row * (width + GRID.PADDING),
                    width,
                    height: width,
                };
                blocks.push(block);
            }
            gameState.current.correct = {
                x: GRID.PADDING + 6 * (width + GRID.PADDING),
                y: yBorder + 3 * (width + GRID.PADDING),
                width,
                height: width,
            };
        } else {
            // grid
            const rows = content.rows;
            const cols = content.cols;

            const width = (500 - 2 * GRID.BORDER - cols * GRID.PADDING) / cols;
            const height = (500 - 2 * GRID.BORDER - rows * GRID.PADDING) / rows;

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {

                    const block: MemoryGameBlock = {
                        x: GRID.PADDING + col * (width + GRID.PADDING),
                        y: GRID.PADDING + row * (height + GRID.PADDING),
                        width,
                        height,
                    };
                    blocks.push(block);
                }
            }
        }

        gameState.current.blocks = blocks;
    };

    const generatePattern = () => {
        let len = gameState.current.pattern.length + 1;
        if (len === 1) len++;
        const pattern: number[] = [];

        if (content.game_type === true || content.new_pattern === true) {
            // corsi, or grid with new pattern every time
            for (let i = 0; i < len; i++) {
                pattern.push(rng.current.intBetween(0, gameState.current.blocks.length - 1));
            }
        } else {
            // grid, add one to existing pattern
            for (let i = 0; i < gameState.current.pattern.length; i++) {
                pattern.push(gameState.current.pattern[i]);
            }
            pattern.push(rng.current.intBetween(0, gameState.current.blocks.length - 1));
        }

        gameState.current.pattern = pattern;
    };

    const doRenderPattern = (index: number) => {
        if (index >= gameState.current.pattern.length) {
            gameState.current.state = 'reading-pattern';
            renderBlocks({});
            return;
        }

        console.log(index);

        renderBlocks({ highlight: gameState.current.pattern[index] });

        setTimeout(() => {
            doRenderPattern(index + 1);
        }, 800);
    }

    const timer = async (length: number): Promise<void> => {
        return new Promise(res => {
            setTimeout(() => res(), length);
        });
    };

    const gameInit = async () => {
        generateBlocks();
        renderBlocks({});
        generatePattern();
        await timer(500);
        doRenderPattern(0);
    };

    const nextRound = async (newPattern: boolean = true) => {
        gameState.current.state = 'no-input';
        if (newPattern) {
            if (content.game_type === true) {
                generateBlocks();
            }
            generatePattern();
            gameState.current.score++;
            gameState.current.failed = 0;
        }
        gameState.current.inputPattern = [];
        await timer(500);
        doRenderPattern(0);
    };

    const onBlockClicked = (index: number) => {
        gameState.current.inputPattern.push(index);

        let correct = true;
        if (content.game_type !== true) {
            // when we dont do corsi, show the user upfront if they are correct
            // or not.
            const length = gameState.current.inputPattern.length;
            correct = gameState.current.pattern[length - 1] === index;
            if (!correct) {
                gameState.current.state = 'no-input';
                setTimeout(() => {
                    finishGame(gameState.current.score);
                }, 800);
            } else {
                if (length === gameState.current.pattern.length) {
                    gameState.current.state = 'no-input';
                    if (correct) {
                        setTimeout(() => nextRound(), 500);
                    }
                }
            }
        }

        renderBlocks({ selected: index, correct });

        setTimeout(() => {
            renderBlocks({});
        }, 500);
    }

    const onCheckClicked = () => {
        gameState.current.state = 'no-input';
        let failed = false;
        const ourLength = gameState.current.inputPattern.length;
        const length = gameState.current.pattern.length;

        if (ourLength !== length) {
            failed = true;
        }
        if (!failed) {
            for (let i = 0; i < length; i++) {
                if (gameState.current.pattern[i] !== gameState.current.inputPattern[i]) {
                    failed = true;
                }
            }
        }

        renderBlocks({ correctResult: !failed });
        setTimeout(() => {
            if (failed) {
                if (gameState.current.failed < 1) {
                    gameState.current.failed += 1;
                    nextRound(false);
                } else {
                    finishGame(gameState.current.score);
                }
            } else {
                nextRound();
            }
        }, 500);
    }

    const handleCanvasClick = (x: number, y: number) => {
        if (waiting) {
            gameInit();
            setWaiting(false);
        }
        console.log({ x, y });
        if (gameState.current.state === 'reading-pattern') {
            // handle block clicks
            for (let i = 0; i < gameState.current.blocks.length; i++) {
                const block = gameState.current.blocks[i];
                const xHit = x > block.x && x < block.x + block.width;
                const yHit = y > block.y && y < block.y + block.height;
                if (xHit && yHit) {
                    onBlockClicked(i);
                    break;
                }
            }

            // handle correct clicked.  only on corsi
            if (gameState.current.correct) {
                const correct = gameState.current.correct;
                const xHit = x > correct.x && x < correct.x + correct.width;
                const yHit = y > correct.y && y < correct.y + correct.height;
                if (xHit && yHit) {
                    onCheckClicked();
                }
            }
        }
    };

    const onCanvasClicked: MouseEventHandler<HTMLCanvasElement> = (event) => {
        const bounds = canvasRef.current.getBoundingClientRect();
        const elementX = event.pageX - bounds.x;
        const canvasX = Math.round((elementX / bounds.width) * 500);
        const elementY = event.pageY - bounds.y;
        const canvasY = Math.round((elementY / bounds.height) * 500);
        handleCanvasClick(canvasX, canvasY);
    }

    return (
        <>
            <canvas
                className="w-full aspect-square relative bg-white select-none"
                ref={canvasRef}
                onClick={onCanvasClicked}
                width="500"
                height="500"
                style={{ imageRendering: 'pixelated' }}
            />
            {
                waiting && <p className="text-white text-center">
                    Click in the white box above to start
                </p>
            }
        </>
    )
}

interface MemoryGameQuestionProps {
    content: any,
    questionId?: string,
    attribution?: string,
    state?: SessionState,
    answer?: SessionAnswer,
    quizId: string,
    setDisableControls?: (disableControls: boolean) => void,
    updateState?: (update: any) => void,
    changeAnswer?: (answer: SessionAnswer) => void,
    pushEvent?: (event: SessionEvent) => void,
}

type GameState = 'start' | 'in-game' | 'finish';

export const MemoryGameQuestion: React.FC<MemoryGameQuestionProps> = ({ content, questionId, state, answer, quizId, setDisableControls, updateState, changeAnswer, pushEvent }) => {
    const [tempScore, setTempScore] = useState(0);
    const [gameState, setGameState] = useState<GameState>('start')

    console.log(content);

    useEffect(() => {
        if (state) {
            if (state.memoryGameStarted[state.question]) {
                if (state.memoryGameFinished[state.question]) {
                    setGameState('finish');
                    if (setDisableControls) {
                        setDisableControls(false);
                    }
                } else {
                    setGameState('in-game');
                    if (setDisableControls) {
                        setDisableControls(true);
                    }
                }
            } else {
                setGameState('start');
                if (setDisableControls) {
                    setDisableControls(false);
                }
            }
        }
    }, [state]);

    const startGame = () => {
        if (setDisableControls) {
            setDisableControls(true);
        }

        if (state) {
            updateState((prev: SessionState) => {
                const next = {
                    ...prev,
                    memoryGameStarted: {
                        ...prev.memoryGameStarted,
                    }
                };
                next.memoryGameStarted[prev.question] = true;
                return next;
            });

            pushEvent({
                event: 'startQuestion',
                question: state.question,
            });
        } else {
            setGameState('in-game');
        }
    };

    const finishGame = (score: number) => {
        if (setDisableControls) {
            setDisableControls(false);
        }
        if (changeAnswer) {
            changeAnswer({
                type: 'memory_game',
                score,
            });

            updateState((prev: SessionState) => {
                const next = {
                    ...prev,
                    memoryGameFinished: {
                        ...prev.memoryGameFinished,
                    }
                };
                next.memoryGameFinished[prev.question] = true;
                return next;
            });

            pushEvent({
                event: 'finishQuestion',
                question: state.question,
            });

            pushEvent({
                event: 'changeAnswer',
                question: questionId,
                to: {
                    type: 'memory_game',
                    score,
                }
            });
        } else {
            setTempScore(score);
            setGameState('finish');
        }
    }

    return (
        <div className="m-2 p-2 pb-4 text-white">
            <div>
                {gameState === 'in-game' ? (
                    <MemoryGame
                        content={content}
                        quizId={quizId}
                        finishGame={finishGame}
                    />
                ) : (
                    gameState === 'start' ? (
                        <div>
                            <h1 className="text-white">Memory Game</h1>
                            <p className="text-white pb-4">
                                Once you start this game, you will be presented with a random pattern.  Repeat the pattern for as many turns as you can!
                                You will not be able to leave this question until you have finished.
                            </p>
                            <Button
                                action={() => startGame()}
                                theme='solid'
                            >
                                Start
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <h1 className="text-white">Game over</h1>
                            <p className="text-white">
                                You achieved {(answer && answer.type === 'memory_game') ? answer.score : tempScore}/{content.grade}
                            </p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

export const gradeMemoryGame = (question: QuizQuestion, answer: SessionAnswer & { type: 'memory_game' }): number | undefined => {
    const grade: number = (question.content as any).grade;
    return Math.round((Math.max(0, Math.min(answer.score, grade)) / grade) * 100);
}