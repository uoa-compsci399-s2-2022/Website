import { moodleFixHtml } from '@/lib/util';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RadioGroup } from '@headlessui/react';
import { Field, FieldArray, useField } from 'formik';
import gen, { RandomSeed } from 'random-seed';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Button from '../button';
import MarkdownField from '../markdown_field';
import { Tabs } from '../tabs';

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
    posStyle: string,
}

interface MemoryGameBlockDivProps {
    block: MemoryGameBlock,
    highlight: boolean,
    onClick: () => void
}

const MemoryGameBlockDiv: React.FC<MemoryGameBlockDivProps> = ({ block, highlight, onClick }) => {
    return (
        <div
            className={`aboslute ${block.posStyle} ${highlight ? 'bg-blue-700' : 'bg-blue-400'} hover:bg-yellow-200`}
        >

        </div>
    )
}

type InGameState = 'loading' | 'generate-next-pattern' | 'will-show-pattern' | 'showing-pattern' | 'reading-pattern';

interface MemoryGameState {
    blocks: MemoryGameBlock[],
    pattern: number[],
    patternIndex: number,
    state: InGameState,
    random: RandomSeed,
}

interface MemoryGameProps {
    content: any,
    quizId: string,
    finishGame: (score: number) => void,
}

const MemoryGame: React.FC<MemoryGameProps> = ({ content, quizId, finishGame }) => {
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState<MemoryGameState>({
        blocks: [],
        pattern: [],
        patternIndex: 0,
        state: 'loading',
        random: gen.create(content.random ? new Date().toISOString() : quizId)
    });
    /*
    const [highlight, setHighlight] = useState<number | undefined>(undefined);

    const generateBoard = () => {
        if (content.game_type === true) {
            // corsi
        } else {
            // grid
            const rows = content.rows;
            const cols = content.cols;
            const blocks: MemoryGameBlock[] = [];
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const block: MemoryGameBlock = {
                        posStyle: '',
                    };
                    blocks.push(block);
                }
            }
            setGameState((prev) => {
                return {
                    ...prev,
                    state: 'generate-next-pattern',
                    blocks,
                }
            });
        }
    };

    const generatePattern = () => {
        if (content.game_type === true) {
            // corsi
        } else {
            // grid
            if (content.new_pattern === true) {
                const len = gameState.pattern.length + 1;
                const pattern: number[] = [];

                for (let i = 0; i < len; i++) {
                    pattern.push(gameState.random.intBetween(0, gameState.blocks.length - 1));
                }

                setGameState((prev) => {
                    return {
                        ...prev,
                        state: 'will-show-pattern',
                        pattern,
                    };
                })
            }
        }
    };

    const onBlockClicked = () => {

    }

    useEffect(() => {
        console.log(gameState);
        if (gameState.state === 'generate-next-pattern') {
            generatePattern();
        }
    }, [gameState.state]);

    useEffect(() => {
        generateBoard();
    }, []);*/

    return (
        <div className="w-full aspect-square relative bg-white">
            <p className="text-black text-3xl p-8">
                Not implemented.
            </p>
        </div>
    )
}

interface MemoryGameQuestionProps {
    content: any,
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

export const MemoryGameQuestion: React.FC<MemoryGameQuestionProps> = ({ content, state, answer, quizId, setDisableControls, updateState, changeAnswer, pushEvent }) => {
    const [tempScore, setTempScore] = useState(0);
    const [gameState, setGameState] = useState<GameState>('start')

    console.log(content);

    useEffect(() => {
        if (state) {
            if (state.memoryGameStarted[state.question]) {
                if (state.memoryGameFinished[state.question]) {
                    setGameState('finish');
                } else {
                    setGameState('in-game');
                }
            } else {
                setGameState('start');
            }
        }
    }, [state]);

    const startGame = () => {
        if (setDisableControls) {
            setDisableControls(true);
        }

        if (pushEvent) {
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