/*
 * This API route allows for creating, reading, updating and
 * deleting classes.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { StudentProps, studentToProps } from "./student";
import { authOptions } from './auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { isStudent } from '@/lib/util';
import { Class, Prisma, Student } from '@prisma/client';


export interface ClassProps {
    id: string,
    name: string,
    textid: string,
    students: StudentProps[]
};

type Data = {
    error?: string,
    message?: string,
    class?: ClassProps,
    classes?: ClassProps[],
} | any;

export const classToProps = (prismaClass: Class & { students: Student[] }): ClassProps => {
    return {
        id: prismaClass.id,
        name: prismaClass.name,
        textid: prismaClass.textid,
        students: prismaClass.students.map((prismaStudent) => studentToProps(prismaStudent)),
    };
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    const session = await unstable_getServerSession(req, res, authOptions)

    if (!session || !session.user || isStudent(session)) {
        res.status(403).json({ error: "Must be logged in as an instructor" });
        return;
    }

    switch (req.method) {
        case 'GET': {
            const { id, textid } = req.query as {
                id?: string,
                textid?: string,
            };
            if (!id && !textid) {
                const prismaClasses = await prisma.class.findMany({
                    where: {
                        user: {
                            email: session.user.email
                        }
                    },
                    include: {
                        students: true,
                    }
                });
                res.status(200).json({
                    classes: prismaClasses.map((prismaClass) => classToProps(prismaClass))
                });
                return;
            }

            const prismaClass = await prisma.class.findFirst({
                where: {
                    id: id,
                    textid: textid,
                    user: {
                        email: session.user.email
                    }
                },
                include: {
                    students: true,
                }
            });
            if (prismaClass) {
                res.status(200).json({
                    class: classToProps(prismaClass)
                });
                return;
            } else {
                res.status(404).json({ error: `Class with id ${id ? id : textid} not found.` });
                return;
            }
        };
        case 'POST': {
            const { name, textid, students } = req.body as ClassProps;
            if (!name || !textid || students === undefined) {
                res.status(400).json({
                    error: `Please include a 'name', 'textid' and 'students' in the request body.`
                });
                return;
            }

            const prismaStudents = [];

            for (const student of students) {
                // create a new student, if they dont exist
                let prismaStudent = await prisma.student.findFirst({
                    where: {
                        passcode: student.passcode
                    }
                });
                if (prismaStudent === null) {
                    // create a new student
                    prismaStudent = await prisma.student.create({
                        data: {
                            name: student.name,
                            passcode: student.passcode,
                            email: student.email,
                        }
                    });
                } else if (prismaStudent.name !== student.name
                    || prismaStudent.email !== student.email) {
                    res.status(400).json({
                        error: `Student ${student.name} (passcode: ${student.passcode}) conflicts with existing student.`
                    });
                    return;
                }
                prismaStudents.push(prismaStudent);
            }

            const prismaClass = await prisma.class.findFirst({
                where: {
                    textid: textid,
                    user: {
                        email: session.user.email
                    }
                },
                include: {
                    students: true,
                }
            });

            if (prismaClass !== null) {
                res.status(400).json({
                    error: `Class ${textid} already exists.`
                });
                return;
            }

            const result = await prisma.class.create({
                data: {
                    user: {
                        connect: {
                            email: session.user.email ?? undefined
                        }
                    },
                    name,
                    textid,
                    students: {
                        connect: prismaStudents.map((s) => {
                            return {
                                passcode: s.passcode
                            };
                        })
                    }
                },
                include: {
                    students: true,
                }
            });

            res.status(200).json({ class: classToProps(result) });
            return;
        };
        case 'PUT': {
            const { id, textid, update, add, remove } = req.body as {
                id?: string,
                textid?: string,
                update?: {
                    name?: string,
                },
                add?: {
                    uid?: string,
                    students?: StudentProps[],
                },
                remove?: {
                    uid?: string,
                    students?: StudentProps[],
                }
            };

            if (!id && !textid) {
                res.status(400).json({
                    error: "Please include an 'id' or 'textid' parameter in the request body"
                });
                return;
            }

            if (update) {
            }

            if (add) {

            }

            if (remove) {

            }
            res.status(500).json({ error: "Unimplemented." });
            return;
        };
        case 'DELETE': {
            const { id, textid } = req.query as {
                id?: string,
                textid?: string,
            };
            if (!id && !textid) {
                res.status(400).json({
                    error: "Please include an 'id' or 'textid' parameter in the request body"
                });
                return;
            }

            const prismaClass = await prisma.class.findFirst({
                where: {
                    id,
                    textid,
                    user: {
                        email: session.user.email,
                    }
                }
            });

            if (prismaClass) {
                await prisma.class.delete({
                    where: {
                        id: prismaClass.id,
                    }
                });
                res.status(200).json({
                    message: `Deleted class ${prismaClass.textid}`
                });
            } else {
                res.status(404).json({ error: `Class with id ${id ? id : textid} not found.` });
                return;
            }
        }; break;
    }

    res.status(405).json({ error: `Invalid method ${req.method}` });
}