import { moodleFixHtml } from '@/lib/util';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RadioGroup } from '@headlessui/react';
import { Field, FieldArray, useField } from 'formik';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Button from '../button';
import MarkdownField from '../markdown_field';

interface MultiChoiceQuestionResponseProps {
    index: number,
    remove: () => void,
}

const MultiChoiceQuestionResponse: React.FC<MultiChoiceQuestionResponseProps> = ({ index, remove }) => {
    return (
        <div className="outline outline-1 rounded p-4">
            <div className="flex flex-col gap-1">
                <label htmlFor={`content-answers-${index}-text`}>
                    Answer {index + 1}
                </label>
                <Field
                    className="outline outline-1 focus:outline-2 rounded w-full p-2"
                    id={`content-answers-${index}-text`}
                    name={`content.answers.${index}.text`}
                    type="text"
                />
            </div>
            <div className="flex flex-col gap-1">
                <label htmlFor={`content-answers-${index}-image`}>
                    Answer {index + 1} Image Url
                </label>
                <Field
                    className="outline outline-1 focus:outline-2 rounded w-full p-2"
                    id={`content-answers-${index}-image`}
                    name={`content.answers.${index}.image`}
                    type="text"
                    validate={(): null => null}
                />
            </div>
            <div className="flex flex-col gap-1 flex-grow">
                <label htmlFor={`content-answers-${index}-grade`}>
                    Grade
                </label>

                <div className="flex align-center gap-2">
                    <Field
                        className="outline outline-1 focus:outline-2 rounded w-full p-2"
                        id={`content-answers-${index}-grade`}
                        name={`content.answers.${index}.score`}
                        type="number"
                        validate={(): null => null}
                    />

                    <div className="flex items-center">
                        <Button action={() => remove()} type='button'>
                            <FontAwesomeIcon icon={faTrashCan} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface MultiChoiceQuestionBuilderProps {

}

export const MultiChoiceQuestionBuilder: React.FC<MultiChoiceQuestionBuilderProps> = ({ }) => {
    const [field, meta, helper] = useField<any[]>("content.answers");
    return (
        <>
            <div className="flex flex-col gap-1">
                <label htmlFor="content-description">
                    Description Text (Uses <a className="text-blue-600" href="https://www.markdownguide.org/basic-syntax/" title="Markdown Format Basics">Markdown</a> format)
                </label>
                <MarkdownField
                    id="content-description"
                    name="content.description"
                />
            </div>
            <div className="flex flex-col gap-1">
                <label htmlFor="content-single">
                    Accept only one answer
                </label>
                <div>
                    <Field
                        id={`content-single`}
                        name={`content.single`}
                        type="checkbox"
                    />
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <label htmlFor="content-answers">
                    Answers
                </label>
                <FieldArray
                    name="content.answers"
                    render={helpers => (
                        <div className="flex flex-col gap-2">
                            {
                                meta.value && meta.value.length > 0 &&
                                meta.value.map((_: any, index) => (
                                    <MultiChoiceQuestionResponse
                                        key={index}
                                        index={index}
                                        remove={() => {
                                            helpers.remove(index);
                                            setTimeout(() => {
                                                // validateForm();
                                            }, 150);
                                        }}
                                    />
                                ))
                            }
                            <Button action={() => helpers.push({ text: '', image: '', score: 0 })} type='button'>Add answer</Button>
                        </div>)}
                />

            </div>
        </>
    );
}

interface MultiChoiceQuestionProps {
    content: any,
    attribution?: string,
    answer?: SessionAnswer,
    canChangeAnswer?: boolean,
    changeAnswer?: (answer: SessionAnswer) => void,
}

export const MultiChoiceQuestion: React.FC<MultiChoiceQuestionProps> = ({ content, answer, canChangeAnswer, changeAnswer }) => {
    const [selected, setSelected] = useState<number | number[]>(undefined);

    useEffect(() => {
        if (answer && changeAnswer && answer.type === 'multichoice' && (!selected || answer.answer !== selected)) {
            setSelected(answer.answer);
        } else if (!answer && changeAnswer) {
            setSelected(undefined);
        }
    }, [answer]);

    return (
        <div className="m-2 p-2">
            {
                content.source === 'moodle' ?
                    <div className="bg-white" dangerouslySetInnerHTML={{ __html: moodleFixHtml(content.label.text, content.label.image) }} />
                    :
                    <div className="prose prose-invert">
                        <ReactMarkdown>
                            {content.description}
                        </ReactMarkdown>
                    </div>
            }

            <div>
                <div className="space-y-2 pt-4">
                    {
                        content.answers.map((value: any, index: number) => {
                            const checked = selected &&
                                Array.isArray(selected) ?
                                selected.filter(a => a === index).length > 0 :
                                index === selected;
                            return (
                                <div
                                    key={`answer-${index}`}
                                    onClick={() => {
                                        if (canChangeAnswer === false) return;

                                        if (content.single) {
                                            setSelected(index);
                                            changeAnswer && changeAnswer({
                                                type: 'multichoice',
                                                answer: index,
                                            });
                                        } else {
                                            if (selected && Array.isArray(selected)) {
                                                if (checked) {
                                                    const selection = (selected as number[]).filter(i => i !== index);
                                                    setSelected(selection);
                                                    changeAnswer && changeAnswer({
                                                        type: 'multichoice',
                                                        answer: selection,
                                                    });
                                                } else {
                                                    const selection = [...selected as number[], index];
                                                    setSelected(selection);
                                                    changeAnswer && changeAnswer({
                                                        type: 'multichoice',
                                                        answer: selection,
                                                    });
                                                }
                                            } else {
                                                setSelected([index]);
                                                changeAnswer && changeAnswer({
                                                    type: 'multichoice',
                                                    answer: [index],
                                                });
                                            }
                                        }
                                    }}
                                    className={
                                        `${checked ?
                                            'bg-sky-900 bg-opacity-75 text-white' :
                                            'bg-white border border-border hover:bg-gray-300'
                                        } relative flex grow cursor-pointer rounded-lg px-5 py-4 
                                        shadow-md border border-border focus:outline-none `
                                    }
                                >
                                    <div className="flex w-full items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="text-sm">
                                                {
                                                    content.source === 'moodle' ?
                                                        <p
                                                            className={`font-medium  ${checked ? 'text-white' : 'text-gray-900'}`}
                                                            dangerouslySetInnerHTML={{ __html: moodleFixHtml(value.text, value.image) }}
                                                        />
                                                        :
                                                        <p>
                                                            {value.text}
                                                            {value.image && <img src={value.image} className="max-h-24" />}
                                                        </p>
                                                }
                                                <span
                                                    className="inline"
                                                >
                                                </span>
                                            </div>
                                        </div>
                                        {checked && (
                                            <div className="shrink-0 text-white">
                                                <CheckIcon className="h-6 w-6" />
                                            </div>
                                        )}
                                    </div>
                                </div>);
                        })
                    }
                </div >
            </div>
        </div>
    );
}

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx={12} cy={12} r={12} fill="#fff" opacity="0.2" />
            <path
                d="M7 13l3 3 7-7"
                stroke="#fff"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}