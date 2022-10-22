/*
 * When you create a new question type, you should update this file to ensure that
 * the question can be created, rendered and graded.
 */
import { QuizQuestion } from '@prisma/client';
import { ReactElement } from 'react';
import Button from '../button';
import { DescriptionQuestion, DescriptionQuestionBuilder } from './types/description';
import { gradeMemoryGame, MemoryGameQuestion, MemoryGameQuestionBuilder } from './types/memory_game';
import { gradeMultiChoice, MultiChoiceQuestion, MultiChoiceQuestionBuilder } from './types/multichoice';
import { gradeNumerical, NumericalQuestion } from './types/numerical';

export const TypeNames: Record<QuestionType, string> = {
    'description': 'Description',
    'multichoice': 'Multi-choice',
    'numerical': 'Numerical',
    'memory_game': 'Memory Game',
}

export const TypeBuilders: Record<QuestionType, ReactElement> = {
    'description': <DescriptionQuestionBuilder />,
    'multichoice': <MultiChoiceQuestionBuilder />,
    'numerical': <DescriptionQuestionBuilder />,
    'memory_game': <MemoryGameQuestionBuilder />,
}

interface QuestionViewProps {
    question: QuizQuestion,
    state?: SessionState,
    answer?: SessionAnswer,
    canChangeAnswer?: boolean,
    quizId?: string,
    setDisableControls?: (disableControls: boolean) => void,
    updateState?: (update: any) => void,
    changeAnswer?: (answer: SessionAnswer) => void,
    pushEvent?: (event: SessionEvent) => void,
    editor?: boolean,
}

export const QuestionView: React.FC<QuestionViewProps> = ({ question, state, answer, canChangeAnswer, quizId, setDisableControls, updateState, changeAnswer, pushEvent, editor }) => {

    let content = (<></>);

    switch (question.type) {
        case 'description': {
            content = <DescriptionQuestion
                content={question.content}
            />;
            break;
        };
        case 'multichoice': {
            content = <MultiChoiceQuestion
                content={question.content}
                answer={answer}
                canChangeAnswer={canChangeAnswer}
                changeAnswer={changeAnswer}
            />;
            break;
        };
        case 'numerical': {
            content = <NumericalQuestion
                content={question.content}
            />
        };
        case 'memory_game': {
            content = <MemoryGameQuestion
                content={question.content}
                state={state}
                answer={answer}
                quizId={quizId}
                setDisableControls={setDisableControls}
                updateState={updateState}
                changeAnswer={changeAnswer}
                pushEvent={pushEvent}
            />
        }
    }

    return (
        <div className="p-4 max-w-3xl mx-auto">
            {question && <>
                <div className="rounded-lg bg-slate-600 m-4">
                    <h1 className="text-white text-3xl p-6 text-center">
                        {
                            question.name
                        }
                        {
                            editor && <div><Button
                                action={() => { }}
                                theme="solid"
                            >
                                Edit Question
                            </Button>
                            </div>
                        }
                    </h1>
                    {content}
                </div>
            </>}
        </div>
    );
}

/*
 * Function to grade the question, from 0-100 or undefined if this question should not count
 * towards the grade
 */
export const questionGrade = (question: QuizQuestion, answer?: SessionAnswer): number | undefined => {
    /*
     * If the question has gone un-answered, what grade should the student recieve.
     */
    if (answer === undefined) {
        switch (question.type) {
            case 'multichoice': {
                return 0;
            }
            case 'numerical': {
                return 0;
            }
            case 'memory_game': {
                return 0;
            }
            default: {
                return undefined;
            }
        }
    }

    if (answer.type !== question.type) {
        console.error('Error - question and answer mismatch!');
        return undefined;
    }

    /*
     * If the question has been answered, what grade should the student recieve.
     */
    switch (answer.type) {
        case 'multichoice': {
            return gradeMultiChoice(question, answer);
        }
        case 'numerical': {
            return gradeNumerical(question, answer);
        }
        case 'memory_game': {
            return gradeMemoryGame(question, answer);
        }
        default: {
            return undefined;
        }
    }
}