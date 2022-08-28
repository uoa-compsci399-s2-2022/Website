/**
 * The 'Instructor' page should show instructors their classes, and allow
 * them to create new classes
 **/
import React, { Dispatch, SetStateAction, useState } from 'react';
import { Dialog } from '@headlessui/react';
import Button from '@/components/button';
import { Session } from 'next-auth';
import ImportStudents, { ImportedStudent } from '@/components/import';

interface Class {
    name: string,
    id: string,
    students: string[],
}

interface ClassCreatorProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    createClass: (created: Class) => void,
}

const ClassCreator: React.FC<ClassCreatorProps> = ({ isOpen, setIsOpen, createClass }) => {
    const [classCreated, setClassCreated] = useState<Class>({
        name: '',
        id: '',
        students: [],
    });

    const classNameChanged = (name: string) => {
        if (name.length === 0) {
            return;
        }

        // generate some ID
        // TODO: make this more secure, ensuring that only letters, numbers and '-'
        // are included.  we also want to check for duplicates!
        const id = name.toLowerCase().replace(' ', '-');
        setClassCreated((last) => {
            return {
                name,
                id,
                students: [...last.students]
            };
        });
    };

    const classStudentsChanged = (students: string) => {
        if (students.length === 0) {
            return;
        }

        const studentsList = students.split('\n');
        setClassCreated((last) => {
            return {
                ...last,
                students: studentsList
            };
        });
    };

    const importedStudents = (students: ImportedStudent[]) => {
        console.log(students);
    };


    return (
        <Dialog
            open={isOpen}
            onClose={() => setIsOpen(false)}
            className="relative z-50 w-full"
        >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full sm:max-w-xl mx-auto rounded bg-white p-4">

                    <Dialog.Title className="text-xl font-bold">Create class</Dialog.Title>

                    <form onSubmit={() => createClass(classCreated)} className="flex flex-col gap-2">
                        <label>
                            Class name
                        </label>
                        <input
                            className="outline outline-1 focus:outline-2 rounded w-full p-2"
                            name="className"
                            type="text"
                            value={classCreated.name}
                            onChange={(e) => classNameChanged(e.target.value)} />
                        <p className="text-xs">Generated ID: {classCreated.id}</p>
                        <div
                            className="flex place-content-between items-center"
                        >
                            <label>
                                Students
                            </label>
                            <ImportStudents onImport={importedStudents} />
                        </div>
                        <textarea
                            className="outline outline-1 focus:outline-2 rounded w-full p-2"
                            name="className"
                            value={classCreated.students.join('\n')}
                            onChange={(e) => classStudentsChanged(e.target.value)} />
                        <p className="text-xs mb-2">Count: {classCreated.students.length}</p>
                    </form>

                    <div className="flex gap-2">
                        <Button solid={true} action={() => setIsOpen(false)}>Create</Button>
                        <Button action={() => setIsOpen(false)}>Cancel</Button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    )
};

interface InstructorProps {
    session: Session,
}

const Instructor: React.FC<InstructorProps> = ({ session }) => {
    // TODO: replace with data from DB
    const [classes, setClasses] = useState<Class[]>([
        {
            name: "CS373",
            id: "cs373s12022",
            students: [
                "zac cleveland",
                "joshua scragg",
                "ethan lin",
                "daniel mahue",
            ]
        }
    ]);
    const [classCreatorOpen, setClassCreatorOpen] = useState(false);

    const createClass = (created: Class) => {
        // add this class to our list
        // TODO: send this class to our database
        setClasses((classes) => {
            return [
                ...classes,
                created
            ];
        });
    };

    return (
        <>
            <main>
                <h1 className="">
                    your classes
                </h1>

                {
                    classes.map((data) => {
                        return (<h1 key={data.id}>
                            {data.name} ({data.students.length} students)
                            <button>go</button>
                        </h1>);
                    })
                }

                <button onClick={() => setClassCreatorOpen(true)}>new class</button>

                <ClassCreator
                    isOpen={classCreatorOpen}
                    setIsOpen={setClassCreatorOpen}
                    createClass={createClass}
                />
            </main>
        </>
    )
}

export default Instructor;