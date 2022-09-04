/**
 * The 'Class' route allows instructors to modify their classes.  This includes
 * adding new students, modifying the existing students, and create groups of
 * students.  We also want to assign quizzes from this page
 **/
import { isStudent } from '@/lib/util';
import type { GetServerSideProps, NextPage } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { Class, Student } from '@prisma/client';

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
        students: Student[]
    })
}


const Class: NextPage<IndexProps> = ({ _class }) => {
    return (
        <div className="p-4">
            {_class && <>
                <p className="text-white text-xl">Class: {_class.name}</p>
                <ul>
                    {_class.students.map((student) => (
                        <li className="text-white" key={student.passcode}>{student.name} ({student.passcode})</li>
                    ))}
                </ul>
            </>}
        </div>
    );
}

export default Class