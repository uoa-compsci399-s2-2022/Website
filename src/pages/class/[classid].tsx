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
import { Group, Student, User, Class as PrismaClass, QuizAssignment, QuizQuestion, Quiz } from '@prisma/client';
import ClassCardContainer from '@/components/class/class_card_container';
import MainClassCard from '@/components/class/main_class_card';
import StatsCard from '@/components/class/stats_card';
import ClassCard from '@/components/class_card';
import StudentsCard from '@/components/class/students_card';
import GroupsCard from '@/components/class/groups_card';
import AssignmentsCard, { GetClassAssignmentsQuery } from '@/components/class/assignments_card';


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
    const { data, refetch } = useQuery(GetClassQuery, {
        variables: { textid }
    })

    const _class = data.class as PrismaClass & {
        students: Student[],
        groups: (Group & {
            students: Student[],
        })[],
        users: User[],
    } | null;

    const { data: assignmentData, loading: assignmentDataLoading, refetch: quizRefetch } = useQuery(GetClassAssignmentsQuery, {
        variables: {
            classId: _class.id,
        }
    });

    const assignments = (assignmentData?.classAssignments ?? []) as (QuizAssignment & {
        student?: Student,
        group?: Group,
        quiz: Quiz,
    })[];

    const doRefetch = () => {
        refetch();
        quizRefetch();
    }

    return (
        <div className="">
            <ClassCardContainer cols="md:grid-cols-2">

                <MainClassCard _class={_class} doRefetch={doRefetch} />
                <StatsCard classId={_class.id} />

            </ClassCardContainer>
            <ClassCardContainer cols="md:grid-cols-2 lg:grid-cols-3">

                <StudentsCard students={_class.students} id={_class.id} doRefetch={doRefetch} />
                <GroupsCard _class={_class} doRefetch={doRefetch} />
                <AssignmentsCard assignments={assignments} loading={assignmentDataLoading} doRefetch={doRefetch} />

            </ClassCardContainer>
        </div>
    );
}

export default Class