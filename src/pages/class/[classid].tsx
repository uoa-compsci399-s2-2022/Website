/**
 * The 'Class' route allows instructors to modify their classes.  This includes
 * adding new students, modifying the existing students, and create groups of
 * students.  We also want to assign quizzes from this page
 **/
import type { GetServerSideProps, NextPage } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { gql, useQuery } from '@apollo/client';
import { useState } from 'react';
import { isStudent } from '@/lib/util';
import { addApolloState, initializeApollo } from '@/lib/apollo';
import { Group, Student, User, Class as PrismaClass } from '@prisma/client';
import ClassCardContainer from '@/components/class/class_card_container';
import MainClassCard from '@/components/class/main_class_card';
import StatsCard from '@/components/class/stats_card';
import ClassCard from '@/components/class_card';
import StudentsCard from '@/components/class/students_card';
import GroupsCard from '@/components/class/groups_card';
import QuizListCard from '@/components/class/quiz_list_card';


const GetClassQuery = gql`
    query($textid: String!) {
        class(textid: $textid) {
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
                students {
                    id
                    name
                    email
                    passcode
                }
            }
        }
    }
`;


export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);
    const { classid } = context.query

    let textid = '';
    if (typeof classid === 'string') textid = classid;

    if (session?.user && !isStudent(session)) {
        const apolloClient = initializeApollo(context.req.cookies);

        const result = await apolloClient.query({
            query: GetClassQuery,
            variables: {
                textid
            }
        });

        if (result.data.class === null) {
            return {
                props: {},
                redirect: {
                    permanent: false,
                    destination: '/',
                }
            };
        }

        return addApolloState(apolloClient, {
            props: {
                textid
            },
        });
    } else {
        return {
            props: {},
            redirect: {
                permanent: false,
                destination: '/',
            }
        };
    }
};


const Class: NextPage<{ textid: string }> = ({ textid }) => {
    const { loading, error, data, refetch } = useQuery(GetClassQuery, {
        variables: { textid }
    })

    const _class = data.class as PrismaClass & {
        students: Student[],
        groups: (Group & {
            students: Student[],
        })[],
        users: User[],
    } | null;

    /*
    const updateClass = (props: any): void => {
        fetch('/api/class', {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...props,
                textid: _class?.textid,
            })
        }).then((result) => {
            result.json().then((res) => {
                if ('error' in res) {
                    setError(res['error']);
                } else {
                    router.reload();
                }
            }).catch((e) => {
                console.error(e);
            });
        }).catch((e) => {
            console.error(e);
        });
    }

    const onImport = (students: ImportedStudent[]): void => {
        updateClass({
            add: {
                students,
            }
        });
    }

    const removeStudent = (student: Student) => {
        updateClass({
            remove: {
                students: [{ ...student, email: student.email ?? undefined }],
            }
        });
    }

    const changeName = () => {
        const name = prompt('Enter a new name') ?? undefined;

        updateClass({
            update: {
                name
            }
        });
    };


    Old student list
    <div className="p-4">
            {_class && <>
                <p className="text-white text-xl">Class:
                    <a onClick={() => { }} className="pl-2 cursor-pointer">{_class.name}</a>
                </p>
                <ul>
                    {_class.students.map((student) => (
                        <li className="text-white" key={student.passcode}>
                            {student.name} ({student.passcode})
                            <a onClick={() => { }} className="pl-2 cursor-pointer">remove</a>
                        </li>
                    ))}
                </ul>
                <ImportStudents onImport={() => { }} />
                <p>{error && error.message}</p>
            </>}
        </div >

    */

    return (
        <div className="">
            <ClassCardContainer cols="md:grid-cols-2">

                <MainClassCard _class={_class} doRefetch={() => refetch()} />
                <StatsCard />

            </ClassCardContainer>
            <ClassCardContainer cols="md:grid-cols-2 lg:grid-cols-3">

                <StudentsCard students={_class.students} id={_class.id} doRefetch={() => refetch()} />
                <GroupsCard _class={_class} doRefetch={() => refetch()} />
                <QuizListCard />

            </ClassCardContainer>
        </div>
    );
}

export default Class