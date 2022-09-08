/*
 * This API route allows for creating, reading, updating and
 * deleting classes.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import prisma, { classToProps } from '@/lib/prisma';
import { isStudent } from '@/lib/util';
import { Student } from '@prisma/client';

export interface ClassUpdate {
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

type Data = {
    error?: string,
    message?: string,
    class?: ClassProps,
    classes?: ClassProps[],
} | any;

const findOrCreateStudent = async (student: StudentProps): Promise<Student> => {
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
        || prismaStudent.passcode !== student.passcode
        || (prismaStudent.email ?? undefined) !== student.email) {
        throw new Error(`Student ${student.name} (passcode: ${student.passcode}) conflicts with existing student.`);
    }
    return prismaStudent;
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
                        users: {
                            some: {
                                id: session.user.uid
                            }
                        }
                    },
                    include: {
                        students: true,
                        users: true,
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
                    users: {
                        some: {
                            id: session.user.uid
                        }
                    }
                },
                include: {
                    students: true,
                    users: true,
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

            const prismaClass = await prisma.class.findFirst({
                where: {
                    textid: textid,
                    users: {
                        some: {
                            id: session.user.uid
                        }
                    }
                },
            });

            if (prismaClass !== null) {
                res.status(400).json({
                    error: `Class ${textid} already exists.`
                });
                return;
            }

            try {
                const prismaStudents = await Promise.all(students.map(student => findOrCreateStudent(student)));

                const result = await prisma.class.create({
                    data: {
                        users: {
                            connect: {
                                id: session.user.uid
                            }
                        },
                        name,
                        textid,
                        students: {
                            connect: prismaStudents.map((s) => {
                                return {
                                    id: s.id
                                };
                            })
                        }
                    },
                    include: {
                        students: true,
                        users: true,
                    }
                });

                res.status(200).json({ class: classToProps(result) });
            } catch (error) {
                res.status(400).json({
                    error
                });
            }
            return;
        };
        case 'PUT': {
            const { id, textid, update, add, remove } = req.body as ClassUpdate;

            if (!id && !textid) {
                res.status(400).json({
                    error: "Please include an 'id' or 'textid' parameter in the request body"
                });
                return;
            }

            const prismaClass = await prisma.class.findFirst({
                where: {
                    users: {
                        some: {
                            id: session.user.uid,
                        }
                    },
                    id,
                    textid,
                }
            });
            if (!prismaClass) {
                res.status(400).json({
                    error: `Could not find class ${id ? id : textid}`
                });
                return;
            }
            const classId = prismaClass.id;


            const newData: any = {};

            if (update) {
                if (update.name)
                    newData.name = update.name;
            }

            if (add) {
                if (add.uid) {
                    newData.users = {
                        connect: {
                            id: add.uid,
                        }
                    }
                }
                if (add.students) {
                    try {
                        const prismaStudents = await Promise.all(add.students.map(student => findOrCreateStudent(student)));
                        newData.students = {
                            connect: prismaStudents.map(student => { return { id: student.id } })
                        };
                    } catch (error) {
                        res.status(400).json({
                            error
                        });
                        return;
                    }
                }
            }

            if (remove) {
                if (remove.uid) {
                    newData.users = {
                        ...newData.users,
                        delete: {
                            id: remove.uid
                        }
                    }
                }
                if (remove.students) {
                    newData.students = {
                        ...newData.users,
                        deleteMany: remove.students.map(student => {
                            return { passcode: student.passcode };
                        })
                    }
                }
            }

            const updatedClass = await prisma.class.update({
                where: {
                    id: classId,
                },
                data: {
                    ...newData,
                },
                include: {
                    users: true,
                    students: true,
                }
            });


            res.status(200).json({ class: classToProps(updatedClass) });
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
                    users: {
                        some: {
                            id: session.user.uid,
                        }
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
                return;
            } else {
                res.status(404).json({ error: `Class with id ${id ? id : textid} not found.` });
                return;
            }
        };
    }

    res.status(405).json({ error: `Invalid method ${req.method}` });
}