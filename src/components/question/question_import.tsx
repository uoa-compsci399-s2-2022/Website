/**
 * An import button for importing a list of students
 **/
import React, { FormEvent, Fragment, useRef, useState } from 'react';
import { faCircleQuestion } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu, Popover, Transition } from '@headlessui/react';
import { importQuestions } from '@/lib/util';

interface ImportProps {
    onImport: (questions: QuizQuestionProps[]) => void,
}

const ImportQuestions: React.FC<ImportProps> = ({ onImport }) => {
    const [fileAccept, setFileAccept] = useState(".xml");
    const fileImportRef = useRef<HTMLInputElement>(null);

    const buttonClassName = (active: boolean): string => {
        return (active ? 'bg-accent/[0.2] text-gray-900' : 'text-gray-700') +
            ' block px-4 py-2 text-sm';
    }

    return <div className="flex gap-2 items-center z-40">
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="inline-flex justify-center w-full rounded-md shadow-sm px-4 py-2 bg-accent text-sm font-medium text-text-colour hover:bg-accent/[0.85] focus:outline-none">
                    Import...
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
                <Menu.Items className="origin-top-left left-0 sm:left-auto sm:origin-top-right sm:right-0 absolute mt-2 w-32 md:w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        <Menu.Item>
                            {({ active }) => (
                                <a
                                    onClick={() => {
                                        if (fileImportRef.current)
                                            fileImportRef.current.accept = '.xml';
                                        fileImportRef.current?.click();
                                    }}
                                    className={buttonClassName(active)}
                                >
                                    MOODLE .xml format
                                </a>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <a
                                    onClick={() => {
                                        if (fileImportRef.current)
                                            fileImportRef.current.accept = '.json';
                                        fileImportRef.current?.click();
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
        <input
            ref={fileImportRef}
            type="file"
            id="file"
            onChange={
                () => importQuestions(fileImportRef.current?.files, (questions) => {
                    onImport(questions);
                    if (fileImportRef.current)
                        fileImportRef.current.value = '';
                })
            }

            hidden
        />

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
                        <h1 className="font-bold">Importing Questions</h1>
                        <p>Select a MOODLE .xml file to import from.</p>
                    </div>
                </Popover.Panel>
            </Transition>
        </Popover>
    </div>
}

export default ImportQuestions