/**
 * The 'Instructor' page should show instructors their classes, and allow
 * them to create new classes
 **/
import React, { useState } from 'react';
import { Session } from 'next-auth';
import { ClassCreator } from '@/components/class/class_creator';
import Card, { CardContainer } from '@/components/card';
import ClassCard from '@/components/class_card';
import { gql } from 'apollo-server-micro';
import { useQuery } from '@apollo/client';
import { Class, Group, Student, User } from '@prisma/client';

export const GetClassesQuery = gql`
    query {
        classes {
            id
            textid
            name
            students {
                id
                name
                email
                passcode
            }
            users {
                id
                name
                email
            }
            groups {
                id
                name
                anonymous
                passcode
            }
        }
    }
`;

const Instructor: React.FC = () => {
    const [classCreatorOpen, setClassCreatorOpen] = useState(false);
    const { loading, error, data, refetch } = useQuery(GetClassesQuery);

    if (loading) {
        return <main>
            <h1 className="text-white text-3xl p-6">
                loading...
            </h1>
        </main>
    }

    if (error) {
        return <main>
            <h1 className="text-white text-3xl p-6">
                error {JSON.stringify(error)}
            </h1>
        </main>
    }

    const classes = data.classes as Class & {
        students: Student[],
        groups: Group[],
        users: User[],
    }[];

    return (
        <>
            <main>
                <h1 className="text-white text-3xl p-6">
                    your classes
                </h1>
                <CardContainer>
                    {
                        classes.map((data: any) => {
                            return (
                                <ClassCard _class={data} key={data.textid}></ClassCard>
                            );
                        })
                    }
                    <Card onClick={() => setClassCreatorOpen(true)}>
                        <h1 className="mt-4 text-xl font-bold text-text-colour w-full text-center">create new class</h1>
                    </Card>
                </CardContainer>

                <ClassCreator
                    isOpen={classCreatorOpen}
                    setIsOpen={setClassCreatorOpen}
                    doRefetch={() => refetch()}
                />
            </main>
        </>
    )
}

export default Instructor;