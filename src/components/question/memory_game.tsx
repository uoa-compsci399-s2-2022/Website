import { moodleFixHtml } from '@/lib/util';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RadioGroup } from '@headlessui/react';
import { Field, FieldArray, useField } from 'formik';
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
                                        id={`content-single`}
                                        name={`content.single`}
                                        type="checkbox"
                                    />
                                    <label htmlFor="content-single">
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
                                            name={`content-rows`}
                                            type="number"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label htmlFor={`content-cols`}>
                                            Columns
                                        </label>
                                        <Field
                                            id={`content-cols`}
                                            className="outline outline-1 focus:outline-2 rounded w-full p-2 text-black"
                                            name={`content-cols`}
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
                <label htmlFor="content-single">
                    Use a random seed for each user
                </label>
            </div>
            <MemoryGameTypeField />
            <div className="flex flex-col gap-1">
                <label htmlFor={`content-cols`}>
                    Maximum score (Grade: <code>max(0, min(score/max, 1))</code>)
                </label>
                <Field
                    id={`content-grade`}
                    className="outline outline-1 focus:outline-2 rounded w-full p-2 text-black"
                    name={`content-grade`}
                    type="number"
                />
            </div>
        </>
    );
}

interface MemoryGameQuestionProps {
    content: any,
    attribution?: string,
    state?: SessionState,
    answer?: SessionAnswer,
    setDisableControls?: (disableControls: boolean) => void,
    updateState?: (update: any) => void,
    changeAnswer?: (answer: SessionAnswer) => void,
    pushEvent?: (event: SessionEvent) => void,
}

export const MemoryGameQuestion: React.FC<MemoryGameQuestionProps> = ({ content, state, answer, updateState, changeAnswer }) => {
    const [selected, setSelected] = useState<number | number[]>(undefined);

    return (
        <div className="m-2 p-2 text-white">
            <div>
                <p>game will go here</p>
            </div>
        </div>
    );
}