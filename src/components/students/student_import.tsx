/**
 * An import button for importing a list of students
 **/
import { importStudentsCSV } from '@/lib/util';
import { faCircleQuestion } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Popover, Transition } from '@headlessui/react';
import React, { FormEvent, Fragment, useRef } from 'react';
import Button from '../button';

interface ImportProps {
    onImport: (students: ImportedStudent[]) => void,
}

const ImportStudents: React.FC<ImportProps> = ({ onImport }) => {
    const fileImportRef = useRef<HTMLInputElement>(null);

    return <div className="flex gap-2 items-center">
        <Button action={() => fileImportRef.current?.click()} preventDefault={true}>
            Import
        </Button>
        <input
            ref={fileImportRef}
            type="file"
            id="file"
            onChange={
                () => importStudentsCSV(fileImportRef.current?.files, (students) => {
                    onImport(students);
                    if (fileImportRef.current)
                        fileImportRef.current.value = '';
                })
            }
            accept=".csv"
            hidden
        />

        <Popover className="relative">
            <Popover.Button><FontAwesomeIcon icon={faCircleQuestion} /></Popover.Button>
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
                        <h1 className="font-bold">Importing students</h1>
                        <p>Select a .csv file to import from.  We expect a file with the following columns:</p>
                        <table className="table-auto w-full border border-2">
                            <tbody>
                                <tr>
                                    <th className="border border-1">Name</th>
                                    <th className="border border-1">Passcode</th>
                                    <th className="border border-1">Email (optional)</th>
                                </tr>
                            </tbody>
                        </table>
                        <p>Please do not include column labels.  See <a className="text-blue-600" href="/sample.csv">sample.csv</a> for an example.</p>
                    </div>
                </Popover.Panel>
            </Transition>
        </Popover>
    </div>
}

export default ImportStudents