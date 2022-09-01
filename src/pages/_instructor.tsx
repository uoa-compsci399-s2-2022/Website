/**
 * The 'Instructor' page should show instructors their classes, and allow
 * them to create new classes
 **/
import React, { useState } from 'react';
import { Session } from 'next-auth';
import { Class, Student } from '@prisma/client';
import { ClassCreator } from '@/components/classcreator';

interface InstructorProps {
    session: Session,
    classes?: (Class & {
        students: Student[]
    })[]
}

const Instructor: React.FC<InstructorProps> = ({ classes, session }) => {
    // TODO: replace with data from DB
    const [classCreatorOpen, setClassCreatorOpen] = useState(false);
    if (classes === undefined) {
        return <>
            <main>you are not logged in</main>
        </>
    }

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
                />
            </main>
        </>
    )
}

export default Instructor;