/**
 * The 'Instructor' page should show instructors their classes, and allow
 * them to create new classes
 **/
import React, { Dispatch, SetStateAction, useRef, useState } from 'react';
import { Dialog } from '@headlessui/react';
import Button from '@/components/button';
import { Session } from 'next-auth';

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

    const importStudents = () => {

    };


    return (
        <Dialog
            open={isOpen}
            onClose={() => setIsOpen(false)}
            className="relative z-50"
        >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-4">

                    <Dialog.Title>Create class</Dialog.Title>
                    <Dialog.Description>
                        This will permanently deactivate your account
                    </Dialog.Description>

                    <form onSubmit={() => createClass(classCreated)} className="flex flex-col">
                        <label>
                            Class name:
                            <input
                                name="className"
                                type="text"
                                value={classCreated.name}
                                onChange={(e) => classNameChanged(e.target.value)} />
                        </label>
                        <p>Generated id: {classCreated.id}</p>
                        <br />
                        <label>
                            Students
                            <button onClick={() => importStudents()}>Import</button>
                            <textarea
                                name="className"
                                value={classCreated.students.join('\n')}
                                onChange={(e) => classStudentsChanged(e.target.value)} />
                            (Count: {classCreated.students.length})
                        </label>
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