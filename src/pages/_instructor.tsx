/**
 * The 'Instructor' page should show instructors their classes, and allow
 * them to create new classes
 **/
import React, { useState } from 'react';
import { Session } from 'next-auth';
import { Class, Student } from '@prisma/client';
import { ClassCreator } from '@/components/classcreator';
import { CardContainer } from '@/components/card';
import ClassCard from '@/components/class_card';

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
                <CardContainer>
                    {
                        classes.map((data) => {
                            return (
                                <ClassCard _class={data} ></ClassCard>
                                );
                        })
                    }
                </CardContainer>

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