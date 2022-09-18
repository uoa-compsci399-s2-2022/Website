import { moodleFixHtml } from '@/lib/util';
import { RadioGroup } from '@headlessui/react';
import { useState } from 'react';

interface MultiChoiceQuestionProps {
    content: any,
    attribution?: string,
}

const MultiChoiceQuestion: React.FC<MultiChoiceQuestionProps> = ({ content }) => {
    const [selected, setSelected] = useState(content.answers[0])

    return (
        <div className="m-2 p-2 bg-white">
            <div dangerouslySetInnerHTML={{ __html: moodleFixHtml(content.label.text, content.label.image) }} />

            <div>
                <RadioGroup value={selected} onChange={setSelected}>
                    <RadioGroup.Label className="sr-only">Answers</RadioGroup.Label>
                    <div className="space-y-2">
                        {
                            content.answers.map((answer: any, index: number) => (
                                <RadioGroup.Option
                                    key={`answer-${index}`}
                                    value={answer}
                                    className={({ active, checked }) =>
                                        `${active
                                            ? ''
                                            : ''
                                        }
                  ${checked ? 'bg-sky-900 bg-opacity-75 text-white' : 'bg-white'
                                        }
                    relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-none`
                                    }
                                >
                                    {({ active, checked }) => (
                                        <>
                                            <div className="flex w-full items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="text-sm">
                                                        <RadioGroup.Label
                                                            as="p"
                                                            className={`font-medium  ${checked ? 'text-white' : 'text-gray-900'}`}
                                                            dangerouslySetInnerHTML={{ __html: moodleFixHtml(answer.text, answer.image) }}
                                                        />
                                                        <RadioGroup.Description
                                                            as="span"
                                                            className={`inline ${checked ? 'text-sky-100' : 'text-gray-500'
                                                                }`}
                                                        >
                                                        </RadioGroup.Description>
                                                    </div>
                                                </div>
                                                {checked && (
                                                    <div className="shrink-0 text-white">
                                                        <CheckIcon className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </RadioGroup.Option>
                            ))
                        }
                    </div>
                </RadioGroup>
            </div>
        </div >
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

export default MultiChoiceQuestion;