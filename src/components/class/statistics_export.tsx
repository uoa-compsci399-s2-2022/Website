/**
 * An import button for importing a list of students
 **/
import React, { Fragment, useRef, useState } from 'react';
import { faCircleQuestion } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu, Popover, Transition } from '@headlessui/react';
import { exportQuestionsJSON, saveFileAsString } from '@/lib/util';
import { useLazyQuery } from '@apollo/client';
import { GetQuestionQuery } from '@/pages/quiz/preview/[questionid]';
import { QuizQuestion } from '@prisma/client';
import { StatsData } from '@/graphql/resolvers/statistics';

interface ExportProps {
    quizId: string,
    onStart: () => void,
    onComplete: () => void,
    data: StatsData & { type: 'quiz' }
}

const ExportStatistics: React.FC<ExportProps> = ({ quizId, data, onStart, onComplete }) => {
    const [getQuestion] = useLazyQuery(GetQuestionQuery);

    const buttonClassName = (active: boolean): string => {
        return (active ? 'bg-accent/[0.2] text-gray-900' : 'text-gray-700') +
            ' block px-4 py-2 text-sm';
    }

    const saveData = async (type: 'json' | 'csv'): Promise<void> => {
        onStart();
        if (type === 'json') {
            const text = JSON.stringify(data);
            saveFileAsString(text, 'application/json', `statistics-quiz-${quizId}.json`);
        } else if (type === 'csv') {
            const rows: Record<string, string> = {};
            for (const question in data.questions) {
                const q = data.questions[question];
                rows[q.name] = q.id;
            }

            let text = `User,${Object.keys(rows).join(',')}\n`;
            for (const user in data.results) {
                const qs = data.results[user];
                text += user;
                for (const question in data.questions) {
                    text += ',';
                    if (question in qs) {
                        text += qs[question];
                    }
                }
                text += '\n';
            }
            saveFileAsString(text, 'text/csv', `statistics-quiz-${quizId}.csv`);
        }

        setTimeout(() => onComplete(), 2000);
    }

    return <div className="flex gap-2 items-center">
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="inline-flex justify-center w-full rounded-md shadow-sm px-4 py-2 bg-accent text-sm font-medium text-text-colour hover:bg-accent/[0.85] focus:outline-none">
                    Export...
                    <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Menu.Button>
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="origin-top-left left-0 sm:left-auto sm:origin-top-right sm:right-0 absolute mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        <Menu.Item>
                            {({ active }) => (
                                <a
                                    onClick={async () => {
                                        await saveData('csv');
                                    }}
                                    className={buttonClassName(active)}
                                >
                                    .csv format
                                </a>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <a
                                    onClick={async () => {
                                        await saveData('json');
                                    }}
                                    className={buttonClassName(active)}
                                >
                                    .json format
                                </a>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>

        <Popover className="relative">
            <Popover.Button><FontAwesomeIcon className="text-white" icon={faCircleQuestion} /></Popover.Button>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
            >
                <Popover.Panel className="absolute origin-top-right right-0 z-10 border border-1">
                    <div className="bg-white p-4 w-96">
                        <h1 className="font-bold">Exporting Statistics</h1>
                        <p>
                            If choosing <code>.csv</code>, your statistics include: name, passcode, grade, and time taken.<br />
                            If choosing <code>.json</code>, your statistics include all of the data from each user&apos;s session, including
                            when the question was changed, the user&apos;s final answers, and which answers were selected when.
                        </p>
                    </div>
                </Popover.Panel>
            </Transition>
        </Popover>
    </div>
}

export default ExportStatistics