/**
 * The 'Instructor' page should show instructors their classes, and allow
 * them to create new classes
 **/
import React, { useState } from 'react';
import { Session } from 'next-auth';
import { Class, Student } from '@prisma/client';
import { ClassCreator } from '@/components/class_creator';
import Card, { CardContainer } from '@/components/card';
import ClassCard from '@/components/class_card';
import Button from '@/components/button';

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
                                <ClassCard _class={data} key={data.textid}></ClassCard>
                            );
                        })
                    }
                    <Card onClick={() => setClassCreatorOpen(true)}>
                        <h1 className="mt-4 text-xl font-bold text-text-colour">create new class</h1>
                    </Card>
                </CardContainer>

                <ClassCreator
                    isOpen={classCreatorOpen}
                    setIsOpen={setClassCreatorOpen}
                />
            </main>
        </>
    )
}

export default Instructor;