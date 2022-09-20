/**
 * The 'Class' route allows instructors to modify their classes.  This includes
 * adding new students, modifying the existing students, and create groups of
 * students.  We also want to assign quizzes from this page
 **/
import { isStudent } from '@/lib/util';
import type { GetServerSideProps, NextPage } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { Class, Student, User } from '@prisma/client';
import ImportStudents from '@/components/student_import';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { ClassUpdate } from '../api/class';
import prisma from '@/lib/prisma';

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);
    const { classid } = context.query

    let textid = '';
    if (typeof classid === 'string') textid = classid;

    if (session?.user && !isStudent(session)) {
        const _class = await prisma.class.findFirst({
            where: {
                users: {
                    some: {
                        email: session.user.email,
                    }
                },
                textid,
            },
            include: {
                students: true,
                users: true,
            }
        });

        return {
            props: { _class },
        }
    } else {
        console.log('no session');
        return { props: {} }
    }
};

interface IndexProps {
    _class?: (Class & {
        students: Student[],
        users: User[],
    })
}


const Class: NextPage<IndexProps> = ({ _class }) => {
    const router = useRouter();
    const [error, setError] = useState('');

    const updateClass = (props: ClassUpdate): void => {
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

    return (
        <div className="p-4">
            {_class && <>
                <p className="text-white text-xl">Class:
                    <a onClick={() => changeName()} className="pl-2 cursor-pointer">{_class.name}</a>
                </p>
                <ul>
                    {_class.students.map((student) => (
                        <li className="text-white" key={student.passcode}>
                            {student.name} ({student.passcode})
                            <a onClick={() => removeStudent(student)} className="pl-2 cursor-pointer">remove</a>
                        </li>
                    ))}
                </ul>
                <ImportStudents onImport={onImport} />
                <p>{error}</p>
            </>}
        </div>
    );
}

export default Class