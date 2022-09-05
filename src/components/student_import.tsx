/**
 * An import button for importing a list of students
 **/
import { faCircleQuestion } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Popover, Transition } from '@headlessui/react';
import { parse } from 'csv-parse';
import React, { FormEvent, Fragment, useRef } from 'react';
import Button from './button';

export type ImportedStudent = {
    name: string,
    passcode: string,
    email?: string,
}

interface ImportProps {
    onImport: (students: ImportedStudent[]) => void,
}

const ImportStudents: React.FC<ImportProps> = ({ onImport }) => {
    const fileImportRef = useRef<HTMLInputElement>(null);

    const importStudents = async () => {
        const files = fileImportRef.current?.files;
        if (!files || files.length === 0) return;

        const students: ImportedStudent[] = [];
        const parser = parse({
            delimiter: ','
        })

        parser.on('readable', function () {
            let record;
            while ((record = parser.read()) !== null) {
                if (record.length < 2) {
                    throw Error('Invalid CSV file, please include a name and passcode for each student');
                } else if (record.length > 3) {
                    throw Error('Invalid CSV file, too many values');
                }
                const [name, passcode] = record;
                const student: ImportedStudent = {
                    name,
                    passcode,
                };
                if (record.length === 3) student.email = record[3];
                students.push(student);
            }
        });

        parser.on('error', function (err) {
            alert('Failed to parse students CSV, ' + err.message)
        });

        parser.on('end', function () {
            onImport(students);
            if (fileImportRef.current)
                fileImportRef.current.value = '';
        });

        for (let i = 0; i < files.length; i++) {
            const file = files.item(i);
            if (!file) continue;

            parser.write(await file.text());
        }

        parser.end();
    };

    return <div className="flex gap-2 items-center">
        <Button action={() => fileImportRef.current?.click()} preventDefault={true}>
            Import
        </Button>
        <input
            ref={fileImportRef}
            type="file"
            id="file"
            onChange={() => importStudents()}
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